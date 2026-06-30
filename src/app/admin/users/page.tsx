import { UserRole, type Prisma } from "@prisma/client";
import { Search, Shield, Users } from "lucide-react";
import Link from "next/link";

import { AdminUserRoleForm } from "@/components/AdminUserRoleForm";
import { EmptyState } from "@/components/EmptyState";
import { MessageBanner } from "@/components/MessageBanner";
import { SetupNotice } from "@/components/SetupNotice";
import { getAdminAccess } from "@/lib/admin";
import { hasDatabaseEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

type AdminUsersPageProps = {
  searchParams: Promise<{
    q?: string;
    role?: string;
    page?: string;
    error?: string;
    message?: string;
  }>;
};

type AdminUser = Prisma.UserGetPayload<{
  include: {
    _count: {
      select: {
        reviews: true;
        comments: true;
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

function readRoleFilter(value: string | undefined) {
  if (value === UserRole.ADMIN || value === UserRole.USER) {
    return value;
  }

  return "";
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
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
            description="ユーザー管理を見るにはログインが必要です。"
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
            description="このアカウントにはユーザー管理へアクセスする権限がありません。"
            icon={Shield}
            title="アクセスできません"
          />
        </section>
      </div>
    );
  }

  const query = params.q?.trim() ?? "";
  const roleFilter = readRoleFilter(params.role);
  const requestedPage = normalizePage(params.page);
  const filters: Prisma.UserWhereInput[] = [];

  if (query) {
    filters.push({ email: { contains: query, mode: "insensitive" } });
  }

  if (roleFilter) {
    filters.push({ role: roleFilter });
  }

  const where: Prisma.UserWhereInput | undefined = filters.length > 0 ? { AND: filters } : undefined;

  let users: AdminUser[] = [];
  let totalCount = 0;

  try {
    totalCount = await prisma.user.count({ where });
    const totalPagesForQuery = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
    const currentPageForQuery = Math.min(requestedPage, totalPagesForQuery);

    users = await prisma.user.findMany({
      where,
      include: {
        _count: {
          select: {
            reviews: true,
            comments: true,
          },
        },
      },
      orderBy: [{ role: "desc" }, { createdAt: "desc" }],
      skip: (currentPageForQuery - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    });
  } catch {
    return (
      <SetupNotice
        title="ユーザー管理を読み込めません"
        description="データベース接続に失敗しました。DATABASE_URLとSupabaseのDB状態を確認してください。"
      />
    );
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const hasFilters = Boolean(query || roleFilter);

  function buildPageHref(page: number) {
    const nextParams = new URLSearchParams();

    if (query) {
      nextParams.set("q", query);
    }

    if (roleFilter) {
      nextParams.set("role", roleFilter);
    }

    if (page > 1) {
      nextParams.set("page", String(page));
    }

    const queryString = nextParams.toString();

    return queryString ? `/admin/users?${queryString}` : "/admin/users";
  }

  return (
    <div className="bg-paper">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-9">
          <p className="text-sm font-black text-coral">Admin</p>
          <h1 className="mt-2 flex items-center gap-2 text-3xl font-black text-ink">
            <Users className="h-7 w-7 text-mint" aria-hidden="true" />
            ユーザー管理
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            DBに同期されたユーザーのroleを管理します。最後のADMINはUSERへ変更できません。
          </p>
          <form className="mt-6 grid gap-3 md:grid-cols-[1fr_180px_auto]" action="/admin/users">
            <label className="text-xs font-black text-slate-500">
              メール検索
              <input
                className="mt-1 h-11 w-full rounded border border-slate-300 px-4 text-sm outline-none focus:border-mint focus:ring-2 focus:ring-mint/20"
                defaultValue={query}
                name="q"
                placeholder="user@example.com"
              />
            </label>
            <label className="text-xs font-black text-slate-500">
              role
              <select
                className="mt-1 h-11 w-full rounded border border-slate-300 bg-white px-3 text-sm outline-none focus:border-mint focus:ring-2 focus:ring-mint/20"
                defaultValue={roleFilter}
                name="role"
              >
                <option value="">すべて</option>
                <option value={UserRole.USER}>USER</option>
                <option value={UserRole.ADMIN}>ADMIN</option>
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
          {hasFilters ? (
            <Link className="mt-3 inline-flex text-sm font-bold text-mint hover:text-teal-700" href="/admin/users">
              条件をリセット
            </Link>
          ) : null}
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-5 px-4 py-8">
        <MessageBanner error={params.error} message={params.message} />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-bold text-slate-500">
            {totalCount === 0 ? "0件" : `${totalCount}件中 ${startIndex + 1}-${startIndex + users.length}件`}
          </p>
          <Link className="text-sm font-bold text-mint hover:text-teal-700" href="/admin">
            管理トップへ戻る
          </Link>
        </div>

        {users.length === 0 ? (
          <EmptyState
            actionHref={hasFilters ? "/admin/users" : "/admin"}
            actionLabel={hasFilters ? "条件をリセット" : "管理トップへ"}
            description={hasFilters ? "条件を変えて検索してください。" : "ユーザーはまだDBに同期されていません。ログインすると自動作成されます。"}
            title={hasFilters ? "条件に合うユーザーがありません" : "ユーザーがありません"}
          />
        ) : (
          <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] border-collapse text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-black">メール</th>
                    <th className="px-4 py-3 font-black">表示名</th>
                    <th className="px-4 py-3 font-black">role</th>
                    <th className="px-4 py-3 font-black">登録日</th>
                    <th className="px-4 py-3 font-black">レビュー数</th>
                    <th className="px-4 py-3 font-black">コメント数</th>
                    <th className="px-4 py-3 font-black">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((targetUser) => (
                    <tr className="align-top" key={targetUser.id}>
                      <td className="px-4 py-4 font-bold text-ink">{targetUser.email}</td>
                      <td className="px-4 py-4 text-slate-700">{targetUser.name ?? "未設定"}</td>
                      <td className="px-4 py-4">
                        <span
                          className={
                            targetUser.role === UserRole.ADMIN
                              ? "rounded bg-emerald-100 px-2 py-1 text-xs font-black text-emerald-700"
                              : "rounded bg-slate-100 px-2 py-1 text-xs font-black text-slate-600"
                          }
                        >
                          {targetUser.role}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {targetUser.createdAt.toLocaleDateString("ja-JP")}
                      </td>
                      <td className="px-4 py-4 font-bold text-slate-700">{targetUser._count.reviews}</td>
                      <td className="px-4 py-4 font-bold text-slate-700">{targetUser._count.comments}</td>
                      <td className="px-4 py-4">
                        <AdminUserRoleForm
                          currentAdminId={user.id}
                          role={targetUser.role}
                          userId={targetUser.id}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {totalPages > 1 ? (
          <nav className="flex flex-wrap gap-2 rounded border border-slate-200 bg-white p-4" aria-label="ページネーション">
            {currentPage > 1 ? (
              <Link
                className="rounded border border-slate-200 px-3 py-2 text-sm font-bold text-ink hover:border-mint hover:text-mint"
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
                className="rounded border border-slate-200 px-3 py-2 text-sm font-bold text-ink hover:border-mint hover:text-mint"
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
