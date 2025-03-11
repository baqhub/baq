import {describe, expect, test} from "vitest";
import {EntityRecord} from "../../recordTypes/entityRecord.js";
import {SubscriptionRecord} from "../../recordTypes/subscriptionRecord.js";
import {Record} from "../record.js";
import {RecordPermissions} from "../recordPermissions.js";

describe("findLinks()", () => {
  test("Find links in Subscription record", () => {
    // Prepare.
    const date = new Date("2025-03-10T01:01:01.000Z");

    const record: SubscriptionRecord = {
      author: {entity: "author.host.com"},
      id: "d9f0eb28a5594fd09b1ebaef7c8cf0f9",
      source: "self",
      createdAt: date,
      receivedAt: undefined,
      version: undefined,
      type: SubscriptionRecord.type,
      content: {
        publisher: {entity: "publisher.host.com"},
        recordType: EntityRecord.link,
      },
      permissions: RecordPermissions.public,
      mode: "synced",
    };

    // Act.
    const links = Record.findLinks(SubscriptionRecord, record);

    // Assert.
    expect(links).toMatchInlineSnapshot(`
      [
        {
          "path": "$['author']",
          "type": "ENTITY",
          "value": {
            "entity": "author.host.com",
          },
        },
        {
          "path": "$['type']",
          "type": "VERSION",
          "value": {
            "entity": "system.baq.dev",
            "recordId": "138304ac29db432f838ad7b178f3cede",
            "versionHash": "3cfad57ce9ff81db1d6895ade87cf8c48b73f2fbd1a75a0230ecd67a78269d45",
          },
        },
        {
          "path": "$['content']['publisher']",
          "type": "ENTITY",
          "value": {
            "entity": "publisher.host.com",
          },
        },
        {
          "path": "$['content']['record_type']",
          "type": "RECORD",
          "value": {
            "entity": "system.baq.dev",
            "recordId": "80be958368dd414fabb9420647daa1ec",
          },
        },
      ]
    `);
  });
});
