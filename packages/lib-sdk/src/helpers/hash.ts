import {sha256} from "@noble/hashes/sha256";
import {bytesToHex} from "@noble/hashes/utils";

function hashString(value: string) {
  return bytesToHex(sha256(value));
}

function shortHashString(value: string) {
  return bytesToHex(sha256(value).slice(0, 16));
}

export const Hash = {
  hash: hashString,
  shortHash: shortHashString,
  bytesToHex,
};
