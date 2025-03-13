import * as IO from "../../helpers/io.js";
import {AnyRecordLink} from "../links/recordLink.js";

//
// Model.
//

export type ObjectPropertySchema = Schema & {
  optional?: boolean;
  removed?: boolean;
};

interface ObjectSchema {
  type: "object";
  properties: {[K: string]: ObjectPropertySchema};
  strict?: boolean;
}

interface ArraySchema {
  type: "array";
  items: Schema;
  minItems?: number;
  maxItems?: number;
  distinctItems?: boolean;
}

interface RefSchema {
  type: "ref";
  ref: string;
}

interface RefNameSchema {
  type: "ref_name";
}

interface SelfSchema {
  type: "self";
}

interface SchemaSchema {
  type: "schema";
}

interface NeverSchema {
  type: "never";
}

interface UnionSchema {
  type: "union";
  schemas: ReadonlyArray<Schema>;
  strict?: boolean;
}

interface IntersectionSchema {
  type: "intersection";
  schemas: ReadonlyArray<Schema>;
}

interface MapSchema {
  type: "map";
  values: Schema;
}

interface BooleanSchema {
  type: "boolean";
  enum?: ReadonlyArray<boolean>;
}

interface StringSchema {
  type: "string";
  enum?: ReadonlyArray<string>;
  minLength?: number;
  maxLength?: number;
}

interface IntSchema {
  type: "int";
  enum?: ReadonlyArray<number>;
  min?: number;
  max?: number;
}

interface NumberSchema {
  type: "number";
  enum?: ReadonlyArray<number>;
  min?: number;
  max?: number;
}

interface TagLinkSchema {
  type: "tag_link";
  enum?: ReadonlyArray<string>;
  sortProperty?: boolean;
  minLength?: number;
  maxLength?: number;
}

interface BlobLinkSchema {
  type: "blob_link";
  maxSize?: number;
  contentTypes?: ReadonlyArray<string>;
}

type PermissionType = "read" | "write" | "notify";

interface EntityLinkSchema {
  type: "entity_link";
  minPermissions?: ReadonlyArray<PermissionType>;
}

interface RecordLinkSchema {
  type: "record_link";
  existential?: boolean;
  recordTypes?: ReadonlyArray<AnyRecordLink>;
}

interface VersionLinkSchema {
  type: "version_link";
  recordTypes?: ReadonlyArray<AnyRecordLink>;
}

type SchemaType =
  | ObjectSchema
  | ArraySchema
  | RefSchema
  | RefNameSchema
  | SelfSchema
  | SchemaSchema
  | NeverSchema
  | UnionSchema
  | IntersectionSchema
  | MapSchema
  | BooleanSchema
  | StringSchema
  | IntSchema
  | NumberSchema
  | TagLinkSchema
  | BlobLinkSchema
  | EntityLinkSchema
  | RecordLinkSchema
  | VersionLinkSchema;

export type Schema = SchemaType & {
  definitions?: {[K: string]: Schema};
  default?: unknown;
  description?: string;
};

//
// Runtime model.
//

const RObjectSchema: IO.Type<ObjectSchema> = IO.recursion("ObjectSchema", () =>
  IO.dualObject(
    {
      type: IO.literal("object"),
      properties: IO.record(
        IO.string,
        IO.intersection([
          IO.partialObject({
            optional: IO.boolean,
            removed: IO.boolean,
          }),
          RSchema,
        ])
      ),
    },
    {strict: IO.boolean}
  )
);

const RArraySchema: IO.Type<ArraySchema> = IO.recursion("ArraySchema", () =>
  IO.dualObject(
    {
      type: IO.literal("array"),
      items: RSchema,
    },
    {
      minItems: IO.number,
      maxItems: IO.number,
      distinctItems: IO.boolean,
    }
  )
);

const RRefSchema: IO.Type<RefSchema> = IO.recursion("RefSchema", () =>
  IO.object({type: IO.literal("ref"), ref: IO.string})
);

const RRefNameSchema: IO.Type<RefNameSchema> = IO.recursion(
  "RefNameSchema",
  () => IO.object({type: IO.literal("ref_name")})
);

const RSelfSchema: IO.Type<SelfSchema> = IO.recursion("SelfSchema", () =>
  IO.object({type: IO.literal("self")})
);

const RSchemaSchema: IO.Type<SchemaSchema> = IO.recursion("SchemaSchema", () =>
  IO.object({type: IO.literal("schema")})
);

