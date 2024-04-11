export interface Size {
  width: number;
  height: number;
}

function imageFromBlob(imageBlob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const imageUrl = URL.createObjectURL(imageBlob);
    const image = new Image();

    image.src = imageUrl;
    image.onload = () => {
      URL.revokeObjectURL(imageUrl);
      resolve(image);
    };
    image.onerror = () => {
      reject("Image could not be loaded.");
    };
  });
}

function canvasToJpeg(
  canvas: HTMLCanvasElement,
  quality: number = 0.95
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob =>
        blob ? resolve(blob) : reject("Error rendering canvas to JPEG."),
      "image/jpeg",
      quality
    );
  });
}

function findResultSize(imageSize: Size, maxSize: Size): Size {
  const imageSizeRatio = imageSize.width / imageSize.height;
  const maxSizeRatio = maxSize.width / maxSize.height;

  if (imageSizeRatio >= maxSizeRatio && imageSize.width > maxSize.width) {
    return {
      width: maxSize.width,
      height: Math.floor(maxSize.width / imageSizeRatio),
    };
  }

  if (imageSizeRatio < maxSizeRatio && imageSize.height > maxSize.height) {
    return {
      width: Math.floor(maxSize.height * imageSizeRatio),
      height: maxSize.height,
    };
  }

  return imageSize;
}

export async function resizeWithConstraints(
  imageBlob: Blob,
  maxSize: Size,
  maxBytes: number,
  startQuality: number
) {
  const image = await imageFromBlob(imageBlob);
  const imageSize: Size = {width: image.width, height: image.height};

  async function resize(ratio: number, quality: number) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas context could not be created.");
    }

    const ratioMaxSize: Size = {
      width: Math.floor(maxSize.width * ratio),
      height: Math.floor(maxSize.height * ratio),
    };

    const resultSize = findResultSize(imageSize, ratioMaxSize);
    canvas.width = resultSize.width;
    canvas.height = resultSize.height;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(image, 0, 0, resultSize.width, resultSize.height);

    return await canvasToJpeg(canvas, quality);
  }

  let ratio = 1;
  let quality = startQuality;

  while (ratio > 0.7) {
    const resultBlob = await resize(ratio, quality);
    if (resultBlob.size <= maxBytes) {
      return [resultBlob, imageSize] as const;
    }

    ratio -= 0.1;
    quality -= 0.1;
  }

  throw new Error("Resizing within bytes constraint failed.");
}
