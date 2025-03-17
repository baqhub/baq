import {describe, expect, test} from "vitest";
import {AppRecord} from "../../recordTypes/appRecord.js";
import {EntityRecord} from "../../recordTypes/entityRecord.js";
import {SubscriptionRecord} from "../../recordTypes/subscriptionRecord.js";
import {Record} from "../record.js";
import {RecordPermissions} from "../recordPermissions.js";

describe("findLinks()", () => {
  test("find links in Subscription record", () => {
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

  test("find links in App record", () => {
    // Prepare.
    const date = new Date("2025-03-10T01:01:01.000Z");

    const record: AppRecord = {
      author: {entity: "author.host.com"},
      id: "d9f0eb28a5594fd09b1ebaef7c8cf0f9",
      source: "self",
      createdAt: date,
      receivedAt: undefined,
      version: undefined,
      type: AppRecord.type,
      content: {
        name: "My app",
        icon: {
          hash: "f51380bb4a2742ab8b5034ad471d3403d96264fcd3b744d89b9dc86cb6524bc7",
          name: "icon.png",
          type: "image/png",
          size: 1234,
        },
        uris: {
          redirect: "https://app.com",
        },
        scopeRequest: {
          read: [
            {
              entity: "types.baq.dev",
              recordId: "38fdbec0b0424ff3bb2168217c2b5e3a",
            },
            {
              entity: "types.baq.dev",
              recordId: "fed16df89b6440bcb8230ff994f117c0",
            },
          ],
        },
      },
      permissions: RecordPermissions.public,
      mode: "synced",
    };

    // Act.
    const links = Record.findLinks(AppRecord, record);

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
            "recordId": "58d114d7dcd24b1aa1ccbbccfe77634a",
            "versionHash": "df617207dd07be4efd1837ae5b364c018990868085663ac905dc1ba68c75e247",
          },
        },
        {
          "path": "$['content']['scope_request']['read'][*]",
          "type": "RECORD",
          "value": {
            "entity": "types.baq.dev",
            "recordId": "38fdbec0b0424ff3bb2168217c2b5e3a",
          },
        },
        {
          "path": "$['content']['scope_request']['read'][*]",
          "type": "RECORD",
          "value": {
            "entity": "types.baq.dev",
            "recordId": "fed16df89b6440bcb8230ff994f117c0",
          },
        },
        {
          "path": "$['content']['icon']",
          "type": "BLOB",
          "value": {
            "hash": "f51380bb4a2742ab8b5034ad471d3403d96264fcd3b744d89b9dc86cb6524bc7",
            "name": "icon.png",
            "type": "image/png",
          },
        },
      ]
    `);
  });
});
