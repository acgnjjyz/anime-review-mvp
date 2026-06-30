import Link from "next/link";
import { redirect } from "next/navigation";
import { Heart, MessageSquare, Star } from "lucide-react";

import { AnimeCard } from "@/components/AnimeCard";
import { EmptyState } from "@/components/EmptyState";
import { ScoreBadge } from "@/components/ScoreBadge";
import { SetupNotice } from "@/components/SetupNotice";
import { getSyncedCurrentUser } from "@/lib/auth";
import { hasDatabaseEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function MyPage() {
  if (!hasDatabaseEnv()) {
    return <SetupNotice />;
  }

  const user = await getSyncedCurrentUser();

  if (!user) {
    redirect("/login?message=マイページを見るにはログインしてください。");
  }

  let profile = null;

  try {
    profile = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        reviews: {
          where: {
            anime: { isPublished: true },
          },
          include: {
            anime: true,
          },
          orderBy: { updatedAt: "desc" },
        },
        favorites: {
          where: {
            anime: { isPublished: true },
          },
          include: {
            anime: {
              include: {
                reviews: { select: { score: true } },
                ratings: { select: { score: true } },
                _count: { select: { favorites: true } },
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 3,
        },
      },
    });
  } catch {
    return (
      <SetupNotice
        title="マイページを読み込めません"
        description="データベース接続に失敗しました。DATABASE_URLとSupabaseのDB状態を確認してください。"
      />
    );
  }

  if (!profile) {
    redirect("/login");
  }

  const average =
    profile.reviews.length === 0
      ? null
      : profile.reviews.reduce((sum, review) => sum + review.score, 0) / profile.reviews.length;

  return (
    <div className="bg-paper">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-9">
          <p className="text-sm font-black text-coral">My Page</p>
          <h1 className="mt-2 text-3xl font-black text-ink">{profile.name ?? "ユーザー"}さん</h1>
          <p className="mt-2 text-sm text-slate-500">{profile.email}</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-4">
          <div className="rounded border border-slate-200 bg-white p-5">
            <h2 className="text-xl font-black text-ink">活動サマリー</h2>
            <div className="mt-4 grid gap-3">
              <div className="flex items-center justify-between rounded bg-slate-50 p-3">
                <span className="inline-flex items-center gap-2 font-bold text-slate-600">
                  <MessageSquare className="h-4 w-4 text-mint" aria-hidden="true" />
                  レビュー
                </span>
                <span className="text-lg font-black text-ink">{profile.reviews.length}</span>
              </div>
              <div className="flex items-center justify-between rounded bg-slate-50 p-3">
                <span className="inline-flex items-center gap-2 font-bold text-slate-600">
                  <Heart className="h-4 w-4 text-coral" aria-hidden="true" />
                  お気に入り
                </span>
                <span className="text-lg font-black text-ink">{profile.favorites.length}</span>
              </div>
              <div className="flex items-center justify-between rounded bg-slate-50 p-3">
                <span className="inline-flex items-center gap-2 font-bold text-slate-600">
                  <Star className="h-4 w-4 text-honey" aria-hidden="true" />
                  平均点
                </span>
                <ScoreBadge score={average} />
              </div>
            </div>
          </div>
        </aside>

        <div className="space-y-8">
          <section>
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-2xl font-black text-ink">自分のレビュー</h2>
              <Link className="text-sm font-bold text-mint hover:text-teal-700" href="/anime">
                作品を探す
              </Link>
            </div>
            {profile.reviews.length === 0 ? (
              <EmptyState
                actionHref="/anime"
                actionLabel="作品を探す"
                description="作品詳細ページからレビューを投稿すると、ここに表示されます。"
                title="まだレビューを書いていません"
              />
            ) : (
              <div className="space-y-4">
                {profile.reviews.map((review) => (
                  <Link
                    className="block rounded border border-slate-200 bg-white p-5 transition hover:border-mint"
                    href={`/anime/${review.anime.slug}`}
                    key={review.id}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-coral">{review.anime.title}</p>
                        <h3 className="mt-1 text-lg font-black text-ink">{review.title}</h3>
                      </div>
                      <ScoreBadge score={review.score} />
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                      {review.body}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-2xl font-black text-ink">最近のお気に入り</h2>
              <Link className="text-sm font-bold text-mint hover:text-teal-700" href="/favorites">
                すべて見る
              </Link>
            </div>
            {profile.favorites.length === 0 ? (
              <EmptyState
                actionHref="/anime"
                actionLabel="作品を探す"
                description="作品詳細ページでお気に入りを押すと、ここに表示されます。"
                title="お気に入りはまだありません"
              />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {profile.favorites.map((favorite) => (
                  <AnimeCard anime={favorite.anime} isFavorite key={favorite.id} />
                ))}
              </div>
            )}
          </section>
        </div>
      </section>
    </div>
  );
}
