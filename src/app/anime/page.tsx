import { UiNav, UiText } from "@/components/UiText";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { SlidersHorizontal } from "lucide-react";

import { AnimeCard } from "@/components/AnimeCard";
import { AnimeFilter } from "@/components/AnimeFilter";
import { EmptyState } from "@/components/EmptyState";
import { MessageBanner } from "@/components/MessageBanner";
import { RightPortalSidebar } from "@/components/RightPortalSidebar";
import { SetupNotice } from "@/components/SetupNotice";
import { getCurrentUserProfile } from "@/lib/auth";
import { hasDatabaseEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { averageScore } from "@/lib/score";
import type { AnimeCardData } from "@/lib/types";

export const dynamic = "force-dynamic";

type AnimeListPageProps = {
  searchParams: Promise<{
    q?: string;
    genre?: string;
    tag?: string;
    year?: string;
    sort?: string;
    page?: string;
    error?: string;
    message?: string;
  }>;
};

type AnimeSort = "score" | "reviews" | "newest" | "oldest";
type RecentReview = {
  id: string;
  title: string;
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

const PAGE_SIZE = 12;

function normalizeSort(value: string | undefined): AnimeSort {
  if (value === "score" || value === "reviews" || value === "oldest") {
    return value;
  }

  return "newest";
}

function compareByTitle(a: AnimeCardData, b: AnimeCardData) {
  return a.title.localeCompare(b.title, "ja");
}

function normalizePage(value: string | undefined) {
  const page = Number(value);

  if (!Number.isInteger(page) || page < 1) {
    return 1;
  }

  return page;
}

export default async function AnimeListPage({ searchParams }: AnimeListPageProps) {
  if (!hasDatabaseEnv()) {
    return <SetupNotice />;
  }

  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const selectedGenre = params.genre?.trim() ?? "";
  const selectedTag = params.tag?.trim() ?? "";
  const selectedYearText = params.year?.trim() ?? "";
  const selectedYear = /^\d{4}$/.test(selectedYearText) ? Number(selectedYearText) : null;
  const sort = normalizeSort(params.sort);
  const requestedPage = normalizePage(params.page);
  const user = await getCurrentUserProfile();
  const filters: Prisma.AnimeWhereInput[] = [{ isPublished: true }];

  if (query) {
    filters.push({
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { titleEn: { contains: query, mode: "insensitive" } },
        { synopsis: { contains: query, mode: "insensitive" } },
        { studio: { contains: query, mode: "insensitive" } },
        { reviews: { some: { title: { contains: query, mode: "insensitive" } } } },
        { reviews: { some: { body: { contains: query, mode: "insensitive" } } } },
        { tagVotes: { some: { tag: { name: { contains: query, mode: "insensitive" } } } } },
      ],
    });
  }

  if (selectedGenre) {
    filters.push({ genres: { has: selectedGenre } });
  }

  if (selectedTag) {
    filters.push({ tagVotes: { some: { tag: { name: selectedTag } } } });
  }

  if (selectedYear !== null) {
    filters.push({ releaseYear: selectedYear });
  }

  let animeList: AnimeCardData[] = [];
  let filterOptions: { genres: string[]; releaseYear: number }[] = [];
  let favorites: { animeId: string }[] = [];
  let sidebarAnime: AnimeCardData[] = [];
  let recentReviews: RecentReview[] = [];
  let tagRanking: TagRankingItem[] = [];

  try {
    animeList = await prisma.anime.findMany({
      where: { AND: filters },
      include: {
        reviews: { select: { score: true } },
        ratings: { select: { score: true } },
        _count: { select: { favorites: true } },
      },
      orderBy: [{ releaseYear: "desc" }, { title: "asc" }],
    });
    filterOptions = await prisma.anime.findMany({
      where: { isPublished: true },
      select: { genres: true, releaseYear: true },
      orderBy: [{ releaseYear: "desc" }, { title: "asc" }],
    });
    favorites = user
      ? await prisma.favorite.findMany({
          where: { userId: user.id },
          select: { animeId: true },
        })
      : [];
    sidebarAnime = await prisma.anime.findMany({
      where: { isPublished: true },
      include: {
        reviews: { select: { score: true } },
        ratings: { select: { score: true } },
        _count: { select: { favorites: true } },
      },
      orderBy: [{ releaseYear: "desc" }, { title: "asc" }],
      take: 12,
    });
    recentReviews = await prisma.review.findMany({
      where: { anime: { isPublished: true } },
      include: {
        anime: { select: { slug: true, title: true, coverImage: true } },
        user: { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
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
  } catch {
    return (
      <SetupNotice
        title="Could not load anime"
        description="Check the database connection and Supabase PostgreSQL status."
        detail="When the connection is ready, run npm.cmd run db:push and npm.cmd run db:seed."
      />
    );
  }

  const genres = Array.from(new Set(filterOptions.flatMap((anime) => anime.genres))).sort((a, b) =>
    a.localeCompare(b, "ja"),
  );
  const years = Array.from(new Set(filterOptions.map((anime) => anime.releaseYear))).sort(
    (a, b) => b - a,
  );
  const favoriteAnimeIds = new Set(favorites.map((favorite) => favorite.animeId));
  const sortedAnimeList = [...animeList].sort((a, b) => {
    if (sort === "score") {
      const aScore = averageScore(a.ratings ?? a.reviews) ?? -1;
      const bScore = averageScore(b.ratings ?? b.reviews) ?? -1;
      const scoreDiff = bScore - aScore;

      return scoreDiff || b.releaseYear - a.releaseYear || compareByTitle(a, b);
    }

    if (sort === "reviews") {
      const reviewDiff = b.reviews.length - a.reviews.length;

      return reviewDiff || b.releaseYear - a.releaseYear || compareByTitle(a, b);
    }

    if (sort === "oldest") {
      return a.releaseYear - b.releaseYear || compareByTitle(a, b);
    }

    return b.releaseYear - a.releaseYear || compareByTitle(a, b);
  });
  const sideRanking = sidebarAnime
    .map((anime) => ({ ...anime, average: averageScore(anime.ratings) }))
    .filter((anime) => anime.average !== null)
    .sort((a, b) => (b.average ?? 0) - (a.average ?? 0))
    .slice(0, 5);
  const sideMostReviewed = [...sidebarAnime]
    .sort((a, b) => b.reviews.length - a.reviews.length || b.releaseYear - a.releaseYear)
    .slice(0, 5);
  const sideRecentlyAdded = sidebarAnime.slice(0, 5);
  const hasSearchConditions =
    Boolean(query) ||
    Boolean(selectedGenre) ||
    Boolean(selectedTag) ||
    Boolean(selectedYearText) ||
    sort !== "newest";
  const totalCount = sortedAnimeList.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedAnimeList = sortedAnimeList.slice(startIndex, startIndex + PAGE_SIZE);
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    (page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1,
  );

  function buildPageHref(page: number) {
    const nextParams = new URLSearchParams();

    if (query) {
      nextParams.set("q", query);
    }

    if (selectedGenre) {
      nextParams.set("genre", selectedGenre);
    }

    if (selectedTag) {
      nextParams.set("tag", selectedTag);
    }

    if (selectedYearText) {
      nextParams.set("year", selectedYearText);
    }

    if (sort !== "newest") {
      nextParams.set("sort", sort);
    }

    if (page > 1) {
      nextParams.set("page", String(page));
    }

    const queryString = nextParams.toString();

    return queryString ? `/anime?${queryString}` : "/anime";
  }

  return (
    <div className="portal-shell">
      <section className="portal-catalog-layout mx-auto max-w-[1640px] px-3 py-6 sm:px-4 lg:px-6">
        <div className="portal-catalog-filter">
          <AnimeFilter
            genres={genres}
            headingLevel="h1"
            key={JSON.stringify([query, selectedGenre, selectedYearText, sort, selectedTag])}
            values={{ q: query, genre: selectedGenre, year: selectedYearText, sort, tag: selectedTag }}
            years={years}
          />
        </div>
        <div className="portal-catalog-results space-y-5">
          <MessageBanner error={params.error} message={params.message} />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="inline-flex items-center gap-2 text-sm font-bold text-muted">
              <SlidersHorizontal className="h-4 w-4 text-cyan-ink" aria-hidden="true" />
              {totalCount === 0
                ? <UiText text={"0 results"} />
                : <UiText text={`${totalCount} results / ${startIndex + 1}-${startIndex + paginatedAnimeList.length}`} />}
            </p>
          </div>

          {totalCount === 0 ? (
            <EmptyState
              actionHref={hasSearchConditions ? "/anime" : undefined}
              actionLabel={hasSearchConditions ? "Reset filters" : undefined}
              description={
                hasSearchConditions
                  ? "Try a different keyword, genre, tag, year, or sort option."
                  : "No published anime data is available yet."
              }
              title={hasSearchConditions ? "No anime matched your filters" : "No anime yet"}
            />
          ) : (
            <>
              <div className="portal-anime-grid">
                {paginatedAnimeList.map((anime) => (
                  <AnimeCard
                    anime={anime}
                    isFavorite={favoriteAnimeIds.has(anime.id)}
                    key={anime.id}
                  />
                ))}
              </div>

              {totalPages > 1 ? (
                <UiNav
                  className="portal-panel flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between"
                  aria-label="Pagination"
                >
                  <p className="text-sm font-bold text-muted">
                    <UiText text={"Page"} /> {currentPage} / {totalPages}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    {currentPage > 1 ? (
                      <Link
                        className="portal-button-secondary inline-flex h-10 items-center rounded-full px-3 text-sm font-black"
                        href={buildPageHref(currentPage - 1)}
                      >
                        <UiText text={"Prev"} />
                      </Link>
                    ) : (
                      <span className="inline-flex h-10 items-center rounded-full border border-stroke/25 px-3 text-sm font-black text-secondary">
                        <UiText text={"Prev"} />
                      </span>
                    )}

                    {pageNumbers.map((pageNumber, index) => {
                      const previousPage = pageNumbers[index - 1];
                      const needsEllipsis = previousPage && pageNumber - previousPage > 1;

                      return (
                        <span className="inline-flex items-center gap-2" key={pageNumber}>
                          {needsEllipsis ? (
                            <span className="text-sm font-bold text-muted">...</span>
                          ) : null}
                          {pageNumber === currentPage ? (
                            <span className="portal-button-primary inline-flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-black">
                              {pageNumber}
                            </span>
                          ) : (
                            <Link
                              className="portal-button-secondary inline-flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-black"
                              href={buildPageHref(pageNumber)}
                            >
                              {pageNumber}
                            </Link>
                          )}
                        </span>
                      );
                    })}

                    {currentPage < totalPages ? (
                      <Link
                        className="portal-button-secondary inline-flex h-10 items-center rounded-full px-3 text-sm font-black"
                        href={buildPageHref(currentPage + 1)}
                      >
                        <UiText text={"Next"} />
                      </Link>
                    ) : (
                      <span className="inline-flex h-10 items-center rounded-full border border-stroke/25 px-3 text-sm font-black text-secondary">
                        <UiText text={"Next"} />
                      </span>
                    )}
                  </div>
                </UiNav>
              ) : null}
            </>
          )}
        </div>

        <RightPortalSidebar
          latestReviews={recentReviews}
          mostReviewed={sideMostReviewed}
          recentlyAdded={sideRecentlyAdded}
          tagRanking={tagRanking}
          topRated={sideRanking}
        />
      </section>
    </div>
  );
}
