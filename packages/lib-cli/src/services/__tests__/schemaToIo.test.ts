import {Schema} from "@baqhub/sdk";
import {expect, test} from "@jest/globals";
import {formatCode} from "../formatter.js";
import {schemaToIo} from "../schemaToIo.js";

test("boolean schema", () => {
  // Prepare.
  const schema: Schema = {
    type: "boolean",
  };

  // Act.
  const schemaString = formatCode(schemaToIo(schema));

  // Assert.
  expect(schemaString).toMatchInlineSnapshot(`
    "t.boolean;
    "
  `);
});

test("boolean schema with enum", () => {
  // Prepare.
  const schema: Schema = {
    type: "boolean",
    enum: [false],
  };

  // Act.
  const schemaString = formatCode(schemaToIo(schema));

  // Assert.
  expect(schemaString).toMatchInlineSnapshot(`
    "t.literal(false);
    "
  `);
});

test("string schema with enum", () => {
  // Prepare.
  const schema: Schema = {
    type: "string",
    enum: ["hello", "bye"],
  };

  // Act.
  const schemaString = formatCode(schemaToIo(schema));

  // Assert.
  expect(schemaString).toMatchInlineSnapshot(`
    "t.union([t.literal("hello"), t.literal("bye")]);
    "
  `);
});

test("object schema", () => {
  // Prepare.
  const schema: Schema = {
    type: "object",
    properties: {
      firstName: {type: "string"},
      lastName: {type: "string"},
    },
  };

  // Act.
  const schemaString = formatCode(schemaToIo(schema));

  // Assert.
  expect(schemaString).toMatchInlineSnapshot(`
    "object({ firstName: t.string, lastName: t.string });
    "
  `);
});

test("object schema with optional properties", () => {
  // Prepare.
  const schema: Schema = {
    type: "object",
    properties: {
      firstName: {type: "string"},
      lastName: {type: "string", optional: true},
    },
  };

  // Act.
  const schemaString = formatCode(schemaToIo(schema));

  // Assert.
  expect(schemaString).toMatchInlineSnapshot(`
    "t.intersection([
      object({ firstName: t.string }),
      partialObject({ lastName: t.string }),
    ]);
    "
  `);
});

test("nested object schema", () => {
  // Prepare.
  const schema: Schema = {
    type: "object",
    properties: {
      name: {type: "string"},
      dateOfBirth: {
        type: "object",
        properties: {
          year: {type: "int"},
          month: {type: "int"},
          day: {type: "int"},
        },
      },
    },
  };

  // Act.
  const schemaString = formatCode(schemaToIo(schema));

  // Assert.
  expect(schemaString).toMatchInlineSnapshot(`
    "object({
      name: t.string,
      dateOfBirth: object({ year: t.number, month: t.number, day: t.number }),
    });
    "
  `);
});

test("ref schema", () => {
  // Prepare.
  const schema: Schema = {
    definitions: {
      name: {type: "string"},
    },
    type: "ref",
    ref: "name",
  };

  // Act.
  const schemaString = formatCode(schemaToIo(schema));

  // Assert.
  expect(schemaString).toMatchInlineSnapshot(`
    "(() => {
      const RRefName: t.Type<RefName.Type> = t.recursion("Name", () => t.string);

      return RRefName;
    })();
    "
  `);
});

test("nested ref schema with shadowing", () => {
  // Prepare.
  const schema: Schema = {
    definitions: {
      name: {type: "string"},
    },
    type: "object",
    properties: {
      prop1: {
        definitions: {
          name: {type: "int"},
        },
        type: "object",
        properties: {
          subProp1: {type: "ref", ref: "name"},
        },
      },
      prop2: {type: "ref", ref: "name"},
    },
  };

  // Act.
  const schemaString = formatCode(schemaToIo(schema));

  // Assert.
  expect(schemaString).toMatchInlineSnapshot(`
    "(() => {
      const RRefName: t.Type<RefName.Type> = t.recursion("Name", () => t.string);

      return object({
        prop1: (() => {
          const RRefName: t.Type<PropProp1.RefName.Type> = t.recursion(
            "Name",
            () => t.number
          );

          return object({ subProp1: RRefName });
        })(),
        prop2: RRefName,
      });
    })();
    "
  `);
});

test("record link schema", () => {
  // Prepare.
  const schema: Schema = {
    type: "record_link",
    recordTypes: [
      {
        entity: "types.domain.com",
        recordId: "f4d24f80bfc44957a49ab2df98380b1d",
      },
    ],
  };

  // Act.
  const schemaString = formatCode(schemaToIo(schema));

  // Assert.
  expect(schemaString).toMatchInlineSnapshot(`
    "recordLinkOf("types.domain.com", "f4d24f80bfc44957a49ab2df98380b1d");
    "
  `);
});
