"use client";

import { useLocale } from "@/components/LocaleProvider";

export function LanguageToggle() {
  const { locale, setLocale, t } = useLocale();

  return (
    <div
      aria-label={t("Language")}
      className="portal-language-toggle"
    >
      <button
        aria-pressed={locale === "en"}
        onClick={() => setLocale("en")}
        type="button"
      >
        EN
      </button>
      <button
        aria-pressed={locale === "ja"}
        onClick={() => setLocale("ja")}
        type="button"
      >
        JP
      </button>
    </div>
  );
}
