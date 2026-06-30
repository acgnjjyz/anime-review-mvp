import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { Search, Shield } from "lucide-react";

import { AdminModerationDeleteForm } from "@/components/AdminModerationDeleteForm";
import { EmptyState } from "@/components/EmptyState";
import { MessageBanner } from "@/components/MessageBanner";
import { SetupNotice } from "@/components/SetupNotice";
import { getAdminAccess } from "@/lib/admin";
import { hasDatabaseEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

type AdminCommentsPageProps = {
  searchParams: Promise<{
    q?: string;
    page?: string;
    error?: string;
    message?: string;
  }>;
};

type AdminComment = Prisma.CommentGetPayload<{
  include: {
    anime: { select: { title: true; slug: true } };
    user: { select: { name: true; email: true } };
  };
}>;

function normalizePage(value: string | undefined) {
  const page = Number(value);

  if (!Number.isInteger(page) || page < 1) {
    return 1;
  }

  return page;
}

export default async function AdminCommentsPage({ searchParams }: AdminCommentsPageProps) {
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
            description="コメント管理を見るにはログインが必要です。"
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
            description="このアカウントにはコメント管理へアクセスする権限がありません。"
            icon={Shield}
            title="アクセスできません"
          />
        </section>
      </div>
    );
  }

  const query = params.q?.trim() ?? "";
  const requestedPage = normalizePage(params.page);
  const where: Prisma.CommentWhereInput | undefined = query
    ? {
        OR: [
          { body: { contains: query, mode: "insensitive" } },
          { anime: { title: { contains: query, mode: "insensitive" } } },
          { user: { name: { contains: query, mode: "insensitive" } } },
          { user: { email: { contains: query, mode: "insensitive" } } },
        ],
      }
    : undefined;

  let comments: AdminComment[] = [];
  let totalCount = 0;

  try {
    totalCount = await prisma.comment.count({ where });
    const totalPagesForQuery = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
    const currentPageForQuery = Math.min(requestedPage, totalPagesForQuery);

    comments = await prisma.comment.findMany({
      where,
      include: {
        anime: { select: { title: true, slug: true } },
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (currentPageForQuery - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    });
  } catch {
    return (
      <SetupNotice
        title="コメント管理を読み込めません"
        description="データベース接続に失敗しました。DATABASE_URLとSupabaseのDB状態を確認してください。"
      />
    );
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;

  function buildPageHref(page: number) {
    const nextParams = new URLSearchParams();

    if (query) {
      nextParams.set("q", query);
    }

    if (page > 1) {
      nextParams.set("page", String(page));
    }

    const queryString = nextParams.toString();

    return queryString ? `/admin/comments?${queryString}` : "/admin/comments";
  }

  return (
    <div className="bg-paper">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-9">
          <p className="text-sm font-black text-coral">Admin</p>
          <h1 className="mt-2 text-3xl font-black text-ink">コメント管理</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            投稿されたコメントを検索し、不適切なコメントを削除できます。
          </p>
          <form className="mt-6 flex flex-col gap-3 sm:flex-row" action="/admin/comments">
            <label className="flex-1 text-xs font-black text-slate-500">
              検索
              <input
                className="mt-1 h-11 w-full rounded border border-slate-300 px-4 text-sm outline-none focus:border-mint focus:ring-2 focus:ring-mint/20"
                defaultValue={query}
                name="q"
                placeholder="本文・作品名・ユーザー"
              />
            </label>
            <button
              className="inline-flex h-11 items-center justify-center gap-2 rounded bg-ink px-4 text-sm font-black text-white hover:bg-slate-700 sm:self-end"
              type="submit"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              検索
            </button>
          </form>
          {query ? (
            <Link className="mt-3 inline-flex text-sm font-bold text-mint hover:text-teal-700" href="/admin/comments">
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
              : `${totalCount}件中 ${startIndex + 1}-${startIndex + comments.length}件`}
          </p>
          <Link className="text-sm font-bold text-mint hover:text-teal-700" href="/admin">
            管理トップへ戻る
          </Link>
        </div>

        {comments.length === 0 ? (
          <EmptyState
            actionHref={query ? "/admin/comments" : "/admin"}
            actionLabel={query ? "検索条件をリセット" : "管理トップへ"}
            description={query ? "条件を変えて検索してください。" : "コメントはまだありません。"}
            title={query ? "条件に合うコメントがありません" : "コメントがありません"}
          />
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <article className="rounded border border-slate-200 bg-white p-5 shadow-soft" key={comment.id}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <Link className="font-black text-mint hover:text-teal-700" href={`/anime/${comment.anime.slug}`}>
                      {comment.anime.title}
                    </Link>
                    <p className="mt-2 text-sm text-slate-500">
                      {comment.user.name ?? "匿名ユーザー"} / {comment.user.email} ・{" "}
                      {comment.createdAt.toLocaleDateString("ja-JP")}
                    </p>
                    <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                      {comment.body}
                    </p>
                  </div>
                  <AdminModerationDeleteForm
                    commentId={comment.id}
                    kind="comment"
                    label={comment.body.slice(0, 40)}
                  />
                </div>
              </article>
            ))}
          </div>
        )}

        {totalPages > 1 ? (
          <nav className="flex flex-wrap gap-2 rounded border border-slate-200 bg-white p-4" aria-label="ページネーション">
            {currentPage > 1 ? (
              <Link className="rounded border border-slate-200 px-3 py-2 text-sm font-bold text-ink hover:border-mint hover:text-mint" href={buildPageHref(currentPage - 1)}>
                前へ
              </Link>
            ) : null}
            <span className="rounded bg-ink px-3 py-2 text-sm font-black text-white">
              {currentPage} / {totalPages}
            </span>
            {currentPage < totalPages ? (
              <Link className="rounded border border-slate-200 px-3 py-2 text-sm font-bold text-ink hover:border-mint hover:text-mint" href={buildPageHref(currentPage + 1)}>
                次へ
              </Link>
            ) : null}
          </nav>
        ) : null}
      </section>
    </div>
  );
}
