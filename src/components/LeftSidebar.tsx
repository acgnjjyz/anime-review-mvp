"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  PlusCircle,
  Radio,
  RotateCcw,
  X,
} from "lucide-react";

type DrawerLinkItem = {
  href: string;
  label: string;
  key: string;
  panel?: "genres";
};

const drawerItems: DrawerLinkItem[] = [
  { href: "/", label: "HOME", key: "home" },
  { href: "/anime#genres", label: "GENRE", key: "genre", panel: "genres" },
  { href: "/anime", label: "TYPES", key: "types" },
  { href: "/anime?sort=newest", label: "NEWEST", key: "newest" },
  { href: "/anime?sort=reviews", label: "UPDATED", key: "updated" },
  { href: "/schedule", label: "ONGOING", key: "ongoing" },
  { href: "/anime?sort=newest", label: "ADDED", key: "added" },
  { href: "/mypage", label: "REQUEST", key: "request" },
];

const genreItems = [
  { label: "Action", value: "アクション" },
  { label: "Romance", value: "恋愛" },
  { label: "Youth", value: "青春" },
  { label: "Fantasy", value: "ファンタジー" },
  { label: "Horror", value: "ホラー" },
  { label: "Mystery", value: "ミステリー" },
  { label: "Slice of Life", value: "日常" },
  { label: "Sci-Fi", value: "SF" },
  { label: "Drama", value: "ドラマ" },
  { label: "Music", value: "音楽" },
  { label: "School", value: "学園" },
  { label: "Adventure", value: "冒険" },
  { label: "Comedy", value: "コメディ" },
  { label: "Sports", value: "スポーツ" },
  { label: "Healing", value: "癒し" },
  { label: "Battle", value: "バトル" },
  { label: "Great Animation", value: "神作画" },
  { label: "Emotional", value: "泣ける" },
  { label: "Atmospheric", value: "雰囲気が良い" },
  { label: "Dark", value: "鬱展開" },
  { label: "Music Focus", value: "音楽が良い" },
  { label: "Classic", value: "名作" },
];

function isActivePath(pathname: string, href: string) {
  const hrefPath = href.split("?")[0]?.split("#")[0] || "/";

  if (hrefPath === "/") {
    return pathname === "/";
  }

  return pathname === hrefPath || pathname.startsWith(`${hrefPath}/`);
}

function GenreFlyout({ onSelect }: { onSelect: () => void }) {
  return (
    <div className="portal-sidebar-flyout">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-ink">Genre</p>
        <Link className="text-xs font-black text-violet-ink hover:text-heading" href="/anime#genres">
          All
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3 md:grid-cols-4">
        {genreItems.map((genre) => (
          <Link
            className="rounded-xl px-3 py-2 text-sm font-bold text-muted transition hover:bg-wash/[0.06] hover:text-heading"
            href={`/anime?genre=${encodeURIComponent(genre.value)}`}
            key={genre.value}
            onClick={onSelect}
          >
            {genre.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function LeftSidebar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<"genres" | null>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const visibleDrawerItems = isAdmin
    ? [...drawerItems, { href: "/admin", label: "ADMIN", key: "admin" }]
    : drawerItems;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    function closeOnOutsideClick(event: globalThis.PointerEvent) {
      const target = event.target as Node;

      if (drawerRef.current?.contains(target) || buttonRef.current?.contains(target)) {
        return;
      }

      setIsOpen(false);
    }

    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOnOutsideClick);

    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOnOutsideClick);
    };
  }, [isOpen]);

  return (
    <>
      <button
        aria-controls="portal-sidebar-drawer"
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        className="fixed left-4 top-3.5 z-[90] grid h-10 w-10 place-items-center rounded-2xl border border-line/10 bg-chrome text-foreground portal-floating transition hover:border-violet-300/[0.45] hover:text-heading"
        onClick={() => setIsOpen((current) => !current)}
        ref={buttonRef}
        type="button"
      >
        <Menu
          className={`absolute h-5 w-5 transition ${isOpen ? "scale-75 opacity-0" : "scale-100 opacity-100"}`}
          aria-hidden="true"
        />
        <X
          className={`absolute h-6 w-6 transition ${isOpen ? "scale-100 opacity-100" : "scale-75 opacity-0"}`}
          aria-hidden="true"
        />
      </button>

      <div
        className={`fixed inset-0 z-[65] bg-black/[0.72] backdrop-blur-md transition-opacity duration-300 md:hidden ${
          isOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        style={{ opacity: isOpen ? 1 : 0 }}
      />

      <aside
        className="fixed left-0 top-[76px] z-[80] max-h-[calc(100vh-96px)] w-[236px] overflow-visible rounded-none border border-l-0 border-line/[0.08] bg-raised portal-floating will-change-transform md:w-[204px]"
        id="portal-sidebar-drawer"
        ref={drawerRef}
        style={{
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 360ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <button
          aria-controls="portal-sidebar-drawer"
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close side menu" : "Open side menu"}
          className="absolute -right-8 top-1/2 z-[2] grid h-20 w-8 -translate-y-1/2 cursor-pointer place-items-center border border-line/20 bg-panel text-secondary portal-floating transition-colors hover:border-violet-400/50 hover:text-violet-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-400 md:-right-6 md:w-6"
          onClick={() => setIsOpen((current) => !current)}
          title={isOpen ? "Close side menu" : "Open side menu"}
          type="button"
        >
          {isOpen ? (
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          ) : (
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          )}
        </button>

        <nav className="space-y-0 py-5" aria-label="Expanded side navigation" inert={!isOpen}>
          {visibleDrawerItems.map((item) => {
            const active = isActivePath(pathname, item.href);

            if (item.panel === "genres") {
              return (
                <button
                  aria-expanded={activePanel === "genres"}
                  className={
                    activePanel === "genres"
                      ? "mx-3 flex h-12 w-[calc(100%-1.5rem)] items-center justify-between rounded-2xl bg-wash/5 px-4 text-left text-sm font-black uppercase text-cyan-ink"
                      : "mx-3 flex h-12 w-[calc(100%-1.5rem)] items-center justify-between rounded-2xl px-4 text-left text-sm font-black uppercase text-muted transition hover:bg-chrome hover:text-heading"
                  }
                  key={item.key}
                  onClick={() => setActivePanel((current) => (current === "genres" ? null : "genres"))}
                  onMouseEnter={() => setActivePanel("genres")}
                  type="button"
                >
                  {item.label}
                  <ChevronRight className="h-4 w-4 text-secondary" aria-hidden="true" />
                </button>
              );
            }

            return (
              <Link
                className={
                  active
                    ? "mx-3 flex h-12 items-center gap-3 rounded-2xl bg-wash/5 px-4 text-sm font-black uppercase text-heading"
                    : "mx-3 flex h-12 items-center gap-3 rounded-2xl px-4 text-sm font-black uppercase text-muted transition hover:bg-chrome hover:text-heading"
                }
                href={item.href}
                key={item.key}
                onClick={() => setIsOpen(false)}
              >
                {item.key === "updated" ? <RotateCcw className="h-4 w-4" aria-hidden="true" /> : null}
                {item.key === "ongoing" ? <Radio className="h-4 w-4" aria-hidden="true" /> : null}
                {item.key === "added" ? <PlusCircle className="h-4 w-4" aria-hidden="true" /> : null}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {activePanel === "genres" && isOpen ? (
          <GenreFlyout onSelect={() => setIsOpen(false)} />
        ) : null}
      </aside>
    </>
  );
}
