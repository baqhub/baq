import {ed25519} from "@noble/curves/ed25519";

export function buildKey() {
  const privateKey = ed25519.utils.randomPrivateKey();
  const publicKey = ed25519.getPublicKey(privateKey);

  return [publicKey, privateKey] as const;
}

export function sign(privateKey: Uint8Array, data: Uint8Array) {
  return ed25519.sign(data, privateKey);
}

export function verify(
  publicKey: Uint8Array,
  data: Uint8Array,
  signature: Uint8Array
) {
  return ed25519.verify(signature, data, publicKey);
}
