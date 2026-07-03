"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent, TouchEvent } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, MessageSquareText, Sparkles } from "lucide-react";

import { ScoreBadge } from "@/components/ScoreBadge";
import { TrailerModalButton } from "@/components/TrailerModalButton";

export type HeroCarouselItem = {
  slug: string;
  title: string;
  titleEn: string | null;
  synopsis: string;
  coverImage: string;
  releaseYear: number;
  genres: string[];
  average: number | null;
  ratingCount: number;
  trailerUrl?: string | null;
};

export function HeroCarousel({ items }: { items: HeroCarouselItem[] }) {
  const safeItems = useMemo(() => items.filter(Boolean).slice(0, 5), [items]);
  const [index, setIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const dragStartX = useRef<number | null>(null);
  const dragDeltaX = useRef(0);

  useEffect(() => {
    if (safeItems.length === 0) {
      return;
    }

    setIndex((value) => Math.min(value, safeItems.length - 1));
  }, [safeItems.length]);

  useEffect(() => {
    if (safeItems.length <= 1 || isDragging) {
      return;
    }

    const timer = window.setInterval(() => {
      setIndex((value) => (value + 1) % safeItems.length);
    }, 7200);

    return () => window.clearInterval(timer);
  }, [isDragging, safeItems.length]);

  if (safeItems.length === 0) {
    return null;
  }

  function move(step: number) {
    if (safeItems.length <= 1) {
      return;
    }

    setDragOffset(0);
    setIndex((value) => (value + step + safeItems.length) % safeItems.length);
  }

  function canStartDrag(target: EventTarget) {
    return !(target as HTMLElement).closest("a,button");
  }

  function beginDrag(clientX: number) {
    if (safeItems.length <= 1) {
      return;
    }

    dragStartX.current = clientX;
    dragDeltaX.current = 0;
    setDragOffset(0);
    setIsDragging(true);
  }

  function updateDrag(clientX: number) {
    if (dragStartX.current === null) {
      return;
    }

    const nextOffset = clientX - dragStartX.current;

    dragDeltaX.current = nextOffset;
    setDragOffset(nextOffset);
  }

  function startMouseDrag(event: MouseEvent<HTMLElement>) {
    if (event.button !== 0 || !canStartDrag(event.target)) {
      return;
    }

    event.preventDefault();
    beginDrag(event.clientX);
  }

  function updateMouseDrag(event: MouseEvent<HTMLElement>) {
    updateDrag(event.clientX);
  }

  function startTouchDrag(event: TouchEvent<HTMLElement>) {
    const touch = event.touches[0];

    if (!touch || !canStartDrag(event.target)) {
      return;
    }

    beginDrag(touch.clientX);
  }

  function updateTouchDrag(event: TouchEvent<HTMLElement>) {
    const touch = event.touches[0];

    if (!touch) {
      return;
    }

    updateDrag(touch.clientX);
  }

  function finishDrag() {
    if (dragStartX.current === null) {
      return;
    }

    const step = Math.abs(dragDeltaX.current) > 64 ? (dragDeltaX.current < 0 ? 1 : -1) : 0;

    dragStartX.current = null;
    dragDeltaX.current = 0;
    setIndex((value) => (value + step + safeItems.length) % safeItems.length);
    setDragOffset(0);
    setIsDragging(false);
  }

  return (
    <section
      className={`relative isolate h-[500px] min-h-[500px] select-none overflow-hidden rounded-none [touch-action:pan-y] sm:h-[540px] sm:min-h-[540px] lg:rounded-[1.7rem] ${
        safeItems.length > 1 ? (isDragging ? "cursor-grabbing" : "cursor-grab") : ""
      }`}
      onMouseDown={startMouseDrag}
      onMouseLeave={finishDrag}
      onMouseMove={updateMouseDrag}
      onMouseUp={finishDrag}
      onTouchCancel={finishDrag}
      onTouchEnd={finishDrag}
      onTouchMove={updateTouchDrag}
      onTouchStart={startTouchDrag}
    >
      <div
        className="flex h-full"
        style={{
          transform: `translate3d(calc(${-index * 100}% + ${dragOffset}px), 0, 0)`,
          transition: isDragging
            ? "none"
            : "transform 920ms cubic-bezier(0.22, 1, 0.36, 1)",
          willChange: "transform",
        }}
      >
        {safeItems.map((item) => (
          <article className="relative h-full min-w-full overflow-hidden" key={item.slug}>
            <div
              className="absolute inset-0 -z-10 scale-110 bg-cover bg-center opacity-45 blur-sm transition-transform duration-[1200ms]"
              style={{ backgroundImage: `url(${item.coverImage})` }}
            />
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#050509] via-[#050509]/92 to-[#050509]/25" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#050509] via-transparent to-black/45" />
            <div className="absolute right-12 top-16 -z-10 h-56 w-56 rounded-full bg-violet-500/18 blur-3xl" />

            <div className="mx-auto grid h-full max-w-[1780px] items-end gap-7 px-4 pb-20 pt-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(440px,1.1fr)] lg:items-center lg:px-6 lg:py-8 xl:grid-cols-[minmax(0,0.78fr)_minmax(640px,1.22fr)]">
              <div className="max-w-3xl">
                <p className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-black text-cyan-100">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  Featured Picks
                </p>
                <h1 className="mt-4 text-4xl font-black leading-tight text-white sm:text-5xl xl:text-6xl">
                  {item.title}
                </h1>
                {item.titleEn ? (
                  <p className="mt-2 text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
                    {item.titleEn}
                  </p>
                ) : null}
                <p className="mt-4 line-clamp-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                  {item.synopsis}
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-2.5">
                  <ScoreBadge count={item.ratingCount} score={item.average} />
                  <span className="inline-flex rounded-full border border-white/10 bg-black/55 px-3 py-1.5 text-sm font-bold text-slate-300">
                    {item.releaseYear}
                  </span>
                  <span className="portal-chip rounded-full px-3 py-1.5 text-sm font-bold">
                    {item.genres[0] ?? "Anime"}
                  </span>
                </div>
                <div className="mt-7 flex flex-wrap gap-3">
                  <TrailerModalButton
                    className="portal-button-primary inline-flex h-12 items-center gap-2 rounded-full px-5 text-sm font-black"
                    trailerUrl={item.trailerUrl ?? null}
                  />
                  <Link
                    className="portal-button-secondary inline-flex h-12 items-center gap-2 rounded-full px-5 text-sm font-black"
                    href={`/anime/${item.slug}`}
                  >
                    Details
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <Link
                    className="hidden h-12 items-center gap-2 rounded-full border border-white/10 bg-black/45 px-5 text-sm font-black text-slate-200 transition hover:border-cyan-300/40 hover:text-white sm:inline-flex"
                    href={`/anime/${item.slug}#review-form`}
                  >
                    Write Review
                    <MessageSquareText className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>

              <Link
                className="relative hidden h-[380px] overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-2 shadow-[0_22px_68px_rgba(0,0,0,0.4)] transition hover:border-violet-300/40 lg:block xl:h-[430px]"
                href={`/anime/${item.slug}`}
              >
                <div className="absolute inset-2 grid place-items-center rounded-2xl bg-[radial-gradient(circle_at_30%_20%,rgba(34,211,238,0.18),transparent_28%),linear-gradient(135deg,rgba(124,58,237,0.26),rgba(15,23,42,0.98))] px-6 text-center">
                  <span className="text-sm font-black uppercase tracking-[0.22em] text-slate-400">
                    アニサーチ
                  </span>
                  <span className="mt-2 line-clamp-3 text-xl font-black text-white">
                    {item.title}
                  </span>
                </div>
                <img
                  alt={`${item.title} poster`}
                  className="relative h-full w-full rounded-2xl object-cover transition-opacity"
                  onError={(event) => {
                    event.currentTarget.style.opacity = "0";
                  }}
                  src={item.coverImage}
                />
              </Link>
            </div>
          </article>
        ))}
      </div>

      {safeItems.length > 1 ? (
        <div className="pointer-events-none absolute bottom-5 left-4 z-10 flex items-center gap-2 lg:left-6">
          <button
            aria-label="Previous featured anime"
            className="pointer-events-auto grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-black/70 text-slate-400 shadow-[0_12px_28px_rgba(0,0,0,0.45)] transition hover:border-cyan-300/40 hover:text-white"
            onClick={() => move(-1)}
            type="button"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            aria-label="Next featured anime"
            className="pointer-events-auto grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-black/70 text-slate-400 shadow-[0_12px_28px_rgba(0,0,0,0.45)] transition hover:border-cyan-300/40 hover:text-white"
            onClick={() => move(1)}
            type="button"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
          <div className="pointer-events-auto ml-1 flex gap-2 rounded-full border border-white/[0.06] bg-black/55 px-2.5 py-2 shadow-[0_12px_28px_rgba(0,0,0,0.42)] backdrop-blur-md">
            {safeItems.map((item, itemIndex) => (
              <button
                aria-label={`Show ${item.title}`}
                className={
                  itemIndex === index
                    ? "h-2 w-7 rounded-full bg-violet-400 shadow-[0_0_18px_rgba(139,92,246,0.72)] transition-all duration-500"
                    : "h-2 w-2 rounded-full bg-white/20 transition-all duration-500 hover:bg-slate-300"
                }
                key={item.slug}
                onClick={() => {
                  setDragOffset(0);
                  setIndex(itemIndex);
                }}
                type="button"
              />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
