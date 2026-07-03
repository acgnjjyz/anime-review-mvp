import Link from "next/link";
import { ExternalLink, PlayCircle } from "lucide-react";

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

export function TrailerPanel({ trailerUrl }: { trailerUrl: string | null }) {
  const embedUrl = trailerUrl ? getYouTubeEmbedUrl(trailerUrl) : null;

  return (
    <section className="portal-panel rounded-2xl p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-300">
            Official PV
          </p>
          <h2 className="mt-1 text-lg font-black text-white">Trailer</h2>
        </div>
        <PlayCircle className="h-9 w-9 text-cyan-200" aria-hidden="true" />
      </div>

      {embedUrl ? (
        <div className="mt-4 aspect-video overflow-hidden rounded-2xl border border-slate-800 bg-black">
          <iframe
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="h-full w-full"
            src={embedUrl}
            title="Official trailer"
          />
        </div>
      ) : trailerUrl ? (
        <Link
          className="portal-button-secondary mt-4 inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-black"
          href={trailerUrl}
          rel="noreferrer"
          target="_blank"
        >
          Official PV
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </Link>
      ) : (
        <p className="mt-3 text-sm leading-6 text-slate-400">
          No official PV is registered yet. This site does not host anime episodes.
        </p>
      )}
    </section>
  );
}
