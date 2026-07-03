import Link from "next/link";
import { Crown, Medal, MessageSquare, Tags } from "lucide-react";

import { EmptyState } from "@/components/EmptyState";
import { ScoreBadge } from "@/components/ScoreBadge";
import { SetupNotice } from "@/components/SetupNotice";
import { hasDatabaseEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { averageScore } from "@/lib/score";
import type { AnimeCardData } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function RankingPage() {
  if (!hasDatabaseEnv()) {
    return <SetupNotice />;
  }

  let animeList: AnimeCardData[] = [];

  try {
    animeList = await prisma.anime.findMany({
      where: { isPublished: true },
      include: {
        reviews: { select: { score: true } },
        ratings: { select: { score: true } },
        _count: { select: { favorites: true } },
      },
    });
  } catch {
    return (
      <SetupNotice
        title="Could not load ranking"
        description="Check the database connection and Supabase PostgreSQL status."
        detail="When the connection works, run npm.cmd run db:push and npm.cmd run db:seed."
      />
    );
  }

  const ranking = animeList
    .map((anime) => ({
      ...anime,
      average: averageScore(anime.ratings),
    }))
    .filter((anime) => anime.average !== null)
    .sort((a, b) => {
      const scoreDiff = (b.average ?? 0) - (a.average ?? 0);
      if (scoreDiff !== 0) return scoreDiff;
      return b.reviews.length - a.reviews.length;
    });
  const topThree = ranking.slice(0, 3);
  const rest = ranking.slice(3);
  const genres = Array.from(new Set(animeList.flatMap((anime) => anime.genres))).slice(0, 12);

  return (
    <div className="portal-shell">
      <section className="border-b border-white/10 bg-[#08080d]/72">
        <div className="mx-auto max-w-[1640px] px-3 py-6 sm:px-4 lg:px-6">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-200">Ranking</p>
          <h1 className="mt-1 text-3xl font-black text-white lg:text-4xl">Top Rated Anime</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Rankings are recalculated from the latest ratings after review edits or deletes.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1640px] gap-5 px-3 py-6 sm:px-4 lg:grid-cols-[minmax(0,1fr)_300px] lg:px-6">
        <div className="space-y-6">
          {ranking.length === 0 ? (
            <EmptyState
              actionHref="/anime"
              actionLabel="Open Anime"
              description="Ratings from reviews will build this ranking."
              title="No ranking yet"
            />
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                {topThree.map((anime, index) => (
                  <Link
                    className={
                      index === 0
                        ? "portal-panel portal-card-hover overflow-hidden rounded-2xl border-amber-300/35 md:-mt-3"
                        : "portal-panel portal-card-hover overflow-hidden rounded-2xl"
                    }
                    href={`/anime/${anime.slug}`}
                    key={anime.id}
                  >
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <img
                        alt={`${anime.title} poster`}
                        className="h-full w-full object-cover transition duration-300 hover:scale-105"
                        src={anime.coverImage}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                      <span className="absolute left-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-amber-300 text-base font-black text-slate-950">
                        {index + 1}
                      </span>
                      {index === 0 ? (
                        <Crown className="absolute right-4 top-4 h-8 w-8 text-amber-200" aria-hidden="true" />
                      ) : (
                        <Medal className="absolute right-4 top-4 h-7 w-7 text-violet-200" aria-hidden="true" />
                      )}
                    </div>
                    <div className="space-y-2.5 p-4">
                      <ScoreBadge count={anime.ratings.length} score={anime.average} />
                      <h2 className="line-clamp-2 text-lg font-black text-white">{anime.title}</h2>
                      <p className="line-clamp-2 text-xs leading-5 text-slate-400">{anime.synopsis}</p>
                      <div className="flex flex-wrap gap-2">
                        {anime.genres.slice(0, 2).map((genre) => (
                          <span className="portal-chip rounded-full px-2.5 py-1 text-xs font-black" key={genre}>
                            {genre}
                          </span>
                        ))}
                      </div>
                      <p className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500">
                        <MessageSquare className="h-4 w-4 text-cyan-300" aria-hidden="true" />
                        {anime.reviews.length} reviews · {anime.releaseYear}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>

              {rest.length > 0 ? (
                <div className="space-y-3">
                  {rest.map((anime, index) => (
                    <Link
                      className="portal-panel-soft portal-card-hover grid gap-3 rounded-2xl p-3 md:grid-cols-[52px_82px_1fr_auto]"
                      href={`/anime/${anime.slug}`}
                      key={anime.id}
                    >
                      <div className="flex items-center gap-3 md:justify-center">
                        <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-black/45 text-sm font-black text-white">
                          {index + 4}
                        </span>
                      </div>
                      <img
                        alt={`${anime.title} poster`}
                        className="aspect-[3/4] w-full rounded-xl object-cover md:h-24"
                        src={anime.coverImage}
                      />
                      <div className="min-w-0">
                        <h2 className="text-base font-black text-white">{anime.title}</h2>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">
                          {anime.synopsis}
                        </p>
                        <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                          <MessageSquare className="h-4 w-4" aria-hidden="true" />
                          {anime.reviews.length} reviews · {anime.genres[0] ?? "Anime"} ·{" "}
                          {anime.releaseYear}
                        </p>
                      </div>
                      <div className="flex items-center md:justify-end">
                        <ScoreBadge count={anime.ratings.length} score={anime.average} />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : null}
            </>
          )}
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="portal-panel rounded-2xl p-5">
            <h2 className="inline-flex items-center gap-2 text-lg font-black text-white">
              <Tags className="h-5 w-5 text-cyan-200" aria-hidden="true" />
              Genres
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {genres.map((genre) => (
                <Link
                  className="portal-chip rounded-full px-3 py-1.5 text-xs font-black transition hover:border-cyan-200/60 hover:text-white"
                  href={`/anime?genre=${encodeURIComponent(genre)}&sort=score`}
                  key={genre}
                >
                  {genre}
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
