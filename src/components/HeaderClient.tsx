"use client";

import Link from "next/link";
import { ArrowRight, LogOut, Search, Shield, Shuffle } from "lucide-react";

import { signOut } from "@/app/actions/auth";
import { LanguageToggle } from "@/components/LanguageToggle";
import { LeftSidebar } from "@/components/LeftSidebar";
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
          className="portal-header-auth"
          pendingLabel="..."
          title={ja.logout}
        >
          <span>
            <LocaleText en="Logout" ja={ja.logout} />
          </span>
          <LogOut className="h-5 w-5" aria-hidden="true" />
        </SubmitButton>
      </form>
    );
  }

  return (
    <Link
      aria-label={ja.login}
      className="portal-header-auth"
      href="/login"
    >
      <LocaleText en="Login" ja={ja.login} />
      <ArrowRight className="h-5 w-5" aria-hidden="true" strokeWidth={2.5} />
    </Link>
  );
}

export function HeaderClient({ isAdmin, isLoggedIn, randomHref, searchIndex }: HeaderClientProps) {
  return (
    <>
      <header className="portal-header">
        <div className="portal-header-container">
          <div className="portal-header-start">
            <LeftSidebar isAdmin={isAdmin} randomHref={randomHref} />
            <Link
              aria-label="アニサーチ"
              className="portal-header-brand"
              href="/"
            >
              <span>アニ</span>
              <span className="bg-gradient-to-r from-violet-300 via-violet-500 to-cyan-300 bg-clip-text text-transparent">
                サーチ
              </span>
            </Link>

            <SearchOpenButton className="portal-header-search">
              <Search className="portal-header-search-icon" aria-hidden="true" strokeWidth={2.7} />
              <span className="portal-header-search-label" data-locale-en="Search anime..." data-locale-ja={ja.searchAnime}>
                Search anime...
              </span>
              <span className="portal-header-shortcut">
                <kbd>S</kbd>
                <span className="portal-header-shortcut-label">
                  <LocaleText en="Quick Access" ja={ja.quickAccess} />
                </span>
              </span>
            </SearchOpenButton>
          </div>
          <div className="portal-header-end">
            <div className="portal-header-quick">
              <Link
                className="portal-header-random"
                href={randomHref}
              >
                <Shuffle className="h-5 w-5" aria-hidden="true" strokeWidth={2.8} />
                <LocaleText en="Random" ja={ja.random} />
              </Link>

              <div className="portal-header-language">
                <LanguageToggle />
              </div>

              <div className="portal-header-spacer" aria-hidden="true" />
            </div>
            <div className="portal-header-account">
              <button
                className="portal-header-search-toggle"
                onClick={() => window.dispatchEvent(new Event("animemo:open-search"))}
                type="button"
                aria-label="Search"
              >
                <Search className="h-5 w-5" aria-hidden="true" strokeWidth={2.7} />
              </button>

              <div className="portal-header-theme">
                <ThemeToggle />
              </div>

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
          </div>
        </div>
      </header>
      <SearchModal items={searchIndex} />
    </>
  );
}
