"use client";

import {useRouter} from "next/navigation.js";
import {FC, PropsWithChildren, useEffect} from "react";

// Trick to enable fast-refresh on MDX file change.
// From: https://github.com/gaearon/overreacted.io/pull/797

const DevAutoRefresh: FC<PropsWithChildren> = ({children}) => {
  const router = useRouter();
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3001");
    ws.onmessage = event => {
      if (event.data === "refresh") {
        router.refresh();
      }
    };
    return () => {
      ws.close();
    };
  }, [router]);

  return children;
};

const ProdAutoRefresh: FC<PropsWithChildren> = ({children}) => {
  return children;
};

const isDev = process.env.NODE_ENV === "development";
export const AutoRefresh = isDev ? DevAutoRefresh : ProdAutoRefresh;
