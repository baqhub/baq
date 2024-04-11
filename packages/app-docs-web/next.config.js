/** @type {import('next').NextConfig} */
import mdx from "@next/mdx";
import {refractor} from "refractor/lib/common.js";
import {rehypePrismGenerator} from "rehype-prism-plus";
import smartypants from "remark-smartypants";
import cli from "./next/languageCli.js";

refractor.register(cli);

const withMdx = mdx({
  options: {
    remarkPlugins: [smartypants],
    rehypePlugins: [rehypePrismGenerator(refractor)],
  },
});

const nextConfig = withMdx({
  output: "export",
  distDir: "dist",
  images: {unoptimized: true},
  transpilePackages: ["@baqhub/*", "@baqhub/*"],
  webpack: config => {
    return {
      ...config,
      resolve: {
        ...config.resolve,
        extensionAlias: {
          ".js": [".js", ".ts"],
          ".jsx": [".jsx", ".tsx"],
        },
      },
    };
  },
});

export default nextConfig;
