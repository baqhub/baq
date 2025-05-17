import {ed25519} from "@noble/curves/ed25519";

function buildKey() {
  const privateKey = ed25519.utils.randomPrivateKey();
  const publicKey = ed25519.getPublicKey(privateKey);

  return [publicKey, privateKey] as const;
}

function sign(privateKey: Uint8Array, data: Uint8Array) {
  return ed25519.sign(data, privateKey);
}

function verify(
  publicKey: Uint8Array,
  data: Uint8Array,
  signature: Uint8Array
) {
  return ed25519.verify(signature, data, publicKey);
}

export const Signature = {
  buildKey,
  sign,
  verify,
};
