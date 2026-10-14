"use client";

import Link from "next/link";
import { ArrowRight, LogIn, LogOut, Search, Shield, Shuffle } from "lucide-react";

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
          className="inline-flex h-9 w-9 items-center justify-center gap-2 text-sm font-medium text-secondary transition hover:text-sky-ink sm:w-auto sm:px-3"
          pendingLabel="..."
          title={ja.logout}
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only sm:not-sr-only">
            <LocaleText en="Logout" ja={ja.logout} />
          </span>
        </SubmitButton>
      </form>
    );
  }

  return (
    <Link
      aria-label={ja.login}
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center gap-2 bg-violet-600 text-sm font-medium text-white transition hover:bg-violet-500 sm:w-auto sm:px-4"
      href="/login"
    >
      <LogIn className="h-4 w-4 sm:hidden" aria-hidden="true" />
      <span className="hidden sm:inline"><LocaleText en="Login" ja={ja.login} /></span>
      <ArrowRight className="hidden h-5 w-5 sm:block" aria-hidden="true" />
    </Link>
  );
}

export function HeaderClient({ isAdmin, isLoggedIn, randomHref, searchIndex }: HeaderClientProps) {
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[55] h-[68px] bg-chrome">
        <div className="flex h-full items-center gap-2 pl-[60px] pr-3 sm:gap-3 sm:pl-[72px] lg:gap-5 xl:gap-8 xl:pr-6">
          <Link
            className="flex min-w-max shrink-0 items-center text-xl font-bold text-heading sm:text-[1.75rem]"
            href="/"
          >
            <span>アニ</span>
            <span className="bg-gradient-to-r from-violet-300 via-violet-500 to-cyan-300 bg-clip-text text-transparent">
              サーチ
            </span>
          </Link>

          <SearchOpenButton className="hidden h-9 min-w-0 max-w-[630px] flex-[0_1_630px] items-center gap-3 bg-field px-4 text-left text-sm font-medium text-muted transition hover:text-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-400 xl:inline-flex">
            <Search className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span className="truncate" data-locale-en="Search anime..." data-locale-ja={ja.searchAnime}>
              Search anime...
            </span>
            <span className="ml-auto inline-flex shrink-0 items-center gap-2 text-sm font-normal text-muted">
              <kbd className="grid h-[18px] w-[18px] place-items-center border border-stroke/40 text-xs">S</kbd>
              <LocaleText en="Quick Access" ja={ja.quickAccess} />
            </span>
          </SearchOpenButton>

          <Link
            className="hidden h-9 shrink-0 items-center gap-2 text-sm font-medium text-secondary transition hover:text-cyan-ink sm:inline-flex xl:ml-4 xl:mr-10"
            href={randomHref}
          >
            <Shuffle className="h-5 w-5" aria-hidden="true" />
            <LocaleText en="Random" ja={ja.random} />
          </Link>

          <div className="hidden shrink-0 sm:block">
            <LanguageToggle />
          </div>

          <div className="min-w-0 flex-1" />

          <button
            className="grid h-9 w-9 shrink-0 place-items-center text-secondary transition hover:text-heading xl:hidden"
            onClick={() => window.dispatchEvent(new Event("animemo:open-search"))}
            type="button"
            aria-label="Search"
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </button>

          <ThemeToggle />

          {isAdmin ? (
            <Link
              className="hidden h-9 w-9 shrink-0 items-center justify-center text-violet-ink transition hover:text-heading sm:inline-flex"
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
