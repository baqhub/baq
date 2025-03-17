import {
  AnyBlobLink,
  EntityRecord,
  EntityRecordSigningKey,
  RecordPermissions,
} from "@baqhub/sdk";
import {BlobUpload} from "./model/blobUpload.js";
import {CachedBlob} from "./model/cachedBlob.js";
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
  domain: string;
  basePath?: string;
  digestStream: StreamDigester;
  blobStoreAdapter: BlobStoreAdapter;
  podKvStoreAdapter: KvStoreAdapter;
  globalKvStoreAdapter: KvStoreAdapter;
}

function buildResolver(config: ResolverConfig) {
  const {domain, basePath} = config;
  const {digestStream, blobStoreAdapter} = config;
  const {podKvStoreAdapter, globalKvStoreAdapter} = config;
  const baseUrl = `https://${domain}${basePath}`;

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

  async function saveEntityRecord(request: EntityRecordRequest) {
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
              records: `${baseUrl}/${pod.id}/records`,
              record: `${baseUrl}/${pod.id}/records/{entity}/{record_id}`,
              recordVersions: `${baseUrl}/${pod.id}/records/{entity}/{record_id}/versions`,
              recordVersion: `${baseUrl}/${pod.id}/records/{entity}/{record_id}/versions/{version_hash}`,
              newRecord: "",
              recordBlob: `${baseUrl}/${pod.id}/records/{entity}/{record_id}/blobs/{blob_hash}/{file_name}`,
              recordVersionBlob: `${baseUrl}/${pod.id}/records/{entity}/{record_id}/versions/{version_hash}/blobs/{blob_hash}/{file_name}`,
              newBlob: "",
              events: "",
              newNotification: `${baseUrl}/${pod.id}/notifications`,
              serverInfo: `${baseUrl}/${pod.id}`,
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

    const newEntityCachedRecord = CachedRecord.ofNewRecord(
      EntityRecord,
      pod,
      newEntityRecord,
      []
    );

    // And store it.
    await kvCachedRecords.set(newEntityCachedRecord);
  }

  return {
    blobFromBuilder,
    saveEntityRecord,
  };
}

export interface Resolver extends ReturnType<typeof buildResolver> {}

export const Resolver = {
  new: buildResolver,
};
