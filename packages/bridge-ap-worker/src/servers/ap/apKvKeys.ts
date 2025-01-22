import {KvKey} from "@baqhub/server";
import {KvKey as FKvKey} from "@fedify/fedify";

function identifierForEntity(entity: string): KvKey<string> {
  return ["ap", "identifier", entity];
}

export interface ActorState {
  id: string;
  entity: string;
  entityRecord:
    | {
        fetchedAt: number;
        record: unknown;
      }
    | undefined;
}

function actorForIdentifier(identifier: string): KvKey<ActorState> {
  return ["ap", "actor_state", identifier];
}

export interface ActorKeyPair {
  type: "rsa" | "ed25519";
  privateKey: JsonWebKey;
  publicKey: JsonWebKey;
}

function keyPairsForIdentifier(
  identifier: string
): KvKey<ReadonlyArray<ActorKeyPair>> {
  return ["ap", "actor_keypairs", identifier];
}

export const ApKvKeys = {
  fedifyActivityIdempotence: ["ap", "fedify", "activityIdempotence"] as FKvKey,
  fedifyRemoteDocument: ["ap", "fedify", "remoteDocument"] as FKvKey,
  fedifyPublicKey: ["ap", "fedify", "publicKey"] as FKvKey,
  identifierForEntity,
  actorForIdentifier,
  keyPairsForIdentifier,
};
