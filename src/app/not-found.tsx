import Link from "next/link";

export default function NotFound() {
  return (
    <div className="bg-paper">
      <section className="mx-auto max-w-3xl px-4 py-16">
        <div className="rounded border border-slate-200 bg-white p-6 text-center shadow-soft">
          <p className="text-sm font-black text-coral">404</p>
          <h1 className="mt-2 text-2xl font-black text-ink">ページが見つかりません</h1>
          <p className="mt-3 leading-7 text-slate-600">
            URLが変わったか、作品データが存在しない可能性があります。
          </p>
          <Link
            className="mt-5 inline-flex h-10 items-center rounded bg-ink px-4 text-sm font-bold text-white hover:bg-slate-700"
            href="/anime"
          >
            作品一覧へ
          </Link>
        </div>
      </section>
    </div>
  );
}
