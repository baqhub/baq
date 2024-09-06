import {render} from "@testing-library/react";
import {describe, expect, test} from "vitest";
import {DateServicesProvider} from "../dateServicesProvider.js";
import {MixedDateFormatter} from "../mixedDateFormatter.js";

describe("<MixedDateFormatter>", () => {
  function renderMixedDateFormatter(now: Date, value: Date) {
    const {container} = render(
      <DateServicesProvider locale="en-us" timeZone="UTC">
        <MixedDateFormatter now={now} value={value} />
      </DateServicesProvider>
    );

    return container;
  }

  test("now", () => {
    // Prepare.
    const now = new Date("2024-01-03T01:01:01.000Z");
    const value = new Date("2024-01-03T01:01:01.000Z");

    // Act.
    const result = renderMixedDateFormatter(now, value);

    // Assert.
    expect(result).toMatchInlineSnapshot(`
      <div>
        Now
      </div>
    `);
  });

  test("minutes", () => {
    // Prepare.
    const now = new Date("2024-01-03T01:05:01.000Z");
    const value = new Date("2024-01-03T01:01:01.000Z");

    // Act.
    const result = renderMixedDateFormatter(now, value);

    // Assert.
    expect(result).toMatchInlineSnapshot(`
      <div>
        4 min. ago
      </div>
    `);
  });

  test("today", () => {
    // Prepare.
    const now = new Date("2024-01-03T03:01:01.000Z");
    const value = new Date("2024-01-03T01:01:01.000Z");

    // Act.
    const result = renderMixedDateFormatter(now, value);

    // Assert.
    expect(result).toMatchInlineSnapshot(`
      <div>
        1:01 AM
      </div>
    `);
  });

  test("yesterday", () => {
    // Prepare.
    const now = new Date("2024-01-04T01:01:01.000Z");
    const value = new Date("2024-01-03T01:01:01.000Z");

    // Act.
    const result = renderMixedDateFormatter(now, value);

    // Assert.
    expect(result).toMatchInlineSnapshot(`
      <div>
        Yesterday
      </div>
    `);
  });

  test("day of week", () => {
    // Prepare.
    const now = new Date("2024-01-06T01:01:01.000Z");
    const value = new Date("2024-01-03T01:01:01.000Z");

    // Act.
    const result = renderMixedDateFormatter(now, value);

    // Assert.
    expect(result).toMatchInlineSnapshot(`
      <div>
        Wednesday
      </div>
    `);
  });

  test("date", () => {
    // Prepare.
    const now = new Date("2024-01-20T01:01:01.000Z");
    const value = new Date("2024-01-03T01:01:01.000Z");

    // Act.
    const result = renderMixedDateFormatter(now, value);

    // Assert.
    expect(result).toMatchInlineSnapshot(`
      <div>
        1/3/2024
      </div>
    `);
  });
});
