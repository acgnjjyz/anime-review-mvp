import Link from "next/link";
import { LogIn } from "lucide-react";

import { signIn } from "@/app/actions/auth";
import { MessageBanner } from "@/components/MessageBanner";
import { SubmitButton } from "@/components/SubmitButton";

export const dynamic = "force-dynamic";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <div className="bg-transparent">
      <section className="mx-auto max-w-md px-4 py-12">
        <div className="rounded border border-stroke/20 bg-panel p-6 shadow-soft">
          <p className="text-sm font-black text-coral">Login</p>
          <h1 className="mt-2 text-3xl font-black text-heading">ログイン</h1>
          <div className="mt-5">
            <MessageBanner error={params.error} message={params.message} />
          </div>

          <form action={signIn} className="mt-5 space-y-4">
            <label className="block text-sm font-bold text-foreground">
              メールアドレス
              <input
                className="mt-1 h-11 w-full rounded border border-stroke/20 px-3 outline-none focus:border-mint focus:ring-2 focus:ring-mint/20"
                name="email"
                placeholder="you@example.com"
                required
                type="email"
              />
            </label>
            <label className="block text-sm font-bold text-foreground">
              パスワード
              <input
                className="mt-1 h-11 w-full rounded border border-stroke/20 px-3 outline-none focus:border-mint focus:ring-2 focus:ring-mint/20"
                minLength={6}
                name="password"
                placeholder="6文字以上"
                required
                type="password"
              />
            </label>
            <SubmitButton
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded bg-ink px-4 text-sm font-black text-white transition hover:bg-slate-700"
              pendingLabel="ログイン中..."
            >
              <LogIn className="h-4 w-4" aria-hidden="true" />
              ログイン
            </SubmitButton>
          </form>

          <p className="mt-5 text-center text-sm text-secondary">
            アカウントがない場合は{" "}
            <Link className="font-bold text-mint hover:text-teal-700" href="/signup">
              新規登録
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
