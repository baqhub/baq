import UriTemplate from "es6-url-template";
import compact from "lodash/compact.js";
import {Constants} from "../constants.js";
import {AbortedError, Async} from "../helpers/async.js";
import {ErrorWithData} from "../helpers/customError.js";
import {findLink} from "../helpers/headers.js";
import * as IO from "../helpers/io.js";
import {Str} from "../helpers/string.js";
import {findStableTimestamp} from "../helpers/time.js";
import {HttpCredentialsHeader} from "../model/core/httpCredentialsHeader.js";
import {HttpHeaders} from "../model/core/httpHeaders.js";
import {HttpMethod} from "../model/core/httpMethod.js";
import {HttpBearerSignature} from "../model/httpSignature/httpBearerSignature.js";
import {HttpSignature} from "../model/httpSignature/httpSignature.js";
import {HttpSignatureInput} from "../model/httpSignature/httpSignatureInput.js";
import {AnyBlobLink} from "../model/links/blobLink.js";
import {AuthenticationState} from "../model/local/authenticationState.js";
import {Query, SingleQuery} from "../model/query/query.js";
import {Q} from "../model/query/queryFilter.js";
import {AppRecord} from "../model/recordTypes/appRecord.js";
import {
  EntityRecord,
  EntityRecordServerEndpoint,
} from "../model/recordTypes/entityRecord.js";
import {ServerCredentialsRecord} from "../model/recordTypes/serverCredentialsRecord.js";
import {
  AnyRecord,
  NoContentRecord,
  RAnyEventRecord,
  RAnyRecord,
  RNoContentRecord,
  Record,
} from "../model/records/record.js";
import {RBlobResponse} from "../model/response/blobResponse.js";
import {RecordResponse} from "../model/response/recordResponse.js";
import {recordsResponse} from "../model/response/recordsResponse.js";
import {Api} from "./api.js";
import {Http, HttpAuthorizationBuilder, HttpOptions} from "./http.js";

type HttpBearerBuilder = (url: string, expiresAt: number) => string;

type TSRecord<K extends keyof any, T> = {
  [P in K]: T;
};

interface BuildClientOptions {
  getEntityRecord: (signal: AbortSignal) => Promise<EntityRecord>;
  authorizationBuilder?: HttpAuthorizationBuilder;
  bearerBuilder?: HttpBearerBuilder;
}

export interface GetRecordOptions {
  query?: SingleQuery;
  signal?: AbortSignal;
}

interface PostRecordOptions {
  headers?: HttpHeaders;
}

function fixUrl(url: string) {
  if (url.includes("/events")) {
    return url.replace("https://localhost", "http://localhost:5254");
  }

  return url.replace("https://localhost", "http://localhost:5173");
}

export interface Client extends ReturnType<typeof buildClientBase> {}

export type BlobUrlBuilder = (
  record: AnyRecord,
  blob: AnyBlobLink,
  expiresInSeconds?: number
) => string;

