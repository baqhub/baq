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
      // Grab the existing rule that handles SVG imports
      const fileLoaderRule = config.module.rules.find(rule =>
        rule.test?.test?.(".svg")
      );

      config.module.rules.push(
        // Reapply the existing rule, but only for svg imports ending in ?url
        {
          ...fileLoaderRule,
          test: /\.svg$/i,
          resourceQuery: /url/, // *.svg?url
        },
        // Convert all other *.svg imports to React components
        {
          test: /\.svg$/i,
          issuer: fileLoaderRule.issuer,
          resourceQuery: {not: [...fileLoaderRule.resourceQuery.not, /url/]}, // exclude if *.svg?url
          use: [
            {
              loader: "@svgr/webpack",
              options: {
                dimensions: false,
                replaceAttrValues: {
                  "#FEFEFE": "currentColor",
                },
              },
            },
          ],
        }
      );

      // Modify the file loader rule to ignore *.svg, since we have it handled now.
      fileLoaderRule.exclude = /\.svg$/i;

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
