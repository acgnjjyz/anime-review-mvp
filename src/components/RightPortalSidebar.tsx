import Link from "next/link";
import type { ReactNode } from "react";
import { Clock3, MessageSquareText, Star, Tags, Trophy } from "lucide-react";

import { ScoreBadge } from "@/components/ScoreBadge";
import { AnimePoster } from "@/components/AnimePoster";
import { averageScore, formatScore } from "@/lib/score";

type SidebarAnime = {
  id: string;
  slug: string;
  title: string;
  coverImage: string;
  releaseYear: number;
  reviews: { score: number }[];
  ratings?: { score: number }[];
};

type SidebarReview = {
  id: string;
  title: string;
  score: number;
  user: { name: string | null };
  anime: {
    slug: string;
    title: string;
    coverImage?: string;
  };
};

type SidebarTag = {
  id: string;
  name: string;
  count: number;
};

type RightPortalSidebarProps = {
  topRated: SidebarAnime[];
  mostReviewed: SidebarAnime[];
  recentlyAdded: SidebarAnime[];
  latestReviews: SidebarReview[];
  tagRanking?: SidebarTag[];
};

function rankClass(index: number) {
  if (index === 0) {
    return "bg-amber-300 text-slate-950";
  }

  if (index === 1) {
    return "bg-violet-400 text-white";
  }

  if (index === 2) {
    return "bg-cyan-300 text-slate-950";
  }

  return "bg-white/10 text-slate-300";
}

function TopAnimePanel({ animeList }: { animeList: SidebarAnime[] }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#0b0b12]/95 p-3 shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-white">
            <Trophy className="h-5 w-5 text-amber-200" aria-hidden="true" />
            Top rated anime
          </h2>
          <p className="mt-1 text-xs font-medium text-slate-500">Based on your filters</p>
        </div>
        <Link className="text-[0.68rem] font-black uppercase tracking-wide text-cyan-200" href="/ranking">
          Full
        </Link>
      </div>
      <div className="mt-3 grid grid-cols-4 rounded-xl border border-white/10 bg-black/35 p-1 text-[0.65rem] font-black uppercase text-slate-500">
        {["Today", "Week", "Month", "All"].map((tab) => (
          <span
            className={
              tab === "All"
                ? "rounded-lg bg-violet-500/25 px-2 py-1.5 text-center text-violet-100"
                : "px-2 py-1.5 text-center"
            }
            key={tab}
          >
            {tab}
          </span>
        ))}
      </div>

      <div className="mt-3 space-y-2">
        {animeList.length === 0 ? (
          <p className="rounded-xl border border-white/10 bg-black/35 p-3 text-xs font-bold text-slate-400">
            No entries yet.
          </p>
        ) : (
          animeList.slice(0, 10).map((anime, index) => {
            const scoredItems = anime.ratings ?? anime.reviews;
            const score = averageScore(scoredItems);

            return (
              <Link
                className="group grid grid-cols-[28px_46px_1fr] items-center gap-2 rounded-xl border border-white/[0.08] bg-black/35 p-2 transition hover:border-violet-300/40 hover:bg-white/[0.04]"
                href={`/anime/${anime.slug}`}
                key={anime.id}
              >
                <span className={`grid h-6 w-6 place-items-center rounded-lg text-[0.68rem] font-black ${rankClass(index)}`}>
                  {index + 1}
                </span>
                <AnimePoster
                  alt={`${anime.title} poster`}
                  className="h-14 w-10 rounded-lg object-cover"
                  src={anime.coverImage}
                />
                <span className="min-w-0">
                  <span className="line-clamp-2 text-xs font-black leading-snug text-white group-hover:text-cyan-100">
                    {anime.title}
                  </span>
                  <span className="mt-1 flex items-center gap-2 text-[0.68rem] font-bold text-slate-500">
                    {anime.releaseYear}
                    <span className="text-amber-200">{formatScore(score)}</span>
                    <span>({scoredItems.length})</span>
                  </span>
                </span>
              </Link>
            );
          })
        )}
      </div>
    </section>
  );
}

