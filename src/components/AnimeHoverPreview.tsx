"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  FloatingPortal,
  offset,
  safePolygon,
  shift,
  useDismiss,
  useFloating,
  useHover,
  useInteractions,
  useTransitionStyles,
} from "@floating-ui/react";
import { ArrowRight, Heart, Info, MessageSquare, Plus, Star, X } from "lucide-react";

import { formatScore } from "@/lib/score";

type AnimePreviewData = {
  slug: string;
  title: string;
  titleEn: string | null;
  synopsis: string;
  studio: string;
  season: string;
  episodes: number;
  releaseYear: number;
  genres: string[];
  score: number | null;
  ratingCount: number;
  reviewCount: number;
  isFavorite: boolean;
};

const previewOpenEvent = "animemo:open-anime-preview";
const viewportPadding = { top: 80, right: 12, bottom: 20, left: 12 };

export function AnimeHoverPreview({ anime, children }: { anime: AnimePreviewData; children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const previewId = useId();
  const titleId = `${previewId}-title`;
  const infoButtonRef = useRef<HTMLButtonElement>(null);
  const changeOpen = useCallback((nextOpen: boolean) => {
    setIsOpen(nextOpen);
    if (nextOpen) {
      window.dispatchEvent(new CustomEvent(previewOpenEvent, { detail: previewId }));
    }
  }, [previewId]);
  const { refs, floatingStyles, context, placement, isPositioned } = useFloating({
    open: isOpen,
    onOpenChange: changeOpen,
    placement: "right-start",
    strategy: "fixed",
    middleware: [
      offset(({ rects, placement: side }) => ({
        mainAxis: 10,
        crossAxis: /^(right|left)/.test(side) ? rects.reference.height * 0.3 : 0,
      })),
      flip({ padding: viewportPadding, crossAxis: "alignment", fallbackAxisSideDirection: "end" }),
      shift({ padding: viewportPadding, crossAxis: true }),
    ],
    whileElementsMounted: (reference, floating, update) =>
      // The existing card hover transform also moves its poster.
      autoUpdate(reference, floating, update, { animationFrame: true }),
  });
  const hover = useHover(context, {
    mouseOnly: true,
    move: false,
    delay: { open: 150, close: 150 },
    handleClose: safePolygon(),
  });
  const dismiss = useDismiss(context, { ancestorScroll: true });
  const { getReferenceProps, getFloatingProps } = useInteractions([hover, dismiss]);
  const { isMounted, styles: transitionStyles } = useTransitionStyles(context, { duration: 150 });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function closeOtherPreview(event: Event) {
      if ((event as CustomEvent<string>).detail !== previewId) {
        setIsOpen(false);
      }
    }

    window.addEventListener(previewOpenEvent, closeOtherPreview);
    return () => window.removeEventListener(previewOpenEvent, closeOtherPreview);
  }, [isOpen, previewId]);

  const isTitleOnly = anime.studio === "Title Import";
  const synopsis = anime.synopsis.startsWith("Title-only catalog entry.") ? "" : anime.synopsis.trim();
  const genres = isTitleOnly ? [] : anime.genres;
  const alternateTitle = anime.titleEn && anime.titleEn !== anime.title ? anime.titleEn : null;
  const detailHref = `/anime/${anime.slug}`;

  return (
    <>
      <div className="portal-anime-preview-trigger" ref={refs.setReference} {...getReferenceProps()}>
        {children}
        <button
          aria-controls={isMounted ? previewId : undefined}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          aria-label={`${anime.title}の作品情報を表示`}
          className="portal-anime-preview-info"
          onClick={() => changeOpen(true)}
          ref={infoButtonRef}
          title="作品情報を表示"
          type="button"
        >
          <Info aria-hidden="true" size={18} />
        </button>
      </div>

      {isMounted ? (
        <FloatingPortal>
          <FloatingFocusManager context={context} initialFocus={-1} modal={false} returnFocus={infoButtonRef}>
            <div
              {...getFloatingProps()}
              aria-labelledby={titleId}
              className="portal-anime-preview-positioner"
              data-open={isOpen}
              data-placement={placement}
              id={previewId}
              ref={refs.setFloating}
              role="dialog"
              style={{ ...floatingStyles, visibility: isPositioned ? "visible" : "hidden" }}
            >
              <div className="portal-anime-preview-panel" style={transitionStyles}>
                <button
                  aria-label="作品情報を閉じる"
                  className="portal-anime-preview-close"
                  onClick={() => changeOpen(false)}
                  title="閉じる"
                  type="button"
                >
                  <X aria-hidden="true" size={16} />
                </button>
                <h3 className="portal-anime-preview-title" id={titleId}>
                  <Link href={detailHref} onClick={() => changeOpen(false)}>{anime.title}</Link>
                </h3>

                <div className="portal-anime-preview-badges">
                  <span className="portal-anime-preview-score">
                    <Star aria-hidden="true" size={12} />
                    {formatScore(anime.score)}
                    <span>({anime.ratingCount})</span>
                  </span>
                  <span><MessageSquare aria-hidden="true" size={12} />{anime.reviewCount}</span>
                  {anime.isFavorite ? <span><Heart aria-hidden="true" size={12} />お気に入り</span> : null}
                </div>

                <p className="portal-anime-preview-synopsis">{synopsis || "あらすじは未登録です。"}</p>
                {alternateTitle ? (
                  <p className="portal-anime-preview-alternate"><span>別名: </span>{alternateTitle}</p>
                ) : null}

                {!isTitleOnly || genres.length ? (
                  <dl className="portal-anime-preview-metadata">
                    {!isTitleOnly && anime.releaseYear > 0 ? <div><dt>公開年</dt><dd>{anime.releaseYear}</dd></div> : null}
                    {!isTitleOnly && anime.season ? <div><dt>放送時期</dt><dd>{anime.season}</dd></div> : null}
                    {!isTitleOnly && anime.episodes > 0 ? <div><dt>話数</dt><dd>{anime.episodes}話</dd></div> : null}
                    {!isTitleOnly && anime.studio ? <div><dt>制作</dt><dd>{anime.studio}</dd></div> : null}
                    {genres.length ? (
                      <div>
                        <dt>ジャンル</dt>
                        <dd>{genres.map((genre, index) => (
                          <span key={genre}>
                            {index ? ", " : ""}
                            <Link href={`/anime?genre=${encodeURIComponent(genre)}`} onClick={() => changeOpen(false)}>{genre}</Link>
                          </span>
                        ))}</dd>
                      </div>
                    ) : null}
                  </dl>
                ) : null}

                <div className="portal-anime-preview-actions">
                  <Link className="portal-anime-preview-details" href={detailHref} onClick={() => changeOpen(false)}>
                    <ArrowRight aria-hidden="true" size={16} />詳細を見る
                  </Link>
                  <Link
                    aria-label={`${anime.title}の視聴リストを開く`}
                    className="portal-anime-preview-shelf"
                    href={`${detailHref}#watch-status`}
                    onClick={() => changeOpen(false)}
                    title="視聴リストを開く"
                  >
                    <Plus aria-hidden="true" size={21} />
                  </Link>
                </div>
              </div>
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      ) : null}
    </>
  );
}
