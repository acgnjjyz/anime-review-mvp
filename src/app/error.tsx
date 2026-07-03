"use client";

import { RotateCcw } from "lucide-react";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="portal-shell">
      <section className="mx-auto max-w-3xl px-4 py-16">
        <div className="rounded-3xl border border-red-400/30 bg-red-500/10 p-6 shadow-soft">
          <p className="text-sm font-black text-red-200">Error</p>
          <h1 className="mt-2 text-2xl font-black text-white">Something went wrong</h1>
          <p className="mt-3 leading-7 text-slate-300">
            Please check the connection or input state, then try loading the page again.
          </p>
          <button
            className="portal-button-secondary mt-5 inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-black"
            onClick={reset}
            type="button"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Try again
          </button>
        </div>
      </section>
    </div>
  );
}
