import Link from "next/link";

export default function NotFound() {
  return (
    <div className="portal-shell">
      <section className="mx-auto max-w-3xl px-4 py-16">
        <div className="portal-panel rounded-3xl p-6 text-center">
          <p className="text-sm font-black text-cyan-ink">404</p>
          <h1 className="mt-2 text-2xl font-black text-heading">Page not found</h1>
          <p className="mt-3 leading-7 text-muted">
            The URL may have changed, or the anime may be private or unavailable.
          </p>
          <Link
            className="portal-button-primary mt-5 inline-flex h-10 items-center rounded-full px-4 text-sm font-black"
            href="/anime"
          >
            Back to Anime
          </Link>
        </div>
      </section>
    </div>
  );
}
