import {tw} from "@baqhub/ui/core/style.js";
import type {Metadata, Viewport} from "next";
import {FC, PropsWithChildren} from "react";
import {firaCode, inter} from "./fonts/fonts.js";
import {AutoRefresh} from "./global/autoRefresh.js";
import {DarkModeScript} from "./global/scripts/darkModeScript.js";
import {TopNav} from "./global/topNav/topNav.js";
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

export const metadata: Metadata = {
  title: {
    default: "BAQ Docs",
    template: "%s | BAQ Docs",
  },
  description: "Build apps on the federated BAQ platform.",
};

export const viewport: Viewport = {
  themeColor: [
    {color: "#d97706", media: "(prefers-color-scheme: light)"},
    {color: "#92400e", media: "(prefers-color-scheme: dark)"},
  ],
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
