import {describe, expect, test} from "vitest";
import {EntityRecord, REntityRecord} from "../../recordTypes/entityRecord.js";
import {NoContentRecord, RNoContentRecord} from "../record.js";
import {RecordVersionHash} from "../recordVersionHash.js";

describe("record version hash", () => {
  test("types entity record", () => {
    // Prepare.
    const publicKeyBase64 = "aw4ujJEnJBFAoDVfHq+7O0Ingq989W+h6cB0oSMe7U0=";
    const publicKey = Uint8Array.from(atob(publicKeyBase64), c =>
      c.charCodeAt(0)
    );

    const record: EntityRecord = {
      author: {entity: "types.baq.dev"},
      content: {
        previousEntities: [],
        signingKeys: [
          {
            algorithm: "ed25519",
            publicKey,
          },
        ],
        profile: {name: "Protocol Types"},
        servers: [
          {
            endpoints: {
              auth: "https://baq.run/types.baq.dev/auth/{record_id}",
              records: "https://baq.run/api/types.baq.dev/records",
              record:
                "https://baq.run/api/types.baq.dev/records/{entity}/{record_id}",
              recordVersions:
                "https://baq.run/api/types.baq.dev/records/{entity}/{record_id}/versions",
              recordVersion:
                "https://baq.run/api/types.baq.dev/records/{entity}/{record_id}/versions/{version_hash}",
              newRecord: "https://baq.run/api/types.baq.dev/records",
              recordBlob:
                "https://baq.run/api/types.baq.dev/records/{entity}/{record_id}/blobs/{blob_hash}/{file_name}",
              recordVersionBlob:
                "https://baq.run/api/types.baq.dev/records/{entity}/{record_id}/versions/{version_hash}/blobs/{blob_hash}/{file_name}",
              newBlob: "https://baq.run/api/types.baq.dev/blobs",
              events: "https://baq.run/api/types.baq.dev/events",
              newNotification:
                "https://baq.run/api/types.baq.dev/notifications",
              serverInfo: "https://baq.run/api/types.baq.dev/server",
            },
            preference: 0,
            version: "1.0.0",
          },
        ],
      },
      createdAt: new Date("2023-01-01T00:00:00.000Z"),
      receivedAt: undefined,
      id: "79cea5a04bae4b22bc45ab0d19c4e87f",
      permissions: {read: "public"},
      type: {
        entity: "types.baq.dev",
        recordId: "80be958368dd414fabb9420647daa1ec",
        versionHash:
          "83cbc777e35a17293808ff07d2064c6614fc5616f5a0f912184c45f00178b447",
      },
      version: {
        author: {entity: "types.baq.dev"},
        createdAt: new Date("2024-12-01T00:00:00.000Z"),
        hash: "3d9ad75026efae4b696a320be2d591a934582bcecd65cd902d1eb9ae6bbb7706",
        hashSignature: undefined,
        parentHash:
          "9e3a404fcbd46bf321015dd70a95f8f466f21f7c7d7511830e6b2c7e643c7772",
        receivedAt: undefined,
      },
      source: "self",
      mode: "local",
    };

    // Act.
    const result = RecordVersionHash.ofRecord(REntityRecord, record);

    // Assert.
    expect(result).toBe(record.version!.hash);
  });

  test("deleted record", () => {
    // Prepare.
    const record: NoContentRecord = {
      author: {
        entity: "quentez.localhost",
        versionCreatedAt: new Date("2024-06-22T20:11:03.597Z"),
      },
      createdAt: new Date("2024-06-22T20:14:35.836Z"),
      receivedAt: undefined,
      id: "c90231cafbbd4faf9fd21717af1ada11",
      noContent: {
        action: "delete",
        links: [
          {
            link: {
              entity: "schemas.baq.dev",
              record_id: "ba132234fc384e7b8d61bcd049e9f84f",
            },
            path: "$['content']['scope_request']['read'][*]",
            type: "record",
          },
          {
            link: {
              entity: "schemas.baq.dev",
              record_id: "ba132234fc384e7b8d61bcd049e9f84f",
            },
            path: "$['content']['scope_request']['write'][*]",
            type: "record",
          },
        ],
      },
      permissions: {},
      type: {
        entity: "types.baq.dev",
        recordId: "58d114d7dcd24b1aa1ccbbccfe77634a",
        versionHash:
          "cd72d7677cc0478ad6a6362e8ace07584223637e53655685b41c24ae3452e0ba",
      },
      version: {
        author: {
          entity: "quentez.localhost",
          versionCreatedAt: new Date("2024-06-22T20:11:03.597Z"),
        },
        createdAt: new Date("2024-06-22T20:15:02.579Z"),
        receivedAt: undefined,
        hash: "b698f82a8f21c88befa2379cb40ece62f42130854727c99311dbb8c040184784",
        hashSignature: undefined,
        parentHash:
          "caf2bfe9efde6b8e8831f3cba26f5044ff32d80030f8c7ee450e5e85f511e3a2",
      },
      source: "self",
      mode: "local",
    };

    // Act.
    const result = RecordVersionHash.ofRecord(RNoContentRecord, record);

    // Assert.
    expect(result).toBe(record.version!.hash);
  });
});
