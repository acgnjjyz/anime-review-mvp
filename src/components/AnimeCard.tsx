import Link from "next/link";
import { ArrowUpRight, Calendar, Heart, MessageSquare, Sparkles } from "lucide-react";

import { ScoreBadge } from "@/components/ScoreBadge";
import { AnimePoster } from "@/components/AnimePoster";
import { OfficialSourceLink } from "@/components/OfficialSourceLink";
import { averageScore } from "@/lib/score";

type AnimeCardProps = {
  anime: {
    slug: string;
    title: string;
    titleEn: string | null;
    synopsis: string;
    coverImage: string;
    studio: string;
    season: string;
    episodes: number;
    releaseYear: number;
    genres: string[];
    reviews: { score: number }[];
    ratings?: { score: number }[];
    _count?: { favorites: number };
    isPublished?: boolean;
  };
  isFavorite?: boolean;
  showPublishedBadge?: boolean;
};

export function AnimeCard({
  anime,
  isFavorite = false,
  showPublishedBadge = false,
}: AnimeCardProps) {
  const scoredItems = anime.ratings ?? anime.reviews;
  const score = averageScore(scoredItems);
  const primaryGenre = anime.genres[0] ?? "Anime";

  return (
    <article className="portal-panel portal-card-hover group overflow-hidden rounded-2xl bg-panel">
      <Link className="block" href={`/anime/${anime.slug}`}>
        <div className="portal-media relative aspect-[0.74] overflow-hidden">
          <AnimePoster
            alt={`${anime.title} poster`}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            src={anime.coverImage}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050509] via-black/[0.28] to-transparent opacity-95" />
          <div className="absolute left-2.5 right-2.5 top-2.5 flex items-start justify-between gap-2">
            <span className="rounded-full border border-cyan-200/[0.15] bg-cyan-300/10 px-2 py-1 text-[0.68rem] font-black text-cyan-ink">
              {primaryGenre}
            </span>
            {isFavorite ? (
              <span className="grid h-8 w-8 place-items-center rounded-full border border-rose-300/30 bg-rose-500/20 text-rose-ink">
                <Heart className="h-3.5 w-3.5 fill-current" aria-label="Favorited" />
              </span>
            ) : null}
          </div>
          {showPublishedBadge ? (
            <span
              className={
                anime.isPublished
                  ? "absolute bottom-2.5 left-2.5 rounded-full border border-emerald-300/25 bg-emerald-500/20 px-2 py-1 text-[0.68rem] font-black text-emerald-ink"
                  : "absolute bottom-2.5 left-2.5 rounded-full border border-red-300/25 bg-red-500/20 px-2 py-1 text-[0.68rem] font-black text-red-ink"
              }
            >
              {anime.isPublished ? "Published" : "Private"}
            </span>
          ) : null}
          <span className="absolute bottom-2.5 right-2.5 inline-flex translate-y-2 items-center gap-1 rounded-full bg-violet-500/25 px-2.5 py-1.5 text-[0.68rem] font-black text-heading opacity-0 backdrop-blur transition group-hover:translate-y-0 group-hover:opacity-100">
            Details
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        </div>
      </Link>

      <div className="space-y-3 p-3">
        <OfficialSourceLink slug={anime.slug} title={anime.title} coverImage={anime.coverImage} />
        <div className="min-h-[3.2rem]">
          <Link
            className="line-clamp-2 text-base font-black leading-snug text-heading transition hover:text-sky-ink"
            href={`/anime/${anime.slug}`}
          >
            {anime.title}
          </Link>
          {anime.titleEn ? (
            <p className="mt-1 line-clamp-1 text-xs font-bold uppercase tracking-wide text-muted">
              {anime.titleEn}
            </p>
          ) : null}
        </div>

        <p className="line-clamp-2 min-h-10 text-xs leading-5 text-muted">
          {anime.synopsis}
        </p>

        <div className="flex flex-wrap gap-2">
          {anime.genres.slice(0, 3).map((genre) => (
            <span
              className="rounded-full border border-line/10 bg-depth/[0.35] px-2 py-1 text-[0.68rem] font-bold text-secondary"
              key={genre}
            >
              {genre}
            </span>
          ))}
        </div>

        <div className="grid gap-2 border-t border-line/10 pt-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <ScoreBadge count={scoredItems.length} score={score} compact />
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-muted">
              <MessageSquare className="h-4 w-4 text-sky-ink" aria-hidden="true" />
              {anime.reviews.length}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-[0.68rem] font-bold text-muted">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-violet-ink" aria-hidden="true" />
              {anime.releaseYear}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-cyan-ink" aria-hidden="true" />
              {anime.studio}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
