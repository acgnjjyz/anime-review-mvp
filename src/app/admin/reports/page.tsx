import { ReportStatus, ReportTargetType, type Prisma } from "@prisma/client";
import { Flag, Search, Shield } from "lucide-react";
import Link from "next/link";

import { AdminModerationDeleteForm } from "@/components/AdminModerationDeleteForm";
import { AdminReportStatusForm } from "@/components/AdminReportStatusForm";
import { EmptyState } from "@/components/EmptyState";
import { MessageBanner } from "@/components/MessageBanner";
import { SetupNotice } from "@/components/SetupNotice";
import { getAdminAccess } from "@/lib/admin";
import { hasDatabaseEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

type AdminReportsPageProps = {
  searchParams: Promise<{
    q?: string;
    targetType?: string;
    status?: string;
    page?: string;
    error?: string;
    message?: string;
  }>;
};

type AdminReport = Prisma.ReportGetPayload<{
  include: {
    reporter: { select: { email: true; name: true } };
    resolvedBy: { select: { email: true; name: true } };
    review: {
      select: {
        id: true;
        title: true;
        body: true;
        anime: { select: { title: true; slug: true } };
        user: { select: { email: true; name: true } };
      };
    };
    comment: {
      select: {
        id: true;
        body: true;
        anime: { select: { title: true; slug: true } };
        user: { select: { email: true; name: true } };
      };
    };
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
  if (value === ReportTargetType.REVIEW || value === ReportTargetType.COMMENT) {
    return value;
  }

  return "";
}

function readStatus(value: string | undefined) {
  if (
    value === ReportStatus.PENDING ||
    value === ReportStatus.RESOLVED ||
    value === ReportStatus.REJECTED
  ) {
    return value;
  }

  return "";
}

function statusLabel(status: ReportStatus) {
  if (status === ReportStatus.RESOLVED) return "対応済み";
  if (status === ReportStatus.REJECTED) return "却下";
  return "未対応";
}

function statusClassName(status: ReportStatus) {
  if (status === ReportStatus.RESOLVED) {
    return "rounded bg-emerald-100 px-2 py-1 text-xs font-black text-emerald-700";
  }

  if (status === ReportStatus.REJECTED) {
    return "rounded bg-raised px-2 py-1 text-xs font-black text-secondary";
  }

  return "rounded bg-amber-100 px-2 py-1 text-xs font-black text-amber-700";
}

function targetTypeLabel(targetType: ReportTargetType) {
  return targetType === ReportTargetType.REVIEW ? "レビュー" : "コメント";
}

export default async function AdminReportsPage({ searchParams }: AdminReportsPageProps) {
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
            description="通報管理を見るにはログインが必要です。"
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
            description="このアカウントには通報管理へアクセスする権限がありません。"
            icon={Shield}
            title="アクセスできません"
          />
        </section>
      </div>
    );
  }

  const query = params.q?.trim() ?? "";
  const targetTypeFilter = readTargetType(params.targetType);
  const statusFilter = readStatus(params.status);
  const requestedPage = normalizePage(params.page);
  const filters: Prisma.ReportWhereInput[] = [];

  if (targetTypeFilter) {
    filters.push({ targetType: targetTypeFilter });
  }

  if (statusFilter) {
    filters.push({ status: statusFilter });
  }

  if (query) {
    filters.push({
      OR: [
        { reason: { contains: query, mode: "insensitive" } },
        { reporter: { email: { contains: query, mode: "insensitive" } } },
        { review: { is: { title: { contains: query, mode: "insensitive" } } } },
        { review: { is: { body: { contains: query, mode: "insensitive" } } } },
        { review: { is: { user: { email: { contains: query, mode: "insensitive" } } } } },
        { review: { is: { anime: { title: { contains: query, mode: "insensitive" } } } } },
        { comment: { is: { body: { contains: query, mode: "insensitive" } } } },
        { comment: { is: { user: { email: { contains: query, mode: "insensitive" } } } } },
        { comment: { is: { anime: { title: { contains: query, mode: "insensitive" } } } } },
      ],
    });
  }

  const where: Prisma.ReportWhereInput | undefined = filters.length > 0 ? { AND: filters } : undefined;

  let reports: AdminReport[] = [];
  let totalCount = 0;

  try {
    totalCount = await prisma.report.count({ where });
    const totalPagesForQuery = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
    const currentPageForQuery = Math.min(requestedPage, totalPagesForQuery);

    reports = await prisma.report.findMany({
      where,
      include: {
        reporter: { select: { email: true, name: true } },
        resolvedBy: { select: { email: true, name: true } },
        review: {
          select: {
            id: true,
            title: true,
            body: true,
            anime: { select: { title: true, slug: true } },
            user: { select: { email: true, name: true } },
          },
        },
        comment: {
          select: {
            id: true,
            body: true,
            anime: { select: { title: true, slug: true } },
            user: { select: { email: true, name: true } },
          },
        },
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      skip: (currentPageForQuery - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    });
  } catch {
    return (
      <SetupNotice
        title="通報管理を読み込めません"
        description="データベース接続に失敗しました。DATABASE_URLとSupabaseのDB状態を確認してください。"
      />
    );
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const hasFilters = Boolean(query || targetTypeFilter || statusFilter);

  function buildPageHref(page: number) {
    const nextParams = new URLSearchParams();

    if (query) {
      nextParams.set("q", query);
    }

    if (targetTypeFilter) {
      nextParams.set("targetType", targetTypeFilter);
    }

    if (statusFilter) {
      nextParams.set("status", statusFilter);
    }

    if (page > 1) {
      nextParams.set("page", String(page));
    }

    const queryString = nextParams.toString();

    return queryString ? `/admin/reports?${queryString}` : "/admin/reports";
  }

  return (
    <div className="bg-transparent">
      <section className="border-b border-stroke/20 bg-panel">
        <div className="mx-auto max-w-6xl px-4 py-9">
          <p className="text-sm font-black text-coral">Admin</p>
          <h1 className="mt-2 flex items-center gap-2 text-3xl font-black text-heading">
            <Flag className="h-7 w-7 text-mint" aria-hidden="true" />
            通報管理
          </h1>
          <p className="mt-3 text-sm leading-6 text-secondary">
            通報内容を確認し、対象の削除、対応済み、却下までこの画面から処理できます。
          </p>
          <form className="mt-6 grid gap-3 lg:grid-cols-[1fr_180px_180px_auto]" action="/admin/reports">
            <label className="text-xs font-black text-muted">
              検索
              <input
                className="mt-1 h-11 w-full rounded border border-stroke/20 px-4 text-sm outline-none focus:border-mint focus:ring-2 focus:ring-mint/20"
                defaultValue={query}
                name="q"
                placeholder="投稿者メール・理由本文・対象本文・作品名"
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
                <option value={ReportTargetType.REVIEW}>REVIEW</option>
                <option value={ReportTargetType.COMMENT}>COMMENT</option>
              </select>
            </label>
            <label className="text-xs font-black text-muted">
              ステータス
              <select
                className="mt-1 h-11 w-full rounded border border-stroke/20 bg-panel px-3 text-sm outline-none focus:border-mint focus:ring-2 focus:ring-mint/20"
                defaultValue={statusFilter}
                name="status"
              >
                <option value="">すべて</option>
                <option value={ReportStatus.PENDING}>未対応</option>
                <option value={ReportStatus.RESOLVED}>対応済み</option>
                <option value={ReportStatus.REJECTED}>却下</option>
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
          {hasFilters ? (
            <Link className="mt-3 inline-flex text-sm font-bold text-mint hover:text-teal-700" href="/admin/reports">
              条件をリセット
            </Link>
          ) : null}
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-5 px-4 py-8">
        <MessageBanner error={params.error} message={params.message} />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-bold text-muted">
            {totalCount === 0 ? "0件" : `${totalCount}件中 ${startIndex + 1}-${startIndex + reports.length}件`}
          </p>
          <Link className="text-sm font-bold text-mint hover:text-teal-700" href="/admin">
            管理トップへ戻る
          </Link>
        </div>

        {reports.length === 0 ? (
          <EmptyState
            actionHref={hasFilters ? "/admin/reports" : "/admin"}
            actionLabel={hasFilters ? "条件をリセット" : "管理トップへ"}
            description={hasFilters ? "条件を変えて検索してください。" : "通報はまだありません。"}
            title={hasFilters ? "条件に合う通報がありません" : "通報がありません"}
          />
        ) : (
          <div className="space-y-4">
            {reports.map((report) => {
              const target = report.targetType === ReportTargetType.REVIEW ? report.review : report.comment;
              const targetBody =
                report.targetType === ReportTargetType.REVIEW ? report.review?.body : report.comment?.body;
              const targetTitle =
                report.targetType === ReportTargetType.REVIEW ? report.review?.title : "コメント";
              const anime = target?.anime;
              const author = target?.user;

              return (
                <article className="rounded border border-stroke/20 bg-panel p-5 shadow-soft" key={report.id}>
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={statusClassName(report.status)}>{statusLabel(report.status)}</span>
                        <span className="rounded bg-raised px-2 py-1 text-xs font-black text-secondary">
                          {targetTypeLabel(report.targetType)}
                        </span>
                      </div>
                      <h2 className="mt-3 text-lg font-black text-heading">{targetTitle ?? "削除済みの投稿"}</h2>
                      {anime ? (
                        <Link
                          className="mt-1 inline-flex text-sm font-bold text-mint hover:text-teal-700"
                          href={`/anime/${anime.slug}`}
                        >
                          作品詳細へ: {anime.title}
                        </Link>
                      ) : (
                        <p className="mt-1 text-sm font-bold text-muted">対象作品は削除済み、または対象投稿がありません。</p>
                      )}
                      <p className="mt-2 text-sm text-muted">
                        投稿者: {author?.name ?? "不明"} / {author?.email ?? "不明"}
                      </p>
                      <p className="mt-2 text-sm text-muted">
                        通報者: {report.reporter.name ?? "匿名ユーザー"} / {report.reporter.email} ・{" "}
                        {report.createdAt.toLocaleString("ja-JP")}
                      </p>
                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <div className="rounded bg-red-50 p-3">
                          <p className="text-xs font-black text-red-700">通報理由</p>
                          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-red-800">
                            {report.reason}
                          </p>
                        </div>
                        <div className="rounded bg-raised p-3">
                          <p className="text-xs font-black text-muted">対象本文</p>
                          <p className="mt-2 line-clamp-6 whitespace-pre-wrap text-sm leading-6 text-foreground">
                            {targetBody ?? "対象本文は削除済みです。"}
                          </p>
                        </div>
                      </div>
                      {report.resolvedBy ? (
                        <p className="mt-3 text-xs font-bold text-muted">
                          最終対応: {report.resolvedBy.name ?? report.resolvedBy.email}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 flex-col gap-3">
                      <AdminReportStatusForm reportId={report.id} status={report.status} />
                      {report.review ? (
                        <AdminModerationDeleteForm
                          kind="review"
                          label={report.review.title}
                          reportId={report.id}
                          reviewId={report.review.id}
                          source="reports"
                        />
                      ) : null}
                      {report.comment ? (
                        <AdminModerationDeleteForm
                          commentId={report.comment.id}
                          kind="comment"
                          label={report.comment.body.slice(0, 40)}
                          reportId={report.id}
                          source="reports"
                        />
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
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
