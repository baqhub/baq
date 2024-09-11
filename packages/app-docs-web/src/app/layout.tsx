import {tw} from "@baqhub/ui/core/style.jsx";
import type {Metadata, Viewport} from "next";
import {FC, PropsWithChildren} from "react";
import twitterCardImage from "../docs/assets/twitterCard.jpg";
import {firaCode, inter} from "./fonts/fonts.js";
import {AutoRefresh} from "./global/autoRefresh.jsx";
import {DarkModeScript} from "./global/scripts/darkModeScript.jsx";
import {TopNav} from "./global/topNav/topNav.jsx";

import "@docsearch/css";
import {Constants} from "./global/constants.js";
import "./styles/index.css";

//
// Style.
//

const Background = tw.div`
  fixed
  -inset-y-80
  w-full

  bg-white
  dark:bg-zinc-800
`;

const Layout = tw.div`
  relative
  flex
  flex-col
`;

//
// Component.
//

export async function generateMetadata(): Promise<Metadata> {
  const defaultTitle = "BAQ | The Federated App Platform";
  return {
    title: {
      default: defaultTitle,
      template: "%s | BAQ",
    },
    description: "Build apps on the federated BAQ platform.",
    openGraph: {
      url: Constants.baseUrl,
    },
    twitter: {
      card: "summary",
      images: [
        {
          url: twitterCardImage.src,
          width: twitterCardImage.width,
          height: twitterCardImage.height,
          alt: defaultTitle,
        },
      ],
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    {color: "#d97706", media: "(prefers-color-scheme: light)"},
    {color: "#92400e", media: "(prefers-color-scheme: dark)"},
  ],
  maximumScale: 1,
  userScalable: false,
};

const RootLayout: FC<PropsWithChildren> = ({children}) => {
  return (
    <AutoRefresh>
      <html
        lang="en"
        className={`${inter.variable} ${firaCode.variable}`}
        suppressHydrationWarning
      >
        <body>
          <DarkModeScript />
          <Background />
          <Layout>
            <TopNav />
            {children}
          </Layout>
        </body>
      </html>
    </AutoRefresh>
  );
};

export default RootLayout;
