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
        className={
          isLiked
            ? "inline-flex h-9 items-center gap-2 rounded-full border border-rose-300/[0.35] bg-rose-500/20 px-3 text-xs font-black text-rose-ink transition hover:bg-rose-500/30 disabled:cursor-not-allowed disabled:opacity-50"
            : "inline-flex h-9 items-center gap-2 rounded-full border border-stroke/25 bg-field/70 px-3 text-xs font-black text-secondary transition hover:border-rose-300/50 hover:text-rose-ink disabled:cursor-not-allowed disabled:opacity-50"
        }
        disabled={!isLoggedIn}
        pendingLabel="Updating..."
        title={isLoggedIn ? "Toggle like" : "Login to like"}
      >
        <Heart className={isLiked ? "h-4 w-4 fill-current" : "h-4 w-4"} aria-hidden="true" />
        {count}
      </SubmitButton>
    </form>
  );
}
