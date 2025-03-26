import {describe, expect, test} from "vitest";
import * as IO from "../io.js";
import {JSONPointer} from "../jsonPointer.js";

describe("find()", () => {
  test("find nothing in empty object", () => {
    // Prepare.
    const type = IO.string;
    const obj = {};
    const expected = undefined;

    // Act.
    const actual = JSONPointer.find(type, obj, "/test");

    // Assert.
    expect(actual).toEqual(expected);
  });

  test("find string at path", () => {
    // Prepare.
    const type = IO.string;
    const obj = {prop1: "hello"};
    const expected = "hello";

    // Act.
    const actual = JSONPointer.find(type, obj, "/prop1");

    // Assert.
    expect(actual).toEqual(expected);
  });

  test("find string at path in array", () => {
    // Prepare.
    const type = IO.string;
    const obj = {prop1: ["hello"]};
    const expected = "hello";

    // Act.
    const actual = JSONPointer.find(type, obj, "/prop1/0");

    // Assert.
    expect(actual).toEqual(expected);
  });

  test("find string at path in object in array", () => {
    // Prepare.
    const type = IO.string;
    const obj = {prop1: [{prop2: "hello"}]};
    const expected = "hello";

    // Act.
    const actual = JSONPointer.find(type, obj, "/prop1/0/prop2");

    // Assert.
    expect(actual).toEqual(expected);
  });
});
