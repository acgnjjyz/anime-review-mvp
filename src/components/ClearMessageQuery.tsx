"use client";

import { useEffect } from "react";

type ClearMessageQueryProps = {
  enabled: boolean;
};

export function ClearMessageQuery({ enabled }: ClearMessageQueryProps) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const url = new URL(window.location.href);

    url.searchParams.delete("message");
    url.searchParams.delete("error");

    const nextUrl = `${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState(window.history.state, "", nextUrl);
  }, [enabled]);

  return null;
}
