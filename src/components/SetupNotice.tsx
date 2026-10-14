import Link from "next/link";
import { Database, FileText } from "lucide-react";

import { getMissingEnvLabels } from "@/lib/env";

type SetupNoticeProps = {
  title?: string;
  description?: string;
  detail?: string;
};

export function SetupNotice({
  title = "データベース設定が必要です",
  description = "`.env` に Supabase と PostgreSQL の値を設定し、Prismaでテーブルと初期データを作成してください。",
  detail,
}: SetupNoticeProps) {
  const missing = getMissingEnvLabels();

  return (
    <div className="bg-transparent">
      <section className="mx-auto max-w-3xl px-4 py-16">
        <div className="rounded border border-stroke/20 bg-panel p-6 shadow-soft">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded bg-mint text-white">
              <Database className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-black text-coral">Setup Required</p>
              <h1 className="mt-2 text-2xl font-black text-heading">{title}</h1>
              <p className="mt-3 leading-7 text-secondary">{description}</p>
              {detail ? (
                <p className="mt-3 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
                  {detail}
                </p>
              ) : null}
              {missing.length > 0 ? (
                <div className="mt-4 rounded border border-stroke/20 bg-panel px-3 py-2 text-sm text-secondary">
                  未設定またはプレースホルダーの項目:{" "}
                  <span className="font-bold text-heading">{missing.join(", ")}</span>
                </div>
              ) : null}
              <div className="mt-5 space-y-2 rounded bg-raised p-4 text-sm font-medium text-foreground">
                <p>1. `.env.example` を `.env` にコピー</p>
                <p>2. `DATABASE_URL` と Supabase のURL/anon keyを設定</p>
                <p>3. `npm.cmd run db:push`</p>
                <p>4. `npm.cmd run db:seed`</p>
              </div>
              <Link
                className="mt-5 inline-flex h-10 items-center gap-2 rounded bg-ink px-4 text-sm font-bold text-white hover:bg-slate-700"
                href="/login"
              >
                <FileText className="h-4 w-4" aria-hidden="true" />
                ログイン画面を確認
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
