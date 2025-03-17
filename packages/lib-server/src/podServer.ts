import {
  AnyBlobLink,
  AnyRecord,
  BlobFoundLink,
  EntityFoundLink,
  EntityRecord,
  FoundLinkType,
  isDefined,
  JSONPointer,
  Q,
  Query,
  QueryFilter,
  RAnyRecord,
  RecordFoundLink,
  TagFoundLink,
  unreachable,
  VersionFoundLink,
} from "@baqhub/sdk";
import {Hono} from "hono";
import {CachedLink, CachedLinkType} from "./model/cachedLink.js";
import {CachedRecord} from "./model/cachedRecord.js";
import {Pod} from "./model/pod.js";
import {BlobStoreAdapter} from "./services/blob/blobStoreAdapter.js";
import {KvCachedBlobs} from "./services/kv/kvCachedBlobs.js";
import {KvCachedRecords} from "./services/kv/kvCachedRecords.js";
import {KvStoreAdapter} from "./services/kv/kvStoreAdapter.js";
import {PodIdStore} from "./services/kv/podIdStore.js";

//
// Types.
//

export type RecordBuilderResultBasicLink = TagFoundLink | BlobFoundLink;

export type RecordBuilderResultRecordLink = (
  | EntityFoundLink
  | RecordFoundLink
  | VersionFoundLink
) &
  RecordBuilder;

export type RecordBuilderResultLink =
  | RecordBuilderResultBasicLink
  | RecordBuilderResultRecordLink;

export interface RecordBuilderResult {
  record: AnyRecord;
  links: ReadonlyArray<RecordBuilderResultLink>;
}

export interface RecordBuilder {
  podId: string;
  recordId: string;
  versionHash?: string;
  recordType: RAnyRecord;
  build: () => Promise<RecordBuilderResult | undefined>;
}

export type RecordFromBuilder = (builder: RecordBuilder) => Promise<AnyRecord>;

export interface RecordsRequestContext {
  pod: Pod;
  query: Query<AnyRecord>;
}

export interface RecordsRequestResult {
  builders: ReadonlyArray<RecordBuilder>;
}

export type RecordsRequestHandler = (
  context: RecordsRequestContext
) => Promise<RecordsRequestResult>;

export interface ServerConfig {
  basePath?: string;
  pod: Pod;

  // Handlers.
  onRecordsRequest: RecordsRequestHandler;

  // Adapters.
  podIdStore: PodIdStore;
  blobStoreAdapter: BlobStoreAdapter;
  podKvStoreAdapter: KvStoreAdapter;
  globalKvStoreAdapter: KvStoreAdapter;
}

//
// API.
//

