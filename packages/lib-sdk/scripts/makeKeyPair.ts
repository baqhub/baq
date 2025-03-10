import * as IO from "../src/helpers/io.js";
import {Signature} from "../src/helpers/signature.js";

const [publicKey, privateKey] = Signature.buildKey();

console.log({
  publicKey: IO.base64Bytes.encode(publicKey),
  privateKey: IO.base64Bytes.encode(privateKey),
});
