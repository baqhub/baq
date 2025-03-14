import {
  ObjectPropertySchema,
  Schema,
  SchemaArrayOptions,
  SchemaIntOptions,
  SchemaNumberOptions,
  SchemaStringOptions,
  isDefined,
  unreachable,
} from "@baqhub/sdk";
import camelCase from "lodash/camelCase.js";
import isEmpty from "lodash/isEmpty.js";
import pickBy from "lodash/pickBy.js";
import {pascalCase} from "../helpers/case.js";
import {
  toPropNamespaceName,
  toRefNamespaceName,
  toSchemaNamespaceName,
} from "./schemaToTs.js";

function enumOrDefault<T>(
  enumValues: ReadonlyArray<T> | undefined,
  defaultType: string,
  options?: object
) {
  if (enumValues && enumValues.length > 0) {
    const types = enumValues.map(v => `IO.literal(${JSON.stringify(v)})`);
    return types.length > 1 ? `IO.union([${types.join(", ")}])` : types[0]!;
  }

  if (!options || isEmpty(pickBy(options, isDefined))) {
    return `${defaultType}()`;
  }

  return `${defaultType}(${JSON.stringify(options)})`;
}

function valuesOrDefault<T>(
  values: ReadonlyArray<T> | undefined,
  defaultType: string
) {
  if (values && values.length > 0) {
    return values.length > 1 ? `IO.union([${values.join(", ")}])` : values[0]!;
  }

  return defaultType;
}

export function schemaToIo(schema: Schema) {
  function schemaToIoInternal(path: string, schema: Schema): string {
    // Definitions.
    const definitions = Object.entries(schema.definitions || {})
      .map(([key, subSchema]) => {
        const typeName = `R${toRefNamespaceName(key)}`;
        const ioName = pascalCase(key);
        const newPath = `${path}${toRefNamespaceName(key)}.`;
        const subSchemaIo = schemaToIoInternal(newPath, subSchema);

        return `const ${typeName}: IO.RType<${newPath}Type> = IO.recursion("${ioName}", () => ${subSchemaIo})`;
      })
      .join("\n\n");

    // Schema.
    const returnType = ((): string => {
      switch (schema.type) {
        case "object": {
          const mapProperty = (
            key: string,
            subSchema: ObjectPropertySchema
          ) => {
            if (subSchema.removed) {
              return undefined;
            }

            const newPath = `${path}${toPropNamespaceName(key)}.`;
            return `${camelCase(key)}: ${schemaToIoInternal(
              newPath,
              subSchema
            )}`;
          };

          const requiredProperties = Object.entries(schema.properties)
            .map(([key, subSchema]) => {
              if (subSchema.optional) {
                return undefined;
              }

              return mapProperty(key, subSchema);
            })
            .filter(isDefined)
            .join(",");

          const optionalProperties = Object.entries(schema.properties)
            .map(([key, subSchema]) => {
              if (!subSchema.optional) {
                return undefined;
              }

              return mapProperty(key, subSchema);
            })
            .filter(isDefined)
            .join(",");

          if (optionalProperties.length === 0) {
            return `IO.object({${requiredProperties}})`;
          }

          if (requiredProperties.length === 0) {
            return `IO.partialObject({${optionalProperties}})`;
          }

          return `SchemaIO.object({${requiredProperties}}, {${optionalProperties}})`;
        }

        case "array": {
          const newPath = `${path}Items.`;
          const itemsSchema = schemaToIoInternal(newPath, schema.items);

          const options: SchemaArrayOptions = {
            minItems: schema.minItems,
            maxItems: schema.maxItems,
            distinctItems: schema.distinctItems,
          };

          if (isEmpty(pickBy(options, isDefined))) {
            return `SchemaIO.array(${itemsSchema})`;
          }

          return `SchemaIO.array(${itemsSchema}, ${JSON.stringify(options)})`;
        }

        case "ref":
          return `R${toRefNamespaceName(schema.ref)}`;

        case "ref_name":
          return "IO.string";

        case "self":
        case "schema":
          return "IO.unknown";

        case "never":
          return "IO.never";

        case "union": {
          const func = schema.strict ? "IO.exclusiveUnion" : "IO.union";
          const schemas = schema.schemas
            .map((subSchema, index) => {
              const newPath = `${path}${toSchemaNamespaceName(index)}.`;
              return schemaToIoInternal(newPath, subSchema);
            })
            .join(", ");

          return `${func}([${schemas}])`;
        }

        case "intersection": {
          const schemas = schema.schemas
            .map((subSchema, index) => {
              const newPath = `${path}${toSchemaNamespaceName(index)}.`;
              return schemaToIoInternal(newPath, subSchema);
            })
            .join(", ");

          return `IO.intersection([${schemas}])`;
        }

        case "map": {
          const newPath = `${path}Values.`;
          const valuesSchema = schemaToIoInternal(newPath, schema.values);
          return `IO.record(IO.string, ${valuesSchema})`;
        }

        case "boolean":
          return enumOrDefault(schema.enum, "SchemaIO.boolean");

        case "string": {
          const options: SchemaStringOptions = {
            minLength: schema.minLength,
            maxLength: schema.maxLength,
          };

          return enumOrDefault(schema.enum, `SchemaIO.string`, options);
        }

        case "int": {
          const options: SchemaIntOptions = {
            min: schema.min,
            max: schema.max,
          };

          return enumOrDefault(schema.enum, `SchemaIO.int`, options);
        }

        case "number": {
          const options: SchemaNumberOptions = {
            min: schema.min,
            max: schema.max,
          };

          return enumOrDefault(schema.enum, `SchemaIO.number`, options);
        }

        case "tag_link": {
          const tagValues = schema.enum?.map(v => `TagLink.io("${v}")`);
          return valuesOrDefault(tagValues, "AnyTagLink.io()");
        }

        case "blob_link": {
          const types = schema.contentTypes?.map(v => `BlobLink.io("${v}")`);
          return valuesOrDefault(types, "AnyBlobLink.io()");
        }

        case "entity_link":
          return "EntityLink.io()";

        case "record_link": {
          const recordTypes = schema.recordTypes?.map(
            v => `RecordLink.ioOf("${v.entity}", "${v.recordId}")`
          );
          return valuesOrDefault(recordTypes, "AnyRecordLink.io()");
        }

        case "version_link":
          throw new Error("Not supported.");

        default:
          unreachable(schema);
      }
    })();

    if (!definitions) {
      return returnType;
    }

    return `(() => {${definitions}\n\nreturn ${returnType};})()`;
  }

  return schemaToIoInternal("", schema);
}
