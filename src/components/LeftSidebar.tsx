"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronRight, Menu, X } from "lucide-react";

type DrawerLinkItem = {
  href: string;
  label: string;
  key: string;
  panel?: "genres";
};

const drawerItems: DrawerLinkItem[] = [
  { href: "/", label: "Home", key: "home" },
  { href: "/anime#genres", label: "Genre", key: "genre", panel: "genres" },
  { href: "/anime", label: "Types", key: "types" },
  { href: "/anime?sort=newest", label: "Newest", key: "newest" },
  { href: "/anime?sort=reviews", label: "Updated", key: "updated" },
  { href: "/schedule", label: "Ongoing", key: "ongoing" },
  { href: "/anime?sort=newest", label: "Added", key: "added" },
  { href: "/mypage", label: "Request", key: "request" },
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
      <div className="portal-sidebar-genre-grid">
        {genreItems.map((genre) => (
          <Link
            className="portal-sidebar-genre-link"
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

export function LeftSidebar({ isAdmin, randomHref }: { isAdmin: boolean; randomHref: string }) {
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
        className="portal-menu-toggle"
        onClick={() => {
          setIsOpen((current) => !current);
          setActivePanel(null);
        }}
        ref={buttonRef}
        type="button"
      >
        <Menu
          className={`absolute h-8 w-8 ${isOpen ? "opacity-0" : "opacity-100"}`}
          strokeWidth={2.4}
          strokeLinecap="butt"
          aria-hidden="true"
        />
        <X
          className={`absolute h-9 w-9 ${isOpen ? "opacity-100" : "opacity-0"}`}
          strokeWidth={2.4}
          strokeLinecap="butt"
          aria-hidden="true"
        />
      </button>

      <div
        className={`portal-menu-backdrop ${
          isOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        style={{ opacity: isOpen ? 1 : 0 }}
      />

      <aside
        className="portal-sidebar"
        id="portal-sidebar-drawer"
        ref={drawerRef}
        onMouseLeave={() => setActivePanel(null)}
        style={{
          display: isOpen ? "block" : "none",
        }}
      >
        <nav aria-label="Expanded side navigation" inert={!isOpen}>
          {visibleDrawerItems.map((item) => {
            const active = !["newest", "updated", "added"].includes(item.key) && isActivePath(pathname, item.href);

            if (item.panel === "genres") {
              return (
                <div key={item.key}>
                  <button
                    aria-controls="portal-sidebar-genres"
                    aria-expanded={activePanel === "genres"}
                    className="portal-sidebar-item"
                    onClick={() => setActivePanel((current) =>
                      window.matchMedia("(min-width: 1200px)").matches || current !== "genres" ? "genres" : null,
                    )}
                    onPointerEnter={(event) => {
                      if (event.pointerType === "mouse" && window.matchMedia("(min-width: 1200px)").matches) {
                        setActivePanel("genres");
                      }
                    }}
                    type="button"
                  >
                    {item.label}
                    <ChevronRight className="portal-sidebar-arrow" aria-hidden="true" />
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
                aria-current={active ? "page" : undefined}
                className="portal-sidebar-item"
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
          <Link
            className="portal-sidebar-item portal-sidebar-mobile-random"
            href={randomHref}
            onClick={() => {
              setIsOpen(false);
              setActivePanel(null);
            }}
          >
            Random
          </Link>
        </nav>
      </aside>
    </>
  );
}
