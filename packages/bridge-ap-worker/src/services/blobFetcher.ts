import {BlobRequest} from "@baqhub/server";
import {Document, Image} from "@fedify/fedify/vocab";

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

async function fetchImage(request: ImageRequest) {
  interface ImageRequestAttempt {
    width: number | undefined;
    height: number | undefined;
    format: RequestInitCfPropertiesImage["format"] | undefined;
    count: number;
  }

  async function fetchAttempt(attempt?: ImageRequestAttempt) {
    const response = await fetch(request.url, {
      cf: {
        image: attempt && {
          fit: "scale-down",
          width: attempt.width,
          height: attempt.height,
          format: attempt.format,
        },
      },
    });

    if (response.status !== 200 || !response.body) {
      return undefined;
    }

    const sizeHeader = Number(response.headers.get("Content-Length"));
    if (!Number.isSafeInteger(sizeHeader)) {
      return undefined;
    }

    if (sizeHeader <= request.maxBytes) {
      return [sizeHeader, response.body] as const;
    }

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
      width: undefined,
      height: undefined,
      format: typeToFormat(firstType),
      count: 0,
    };
  })();

  return fetchAttempt(initialAttempt);
}

export async function avatarToBlobRequest(
  icon: Image
): Promise<BlobRequest | undefined> {
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

  const result = await fetchImage({
    url,
    type: mediaType,
    maxBytes: avatarMaxSize,
    startWidth: 400,
    startHeight: 400,
    allowedTypes: ["image/jpeg", "image/png"],
  });
  if (!result) {
    return undefined;
  }

  return {
    fileName,
    type: mediaType,
    size: result[0],
    stream: result[1],
    context: {url: url.toString()},
  };
}

export function postImageToBlobRequests(attachment: Document, index: number) {
  const {url, mediaType} = attachment;

  if (!(url instanceof URL) || !mediaType) {
    return undefined;
  }

  const imageToBlobRequest = async (
    maxBytes: number,
    startWidth: number,
    startHeight: number,
    suffix: string
  ): Promise<BlobRequest> => {
    const result = await fetchImage({
      url,
      type: mediaType,
      maxBytes,
      startWidth,
      startHeight,
      allowedTypes: ["image/jpeg"],
    });
    if (!result) {
      throw new Error(`Image not found: ${suffix} ${url}`);
    }

    return {
      fileName: `image${index}_${suffix}.jpg`,
      type: "image/jpeg",
      size: result[0],
      stream: result[1],
      context: {url: url.toString()},
    };
  };

  return {
    small: imageToBlobRequest(80 * 1024, 500, 500, "small"),
    medium: imageToBlobRequest(600 * 1024, 1200, 1200, "medium"),
    large: imageToBlobRequest(2 * 1024 * 1024, 2000, 2000, "large"),
  };
}
