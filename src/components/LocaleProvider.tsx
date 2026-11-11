"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { translateUi, type Locale } from "@/lib/i18n";

const LocaleContext = createContext({
  locale: "ja" as Locale,
  setLocale: (_locale: Locale) => {},
  t: (text: string) => translateUi(text, "ja"),
});

function saveLocale(locale: Locale) {
  try { window.localStorage.setItem("animemo-locale", locale); } catch {}
  document.cookie = `animemo-locale=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

export function LocaleProvider({ initialLocale = "ja", children }: { initialLocale?: Locale; children: ReactNode }) {
  const [locale, setState] = useState<Locale>(initialLocale);
  const setLocale = useCallback((next: Locale) => { setState(next); saveLocale(next); }, []);
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("animemo-locale");
      if (saved === "en" || saved === "ja") setLocale(saved);
    } catch {}
    const sync = (event: StorageEvent) => {
      if (event.key === "animemo-locale" && (event.newValue === "en" || event.newValue === "ja")) setState(event.newValue);
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [setLocale]);
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dataset.locale = locale;
  }, [locale]);
  const value = useMemo(() => ({ locale, setLocale, t: (text: string) => translateUi(text, locale) }), [locale, setLocale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() { return useContext(LocaleContext); }
