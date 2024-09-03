import {defaultImport} from "default-import";
import slugifyBase from "slugify";
const slugifyPackage = defaultImport(slugifyBase);

export function slugify(text: string) {
  return slugifyPackage(text, {lower: true, strict: true});
}

export function dateToString(date: Date) {
  const month = date.toLocaleString("en-US", {month: "short"});
  const day = date.getDate();
  const year = date.getFullYear();

  return `${month} ${day} ${year}`;
}
