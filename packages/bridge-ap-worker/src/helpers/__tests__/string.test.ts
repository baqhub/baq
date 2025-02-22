import {describe, expect, test} from "vitest";
import {postTextToHtml} from "../string";

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
    expect(actual).toMatchInlineSnapshot(`"<p>Hi everyone!<br><br>How's it going?</p>"`);
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
