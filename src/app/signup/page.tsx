import Link from "next/link";
import { UserPlus } from "lucide-react";

import { signUp } from "@/app/actions/auth";
import { MessageBanner } from "@/components/MessageBanner";
import { SubmitButton } from "@/components/SubmitButton";

export const dynamic = "force-dynamic";

type SignupPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;

  return (
    <div className="bg-paper">
      <section className="mx-auto max-w-md px-4 py-12">
        <div className="rounded border border-slate-200 bg-white p-6 shadow-soft">
          <p className="text-sm font-black text-coral">Sign Up</p>
          <h1 className="mt-2 text-3xl font-black text-ink">ユーザー登録</h1>
          <div className="mt-5">
            <MessageBanner error={params.error} message={params.message} />
          </div>

          <form action={signUp} className="mt-5 space-y-4">
            <label className="block text-sm font-bold text-slate-700">
              表示名
              <input
                className="mt-1 h-11 w-full rounded border border-slate-300 px-3 outline-none focus:border-mint focus:ring-2 focus:ring-mint/20"
                maxLength={40}
                name="name"
                placeholder="例: animefan"
              />
            </label>
            <label className="block text-sm font-bold text-slate-700">
              メールアドレス
              <input
                className="mt-1 h-11 w-full rounded border border-slate-300 px-3 outline-none focus:border-mint focus:ring-2 focus:ring-mint/20"
                name="email"
                placeholder="you@example.com"
                required
                type="email"
              />
            </label>
            <label className="block text-sm font-bold text-slate-700">
              パスワード
              <input
                className="mt-1 h-11 w-full rounded border border-slate-300 px-3 outline-none focus:border-mint focus:ring-2 focus:ring-mint/20"
                minLength={6}
                name="password"
                placeholder="6文字以上"
                required
                type="password"
              />
            </label>
            <SubmitButton
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded bg-coral px-4 text-sm font-black text-white transition hover:bg-rose-600"
              pendingLabel="登録中..."
            >
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              登録する
            </SubmitButton>
          </form>

          <p className="mt-5 text-center text-sm text-slate-600">
            すでにアカウントがある場合は{" "}
            <Link className="font-bold text-mint hover:text-teal-700" href="/login">
              ログイン
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
