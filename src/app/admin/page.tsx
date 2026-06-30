import { ReportStatus } from "@prisma/client";
import {
  AlertTriangle,
  ClipboardList,
  Film,
  Flag,
  History,
  MessageSquare,
  Shield,
  Star,
  Users,
} from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/EmptyState";
import { SetupNotice } from "@/components/SetupNotice";
import { getAdminAccess } from "@/lib/admin";
import { hasDatabaseEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return date.toLocaleString("ja-JP");
}

export default async function AdminPage() {
  if (!hasDatabaseEnv()) {
    return <SetupNotice />;
  }

  const { user, isAdmin } = await getAdminAccess();

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
            description="このアカウントには管理画面へアクセスする権限がありません。"
            icon={Shield}
            title="アクセスできません"
          />
        </section>
      </div>
    );
  }

  let counts = {
    anime: 0,
    reviews: 0,
    comments: 0,
    users: 0,
    unresolvedReports: 0,
    reports: 0,
    logs: 0,
    roleLogs: 0,
  };
  let recentModerationLogs: Array<{
    id: string;
    targetType: "REVIEW" | "COMMENT";
    animeTitle: string | null;
    authorEmail: string | null;
    reason: string;
    createdAt: Date;
    deletedBy: { email: string; name: string | null };
  }> = [];
  let recentRoleLogs: Array<{
    id: string;
    targetUserEmail: string;
    oldRole: "USER" | "ADMIN";
    newRole: "USER" | "ADMIN";
    adminEmail: string;
    createdAt: Date;
  }> = [];

  try {
    const [
      anime,
      reviews,
      comments,
      users,
      unresolvedReports,
      reports,
      logs,
      roleLogs,
      moderationLogs,
      roleChangeLogs,
    ] = await prisma.$transaction([
      prisma.anime.count(),
      prisma.review.count(),
      prisma.comment.count(),
      prisma.user.count(),
      prisma.report.count({ where: { status: ReportStatus.PENDING } }),
      prisma.report.count(),
      prisma.moderationLog.count(),
      prisma.userRoleChangeLog.count(),
      prisma.moderationLog.findMany({
        include: {
          deletedBy: { select: { email: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.userRoleChangeLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    counts = { anime, reviews, comments, users, unresolvedReports, reports, logs, roleLogs };
    recentModerationLogs = moderationLogs;
    recentRoleLogs = roleChangeLogs;
  } catch {
    return (
      <SetupNotice
        title="管理画面を読み込めません"
        description="データベース接続に失敗しました。DATABASE_URLとSupabaseのDB状態を確認してください。"
        detail="接続できる状態にしてから npm.cmd run db:push と npm.cmd run db:seed を実行してください。"
      />
    );
  }

  const primaryCards = [
    { label: "作品数", value: counts.anime, icon: Film },
    { label: "レビュー数", value: counts.reviews, icon: Star },
    { label: "コメント数", value: counts.comments, icon: MessageSquare },
    { label: "ユーザー数", value: counts.users, icon: Users },
  ];

  const secondaryCards = [
    { label: "通報総数", value: counts.reports, icon: Flag },
    { label: "削除ログ", value: counts.logs, icon: ClipboardList },
    { label: "role履歴", value: counts.roleLogs, icon: History },
  ];

  return (
    <div className="bg-paper">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-9">
          <p className="text-sm font-black text-coral">Admin</p>
          <h1 className="mt-2 text-3xl font-black text-ink">管理画面</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            作品データ、投稿、通報、ユーザー権限を確認するための管理画面です。
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <div
          className={
            counts.unresolvedReports > 0
              ? "rounded border border-red-200 bg-red-50 p-5 shadow-soft"
              : "rounded border border-emerald-200 bg-emerald-50 p-5 shadow-soft"
          }
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <AlertTriangle
                className={counts.unresolvedReports > 0 ? "mt-1 h-6 w-6 text-red-600" : "mt-1 h-6 w-6 text-emerald-600"}
                aria-hidden="true"
              />
              <div>
                <p
                  className={
                    counts.unresolvedReports > 0
                      ? "text-sm font-black text-red-700"
                      : "text-sm font-black text-emerald-700"
                  }
                >
                  未対応通報数
                </p>
                <p className={counts.unresolvedReports > 0 ? "mt-1 text-4xl font-black text-red-800" : "mt-1 text-4xl font-black text-emerald-800"}>
                  {counts.unresolvedReports}
                </p>
                <p className="mt-2 text-sm font-bold text-slate-600">
                  {counts.unresolvedReports > 0
                    ? "対応待ちの通報があります。内容を確認してください。"
                    : "未対応の通報はありません。"}
                </p>
              </div>
            </div>
            <Link
              className={
                counts.unresolvedReports > 0
                  ? "inline-flex h-10 items-center justify-center rounded bg-red-600 px-4 text-sm font-black text-white hover:bg-red-700"
                  : "inline-flex h-10 items-center justify-center rounded bg-emerald-600 px-4 text-sm font-black text-white hover:bg-emerald-700"
              }
              href="/admin/reports?status=PENDING"
            >
              通報を見る
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {primaryCards.map((card) => {
            const Icon = card.icon;

            return (
              <div className="rounded border border-slate-200 bg-white p-5" key={card.label}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-bold text-slate-500">{card.label}</p>
                  <Icon className="h-5 w-5 text-mint" aria-hidden="true" />
                </div>
                <p className="mt-3 text-3xl font-black text-ink">{card.value}</p>
              </div>
            );
          })}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {secondaryCards.map((card) => {
            const Icon = card.icon;

            return (
              <div className="rounded border border-slate-200 bg-white p-5" key={card.label}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-bold text-slate-500">{card.label}</p>
                  <Icon className="h-5 w-5 text-mint" aria-hidden="true" />
                </div>
                <p className="mt-3 text-3xl font-black text-ink">{card.value}</p>
              </div>
            );
          })}
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <section className="rounded border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-black text-ink">最近の削除ログ</h2>
              <Link className="text-sm font-bold text-mint hover:text-teal-700" href="/admin/moderation-logs">
                すべて見る
              </Link>
            </div>
            {recentModerationLogs.length === 0 ? (
              <p className="mt-4 rounded bg-slate-50 p-4 text-sm font-bold text-slate-500">
                削除ログはまだありません。
              </p>
            ) : (
              <div className="mt-4 divide-y divide-slate-100">
                {recentModerationLogs.map((log) => (
                  <article className="py-3" key={log.id}>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-slate-100 px-2 py-1 text-xs font-black text-slate-600">
                        {log.targetType === "REVIEW" ? "レビュー" : "コメント"}
                      </span>
                      <span className="text-xs font-bold text-slate-400">{formatDate(log.createdAt)}</span>
                    </div>
                    <p className="mt-2 text-sm font-black text-ink">{log.animeTitle ?? "作品不明"}</p>
                    <p className="mt-1 text-xs font-bold text-slate-500">
                      投稿者: {log.authorEmail ?? "不明"} / 管理者: {log.deletedBy.email}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-700">{log.reason}</p>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="rounded border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-black text-ink">最近のrole変更</h2>
              <Link className="text-sm font-bold text-mint hover:text-teal-700" href="/admin/role-logs">
                すべて見る
              </Link>
            </div>
            {recentRoleLogs.length === 0 ? (
              <p className="mt-4 rounded bg-slate-50 p-4 text-sm font-bold text-slate-500">
                role変更履歴はまだありません。
              </p>
            ) : (
              <div className="mt-4 divide-y divide-slate-100">
                {recentRoleLogs.map((log) => (
                  <article className="py-3" key={log.id}>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-slate-100 px-2 py-1 text-xs font-black text-slate-600">
                        {log.oldRole}
                      </span>
                      <span className="text-xs font-black text-slate-400">→</span>
                      <span
                        className={
                          log.newRole === "ADMIN"
                            ? "rounded bg-emerald-100 px-2 py-1 text-xs font-black text-emerald-700"
                            : "rounded bg-slate-100 px-2 py-1 text-xs font-black text-slate-600"
                        }
                      >
                        {log.newRole}
                      </span>
                      <span className="text-xs font-bold text-slate-400">{formatDate(log.createdAt)}</span>
                    </div>
                    <p className="mt-2 text-sm font-black text-ink">{log.targetUserEmail}</p>
                    <p className="mt-1 text-xs font-bold text-slate-500">操作管理者: {log.adminEmail}</p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="rounded border border-slate-200 bg-white p-5">
          <h2 className="text-xl font-black text-ink">管理メニュー</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              className="rounded border border-slate-200 p-4 font-bold text-mint transition hover:border-mint"
              href="/admin/anime"
            >
              作品一覧を管理
            </Link>
            <Link
              className="rounded border border-slate-200 p-4 font-bold text-mint transition hover:border-mint"
              href="/admin/reviews"
            >
              レビューを管理
            </Link>
            <Link
              className="rounded border border-slate-200 p-4 font-bold text-mint transition hover:border-mint"
              href="/admin/comments"
            >
              コメントを管理
            </Link>
            <Link
              className="rounded border border-slate-200 p-4 font-bold text-mint transition hover:border-mint"
              href="/admin/users"
            >
              ユーザーを管理
            </Link>
            <Link
              className="rounded border border-slate-200 p-4 font-bold text-mint transition hover:border-mint"
              href="/admin/reports"
            >
              通報を管理
            </Link>
            <Link
              className="rounded border border-slate-200 p-4 font-bold text-mint transition hover:border-mint"
              href="/admin/moderation-logs"
            >
              削除理由ログを見る
            </Link>
            <Link
              className="rounded border border-slate-200 p-4 font-bold text-mint transition hover:border-mint"
              href="/admin/role-logs"
            >
              role変更履歴を見る
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