function buildClientBase(clientOptions: BuildClientOptions) {
  const {
    getEntityRecord: ger,
    authorizationBuilder,
    bearerBuilder,
  } = clientOptions;
  const getEntityRecord = Async.sharePromise(ger);

  //
  // Template resolution.
  //

  function getEntityUrlTemplateForRecord(
    entityRecord: EntityRecord,
    endpoint: EntityRecordServerEndpoint
  ) {
    const firstServer = entityRecord.content.servers[0];
    if (!firstServer) {
      throw new Error("No server found.");
    }

    return new UriTemplate(firstServer.endpoints[endpoint]);
  }

  async function getEntityUrlTemplate(
    endpoint: EntityRecordServerEndpoint,
    signal: AbortSignal | undefined
  ) {
    const entityRecord = await getEntityRecord(signal);
    return getEntityUrlTemplateForRecord(entityRecord, endpoint);
  }

  async function expandUrlTemplate(
    endpoint: EntityRecordServerEndpoint,
    values: TSRecord<string, string>,
    signal: AbortSignal | undefined
  ) {
    const urlTemplate = await getEntityUrlTemplate(endpoint, signal);
    return fixUrl(urlTemplate.expand(values));
  }

  //
  // Records.
  //

  async function getRecord<K extends RAnyRecord, M extends RAnyEventRecord>(
    knownModel: K,
    model: M,
    entity: string,
    recordId: string,
    {query, signal}: GetRecordOptions = {}
  ) {
    const url = await expandUrlTemplate(
      "record",
      {
        entity,
        record_id: recordId,
      },
      signal
    );

    const urlAndQuery = url + Query.singleToQueryString(query);
    const httpOptions: HttpOptions = {authorizationBuilder, signal};

    const responseModel = RecordResponse.io(knownModel, model);
    const [, response] = await Api.get(responseModel, urlAndQuery, httpOptions);
    return response;
  }

  async function getRecordVersion<K extends RAnyRecord, M extends RAnyRecord>(
    knownModel: K,
    model: M,
    entity: string,
    recordId: string,
    versionHash: string,
    {query, signal}: GetRecordOptions = {}
  ) {
    const url = await expandUrlTemplate(
      "recordVersion",
      {
        entity,
        record_id: recordId,
        version_hash: versionHash,
      },
      signal
    );

    const urlAndQuery = url + Query.singleToQueryString(query);
    const httpOptions: HttpOptions = {authorizationBuilder, signal};

    const responseModel = RecordResponse.io(knownModel, model);
    const [, response] = await Api.get(responseModel, urlAndQuery, httpOptions);
    return response;
  }

  async function getOwnRecord<K extends RAnyRecord, M extends RAnyEventRecord>(
    knownModel: K,
    model: M,
    recordId: string,
    options?: GetRecordOptions
  ) {
    const entityRecord = await getEntityRecord(options?.signal);
    return getRecord(
      knownModel,
      model,
      entityRecord.author.entity,
      recordId,
      options
    );
  }

  async function getRecords<K extends RAnyRecord, M extends RAnyRecord>(
    knownModel: K,
    model: M,
    query: Query<IO.TypeOf<M>>,
    signal?: AbortSignal
  ) {
    const url = await expandUrlTemplate("records", {}, signal);
    const urlAndQuery = url + Query.toQueryString(query);
    const httpOptions: HttpOptions = {authorizationBuilder, signal};

    const responseModel = recordsResponse(knownModel, model);
    const [, response] = await Api.get(responseModel, urlAndQuery, httpOptions);
    return response;
  }

  async function recordEventSource<
    Q extends AnyRecord,
    R extends
      | IO.Type<Q, unknown, unknown>
      | IO.Type<NoContentRecord, unknown, unknown>
      | IO.Type<Q | NoContentRecord, unknown, unknown>,
  >(
    recordModel: R,
    onRecord: (record: IO.TypeOf<R>) => void,
    query: Query<Q>,
    signal: AbortSignal
  ) {
    try {
      const url = await expandUrlTemplate("events", {}, signal);
      const urlAndQuery = url + Query.toQueryString(query);
      const httpOptions: HttpOptions = {authorizationBuilder, signal};

      Api.eventSource(
        recordModel,
        onRecord,
        "record",
        urlAndQuery,
        httpOptions
      );
    } catch (error) {
      if (error instanceof AbortedError) {
        return;
      }

      throw error;
    }
  }

  async function postRecordBaseAsync<
    K extends RAnyRecord,
    R extends RAnyEventRecord,
  >(
    knownModel: K,
    recordModel: R,
    record: IO.TypeOf<R>,
    signal?: AbortSignal,
    options: PostRecordOptions = {}
  ) {
    const url = await expandUrlTemplate("newRecord", {}, signal);
    const responseModel = RecordResponse.io(knownModel, recordModel);
    const httpOptions: HttpOptions = {...options, authorizationBuilder, signal};

    return await Api.post(responseModel, recordModel, record, url, httpOptions);
  }

  async function postRecord<K extends RAnyRecord, R extends RAnyEventRecord>(
    knownModel: K,
    recordModel: R,
    record: IO.TypeOf<R>,
    signal?: AbortSignal
  ) {
    const [, response] = await postRecordBaseAsync(
      knownModel,
      recordModel,
      record,
      signal
    );
    return response;
  }

  async function postAppRecord(
    record: AppRecord,
    credentialsRecord: ServerCredentialsRecord,
    signal?: AbortSignal
  ) {
    const credentialsHeader = HttpCredentialsHeader.ofRecord(credentialsRecord);
    const options: PostRecordOptions = {
      headers: {
        [Constants.credentialsHeader]:
          HttpCredentialsHeader.toString(credentialsHeader),
      },
    };

    const [headers, response] = await postRecordBaseAsync(
      AnyRecord,
      AppRecord,
      record,
      signal,
      options
    );

    const responseCredentials = HttpCredentialsHeader.tryParseHeader(
      headers.get(Constants.credentialsHeader)
    );
    if (!responseCredentials) {
      throw new Error("Server credentials not found.");
    }

    return [responseCredentials.publicKey, response.record] as const;
  }

  async function putRecord<K extends RAnyRecord, R extends RAnyRecord>(
    knownModel: K,
    recordModel: R,
    record: IO.TypeOf<R>,
    signal?: AbortSignal
  ) {
    const url = await expandUrlTemplate(
      "record",
      {
        entity: record.author.entity,
        record_id: record.id,
      },
      signal
    );

    const responseModel = RecordResponse.io(knownModel, recordModel);
    const httpOptions: HttpOptions = {authorizationBuilder, signal};

    const [, response] = await Api.put(
      responseModel,
      recordModel,
      record,
      url,
      httpOptions
    );

    return response;
  }

  async function deleteRecord<K extends RAnyRecord>(
    knownModel: K,
    record: NoContentRecord,
    signal?: AbortSignal
  ) {
    const url = await expandUrlTemplate(
      "record",
      {
        entity: record.author.entity,
        record_id: record.id,
      },
      signal
    );

    const responseModel = RecordResponse.io(knownModel, RNoContentRecord);
    const httpOptions: HttpOptions = {authorizationBuilder, signal};

    const [_, response] = await Api.delete(
      responseModel,
      RNoContentRecord,
      record,
      url,
      httpOptions
    );

    return response;
  }

  //
  // Discovery.
  //

  async function discover(entity: string, signal?: AbortSignal) {
    const query = Query.new({
      pageSize: 1,
      proxyTo: entity,
      filter: Q.and(Q.author(entity), Q.type(EntityRecord)),
    });

    const {records} = await getRecords(AnyRecord, EntityRecord, query, signal);
    const firstRecord = records[0];

    if (!firstRecord) {
      throw new ErrorWithData("Discovery failed", {records});
    }

    return firstRecord;
  }

  //
  // Blobs.
  //

  async function uploadBlob(blob: Blob, signal?: AbortSignal) {
    if (!blob.type) {
      throw new ErrorWithData("Blob does not have a type.", {blob});
    }

    const url = await expandUrlTemplate("newBlob", {}, signal);
    const headers = {"Content-Type": blob.type};
    const httpOptions: HttpOptions = {authorizationBuilder, headers, signal};

    const [, r] = await Api.postBlob(RBlobResponse, blob, url, httpOptions);
    return r;
  }

  async function downloadBlob(
    record: AnyRecord,
    blob: AnyBlobLink,
    signal?: AbortSignal
  ) {
    const url = await expandUrlTemplate(
      "recordBlob",
      {
        entity: record.author.entity,
        record_id: record.id,
        blob_hash: blob.hash,
        file_name: blob.name,
      },
      signal
    );

    const isProxyRecord = record.source === "proxy";
    const query = isProxyRecord ? {proxyTo: record.author.entity} : undefined;

    const options: HttpOptions = {
      authorizationBuilder,
      signal,
      query,
    };

    const [, result] = await Http.download(url, options);
    return result;
  }

  function blobUrlBuilderFor(entityRecord: EntityRecord): BlobUrlBuilder {
    const urlTemplate = getEntityUrlTemplateForRecord(
      entityRecord,
      "recordBlob"
    );

    return (record, blob, expiresInSeconds) => {
      const maybeAddBearer = (url: string) => {
        const isProxyRecord = record.source === "proxy";

        const bearer = (() => {
          if (!bearerBuilder || (Record.isPublic(record) && !isProxyRecord)) {
            return undefined;
          }

          const expiresAt = expiresInSeconds
            ? Date.now() + expiresInSeconds * 1000
            : findStableTimestamp(blob.hash, 90);

          return bearerBuilder(url, expiresAt);
        })();

        const proxyTo = (() => {
          if (!isProxyRecord) {
            return;
          }

          return record.author.entity;
        })();

        const query = compact([
          bearer && (["bearer", bearer] as const),
          proxyTo && (["proxy_to", proxyTo] as const),
        ]);

        return url + Str.query(query);
      };

      const url = fixUrl(
        urlTemplate.expand({
          entity: record.author.entity,
          record_id: record.id,
          blob_hash: blob.hash,
          file_name: blob.name,
        })
      );

      return maybeAddBearer(url);
    };
  }

  async function blobUrlBuilder() {
    const entityRecord = await getEntityRecord();
    return blobUrlBuilderFor(entityRecord);
  }

  return {
    expandUrlTemplate,
    getEntityRecord,
    getRecord,
    getRecordVersion,
    getOwnRecord,
    getRecords,
    recordEventSource,
    postRecord,
    postAppRecord,
    putRecord,
    deleteRecord,
    discover,
    uploadBlob,
    downloadBlob,
    blobUrlBuilderFor,
    blobUrlBuilder,
  };
}

