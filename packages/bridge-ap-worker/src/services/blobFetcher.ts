import {BlobBuilder} from "@baqhub/server";
import {Document, Image} from "@fedify/fedify/vocab";
import {Constants} from "../helpers/constants";

const avatarMaxSize = 262144;
const imageMaxAttempts = 2;

interface ImageRequest {
  url: URL;
  type: string;
  maxBytes: number;
  startWidth: number | undefined;
  startHeight: number | undefined;
  allowedTypes: ReadonlyArray<string>;
}

function typeToFormat(type: string): RequestInitCfPropertiesImage["format"] {
  switch (type) {
    case "image/jpeg":
      return "jpeg";

    case "image/png":
      return "png";

    default:
      throw new Error("Format not found for type: " + type);
  }
}

interface ImageRequestAttempt {
  width: number | undefined;
  height: number | undefined;
  format: RequestInitCfPropertiesImage["format"] | undefined;
  count: number;
}

export interface FetchImageEnv {
  IMAGES_AUTH_KEY: string;
}

function fetchResizeImage(
  env: FetchImageEnv,
  url: URL,
  attempt: ImageRequestAttempt | undefined
) {
  if (!attempt) {
    return fetch(url);
  }

  // Needed because CF-Images doesn't work in Durable Objects.
  return fetch(Constants.imagesServiceUrl, {
    body: JSON.stringify({
      auth_key: env.IMAGES_AUTH_KEY,
      image_url: url.toString(),
      fit: "scale-down",
      format: attempt.format,
      width: attempt.width,
      height: attempt.height,
    }),
    method: "POST",
    headers: {
      "content-type": "application/json; charset=UTF-8",
    },
  });
}

async function fetchImage(env: FetchImageEnv, request: ImageRequest) {
  async function fetchAttempt(attempt?: ImageRequestAttempt) {
    const response = await fetchResizeImage(env, request.url, attempt);
    if (!response.body) {
      return undefined;
    }

    if (response.status !== 200) {
      response.body.cancel();
      return undefined;
    }

    const sizeHeader = Number(response.headers.get("Content-Length"));
    if (!Number.isSafeInteger(sizeHeader)) {
      response.body.cancel();
      return undefined;
    }

    if (sizeHeader <= request.maxBytes) {
      return response.body;
    }

    response.body.cancel();

    if (attempt && attempt.count >= imageMaxAttempts) {
      return undefined;
    }

    return fetchAttempt({
      width: attempt?.width ? attempt.width / 2 : request.startWidth,
      height: attempt?.height ? attempt.height / 2 : request.startHeight,
      format: attempt?.format,
      count: attempt ? attempt.count + 1 : 1,
    });
  }

  const initialAttempt = ((): ImageRequestAttempt | undefined => {
    if (request.allowedTypes.includes(request.type)) {
      return undefined;
    }

    const firstType = request.allowedTypes[0];
    if (!firstType) {
      return undefined;
    }

    return {
      width: request.startWidth,
      height: request.startHeight,
      format: typeToFormat(firstType),
      count: 0,
    };
  })();

  return fetchAttempt(initialAttempt);
}

export function avatarToBlobRequest(
  env: FetchImageEnv,
  icon: Image
): BlobBuilder | undefined {
  const {url, mediaType} = icon;

  const fileName = (() => {
    switch (mediaType) {
      case "image/jpeg":
        return "avatar.jpg";

      case "image/png":
        return "avatar.png";

      default:
        return undefined;
    }
  })();

  if (!(url instanceof URL) || !mediaType || !fileName) {
    return undefined;
  }

  const getBlob = async () => {
    const stream = await fetchImage(env, {
      url,
      type: mediaType,
      maxBytes: avatarMaxSize,
      startWidth: 400,
      startHeight: 400,
      allowedTypes: ["image/jpeg", "image/png"],
    });
    if (!stream) {
      return undefined;
    }

    return {
      type: mediaType,
      stream,
    };
  };

  return {
    fileName,
    context: {url: url.toString()},
    getBlob,
  };
}

export function postImageToBlobRequests(
  env: FetchImageEnv,
  attachment: Document,
  index: number
) {
  const {url, mediaType} = attachment;

  if (!(url instanceof URL) || !mediaType) {
    return undefined;
  }

  const imageToBlobRequest = (
    maxBytes: number,
    startWidth: number,
    startHeight: number,
    suffix: string
  ): BlobBuilder => {
    const getBlob = async () => {
      const stream = await fetchImage(env, {
        url,
        type: mediaType,
        maxBytes,
        startWidth,
        startHeight,
        allowedTypes: ["image/jpeg"],
      });
      if (!stream) {
        throw new Error(`Image not found: ${suffix} ${url}`);
      }

      return {
        type: mediaType,
        stream,
      };
    };

    return {
      fileName: `image${index}_${suffix}.jpg`,
      context: {url: url.toString()},
      getBlob,
    };
  };

  return {
    small: imageToBlobRequest(80 * 1024, 500, 500, "small"),
    medium: imageToBlobRequest(600 * 1024, 1200, 1200, "medium"),
    large: imageToBlobRequest(2 * 1024 * 1024, 2000, 2000, "large"),
  };
}
