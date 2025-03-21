import * as IO from "../../helpers/io.js";
import {SchemaIO} from "../../helpers/schemaIO.js";

//
// Model.
//

export const RTagLinkName = "TagLink";

function tagLink<T extends string>(value: T) {
  return IO.literal(value, RTagLinkName);
}

export type TagLink<T extends string> = T;

const RAnyTagLink = (() => {
  const baseType = SchemaIO.string({
    minLength: 1,
    maxLength: 100,
  });

  return new IO.RefinementType(
    RTagLinkName,
    baseType.is,
    baseType.validate,
    baseType.encode,
    baseType,
    () => true
  );
})();

export type AnyTagLink = string;

//
// Exports.
//

export const TagLink = {
  io: tagLink,
};

export const AnyTagLink = {
  io: () => RAnyTagLink,
};
