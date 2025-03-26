import {
  AnyBlobLink,
  AnyRecord,
  BlobFoundLink,
  EntityFoundLink,
  EntityRecord,
  EntityRecordSigningKey,
  FoundLink,
  FoundLinkType,
  isDefined,
  RAnyRecord,
  Record,
  RecordFoundLink,
  RecordPermissions,
  TagFoundLink,
  unreachable,
  VersionFoundLink,
} from "@baqhub/sdk";
import {BlobUpload} from "./model/blobUpload.js";
import {CachedBlob} from "./model/cachedBlob.js";
import {CachedLink, CachedLinkType} from "./model/cachedLink.js";
import {CachedRecord} from "./model/cachedRecord.js";
import {Pod} from "./model/pod.js";
import {BlobStoreAdapter} from "./services/blob/blobStoreAdapter.js";
import {KvBlobUploads} from "./services/kv/kvBlobUploads.js";
import {KvCachedBlobs} from "./services/kv/kvCachedBlobs.js";
import {KvCachedRecords} from "./services/kv/kvCachedRecords.js";
import {KvStoreAdapter} from "./services/kv/kvStoreAdapter.js";

//
// Model.
//

export interface DigestStreamResult {
  output: ReadableStream;
  hash: Promise<string>;
}

export type StreamDigester = (input: ReadableStream) => DigestStreamResult;

export interface BlobRequestBlob {
  type: string;
  stream: ReadableStream;
}

export interface BlobBuilder {
  fileName: string;
  context: unknown;
  getBlob: () => Promise<BlobRequestBlob | undefined>;
}

export type BlobFromBuilder = (
  builder: BlobBuilder
) => Promise<BlobFromBuilderResult | undefined>;

export interface BlobFromBuilderResult {
  type: string;
  link: AnyBlobLink;
}

export type BasicLinkRequestResult = TagFoundLink | BlobFoundLink;

export type RecordLinkRequestResult = (
  | EntityFoundLink
  | RecordFoundLink
  | VersionFoundLink
) &
  RecordBuilder;

export type LinkRequestResult =
  | BasicLinkRequestResult
  | RecordLinkRequestResult;

export type LinkRequestHandler = (
  pod: Pod,
  link: FoundLink
) => LinkRequestResult | undefined;

export interface RecordBuilder {
  authorId: string;
  recordId: string;
  versionHash?: string;
  recordType: RAnyRecord;
  build: () => Promise<AnyRecord | undefined>;
}

export type RecordFromBuilder = (builder: RecordBuilder) => Promise<AnyRecord>;

export interface EntityRecordRequest {
  pod: Pod;
  name: string | undefined;
  bio: string | undefined;
  website: string | undefined;
  avatar: BlobBuilder | undefined;
}

//
// API.
//

export interface ResolverConfig {
  digestStream: StreamDigester;
  onLinkRequest: LinkRequestHandler;
  blobStoreAdapter: BlobStoreAdapter;
  podKvStoreAdapter: KvStoreAdapter;
  globalKvStoreAdapter: KvStoreAdapter;
}

