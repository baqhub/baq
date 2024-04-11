import localFont from "next/font/local";

export const inter = localFont({
  src: [
    {
      path: "./inter-italic-3-19.woff2",
      style: "italic",
      weight: "100 900",
    },
    {
      path: "./inter-roman-3-19.woff2",
      style: "normal",
      weight: "100 900",
    },
  ],
  display: "swap",
  variable: "--font-inter",
});

export const firaCode = localFont({
  src: "./firacode-6-2.woff2",
  weight: "300 700",
  style: "normal",
  variable: "--font-firacode",
});