function TagRankingPanel({ tags }: { tags: SidebarTag[] }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#0b0b12]/88 p-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-black text-white">
          <Tags className="h-4 w-4 text-cyan-200" aria-hidden="true" />
          Tag Ranking
        </h2>
        <Link className="text-[0.68rem] font-black uppercase tracking-wide text-cyan-200" href="/anime">
          All
        </Link>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {tags.length === 0 ? (
          <p className="text-xs leading-5 text-slate-400">No tag votes yet.</p>
        ) : (
          tags.slice(0, 12).map((tag, index) => (
            <Link
              className="group inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-black/35 px-3 py-2 text-xs font-black text-slate-300 transition hover:border-cyan-300/40 hover:bg-cyan-300/10 hover:text-white"
              href={`/anime?tag=${encodeURIComponent(tag.name)}`}
              key={tag.id}
            >
              <span className={`grid h-5 w-5 place-items-center rounded-full text-[0.62rem] ${rankClass(index)}`}>
                {index + 1}
              </span>
              <span>{tag.name}</span>
              <span className="rounded-full bg-white/[0.08] px-1.5 py-0.5 text-[0.65rem] text-cyan-100">
                {tag.count}
              </span>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}

function CompactAnimePanel({
  animeList,
  icon,
  title,
}: {
  animeList: SidebarAnime[];
  icon: ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#0b0b12]/88 p-3">
      <h2 className="flex items-center gap-2 text-sm font-black text-white">
        {icon}
        {title}
      </h2>
      <div className="mt-3 space-y-2">
        {animeList.slice(0, 5).map((anime) => {
          const scoredItems = anime.ratings ?? anime.reviews;
          const score = averageScore(scoredItems);

          return (
            <Link
              className="flex gap-2 rounded-xl border border-white/[0.07] bg-black/30 p-2 transition hover:border-cyan-300/35"
              href={`/anime/${anime.slug}`}
              key={anime.id}
            >
              <AnimePoster
                alt={`${anime.title} poster`}
                className="h-12 w-9 shrink-0 rounded-md object-cover"
                src={anime.coverImage}
              />
              <span className="min-w-0">
                <span className="line-clamp-1 text-xs font-black text-white">{anime.title}</span>
                <span className="mt-1 block">
                  <ScoreBadge count={scoredItems.length} score={score} compact />
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function LatestReviewList({ reviews }: { reviews: SidebarReview[] }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#0b0b12]/88 p-3">
      <h2 className="flex items-center gap-2 text-sm font-black text-white">
        <MessageSquareText className="h-4 w-4 text-cyan-200" aria-hidden="true" />
        Latest Reviews
      </h2>
      <div className="mt-3 space-y-2">
        {reviews.length === 0 ? (
          <p className="text-xs leading-5 text-slate-400">No reviews yet.</p>
        ) : (
          reviews.slice(0, 4).map((review) => (
            <Link
              className="block rounded-xl border border-white/[0.07] bg-black/30 p-2 transition hover:border-sky-300/35"
              href={`/anime/${review.anime.slug}`}
              key={review.id}
            >
              <p className="line-clamp-1 text-xs font-black text-white">{review.title}</p>
              <p className="mt-1 line-clamp-1 text-[0.68rem] font-bold text-slate-500">
                {review.user.name ?? "Anonymous"} / {review.anime.title}
              </p>
              <div className="mt-1">
                <ScoreBadge score={review.score} compact />
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}

export function RightPortalSidebar({
  latestReviews,
  mostReviewed,
  recentlyAdded,
  tagRanking = [],
  topRated,
}: RightPortalSidebarProps) {
  return (
    <aside className="min-w-0 space-y-3 lg:sticky lg:top-[72px] lg:self-start">
      <TopAnimePanel animeList={topRated.length ? topRated : mostReviewed} />
      <TagRankingPanel tags={tagRanking} />
      <CompactAnimePanel
        animeList={mostReviewed}
        icon={<Star className="h-4 w-4 text-violet-200" aria-hidden="true" />}
        title="Most Reviewed"
      />
      <CompactAnimePanel
        animeList={recentlyAdded}
        icon={<Clock3 className="h-4 w-4 text-cyan-200" aria-hidden="true" />}
        title="Recently Added"
      />
      <LatestReviewList reviews={latestReviews} />
    </aside>
  );
}
