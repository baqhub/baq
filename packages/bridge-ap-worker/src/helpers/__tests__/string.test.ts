import {describe, expect, test} from "vitest";
import {htmlToPostTextAndFacets, postTextToHtml} from "../string";

describe("postTextToHtml()", () => {
  test("Single line text", () => {
    // Prepare.
    const post = "Hi everyone!";

    // Act.
    const actual = postTextToHtml(post);

    // Assert.
    expect(actual).toMatchInlineSnapshot(`"<p>Hi everyone!</p>"`);
  });

  test("Multi line text", () => {
    // Prepare.
    const post = "Hi everyone!\nHow's it going?";

    // Act.
    const actual = postTextToHtml(post);

    // Assert.
    expect(actual).toMatchInlineSnapshot(
      `"<p>Hi everyone!<br>How's it going?</p>"`
    );
  });

  test("Multi paragraph text", () => {
    // Prepare.
    const post = "Hi everyone!\n\nHow's it going?";

    // Act.
    const actual = postTextToHtml(post);

    // Assert.
    expect(actual).toMatchInlineSnapshot(
      `"<p>Hi everyone!<br><br>How's it going?</p>"`
    );
  });

  test("Only link text", () => {
    // Prepare.
    const post = "https://www.google.com";

    // Act.
    const actual = postTextToHtml(post);

    // Assert.
    expect(actual).toMatchInlineSnapshot(
      `"<p><a href="https://www.google.com">https://www.google.com</a></p>"`
    );
  });

  test("Multi paragraph link text", () => {
    // Prepare.
    const post = "Hi\n\nGo visit https://www.google.com";

    // Act.
    const actual = postTextToHtml(post);

    // Assert.
    expect(actual).toMatchInlineSnapshot(
      `"<p>Hi<br><br>Go visit <a href="https://www.google.com">https://www.google.com</a></p>"`
    );
  });
});

describe("htmlToPostTextAndFacets()", () => {
  test("plain text", () => {
    // Prepare.
    const html = "Hi everyone!";

    // Act.
    const actual = htmlToPostTextAndFacets(html);

    // Assert.
    expect(actual).toMatchInlineSnapshot(`
      {
        "text": "Hi everyone!",
        "textFacets": [],
      }
    `);
  });

  test("html with new line", () => {
    // Prepare.
    const html = "Hi everyone!<br>How's it going?";

    // Act.
    const actual = htmlToPostTextAndFacets(html);

    // Assert.
    expect(actual).toMatchInlineSnapshot(`
      {
        "text": "Hi everyone!
      How's it going?",
        "textFacets": [],
      }
    `);
  });

  test("html with link", () => {
    // Prepare.
    const html =
      "Hi everyone! Go to <a href='https://google.com'>google.com</a>";

    // Act.
    const actual = htmlToPostTextAndFacets(html);

    // Assert.
    expect(actual).toMatchInlineSnapshot(`
      {
        "text": "Hi everyone! Go to google.com",
        "textFacets": [
          {
            "index": 19,
            "length": 10,
            "type": "web_link",
            "url": "https://google.com",
          },
        ],
      }
    `);
  });

  test("html with link with invisible span", () => {
    // Prepare.
    const html =
      "Hi everyone!" +
      "<br>" +
      "<a href='https://google.com/page/that/is/very/long'>" +
      "<span class='invisible'>https://</span>" +
      "<span class='ellipsis'>google.com/page</span>" +
      "<span class='invisible'>/that/is/very/long</span>" +
      "</a>";

    // Act.
    const actual = htmlToPostTextAndFacets(html);

    // Assert.
    expect(actual).toMatchInlineSnapshot(`
      {
        "text": "Hi everyone!
      google.com/page…",
        "textFacets": [
          {
            "index": 13,
            "length": 16,
            "type": "web_link",
            "url": "https://google.com/page/that/is/very/long",
          },
        ],
      }
    `);
  });

  test("html with link with invisible span after space", () => {
    // Prepare.
    const html =
      "Hi everyone! " +
      "<a href='https://google.com/page/that/is/very/long'>" +
      "<span class='invisible'>https://</span>" +
      "<span class='ellipsis'>google.com/page</span>" +
      "<span class='invisible'>/that/is/very/long</span>" +
      "</a>";

    // Act.
    const actual = htmlToPostTextAndFacets(html);

    // Assert.
    expect(actual).toMatchInlineSnapshot(`
      {
        "text": "Hi everyone! google.com/page…",
        "textFacets": [
          {
            "index": 13,
            "length": 16,
            "type": "web_link",
            "url": "https://google.com/page/that/is/very/long",
          },
        ],
      }
    `);
  });

  test("html with link in invisible span", () => {
    // Prepare.
    const html =
      "Hi everyone! " +
      "<span class='invisible'>" +
      "<a href='https://google.com'>google.com</a>" +
      "</span>" +
      "How are you?";

    // Act.
    const actual = htmlToPostTextAndFacets(html);

    // Assert.
    expect(actual).toMatchInlineSnapshot(`
      {
        "text": "Hi everyone! How are you?",
        "textFacets": [],
      }
    `);
  });
});
