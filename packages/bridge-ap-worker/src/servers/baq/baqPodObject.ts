import {
  AnyRecord,
  Client,
  EntityRecord,
  FoundLinkType,
  Hash,
  Headers,
  isDefined,
  never,
  Q,
  Query,
  Record,
  Constants as SDKConstants,
  SignAlgorithm,
  Signature,
} from "@baqhub/sdk";
import {
  BlobBuilder,
  KvKey,
  KvTypedStoreAdapter,
  Pod,
  PodIdStore,
  PodServer,
  RecordBuilder,
  RecordBuilderResult,
  RecordBuilderResultLink,
  RecordsRequestHandler,
  Resolver,
  StreamDigester,
} from "@baqhub/server";
import {
  Create,
  isActor,
  lookupObject,
  Note,
  traverseCollection,
} from "@fedify/fedify";
import {DurableObject} from "cloudflare:workers";
import {stripHtml} from "string-strip-html";
import {PostRecord} from "../../baq/postRecord.js";
import {Constants} from "../../helpers/constants.js";
import {noteToPostRecord} from "../../helpers/convert.js";
import {patchedDocumentLoader} from "../../helpers/fedify.js";
import {ActorIdentity} from "../../model/actorIdentity.js";
import {CloudflareBlob} from "../../services/blob/cloudflareBlob.js";
import {
  avatarToBlobRequest,
  FetchImageEnv,
} from "../../services/blobFetcher.js";
import {CloudflareDurableKv} from "../../services/kv/cloudflareDurableKv.js";
import {CloudflareKv} from "../../services/kv/cloudflareKv.js";
import {BaqActor} from "./baqActor.js";
import {PodMappingObjectStore} from "./baqPodMappingObject.js";

//
// Helpers.
//

const podKey: KvKey<Pod> = ["pod"];

function recordUrl(podId: string, authorEntity: string, recordId: string) {
  return `https://${Constants.domain}${Constants.baqRoutePrefix}/${podId}/records/${authorEntity}/${recordId}`;
}

//
// Durable object.
//

const digestStream: StreamDigester = input => {
  // Split the stream.
  // In workers, the implementation is non-standard and follows the slower stream.
  const [stream1, stream2] = input.tee();

  const digester = new crypto.DigestStream("SHA-256");
  stream2.pipeTo(digester);

  // Convert the digest result to a string.
  const hash = digester.digest.then(hashBuffer => {
    return Hash.bytesToHex(new Uint8Array(hashBuffer));
  });

  return {
    output: stream1,
    hash,
  };
};

