// MIT License

// Copyright (c) Microsoft Corporation.

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE

//
// File from:
// https://github.com/Azure/fetch-event-source/blob/main/src/fetch.ts
//

// Modifications:
// - Allow headers to be rebuilt on each request.

import {
  EventSourceMessage,
  getBytes,
  getLines,
  getMessages,
} from "./eventSourceParse.js";

const eventStreamContentType = "text/event-stream";
const defaultRetryInterval = 1000; // 1s
const defaultMonitorInterval = 20 * 1000; // 40s

export type BuildEventSourceHeaders = (
  lastEventId: string | undefined
) => Record<string, string>;

export interface FetchEventSourceInit extends RequestInit {
  onMessage: (ev: EventSourceMessage) => void;
  buildHeaders?: BuildEventSourceHeaders;
  openWhenHidden?: boolean;
}

export function fetchEventSource(
  eventSourceFetch: typeof fetch,
  input: RequestInfo,
  options: FetchEventSourceInit
) {
  return new Promise<void>(resolve => {
    const {onMessage, buildHeaders, signal, ...rest} = options;

    if (signal?.aborted) {
      return;
    }

    // function onVisibilityChange() {
    //   abortController.abort(); // close existing request on every visibility change
    //   if (!document.hidden) {
    //     create(); // page is now visible again, recreate request.
    //   }
    // }

    // if (!openWhenHidden) {
    //   document.addEventListener("visibilitychange", onVisibilityChange);
    // }

    let abortController: AbortController;
    let lastEventId: string | undefined = undefined;
    let retryInterval = defaultRetryInterval;
    let retryTimer = 0;
    let monitorTimer = 0;

    function dispose() {
      // if (!openWhenHidden) {
      //   document.removeEventListener("visibilitychange", onVisibilityChange);
      // }

      clearTimeout(retryTimer);
      clearTimeout(monitorTimer);
      abortController.abort();
    }

    // If the incoming signal aborts, dispose resources and resolve.
    signal?.addEventListener("abort", () => {
      dispose();
      resolve();
    });

    function scheduleRetry() {
      dispose();
      retryTimer = setTimeout(create, retryInterval);
    }

    function resetMonitor() {
      clearTimeout(monitorTimer);
      monitorTimer = setTimeout(scheduleRetry, defaultMonitorInterval);
    }

    function onMessageInternal(event: EventSourceMessage) {
      resetMonitor();
      return onMessage(event);
    }

    async function create() {
      abortController = new AbortController();
      try {
        while (!abortController.signal.aborted) {
          const headers = {
            ...buildHeaders?.(lastEventId),
            Accept: eventStreamContentType,
          };

          const response = await eventSourceFetch(input, {
            ...rest,
            headers,
            signal: abortController.signal,
          });

          await defaultOnOpen(response);
          resetMonitor();

          await getBytes(
            response.body!,
            getLines(
              getMessages(
                id => {
                  if (id) {
                    // Store the id and send it back on the next retry.
                    lastEventId = id;
                  } else {
                    // Don't send the last-event-id header anymore.
                    lastEventId = undefined;
                  }
                },
                retry => {
                  retryInterval = retry;
                },
                onMessageInternal
              )
            )
          );
        }
      } catch (err) {
        if (abortController.signal.aborted) {
          return;
        }

        // If we haven't aborted the request ourselves, retry.
        scheduleRetry();
      }
    }

    create();
  });
}

function defaultOnOpen(response: Response) {
  const contentType = response.headers.get("content-type");
  if (!contentType?.startsWith(eventStreamContentType)) {
    throw new Error(
      `Expected content-type to be ${eventStreamContentType}, Actual: ${contentType}`
    );
  }
}
