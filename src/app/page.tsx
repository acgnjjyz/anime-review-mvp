import Link from "next/link";
import { ArrowRight, Heart, Sparkles, Trophy } from "lucide-react";

import { AnimeCard } from "@/components/AnimeCard";
import { EmptyState } from "@/components/EmptyState";
import { ScoreBadge } from "@/components/ScoreBadge";
import { SetupNotice } from "@/components/SetupNotice";
import { getCurrentUserProfile } from "@/lib/auth";
import { hasDatabaseEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { averageScore } from "@/lib/score";
import type { AnimeCardData } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  if (!hasDatabaseEnv()) {
    return <SetupNotice />;
  }

  const user = await getCurrentUserProfile();
  let animeList: AnimeCardData[] = [];
  let favorites: { animeId: string }[] = [];

  try {
    [animeList, favorites] = await Promise.all([
      prisma.anime.findMany({
        where: { isPublished: true },
        include: {
          reviews: { select: { score: true } },
          ratings: { select: { score: true } },
          _count: { select: { favorites: true } },
        },
        orderBy: [{ releaseYear: "desc" }, { title: "asc" }],
        take: 6,
      }),
      user
        ? prisma.favorite.findMany({
            where: { userId: user.id },
            select: { animeId: true },
          })
        : Promise.resolve([]),
    ]);
  } catch {
    return (
      <SetupNotice
        title="データベースに接続できません"
        description="DATABASE_URLが正しいか、SupabaseのPostgreSQLが利用できる状態か確認してください。"
        detail="接続後に npm.cmd run db:push と npm.cmd run db:seed を実行してください。"
      />
    );
  }

  const favoriteAnimeIds = new Set(favorites.map((favorite) => favorite.animeId));
  const rankedAnime = [...animeList]
    .map((anime) => ({
      ...anime,
      average: averageScore(anime.ratings),
    }))
    .filter((anime) => anime.average !== null)
    .sort((a, b) => (b.average ?? 0) - (a.average ?? 0))
    .slice(0, 3);

  return (
    <div className="bg-paper">
      <section
        className="relative overflow-hidden bg-ink"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(24,33,47,0.95), rgba(24,33,47,0.72), rgba(24,33,47,0.34)), url('https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1800&q=80')",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <div className="max-w-2xl text-white">
            <p className="inline-flex items-center gap-2 rounded bg-white/12 px-3 py-1 text-sm font-bold">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              アニメレビューMVP
            </p>
            <h1 className="mt-5 text-4xl font-black leading-tight sm:text-6xl">AniMemo</h1>
            <p className="mt-4 max-w-xl text-base leading-8 text-slate-100 sm:text-lg">
              作品を探して、点数と感想を残して、お気に入りをマイページで管理できます。
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                className="inline-flex h-11 items-center gap-2 rounded bg-coral px-5 text-sm font-black text-white transition hover:bg-rose-600"
                href="/anime"
              >
                作品を見る
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                className="inline-flex h-11 items-center gap-2 rounded border border-white/40 px-5 text-sm font-black text-white transition hover:bg-white/10"
                href="/ranking"
              >
                ランキング
                <Trophy className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-black text-coral">Anime</p>
              <h2 className="text-2xl font-black text-ink">新着作品</h2>
            </div>
            <Link className="text-sm font-bold text-mint hover:text-teal-700" href="/anime">
              すべて見る
            </Link>
          </div>
          {animeList.length === 0 ? (
            <EmptyState
              actionHref="/anime"
              actionLabel="一覧を見る"
              description="まだ作品データがありません。初期データを入れるには npm.cmd run db:seed を実行してください。"
              title="作品がありません"
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {animeList.slice(0, 4).map((anime) => (
                <AnimeCard
                  anime={anime}
                  isFavorite={favoriteAnimeIds.has(anime.id)}
                  key={anime.id}
                />
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div>
            <p className="text-sm font-black text-coral">Ranking</p>
            <h2 className="text-2xl font-black text-ink">平均点ランキング</h2>
          </div>
          {rankedAnime.length === 0 ? (
            <div className="rounded border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-600">
              まだレビューがありません。最初のレビューを投稿してランキングを作りましょう。
            </div>
          ) : (
            <div className="space-y-3">
              {rankedAnime.map((anime, index) => (
                <Link
                  className="flex items-center gap-3 rounded border border-slate-200 bg-white p-3 shadow-soft transition hover:border-mint"
                  href={`/anime/${anime.slug}`}
                  key={anime.id}
                >
                  <span className="grid h-9 w-9 place-items-center rounded bg-ink text-sm font-black text-white">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-black text-ink">{anime.title}</p>
                    <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                      <Heart className="h-3.5 w-3.5" aria-hidden="true" />
                      {anime._count.favorites} favorites
                    </p>
                  </div>
                  <ScoreBadge count={anime.ratings.length} score={anime.average} />
                </Link>
              ))}
            </div>
          )}
        </aside>
      </section>
    </div>
  );
}
