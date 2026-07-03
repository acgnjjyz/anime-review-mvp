import Link from "next/link";
import { Send, Trash2 } from "lucide-react";

import { deleteReview, saveReview } from "@/app/actions/review";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";
import { SubmitButton } from "@/components/SubmitButton";

type ReviewFormProps = {
  animeId: string;
  isLoggedIn: boolean;
  existingReview?: {
    score: number;
    title: string;
    body: string;
  } | null;
};

export function ReviewForm({ animeId, isLoggedIn, existingReview }: ReviewFormProps) {
  if (!isLoggedIn) {
    return (
      <div className="portal-panel rounded-2xl p-5" id="review-form">
        <h2 className="text-xl font-black text-white">Write a Review</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Please log in to post a score and review for this anime.
        </p>
        <Link
          className="portal-button-primary mt-4 inline-flex h-10 items-center rounded-full px-4 text-sm font-black"
          href="/login"
        >
          Login to review
        </Link>
      </div>
    );
  }

  const isEditing = Boolean(existingReview);

  return (
    <div className="space-y-3" id="review-form">
      <form action={saveReview} className="portal-panel rounded-2xl p-5">
        <input name="animeId" type="hidden" value={animeId} />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-black text-white">
              {isEditing ? "Edit Your Review" : "Write a Review"}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Scores update the ranking automatically.
            </p>
          </div>
          <label className="text-sm font-bold text-slate-300">
            Score
            <input
              className="portal-input mt-1 h-11 w-28 rounded-xl px-3 text-base font-black"
              defaultValue={existingReview?.score ?? 80}
              max={100}
              min={1}
              name="score"
              required
              type="number"
            />
            <span className="mt-1 block text-xs font-medium text-slate-500">1-100</span>
          </label>
        </div>

        <label className="mt-4 block text-sm font-bold text-slate-300">
          Title
          <input
            className="portal-input mt-1 h-11 w-full rounded-xl px-3"
            defaultValue={existingReview?.title}
            maxLength={80}
            name="title"
            placeholder="What stayed with you?"
            required
          />
          <span className="mt-1 block text-xs font-medium text-slate-500">Up to 80 characters</span>
        </label>

        <label className="mt-4 block text-sm font-bold text-slate-300">
          Body
          <textarea
            className="portal-input mt-1 min-h-36 w-full rounded-xl px-3 py-3 leading-7"
            defaultValue={existingReview?.body}
            maxLength={2000}
            minLength={10}
            name="body"
            placeholder="Share what you liked, what stood out, and who you would recommend it to."
            required
          />
          <span className="mt-1 block text-xs font-medium text-slate-500">10-2000 characters</span>
        </label>

        <SubmitButton
          className="portal-button-primary mt-4 inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-black"
          pendingLabel={isEditing ? "Updating..." : "Saving..."}
        >
          <Send className="h-4 w-4" aria-hidden="true" />
          {isEditing ? "Update Review" : "Save Review"}
        </SubmitButton>
      </form>

      {isEditing ? (
        <form action={deleteReview} className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4">
          <input name="animeId" type="hidden" value={animeId} />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-red-100">
              Delete your review and its rating from this anime.
            </p>
            <ConfirmSubmitButton
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-red-600 px-4 text-sm font-black text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-red-950"
              confirmMessage="Delete this review? The related rating will also be removed."
              pendingLabel="Deleting..."
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Delete
            </ConfirmSubmitButton>
          </div>
        </form>
      ) : null}
    </div>
  );
}
