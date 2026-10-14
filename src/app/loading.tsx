export default function Loading() {
  return (
    <div className="portal-shell">
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="portal-panel rounded-3xl p-6">
          <div className="h-4 w-32 animate-pulse rounded-full bg-slate-700" />
          <div className="mt-4 h-8 w-64 animate-pulse rounded-full bg-slate-700" />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div className="rounded-2xl border border-stroke/25 p-4" key={item}>
                <div className="aspect-[3/4] animate-pulse rounded-2xl bg-slate-800" />
                <div className="mt-4 h-4 w-3/4 animate-pulse rounded-full bg-slate-700" />
                <div className="mt-2 h-4 w-1/2 animate-pulse rounded-full bg-slate-800" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
