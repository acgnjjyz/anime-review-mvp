import { UiText } from "@/components/UiText";
import Link from "next/link";
import { Heart, MessageSquare } from "lucide-react";

import { ScoreBadge } from "@/components/ScoreBadge";
import { AnimePoster } from "@/components/AnimePoster";
import { AnimeHoverPreview } from "@/components/AnimeHoverPreview";
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
    <article className="portal-panel portal-anime-card portal-card-hover group overflow-hidden bg-panel">
      <AnimeHoverPreview
        anime={{
          slug: anime.slug,
          title: anime.title,
          titleEn: anime.titleEn,
          synopsis: anime.synopsis,
          studio: anime.studio,
          season: anime.season,
          episodes: anime.episodes,
          releaseYear: anime.releaseYear,
          genres: anime.genres,
          score,
          ratingCount: scoredItems.length,
          reviewCount: anime.reviews.length,
          isFavorite,
        }}
      >
        <Link className="block" href={`/anime/${anime.slug}`}>
          <div className="portal-media portal-anime-card-poster relative overflow-hidden">
            <AnimePoster
              alt={`${anime.title} poster`}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              src={anime.coverImage}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <div className="absolute left-2.5 right-2.5 top-2.5 flex items-start justify-between gap-2">
              <span className="min-w-0 truncate rounded-full border border-cyan-200/[0.15] bg-cyan-300/10 px-2 py-1 text-[0.68rem] font-black text-cyan-ink">
                <UiText text={primaryGenre} />
              </span>
              {isFavorite ? (
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-rose-300/30 bg-rose-500/20 text-rose-ink">
                  <Heart className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                  <span className="sr-only"><UiText text="Favorited" /></span>
                </span>
              ) : null}
            </div>
            {showPublishedBadge ? (
              <span
                className={
                  anime.isPublished
                    ? "absolute bottom-10 left-2.5 rounded-full border border-emerald-300/25 bg-emerald-500/20 px-2 py-1 text-[0.68rem] font-black text-emerald-ink"
                    : "absolute bottom-10 left-2.5 rounded-full border border-red-300/25 bg-red-500/20 px-2 py-1 text-[0.68rem] font-black text-red-ink"
                }
              >
                {anime.isPublished ? <UiText text={"Published"} /> : <UiText text={"Private"} />}
              </span>
            ) : null}
          </div>
        </Link>
        <div className="portal-anime-card-source">
          <OfficialSourceLink slug={anime.slug} title={anime.title} coverImage={anime.coverImage} />
        </div>
      </AnimeHoverPreview>

      <div className="portal-anime-card-body">
        <div className="flex min-w-0 items-center justify-center">
          <Link
            className="portal-anime-card-title line-clamp-2 text-center text-sm font-bold leading-5 text-heading transition hover:text-sky-ink"
            href={`/anime/${anime.slug}`}
            title={anime.title}
          >
            {anime.title}
          </Link>
        </div>

        <div className="flex min-w-0 items-center justify-center gap-2">
          <ScoreBadge score={score} compact />
          <span className="inline-flex items-center gap-1 text-xs text-muted">
            <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="sr-only"><UiText text="Reviews" /></span>
            {anime.reviews.length}
          </span>
        </div>
      </div>
    </article>
  );
}
