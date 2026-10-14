"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { CornerDownLeft, Filter, Search, Tags, X } from "lucide-react";
import { AnimePoster } from "@/components/AnimePoster";

export type SearchModalItem = {
  slug: string;
  title: string;
  coverImage: string;
  genres: string[];
  tags: string[];
  reviewText: string;
};

type SearchModalProps = {
  items: SearchModalItem[];
};

type SearchOpenButtonProps = {
  className?: string;
  children: ReactNode;
};

type SearchModalAnchor = {
  left: number;
  top: number;
  width: number;
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function clampAnchor(left: number, top: number, width: number): SearchModalAnchor {
  const gutter = 12;
  const availableWidth = Math.max(280, window.innerWidth - gutter * 2);
  const nextWidth = Math.min(width, availableWidth);
  const nextLeft = Math.min(Math.max(gutter, left), window.innerWidth - nextWidth - gutter);

  return {
    left: nextLeft,
    top: Math.max(0, top - 1),
    width: nextWidth,
  };
}

export function openSearchModal(anchor?: SearchModalAnchor) {
  window.dispatchEvent(new CustomEvent<SearchModalAnchor | undefined>("animemo:open-search", { detail: anchor }));
}

export function SearchOpenButton({ className, children }: SearchOpenButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function onQuickAccess(event: KeyboardEvent) {
      const target = event.target;

      if (
        event.key.toLowerCase() !== "s" ||
        event.isComposing ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        (target instanceof HTMLElement &&
          (target.isContentEditable || target.closest("input, textarea, select")))
      ) {
        return;
      }

      event.preventDefault();
      const rect = buttonRef.current?.getBoundingClientRect();
      openSearchModal(rect?.width ? clampAnchor(rect.left, rect.bottom, rect.width) : undefined);
    }

    document.addEventListener("keydown", onQuickAccess);
    return () => document.removeEventListener("keydown", onQuickAccess);
  }, []);

  return (
    <button
      aria-haspopup="dialog"
      className={className}
      onClick={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        openSearchModal(clampAnchor(rect.left, rect.bottom, rect.width));
      }}
      ref={buttonRef}
      type="button"
    >
      {children}
    </button>
  );
}

