export default function AnimeListLoading() {
  return (
    <div className="bg-paper">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-9">
          <div className="h-4 w-16 animate-pulse rounded bg-slate-200" />
          <div className="mt-3 h-9 w-48 animate-pulse rounded bg-slate-200" />
          <div className="mt-6 grid gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(140px,1fr)_minmax(120px,1fr)_minmax(160px,1fr)_auto]">
            {[0, 1, 2, 3, 4].map((item) => (
              <div className="h-11 animate-pulse rounded bg-slate-200" key={item} />
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <div className="overflow-hidden rounded border border-slate-200 bg-white" key={item}>
              <div className="h-48 animate-pulse bg-slate-200" />
              <div className="space-y-3 p-4">
                <div className="h-5 w-3/4 animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
                <div className="h-16 animate-pulse rounded bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
