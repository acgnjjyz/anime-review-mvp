export default function AnimeListLoading() {
  return (
    <div className="portal-shell">
      <section className="border-b border-slate-200 bg-slate-950/60">
        <div className="mx-auto max-w-7xl px-4 py-9">
          <div className="h-4 w-16 animate-pulse rounded-full bg-slate-700" />
          <div className="mt-3 h-9 w-48 animate-pulse rounded-full bg-slate-700" />
          <div className="portal-panel mt-6 grid gap-3 rounded-3xl p-4 lg:grid-cols-[minmax(0,2fr)_minmax(140px,1fr)_minmax(120px,1fr)_minmax(160px,1fr)_auto]">
            {[0, 1, 2, 3, 4].map((item) => (
              <div className="h-11 animate-pulse rounded-xl bg-slate-800" key={item} />
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <div className="portal-panel overflow-hidden rounded-2xl" key={item}>
              <div className="aspect-[3/4] animate-pulse bg-slate-800" />
              <div className="space-y-3 p-4">
                <div className="h-5 w-3/4 animate-pulse rounded-full bg-slate-700" />
                <div className="h-4 w-1/2 animate-pulse rounded-full bg-slate-800" />
                <div className="h-16 animate-pulse rounded-xl bg-slate-800" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
