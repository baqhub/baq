import {Schema} from "@baqhub/sdk";
import {expect, test} from "vitest";
import {formatCode} from "../formatter.js";
import {schemaToTs} from "../schemaToTs.js";

test("boolean schema", async () => {
  // Prepare.
  const schema: Schema = {
    type: "boolean",
  };

  // Act.
  const schemaString = await formatCode(schemaToTs(schema));

  // Assert.
  expect(schemaString).toMatchInlineSnapshot(`
    "export type Type = boolean;
    "
  `);
});

test("boolean schema with enum", async () => {
  // Prepare.
  const schema: Schema = {
    type: "boolean",
    enum: [false],
  };

  // Act.
  const schemaString = await formatCode(schemaToTs(schema));

  // Assert.
  expect(schemaString).toMatchInlineSnapshot(`
    "export type Type = false;
    "
  `);
});

test("string schema with enum", async () => {
  // Prepare.
  const schema: Schema = {
    type: "string",
    enum: ["hello", "bye"],
  };

  // Act.
  const schemaString = await formatCode(schemaToTs(schema));

  // Assert.
  expect(schemaString).toMatchInlineSnapshot(`
    "export type Type = "hello" | "bye";
    "
  `);
});

test("object schema", async () => {
  // Prepare.
  const schema: Schema = {
    type: "object",
    properties: {
      firstName: {type: "string"},
      lastName: {type: "string"},
    },
  };

  // Act.
  const schemaString = await formatCode(schemaToTs(schema));

  // Assert.
  expect(schemaString).toMatchInlineSnapshot(`
    "export type Type = { firstName: string; lastName: string };
    "
  `);
});

test("nested object schema", async () => {
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
  const schemaString = await formatCode(schemaToTs(schema));

  // Assert.
  expect(schemaString).toMatchInlineSnapshot(`
    "export type Type = {
      name: string;
      dateOfBirth: { year: number; month: number; day: number };
    };
    "
  `);
});

test("array schema", async () => {
  // Prepare.
  const schema: Schema = {
    type: "array",
    items: {type: "string"},
  };

  // Act.
  const schemaString = await formatCode(schemaToTs(schema));

  // Assert.
  expect(schemaString).toMatchInlineSnapshot(`
    "export type Type = ReadonlyArray<string>;
    "
  `);
});

test("ref schema", async () => {
  // Prepare.
  const schema: Schema = {
    definitions: {
      name: {type: "string"},
    },
    type: "ref",
    ref: "name",
  };

  // Act.
  const schemaString = await formatCode(schemaToTs(schema));

  // Assert.
  expect(schemaString).toMatchInlineSnapshot(`
    "export namespace RefName {
      export type Type = string;
    }

    export type Type = RefName.Type;
    "
  `);
});

test("nested ref schema", async () => {
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
  const schemaString = await formatCode(schemaToTs(schema));

  // Assert.
  expect(schemaString).toMatchInlineSnapshot(`
    "export namespace RefName {
      export type Type = string;
    }

    export namespace PropProp1 {
      export namespace RefName {
        export type Type = number;
      }

      export type Type = { subProp1: RefName.Type };
    }

    export type Type = { prop1: PropProp1.Type; prop2: RefName.Type };
    "
  `);
});

test("union schema", async () => {
  // Prepare.
  const schema: Schema = {
    type: "union",
    schemas: [
      {type: "object", properties: {name: {type: "string"}}},
      {type: "int"},
    ],
  };

  // Act.
  const schemaString = await formatCode(schemaToTs(schema));

  // Assert.
  expect(schemaString).toMatchInlineSnapshot(`
    "export type Type = { name: string } | number;
    "
  `);
});

test("tag link schema with enum", async () => {
  // Prepare.
  const schema: Schema = {
    type: "tag_link",
    enum: ["hello", "bye"],
  };

  // Act.
  const schemaString = await formatCode(schemaToTs(schema));

  // Assert.
  expect(schemaString).toMatchInlineSnapshot(`
    "export type Type = TagLink<"hello"> | TagLink<"bye">;
    "
  `);
});
