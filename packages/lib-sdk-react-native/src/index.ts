// We don't actually want to polyfill "fetch".
// It was more complicated to manually polyfill one by one.
const originalFetch = global.fetch;
const originalHeaders = global.Headers;
const originalRequest = global.Request;
const originalResponse = global.Response;

// Polyfill for URL, btoa/atob, ReadableStream,
// fetch, TextEncoder/TextDecoder, crypto.getRandomValues()
import "react-native-polyfill-globals/auto";

const polyFetch = global.fetch;

global.fetch = originalFetch;
global.Headers = originalHeaders;
global.Request = originalRequest;
global.Response = originalResponse;

const eventSourceFetch: typeof fetch = (input, init) => {
  return polyFetch(input, {
    ...init,
    reactNative: {textStreaming: true},
  } as any);
};

import {setHttpApi} from "@baqhub/sdk";
setHttpApi({
  fetch: originalFetch,
  eventSourceFetch: eventSourceFetch,
});

export * from "./asyncStorageAdapter.js";
