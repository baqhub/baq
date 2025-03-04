import {isDefined} from "@baqhub/sdk";
import {describe, expect, test} from "vitest";
import {
  ActorIdentity,
  entityToIdentity,
  identityToEntity,
} from "../../model/actorIdentity";

const pairs: ReadonlyArray<[string, ActorIdentity | undefined]> = [
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

describe("entityToIdentity()", () => {
  test.each(pairs)("Entity: %s", (entity, expectedIdentity) => {
    // Act.
    const actualIdentity = entityToIdentity("host.com", entity);

    // Assert.
    expect(actualIdentity).toStrictEqual(expectedIdentity);
  });
});

describe("identityToEntity()", () => {
  test.each(
    pairs
      .map(([e, i]) =>
        i ? ([`${i.handle}@${i.server}`, i, e] as const) : undefined
      )
      .filter(isDefined)
  )("Identity: %s", (_, identity, expectedEntity) => {
    // Act.
    const actualEntity = identityToEntity("host.com", identity);

    // Assert.
    expect(actualEntity).toBe(expectedEntity);
  });
});
