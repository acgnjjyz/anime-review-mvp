import Link from "next/link";
import { Medal, MessageSquare } from "lucide-react";

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
        title="ランキングを読み込めません"
        description="データベース接続に失敗しました。DATABASE_URLとSupabaseのDB状態を確認してください。"
        detail="接続後に npm.cmd run db:push と npm.cmd run db:seed を実行してください。"
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

  return (
    <div className="bg-paper">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-9">
          <p className="text-sm font-black text-coral">Ranking</p>
          <h1 className="mt-2 text-3xl font-black text-ink">平均点ランキング</h1>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        {ranking.length === 0 ? (
          <EmptyState
            actionHref="/anime"
            actionLabel="作品一覧へ"
            description="レビューまたは評価が投稿されるとランキングが表示されます。初期データは npm.cmd run db:seed で投入できます。"
            title="ランキングはまだありません"
          />
        ) : (
          <div className="space-y-4">
            {ranking.map((anime, index) => (
              <Link
                className="grid gap-4 rounded border border-slate-200 bg-white p-4 shadow-soft transition hover:border-mint md:grid-cols-[72px_140px_1fr_auto]"
                href={`/anime/${anime.slug}`}
                key={anime.id}
              >
                <div className="flex items-center gap-3 md:justify-center">
                  <span className="grid h-12 w-12 place-items-center rounded bg-ink text-lg font-black text-white">
                    {index + 1}
                  </span>
                  {index < 3 ? <Medal className="h-5 w-5 text-honey" aria-hidden="true" /> : null}
                </div>
                <img
                  alt={`${anime.title}のキービジュアル`}
                  className="h-28 w-full rounded object-cover md:h-24"
                  src={anime.coverImage}
                />
                <div className="min-w-0">
                  <h2 className="text-xl font-black text-ink">{anime.title}</h2>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                    {anime.synopsis}
                  </p>
                  <p className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-slate-500">
                    <MessageSquare className="h-4 w-4" aria-hidden="true" />
                    {anime.ratings.length} ratings
                  </p>
                </div>
                <div className="flex items-center md:justify-end">
                  <ScoreBadge count={anime.ratings.length} score={anime.average} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
