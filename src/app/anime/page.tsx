import { Search } from "lucide-react";
import Link from "next/link";
import type { Prisma } from "@prisma/client";

import { AnimeCard } from "@/components/AnimeCard";
import { EmptyState } from "@/components/EmptyState";
import { MessageBanner } from "@/components/MessageBanner";
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
    year?: string;
    sort?: string;
    page?: string;
    error?: string;
    message?: string;
  }>;
};

type AnimeSort = "score" | "reviews" | "newest" | "oldest";
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
      ],
    });
  }

  if (selectedGenre) {
    filters.push({ genres: { has: selectedGenre } });
  }

  if (selectedYear !== null) {
    filters.push({ releaseYear: selectedYear });
  }

  let animeList: AnimeCardData[] = [];
  let filterOptions: { genres: string[]; releaseYear: number }[] = [];
  let favorites: { animeId: string }[] = [];

  try {
    [animeList, filterOptions, favorites] = await Promise.all([
      prisma.anime.findMany({
        where: { AND: filters },
        include: {
          reviews: { select: { score: true } },
          ratings: { select: { score: true } },
          _count: { select: { favorites: true } },
        },
        orderBy: [{ releaseYear: "desc" }, { title: "asc" }],
      }),
      prisma.anime.findMany({
        where: { isPublished: true },
        select: { genres: true, releaseYear: true },
        orderBy: [{ releaseYear: "desc" }, { title: "asc" }],
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
        title="作品一覧を読み込めません"
        description="データベース接続に失敗しました。DATABASE_URLとSupabaseのDB状態を確認してください。"
        detail="接続できる状態にしてから npm.cmd run db:push と npm.cmd run db:seed を実行してください。"
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
  const hasSearchConditions =
    Boolean(query) || Boolean(selectedGenre) || Boolean(selectedYearText) || sort !== "newest";
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
    <div className="bg-paper">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-9">
          <p className="text-sm font-black text-coral">Anime</p>
          <h1 className="mt-2 text-3xl font-black text-ink">アニメ一覧</h1>
          <form className="mt-6 grid gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(140px,1fr)_minmax(120px,1fr)_minmax(160px,1fr)_auto]" action="/anime">
            <label className="text-xs font-black text-slate-500">
              キーワード
              <input
                className="mt-1 h-11 w-full rounded border border-slate-300 px-4 text-sm outline-none focus:border-mint focus:ring-2 focus:ring-mint/20"
                defaultValue={query}
                name="q"
                placeholder="タイトル・スタジオ・あらすじ"
              />
            </label>
            <label className="text-xs font-black text-slate-500">
              ジャンル
              <select
                className="mt-1 h-11 w-full rounded border border-slate-300 bg-white px-3 text-sm outline-none focus:border-mint focus:ring-2 focus:ring-mint/20"
                defaultValue={selectedGenre}
                name="genre"
              >
                <option value="">すべて</option>
                {genres.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-black text-slate-500">
              放送年
              <select
                className="mt-1 h-11 w-full rounded border border-slate-300 bg-white px-3 text-sm outline-none focus:border-mint focus:ring-2 focus:ring-mint/20"
                defaultValue={selectedYearText}
                name="year"
              >
                <option value="">すべて</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-black text-slate-500">
              並び替え
              <select
                className="mt-1 h-11 w-full rounded border border-slate-300 bg-white px-3 text-sm outline-none focus:border-mint focus:ring-2 focus:ring-mint/20"
                defaultValue={sort}
                name="sort"
              >
                <option value="newest">新しい作品順</option>
                <option value="oldest">古い作品順</option>
                <option value="score">平均点が高い順</option>
                <option value="reviews">レビュー数が多い順</option>
              </select>
            </label>
            <button
              className="inline-flex h-11 items-center justify-center gap-2 rounded bg-ink px-4 text-sm font-black text-white hover:bg-slate-700 lg:self-end"
              type="submit"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              検索
            </button>
          </form>
          {hasSearchConditions ? (
            <Link className="mt-3 inline-flex text-sm font-bold text-mint hover:text-teal-700" href="/anime">
              条件をリセット
            </Link>
          ) : null}
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-5 px-4 py-8">
        <MessageBanner error={params.error} message={params.message} />
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-bold text-slate-500">
            {totalCount === 0
              ? "0件"
              : `${totalCount}件中 ${startIndex + 1}-${startIndex + paginatedAnimeList.length}件`}
          </p>
        </div>
        {totalCount === 0 ? (
          <EmptyState
            actionHref={hasSearchConditions ? "/anime" : undefined}
            actionLabel={hasSearchConditions ? "検索条件をリセット" : undefined}
            description={
              hasSearchConditions
                ? "キーワード、ジャンル、放送年の条件を変えて検索してください。"
                : "作品データがまだありません。npm.cmd run db:seed で初期データを投入できます。"
            }
            title={hasSearchConditions ? "条件に合う作品がありません" : "作品がありません"}
          />
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedAnimeList.map((anime) => (
                <AnimeCard
                  anime={anime}
                  isFavorite={favoriteAnimeIds.has(anime.id)}
                  key={anime.id}
                />
              ))}
            </div>

            {totalPages > 1 ? (
              <nav className="flex flex-col gap-3 rounded border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between" aria-label="ページネーション">
                <p className="text-sm font-bold text-slate-500">
                  {currentPage} / {totalPages}ページ
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {currentPage > 1 ? (
                    <Link
                      className="inline-flex h-10 items-center rounded border border-slate-200 px-3 text-sm font-bold text-ink hover:border-mint hover:text-mint"
                      href={buildPageHref(currentPage - 1)}
                    >
                      前へ
                    </Link>
                  ) : (
                    <span className="inline-flex h-10 items-center rounded border border-slate-100 px-3 text-sm font-bold text-slate-300">
                      前へ
                    </span>
                  )}

                  {pageNumbers.map((pageNumber, index) => {
                    const previousPage = pageNumbers[index - 1];
                    const needsEllipsis = previousPage && pageNumber - previousPage > 1;

                    return (
                      <span className="inline-flex items-center gap-2" key={pageNumber}>
                        {needsEllipsis ? (
                          <span className="text-sm font-bold text-slate-400">...</span>
                        ) : null}
                        {pageNumber === currentPage ? (
                          <span className="inline-flex h-10 min-w-10 items-center justify-center rounded bg-ink px-3 text-sm font-black text-white">
                            {pageNumber}
                          </span>
                        ) : (
                          <Link
                            className="inline-flex h-10 min-w-10 items-center justify-center rounded border border-slate-200 px-3 text-sm font-bold text-ink hover:border-mint hover:text-mint"
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
                      className="inline-flex h-10 items-center rounded border border-slate-200 px-3 text-sm font-bold text-ink hover:border-mint hover:text-mint"
                      href={buildPageHref(currentPage + 1)}
                    >
                      次へ
                    </Link>
                  ) : (
                    <span className="inline-flex h-10 items-center rounded border border-slate-100 px-3 text-sm font-bold text-slate-300">
                      次へ
                    </span>
                  )}
                </div>
              </nav>
            ) : null}
          </>
        )}
      </section>
    </div>
  );
}
