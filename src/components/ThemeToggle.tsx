"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

import { getServerTheme, getTheme, setTheme, subscribeToTheme } from "@/lib/theme";

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeToTheme, getTheme, getServerTheme);
  const label = theme === "dark" ? "ライトテーマに切り替え" : "ダークテーマに切り替え";
  const Icon = theme === "dark" ? Sun : Moon;

  return (
    <button
      aria-label={label}
      aria-pressed={theme === "light"}
      className="grid h-9 w-9 shrink-0 place-items-center text-secondary transition hover:text-violet-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      title={label}
      type="button"
    >
      <Icon aria-hidden="true" className="h-[18px] w-[18px]" />
    </button>
  );
}
