"use client";

import { RotateCcw } from "lucide-react";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="bg-paper">
      <section className="mx-auto max-w-3xl px-4 py-16">
        <div className="rounded border border-red-200 bg-white p-6 shadow-soft">
          <p className="text-sm font-black text-red-600">Error</p>
          <h1 className="mt-2 text-2xl font-black text-ink">画面の読み込みに失敗しました</h1>
          <p className="mt-3 leading-7 text-slate-600">
            接続設定や入力内容を確認し、再度お試しください。
          </p>
          <button
            className="mt-5 inline-flex h-10 items-center gap-2 rounded bg-ink px-4 text-sm font-bold text-white hover:bg-slate-700"
            onClick={reset}
            type="button"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            再読み込み
          </button>
        </div>
      </section>
    </div>
  );
}
