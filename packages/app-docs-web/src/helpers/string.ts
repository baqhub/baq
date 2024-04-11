import {defaultImport} from "default-import";
import slugifyBase from "slugify";
const slugifyPackage = defaultImport(slugifyBase);

export function slugify(text: string) {
  return slugifyPackage(text, {lower: true, strict: true});
}
