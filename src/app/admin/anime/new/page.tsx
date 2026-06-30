import { Shield } from "lucide-react";

import { AdminAnimeForm } from "@/components/AdminAnimeForm";
import { EmptyState } from "@/components/EmptyState";
import { MessageBanner } from "@/components/MessageBanner";
import { SetupNotice } from "@/components/SetupNotice";
import { getAdminAccess } from "@/lib/admin";
import { hasDatabaseEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

type AdminAnimeNewPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function AdminAnimeNewPage({ searchParams }: AdminAnimeNewPageProps) {
  if (!hasDatabaseEnv()) {
    return <SetupNotice />;
  }

  const [{ user, isAdmin }, query] = await Promise.all([getAdminAccess(), searchParams]);

  if (!user) {
    return (
      <div className="bg-paper">
        <section className="mx-auto max-w-4xl px-4 py-12">
          <EmptyState
            actionHref="/login"
            actionLabel="ログインへ"
            description="作品を追加するにはログインが必要です。"
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
            description="このアカウントには作品を追加する権限がありません。"
            icon={Shield}
            title="アクセスできません"
          />
        </section>
      </div>
    );
  }

  return (
    <div className="bg-paper">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-9">
          <p className="text-sm font-black text-coral">Admin</p>
          <h1 className="mt-2 text-3xl font-black text-ink">作品追加</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            MVPでは基本項目だけを登録します。studioや話数などはサーバー側で初期値を入れます。
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl space-y-5 px-4 py-8">
        <MessageBanner error={query.error} message={query.message} />
        <AdminAnimeForm />
      </section>
    </div>
  );
}