export function SearchModal({ items }: SearchModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [anchor, setAnchor] = useState<SearchModalAnchor | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function open(event: Event) {
      const detail = (event as CustomEvent<SearchModalAnchor | undefined>).detail;

      setAnchor(detail ?? null);
      setActiveIndex(-1);
      setIsOpen(true);
    }

    window.addEventListener("animemo:open-search", open);

    return () => {
      window.removeEventListener("animemo:open-search", open);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    inputRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    function onPointerDown(event: PointerEvent) {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [isOpen]);

  const results = useMemo(() => {
    const keyword = normalize(query);

    if (!keyword) {
      return items.slice(0, 8);
    }

    return items
      .filter((item) => {
        const haystack = normalize(
          [item.title, item.genres.join(" "), item.tags.join(" "), item.reviewText].join(" "),
        );

        return haystack.includes(keyword);
      })
      .slice(0, 10);
  }, [items, query]);
  const visibleResults = results.slice(0, 6);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={anchor ? "fixed z-[80]" : "fixed inset-x-0 top-[68px] z-[80] px-3 sm:px-6"}
      style={
        anchor
          ? {
              left: `${anchor.left}px`,
              top: `${anchor.top}px`,
              width: `${anchor.width}px`,
            }
          : undefined
      }
    >
      <div
        aria-modal="true"
        aria-label="Search anime"
        className="mx-auto w-full max-w-[640px] overflow-hidden rounded-b-2xl border border-t-0 border-line/10 bg-popover portal-floating"
        ref={dialogRef}
        role="dialog"
      >
        <form
          className="flex h-12 items-center gap-3 px-4"
          onSubmit={(event) => {
            event.preventDefault();
            const selected = activeIndex >= 0 ? visibleResults[activeIndex] : undefined;
            router.push(selected ? `/anime/${selected.slug}` : `/anime?q=${encodeURIComponent(query.trim())}`);
            setIsOpen(false);
          }}
        >
          <Search className="h-5 w-5 text-muted" aria-hidden="true" />
          <input
            aria-label="Search anime"
            className="min-w-0 flex-1 bg-transparent text-sm font-medium text-heading outline-none placeholder:text-muted"
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(-1);
            }}
            onKeyDown={(event) => {
              if (event.nativeEvent.isComposing) {
                if (event.key === "Enter") {
                  event.preventDefault();
                }
                return;
              }

              if (!query || !visibleResults.length || (event.key !== "ArrowDown" && event.key !== "ArrowUp")) {
                return;
              }

              event.preventDefault();
              setActiveIndex((current) =>
                event.key === "ArrowDown"
                  ? (current + 1) % visibleResults.length
                  : current <= 0
                    ? visibleResults.length - 1
                    : current - 1,
              );
            }}
            placeholder="Search anime..."
            ref={inputRef}
            value={query}
          />
          {query ? (
            <button
              className="text-sm font-medium text-muted underline decoration-slate-600 underline-offset-4 transition hover:text-heading"
              onClick={() => {
                setQuery("");
                setActiveIndex(-1);
              }}
              type="button"
            >
              Clear
            </button>
          ) : null}
          <button
            aria-label="Close search"
            className="grid h-8 w-8 place-items-center rounded-xl text-muted hover:bg-wash/10 hover:text-heading"
            onClick={() => setIsOpen(false)}
            type="button"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </form>

        <div className="flex items-end justify-between border-b border-line/10 px-4 pb-2">
          <Link
            className="border-b border-violet-400 pb-2 text-sm font-medium text-heading"
            href="/anime"
            onClick={() => setIsOpen(false)}
          >
            Anime
          </Link>
          <Link
            className="inline-flex items-center gap-1.5 pb-2 text-sm font-medium text-muted transition hover:text-heading"
            href="/anime#anime-search"
            onClick={() => setIsOpen(false)}
          >
            <Filter className="h-3.5 w-3.5" aria-hidden="true" />
            Filter
          </Link>
        </div>

        {query ? (
          <div className="max-h-[46vh] overflow-y-auto border-b border-line/10 p-2">
            {results.length === 0 ? (
              <div className="rounded-xl px-3 py-3 text-sm font-bold text-muted">
                No anime matched this search.
              </div>
            ) : (
              <div className="space-y-1">
                {visibleResults.map((item, index) => (
                  <Link
                    aria-current={activeIndex === index ? "true" : undefined}
                    className={`group flex gap-3 p-2 transition hover:bg-wash/[0.06] ${activeIndex === index ? "bg-wash/[0.06]" : ""}`}
                    href={`/anime/${item.slug}`}
                    key={item.slug}
                    onClick={() => setIsOpen(false)}
                  >
                    <AnimePoster
                      alt={`${item.title} poster`}
                      className="h-12 w-9 shrink-0 rounded-lg object-cover"
                      src={item.coverImage}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-bold text-foreground group-hover:text-cyan-ink">
                        {item.title}
                      </p>
                      <p className="mt-0.5 line-clamp-1 text-xs font-medium text-muted">
                        {item.genres.join(" / ")}
                      </p>
                      {item.tags.length ? (
                        <p className="mt-1 flex items-center gap-1 text-[0.68rem] font-bold text-violet-ink">
                          <Tags className="h-3 w-3" aria-hidden="true" />
                          {item.tags.slice(0, 3).join("  ")}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3 bg-raised px-4 py-3 text-xs font-medium text-muted">
          <span className="inline-flex items-center gap-1">
            <kbd className="rounded-md border border-line/[0.15] bg-raised px-1.5 py-0.5 text-[0.65rem] text-muted">
              ↓
            </kbd>
            <kbd className="rounded-md border border-line/[0.15] bg-raised px-1.5 py-0.5 text-[0.65rem] text-muted">
              ↑
            </kbd>
            to navigate
          </span>
          <span className="inline-flex items-center gap-1">
            <kbd className="inline-flex items-center rounded-md border border-line/[0.15] bg-raised px-1.5 py-0.5 text-[0.65rem] text-muted">
              <CornerDownLeft className="h-3 w-3" aria-hidden="true" />
            </kbd>
            to select
          </span>
          <span className="inline-flex items-center gap-1">
            <kbd className="rounded-md border border-line/[0.15] bg-raised px-1.5 py-0.5 text-[0.65rem] text-muted">
              esc
            </kbd>
            to exit
          </span>
        </div>
      </div>
    </div>
  );
}
