import Link from "next/link";
import { Heart, Tv } from "lucide-react";

import { averageScore } from "@/lib/score";
import { ScoreBadge } from "@/components/ScoreBadge";

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
    genres: string[];
    reviews: { score: number }[];
    ratings?: { score: number }[];
    _count?: { favorites: number };
  };
  isFavorite?: boolean;
};

export function AnimeCard({ anime, isFavorite = false }: AnimeCardProps) {
  const scoredItems = anime.ratings ?? anime.reviews;
  const score = averageScore(scoredItems);

  return (
    <article className="overflow-hidden rounded border border-slate-200 bg-white shadow-soft transition hover:-translate-y-0.5 hover:border-mint">
      <Link href={`/anime/${anime.slug}`}>
        <img
          alt={`${anime.title}のキービジュアル`}
          className="h-48 w-full object-cover"
          src={anime.coverImage}
        />
      </Link>
      <div className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link className="text-lg font-black text-ink hover:text-coral" href={`/anime/${anime.slug}`}>
              {anime.title}
            </Link>
            {anime.titleEn ? (
              <p className="mt-1 text-xs font-medium uppercase text-slate-400">{anime.titleEn}</p>
            ) : null}
          </div>
          {isFavorite ? (
            <Heart className="h-5 w-5 shrink-0 fill-coral text-coral" aria-label="お気に入り済み" />
          ) : null}
        </div>

        <p className="line-clamp-3 text-sm leading-6 text-slate-600">{anime.synopsis}</p>

        <div className="flex flex-wrap gap-2">
          {anime.genres.map((genre) => (
            <span key={genre} className="rounded bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">
              {genre}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <ScoreBadge count={scoredItems.length} score={score} />
          <span className="inline-flex items-center gap-1 text-sm font-medium text-slate-500">
            <Tv className="h-4 w-4" aria-hidden="true" />
            {anime.season} / {anime.episodes}話
          </span>
        </div>
      </div>
    </article>
  );
}
