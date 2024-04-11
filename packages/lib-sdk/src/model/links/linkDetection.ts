// import {flatMap, map, memoize} from "lodash-es";
// import {CustomError, never} from "../../helpers/customError.js";
// import {t} from "../../helpers/io.js";
// import {AnyRecord, RAnyRecord, RecordClass} from "../records/record.js";
// import {REntityLinkClass} from "./entityLink.js";
// import {JSONPath} from "jsonpath-plus";
// import {RRecordLinkClass} from "./recordLink.js";

// //
// // Model.
// //

// enum LinkType {
//   TAG = "TAG",
//   BLOB = "BLOB",
//   ENTITY = "ENTITY",
//   RECORD = "RECORD",
//   VERSION = "VERSION",
// }

// interface LinkDefinition {
//   type: LinkType;
//   path: string;
//   model: t.Any;
// }

// class UnsupportedTypeError extends CustomError {
//   constructor(typeName: string) {
//     super(`Unsupported io-ts type: ${typeName}`);
//   }
// }

// //
// // I/O.
// //

// function findRecordModel<R extends AnyRecord>(
//   model: t.Any,
//   record: R
// ): RecordClass<any, any> | undefined {
//   if (model instanceof RecordClass) {
//     return model;
//   }

//   if (model instanceof t.UnionType) {
//     return map(model.types, subModel => {
//       const recordSubModel = findRecordModel(subModel, record);
//       if (!recordSubModel?.type.is(record.type)) {
//         return undefined;
//       }

//       return recordSubModel;
//     }).find(isDefined);
//   }

//   throw new UnsupportedTypeError(model.name);
// }

// function findLinkDefinitions<T extends t.Any>(
//   model: T,
//   path: string
// ): ReadonlyArray<LinkDefinition> {
//   // Links.
//   if (model instanceof REntityLinkClass) {
//     return [{type: LinkType.ENTITY, path, model}];
//   }

//   if (model instanceof RRecordLinkClass) {
//     return [{type: LinkType.RECORD, path, model}];
//   }

//   // Base types.
//   if (model instanceof t.UndefinedType) {
//     return [];
//   }

//   if (model instanceof t.RefinementType || model instanceof t.ReadonlyType) {
//     return findLinkDefinitions(model.type, path);
//   }

//   if (model instanceof t.ArrayType || model instanceof t.ReadonlyArrayType) {
//     return findLinkDefinitions(model.type, `${path}[*]`);
//   }

//   if (model instanceof t.DictionaryType) {
//     throw new UnsupportedTypeError("DictionaryType");
//   }

//   // TODO: Union/intersection.
//   if (model instanceof t.UnionType || model instanceof t.IntersectionType) {
//     return flatMap(model.types, subModel =>
//       findLinkDefinitions(subModel, path)
//     );
//   }

//   if (model instanceof t.InterfaceType || model instanceof t.PartialType) {
//     return flatMap(model.props, (subModel, key) =>
//       findLinkDefinitions(subModel, `${path}['${key}']`)
//     );
//   }

//   return [];
// }

// const findLinkDefinitionsMemoized = memoize(findLinkDefinitions);

// function findLinkValue(definition: LinkDefinition, record: AnyRecord) {
//   const {type, path, model} = definition;
//   const recordValues: ReadonlyArray<any> = JSONPath({path, json: record});
// }

// export function detectLinks<R extends RAnyRecord>(
//   model: R,
//   record: t.TypeOf<R>
// ) {
//   const recordModel = findRecordModel(model, record);
//   if (!recordModel) {
//     return never();
//   }

//   const definitions = findLinkDefinitionsMemoized(recordModel, "$");
// }
