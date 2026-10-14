"use client";

import Link from "next/link";
import { Keyboard, LogIn, LogOut, Search, Shield, Shuffle } from "lucide-react";

import { signOut } from "@/app/actions/auth";
import { LanguageToggle } from "@/components/LanguageToggle";
import { SearchModal, SearchOpenButton, type SearchModalItem } from "@/components/SearchModal";
import { SubmitButton } from "@/components/SubmitButton";
import { ThemeToggle } from "@/components/ThemeToggle";

const ja = {
  admin: "管理",
  login: "ログイン",
  logout: "ログアウト",
  quickAccess: "クイックアクセス",
  random: "ランダム",
  searchAnime: "アニメを検索...",
};

type HeaderClientProps = {
  isAdmin: boolean;
  isLoggedIn: boolean;
  randomHref: string;
  searchIndex: SearchModalItem[];
};

function LocaleText({ en, ja: jaText }: { en: string; ja: string }) {
  return (
    <span data-locale-en={en} data-locale-ja={jaText}>
      {en}
    </span>
  );
}

function AuthButton({ isLoggedIn }: { isLoggedIn: boolean }) {
  if (isLoggedIn) {
    return (
      <form action={signOut} className="shrink-0">
        <SubmitButton
          className="inline-flex h-9 w-9 items-center justify-center gap-2 rounded-xl border border-line/10 bg-panel text-xs font-black text-secondary transition hover:border-sky-400/50 hover:bg-wash/5 hover:text-sky-ink xl:w-auto xl:px-3"
          pendingLabel="..."
          title={ja.logout}
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only xl:not-sr-only">
            <LocaleText en="Logout" ja={ja.logout} />
          </span>
        </SubmitButton>
      </form>
    );
  }

  return (
    <Link
      aria-label={ja.login}
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-xl border border-violet-300/[0.35] bg-violet-600 text-xs font-black text-white shadow-[0_0_24px_rgba(124,58,237,0.22)] transition hover:border-cyan-300/60 hover:bg-violet-500 sm:w-auto sm:px-3"
      href="/login"
    >
      <LogIn className="h-4 w-4" aria-hidden="true" />
      <span className="hidden sm:inline"><LocaleText en="Login" ja={ja.login} /></span>
    </Link>
  );
}

export function HeaderClient({ isAdmin, isLoggedIn, randomHref, searchIndex }: HeaderClientProps) {
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[55] h-[68px] border-b border-line/[0.08] bg-chrome/[0.98] portal-floating backdrop-blur-xl">
        <div className="flex h-full items-center gap-2 pl-[60px] pr-3 sm:gap-3 sm:pl-[76px] md:pl-[86px] lg:gap-5 lg:pr-5">
          <Link
            className="mr-auto flex min-w-max shrink-0 items-center text-xl font-black tracking-tight text-heading sm:mr-0 sm:text-[1.6rem]"
            href="/"
          >
            <span>アニ</span>
            <span className="bg-gradient-to-r from-violet-300 via-violet-500 to-cyan-300 bg-clip-text text-transparent">
              サーチ
            </span>
          </Link>

          <SearchOpenButton className="ml-2 hidden h-10 min-w-0 max-w-[630px] flex-1 items-center gap-3 rounded-lg border border-line/[0.06] bg-field px-4 text-left text-sm font-semibold text-muted shadow-inner shadow-stroke/10 transition hover:border-cyan-300/25 hover:text-secondary sm:inline-flex">
            <Search className="h-5 w-5 shrink-0 text-muted" aria-hidden="true" />
            <span className="truncate" data-locale-en="Search anime..." data-locale-ja={ja.searchAnime}>
              Search anime...
            </span>
            <span className="ml-auto hidden h-7 shrink-0 items-center gap-2 rounded-md border border-line/[0.08] bg-depth/[0.55] px-2 text-[0.68rem] font-bold text-muted lg:inline-flex">
              <Keyboard className="h-3.5 w-3.5" aria-hidden="true" />
              <LocaleText en="Quick Access" ja={ja.quickAccess} />
            </span>
          </SearchOpenButton>

          <button
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-line/10 bg-depth/60 text-secondary transition hover:border-cyan-300/40 hover:text-heading sm:hidden"
            onClick={() => window.dispatchEvent(new Event("animemo:open-search"))}
            type="button"
            aria-label="Search"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
          </button>

          <Link
            className="hidden h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-bold text-secondary transition hover:bg-wash/[0.04] hover:text-cyan-ink lg:inline-flex"
            href={randomHref}
          >
            <Shuffle className="h-4 w-4 text-secondary" aria-hidden="true" />
            <LocaleText en="Random" ja={ja.random} />
          </Link>

          <div className="hidden min-w-0 flex-1 lg:block" />

          <ThemeToggle />

          <div className="hidden shrink-0 sm:block">
            <LanguageToggle />
          </div>

          {isAdmin ? (
            <Link
              className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-400/[0.35] bg-violet-500/[0.15] text-violet-ink transition hover:border-violet-300/70 hover:bg-violet-500/25 sm:inline-flex"
              href="/admin"
              aria-label={ja.admin}
            >
              <Shield className="h-4 w-4" aria-hidden="true" />
            </Link>
          ) : null}

          <AuthButton isLoggedIn={isLoggedIn} />
        </div>
      </header>
      <SearchModal items={searchIndex} />
    </>
  );
}
