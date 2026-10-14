"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PlayCircle, X } from "lucide-react";

function getYouTubeEmbedUrl(value: string) {
  try {
    const url = new URL(value);

    if (url.hostname.includes("youtube.com")) {
      const videoId = url.searchParams.get("v");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    if (url.hostname === "youtu.be") {
      const videoId = url.pathname.split("/").filter(Boolean)[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    return null;
  } catch {
    return null;
  }
}

export function TrailerModalButton({
  className = "portal-button-primary inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-black",
  label = "Official PV",
  trailerUrl,
}: {
  className?: string;
  label?: string;
  trailerUrl: string | null;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const embedUrl = useMemo(() => (trailerUrl ? getYouTubeEmbedUrl(trailerUrl) : null), [trailerUrl]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

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

  return (
    <>
      <button
        className={className}
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <PlayCircle className="h-4 w-4" aria-hidden="true" />
        {label}
      </button>
      {isOpen ? (
        <div className="fixed inset-0 z-[90] bg-black/[0.78] px-3 py-6 backdrop-blur-xl">
          <div
            aria-modal="true"
            className="mx-auto mt-10 max-w-4xl overflow-hidden rounded-3xl border border-line/10 bg-panel portal-floating"
            ref={dialogRef}
            role="dialog"
          >
            <div className="flex items-center justify-between border-b border-line/10 px-4 py-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-ink">
                  Official PV
                </p>
                <h2 className="text-lg font-black text-heading">Trailer preview</h2>
              </div>
              <button
                aria-label="Close official PV"
                className="grid h-10 w-10 place-items-center rounded-xl text-muted hover:bg-wash/10 hover:text-heading"
                onClick={() => setIsOpen(false)}
                type="button"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            {embedUrl ? (
              <div className="aspect-video bg-black">
                <iframe
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="h-full w-full"
                  src={embedUrl}
                  title="Official trailer"
                />
              </div>
            ) : (
              <div className="p-6 text-sm leading-7 text-secondary">
                公式PVは未登録です。このサイトではアニメ本編動画の配信やアップロードは行いません。
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
