import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { Filter, RotateCcw, SlidersHorizontal } from "lucide-react";

import { AnimeCard } from "@/components/AnimeCard";
import { EmptyState } from "@/components/EmptyState";
import { MessageBanner } from "@/components/MessageBanner";
import { PortalSelect } from "@/components/PortalSelect";
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
  const genreOptions = [
    { label: "Genre", value: "" },
    ...genres.map((genre) => ({ label: genre, value: genre })),
  ];
  const yearOptions = [
    { label: "Year", value: "" },
    ...years.map((year) => ({ label: String(year), value: String(year) })),
  ];
  const sortOptions = [
    { label: "Recently updated", value: "newest" },
    { label: "Oldest anime", value: "oldest" },
    { label: "Highest score", value: "score" },
    { label: "Most reviewed", value: "reviews" },
  ];
  const countryOptions = [
    { label: "Country", value: "" },
    { label: "Japan", value: "jp" },
    { label: "Original", value: "original" },
  ];
  const seasonOptions = [
    { label: "Season", value: "" },
    { label: "Spring", value: "spring" },
    { label: "Summer", value: "summer" },
    { label: "Autumn", value: "autumn" },
    { label: "Winter", value: "winter" },
  ];
  const typeOptions = [
    { label: "Type", value: "" },
    { label: "TV", value: "tv" },
    { label: "Movie", value: "movie" },
    { label: "OVA", value: "ova" },
    { label: "ONA", value: "ona" },
  ];
  const statusOptions = [
    { label: "Status", value: "" },
    { label: "Watching", value: "watching" },
    { label: "Completed", value: "completed" },
    { label: "Planned", value: "planned" },
  ];
  const languageOptions = [
    { label: "Language", value: "" },
    { label: "Japanese", value: "ja" },
    { label: "Subtitled", value: "sub" },
    { label: "Dubbed", value: "dub" },
  ];
  const ratingOptions = [
    { label: "Rating", value: "" },
    { label: "9+ score", value: "9" },
    { label: "8+ score", value: "8" },
    { label: "7+ score", value: "7" },
  ];
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
      <section className="border-b border-white/10 bg-[#08080d]/88">
        <div className="mx-auto max-w-[1640px] px-3 py-5 sm:px-4 lg:px-6">
          <form
            action="/anime"
            className="space-y-4"
            id="anime-search"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-white lg:text-3xl">
                  Advanced Anime Filter - Find Your Perfect Series
                </h1>
                <p className="mt-1 text-sm text-slate-500">Search and narrow the anime catalog.</p>
              </div>
              {hasSearchConditions ? (
                <Link
                  className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 underline decoration-slate-700 underline-offset-4 transition hover:text-white"
                  href="/anime"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Clear filters
                </Link>
              ) : null}
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
              <label className="block">
                <span className="sr-only">Search</span>
              <input
                  className="portal-input h-10 w-full rounded-lg px-3 text-sm"
                defaultValue={query}
                name="q"
                  placeholder="Search..."
              />
            </label>
              <div id="genres">
                <PortalSelect
                  hideLabel
                  label="Genre"
                  name="genre"
                  options={genreOptions}
                  value={selectedGenre}
                />
              </div>
              <PortalSelect
                hideLabel
                label="Country"
                name="country"
                options={countryOptions}
                value=""
              />
              <PortalSelect
                hideLabel
                label="Season"
                name="season"
                options={seasonOptions}
                value=""
              />
              <PortalSelect hideLabel label="Year" name="year" options={yearOptions} value={selectedYearText} />
              <PortalSelect hideLabel label="Type" name="type" options={typeOptions} value="" />
              <PortalSelect hideLabel label="Status" name="status" options={statusOptions} value="" />
              <PortalSelect
                hideLabel
                label="Language"
                name="language"
                options={languageOptions}
                value=""
              />
              <PortalSelect hideLabel label="Rating" name="rating" options={ratingOptions} value="" />
              <PortalSelect hideLabel label="Recently updated" name="sort" options={sortOptions} value={sort} />
              <button
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(124,58,237,0.22)] transition hover:bg-violet-500 xl:w-max"
                type="submit"
              >
                <Filter className="h-4 w-4" aria-hidden="true" />
                Filter
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1640px] gap-5 overflow-hidden px-3 py-6 sm:px-4 lg:grid-cols-[minmax(0,1fr)_300px] lg:px-6">
        <div className="min-w-0 space-y-5">
          <MessageBanner error={params.error} message={params.message} />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="inline-flex items-center gap-2 text-sm font-bold text-slate-400">
              <SlidersHorizontal className="h-4 w-4 text-cyan-300" aria-hidden="true" />
              {totalCount === 0
                ? "0 results"
                : `${totalCount} results / ${startIndex + 1}-${startIndex + paginatedAnimeList.length}`}
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
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
                {paginatedAnimeList.map((anime) => (
                  <AnimeCard
                    anime={anime}
                    isFavorite={favoriteAnimeIds.has(anime.id)}
                    key={anime.id}
                  />
                ))}
              </div>

              {totalPages > 1 ? (
                <nav
                  className="portal-panel flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between"
                  aria-label="Pagination"
                >
                  <p className="text-sm font-bold text-slate-400">
                    Page {currentPage} / {totalPages}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    {currentPage > 1 ? (
                      <Link
                        className="portal-button-secondary inline-flex h-10 items-center rounded-full px-3 text-sm font-black"
                        href={buildPageHref(currentPage - 1)}
                      >
                        Prev
                      </Link>
                    ) : (
                      <span className="inline-flex h-10 items-center rounded-full border border-slate-800 px-3 text-sm font-black text-slate-600">
                        Prev
                      </span>
                    )}

                    {pageNumbers.map((pageNumber, index) => {
                      const previousPage = pageNumbers[index - 1];
                      const needsEllipsis = previousPage && pageNumber - previousPage > 1;

                      return (
                        <span className="inline-flex items-center gap-2" key={pageNumber}>
                          {needsEllipsis ? (
                            <span className="text-sm font-bold text-slate-500">...</span>
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
                        Next
                      </Link>
                    ) : (
                      <span className="inline-flex h-10 items-center rounded-full border border-slate-800 px-3 text-sm font-black text-slate-600">
                        Next
                      </span>
                    )}
                  </div>
                </nav>
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
