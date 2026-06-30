export default function AdminLoading() {
  return (
    <div className="bg-paper">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-9">
          <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
          <div className="mt-3 h-9 w-48 animate-pulse rounded bg-slate-200" />
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div className="rounded border border-slate-200 bg-white p-5" key={item}>
              <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
              <div className="mt-4 h-8 w-14 animate-pulse rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
