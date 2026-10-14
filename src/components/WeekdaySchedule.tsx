import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { AnimePoster } from "@/components/AnimePoster";

type ScheduleAnime = {
  id: string;
  slug: string;
  title: string;
  coverImage: string;
  genres: string[];
  releaseYear: number;
  airingDay?: string | null;
};

const days = [
  { key: "SUNDAY", label: "Sun" },
  { key: "MONDAY", label: "Mon" },
  { key: "TUESDAY", label: "Tue" },
  { key: "WEDNESDAY", label: "Wed" },
  { key: "THURSDAY", label: "Thu" },
  { key: "FRIDAY", label: "Fri" },
  { key: "SATURDAY", label: "Sat" },
];

export function WeekdaySchedule({ animeList }: { animeList: ScheduleAnime[] }) {
  const todayIndex = new Date().getDay();
  const grouped = days.map((day, index) => ({
    ...day,
    items: animeList
      .filter((anime, animeIndex) => (anime.airingDay ? anime.airingDay === day.key : animeIndex % days.length === index))
      .slice(0, 4),
  }));

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-cyan-ink">
            Weekly Lineup
          </p>
          <h2 className="mt-2 text-2xl font-black text-heading sm:text-3xl">
            Schedule Style Picks
          </h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-muted">
          UI preview only. These are review-site recommendations, not episode streaming links.
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Weekday picks">
        {grouped.map((group, index) => (
          <span
            className={
              index === todayIndex
                ? "shrink-0 rounded-full border border-cyan-300/40 bg-cyan-400/20 px-4 py-2 text-sm font-black text-cyan-ink"
                : "shrink-0 rounded-full border border-stroke/25 bg-raised/70 px-4 py-2 text-sm font-black text-muted"
            }
            key={group.key}
            role="tab"
            aria-selected={index === todayIndex}
          >
            {group.label}
          </span>
        ))}
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {grouped[todayIndex]?.items.length ? (
          grouped[todayIndex].items.map((anime) => (
            <Link
              className="portal-panel-soft portal-card-hover flex gap-3 rounded-2xl p-3"
              href={`/anime/${anime.slug}`}
              key={anime.id}
            >
              <AnimePoster
                alt={`${anime.title} poster`}
                className="h-24 w-16 shrink-0 rounded-xl object-cover"
                src={anime.coverImage}
              />
              <div className="min-w-0 py-1">
                <p className="line-clamp-2 font-black leading-snug text-heading">{anime.title}</p>
                <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-muted">
                  <CalendarDays className="h-3.5 w-3.5 text-cyan-ink" aria-hidden="true" />
                  {anime.releaseYear}
                </p>
                <p className="mt-2 line-clamp-1 text-xs font-bold text-violet-ink">
                  {anime.genres[0] ?? "Anime"}
                </p>
              </div>
            </Link>
          ))
        ) : (
          <div className="portal-panel-soft rounded-2xl p-5 text-sm font-bold text-muted">
            No picks for this day yet.
          </div>
        )}
      </div>
    </section>
  );
}
