import * as fs from "node:fs/promises";
import * as path from "node:path";
import sharp from "sharp";
import {metaToPaths} from "./scriptHelpers.js";

const {directoryPath} = metaToPaths(import.meta);
const outputDirectory = path.join(directoryPath, "..", "..", "dist");

function bToKb(bytes) {
  const kilobytes = bytes / 1024;
  return kilobytes.toFixed(2);
}

async function compressJPEG(size, filePath) {
  try {
    const newImage = await sharp(filePath).jpeg({quality: 70}).toBuffer();
    await fs.writeFile(filePath, newImage);

    const fileName = path.basename(filePath);
    const before = bToKb(size);
    const after = bToKb(newImage.length);

    console.log(`\t${fileName} — ${before} kB -> ${after} kB`);
  } catch (error) {
    console.error(`Failed to compress ${filePath}:`, error);
  }
}

async function processDirectory(directory) {
  const files = await fs.readdir(directory);

  await Promise.all(
    files.map(async file => {
      const filePath = path.join(directory, file);
      const fileStat = await fs.stat(filePath);

      if (fileStat.isDirectory()) {
        await processDirectory(filePath);
      } else if (
        [".jpg", ".jpeg"].includes(path.extname(filePath).toLowerCase())
      ) {
        await compressJPEG(fileStat.size, filePath);
      }
    })
  );
}

(async () => {
  try {
    console.log("Compressing images.\n");
    await processDirectory(outputDirectory);
    console.log("\nJPEG image compression complete.");
  } catch (error) {
    console.error("Error during JPEG compression:", error);
  }
})();
