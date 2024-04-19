/** @type {import('next').NextConfig} */
import bundleAnalyzer from "@next/bundle-analyzer";
import mdx from "@next/mdx";
import {refractor} from "refractor/lib/common.js";
import {rehypePrismGenerator} from "rehype-prism-plus";
import smartypants from "remark-smartypants";
import cli from "./next/languageCli.js";

refractor.register(cli);

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const withMdx = mdx({
  options: {
    remarkPlugins: [smartypants],
    rehypePlugins: [rehypePrismGenerator(refractor)],
  },
});

const nextConfig = withBundleAnalyzer(
  withMdx({
    output: "export",
    distDir: "dist",
    images: {unoptimized: true},
    transpilePackages: ["@baqhub/ui"],
    experimental: {
      optimizePackageImports: ["@baqhub/sdk", "@baqhub/sdk-react"],
    },
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
  })
);

export default nextConfig;
