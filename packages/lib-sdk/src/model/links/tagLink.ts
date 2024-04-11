import * as IO from "../../helpers/io.js";
import {SchemaIO} from "../../helpers/schemaIO.js";

//
// Model.
//

function tagLink<T extends string>(value: T) {
  return IO.literal(value);
}

export type TagLink<T extends string> = T;

const RAnyTagLink = SchemaIO.string({
  minLength: 1,
  maxLength: 100,
});

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
