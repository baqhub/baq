import prettier from "prettier";
import organizeImports from "prettier-plugin-organize-imports";

export async function formatCode(code: string, path?: string) {
  const baseOptions = (path && (await prettier.resolveConfig(path))) || {};
  return prettier.format(code, {
    ...baseOptions,
    parser: "typescript",
    plugins: [organizeImports],
  });
}
