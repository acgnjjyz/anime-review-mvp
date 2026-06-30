import Link from "next/link";
import { UserRole } from "@prisma/client";
import { Film, Heart, LogIn, LogOut, Shield, Star, Trophy, UserRound } from "lucide-react";

import { signOut } from "@/app/actions/auth";
import { getCurrentUserProfile } from "@/lib/auth";
import { SubmitButton } from "@/components/SubmitButton";

const navItems = [
  { href: "/anime", label: "作品一覧", icon: Film },
  { href: "/ranking", label: "ランキング", icon: Trophy },
  { href: "/favorites", label: "お気に入り", icon: Heart },
  { href: "/mypage", label: "マイページ", icon: UserRound },
];

export async function Header() {
  const user = await getCurrentUserProfile();
  const isAdmin = user?.role === UserRole.ADMIN;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <Link className="flex items-center gap-2 text-xl font-black text-ink" href="/">
          <span className="grid h-9 w-9 place-items-center rounded bg-coral text-white">
            <Star className="h-5 w-5" aria-hidden="true" />
          </span>
          AniMemo
        </Link>

        <nav className="flex flex-wrap items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                className="inline-flex h-10 items-center gap-2 rounded border border-slate-200 px-3 text-sm font-medium text-slate-700 transition hover:border-mint hover:text-mint"
                href={item.href}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
          {isAdmin ? (
            <Link
              className="inline-flex h-10 items-center gap-2 rounded border border-slate-200 px-3 text-sm font-medium text-slate-700 transition hover:border-mint hover:text-mint"
              href="/admin"
            >
              <Shield className="h-4 w-4" aria-hidden="true" />
              管理
            </Link>
          ) : null}
          {user ? (
            <form action={signOut}>
              <SubmitButton
                className="inline-flex h-10 items-center gap-2 rounded bg-ink px-3 text-sm font-bold text-white transition hover:bg-slate-700"
                pendingLabel="ログアウト中..."
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                ログアウト
              </SubmitButton>
            </form>
          ) : (
            <Link
              className="inline-flex h-10 items-center gap-2 rounded bg-ink px-3 text-sm font-bold text-white transition hover:bg-slate-700"
              href="/login"
            >
              <LogIn className="h-4 w-4" aria-hidden="true" />
              ログイン
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
