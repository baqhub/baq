import {PostRecordContent} from "../baq/postRecord.js";

export const BirdConstants = {
  listPageSize: 20,
  authenticatedRefreshInterval: 60, // 1 min.
  unauthenticatedRefreshInterval: 2 * 60, // 2 min.
};

export type TextFacet = Exclude<
  Extract<PostRecordContent, {text: string}>["textFacets"],
  undefined
>[number];
