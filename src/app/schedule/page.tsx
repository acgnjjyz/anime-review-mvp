import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { CalendarDays } from "lucide-react";

import { EmptyState } from "@/components/EmptyState";
import { ScoreBadge } from "@/components/ScoreBadge";
import { SetupNotice } from "@/components/SetupNotice";
import { hasDatabaseEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { averageScore } from "@/lib/score";

export const dynamic = "force-dynamic";

const days = [
  { key: "MONDAY", label: "Monday", ja: "\u6708" },
  { key: "TUESDAY", label: "Tuesday", ja: "\u706b" },
  { key: "WEDNESDAY", label: "Wednesday", ja: "\u6c34" },
  { key: "THURSDAY", label: "Thursday", ja: "\u6728" },
  { key: "FRIDAY", label: "Friday", ja: "\u91d1" },
  { key: "SATURDAY", label: "Saturday", ja: "\u571f" },
  { key: "SUNDAY", label: "Sunday", ja: "\u65e5" },
];

type ScheduleAnime = Prisma.AnimeGetPayload<{
  include: {
    reviews: { select: { score: true } };
    ratings: { select: { score: true } };
    _count: { select: { favorites: true } };
  };
}>;

export default async function SchedulePage() {
  if (!hasDatabaseEnv()) {
    return <SetupNotice />;
  }

  let animeList: ScheduleAnime[] = [];

  try {
    animeList = await prisma.anime.findMany({
      where: { isPublished: true },
      include: {
        reviews: { select: { score: true } },
        ratings: { select: { score: true } },
        _count: { select: { favorites: true } },
      },
      orderBy: [{ releaseYear: "desc" }, { title: "asc" }],
    });
  } catch {
    return (
      <SetupNotice
        title="Could not load schedule"
        description="Check DATABASE_URL, DIRECT_URL, and Supabase database status."
      />
    );
  }

  return (
    <div className="portal-shell">
      <section className="border-b border-stroke/25 bg-field/60">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-cyan-ink">
            Schedule
          </p>
          <h1 className="mt-2 text-4xl font-black text-heading">Weekly Anime Schedule</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            A portal-style weekly lineup for reviews and discovery. No episode streaming is
            provided.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Weekdays">
          {days.map((day) => (
            <a
              className="shrink-0 rounded-full border border-stroke/25 bg-raised/70 px-4 py-2 text-sm font-black text-secondary transition hover:border-cyan-300/40 hover:text-heading"
              href={`#${day.key.toLowerCase()}`}
              key={day.key}
              role="tab"
            >
              {day.label} / {day.ja}
            </a>
          ))}
        </div>

        <div className="space-y-10">
          {days.map((day) => {
            const items = animeList.filter((anime) => anime.airingDay === day.key);

            return (
              <section className="portal-panel rounded-3xl p-5" id={day.key.toLowerCase()} key={day.key}>
                <div className="flex items-center gap-3">
                  <CalendarDays className="h-5 w-5 text-cyan-ink" aria-hidden="true" />
                  <h2 className="text-2xl font-black text-heading">
                    {day.label} / {day.ja}
                  </h2>
                </div>

                {items.length === 0 ? (
                  <div className="mt-5">
                    <EmptyState description="No anime has been assigned to this day yet." title="No schedule items" />
                  </div>
                ) : (
                  <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {items.map((anime) => (
                      <Link
                        className="portal-panel-soft portal-card-hover flex gap-3 rounded-2xl p-3"
                        href={`/anime/${anime.slug}`}
                        key={anime.id}
                      >
                        <img
                          alt={`${anime.title} poster`}
                          className="h-28 w-20 shrink-0 rounded-xl object-cover"
                          src={anime.coverImage}
                        />
                        <div className="min-w-0 py-1">
                          <p className="line-clamp-2 font-black leading-snug text-heading">
                            {anime.title}
                          </p>
                          <p className="mt-2 line-clamp-1 text-xs font-bold text-violet-ink">
                            {anime.genres[0] ?? "Anime"} / {anime.releaseYear}
                          </p>
                          <div className="mt-3">
                            <ScoreBadge count={anime.ratings.length} score={averageScore(anime.ratings)} />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </section>
    </div>
  );
}
