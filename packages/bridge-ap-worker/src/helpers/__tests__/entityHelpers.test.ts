import {describe, expect, test} from "vitest";
import {ActorIdentity, entityToIdentity} from "../entityHelpers";

describe("entityToIdentity()", () => {
  const knownPairs: ReadonlyArray<[string, ActorIdentity | undefined]> = [
    [
      "quentez-mastodon-social.host.com",
      {
        handle: "quentez",
        server: "mastodon.social",
      },
    ],
    [
      "be-good-threads-net.host.com",
      {
        handle: "be.good",
        server: "threads.net",
      },
    ],
    [
      "be--good-threads-net.host.com",
      {
        handle: "be-good",
        server: "threads.net",
      },
    ],
    ["threads-net.host.com", undefined],
  ];

  test.each(knownPairs)("Parse entity: %s", (entity, expectedIdentity) => {
    // Act.
    const actualIdentity = entityToIdentity("host.com", entity);

    // Assert.
    expect(actualIdentity).toStrictEqual(expectedIdentity);
  });
});
