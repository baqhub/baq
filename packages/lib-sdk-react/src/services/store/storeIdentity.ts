import {
  AuthenticationState,
  BlobUrlBuilder,
  Client,
  Constants,
  EntityRecord,
  Record,
  RecordMode,
  RecordPermissions,
  RecordSource,
} from "@baqhub/sdk";

//
// Model.
//

export type FindClient = (entity: string) => Client;

export interface StoreIdentity {
  isAuthenticated: boolean;
  entityRecord: EntityRecord;
  findClient: FindClient;
  blobUrlBuilder: BlobUrlBuilder;
  discover: Client["discover"];
  downloadBlob: Client["downloadBlob"];
}

//
// API.
//

function buildAuthenticatedIdentity(
  authState: AuthenticationState
): StoreIdentity {
  const client = Client.authenticated(authState);
  const findClient: FindClient = () => client;
  const blobUrlBuilder = client.blobUrlBuilderFor(authState.entityRecord);

  return {
    isAuthenticated: true,
    entityRecord: Record.toSelf(authState.entityRecord),
    findClient,
    blobUrlBuilder,
    discover: client.discover,
    downloadBlob: client.downloadBlob,
  };
}

function buildUnauthenticatedIdentity(): StoreIdentity {
  const entity = "never.baq.dev";
  const date = new Date("2024-01-01T01:01:00.000Z");

  const clients = new Map<string, Client>();
  const findClient: FindClient = e => {
    if (e === entity) {
      throw new Error("Authenticated Store required.");
    }

    const existingClient = clients.get(e);
    if (existingClient) {
      return existingClient;
    }

    const newClient = Client.ofEntity(e);
    clients.set(e, newClient);
    return newClient;
  };

  const blobUrlBuilder: BlobUrlBuilder = (record, blob, expiresInSeconds) => {
    const client = findClient(record.author.entity);
    const entityRecord = client.getEntityRecordSync();
    const builder = client.blobUrlBuilderFor(entityRecord);
    return builder(record, blob, expiresInSeconds);
  };

  const discover: Client["discover"] = (entity, signal) => {
    const client = findClient(entity);
    return client.getEntityRecord(signal);
  };

  const downloadBlob: Client["downloadBlob"] = (record, blob, signal) => {
    const client = findClient(record.author.entity);
    return client.downloadBlob(record, blob, signal);
  };

  return {
    isAuthenticated: false,
    entityRecord: {
      author: {entity},
      id: "00000000000000000000000000000000",
      source: RecordSource.SELF,
      createdAt: date,
      receivedAt: date,
      version: {
        author: {entity},
        createdAt: date,
        receivedAt: date,
        hash: "0000000000000000000000000000000000000000000000000000000000000000",
        hashSignature: undefined,
      },
      type: {
        entity: Constants.systemEntity,
        recordId: "80be958368dd414fabb9420647daa1ec",
        versionHash:
          "5869ed5eb6b565b92990ecfda31b4eb7e837489cb4799a534c00e3fd6ca756e9",
      },
      content: {
        previousEntities: [],
        signingKeys: [],
        profile: {},
        servers: [],
      },
      mode: RecordMode.SYNCED,
      permissions: RecordPermissions.public,
    },
    findClient,
    blobUrlBuilder,
    discover,
    downloadBlob,
  };
}

export const StoreIdentity = {
  new: buildAuthenticatedIdentity,
  newUnauthenticated: buildUnauthenticatedIdentity,
};
