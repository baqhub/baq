import memoize from "lodash/memoize.js";
import pickBy from "lodash/pickBy.js";
import snakeCase from "lodash/snakeCase.js";
import {Constants} from "../constants.js";
import {AbortedError} from "../helpers/async.js";
import {CustomError} from "../helpers/customError.js";
import {Str} from "../helpers/string.js";
import {isDefined} from "../helpers/type.js";
import {Uuid} from "../helpers/uuid.js";
import {HttpHeaders} from "../model/core/httpHeaders.js";
import {HttpMethod} from "../model/core/httpMethod.js";
import {BuildEventSourceHeaders, fetchEventSource} from "./eventSource.js";
import {EventSourceMessage} from "./eventSourceParse.js";

const getClientId = memoize(() => Uuid.new());

interface HttpApi {
  fetch: typeof fetch;
  eventSourceFetch: typeof fetch;
}

let api: HttpApi = {
  fetch: (...args) => fetch(...args),
  eventSourceFetch: (...args) => fetch(...args),
};

export function setHttpApi(newApi: typeof api) {
  api = newApi;
}

export class RequestError extends CustomError {
  constructor(
    public options: HttpSendOptions,
    public status: number,
    public headers: Headers
  ) {
    super("Request error.");
  }
}

export class RequestFailedError extends CustomError {
  constructor(public baseError: unknown) {
    super("Request failed.");
  }
}

function isError<T extends ReadonlyArray<number> | undefined>(
  error: unknown,
  statuses?: T
): error is T extends undefined
  ? RequestFailedError | RequestError
  : RequestError {
  if (error instanceof RequestFailedError && !statuses) {
    return true;
  }

  if (!(error instanceof RequestError)) {
    return false;
  }

  if (!statuses) {
    return true;
  }

  return statuses.includes(error.status);
}

export interface HttpQuery {
  [T: string]: string | undefined;
}

export type HttpAuthorizationBuilder = (
  method: HttpMethod,
  url: string,
  headers: HttpHeaders
) => string;

export interface HttpOptions {
  headers?: HttpHeaders;
  query?: HttpQuery;
  signal?: AbortSignal;
  authorizationBuilder?: HttpAuthorizationBuilder;
}

interface HttpSendOptions extends HttpOptions {
  method: HttpMethod;
  url: string;
  body?: unknown;
}

async function httpHead(url: string, options?: HttpOptions) {
  const response = await sendAsync({
    ...options,
    method: HttpMethod.HEAD,
    url,
  });

  return response.headers;
}

async function httpGet(url: string, options?: HttpOptions) {
  const response = await sendAsync({
    ...options,
    method: HttpMethod.GET,
    url,
  });

  const json: unknown = await response.json();
  return [response.headers, json] as const;
}

async function httpDownload(url: string, options?: HttpOptions) {
  const response = await sendAsync({
    ...options,
    headers: {
      Accept: "*/*",
      ...options?.headers,
    },
    method: HttpMethod.GET,
    url,
  });

  const blob = await response.blob();
  return [response.headers, blob] as const;
}

async function httpPost(body: unknown, url: string, options: HttpOptions = {}) {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    ...options.headers,
  };

  const response = await sendAsync({
    ...options,
    headers,
    method: HttpMethod.POST,
    url,
    body,
  });

  const json: unknown = await response.json();
  return [response.headers, json] as const;
}

async function httpPut(body: unknown, url: string, options: HttpOptions = {}) {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    ...options.headers,
  };

  const response = await sendAsync({
    ...options,
    headers,
    method: HttpMethod.PUT,
    url,
    body,
  });

  const json: unknown = await response.json();
  return [response.headers, json] as const;
}

async function httpPatch(
  body: unknown,
  url: string,
  options: HttpOptions = {}
) {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    ...options.headers,
  };

  const response = await sendAsync({
    ...options,
    headers,
    method: HttpMethod.PATCH,
    url,
    body,
  });

  const json: unknown = await response.json();
  return [response.headers, json] as const;
}

async function httpDelete(url: string, options?: HttpOptions) {
  return sendAsync({
    ...options,
    method: HttpMethod.DELETE,
    url,
  });
}

async function httpDeleteBody(
  body: unknown,
  url: string,
  options: HttpOptions = {}
) {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    ...options.headers,
  };

  const response = await sendAsync({
    ...options,
    headers,
    method: HttpMethod.DELETE,
    url,
    body,
  });

  const json: unknown = await response.json();
  return [response.headers, json] as const;
}

function buildUrl(url: string, query: HttpQuery | undefined) {
  const queryArray = Object.entries(query || {})
    .map(([key, value]) =>
      value ? ([snakeCase(key), value] as const) : undefined
    )
    .filter(isDefined);

  return url + Str.buildQuery(queryArray);
}

function conformBody(body: unknown) {
  if (body instanceof File) {
    return body;
  }

  if (body instanceof Blob) {
    return body;
  }

  if (body) {
    return JSON.stringify(body);
  }

  return null;
}

async function sendAsync(options: HttpSendOptions) {
  const {method, url, body} = options;
  const fullUrl = buildUrl(url, options.query);

  const initialHeaders = {
    Accept: "application/json",
    ...options.headers,
    [Constants.clientIdHeader]: getClientId(),
  };

  const headers = {
    ...initialHeaders,
    Authorization: options.authorizationBuilder?.(
      method,
      fullUrl,
      initialHeaders
    ),
  };

  try {
    const response = await api.fetch(fullUrl, {
      method,
      headers: pickBy(headers, isDefined),
      body: conformBody(body),
      signal: options.signal,
    });

    if (!response.ok) {
      throw new RequestError(options, response.status, response.headers);
    }

    return response;
  } catch (error) {
    // If this request was aborted, throw a custom error.
    if (options.signal?.aborted) {
      throw new AbortedError();
    }

    if (error instanceof RequestError) {
      throw error;
    }

    // Otherwise, bubble up.
    throw new RequestFailedError(error);
  }
}

function httpEventSource(
  onMessage: (event: EventSourceMessage) => void,
  url: string,
  options: HttpOptions = {}
) {
  const buildHeaders: BuildEventSourceHeaders = lastEventId => {
    const initialHeaders = pickBy(
      {
        ...options.headers,
        [Constants.clientIdHeader]: getClientId(),
        [Constants.lastEventIdHeader]: lastEventId,
      },
      isDefined
    );

    return pickBy(
      {
        ...initialHeaders,
        Authorization: options.authorizationBuilder?.(
          HttpMethod.GET,
          url,
          initialHeaders
        ),
      },
      isDefined
    );
  };

  fetchEventSource(api.eventSourceFetch, buildUrl(url, options.query), {
    buildHeaders,
    onMessage: onMessage,
    openWhenHidden: true,
    signal: options.signal,
  });
}

export const Http = {
  isError,
  head: httpHead,
  get: httpGet,
  post: httpPost,
  put: httpPut,
  patch: httpPatch,
  delete: httpDelete,
  deleteBody: httpDeleteBody,
  download: httpDownload,
  eventSource: httpEventSource,
};
