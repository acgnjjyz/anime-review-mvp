import Link from "next/link";
import { UserRole } from "@prisma/client";
import {
  CalendarDays,
  Clapperboard,
  Heart,
  MessageSquare,
  MessageSquareText,
  Tv,
} from "lucide-react";
import { notFound } from "next/navigation";

import { CommentForm } from "@/components/CommentForm";
import { AnimePoster } from "@/components/AnimePoster";
import { OfficialSourceLink } from "@/components/OfficialSourceLink";
import { CommentList } from "@/components/CommentList";
import { EmptyState } from "@/components/EmptyState";
import { FavoriteButton } from "@/components/FavoriteButton";
import { MessageBanner } from "@/components/MessageBanner";
import { ReportForm } from "@/components/ReportForm";
import { ReviewForm } from "@/components/ReviewForm";
import { ReviewLikeButton } from "@/components/ReviewLikeButton";
import { ScoreBadge } from "@/components/ScoreBadge";
import { SetupNotice } from "@/components/SetupNotice";
import { TagVotePanel } from "@/components/TagVotePanel";
import { TrailerPanel } from "@/components/TrailerPanel";
import { TrailerModalButton } from "@/components/TrailerModalButton";
import { WatchStatusForm } from "@/components/WatchStatusForm";
import { getCurrentUserProfile } from "@/lib/auth";
import { hasDatabaseEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { averageScore } from "@/lib/score";
import officialImages from "../../../../public/data/official-anime-images.json";

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
        tagVotes: {
          include: {
            tag: true,
          },
        },
        _count: { select: { favorites: true } },
      },
    });
  } catch {
    return (
      <SetupNotice
        title="Could not load anime detail"
        description="Check the database connection and Supabase PostgreSQL status."
        detail="When the connection works, run npm.cmd run db:push and npm.cmd run db:seed."
      />
    );
  }

  const isAdmin = user?.role === UserRole.ADMIN;

  if (!anime || (!anime.isPublished && !isAdmin)) {
    notFound();
  }

  let favorite = null;
  let currentShelf = null;
  let allTags: { id: string; name: string }[] = [];
  let relatedAnime: {
    id: string;
    slug: string;
    title: string;
    coverImage: string;
    releaseYear: number;
    ratings: { score: number }[];
  }[] = [];

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
    currentShelf = user
      ? await prisma.animeShelf.findUnique({
          where: {
            animeId_userId: {
              animeId: anime.id,
              userId: user.id,
            },
          },
        })
      : null;
    allTags = await prisma.animeTag.findMany({
      orderBy: { name: "asc" },
    });
    relatedAnime = await prisma.anime.findMany({
      where: {
        id: { not: anime.id },
        isPublished: true,
        genres: { hasSome: anime.genres },
      },
      select: {
        id: true,
        slug: true,
        title: true,
        coverImage: true,
        releaseYear: true,
        ratings: { select: { score: true } },
      },
      orderBy: [{ releaseYear: "desc" }, { title: "asc" }],
      take: 6,
    });
  } catch {
    return (
      <SetupNotice
        title="Could not load favorite state"
        description="Check the database connection and try again."
      />
    );
  }

  const score = averageScore(anime.ratings);
  const officialImage = officialImages.matches.find(image => image.slug === anime.slug && image.coverImage === anime.coverImage);
  const myReview = user
    ? anime.reviews.find((review) => review.userId === user.id)
    : null;
  const tagVotes = allTags
    .map((tag) => {
      const votes = anime.tagVotes.filter((vote) => vote.tagId === tag.id);

      return {
        id: tag.id,
        name: tag.name,
        count: votes.length,
        isVoted: Boolean(user && votes.some((vote) => vote.userId === user.id)),
      };
    })
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "ja"));

  return (
    <div className="portal-shell">
      <section className="portal-media relative isolate overflow-hidden">
        <div
          className="absolute inset-0 -z-10 scale-105 bg-cover bg-center opacity-42 blur-sm"
          style={{ backgroundImage: `url(${anime.coverImage})` }}
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#050509] via-[#050509]/[0.92] to-[#050509]/[0.42]" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-36 bg-gradient-to-t from-[#050509] to-transparent" />

        <div className="mx-auto grid max-w-[1640px] gap-6 px-3 py-7 sm:px-4 lg:grid-cols-[260px_1fr] lg:px-6 lg:py-9 xl:grid-cols-[300px_1fr]">
          <div>
          <AnimePoster
            alt={`${anime.title} poster`}
            className="aspect-[3/4] w-full max-w-sm rounded-3xl border border-line/10 object-cover shadow-[0_28px_80px_rgba(0,0,0,0.4)]"
            src={anime.coverImage}
          />
          {officialImage ? (
            <p className="mt-2 max-w-sm break-words text-xs leading-5 text-muted">
              <a href={officialImage.sourceUrl} className="text-cyan-ink hover:underline">画像出典：スタジオジブリ公式作品静止画</a>
              <br />{officialImage.copyright}
            </p>
          ) : null}
          <OfficialSourceLink slug={anime.slug} title={anime.title} coverImage={anime.coverImage} showSearch />
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex flex-wrap gap-2">
              {!anime.isPublished ? (
                <span className="rounded-full border border-red-300/30 bg-red-500/20 px-3 py-1 text-xs font-black text-red-ink">
                  Private preview
                </span>
              ) : null}
              {anime.genres.map((genre) => (
                <span className="portal-chip rounded-full px-3 py-1 text-xs font-black" key={genre}>
                  {genre}
                </span>
              ))}
            </div>
            <h1 className="mt-4 text-4xl font-black leading-tight text-heading sm:text-6xl">
              {anime.title}
            </h1>
            {anime.titleEn ? (
              <p className="mt-2 text-sm font-bold uppercase tracking-[0.2em] text-muted">
                {anime.titleEn}
              </p>
            ) : null}
            <p className="mt-4 max-w-3xl text-sm leading-7 text-secondary sm:text-base">{anime.synopsis}</p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <ScoreBadge count={anime.ratings.length} score={score} />
              <span className="inline-flex items-center gap-2 rounded-full border border-stroke/25 bg-field/70 px-3 py-1.5 text-sm font-bold text-secondary">
                <Heart className="h-4 w-4 text-rose-ink" aria-hidden="true" />
                {anime._count.favorites} favorites
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-stroke/25 bg-field/70 px-3 py-1.5 text-sm font-bold text-secondary">
                <MessageSquare className="h-4 w-4 text-cyan-ink" aria-hidden="true" />
                {anime.reviews.length} reviews
              </span>
            </div>
            <div className="mt-8 flex flex-wrap items-start gap-3">
              <TrailerModalButton trailerUrl={anime.trailerUrl} />
              <FavoriteButton
                animeId={anime.id}
                isFavorite={Boolean(favorite)}
                isLoggedIn={Boolean(user)}
              />
              <Link
                className="portal-button-secondary inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-black"
                href="#review-form"
              >
                <MessageSquareText className="h-4 w-4" aria-hidden="true" />
                Review
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1640px] gap-5 px-3 py-6 sm:px-4 lg:grid-cols-[minmax(0,1fr)_300px] lg:px-6">
        <div className="space-y-6">
          <MessageBanner error={query.error} message={query.message} />
          <ReviewForm animeId={anime.id} existingReview={myReview} isLoggedIn={Boolean(user)} />

          <section>
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-2xl font-black text-heading">Reviews</h2>
              <span className="text-sm font-bold text-muted">{anime.reviews.length}</span>
            </div>
            {anime.reviews.length === 0 ? (
              <EmptyState
                description="Log in and become the first person to review this anime."
                title="No reviews yet"
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
                    <article className="portal-panel-soft rounded-2xl p-5" key={review.id}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-black text-heading">{review.title}</h3>
                          <p className="mt-1 text-sm text-muted">
                            {review.user.name ?? "Anonymous"} /{" "}
                            {review.updatedAt.toLocaleDateString("ja-JP")}
                          </p>
                        </div>
                        <ScoreBadge score={review.score} />
                      </div>
                      <p className="mt-4 whitespace-pre-wrap leading-8 text-secondary">
                        {review.body}
                      </p>
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
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-2xl font-black text-heading">Comments</h2>
              <span className="text-sm font-bold text-muted">{anime.comments.length}</span>
            </div>
            <CommentForm animeId={anime.id} isLoggedIn={Boolean(user)} />
            {anime.comments.length === 0 ? (
              <div className="mt-4">
                <EmptyState
                  description="Comments from logged-in users will appear here."
                  title="No comments yet"
                />
              </div>
            ) : (
              <div className="mt-4">
                <CommentList comments={anime.comments} currentUserId={user?.id ?? null} />
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-3 lg:sticky lg:top-[72px] lg:self-start">
          <WatchStatusForm
            animeId={anime.id}
            currentStatus={currentShelf?.status ?? null}
            isLoggedIn={Boolean(user)}
          />

          <TagVotePanel animeId={anime.id} isLoggedIn={Boolean(user)} tags={tagVotes} />

          <div className="portal-panel rounded-2xl p-5">
            <h2 className="text-xl font-black text-heading">Anime Info</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Clapperboard className="h-4 w-4 text-cyan-ink" aria-hidden="true" />
                <dt className="w-24 font-bold text-muted">Studio</dt>
                <dd className="font-medium text-secondary">{anime.studio}</dd>
              </div>
              <div className="flex items-center gap-3">
                <CalendarDays className="h-4 w-4 text-cyan-ink" aria-hidden="true" />
                <dt className="w-24 font-bold text-muted">Season</dt>
                <dd className="font-medium text-secondary">{anime.season}</dd>
              </div>
              <div className="flex items-center gap-3">
                <CalendarDays className="h-4 w-4 text-cyan-ink" aria-hidden="true" />
                <dt className="w-24 font-bold text-muted">Year</dt>
                <dd className="font-medium text-secondary">{anime.releaseYear}</dd>
              </div>
              <div className="flex items-center gap-3">
                <Tv className="h-4 w-4 text-cyan-ink" aria-hidden="true" />
                <dt className="w-24 font-bold text-muted">Episodes</dt>
                <dd className="font-medium text-secondary">{anime.episodes}</dd>
              </div>
              <div className="flex items-center gap-3">
                <MessageSquare className="h-4 w-4 text-cyan-ink" aria-hidden="true" />
                <dt className="w-24 font-bold text-muted">Reviews</dt>
                <dd className="font-medium text-secondary">{anime.reviews.length}</dd>
              </div>
            </dl>
          </div>

          <div id="official-pv">
            <TrailerPanel trailerUrl={anime.trailerUrl} />
          </div>

          <section className="portal-panel rounded-2xl p-4">
            <h2 className="text-base font-black text-heading">Related Anime</h2>
            <div className="mt-3 space-y-2">
              {relatedAnime.length === 0 ? (
                <p className="text-xs leading-5 text-muted">No related titles yet.</p>
              ) : (
                relatedAnime.map((item, index) => (
                  <Link
                    className="grid grid-cols-[24px_42px_1fr] items-center gap-2 rounded-xl border border-line/[0.07] bg-depth/30 p-2 transition hover:border-violet-300/40"
                    href={`/anime/${item.slug}`}
                    key={item.id}
                  >
                    <span className="text-xs font-black text-violet-ink">{index + 1}</span>
                    <AnimePoster
                      alt={`${item.title} poster`}
                      className="h-14 w-10 rounded-lg object-cover"
                      src={item.coverImage}
                    />
                    <span className="min-w-0">
                      <span className="line-clamp-2 text-xs font-black text-heading">{item.title}</span>
                      <span className="mt-1 block text-[0.68rem] font-bold text-muted">
                        {item.releaseYear} / {averageScore(item.ratings)?.toFixed(1) ?? "未評価"}
                      </span>
                    </span>
                  </Link>
                ))
              )}
            </div>
          </section>

          <Link
            className="portal-button-secondary block rounded-2xl p-5 text-sm font-black"
            href="/anime"
          >
            Back to Anime
          </Link>
        </aside>
      </section>
    </div>
  );
}
