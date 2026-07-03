"use client";

import { useEffect, useState } from "react";

type Locale = "en" | "ja";

function applyLocale(locale: Locale) {
  document.documentElement.lang = locale === "ja" ? "ja" : "en";
  document.documentElement.dataset.locale = locale;

  document.querySelectorAll<HTMLElement>("[data-locale-en][data-locale-ja]").forEach((node) => {
    const nextText = locale === "ja" ? (node.dataset.localeJa ?? "") : (node.dataset.localeEn ?? "");

    if (node.textContent !== nextText) {
      node.textContent = nextText;
    }
  });

  document
    .querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
      "[data-locale-placeholder-en][data-locale-placeholder-ja]",
    )
    .forEach((node) => {
      const nextPlaceholder =
        locale === "ja"
          ? (node.dataset.localePlaceholderJa ?? "")
          : (node.dataset.localePlaceholderEn ?? "");

      if (node.placeholder !== nextPlaceholder) {
        node.placeholder = nextPlaceholder;
      }
    });
}

export function LanguageToggle() {
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    const savedLocale = window.localStorage.getItem("animemo-locale");
    const initialLocale: Locale = savedLocale === "ja" ? "ja" : "en";
    setLocale(initialLocale);
    applyLocale(initialLocale);
  }, []);

  useEffect(() => {
    applyLocale(locale);

    const observer = new MutationObserver(() => {
      applyLocale(locale);
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, [locale]);

  function updateLocale(nextLocale: Locale) {
    setLocale(nextLocale);
    window.localStorage.setItem("animemo-locale", nextLocale);
    applyLocale(nextLocale);
  }

  return (
    <div
      aria-label="Language"
      className="flex shrink-0 items-center overflow-hidden rounded-md border border-violet-300/25 bg-[#050608] text-xs font-black text-slate-400 shadow-[0_0_20px_rgba(124,58,237,0.18)]"
    >
      <button
        aria-pressed={locale === "en"}
        className={
          locale === "en"
            ? "bg-[#e2e8f0] px-2.5 py-1.5 text-[#020617]"
            : "px-2.5 py-1.5 transition hover:bg-white/10 hover:text-slate-100"
        }
        onClick={() => updateLocale("en")}
        type="button"
      >
        EN
      </button>
      <button
        aria-pressed={locale === "ja"}
        className={
          locale === "ja"
            ? "bg-violet-400 px-2.5 py-1.5 text-[#020617]"
            : "px-2.5 py-1.5 transition hover:bg-white/10 hover:text-slate-100"
        }
        onClick={() => updateLocale("ja")}
        type="button"
      >
        JP
      </button>
    </div>
  );
}
