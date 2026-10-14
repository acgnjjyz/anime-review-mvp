import Link from "next/link";
import { redirect } from "next/navigation";
import { BookmarkCheck, Heart, MessageSquare, Star } from "lucide-react";
import { WatchStatus } from "@prisma/client";

import { AnimeCard } from "@/components/AnimeCard";
import { EmptyState } from "@/components/EmptyState";
import { ScoreBadge } from "@/components/ScoreBadge";
import { SetupNotice } from "@/components/SetupNotice";
import { getSyncedCurrentUser } from "@/lib/auth";
import { hasDatabaseEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const shelfGroups = [
  { status: WatchStatus.WANT_TO_WATCH, label: "\u89b3\u305f\u3044" },
  { status: WatchStatus.WATCHING, label: "\u8996\u8074\u4e2d" },
  { status: WatchStatus.COMPLETED, label: "\u89b3\u7d42\u308f\u3063\u305f" },
  { status: WatchStatus.DROPPED, label: "\u4e2d\u65ad" },
  { status: WatchStatus.FAVORITE, label: "\u304a\u6c17\u306b\u5165\u308a" },
];

export default async function MyPage() {
  if (!hasDatabaseEnv()) {
    return <SetupNotice />;
  }

  const user = await getSyncedCurrentUser();

  if (!user) {
    redirect("/login?message=Log in to view MyPage.");
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
        animeShelves: {
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
          orderBy: { updatedAt: "desc" },
        },
      },
    });
  } catch {
    return (
      <SetupNotice
        title="Could not load MyPage"
        description="Check the database connection and Supabase PostgreSQL status."
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
    <div className="portal-shell">
      <section className="border-b border-stroke/25 bg-field/60">
        <div className="mx-auto max-w-7xl px-4 py-9">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-cyan-ink">MyPage</p>
          <h1 className="mt-2 text-3xl font-black text-heading">
            {profile.name ?? "User"}'s anime shelf
          </h1>
          <p className="mt-2 text-sm text-muted">{profile.email}</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-4">
          <div className="portal-panel rounded-2xl p-5">
            <h2 className="text-xl font-black text-heading">Activity Summary</h2>
            <div className="mt-4 grid gap-3">
              <div className="flex items-center justify-between rounded-xl border border-stroke/25 bg-field/60 p-3">
                <span className="inline-flex items-center gap-2 font-bold text-secondary">
                  <MessageSquare className="h-4 w-4 text-cyan-ink" aria-hidden="true" />
                  Reviews
                </span>
                <span className="text-lg font-black text-heading">{profile.reviews.length}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-stroke/25 bg-field/60 p-3">
                <span className="inline-flex items-center gap-2 font-bold text-secondary">
                  <Heart className="h-4 w-4 text-rose-ink" aria-hidden="true" />
                  Favorites
                </span>
                <span className="text-lg font-black text-heading">{profile.favorites.length}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-stroke/25 bg-field/60 p-3">
                <span className="inline-flex items-center gap-2 font-bold text-secondary">
                  <BookmarkCheck className="h-4 w-4 text-violet-ink" aria-hidden="true" />
                  Shelf
                </span>
                <span className="text-lg font-black text-heading">{profile.animeShelves.length}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-stroke/25 bg-field/60 p-3">
                <span className="inline-flex items-center gap-2 font-bold text-secondary">
                  <Star className="h-4 w-4 text-amber-ink" aria-hidden="true" />
                  Average
                </span>
                <ScoreBadge score={average} />
              </div>
            </div>
          </div>
        </aside>

        <div className="space-y-10">
          <section>
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-2xl font-black text-heading">Anime Shelf</h2>
              <Link className="text-sm font-bold text-sky-ink hover:text-heading" href="/anime">
                Browse anime
              </Link>
            </div>
            {profile.animeShelves.length === 0 ? (
              <EmptyState
                actionHref="/anime"
                actionLabel="Browse anime"
                description="Save a watch status from an anime detail page and it will appear here."
                title="Your shelf is empty"
              />
            ) : (
              <div className="space-y-6">
                {shelfGroups.map((group) => {
                  const items = profile.animeShelves.filter((shelf) => shelf.status === group.status);

                  if (items.length === 0) {
                    return null;
                  }

                  return (
                    <div className="portal-panel rounded-2xl p-4" key={group.status}>
                      <h3 className="text-lg font-black text-heading">{group.label}</h3>
                      <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                        {items.map((shelf) => (
                          <AnimeCard anime={shelf.anime} key={shelf.id} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-2xl font-black text-heading">My Reviews</h2>
              <Link className="text-sm font-bold text-sky-ink hover:text-heading" href="/anime">
                Find anime
              </Link>
            </div>
            {profile.reviews.length === 0 ? (
              <EmptyState
                actionHref="/anime"
                actionLabel="Find anime"
                description="Post a review from an anime detail page and it will appear here."
                title="No reviews yet"
              />
            ) : (
              <div className="space-y-4">
                {profile.reviews.map((review) => (
                  <Link
                    className="portal-panel-soft block rounded-2xl p-5 transition hover:border-cyan-300/40"
                    href={`/anime/${review.anime.slug}`}
                    key={review.id}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-cyan-ink">{review.anime.title}</p>
                        <h3 className="mt-1 text-lg font-black text-heading">{review.title}</h3>
                      </div>
                      <ScoreBadge score={review.score} />
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted">
                      {review.body}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-2xl font-black text-heading">Recent Favorites</h2>
              <Link className="text-sm font-bold text-sky-ink hover:text-heading" href="/favorites">
                View all
              </Link>
            </div>
            {profile.favorites.length === 0 ? (
              <EmptyState
                actionHref="/anime"
                actionLabel="Browse anime"
                description="Favorite anime from detail pages to collect them here."
                title="No favorites yet"
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
