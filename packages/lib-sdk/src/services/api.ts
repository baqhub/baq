import * as IO from "../helpers/io.js";
import {EventSourceMessage} from "./eventSourceParse.js";
import {Http, HttpOptions} from "./http.js";

async function getApi<M extends IO.Any>(
  model: M,
  url: string,
  options?: HttpOptions
) {
  const [headers, response] = await Http.get(url, options);
  return [headers, IO.decode(model, response)] as const;
}

async function postApi<R extends IO.Any, B extends IO.Any>(
  responseModel: R,
  bodyModel: B,
  body: IO.TypeOf<B>,
  url: string,
  options?: HttpOptions
) {
  const [headers, response] = await Http.post(
    bodyModel.encode(body),
    url,
    options
  );

  return [headers, IO.decode(responseModel, response)] as const;
}

async function putApi<R extends IO.Any, B extends IO.Any>(
  responseModel: R,
  bodyModel: B,
  body: IO.TypeOf<B>,
  url: string,
  options?: HttpOptions
) {
  const [headers, response] = await Http.put(
    bodyModel.encode(body),
    url,
    options
  );

  return [headers, IO.decode(responseModel, response)] as const;
}

async function patchApi<R extends IO.Any, B extends IO.Any>(
  responseModel: R,
  bodyModel: B,
  body: IO.TypeOf<B>,
  url: string,
  options?: HttpOptions
) {
  const [headers, response] = await Http.patch(
    bodyModel.encode(body),
    url,
    options
  );

  return [headers, IO.decode(responseModel, response)] as const;
}

async function deleteApi<R extends IO.Any, B extends IO.Any>(
  responseModel: R,
  bodyModel: B,
  body: IO.TypeOf<B>,
  url: string,
  options?: HttpOptions
) {
  const [headers, response] = await Http.deleteBody(
    bodyModel.encode(body),
    url,
    options
  );

  return [headers, IO.decode(responseModel, response)] as const;
}

async function postBlobApi<R extends IO.Any>(
  responseModel: R,
  body: Blob,
  url: string,
  options?: HttpOptions
) {
  const [headers, response] = await Http.post(body, url, options);
  return [headers, IO.decode(responseModel, response)] as const;
}

function eventSourceApi<R extends IO.Any>(
  messageModel: R,
  onMessage: (message: IO.TypeOf<R>) => void,
  eventName: string,
  url: string,
  options?: HttpOptions
) {
  const onRawMessage = (event: EventSourceMessage) => {
    if (event.event !== eventName) {
      return;
    }

    const message = IO.decode(messageModel, JSON.parse(event.data));
    onMessage(message);
  };

  Http.eventSource(onRawMessage, url, options);
}

export const Api = {
  get: getApi,
  post: postApi,
  put: putApi,
  patch: patchApi,
  delete: deleteApi,
  postBlob: postBlobApi,
  eventSource: eventSourceApi,
};
