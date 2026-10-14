"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Film, Home, Search, Shield, Sparkles, Trophy, UserRound } from "lucide-react";

import { openSearchModal } from "@/components/SearchModal";

export type BottomDockItem = {
  href: string;
  kind: "home" | "anime" | "ranking" | "mypage" | "search" | "admin";
  labelEn: string;
  labelJa: string;
};

const iconMap = {
  home: Home,
  anime: Film,
  ranking: Trophy,
  mypage: UserRound,
  search: Search,
  admin: Shield,
} satisfies Record<BottomDockItem["kind"], typeof Home>;

function isActiveItem(
  item: BottomDockItem,
  pathname: string,
  searchParams: ReturnType<typeof useSearchParams>,
) {
  if (item.kind === "home") {
    return pathname === "/";
  }

  if (item.kind === "search") {
    return pathname === "/anime" && searchParams.get("dock") === "search";
  }

  if (item.kind === "anime") {
    return pathname.startsWith("/anime") && searchParams.get("dock") !== "search";
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function BottomDockClient({ items }: { items: BottomDockItem[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-3 z-50 px-3 sm:bottom-5 lg:hidden">
      <nav
        aria-label="Bottom navigation"
        className="pointer-events-auto mx-auto flex w-[calc(100vw-24px)] max-w-[680px] items-center justify-between gap-1 rounded-none border border-sky-300/25 bg-canvas/95 px-2 py-2 portal-floating backdrop-blur-2xl sm:w-auto sm:justify-center sm:gap-2 sm:px-3"
      >
        {items.map((item) => {
          const Icon = iconMap[item.kind];
          const isActive = item.kind === "search" ? false : isActiveItem(item, pathname, searchParams);
          const itemClass = isActive
            ? "group relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl border border-cyan-300/40 bg-gradient-to-br from-violet-500/30 via-blue-500/20 to-cyan-400/20 px-2 py-2 text-cyan-ink shadow-[0_0_28px_rgba(34,211,238,0.22)] transition sm:h-14 sm:min-w-20 sm:flex-none sm:px-4"
            : "group relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl border border-transparent px-2 py-2 text-muted transition hover:border-sky-300/25 hover:bg-wash/10 hover:text-cyan-ink hover:shadow-[0_0_26px_rgba(59,130,246,0.18)] sm:h-14 sm:min-w-20 sm:flex-none sm:px-4";
          const content = (
            <>
              <span
                className={
                  isActive
                    ? "absolute -top-1 h-1.5 w-8 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.9)]"
                    : "absolute -top-1 h-1.5 w-0 rounded-full bg-cyan-300 opacity-0 transition-all group-hover:w-6 group-hover:opacity-80"
                }
              />
              <Icon
                className={
                  isActive
                    ? "h-5 w-5 drop-shadow-[0_0_10px_rgba(34,211,238,0.75)]"
                    : "h-5 w-5 transition group-hover:drop-shadow-[0_0_10px_rgba(125,211,252,0.75)]"
                }
                aria-hidden="true"
              />
              <span className="max-w-full truncate text-[0.68rem] font-black leading-none sm:text-xs">
                <span data-locale-en={item.labelEn} data-locale-ja={item.labelJa}>
                  {item.labelEn}
                </span>
              </span>
            </>
          );

          if (item.kind === "search") {
            return (
              <button className={itemClass} key={item.kind} onClick={() => openSearchModal()} type="button">
                {content}
              </button>
            );
          }

          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              className={itemClass}
              href={item.href}
              key={item.kind}
            >
              {content}
            </Link>
          );
        })}
        <span className="pointer-events-none hidden h-10 w-px bg-gradient-to-b from-transparent via-sky-300/30 to-transparent sm:block" />
        <span className="pointer-events-none hidden items-center gap-1 rounded-full border border-violet-300/[0.15] bg-violet-500/10 px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.16em] text-violet-ink sm:inline-flex">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          Dock
        </span>
      </nav>
    </div>
  );
}