function buildPodServer(config: ServerConfig) {
  const {pod, basePath} = config;
  const {onRecordsRequest} = config;
  const {podIdStore, blobStoreAdapter} = config;
  const {podKvStoreAdapter, globalKvStoreAdapter} = config;

  const kvCachedBlobs = KvCachedBlobs.new(globalKvStoreAdapter);
  const kvCachedRecords = KvCachedRecords.new(podKvStoreAdapter);

  //
  // Blobs.
  //

  async function resolveBlobFromHash(hash: string) {
    return await kvCachedBlobs.get(hash);
  }

  //
  // Records.
  //

  async function resolveRecord(
    pod: Pod,
    authorEntity: string,
    recordId: string
  ) {
    const authorPodId = await podIdStore.get(authorEntity);
    if (!authorPodId) {
      return undefined;
    }

    // Find existing record.
    const existingRecord = await kvCachedRecords.get(
      pod.id,
      authorPodId,
      recordId
    );

    return existingRecord;
  }

  async function resolveRecordVersion(
    pod: Pod,
    authorEntity: string,
    recordId: string,
    versionHash: string
  ) {
    const authorPodId = await podIdStore.get(authorEntity);
    if (!authorPodId) {
      return undefined;
    }

    const existingRecordVersion = await kvCachedRecords.getVersion(
      pod.id,
      authorPodId,
      recordId,
      versionHash
    );

    return existingRecordVersion;
  }

  async function resolveRecordFromBuilder(
    builder: RecordBuilder
  ): Promise<CachedRecord | undefined> {
    const existingRecord = await (builder.versionHash
      ? kvCachedRecords.getVersion(
          pod.id,
          builder.podId,
          builder.recordId,
          builder.versionHash
        )
      : kvCachedRecords.get(pod.id, builder.podId, builder.recordId));

    if (existingRecord) {
      return existingRecord;
    }

    const result = await builder.build();
    if (!result) {
      return undefined;
    }

    const linksPromises = result.links.map(
      async (link): Promise<CachedLink | undefined> => {
        const linkWithRecordToCachedLink = async (
          l: RecordBuilderResultRecordLink
        ): Promise<CachedLink | undefined> => {
          const record = await resolveRecordFromBuilder(l);
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
                recordId: record.id,
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
      }
    );
    const links = (await Promise.all(linksPromises)).filter(isDefined);

    const newCachedRecord = (() => {
      const versionHash = result.record.version?.hash;
      if (versionHash && builder.podId !== pod.id) {
        return CachedRecord.ofExistingRecord(
          builder.recordType,
          pod.id,
          builder.podId,
          result.record,
          links
        );
      }

      if (builder.podId === pod.id) {
        return CachedRecord.ofNewRecord(
          builder.recordType,
          pod,
          result.record,
          links
        );
      }

      throw new Error(`Record is not valid: ${builder}`);
    })();

    await kvCachedRecords.set(newCachedRecord);
    return newCachedRecord;
  }

  //
  // Routes.
  //

  type RecordRoutesEnv = {
    Variables: {
      record: CachedRecord;
    };
  };

  // Record + Record version routes.
  const recordCommonRoutes = new Hono<RecordRoutesEnv>();

  recordCommonRoutes.get("/", async c => {
    const {record} = c.var;
    const response = {
      record: record.record,
      linked_records: [],
    };

    return c.json(response);
  });

  recordCommonRoutes.get("/blobs/:blobHash/:fileName", async c => {
    const {record} = c.var;
    const {blobHash, fileName} = c.req.param();

    // Find a matching blob in the record.
    const blobLink = record.links
      .map(l => {
        if (l.type !== CachedLinkType.BLOB || l.blobHash !== blobHash) {
          return undefined;
        }

        const blobLink = JSONPointer.find(
          AnyBlobLink.io(),
          record.record,
          l.pointer
        );
        if (!blobLink || blobLink.name !== fileName) {
          return undefined;
        }

        return blobLink;
      })
      .find(isDefined);

    if (!blobLink) {
      return c.notFound();
    }

    // Find the blob.
    const blob = await resolveBlobFromHash(blobHash);
    if (!blob) {
      return c.notFound();
    }

    // Serve the blob.
    const blobObject = await blobStoreAdapter.get(blob.id);
    if (!blobObject) {
      throw new Error("Blob object not found.");
    }

    const name = blobLink.name.replaceAll('"', "");

    return c.body(blobObject.body, 200, {
      "Content-Type": blobLink.type,
      "Content-Disposition": `attachment; filename="${name}"`,
      "Content-Length": blobObject.size.toString(),
      "Cache-Control": "public, max-age=31536000, immutable",
    });
  });

  // Record version.
  const recordVersionRoutes = new Hono<RecordRoutesEnv>()
    .basePath("/records/:authorEntity/:recordId/versions/:versionHash")
    .use("*", async (c, next) => {
      const {authorEntity, recordId, versionHash} = c.req.param();
      const recordVersion = await resolveRecordVersion(
        pod,
        authorEntity,
        recordId,
        versionHash
      );
      if (!recordVersion) {
        return c.notFound();
      }

      c.set("record", recordVersion);
      return next();
    })
    .route("/", recordCommonRoutes);

  // Record.
  const recordRoutes = new Hono<RecordRoutesEnv>()
    .basePath("/records/:authorEntity/:recordId")
    .use("*", async (c, next) => {
      const {authorEntity, recordId} = c.req.param();
      const record = await resolveRecord(pod, authorEntity, recordId);
      if (!record) {
        return c.notFound();
      }

      c.set("record", record);
      return next();
    })
    .route("/", recordCommonRoutes);

  // Pod.
  const routes = new Hono().basePath(basePath || "/");

  // Record query.
  routes.get("/records", async c => {
    const query = Query.ofQueryParams(c.req.queries());

    // Serve entity record queries directly.
    const entityRecordFilter = Q.and(
      Q.type(EntityRecord),
      Q.author(pod.entity)
    );

    const entityRecordResponse = await (async () => {
      if (
        !query.filter ||
        !QueryFilter.isSuperset(query.filter, entityRecordFilter) ||
        !QueryFilter.isSuperset(entityRecordFilter, query.filter)
      ) {
        return undefined;
      }

      const record = await resolveRecord(pod, pod.entity, pod.id);
      if (!record) {
        return undefined;
      }

      const response = {
        page_size: query.pageSize,
        records: [record.record],
        linked_records: [],
      };

      return c.json(response);
    })();

    if (entityRecordResponse) {
      return entityRecordResponse;
    }

    // Otherwise, delegate to the calling code.
    const context: RecordsRequestContext = {pod, query};
    const {builders} = await onRecordsRequest(context);
    const records = await Promise.all(builders.map(resolveRecordFromBuilder));

    // TODO: Directly encode the response instead.
    const rawRecords = records.filter(isDefined).map(r => r.record);

    const response = {
      page_size: query.pageSize,
      records: rawRecords,
      linked_records: [],
    };

    return c.json(response);
  });

  routes.route("/", recordVersionRoutes);
  routes.route("/", recordRoutes);

  //
  // API.
  //

  const fetch = async (request: Request) => {
    return await routes.fetch(request);
  };

  return {
    fetch,
  };
}

export interface PodServer extends ReturnType<typeof buildPodServer> {}

export const PodServer = {
  new: buildPodServer,
};
