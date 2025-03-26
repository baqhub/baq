import {isDefined, Str} from "@baqhub/sdk";
import {tokenize} from "linkifyjs";
import {CbObj, stripHtml} from "string-strip-html";
import {PostRecordContent} from "../baq/postRecord";
import {Constants} from "./constants";

function escapeText(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeHref(href: string) {
  return href.replace(/"/g, "&quot;");
}

export function postTextToHtml(text: string) {
  const result: string[] = [];
  const tokens = tokenize(text.replace(/\r\n|\r/g, "\n"));

  for (const token of tokens) {
    if (token.t === "nl") {
      result.push("<br>");
    } else if (!token.isLink) {
      result.push(escapeText(token.toString()));
    } else {
      const href = escapeHref(token.toHref());
      const content = escapeText(token.toString());
      result.push(`<a href="${href}">${content}</a>`);
    }
  }

  return `<p>${result.join("")}</p>`;
}

export type TextFacet = Exclude<
  Extract<PostRecordContent, {text: string}>["textFacets"],
  undefined
>[number];

interface PostLink {
  start: number;
  end: number;
  href: string;
}

export function htmlToPostTextAndFacets(html: string) {
  let nextLink: PostLink | undefined;
  let hasEllipsis = false;
  const invisibleRanges: [number, number, string | null | undefined][] = [];
  const links: PostLink[] = [];

  function cb({
    tag,
    proposedReturn,
    deleteFrom,
    deleteTo,
    insert,
    rangesArr,
  }: CbObj) {
    if (typeof deleteFrom !== "number" || typeof deleteTo !== "number") {
      rangesArr.push(proposedReturn);
      return;
    }

    // If we're in an invisible span.
    if (invisibleRanges.length > 0) {
      if (tag.name !== "span") {
        return;
      }

      if (tag.slashPresent && invisibleRanges.length > 1) {
        invisibleRanges.pop();
        return;
      }

      if (tag.slashPresent) {
        const first = invisibleRanges.pop()!;
        rangesArr.push(first[0], deleteTo, first[2]);
        return;
      }

      invisibleRanges.push([deleteFrom, deleteTo, insert]);
      return;
    }

    // Invisible span start.
    if (
      tag.name === "span" &&
      tag.attributes.some(a => a.name === "class" && a.value === "invisible")
    ) {
      invisibleRanges.push([deleteFrom, deleteTo, insert]);
      return;
    }

    // Link.
    if (tag.name === "a") {
      const index = rangesArr.ranges.reduce(
        (index, [from, to, ins]) => index - (to - from) + (ins?.length || 0),
        deleteFrom + (insert?.length || 0)
      );

      // Link start.
      const hrefAttribute = tag.attributes.find(a => a.name === "href");
      if (!tag.slashPresent && hrefAttribute && hrefAttribute.value) {
        nextLink = {
          start: index,
          end: 0,
          href: hrefAttribute.value,
        };
      }
      // Link end.
      else if (tag.slashPresent && nextLink) {
        links.push({
          ...nextLink,
          end: index + (hasEllipsis ? 1 : 0),
        });
      }

      const insertEllipsis = (() => {
        if (!tag.slashPresent || !hasEllipsis) {
          return insert;
        }

        return typeof insert === "string" ? insert + "…" : "…";
      })();

      rangesArr.push(deleteFrom, deleteTo, insertEllipsis);
      hasEllipsis = false;
      return;
    }

    // Span with "ellipsis" class.
    if (
      tag.name === "span" &&
      tag.attributes.some(a => a.name === "class" && a.value === "ellipsis")
    ) {
      hasEllipsis = true;
      rangesArr.push(deleteFrom, deleteTo, insert);
      return;
    }

    // Line break.
    if (tag.name === "br") {
      rangesArr.push(deleteFrom, deleteTo, "\n");
      return;
    }

    // Default behavior.
    rangesArr.push(deleteFrom, deleteTo, insert);
  }

  const {result} = stripHtml(html, {cb});
  const unicodeMaxLength = Str.jsLength(result, Constants.baqPostMaxLength);
  const text = result.slice(0, unicodeMaxLength);

  const textFacets = links
    .map((l): TextFacet | undefined => {
      const unicodeIndex = Str.unicodeIndex(text, l.start);
      const unicodeLength = Str.unicodeLength(text.slice(l.start, l.end));

      if (unicodeIndex + unicodeLength > Constants.baqPostMaxLength) {
        return undefined;
      }

      return {
        type: "web_link",
        index: unicodeIndex,
        length: unicodeLength,
        url: l.href,
      };
    })
    .filter(isDefined);

  return {text, textFacets};
}
