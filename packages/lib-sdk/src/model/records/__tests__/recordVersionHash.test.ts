import {describe, expect, test} from "@jest/globals";
import {EntityRecord, REntityRecord} from "../../recordTypes/entityRecord.js";
import {NoContentRecord, RNoContentRecord} from "../record.js";
import {RecordVersionHash} from "../recordVersionHash.js";

describe("record version hash", () => {
  test("types entity record", () => {
    // Prepare.
    const record: EntityRecord = {
      author: {entity: "types.baq.dev"},
      content: {
        previousEntities: [],
        profile: {name: "Protocol Types"},
        servers: [
          {
            endpoints: {
              auth: "https://baq.run/types/auth/{record_id}",
              events: "https://baq.run/api/types/events",
              newBlob: "https://baq.run/api/types/blobs",
              newNotification: "https://baq.run/api/types/notifications",
              newRecord: "https://baq.run/api/types/records",
              record: "https://baq.run/api/types/records/{entity}/{record_id}",
              recordBlob:
                "https://baq.run/api/types/records/{entity}/{record_id}/blobs/{blob_hash}/{file_name}",
              recordVersion:
                "https://baq.run/api/types/records/{entity}/{record_id}/versions/{version_hash}",
              recordVersionBlob:
                "https://baq.run/api/types/records/{entity}/{record_id}/versions/{version_hash}/blobs/{blob_hash}/{file_name}",
              recordVersions:
                "https://baq.run/api/types/records/{entity}/{record_id}/versions",
              records: "https://baq.run/api/types/records",
              serverInfo: "https://baq.run/api/types/server",
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
          "5869ed5eb6b565b92990ecfda31b4eb7e837489cb4799a534c00e3fd6ca756e9",
      },
      version: {
        author: {entity: "types.baq.dev"},
        createdAt: new Date("2024-04-01T00:00:00.000Z"),
        hash: "63900d671c7332c6d28f51478e1836d8c09f0128e971f40125632b1197e82155",
        parentHash:
          "5e90fff90d27c538c50099b94fb4349b3f949a2d70cd890be90e61030ff7b280",
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
