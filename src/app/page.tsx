import Link from "next/link";
import { Trophy } from "lucide-react";

import { AnimeCard } from "@/components/AnimeCard";
import { EmptyState } from "@/components/EmptyState";
import { HeroCarousel } from "@/components/HeroCarousel";
import { HomeAnimeFilter } from "@/components/HomeAnimeFilter";
import { RightPortalSidebar } from "@/components/RightPortalSidebar";
import { ScoreBadge } from "@/components/ScoreBadge";
import { SetupNotice } from "@/components/SetupNotice";
import { WeekdaySchedule } from "@/components/WeekdaySchedule";
import { getCurrentUserProfile } from "@/lib/auth";
import { hasDatabaseEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { averageScore } from "@/lib/score";
import type { AnimeCardData } from "@/lib/types";

export const dynamic = "force-dynamic";

type LatestReview = {
  id: string;
  title: string;
  body: string;
  score: number;
  updatedAt: Date;
  user: { name: string | null };
  anime: { slug: string; title: string; coverImage: string };
};

type TagRankingItem = {
  id: string;
  name: string;
  count: number;
};

function withAverage(anime: AnimeCardData) {
  return {
    ...anime,
    average: averageScore(anime.ratings),
  };
}

function SectionHeader({
  eyebrow,
  title,
  href,
}: {
  eyebrow: string;
  title: string;
  href?: string;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-ink">{eyebrow}</p>
        <h2 className="mt-1 text-xl font-black text-heading sm:text-2xl">{title}</h2>
      </div>
      {href ? (
        <Link className="text-sm font-black text-sky-ink hover:text-heading" href={href}>
          View all
        </Link>
      ) : null}
    </div>
  );
}

function AnimeRail({
  animeList,
  favoriteAnimeIds,
}: {
  animeList: AnimeCardData[];
  favoriteAnimeIds: Set<string>;
}) {
  if (animeList.length === 0) {
    return (
      <EmptyState
        actionHref="/anime"
        actionLabel="Open Anime"
        description="Run the seed command or add published anime from the admin screen."
        title="No anime yet"
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6">
      {animeList.map((anime) => (
        <AnimeCard anime={anime} isFavorite={favoriteAnimeIds.has(anime.id)} key={anime.id} />
      ))}
    </div>
  );
}

function LatestReviews({ reviews }: { reviews: LatestReview[] }) {
  if (reviews.length === 0) {
    return (
      <div className="portal-panel-soft rounded-2xl p-5 text-sm leading-6 text-muted">
        Reviews will appear here after users post them.
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {reviews.map((review) => (
        <Link
          className="portal-panel-soft portal-card-hover grid gap-3 rounded-2xl p-3 sm:grid-cols-[82px_1fr]"
          href={`/anime/${review.anime.slug}`}
          key={review.id}
        >
          <img
            alt={`${review.anime.title} poster`}
            className="aspect-[3/4] w-full rounded-xl object-cover sm:h-28"
            src={review.anime.coverImage}
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <ScoreBadge score={review.score} />
              <span className="text-xs font-bold text-muted">
                {review.updatedAt.toLocaleDateString("ja-JP")}
              </span>
            </div>
            <h3 className="mt-2 line-clamp-1 text-base font-black text-heading">{review.title}</h3>
            <p className="mt-1 text-sm font-bold text-muted">
              {review.user.name ?? "Anonymous"} on {review.anime.title}
            </p>
            <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted">{review.body}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default async function HomePage() {
  if (!hasDatabaseEnv()) {
    return <SetupNotice />;
  }

  const user = await getCurrentUserProfile();
  let animeList: AnimeCardData[] = [];
  let recentlyAdded: AnimeCardData[] = [];
  let latestReviews: LatestReview[] = [];
  let favorites: { animeId: string }[] = [];
  let tagRanking: TagRankingItem[] = [];
  let filterOptions: { genres: string[]; releaseYear: number }[] = [];

  try {
    animeList = await prisma.anime.findMany({
      where: { isPublished: true },
      include: {
        reviews: { select: { score: true } },
        ratings: { select: { score: true } },
        _count: { select: { favorites: true } },
      },
      orderBy: [{ releaseYear: "desc" }, { title: "asc" }],
      take: 24,
    });
    recentlyAdded = [...animeList]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime() || a.title.localeCompare(b.title, "ja"))
      .slice(0, 8);
    latestReviews = await prisma.review.findMany({
      where: { anime: { isPublished: true } },
      include: {
        anime: { select: { slug: true, title: true, coverImage: true } },
        user: { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 4,
    });
    tagRanking = (
      await prisma.animeTag.findMany({
        select: {
          id: true,
          name: true,
          _count: { select: { votes: true } },
        },
        orderBy: { votes: { _count: "desc" } },
        take: 12,
      })
    ).map((tag) => ({ id: tag.id, name: tag.name, count: tag._count.votes }));
    favorites = user
      ? await prisma.favorite.findMany({
          where: { userId: user.id },
          select: { animeId: true },
        })
      : [];
    filterOptions = await prisma.anime.findMany({
      where: { isPublished: true },
      select: { genres: true, releaseYear: true },
    });
  } catch {
    return (
      <SetupNotice
        title="Database connection failed"
        description="Check DATABASE_URL, DIRECT_URL, and Supabase database status."
        detail="After the connection works, run npm.cmd run db:push and npm.cmd run db:seed."
      />
    );
  }

  const favoriteAnimeIds = new Set(favorites.map((favorite) => favorite.animeId));
  const genres = Array.from(new Set(filterOptions.flatMap((anime) => anime.genres))).sort((a, b) =>
    a.localeCompare(b, "ja"),
  );
  const years = Array.from(new Set(filterOptions.map((anime) => anime.releaseYear))).sort(
    (a, b) => b - a,
  );
  const topRated = animeList
    .map(withAverage)
    .filter((anime) => anime.average !== null)
    .sort((a, b) => (b.average ?? 0) - (a.average ?? 0))
    .slice(0, 8);
  const featuredSource = topRated[0] ?? animeList[0] ?? null;
  const featured = featuredSource ? withAverage(featuredSource) : null;
  const heroItems = (topRated.length ? topRated : animeList.map(withAverage)).slice(0, 5).map((anime) => ({
    slug: anime.slug,
    title: anime.title,
    titleEn: anime.titleEn,
    synopsis: anime.synopsis,
    coverImage: anime.coverImage,
    releaseYear: anime.releaseYear,
    genres: anime.genres,
    average: anime.average ?? null,
    ratingCount: anime.ratings.length,
    trailerUrl: anime.trailerUrl,
  }));
  const trending = [...animeList]
    .sort((a, b) => {
      const favoriteDiff = (b._count?.favorites ?? 0) - (a._count?.favorites ?? 0);
      return favoriteDiff || b.reviews.length - a.reviews.length;
    })
    .slice(0, 8);

  return (
    <div className="portal-shell">
      <section className="mx-auto w-full max-w-[1780px] px-3 pt-4 sm:px-4 lg:max-w-none lg:px-0">
        {featured ? (
          <HeroCarousel items={heroItems} />
        ) : (
          <EmptyState
            actionHref="/admin/anime/new"
            actionLabel="Add Anime"
            description="Published anime will power the portal-style home page."
            title="No featured anime yet"
          />
        )}
      </section>

      <section className="mx-auto max-w-[1780px] px-3 pb-4 sm:px-4 lg:px-6">
        <HomeAnimeFilter genres={genres} years={years} />
        <div className="mt-4 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0 space-y-6">
          <div className="pt-1">
            <SectionHeader eyebrow="Latest Episode Style" href="/anime?sort=newest" title="Recently Added" />
            <AnimeRail animeList={recentlyAdded.slice(0, 12)} favoriteAnimeIds={favoriteAnimeIds} />
          </div>

          <div>
            <SectionHeader eyebrow="Trending" href="/anime?sort=reviews" title="Community Buzz" />
            <AnimeRail animeList={trending.slice(0, 6)} favoriteAnimeIds={favoriteAnimeIds} />
          </div>

          <div>
            <SectionHeader eyebrow="Latest Reviews" href="/anime" title="Fresh Impressions" />
            <LatestReviews reviews={latestReviews} />
          </div>

          <div>
            <SectionHeader eyebrow="Top Rated" href="/ranking" title="Highest Scores" />
            <AnimeRail animeList={topRated.slice(0, 6)} favoriteAnimeIds={favoriteAnimeIds} />
          </div>
          </div>

          <RightPortalSidebar
            latestReviews={latestReviews}
            mostReviewed={trending.slice(0, 10)}
            recentlyAdded={recentlyAdded.slice(0, 6)}
            tagRanking={tagRanking}
            topRated={topRated.slice(0, 10)}
          />
        </div>
      </section>

      <WeekdaySchedule animeList={animeList.slice(0, 14)} />

      <section className="mx-auto max-w-[1640px] px-3 pb-16 sm:px-4 lg:px-6">
        <div className="portal-panel grid gap-4 rounded-3xl p-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-violet-ink">
              Ranking
            </p>
            <h2 className="mt-2 text-2xl font-black text-heading">See the full score board</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Average scores are calculated from review ratings and update after edits or deletes.
            </p>
          </div>
          <Link
            className="portal-button-secondary inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-black"
            href="/ranking"
          >
            Ranking
            <Trophy className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
