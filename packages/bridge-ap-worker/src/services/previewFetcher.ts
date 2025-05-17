import {BlobBuilder} from "@baqhub/server";
import {Constants} from "../helpers/constants";
import {fetchImage, FetchImageEnv} from "./imageFetcher";

export interface FetchPreviewEnv {
  PREVIEWS_AUTH_KEY: string;
}

interface FetchPreviewResult {
  url: string;
  title: string;
  description: string | undefined;
  image_url: string | undefined;
}

export async function postLinkToPreview(
  env: FetchPreviewEnv & FetchImageEnv,
  url: string
) {
  const response = await fetch(Constants.previewsServiceUrl, {
    body: JSON.stringify({
      auth_key: env.PREVIEWS_AUTH_KEY,
      url,
    }),
    method: "POST",
    headers: {
      "content-type": "application/json; charset=UTF-8",
    },
  });

  if (!response.body || !response.ok) {
    return undefined;
  }

  const content: FetchPreviewResult = await response.json();
  const {title, description, image_url} = content;
  if (!description && !image_url) {
    return undefined;
  }

  const imageBlobRequest = ((): BlobBuilder | undefined => {
    if (!image_url) {
      return undefined;
    }

    const getBlob = async () => {
      const stream = await fetchImage(env, {
        url: new URL(image_url),
        type: "image/jpeg",
        maxBytes: 80 * 1024,
        startWidth: 500,
        startHeight: 500,
        allowedTypes: ["image/jpeg"],
      });
      if (!stream) {
        throw new Error(`Image not found: ${image_url}`);
      }

      return {
        type: "image/jpeg",
        stream,
      };
    };

    return {
      fileName: "preview.jpg",
      context: {url: image_url},
      getBlob,
    };
  })();

  return {
    title,
    description,
    imageBlobRequest,
  };
}
