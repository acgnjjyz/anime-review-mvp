import { Star } from "lucide-react";

import { formatScore } from "@/lib/score";

type ScoreBadgeProps = {
  score: number | null;
  count?: number;
};

export function ScoreBadge({ score, count }: ScoreBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1 rounded bg-honey/20 px-2.5 py-1 text-sm font-black text-amber-800">
      <Star className="h-4 w-4 fill-current" aria-hidden="true" />
      {formatScore(score)}
      {typeof count === "number" ? (
        <span className="font-medium text-amber-700">({count})</span>
      ) : null}
    </span>
  );
}
