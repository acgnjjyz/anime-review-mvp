import { Heart } from "lucide-react";

import { toggleReviewLike } from "@/app/actions/social";
import { SubmitButton } from "@/components/SubmitButton";

type ReviewLikeButtonProps = {
  reviewId: string;
  count: number;
  isLiked: boolean;
  isLoggedIn: boolean;
};

export function ReviewLikeButton({ reviewId, count, isLiked, isLoggedIn }: ReviewLikeButtonProps) {
  return (
    <form action={toggleReviewLike}>
      <input name="reviewId" type="hidden" value={reviewId} />
      <SubmitButton
        className="inline-flex h-9 items-center gap-2 rounded border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 transition hover:border-coral hover:text-coral disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
        disabled={!isLoggedIn}
        pendingLabel="更新中..."
        title={isLoggedIn ? "レビューのいいねを切り替える" : "ログインするといいねできます"}
      >
        <Heart className={isLiked ? "h-4 w-4 fill-current text-coral" : "h-4 w-4"} aria-hidden="true" />
        {count}
      </SubmitButton>
    </form>
  );
}
