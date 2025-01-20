import * as IO from "../src/helpers/io.js";
import {buildKey} from "../src/helpers/signature.js";

const [publicKey, privateKey] = buildKey();

console.log({
  publicKey: IO.base64Bytes.encode(publicKey),
  privateKey: IO.base64Bytes.encode(privateKey),
});
