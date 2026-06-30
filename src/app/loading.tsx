export default function Loading() {
  return (
    <div className="bg-paper">
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="rounded border border-slate-200 bg-white p-6 shadow-soft">
          <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 h-8 w-64 animate-pulse rounded bg-slate-200" />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div className="rounded border border-slate-200 p-4" key={item}>
                <div className="h-32 animate-pulse rounded bg-slate-200" />
                <div className="mt-4 h-4 w-3/4 animate-pulse rounded bg-slate-200" />
                <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-slate-200" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
