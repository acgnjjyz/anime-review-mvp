import { ModerationTargetType, type Prisma } from "@prisma/client";
import { ClipboardList, Download, Search, Shield } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/EmptyState";
import { SetupNotice } from "@/components/SetupNotice";
import { getAdminAccess } from "@/lib/admin";
import { hasDatabaseEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

type AdminModerationLogsPageProps = {
  searchParams: Promise<{
    q?: string;
    targetType?: string;
    page?: string;
  }>;
};

type ModerationLog = Prisma.ModerationLogGetPayload<{
  include: {
    deletedBy: { select: { email: true; name: true } };
  };
}>;

function normalizePage(value: string | undefined) {
  const page = Number(value);

  if (!Number.isInteger(page) || page < 1) {
    return 1;
  }

  return page;
}

function readTargetType(value: string | undefined) {
  if (value === ModerationTargetType.REVIEW || value === ModerationTargetType.COMMENT) {
    return value;
  }

  return "";
}

function targetTypeLabel(targetType: ModerationTargetType) {
  return targetType === ModerationTargetType.REVIEW ? "レビュー" : "コメント";
}

function buildWhere(query: string, targetType: "" | ModerationTargetType): Prisma.ModerationLogWhereInput | undefined {
  const filters: Prisma.ModerationLogWhereInput[] = [];

  if (targetType) {
    filters.push({ targetType });
  }

  if (query) {
    filters.push({
      OR: [
        { deletedBy: { email: { contains: query, mode: "insensitive" } } },
        { authorEmail: { contains: query, mode: "insensitive" } },
        { animeTitle: { contains: query, mode: "insensitive" } },
        { reason: { contains: query, mode: "insensitive" } },
        { targetTitle: { contains: query, mode: "insensitive" } },
        { targetBody: { contains: query, mode: "insensitive" } },
      ],
    });
  }

  return filters.length > 0 ? { AND: filters } : undefined;
}

export default async function AdminModerationLogsPage({ searchParams }: AdminModerationLogsPageProps) {
  if (!hasDatabaseEnv()) {
    return <SetupNotice />;
  }

  const [{ user, isAdmin }, params] = await Promise.all([getAdminAccess(), searchParams]);

  if (!user) {
    return (
      <div className="bg-transparent">
        <section className="mx-auto max-w-4xl px-4 py-12">
          <EmptyState
            actionHref="/login"
            actionLabel="ログインへ"
            description="削除理由ログを見るにはログインが必要です。"
            icon={Shield}
            title="ログインしてください"
          />
        </section>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="bg-transparent">
        <section className="mx-auto max-w-4xl px-4 py-12">
          <EmptyState
            actionHref="/"
            actionLabel="トップへ戻る"
            description="このアカウントには削除理由ログへアクセスする権限がありません。"
            icon={Shield}
            title="アクセスできません"
          />
        </section>
      </div>
    );
  }

  const query = params.q?.trim() ?? "";
  const targetTypeFilter = readTargetType(params.targetType);
  const requestedPage = normalizePage(params.page);
  const where = buildWhere(query, targetTypeFilter);

  let logs: ModerationLog[] = [];
  let totalCount = 0;

  try {
    totalCount = await prisma.moderationLog.count({ where });
    const totalPagesForQuery = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
    const currentPageForQuery = Math.min(requestedPage, totalPagesForQuery);

    logs = await prisma.moderationLog.findMany({
      where,
      include: {
        deletedBy: { select: { email: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (currentPageForQuery - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    });
  } catch {
    return (
      <SetupNotice
        title="削除理由ログを読み込めません"
        description="データベース接続に失敗しました。DATABASE_URLとSupabaseのDB状態を確認してください。"
      />
    );
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const hasFilters = Boolean(query || targetTypeFilter);

  function buildPageHref(page: number) {
    const nextParams = new URLSearchParams();

    if (query) {
      nextParams.set("q", query);
    }

    if (targetTypeFilter) {
      nextParams.set("targetType", targetTypeFilter);
    }

    if (page > 1) {
      nextParams.set("page", String(page));
    }

    const queryString = nextParams.toString();

    return queryString ? `/admin/moderation-logs?${queryString}` : "/admin/moderation-logs";
  }

  const exportParams = new URLSearchParams();
  if (query) {
    exportParams.set("q", query);
  }
  if (targetTypeFilter) {
    exportParams.set("targetType", targetTypeFilter);
  }
  const exportHref = exportParams.toString()
    ? `/admin/moderation-logs/export?${exportParams.toString()}`
    : "/admin/moderation-logs/export";

  return (
    <div className="bg-transparent">
      <section className="border-b border-stroke/20 bg-panel">
        <div className="mx-auto max-w-6xl px-4 py-9">
          <p className="text-sm font-black text-coral">Admin</p>
          <h1 className="mt-2 flex items-center gap-2 text-3xl font-black text-heading">
            <ClipboardList className="h-7 w-7 text-mint" aria-hidden="true" />
            削除理由ログ
          </h1>
          <p className="mt-3 text-sm leading-6 text-secondary">
            管理者が削除したレビュー/コメントの理由と削除前本文を確認できます。
          </p>
          <form className="mt-6 grid gap-3 md:grid-cols-[1fr_180px_auto]" action="/admin/moderation-logs">
            <label className="text-xs font-black text-muted">
              検索
              <input
                className="mt-1 h-11 w-full rounded border border-stroke/20 px-4 text-sm outline-none focus:border-mint focus:ring-2 focus:ring-mint/20"
                defaultValue={query}
                name="q"
                placeholder="管理者メール・投稿者メール・作品名・削除理由"
              />
            </label>
            <label className="text-xs font-black text-muted">
              対象種別
              <select
                className="mt-1 h-11 w-full rounded border border-stroke/20 bg-panel px-3 text-sm outline-none focus:border-mint focus:ring-2 focus:ring-mint/20"
                defaultValue={targetTypeFilter}
                name="targetType"
              >
                <option value="">すべて</option>
                <option value={ModerationTargetType.REVIEW}>REVIEW</option>
                <option value={ModerationTargetType.COMMENT}>COMMENT</option>
              </select>
            </label>
            <button
              className="inline-flex h-11 items-center justify-center gap-2 rounded bg-ink px-4 text-sm font-black text-white hover:bg-slate-700 md:self-end"
              type="submit"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              検索
            </button>
          </form>
          <div className="mt-3 flex flex-wrap gap-3">
            {hasFilters ? (
              <Link className="text-sm font-bold text-mint hover:text-teal-700" href="/admin/moderation-logs">
                条件をリセット
              </Link>
            ) : null}
            <Link
              className="inline-flex items-center gap-2 text-sm font-bold text-mint hover:text-teal-700"
              href={exportHref}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              CSVエクスポート
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-5 px-4 py-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-bold text-muted">
            {totalCount === 0 ? "0件" : `${totalCount}件中 ${startIndex + 1}-${startIndex + logs.length}件`}
          </p>
          <Link className="text-sm font-bold text-mint hover:text-teal-700" href="/admin">
            管理トップへ戻る
          </Link>
        </div>

        {logs.length === 0 ? (
          <EmptyState
            actionHref={hasFilters ? "/admin/moderation-logs" : "/admin"}
            actionLabel={hasFilters ? "条件をリセット" : "管理トップへ"}
            description={hasFilters ? "条件を変えて検索してください。" : "管理者による削除ログはまだありません。"}
            title={hasFilters ? "条件に合う削除ログがありません" : "削除理由ログがありません"}
          />
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <article className="rounded border border-stroke/20 bg-panel p-5 shadow-soft" key={log.id}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-raised px-2 py-1 text-xs font-black text-secondary">
                    {targetTypeLabel(log.targetType)}
                  </span>
                  <span className="text-xs font-bold text-muted">
                    {log.createdAt.toLocaleString("ja-JP")}
                  </span>
                </div>
                <div className="mt-3 grid gap-4 lg:grid-cols-[1fr_280px]">
                  <div>
                    <h2 className="text-lg font-black text-heading">
                      {log.targetTitle ?? log.animeTitle ?? "削除済み投稿"}
                    </h2>
                    <p className="mt-2 text-sm text-muted">
                      作品: {log.animeTitle ?? "不明"}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      投稿者: {log.authorName ?? "不明"} / {log.authorEmail ?? "不明"}
                    </p>
                    <div className="mt-4 rounded bg-raised p-3">
                      <p className="text-xs font-black text-muted">削除前本文</p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-foreground">
                        {log.targetBody ?? "本文は保存されていません。"}
                      </p>
                    </div>
                  </div>
                  <aside className="rounded bg-red-50 p-3">
                    <p className="text-xs font-black text-red-700">削除理由</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-red-800">
                      {log.reason}
                    </p>
                    <p className="mt-4 text-xs font-bold text-red-700">
                      削除管理者: {log.deletedBy.name ?? log.deletedBy.email}
                    </p>
                    <p className="mt-1 break-all text-xs font-bold text-red-700">
                      {log.deletedBy.email}
                    </p>
                  </aside>
                </div>
              </article>
            ))}
          </div>
        )}

        {totalPages > 1 ? (
          <nav className="flex flex-wrap gap-2 rounded border border-stroke/20 bg-panel p-4" aria-label="ページネーション">
            {currentPage > 1 ? (
              <Link
                className="rounded border border-stroke/20 px-3 py-2 text-sm font-bold text-heading hover:border-mint hover:text-mint"
                href={buildPageHref(currentPage - 1)}
              >
                前へ
              </Link>
            ) : null}
            <span className="rounded bg-ink px-3 py-2 text-sm font-black text-white">
              {currentPage} / {totalPages}
            </span>
            {currentPage < totalPages ? (
              <Link
                className="rounded border border-stroke/20 px-3 py-2 text-sm font-bold text-heading hover:border-mint hover:text-mint"
                href={buildPageHref(currentPage + 1)}
              >
                次へ
              </Link>
            ) : null}
          </nav>
        ) : null}
      </section>
    </div>
  );
}
