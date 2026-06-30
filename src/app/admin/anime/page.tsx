import Link from "next/link";
import { Edit3, Plus, Search, Shield } from "lucide-react";
import type { Prisma } from "@prisma/client";

import { toggleAdminAnimePublished } from "@/app/actions/admin-anime";
import { AdminAnimeDeleteForm } from "@/components/AdminAnimeDeleteForm";
import { EmptyState } from "@/components/EmptyState";
import { MessageBanner } from "@/components/MessageBanner";
import { ScoreBadge } from "@/components/ScoreBadge";
import { SetupNotice } from "@/components/SetupNotice";
import { getAdminAccess } from "@/lib/admin";
import { hasDatabaseEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { averageScore } from "@/lib/score";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

type AdminAnime = Prisma.AnimeGetPayload<{
  include: {
    reviews: { select: { score: true } };
    ratings: { select: { score: true } };
  };
}>;

type AdminAnimePageProps = {
  searchParams: Promise<{
    q?: string;
    genre?: string;
    year?: string;
    page?: string;
    error?: string;
    message?: string;
  }>;
};

function normalizePage(value: string | undefined) {
  const page = Number(value);

  if (!Number.isInteger(page) || page < 1) {
    return 1;
  }

  return page;
}

export default async function AdminAnimePage({ searchParams }: AdminAnimePageProps) {
  if (!hasDatabaseEnv()) {
    return <SetupNotice />;
  }

  const [{ user, isAdmin }, params] = await Promise.all([getAdminAccess(), searchParams]);

  if (!user) {
    return (
      <div className="bg-paper">
        <section className="mx-auto max-w-4xl px-4 py-12">
          <EmptyState
            actionHref="/login"
            actionLabel="ログインへ"
            description="管理画面を見るにはログインが必要です。"
            icon={Shield}
            title="ログインしてください"
          />
        </section>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="bg-paper">
        <section className="mx-auto max-w-4xl px-4 py-12">
          <EmptyState
            actionHref="/"
            actionLabel="トップへ戻る"
            description="このアカウントには作品管理へアクセスする権限がありません。"
            icon={Shield}
            title="アクセスできません"
          />
        </section>
      </div>
    );
  }

  const query = params.q?.trim() ?? "";
  const selectedGenre = params.genre?.trim() ?? "";
  const selectedYearText = params.year?.trim() ?? "";
  const selectedYear = /^\d{4}$/.test(selectedYearText) ? Number(selectedYearText) : null;
  const requestedPage = normalizePage(params.page);
  const filters: Prisma.AnimeWhereInput[] = [];

  if (query) {
    filters.push({ title: { contains: query, mode: "insensitive" } });
  }

  if (selectedGenre) {
    filters.push({ genres: { has: selectedGenre } });
  }

  if (selectedYear !== null) {
    filters.push({ releaseYear: selectedYear });
  }

  const where = filters.length > 0 ? { AND: filters } : undefined;

  let animeList: AdminAnime[] = [];
  let filterOptions: { genres: string[]; releaseYear: number }[] = [];
  let totalCount = 0;

  try {
    [totalCount, filterOptions] = await Promise.all([
      prisma.anime.count({ where }),
      prisma.anime.findMany({
        select: { genres: true, releaseYear: true },
        orderBy: [{ releaseYear: "desc" }, { title: "asc" }],
      }),
    ]);

    const totalPagesForQuery = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
    const currentPageForQuery = Math.min(requestedPage, totalPagesForQuery);

    animeList = await prisma.anime.findMany({
      where,
      include: {
        reviews: { select: { score: true } },
        ratings: { select: { score: true } },
      },
      orderBy: [{ releaseYear: "desc" }, { title: "asc" }],
      skip: (currentPageForQuery - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    });
  } catch {
    return (
      <SetupNotice
        title="作品管理を読み込めません"
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
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const hasSearchConditions = Boolean(query) || Boolean(selectedGenre) || Boolean(selectedYearText);
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

    if (page > 1) {
      nextParams.set("page", String(page));
    }

    const queryString = nextParams.toString();

    return queryString ? `/admin/anime?${queryString}` : "/admin/anime";
  }

  return (
    <div className="bg-paper">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-9">
          <p className="text-sm font-black text-coral">Admin</p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-black text-ink">作品管理</h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                作品の登録・編集・削除を行う管理テーブルです。
              </p>
            </div>
            <Link
              className="inline-flex h-11 items-center justify-center gap-2 rounded bg-ink px-4 text-sm font-black text-white transition hover:bg-slate-700"
              href="/admin/anime/new"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              作品追加
            </Link>
          </div>

          <form className="mt-6 grid gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(140px,1fr)_minmax(120px,1fr)_auto]" action="/admin/anime">
            <label className="text-xs font-black text-slate-500">
              タイトル検索
              <input
                className="mt-1 h-11 w-full rounded border border-slate-300 px-4 text-sm outline-none focus:border-mint focus:ring-2 focus:ring-mint/20"
                defaultValue={query}
                name="q"
                placeholder="タイトルで検索"
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
            <button
              className="inline-flex h-11 items-center justify-center gap-2 rounded bg-ink px-4 text-sm font-black text-white hover:bg-slate-700 lg:self-end"
              type="submit"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              検索
            </button>
          </form>

          {hasSearchConditions ? (
            <Link
              className="mt-3 inline-flex text-sm font-bold text-mint hover:text-teal-700"
              href="/admin/anime"
            >
              条件をリセット
            </Link>
          ) : null}
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-5 px-4 py-8">
        <MessageBanner error={params.error} message={params.message} />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-bold text-slate-500">
            {totalCount === 0
              ? "0件"
              : `${totalCount}件中 ${startIndex + 1}-${startIndex + animeList.length}件`}
          </p>
          <Link className="text-sm font-bold text-mint hover:text-teal-700" href="/admin">
            管理トップへ戻る
          </Link>
        </div>

        {totalCount === 0 ? (
          <EmptyState
            actionHref={hasSearchConditions ? "/admin/anime" : "/admin"}
            actionLabel={hasSearchConditions ? "検索条件をリセット" : "管理トップへ"}
            description={
              hasSearchConditions
                ? "タイトル、ジャンル、放送年の条件を変えて検索してください。"
                : "作品データがまだありません。npm.cmd run db:seed で初期データを投入できます。"
            }
            title={hasSearchConditions ? "条件に合う作品がありません" : "作品がありません"}
          />
        ) : (
          <>
            <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-soft">
              <div className="overflow-x-auto">
                <table className="min-w-[1080px] w-full border-collapse text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-black">画像</th>
                      <th className="px-4 py-3 font-black">タイトル</th>
                      <th className="px-4 py-3 font-black">ジャンル</th>
                      <th className="px-4 py-3 font-black">放送年</th>
                      <th className="px-4 py-3 font-black">公開</th>
                      <th className="px-4 py-3 font-black">レビュー数</th>
                      <th className="px-4 py-3 font-black">平均点</th>
                      <th className="px-4 py-3 font-black">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {animeList.map((anime) => {
                      const score = averageScore(anime.ratings);

                      return (
                        <tr className="align-top" key={anime.id}>
                          <td className="px-4 py-4">
                            <img
                              alt={`${anime.title}のサムネイル`}
                              className="h-16 w-24 rounded object-cover"
                              src={anime.coverImage}
                            />
                          </td>
                          <td className="px-4 py-4">
                            <Link
                              className="font-black text-ink hover:text-mint"
                              href={`/anime/${anime.slug}`}
                            >
                              {anime.title}
                            </Link>
                            {anime.titleEn ? (
                              <p className="mt-1 text-xs font-medium uppercase text-slate-400">
                                {anime.titleEn}
                              </p>
                            ) : null}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap gap-1">
                              {anime.genres.map((genre) => (
                                <span
                                  className="rounded bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600"
                                  key={genre}
                                >
                                  {genre}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-4 font-bold text-slate-700">{anime.releaseYear}</td>
                          <td className="px-4 py-4">
                            <form action={toggleAdminAnimePublished} className="space-y-2">
                              <input name="animeId" type="hidden" value={anime.id} />
                              <input
                                name="isPublished"
                                type="hidden"
                                value={anime.isPublished ? "false" : "true"}
                              />
                              <span
                                className={
                                  anime.isPublished
                                    ? "inline-flex rounded bg-emerald-100 px-2 py-1 text-xs font-black text-emerald-700"
                                    : "inline-flex rounded bg-slate-200 px-2 py-1 text-xs font-black text-slate-600"
                                }
                              >
                                {anime.isPublished ? "公開" : "非公開"}
                              </span>
                              <button
                                className="block rounded border border-slate-200 bg-white px-3 py-1.5 text-xs font-black text-slate-700 transition hover:border-mint hover:text-mint"
                                type="submit"
                              >
                                {anime.isPublished ? "非公開にする" : "公開する"}
                              </button>
                            </form>
                          </td>
                          <td className="px-4 py-4 font-bold text-slate-700">{anime.reviews.length}</td>
                          <td className="px-4 py-4">
                            <ScoreBadge count={anime.ratings.length} score={score} />
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap gap-2">
                              <Link
                                className="inline-flex h-9 items-center gap-2 rounded border border-slate-200 px-3 text-xs font-black text-slate-700 transition hover:border-mint hover:text-mint"
                                href={`/admin/anime/${anime.id}/edit`}
                              >
                                <Edit3 className="h-4 w-4" aria-hidden="true" />
                                編集
                              </Link>
                              <AdminAnimeDeleteForm animeId={anime.id} animeTitle={anime.title} />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
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
