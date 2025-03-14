import {describe, expect, test} from "vitest";
import {Facets} from "../facets.js";

describe("findAll()", () => {
  test("find no facets", () => {
    // Prepare.
    const text = "Hello everyone!";

    // Act.
    const actual = Facets.findAll(text);

    // Assert.
    expect(actual).toMatchInlineSnapshot(`[]`);
  });

  test("find single mention", () => {
    // Prepare.
    const entity = "user.baq.run";
    const mention = `@${entity}`;
    const text = `Hi ${mention}`;

    // Act.
    const actual = Facets.findAll(text);

    // Assert.
    expect(actual).toMatchInlineSnapshot(`
      [
        {
          "index": ${text.indexOf(mention)},
          "length": ${mention.length},
          "mention": {
            "entity": "${entity}",
          },
          "type": "mention",
        },
      ]
    `);
  });

  test("find single mention with no domain", () => {
    // Prepare.
    const entity = "user.baq.run";
    const mention = `@user`;
    const text = `Hi ${mention}`;

    // Act.
    const actual = Facets.findAll(text);

    // Assert.
    expect(actual).toMatchInlineSnapshot(`
      [
        {
          "index": ${text.indexOf(mention)},
          "length": ${mention.length},
          "mention": {
            "entity": "${entity}",
          },
          "type": "mention",
        },
      ]
    `);
  });

  test("find single mention with uppercase", () => {
    // Prepare.
    const entity = "user.baq.run";
    const mention = `@USER.BAQ.RUN`;
    const text = `Hi ${mention}`;

    // Act.
    const actual = Facets.findAll(text);

    // Assert.
    expect(actual).toMatchInlineSnapshot(`
      [
        {
          "index": ${text.indexOf(mention)},
          "length": ${mention.length},
          "mention": {
            "entity": "${entity}",
          },
          "type": "mention",
        },
      ]
    `);
  });

  test("find single mention after unicode", () => {
    // Prepare.
    const entity = "user.baq.run";
    const mention = `@${entity}`;
    const text = `𩸽定食 ${mention}`;

    // Act.
    const actual = Facets.findAll(text);

    // Assert.
    expect(actual).toMatchInlineSnapshot(`
      [
        {
          "index": 4,
          "length": ${mention.length},
          "mention": {
            "entity": "${entity}",
          },
          "type": "mention",
        },
      ]
    `);
  });

  test("find multiple mentions", () => {
    // Prepare.
    const entity1 = "user1.host.com";
    const mention1 = `@${entity1}`;
    const entity2 = "user2.host.com";
    const mention2 = `@${entity2}`;
    const text = `Hi ${mention1} and ${mention2}`;

    // Act.
    const actual = Facets.findAll(text);

    // Assert.
    expect(actual).toMatchInlineSnapshot(`
      [
        {
          "index": ${text.indexOf(mention1)},
          "length": ${mention1.length},
          "mention": {
            "entity": "${entity1}",
          },
          "type": "mention",
        },
        {
          "index": ${text.indexOf(mention2)},
          "length": ${mention2.length},
          "mention": {
            "entity": "${entity2}",
          },
          "type": "mention",
        },
      ]
    `);
  });

  test("find single link", () => {
    // Prepare.
    const url = "http://google.com";
    const text = `Go to ${url}`;

    // Act.
    const actual = Facets.findAll(text);

    // Assert.
    expect(actual).toMatchInlineSnapshot(`
      [
        {
          "index": ${text.indexOf(url)},
          "length": ${url.length},
          "type": "web_link",
          "url": "${url}",
        },
      ]
    `);
  });

  test("find single link after unicode", () => {
    // Prepare.
    const url = "http://google.com";
    const text = `𩸽定食 ${url}`;

    // Act.
    const actual = Facets.findAll(text);

    // Assert.
    expect(actual).toMatchInlineSnapshot(`
      [
        {
          "index": 4,
          "length": ${url.length},
          "type": "web_link",
          "url": "${url}",
        },
      ]
    `);
  });

  test("find link and mention", () => {
    // Prepare.
    const url = "http://google.com";
    const entity = "user.baq.run";
    const mention = `@${entity}`;
    const text = `Go to ${url} with ${mention}`;

    // Act.
    const actual = Facets.findAll(text);

    // Assert.
    expect(actual).toMatchInlineSnapshot(`
      [
        {
          "index": ${text.indexOf(url)},
          "length": ${url.length},
          "type": "web_link",
          "url": "${url}",
        },
        {
          "index": ${text.indexOf(mention)},
          "length": ${mention.length},
          "mention": {
            "entity": "${entity}",
          },
          "type": "mention",
        },
      ]
    `);
  });

  test("find mention and link", () => {
    // Prepare.
    const entity = "user.baq.run";
    const mention = `@${entity}`;
    const url = "http://google.com";
    const text = `Go with ${mention} to ${url}`;

    // Act.
    const actual = Facets.findAll(text);

    // Assert.
    expect(actual).toMatchInlineSnapshot(`
      [
        {
          "index": ${text.indexOf(mention)},
          "length": ${mention.length},
          "mention": {
            "entity": "${entity}",
          },
          "type": "mention",
        },
        {
          "index": ${text.indexOf(url)},
          "length": ${url.length},
          "type": "web_link",
          "url": "${url}",
        },
      ]
    `);
  });
});
