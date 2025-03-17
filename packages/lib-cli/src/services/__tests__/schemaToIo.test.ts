import {Schema} from "@baqhub/sdk";
import {expect, test} from "vitest";
import {formatCode} from "../formatter.js";
import {schemaToIo} from "../schemaToIo.js";

test("boolean schema", async () => {
  // Prepare.
  const schema: Schema = {
    type: "boolean",
  };

  // Act.
  const schemaString = await formatCode(schemaToIo(schema));

  // Assert.
  expect(schemaString).toMatchInlineSnapshot(`
    "SchemaIO.boolean();
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
  const schemaString = await formatCode(schemaToIo(schema));

  // Assert.
  expect(schemaString).toMatchInlineSnapshot(`
    "IO.literal(false);
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
  const schemaString = await formatCode(schemaToIo(schema));

  // Assert.
  expect(schemaString).toMatchInlineSnapshot(`
    "IO.union([IO.literal("hello"), IO.literal("bye")]);
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
  const schemaString = await formatCode(schemaToIo(schema));

  // Assert.
  expect(schemaString).toMatchInlineSnapshot(`
    "IO.object({ firstName: SchemaIO.string(), lastName: SchemaIO.string() });
    "
  `);
});

test("object schema with optional property", async () => {
  // Prepare.
  const schema: Schema = {
    type: "object",
    properties: {
      firstName: {type: "string"},
      lastName: {type: "string", optional: true},
    },
  };

  // Act.
  const schemaString = await formatCode(schemaToIo(schema));

  // Assert.
  expect(schemaString).toMatchInlineSnapshot(`
    "SchemaIO.object(
      { firstName: SchemaIO.string() },
      { lastName: SchemaIO.string() },
    );
    "
  `);
});

test("object schema with removed property", async () => {
  // Prepare.
  const schema: Schema = {
    type: "object",
    properties: {
      firstName: {type: "string"},
      lastName: {type: "string", removed: true},
    },
  };

  // Act.
  const schemaString = await formatCode(schemaToIo(schema));

  // Assert.
  expect(schemaString).toMatchInlineSnapshot(`
    "IO.object({ firstName: SchemaIO.string() });
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
  const schemaString = await formatCode(schemaToIo(schema));

  // Assert.
  expect(schemaString).toMatchInlineSnapshot(`
    "IO.object({
      name: SchemaIO.string(),
      dateOfBirth: IO.object({
        year: SchemaIO.int(),
        month: SchemaIO.int(),
        day: SchemaIO.int(),
      }),
    });
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
  const schemaString = await formatCode(schemaToIo(schema));

  // Assert.
  expect(schemaString).toMatchInlineSnapshot(`
    "(() => {
      const RRefName: IO.RType<RefName.Type> = IO.recursion("Name", () =>
        SchemaIO.string(),
      );

      return RRefName;
    })();
    "
  `);
});

test("nested ref schema with shadowing", async () => {
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
  const schemaString = await formatCode(schemaToIo(schema));

  // Assert.
  expect(schemaString).toMatchInlineSnapshot(`
    "(() => {
      const RRefName: IO.RType<RefName.Type> = IO.recursion("Name", () =>
        SchemaIO.string(),
      );

      return IO.object({
        prop1: (() => {
          const RRefName: IO.RType<PropProp1.RefName.Type> = IO.recursion(
            "Name",
            () => SchemaIO.int(),
          );

          return IO.object({ subProp1: RRefName });
        })(),
        prop2: RRefName,
      });
    })();
    "
  `);
});

test("record link schema", async () => {
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
  const schemaString = await formatCode(schemaToIo(schema));

  // Assert.
  expect(schemaString).toMatchInlineSnapshot(`
    "RecordLink.ioOf("types.domain.com", "f4d24f80bfc44957a49ab2df98380b1d");
    "
  `);
});