function buildResolver(config: ResolverConfig) {
  const {digestStream, onLinkRequest} = config;
  const {blobStoreAdapter, podKvStoreAdapter, globalKvStoreAdapter} = config;

  const kvBlobUploads = KvBlobUploads.new(globalKvStoreAdapter);
  const kvCachedBlobs = KvCachedBlobs.new(globalKvStoreAdapter);
  const kvCachedRecords = KvCachedRecords.new(podKvStoreAdapter);

  async function blobFromBuilder(
    builder: BlobBuilder
  ): Promise<BlobFromBuilderResult | undefined> {
    // Upload the stream.
    const blobUpload = BlobUpload.new();
    await kvBlobUploads.set(blobUpload);

    // We want to start the request after setting the BlobUpload
    // otherwise we might deadlock requests in envs with request limits.
    const requestBlob = await builder.getBlob();
    if (!requestBlob) {
      return undefined;
    }

    const digestedStream = digestStream(requestBlob.stream);
    const blobObject = await blobStoreAdapter.set(
      blobUpload.id,
      digestedStream.output
    );

    // If this blob already exists, use it.
    const hash = await digestedStream.hash;
    const existingBlob = await kvCachedBlobs.get(hash);
    if (existingBlob) {
      (async () => {
        await blobStoreAdapter.delete(blobUpload.id);
        await kvBlobUploads.delete(blobUpload.id);
      })();

      return {
        type: requestBlob.type,
        link: {
          hash: existingBlob.hash,
          type: requestBlob.type,
          size: existingBlob.size,
          name: builder.fileName,
        },
      };
    }

    // Otherwise, create it.
    const newBlob: CachedBlob = {
      id: blobUpload.id,
      hash,
      size: blobObject.size,
      firstFileName: builder.fileName,
      firstType: requestBlob.type,
      context: builder.context,
      createdAt: new Date(),
    };

    await kvCachedBlobs.set(newBlob);
    await kvBlobUploads.delete(blobUpload.id);

    return {
      type: requestBlob.type,
      link: {
        hash: newBlob.hash,
        type: requestBlob.type,
        size: newBlob.size,
        name: builder.fileName,
      },
    };
  }

  async function resolveRecordFromBuilder(
    pod: Pod,
    builder: RecordBuilder,
    resolutionChain: ReadonlyArray<string> = [],
    resolveCache = new Map<string, Promise<CachedRecord | undefined>>()
  ): Promise<CachedRecord | undefined> {
    const builderId = JSON.stringify({
      authorId: builder.authorId,
      recordId: builder.recordId,
      versionHash: builder.versionHash,
    });

    if (resolutionChain.includes(builderId)) {
      return undefined;
    }

    const cachedResult = resolveCache.get(builderId);
    if (cachedResult) {
      return cachedResult;
    }

    const resolve = async () => {
      const newResolutionChain = [...resolutionChain, builderId];

      const existingRecord = await (builder.versionHash
        ? kvCachedRecords.getVersion(
            pod.id,
            builder.authorId,
            builder.recordId,
            builder.versionHash
          )
        : kvCachedRecords.get(pod.id, builder.authorId, builder.recordId));

      if (existingRecord) {
        return existingRecord;
      }

      const record = await builder.build();
      if (!record) {
        return undefined;
      }

      const filterSchemasLinks = (link: FoundLink) => {
        switch (link.type) {
          case FoundLinkType.ENTITY:
          case FoundLinkType.RECORD:
          case FoundLinkType.VERSION:
            return link.value.entity !== "schemas.baq.dev";

          default:
            return true;
        }
      };

      const foundLinks = Record.findLinks(builder.recordType, record).filter(
        filterSchemasLinks
      );
      const linkResults = await Promise.all(
        foundLinks.map(l => onLinkRequest(pod, l))
      );

      const cachedLinksPromises = linkResults
        .filter(isDefined)
        .map(async (link): Promise<CachedLink | undefined> => {
          const linkWithRecordToCachedLink = async (
            l: RecordLinkRequestResult
          ): Promise<CachedLink | undefined> => {
            const record = await resolveRecordFromBuilder(
              pod,
              l,
              newResolutionChain,
              resolveCache
            );
            if (!record) {
              return undefined;
            }

            switch (l.type) {
              case FoundLinkType.ENTITY:
                return {
                  type: CachedLinkType.ENTITY,
                  path: l.path,
                  pointer: l.pointer,
                  podId: record.authorId,
                };

              case FoundLinkType.RECORD:
                return {
                  type: CachedLinkType.RECORD,
                  path: l.path,
                  pointer: l.pointer,
                  podId: record.authorId,
                  recordId: record.id,
                };

              case FoundLinkType.VERSION:
                return {
                  type: CachedLinkType.VERSION,
                  path: l.path,
                  pointer: l.pointer,
                  podId: record.authorId,
                  recordId: record.id,
                  versionHash: record.versionHash,
                };

              default:
                unreachable(l);
            }
          };

          switch (link.type) {
            case FoundLinkType.TAG:
              return {
                type: CachedLinkType.TAG,
                path: link.path,
                pointer: link.pointer,
                tag: link.value,
              };

            case FoundLinkType.BLOB:
              return {
                type: CachedLinkType.BLOB,
                path: link.path,
                pointer: link.pointer,
                blobHash: link.value.hash,
              };

            default:
              return linkWithRecordToCachedLink(link);
          }
        });
      const cachedLinks = (await Promise.all(cachedLinksPromises)).filter(
        isDefined
      );

      const newCachedRecord = (() => {
        const versionHash = record.version?.hash;
        if (versionHash && builder.authorId !== pod.id) {
          return CachedRecord.ofExistingRecord(
            builder.recordType,
            pod.id,
            builder.authorId,
            record,
            cachedLinks
          );
        }

        if (builder.authorId === pod.id) {
          return CachedRecord.ofNewRecord(
            builder.recordType,
            pod,
            record,
            cachedLinks
          );
        }

        throw new Error(`Record is not valid: ${builder}`);
      })();

      await kvCachedRecords.set(newCachedRecord);
      return newCachedRecord;
    };

    const result = resolve();
    resolveCache.set(builderId, result);
    return result;
  }

  async function saveEntityRecord(
    request: EntityRecordRequest,
    baseUrl: string
  ) {
    const {pod, avatar} = request;
    const avatarBlobLink = await (async () => {
      if (!avatar) {
        return undefined;
      }

      const result = await blobFromBuilder(avatar);
      if (!result) {
        return undefined;
      }

      return result.link;
    })();

    const newEntityRecord = EntityRecord.new(
      pod.entity,
      {
        previousEntities: [],
        signingKeys: pod.keyPairs.map(
          (kp): EntityRecordSigningKey => ({
            algorithm: kp.algorithm,
            publicKey: kp.publicKey,
          })
        ),
        servers: [
          {
            version: "1.0.0",
            preference: 0,
            endpoints: {
              auth: "",
              records: `${baseUrl}/records`,
              record: `${baseUrl}/records/{entity}/{record_id}`,
              recordVersions: `${baseUrl}/records/{entity}/{record_id}/versions`,
              recordVersion: `${baseUrl}/records/{entity}/{record_id}/versions/{version_hash}`,
              newRecord: "",
              recordBlob: `${baseUrl}/records/{entity}/{record_id}/blobs/{blob_hash}/{file_name}`,
              recordVersionBlob: `${baseUrl}/records/{entity}/{record_id}/versions/{version_hash}/blobs/{blob_hash}/{file_name}`,
              newBlob: "",
              events: "",
              newNotification: `${baseUrl}/notifications`,
              serverInfo: baseUrl,
            },
          },
        ],
        profile: {
          name: request.name,
          bio: request.bio,
          website: request.website,
          avatar: avatarBlobLink,
        },
      },
      {
        id: pod.id,
        createdAt: pod.createdAt,
        permissions: RecordPermissions.public,
      }
    );

    await resolveRecordFromBuilder(pod, {
      authorId: pod.id,
      recordId: newEntityRecord.id,
      recordType: EntityRecord,
      build: () => Promise.resolve(newEntityRecord),
    });
  }

  return {
    kvCachedBlobs,
    kvCachedRecords,
    blobFromBuilder,
    resolveRecordFromBuilder,
    saveEntityRecord,
  };
}

export interface Resolver extends ReturnType<typeof buildResolver> {}

export const Resolver = {
  new: buildResolver,
};
