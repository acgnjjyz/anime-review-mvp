import { Star } from "lucide-react";

import { formatScore } from "@/lib/score";

type ScoreBadgeProps = {
  score: number | null;
  count?: number;
  compact?: boolean;
};

export function ScoreBadge({ compact = false, count, score }: ScoreBadgeProps) {
  return (
    <span
      className={
        compact
          ? "inline-flex items-center gap-1 rounded-full border border-amber-300/20 bg-amber-300/10 px-2 py-1 text-[0.68rem] font-black text-amber-200"
          : "inline-flex items-center gap-1.5 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1.5 text-sm font-black text-amber-200"
      }
    >
      <Star className={compact ? "h-3 w-3 fill-current" : "h-4 w-4 fill-current"} aria-hidden="true" />
      {formatScore(score)}
      {typeof count === "number" ? (
        <span className="font-semibold text-amber-100/70">({count})</span>
      ) : null}
    </span>
  );
}
