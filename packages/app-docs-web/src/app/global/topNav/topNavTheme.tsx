"use client";

import {tw} from "@baqhub/ui/core/style.jsx";
import {MoonIcon, SunIcon} from "@heroicons/react/24/solid";
import {FC} from "react";

//
// Style.
//

const Layout = tw.button`
  shrink-0
  block
  p-0.5
  cursor-pointer

  text-zinc-700
  dark:text-zinc-200
  hover:text-amber-800
  dark:hover:text-amber-400
`;

const ThemeIcon = tw.div`
  w-[22px]
  h-[22px]
`;

const ThemeIconLight = tw(ThemeIcon)`
  dark:hidden
`;

const ThemeIconDark = tw(ThemeIcon)`
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
