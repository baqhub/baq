import {
  EventSourceMessage,
  getBytes,
  getLines,
  getMessages,
} from "./eventSourceParse.js";

const eventStreamContentType = "text/event-stream";
const defaultRetryInterval = 1000;

export type BuildEventSourceHeaders = (
  lastEventId: string | undefined
) => Record<string, string>;

export interface FetchEventSourceInit extends RequestInit {
  buildHeaders?: BuildEventSourceHeaders;
  onmessage?: (ev: EventSourceMessage) => void;
  openWhenHidden?: boolean;
}

export function fetchEventSource(
  eventSourceFetch: typeof fetch,
  input: RequestInfo,
  options: FetchEventSourceInit
) {
  return new Promise<void>((resolve, reject) => {
    const {buildHeaders, onmessage, openWhenHidden, signal, ...rest} = options;

    if (signal?.aborted) {
      return;
    }

    let abortController: AbortController;
    function onVisibilityChange() {
      abortController.abort(); // close existing request on every visibility change
      if (!document.hidden) {
        create(); // page is now visible again, recreate request.
      }
    }

    if (!openWhenHidden) {
      document.addEventListener("visibilitychange", onVisibilityChange);
    }

    let lastEventId: string | undefined = undefined;
    let retryInterval = defaultRetryInterval;
    let retryTimer: any = 0;
    function dispose() {
      if (!openWhenHidden) {
        document.removeEventListener("visibilitychange", onVisibilityChange);
      }

      clearTimeout(retryTimer);
      abortController.abort();
    }

    // if the incoming signal aborts, dispose resources and resolve:
    signal?.addEventListener("abort", () => {
      dispose();
      resolve(); // don't waste time constructing/logging errors
    });

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

          await getBytes(
            response.body!,
            getLines(
              getMessages(
                id => {
                  if (id) {
                    // store the id and send it back on the next retry:
                    lastEventId = id;
                  } else {
                    // don't send the last-event-id header anymore:
                    lastEventId = undefined;
                  }
                },
                retry => {
                  retryInterval = retry;
                },
                onmessage
              )
            )
          );
        }
      } catch (err) {
        if (!abortController.signal.aborted) {
          // if we haven't aborted the request ourselves, retry.
          clearTimeout(retryTimer);
          retryTimer = setTimeout(create, retryInterval);
        }
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
