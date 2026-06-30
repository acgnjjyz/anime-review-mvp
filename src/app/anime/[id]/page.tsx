import Link from "next/link";
import { UserRole } from "@prisma/client";
import { CalendarDays, Clapperboard, Heart, MessageSquare, Tv } from "lucide-react";
import { notFound } from "next/navigation";

import { CommentForm } from "@/components/CommentForm";
import { CommentList } from "@/components/CommentList";
import { EmptyState } from "@/components/EmptyState";
import { FavoriteButton } from "@/components/FavoriteButton";
import { MessageBanner } from "@/components/MessageBanner";
import { ReportForm } from "@/components/ReportForm";
import { ReviewForm } from "@/components/ReviewForm";
import { ReviewLikeButton } from "@/components/ReviewLikeButton";
import { ScoreBadge } from "@/components/ScoreBadge";
import { SetupNotice } from "@/components/SetupNotice";
import { getCurrentUserProfile } from "@/lib/auth";
import { hasDatabaseEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { averageScore } from "@/lib/score";

export const dynamic = "force-dynamic";

type AnimeDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function AnimeDetailPage({
  params,
  searchParams,
}: AnimeDetailPageProps) {
  if (!hasDatabaseEnv()) {
    return <SetupNotice />;
  }

  const [{ id }, query, user] = await Promise.all([
    params,
    searchParams,
    getCurrentUserProfile(),
  ]);

  let anime = null;

  try {
    anime = await prisma.anime.findUnique({
      where: { slug: id },
      include: {
        ratings: { select: { score: true } },
        reviews: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
            likes: {
              select: {
                userId: true,
              },
            },
            reports: {
              select: {
                reporterId: true,
              },
            },
            _count: {
              select: {
                likes: true,
              },
            },
          },
          orderBy: { updatedAt: "desc" },
        },
        comments: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
            reports: {
              select: {
                reporterId: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: { select: { favorites: true } },
      },
    });
  } catch {
    return (
      <SetupNotice
        title="作品詳細を読み込めません"
        description="データベース接続に失敗しました。DATABASE_URLとSupabaseのDB状態を確認してください。"
        detail="接続後に npm.cmd run db:push と npm.cmd run db:seed を実行してください。"
      />
    );
  }

  const isAdmin = user?.role === UserRole.ADMIN;

  if (!anime || (!anime.isPublished && !isAdmin)) {
    notFound();
  }

  let favorite = null;

  try {
    favorite = user
      ? await prisma.favorite.findUnique({
          where: {
            animeId_userId: {
              animeId: anime.id,
              userId: user.id,
            },
          },
        })
      : null;
  } catch {
    return (
      <SetupNotice
        title="お気に入り状態を読み込めません"
        description="データベース接続に失敗しました。DATABASE_URLを確認してください。"
      />
    );
  }

  const score = averageScore(anime.ratings);
  const myReview = user
    ? anime.reviews.find((review) => review.userId === user.id)
    : null;

  return (
    <div className="bg-paper">
      <section className="bg-ink text-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[340px_1fr]">
          <img
            alt={`${anime.title}のキービジュアル`}
            className="aspect-[4/5] w-full rounded object-cover shadow-soft"
            src={anime.coverImage}
          />
          <div className="flex flex-col justify-center">
            <div className="flex flex-wrap gap-2">
              {!anime.isPublished ? (
                <span className="rounded bg-coral px-2 py-1 text-xs font-black text-white">
                  非公開
                </span>
              ) : null}
              {anime.genres.map((genre) => (
                <span key={genre} className="rounded bg-white/12 px-2 py-1 text-xs font-bold">
                  {genre}
                </span>
              ))}
            </div>
            <h1 className="mt-5 text-4xl font-black leading-tight">{anime.title}</h1>
            {anime.titleEn ? (
              <p className="mt-2 text-sm font-bold uppercase text-slate-300">{anime.titleEn}</p>
            ) : null}
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-100">{anime.synopsis}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <ScoreBadge count={anime.ratings.length} score={score} />
              <span className="inline-flex items-center gap-2 rounded bg-white/12 px-3 py-1.5 text-sm font-bold">
                <Heart className="h-4 w-4" aria-hidden="true" />
                {anime._count.favorites}
              </span>
              <FavoriteButton
                animeId={anime.id}
                isFavorite={Boolean(favorite)}
                isLoggedIn={Boolean(user)}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <MessageBanner error={query.error} message={query.message} />
          <ReviewForm animeId={anime.id} existingReview={myReview} isLoggedIn={Boolean(user)} />

          <div>
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-2xl font-black text-ink">レビュー</h2>
              <span className="text-sm font-bold text-slate-500">{anime.reviews.length}件</span>
            </div>
            {anime.reviews.length === 0 ? (
              <EmptyState
                description="ログインすると、この作品への最初のレビューを書けます。"
                title="まだレビューがありません"
              />
            ) : (
              <div className="space-y-4">
                {anime.reviews.map((review) => {
                  const isLiked = Boolean(
                    user && review.likes.some((like) => like.userId === user.id),
                  );
                  const isReported = Boolean(
                    user && review.reports.some((report) => report.reporterId === user.id),
                  );

                  return (
                    <article className="rounded border border-slate-200 bg-white p-5" key={review.id}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-black text-ink">{review.title}</h3>
                          <p className="mt-1 text-sm text-slate-500">
                            {review.user.name ?? "匿名ユーザー"} ・{" "}
                            {review.updatedAt.toLocaleDateString("ja-JP")}
                          </p>
                        </div>
                        <ScoreBadge score={review.score} />
                      </div>
                      <p className="mt-4 whitespace-pre-wrap leading-8 text-slate-700">{review.body}</p>
                      <div className="mt-4 flex flex-wrap items-start gap-3">
                        <ReviewLikeButton
                          count={review._count.likes}
                          isLiked={isLiked}
                          isLoggedIn={Boolean(user)}
                          reviewId={review.id}
                        />
                        <ReportForm
                          isLoggedIn={Boolean(user)}
                          isReported={isReported}
                          targetId={review.id}
                          targetType="REVIEW"
                        />
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-2xl font-black text-ink">コメント</h2>
              <span className="text-sm font-bold text-slate-500">{anime.comments.length}件</span>
            </div>
            <CommentForm animeId={anime.id} isLoggedIn={Boolean(user)} />
            {anime.comments.length === 0 ? (
              <div className="mt-4">
                <EmptyState
                  description="この作品へのコメントはまだありません。ログインすると最初のコメントを書けます。"
                  title="コメントはまだありません"
                />
              </div>
            ) : (
              <div className="mt-4">
                <CommentList comments={anime.comments} currentUserId={user?.id ?? null} />
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded border border-slate-200 bg-white p-5">
            <h2 className="text-xl font-black text-ink">作品情報</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Clapperboard className="h-4 w-4 text-mint" aria-hidden="true" />
                <dt className="w-20 font-bold text-slate-500">制作</dt>
                <dd className="font-medium text-ink">{anime.studio}</dd>
              </div>
              <div className="flex items-center gap-3">
                <CalendarDays className="h-4 w-4 text-mint" aria-hidden="true" />
                <dt className="w-20 font-bold text-slate-500">放送</dt>
                <dd className="font-medium text-ink">{anime.season}</dd>
              </div>
              <div className="flex items-center gap-3">
                <Tv className="h-4 w-4 text-mint" aria-hidden="true" />
                <dt className="w-20 font-bold text-slate-500">話数</dt>
                <dd className="font-medium text-ink">{anime.episodes}話</dd>
              </div>
              <div className="flex items-center gap-3">
                <MessageSquare className="h-4 w-4 text-mint" aria-hidden="true" />
                <dt className="w-20 font-bold text-slate-500">レビュー</dt>
                <dd className="font-medium text-ink">{anime.reviews.length}件</dd>
              </div>
              <div className="flex items-center gap-3">
                <MessageSquare className="h-4 w-4 text-mint" aria-hidden="true" />
                <dt className="w-20 font-bold text-slate-500">コメント</dt>
                <dd className="font-medium text-ink">{anime.comments.length}件</dd>
              </div>
            </dl>
          </div>
          <Link
            className="block rounded border border-slate-200 bg-white p-5 font-bold text-mint transition hover:border-mint"
            href="/anime"
          >
            作品一覧へ戻る
          </Link>
        </aside>
      </section>
    </div>
  );
}
