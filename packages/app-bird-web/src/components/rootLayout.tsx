import {Outlet, ScrollRestoration} from "@tanstack/react-router";
import {FC} from "react";

export const RootLayout: FC = () => {
  return (
    <>
      <ScrollRestoration />
      <Outlet />
    </>
  );
};