export class BaqPodObject extends DurableObject {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);

    const fetchImageEnv: FetchImageEnv = {
      DEV_IMAGES_AUTH_KEY: env.DEV_IMAGES_AUTH_KEY,
    };

    const podIdStoreBase = PodMappingObjectStore.new(
      env.BAQ_POD_MAPPING_OBJECT
    );
    const podIdStore: PodIdStore = {
      async get(entity) {
        const podId = await podIdStoreBase.get(entity);
        if (podId) {
          return podId;
        }

        // TODO: Find better system for external pods.
        return Hash.shortHash(entity);
      },
    };

    const blobStoreAdapter = CloudflareBlob.new(env.R2_WORKER_BRIDGE_AP_BAQ);
    const podKvStoreAdapter = CloudflareDurableKv.ofStorage(ctx.storage);
    const globalKvStoreAdapter = CloudflareKv.ofNamespace(
      env.KV_WORKER_BRIDGE_AP,
      ["baq_server"]
    );

    const resolver = Resolver.new({
      digestStream,
      blobStoreAdapter,
      podKvStoreAdapter,
      globalKvStoreAdapter,
    });

    this.fetchImageEnv = fetchImageEnv;
    this.resolver = resolver;
    this.storage = CloudflareDurableKv.ofStorageTyped(ctx.storage);
    this.podMappings = PodMappingObjectStore.new(env.BAQ_POD_MAPPING_OBJECT);

    this.setPod = pod => {
      this.pod = pod;

      const onRecordsRequest: RecordsRequestHandler = async c => {
        const {pod, query} = c;

        // Only serve post record queries.
        const postRecordQuery = Query.new({
          filter: Q.and(Q.type(PostRecord), Q.author(pod.entity)),
        });

        if (!Query.isSuperset(query, postRecordQuery)) {
          return {builders: []};
        }

        const baqActor = pod.context as BaqActor;
        const actor = await lookupObject(baqActor.id, {
          documentLoader: patchedDocumentLoader,
        });

        if (!isActor(actor)) {
          return {builders: []};
        }

        // List notes.
        const outbox = await actor.getOutbox();
        if (!outbox) {
          return {builders: []};
        }

        const pageSize = query.pageSize || 0;

        const buildersIterable =
          async function* (): AsyncIterable<RecordBuilder> {
            let itemCount = 0;
            let resultCount = 0;

            for await (const item of traverseCollection(outbox)) {
              if (resultCount === pageSize || itemCount === 100) {
                break;
              }

              itemCount++;

              if (!(item instanceof Create)) {
                continue;
              }

              const note = await item.getObject();
              if (!(note instanceof Note) || !note.id || !note.published) {
                continue;
              }

              resultCount++;

              const build = async (): Promise<
                RecordBuilderResult | undefined
              > => {
                const record = await noteToPostRecord(
                  fetchImageEnv,
                  resolver.blobFromBuilder,
                  pod.entity,
                  note
                );
                if (!record) {
                  return undefined;
                }

                const links = Record.findLinks(PostRecord, record)
                  .map((link): RecordBuilderResultLink | undefined => {
                    switch (link.type) {
                      case FoundLinkType.TAG:
                      case FoundLinkType.BLOB:
                        return link;

                      case FoundLinkType.ENTITY: {
                        if (link.value.entity !== pod.entity) {
                          throw new Error(
                            `Unexpected entity: ${link.value.entity}`
                          );
                        }

                        return {
                          ...link,
                          podId: pod.id,
                          recordId: pod.id,
                          recordType: EntityRecord,
                          build: () => never(),
                        };
                      }

                      case FoundLinkType.RECORD:
                        return {
                          ...link,
                          podId: Hash.shortHash(link.value.entity),
                          recordId: link.value.recordId,
                          recordType: AnyRecord,
                          build: async () => {
                            const client = await Client.discover(
                              link.value.entity
                            );
                            const response = await client.getRecord(
                              AnyRecord,
                              AnyRecord,
                              link.value.entity,
                              link.value.recordId
                            );

                            return {record: response.record, links: []};
                          },
                        };

                      case FoundLinkType.VERSION:
                        return {
                          ...link,
                          podId: Hash.shortHash(link.value.entity),
                          recordId: link.value.recordId,
                          recordType: AnyRecord,
                          build: async () => {
                            const client = await Client.discover(
                              link.value.entity
                            );
                            const response = await client.getRecordVersion(
                              AnyRecord,
                              AnyRecord,
                              link.value.entity,
                              link.value.recordId,
                              link.value.versionHash
                            );

                            return {record: response.record, links: []};
                          },
                        };

                      default:
                        never();
                    }
                  })
                  .filter(isDefined);

                return {record, links};
              };

              yield {
                podId: pod.id,
                recordId: Hash.shortHash(note.id.toString()),
                recordType: PostRecord,
                build,
              };
            }
          };

        // Build corresponding records.
        const builders = await Array.fromAsync(buildersIterable());
        return {builders: builders.filter(isDefined)};
      };

      this.server = PodServer.new({
        pod,
        basePath: `${Constants.baqRoutePrefix}/${pod.id}`,
        onRecordsRequest,
        podIdStore,
        blobStoreAdapter,
        podKvStoreAdapter,
        globalKvStoreAdapter,
      });
    };

    ctx.blockConcurrencyWhile(async () => {
      const pod = await this.storage.get(Pod.io, podKey);
      if (!pod) {
        return;
      }

      this.setPod(pod);
    });
  }

  private storage: KvTypedStoreAdapter;
  private podMappings: PodMappingObjectStore;
  private fetchImageEnv: FetchImageEnv;
  private resolver: Resolver;

  private setPod: (pod: Pod) => void;
  private server: PodServer | undefined;
  private pod: Pod | undefined;
  private initializePromise: Promise<void> | undefined;

  private async initializeInternal(id: string, requestEntity: string) {
    // Discover the actor.
    const identity = ActorIdentity.ofEntity(Constants.domain, requestEntity);
    if (!identity) {
      throw new Error("Identity not found.");
    }

    const identifier = ActorIdentity.toIdentifier(identity);
    const actor = await lookupObject(identifier, {
      documentLoader: patchedDocumentLoader,
    });
    if (
      !isActor(actor) ||
      !actor.id ||
      actor.preferredUsername !== identity.handle
    ) {
      throw new Error("Invalid actor.");
    }

    // Build the new pod.
    const newActor: BaqActor = {
      id: actor.id.toString(),
      server: identity.server,
      username: identity.handle,
    };

    const [publicKey, privateKey] = Signature.buildKey();
    const keyPairs = [
      {
        algorithm: SignAlgorithm.ED25519,
        publicKey,
        privateKey,
      },
    ];

    const date = new Date();
    const entity = ActorIdentity.toEntity(Constants.domain, identity);
    const newPod: Pod = {
      id,
      entity,
      keyPairs,
      context: newActor,
      createdAt: date,
      updatedAt: date,
    };

    // Save the new entity record.
    const avatar = await (async (): Promise<BlobBuilder | undefined> => {
      const icon = await actor.getIcon();
      if (!icon) {
        return undefined;
      }

      return avatarToBlobRequest(this.fetchImageEnv, icon);
    })();

    await this.resolver.saveEntityRecord(
      {
        pod: newPod,
        avatar,
        name: actor.name?.toString() || undefined,
        bio: stripHtml(actor.summary?.toString() || "").result || undefined,
        website: actor.url?.toString() || undefined,
      },
      `https://${Constants.domain}${Constants.baqRoutePrefix}/${newPod.id}`
    );

    // Save the pod.
    await this.storage.set(Pod.io, podKey, newPod);
    this.setPod(newPod);

    // Create the mapping.
    this.podMappings.initialize(entity, id);
  }

  async initialize(id: string, requestEntity: string) {
    if (this.initializePromise) {
      return this.initializePromise;
    }

    const {promise} = await this.ctx.blockConcurrencyWhile(async () => {
      if (this.initializePromise) {
        return {promise: this.initializePromise};
      }

      const promise = this.initializeInternal(id, requestEntity);
      this.initializePromise = promise;
      return {promise};
    });

    await promise;
  }

  async fetch(request: Request) {
    if (!this.pod || !this.server) {
      return new Response(null, {status: 404});
    }

    // Discovery.
    const url = new URL(request.url);
    if (url.pathname === "/") {
      const linkHeader = Headers.buildLink(
        recordUrl(this.pod.id, this.pod.entity, this.pod.id),
        SDKConstants.discoveryLinkRel
      );

      return new Response(null, {
        status: 200,
        headers: {Link: linkHeader},
      });
    }

    // Pod request.
    return this.server.fetch(request);
  }
}

//
// Store.
//

function buildPodObjectStore(namespace: DurableObjectNamespace<BaqPodObject>) {
  return {
    async initialize(id: string, entity: string) {
      const objectId = namespace.idFromName(id);
      const object = namespace.get(objectId);

      await object.initialize(id, entity);
    },
    async fetch(id: string, request: Request) {
      const objectId = namespace.idFromName(id);
      const object = namespace.get(objectId);

      return object.fetch(request);
    },
  };
}

export const PodObjectStore = {
  new: buildPodObjectStore,
};
