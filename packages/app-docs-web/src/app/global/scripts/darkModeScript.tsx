import {FC} from "react";

//
// Component.
//

export const DarkModeScript: FC = () => {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          const hasExistingTheme = "theme" in localStorage;
          const existingThemeSetting = String(localStorage.theme);

          if (
            existingThemeSetting === "dark" ||
            (!hasExistingTheme &&
              window.matchMedia("(prefers-color-scheme: dark)").matches)
          ) {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        `,
      }}
    />
  );
};
