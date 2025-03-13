import {Schema, isDefined, unreachable} from "@baqhub/sdk";
import camelCase from "lodash/camelCase.js";
import identity from "lodash/identity.js";
import {pascalCase} from "../helpers/case.js";

export function toRefNamespaceName(refName: string) {
  return `Ref${pascalCase(refName)}`;
}

export function toPropNamespaceName(propName: string) {
  return `Prop${pascalCase(propName)}`;
}

export function toSchemaNamespaceName(index: number) {
  return `Schema${index}`;
}

function enumOrDefault<T>(
  enumValues: ReadonlyArray<T> | undefined,
  defaultType: string
): [ReadonlyArray<string>, string] {
  if (enumValues && enumValues.length > 0) {
    return [[], enumValues.map(v => JSON.stringify(v)).join(" | ")];
  }

  return [[], defaultType];
}

function valuesOrDefault<T>(
  values: ReadonlyArray<T> | undefined,
  defaultType: string
): [ReadonlyArray<string>, string] {
  if (values && values.length > 0) {
    return [[], values.join(" | ")];
  }

  return [[], defaultType];
}

enum SchemaResultMode {
  SIMPLE = "SIMPLE",
  COMPLEX = "COMPLEX",
}

export function schemaToTs(schema: Schema, name = "Type") {
  function combineSubSchemas(
    subSchemas: ReadonlyArray<Schema>,
    operator: string,
    wrapper: (t: string) => string = identity
  ): [ReadonlyArray<string>, string] {
    const subTypes = subSchemas.map(s => schemaToTsInternal(s));

    const subTypeNamespaces = subTypes
      .map(([mode, subType], index) => {
        if (mode === SchemaResultMode.SIMPLE) {
          return undefined;
        }

        const namespace = toSchemaNamespaceName(index);
        return `export namespace ${namespace} { ${subType} }`;
      })
      .filter(isDefined);

    const returnType = subTypes
      .map(([mode, subType], index) =>
        mode === SchemaResultMode.SIMPLE
          ? subType
          : `${toSchemaNamespaceName(index)}.Type`
      )
      .join(` ${operator} `);

    return [subTypeNamespaces, `(${wrapper(returnType)})`];
  }

  function schemaToTsInternal(
    schema: Schema,
    requestedMode?: SchemaResultMode,
    name = "Type"
  ): [SchemaResultMode, string] {
    const definitions = Object.entries(schema.definitions || {}).map(
      ([key, subSchema]) => {
        const [, subType] = schemaToTsInternal(
          subSchema,
          SchemaResultMode.COMPLEX
        );

        return `export namespace ${toRefNamespaceName(key)} { ${subType} }`;
      }
    );

    const [subTypes, returnType] = ((): [ReadonlyArray<string>, string] => {
      switch (schema.type) {
        case "object": {
          const subTypes = Object.entries(schema.properties)
            .map(([key, subSchema]) => {
              if (subSchema.removed) {
                return undefined;
              }

              return [key, subSchema, schemaToTsInternal(subSchema)] as const;
            })
            .filter(isDefined);

          const subSchemas = subTypes
            .map(([key, , [mode, subType]]) => {
              if (mode === SchemaResultMode.SIMPLE) {
                return undefined;
              }

              const namespace = toPropNamespaceName(key);
              return `export namespace ${namespace} { ${subType} }`;
            })
            .filter(isDefined);

          const returnType = subTypes
            .map(([key, subSchema, [mode, subType]]) => {
              if (subSchema.removed) {
                return undefined;
              }

              const optionalSign = subSchema.optional ? "?" : "";
              const propType =
                mode === SchemaResultMode.SIMPLE
                  ? subType
                  : `${toPropNamespaceName(key)}.Type`;

              const description = subSchema.description?.trim();
              if (!description) {
                return `${camelCase(key)}${optionalSign}: ${propType};`;
              }

              return `
                /** ${description} */
                ${camelCase(key)}${optionalSign}: ${propType};
              `;
            })
            .filter(isDefined)
            .join("");

          return [subSchemas, `{${returnType}}`];
        }

        case "array": {
          const [mode, itemsType] = schemaToTsInternal(schema.items);

          if (mode === SchemaResultMode.SIMPLE) {
            return [[], `ReadonlyArray<${itemsType}>`];
          }

          return [
            [`export namespace Items { ${itemsType} }`],
            "ReadonlyArray<Items.Type>",
          ];
        }

        case "ref":
          return [[], `${toRefNamespaceName(schema.ref)}.Type`];

        case "ref_name":
          return [[], "string"];

        case "self":
        case "schema":
          return [[], "unknown"];

        case "never":
          return [[], "never"];

        case "union": {
          const exclusiveWrapper = (t: string) => `ExclusiveUnion<${t}>`;
          const wrapper = schema.strict ? exclusiveWrapper : undefined;
          return combineSubSchemas(schema.schemas, "|", wrapper);
        }

        case "intersection":
          return combineSubSchemas(schema.schemas, "&");

        case "map": {
          const [mode, valuesType] = schemaToTsInternal(schema.values);

          if (mode === SchemaResultMode.SIMPLE) {
            return [[], `{[K: string]: ${valuesType}}`];
          }

          return [
            [`export namespace Values { ${valuesType} }`],
            "{[K: string]: Values.Type}",
          ];
        }

        case "boolean":
          return enumOrDefault(schema.enum, "boolean");

        case "string":
          return enumOrDefault(schema.enum, "string");

        case "int":
        case "number":
          return enumOrDefault(schema.enum, "number");

        case "tag_link": {
          const tagValues = schema.enum?.map(v => `TagLink<"${v}">`);
          return valuesOrDefault(tagValues, "AnyTagLink");
        }

        case "blob_link": {
          const types = schema.contentTypes?.map(v => `BlobLink<"${v}">`);
          return valuesOrDefault(types, "AnyBlobLink");
        }

        case "entity_link":
          return [[], "EntityLink"];

        case "record_link": {
          const recordTypes = schema.recordTypes?.map(
            v => `RecordLinkOf<"${v.entity}", "${v.recordId}">`
          );
          return valuesOrDefault(recordTypes, "AnyRecordLink");
        }

        case "version_link":
          throw new Error("Not supported.");

        default:
          unreachable(schema);
      }
    })();

    if (
      definitions.length === 0 &&
      subTypes.length === 0 &&
      requestedMode !== SchemaResultMode.COMPLEX
    ) {
      return [SchemaResultMode.SIMPLE, returnType];
    }

    return [
      SchemaResultMode.COMPLEX,
      `
        ${[...definitions, ""].join("\n\n")}\
        ${[...subTypes, ""].join("\n\n")}\
        export type ${name} = ${returnType};
      `,
    ];
  }

  const [, result] = schemaToTsInternal(schema, SchemaResultMode.COMPLEX, name);
  return result;
}
