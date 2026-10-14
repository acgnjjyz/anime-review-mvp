"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Menu, X } from "lucide-react";

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
    <div className="portal-sidebar-flyout" id="portal-sidebar-genres">
      <div className="grid grid-cols-1 gap-x-4 gap-y-1 md:grid-cols-4">
        {genreItems.map((genre) => (
          <Link
            className="min-w-0 px-1 py-1.5 text-sm font-medium text-muted [overflow-wrap:anywhere] transition hover:text-heading"
            href={`/anime?genre=${encodeURIComponent(genre.value)}`}
            key={genre.value}
            onClick={onSelect}
          >
            {genre.label}
          </Link>
        ))}
      </div>
      <Link className="mt-3 inline-block text-xs text-violet-ink hover:text-heading" href="/anime#genres" onClick={onSelect}>
        All genres
      </Link>
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
        setActivePanel(null);
      }
    }

    function closeOnOutsideClick(event: globalThis.PointerEvent) {
      const target = event.target as Node;

      if (drawerRef.current?.contains(target) || buttonRef.current?.contains(target)) {
        return;
      }

      setIsOpen(false);
      setActivePanel(null);
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
        className="fixed left-3 top-3.5 z-[90] grid h-10 w-10 place-items-center text-secondary transition hover:text-heading focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-400"
        onClick={() => {
          setIsOpen((current) => !current);
          setActivePanel(null);
        }}
        ref={buttonRef}
        type="button"
      >
        <Menu
          className={`absolute h-7 w-7 transition ${isOpen ? "scale-75 opacity-0" : "scale-100 opacity-100"}`}
          aria-hidden="true"
        />
        <X
          className={`absolute h-7 w-7 transition ${isOpen ? "scale-100 opacity-100" : "scale-75 opacity-0"}`}
          aria-hidden="true"
        />
      </button>

      <div
        className={`fixed inset-x-0 bottom-0 top-[68px] z-[65] bg-black/[0.72] backdrop-blur-md transition-opacity duration-300 md:hidden ${
          isOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        style={{ opacity: isOpen ? 1 : 0 }}
      />

      <aside
        className="fixed left-3 top-[68px] z-[80] w-[176px] bg-popover will-change-transform md:w-[128px]"
        id="portal-sidebar-drawer"
        ref={drawerRef}
        onMouseLeave={() => setActivePanel(null)}
        style={{
          transform: isOpen ? "translateX(0)" : "translateX(calc(-100% - 12px))",
          transition: "transform 220ms ease-out",
        }}
      >
        <button
          aria-controls="portal-sidebar-drawer"
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close side menu" : "Open side menu"}
          className="absolute -right-8 top-1/2 z-[2] grid h-20 w-8 -translate-y-1/2 cursor-pointer place-items-center border border-line/20 bg-panel text-secondary portal-floating transition-colors hover:border-violet-400/50 hover:text-violet-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-400 md:-right-6 md:w-6"
          onClick={() => {
            setIsOpen((current) => !current);
            setActivePanel(null);
          }}
          title={isOpen ? "Close side menu" : "Open side menu"}
          type="button"
        >
          {isOpen ? (
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          ) : (
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          )}
        </button>

        <nav className="max-h-[calc(100dvh-84px)] overflow-y-auto py-1 md:overflow-visible" aria-label="Expanded side navigation" inert={!isOpen}>
          {visibleDrawerItems.map((item) => {
            const active = !["newest", "updated", "added"].includes(item.key) && isActivePath(pathname, item.href);

            if (item.panel === "genres") {
              return (
                <div key={item.key}>
                  <button
                    aria-controls="portal-sidebar-genres"
                    aria-expanded={activePanel === "genres"}
                    className={
                      activePanel === "genres"
                        ? "flex h-10 w-full items-center justify-between bg-depth/20 px-5 text-left text-base font-normal uppercase text-heading"
                        : "flex h-10 w-full items-center justify-between px-5 text-left text-base font-normal uppercase text-muted transition hover:bg-depth/20 hover:text-heading"
                    }
                    onClick={() => setActivePanel((current) =>
                      window.matchMedia("(min-width: 768px)").matches || current !== "genres" ? "genres" : null,
                    )}
                    onPointerEnter={(event) => {
                      if (event.pointerType === "mouse" && window.matchMedia("(min-width: 768px)").matches) {
                        setActivePanel("genres");
                      }
                    }}
                    type="button"
                  >
                    {item.label}
                    <ChevronRight className="h-3 w-3 shrink-0 text-secondary" aria-hidden="true" />
                  </button>
                  {activePanel === "genres" && isOpen ? (
                    <GenreFlyout onSelect={() => {
                      setIsOpen(false);
                      setActivePanel(null);
                    }} />
                  ) : null}
                </div>
              );
            }

            return (
              <Link
                className={
                  active
                    ? "flex h-10 items-center bg-wash/5 px-5 text-base font-normal uppercase text-heading"
                    : "flex h-10 items-center px-5 text-base font-normal uppercase text-muted transition hover:bg-depth/20 hover:text-heading"
                }
                href={item.href}
                key={item.key}
                onClick={() => {
                  setIsOpen(false);
                  setActivePanel(null);
                }}
                onMouseEnter={() => setActivePanel(null)}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
