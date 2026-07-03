"use client";

import Link from "next/link";
import { Keyboard, LogIn, LogOut, Search, Shield, Shuffle } from "lucide-react";

import { signOut } from "@/app/actions/auth";
import { LanguageToggle } from "@/components/LanguageToggle";
import { SearchModal, SearchOpenButton, type SearchModalItem } from "@/components/SearchModal";
import { SubmitButton } from "@/components/SubmitButton";

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
          className="inline-flex h-9 w-9 items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#0b0b12] text-xs font-black text-slate-300 transition hover:border-sky-400/50 hover:bg-white/5 hover:text-sky-100 xl:w-auto xl:px-3"
          pendingLabel="..."
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          <span className="hidden xl:inline">
            <LocaleText en="Logout" ja={ja.logout} />
          </span>
        </SubmitButton>
      </form>
    );
  }

  return (
    <Link
      className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-xl border border-violet-300/35 bg-violet-600 px-3 text-xs font-black text-white shadow-[0_0_24px_rgba(124,58,237,0.22)] transition hover:border-cyan-300/60 hover:bg-violet-500"
      href="/login"
    >
      <LogIn className="h-4 w-4" aria-hidden="true" />
      <LocaleText en="Login" ja={ja.login} />
    </Link>
  );
}

export function HeaderClient({ isAdmin, isLoggedIn, randomHref, searchIndex }: HeaderClientProps) {
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[55] h-[68px] border-b border-white/[0.08] bg-[#171717]/98 shadow-[0_10px_34px_rgba(0,0,0,0.5)] backdrop-blur-xl">
        <div className="flex h-full items-center gap-3 pl-[76px] pr-3 md:pl-[86px] lg:gap-5 lg:pr-5">
          <Link
            className="flex min-w-max shrink-0 items-center text-[1.6rem] font-black tracking-tight text-white"
            href="/"
          >
            <span>アニ</span>
            <span className="bg-gradient-to-r from-violet-300 via-violet-500 to-cyan-300 bg-clip-text text-transparent">
              サーチ
            </span>
          </Link>

          <SearchOpenButton className="ml-2 hidden h-10 min-w-0 max-w-[630px] flex-1 items-center gap-3 rounded-lg border border-white/[0.06] bg-[#0d0d0f] px-4 text-left text-sm font-semibold text-slate-500 shadow-inner shadow-black/40 transition hover:border-cyan-300/25 hover:text-slate-200 sm:inline-flex">
            <Search className="h-5 w-5 shrink-0 text-slate-500" aria-hidden="true" />
            <span className="truncate" data-locale-en="Search anime..." data-locale-ja={ja.searchAnime}>
              Search anime...
            </span>
            <span className="ml-auto hidden h-7 shrink-0 items-center gap-2 rounded-md border border-white/[0.08] bg-black/55 px-2 text-[0.68rem] font-bold text-slate-500 lg:inline-flex">
              <Keyboard className="h-3.5 w-3.5" aria-hidden="true" />
              <LocaleText en="Quick Access" ja={ja.quickAccess} />
            </span>
          </SearchOpenButton>

          <button
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-black/60 text-slate-300 transition hover:border-cyan-300/40 hover:text-white sm:hidden"
            onClick={() => window.dispatchEvent(new Event("animemo:open-search"))}
            type="button"
            aria-label="Search"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
          </button>

          <Link
            className="hidden h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-bold text-slate-300 transition hover:bg-white/[0.04] hover:text-cyan-100 lg:inline-flex"
            href={randomHref}
          >
            <Shuffle className="h-4 w-4 text-slate-300" aria-hidden="true" />
            <LocaleText en="Random" ja={ja.random} />
          </Link>

          <div className="hidden min-w-0 flex-1 lg:block" />

          <div className="hidden shrink-0 sm:block">
            <LanguageToggle />
          </div>

          {isAdmin ? (
            <Link
              className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-400/35 bg-violet-500/15 text-violet-100 transition hover:border-violet-300/70 hover:bg-violet-500/25 sm:inline-flex"
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
