import {
  AnyRecord,
  EntityRecord,
  IO,
  isDefined,
  Q,
  Query,
  QueryFilter,
  RAnyRecord,
} from "@baqhub/sdk";
import {Hono} from "hono";
import {findBlobLink} from "./helpers/recordHelpers.js";
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

export interface RecordBuilder {
  id: string;
  createdAt: Date;
  versionCreatedAt: Date;
  type: RAnyRecord;
  build: () => Promise<AnyRecord | undefined>;
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
  // onEntityRequest: EntityRequestHandler;
  onRecordsRequest: RecordsRequestHandler;
  // onEntityRecordRequest?: EntityRequestHandler;
  // onRecordRequest?: RecordRequestHandler;

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
  // const {domain, basePath, pod, isDev} = config;
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
      AnyRecord,
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
      AnyRecord,
      pod.id,
      authorPodId,
      recordId,
      versionHash
    );

    return existingRecordVersion;
  }

  async function resolveRecordFromBuilder(pod: Pod, builder: RecordBuilder) {
    if (builder.createdAt.getTime() !== builder.versionCreatedAt.getTime()) {
      throw new Error("Note updates not yet supported.");
    }

    const existingRecord = await kvCachedRecords.get(
      AnyRecord,
      pod.id,
      pod.id,
      builder.id
    );
    if (existingRecord) {
      return existingRecord;
    }

    const newRecord = await builder.build();
    if (!newRecord) {
      return undefined;
    }

    const newCachedRecord = CachedRecord.ofNewRecord(
      pod.id,
      pod.id,
      builder.type,
      newRecord
    );
    await kvCachedRecords.set(builder.type, newCachedRecord);

    return newCachedRecord;
  }

  //
  // Routes.
  //

  type RecordRoutesEnv = {
    Variables: {
      record: CachedRecord<AnyRecord>;
    };
  };

  // Record + Record version routes.
  const recordCommonRoutes = new Hono<RecordRoutesEnv>();

  recordCommonRoutes.get("/", async c => {
    const {record} = c.var;
    const rawRecord = IO.encode(AnyRecord, record.record);
    const response = {
      record: rawRecord,
      linked_records: [],
    };

    return c.json(response);
  });

  recordCommonRoutes.get("/blobs/:blobHash/:fileName", async c => {
    const {record} = c.var;
    const {blobHash, fileName} = c.req.param();

    // Find a matching blob in the record.
    const blobLink = findBlobLink(record.record, blobHash, fileName);
    if (!blobLink) {
      return c.notFound();
    }
    console.log({blobLink});

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
        records: [IO.encode(AnyRecord, record.record)],
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
    const records = await Promise.all(
      builders.map(builder => resolveRecordFromBuilder(pod, builder))
    );

    // TODO: Directly encode the response instead.
    const rawRecords = records
      .filter(isDefined)
      .map(r => IO.encode(AnyRecord, r.record));

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
