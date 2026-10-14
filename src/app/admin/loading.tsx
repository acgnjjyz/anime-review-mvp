export default function AdminLoading() {
  return (
    <div className="bg-transparent">
      <section className="border-b border-stroke/20 bg-panel">
        <div className="mx-auto max-w-6xl px-4 py-9">
          <div className="h-4 w-20 animate-pulse rounded bg-raised" />
          <div className="mt-3 h-9 w-48 animate-pulse rounded bg-raised" />
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div className="rounded border border-stroke/20 bg-panel p-5" key={item}>
              <div className="h-4 w-20 animate-pulse rounded bg-raised" />
              <div className="mt-4 h-8 w-14 animate-pulse rounded bg-raised" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