async function getEntityRecordFromEntityRecordUrl(
  entityRecordUrl: string,
  signal: AbortSignal
) {
  const options: HttpOptions = {signal};
  const responseModel = RecordResponse.io(AnyRecord, EntityRecord);
  const [, {record}] = await Api.get(
    responseModel,
    fixUrl(entityRecordUrl),
    options
  );

  return record;
}

async function getEntityRecordFromEntity(entity: string, signal: AbortSignal) {
  // Perform discovery.
  const headers = await Http.head(fixDiscoverUrl(`https://${entity}/`));
  const entityRecordLink = findLink(
    headers,
    "https://baq.dev/rels/entity-record"
  );

  if (!entityRecordLink) {
    throw new Error("Entity record link not found.");
  }

  // Fetch the record.
  return getEntityRecordFromEntityRecordUrl(entityRecordLink, signal);
}

function buildClientFromUrl(entityRecordUrl: string) {
  const getEntityRecord = (signal: AbortSignal) =>
    getEntityRecordFromEntityRecordUrl(entityRecordUrl, signal);

  return buildClientBase({getEntityRecord});
}

function buildClientFromEntity(entity: string) {
  const getEntityRecord = (signal: AbortSignal) =>
    getEntityRecordFromEntity(entity, signal);

  return buildClientBase({getEntityRecord});
}

