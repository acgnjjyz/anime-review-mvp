import { UserRole, type Prisma, type UserRoleChangeLog } from "@prisma/client";
import { History, Search, Shield } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/EmptyState";
import { SetupNotice } from "@/components/SetupNotice";
import { getAdminAccess } from "@/lib/admin";
import { hasDatabaseEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

type AdminRoleLogsPageProps = {
  searchParams: Promise<{
    q?: string;
    page?: string;
  }>;
};

function normalizePage(value: string | undefined) {
  const page = Number(value);

  if (!Number.isInteger(page) || page < 1) {
    return 1;
  }

  return page;
}

function buildWhere(query: string): Prisma.UserRoleChangeLogWhereInput | undefined {
  if (!query) {
    return undefined;
  }

  const roleFilters: Prisma.UserRoleChangeLogWhereInput[] = [];
  const normalizedRole = query.toUpperCase();
  const matchedRole =
    normalizedRole === UserRole.USER ? UserRole.USER : normalizedRole === UserRole.ADMIN ? UserRole.ADMIN : null;

  if (matchedRole) {
    roleFilters.push({ oldRole: matchedRole }, { newRole: matchedRole });
  }

  return {
    OR: [
      { targetUserEmail: { contains: query, mode: "insensitive" } },
      { adminEmail: { contains: query, mode: "insensitive" } },
      ...roleFilters,
    ],
  };
}

export default async function AdminRoleLogsPage({ searchParams }: AdminRoleLogsPageProps) {
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
            description="role変更履歴を見るにはログインが必要です。"
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
            description="このアカウントにはrole変更履歴へアクセスする権限がありません。"
            icon={Shield}
            title="アクセスできません"
          />
        </section>
      </div>
    );
  }

  const query = params.q?.trim() ?? "";
  const requestedPage = normalizePage(params.page);
  const where = buildWhere(query);

  let logs: UserRoleChangeLog[] = [];
  let totalCount = 0;

  try {
    totalCount = await prisma.userRoleChangeLog.count({ where });
    const totalPagesForQuery = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
    const currentPageForQuery = Math.min(requestedPage, totalPagesForQuery);

    logs = await prisma.userRoleChangeLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (currentPageForQuery - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    });
  } catch {
    return (
      <SetupNotice
        title="role変更履歴を読み込めません"
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

    return queryString ? `/admin/role-logs?${queryString}` : "/admin/role-logs";
  }

  return (
    <div className="bg-transparent">
      <section className="border-b border-stroke/20 bg-panel">
        <div className="mx-auto max-w-6xl px-4 py-9">
          <p className="text-sm font-black text-coral">Admin</p>
          <h1 className="mt-2 flex items-center gap-2 text-3xl font-black text-heading">
            <History className="h-7 w-7 text-mint" aria-hidden="true" />
            role変更履歴
          </h1>
          <p className="mt-3 text-sm leading-6 text-secondary">
            管理者がユーザーroleを変更した履歴を確認できます。
          </p>
          <form className="mt-6 flex flex-col gap-3 sm:flex-row" action="/admin/role-logs">
            <label className="flex-1 text-xs font-black text-muted">
              検索
              <input
                className="mt-1 h-11 w-full rounded border border-stroke/20 px-4 text-sm outline-none focus:border-mint focus:ring-2 focus:ring-mint/20"
                defaultValue={query}
                name="q"
                placeholder="対象ユーザー・管理者メール・USER・ADMIN"
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
            <Link className="mt-3 inline-flex text-sm font-bold text-mint hover:text-teal-700" href="/admin/role-logs">
              条件をリセット
            </Link>
          ) : null}
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
            actionHref={query ? "/admin/role-logs" : "/admin"}
            actionLabel={query ? "条件をリセット" : "管理トップへ"}
            description={query ? "条件を変えて検索してください。" : "role変更履歴はまだありません。"}
            title={query ? "条件に合う履歴がありません" : "role変更履歴がありません"}
          />
        ) : (
          <div className="overflow-hidden rounded border border-stroke/20 bg-panel shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] border-collapse text-left text-sm">
                <thead className="bg-raised text-xs uppercase text-muted">
                  <tr>
                    <th className="px-4 py-3 font-black">変更日時</th>
                    <th className="px-4 py-3 font-black">対象ユーザー</th>
                    <th className="px-4 py-3 font-black">変更前</th>
                    <th className="px-4 py-3 font-black">変更後</th>
                    <th className="px-4 py-3 font-black">操作管理者</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/10">
                  {logs.map((log) => (
                    <tr className="align-top" key={log.id}>
                      <td className="px-4 py-4 text-secondary">
                        {log.createdAt.toLocaleString("ja-JP")}
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-bold text-heading">{log.targetUserEmail}</p>
                        <p className="mt-1 break-all text-xs text-muted">{log.targetUserId}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span className="rounded bg-raised px-2 py-1 text-xs font-black text-secondary">
                          {log.oldRole}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={
                            log.newRole === UserRole.ADMIN
                              ? "rounded bg-emerald-100 px-2 py-1 text-xs font-black text-emerald-700"
                              : "rounded bg-raised px-2 py-1 text-xs font-black text-secondary"
                          }
                        >
                          {log.newRole}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-bold text-heading">{log.adminEmail}</p>
                        <p className="mt-1 break-all text-xs text-muted">{log.adminId}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
