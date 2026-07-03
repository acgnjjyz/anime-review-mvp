import { notFound } from "next/navigation";
import { Shield } from "lucide-react";

import { AdminAnimeForm } from "@/components/AdminAnimeForm";
import { EmptyState } from "@/components/EmptyState";
import { MessageBanner } from "@/components/MessageBanner";
import { SetupNotice } from "@/components/SetupNotice";
import { getAdminAccess } from "@/lib/admin";
import { hasDatabaseEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type AdminAnimeEditPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function AdminAnimeEditPage({
  params,
  searchParams,
}: AdminAnimeEditPageProps) {
  if (!hasDatabaseEnv()) {
    return <SetupNotice />;
  }

  const [{ id }, { user, isAdmin }, query] = await Promise.all([
    params,
    getAdminAccess(),
    searchParams,
  ]);

  if (!user) {
    return (
      <div className="bg-paper">
        <section className="mx-auto max-w-4xl px-4 py-12">
          <EmptyState
            actionHref="/login"
            actionLabel="ログインへ"
            description="作品を編集するにはログインが必要です。"
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
            description="このアカウントには作品を編集する権限がありません。"
            icon={Shield}
            title="アクセスできません"
          />
        </section>
      </div>
    );
  }

  let anime = null;

  try {
    anime = await prisma.anime.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        synopsis: true,
        genres: true,
        releaseYear: true,
        coverImage: true,
        trailerUrl: true,
        airingDay: true,
        isPublished: true,
      },
    });
  } catch {
    return (
      <SetupNotice
        title="作品を読み込めません"
        description="データベース接続に失敗しました。DATABASE_URLとSupabaseのDB状態を確認してください。"
        detail="接続できる状態にしてから再度お試しください。"
      />
    );
  }

  if (!anime) {
    notFound();
  }

  return (
    <div className="bg-paper">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-9">
          <p className="text-sm font-black text-coral">Admin</p>
          <h1 className="mt-2 text-3xl font-black text-ink">作品編集</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            タイトル、概要、ジャンル、放送年、画像URLを編集できます。
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl space-y-5 px-4 py-8">
        <MessageBanner error={query.error} message={query.message} />
        <AdminAnimeForm anime={anime} />
      </section>
    </div>
  );
}