function buildClientFromRecord(entityRecord: EntityRecord) {
  const getEntityRecord = () => Promise.resolve(entityRecord);
  return buildClientBase({getEntityRecord});
}

function buildAuthenticatedClient(state: AuthenticationState) {
  const {entityRecord, appRecord, credentialsRecord, authorizationId} = state;
  const appRecordId = appRecord.id;
  const privateKey = credentialsRecord.content.privateKey;

  const authorizationBuilder: HttpAuthorizationBuilder = (m, url, headers) => {
    const input = HttpSignatureInput.new(m, url, headers, authorizationId);
    const signature = HttpSignature.request(appRecordId, privateKey, input);
    return HttpSignature.toHeader(signature);
  };

  const bearerBuilder: HttpBearerBuilder = (url, expiresAt) => {
    const m = HttpMethod.GET;
    const signatureInput = HttpSignatureInput.new(m, url, {}, authorizationId);

    const signature = HttpBearerSignature.request(
      appRecordId,
      privateKey,
      signatureInput,
      expiresAt
    );

    return HttpBearerSignature.toQuery(signature);
  };

  const getEntityRecord = () => Promise.resolve(entityRecord);
  return buildClientBase({
    getEntityRecord,
    authorizationBuilder,
    bearerBuilder,
  });
}

//
// Static discovery.
//

function fixDiscoverUrl(url: string) {
  switch (url) {
    case "https://quentez.localhost/":
      return "http://localhost:5254/api/quentez.localhost";

    case "https://testaccount1.localhost/":
      return "http://localhost:5254/api/testaccount1.localhost";

    case "https://testaccount2.localhost/":
      return "http://localhost:5254/api/testaccount2.localhost";

    default:
      return url;
  }
}

async function discover(entity: string, signal?: AbortSignal) {
  const client = buildClientFromEntity(entity);
  await client.getEntityRecord(signal);
  return client;
}

export const Client = {
  ofUrl: buildClientFromUrl,
  ofEntity: buildClientFromEntity,
  ofRecord: buildClientFromRecord,
  authenticated: buildAuthenticatedClient,
  discover,
};