const RNeverSchema: IO.Type<NeverSchema> = IO.recursion("NeverSchema", () =>
  IO.object({type: IO.literal("never")})
);

const RUnionSchema: IO.Type<UnionSchema> = IO.recursion("UnionSchema", () =>
  IO.dualObject(
    {type: IO.literal("union"), schemas: IO.readonlyArray(RSchema)},
    {strict: IO.boolean}
  )
);

const RIntersectionSchema: IO.Type<IntersectionSchema> = IO.recursion(
  "IntersectionSchema",
  () =>
    IO.object({
      type: IO.literal("intersection"),
      schemas: IO.readonlyArray(RSchema),
    })
);

const RMapSchema: IO.Type<MapSchema> = IO.recursion("MapSchema", () =>
  IO.object({type: IO.literal("map"), values: RSchema})
);

const RBooleanSchema: IO.Type<BooleanSchema> = IO.recursion(
  "BooleanSchema",
  () =>
    IO.dualObject(
      {type: IO.literal("boolean")},
      {enum: IO.readonlyArray(IO.boolean)}
    )
);

const RStringSchema: IO.Type<StringSchema> = IO.recursion("StringSchema", () =>
  IO.dualObject(
    {type: IO.literal("string")},
    {
      enum: IO.readonlyArray(IO.string),
      minLength: IO.number,
      maxLength: IO.number,
    }
  )
);

const RIntSchema: IO.Type<IntSchema> = IO.recursion("IntSchema", () =>
  IO.dualObject(
    {type: IO.literal("int")},
    {
      enum: IO.readonlyArray(IO.number),
      min: IO.number,
      max: IO.number,
    }
  )
);

const RNumberSchema: IO.Type<NumberSchema> = IO.recursion("NumberSchema", () =>
  IO.dualObject(
    {type: IO.literal("number")},
    {
      enum: IO.readonlyArray(IO.number),
      min: IO.number,
      max: IO.number,
    }
  )
);

const RTagLinkSchema: IO.Type<TagLinkSchema> = IO.recursion("TagLink", () =>
  IO.dualObject(
    {type: IO.literal("tag_link")},
    {
      enum: IO.readonlyArray(IO.string),
      sortProperty: IO.boolean,
      minLength: IO.number,
      maxLength: IO.number,
    }
  )
);

const RBlobLinkSchema: IO.Type<BlobLinkSchema> = IO.recursion("BlobLink", () =>
  IO.dualObject(
    {type: IO.literal("blob_link")},
    {maxSize: IO.number, contentTypes: IO.readonlyArray(IO.string)}
  )
);

const RPermissionType = IO.union([
  IO.literal("read"),
  IO.literal("write"),
  IO.literal("notify"),
]);

const REntityLinkSchema: IO.Type<EntityLinkSchema> = IO.recursion(
  "EntityLink",
  () =>
    IO.dualObject(
      {type: IO.literal("entity_link")},
      {minPermissions: IO.readonlyArray(RPermissionType)}
    )
);

const RRecordLinkSchema: IO.Type<RecordLinkSchema> = IO.recursion(
  "RecordLink",
  () =>
    IO.dualObject(
      {type: IO.literal("record_link")},
      {
        existential: IO.boolean,
        recordTypes: IO.readonlyArray(AnyRecordLink.io()),
      }
    )
);

const RVersionLinkSchema: IO.Type<VersionLinkSchema> = IO.recursion(
  "VersionLink",
  () =>
    IO.dualObject(
      {type: IO.literal("version_link")},
      {recordTypes: IO.readonlyArray(AnyRecordLink.io())}
    )
);

export const RSchema: IO.Type<Schema> = IO.recursion("Schema", () =>
  IO.intersection([
    IO.union([
      RObjectSchema,
      RArraySchema,
      RRefSchema,
      RRefNameSchema,
      RSelfSchema,
      RSchemaSchema,
      RNeverSchema,
      RUnionSchema,
      RIntersectionSchema,
      RMapSchema,
      RBooleanSchema,
      RStringSchema,
      RIntSchema,
      RNumberSchema,
      RTagLinkSchema,
      RBlobLinkSchema,
      REntityLinkSchema,
      RRecordLinkSchema,
      RVersionLinkSchema,
    ]),
    IO.partialObject({
      definitions: IO.record(IO.string, RSchema),
      default: IO.unknown,
      description: IO.string,
    }),
  ])
);
