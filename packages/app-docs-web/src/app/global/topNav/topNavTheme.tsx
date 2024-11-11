"use client";

import {MoonIcon, SunIcon} from "@heroicons/react/24/solid";
import {FC} from "react";
import tiwi from "tiwi";

//
// Style.
//

const Layout = tiwi.button`
  shrink-0
  block
  p-0.5
  cursor-pointer

  text-zinc-700
  dark:text-zinc-200
  hover:text-amber-800
  dark:hover:text-amber-400
`;

const ThemeIcon = tiwi.div`
  w-[22px]
  h-[22px]
`;

const ThemeIconLight = tiwi(ThemeIcon)`
  dark:hidden
`;

const ThemeIconDark = tiwi(ThemeIcon)`
  hidden
  dark:block
`;

//
// Component.
//

export const TopNavTheme: FC = () => {
  const onClick = () => {
    const newTheme = document.documentElement.classList.contains("dark")
      ? "light"
      : "dark";

    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    localStorage.setItem("theme", newTheme);
  };

  return (
    <Layout type="button" onClick={onClick}>
      <ThemeIconLight>
        <SunIcon />
      </ThemeIconLight>
      <ThemeIconDark>
        <MoonIcon />
      </ThemeIconDark>
    </Layout>
  );
};
