import {isDefined, Str} from "@baqhub/sdk";
import {multi, tokenize} from "linkifyjs";
import {PostRecordContent} from "../baq/postRecord.js";
import {normalizeEntity} from "./entity.js";

//
// Types and constants.
//

export type TextFacet = Exclude<
  Extract<PostRecordContent, {text: string}>["textFacets"],
  undefined
>[number];

// Matches mentions in the text.
// Based on https://github.com/regexhq/mentions-regex.
const regexMention =
  /(?:^|[^a-zA-Z0-9_@!@#$%&*])(?:(?:@|@)(?!\/))([a-zA-Z0-9/_.]+)(?:\b(?!@|@)|$)/g;

const defaultScheme = "https";

//
// Helpers.
//

function findAll(text: string): ReadonlyArray<TextFacet> {
  // Links.
  const linkFacets = tokenize(text).map((token): TextFacet | undefined => {
    const tokenValue = token.v;

    if (
      !(token instanceof multi.Url) ||
      token.toHref(defaultScheme) !== tokenValue
    ) {
      return undefined;
    }

    return {
      index: Str.unicodeIndex(text, token.startIndex()),
      length: Str.unicodeLength(tokenValue),
      type: "web_link",
      url: token.toHref(defaultScheme),
    };
  });

  // Mentions.
  const mentionMatches = text.matchAll(regexMention);
  const mentionFacets = [...mentionMatches].map(
    (match): TextFacet | undefined => {
      const entityText = match[1];
      if (!entityText || !isDefined(match.index)) {
        return undefined;
      }

      const index = match.index + match[0].indexOf("@");
      const unicodeIndex = Str.unicodeIndex(text, index);
      const unicodeLength = Str.unicodeLength("@" + entityText);

      return {
        index: unicodeIndex,
        length: unicodeLength,
        type: "mention",
        mention: {entity: normalizeEntity(entityText)},
      };
    }
  );

  return [...linkFacets, ...mentionFacets]
    .filter(isDefined)
    .toSorted((f1, f2) => f1.index - f2.index);
}

export const Facets = {
  findAll,
};
