import Link from "next/link";
import { MessageSquarePlus } from "lucide-react";

import { createComment } from "@/app/actions/comment";
import { SubmitButton } from "@/components/SubmitButton";

type CommentFormProps = {
  animeId: string;
  isLoggedIn: boolean;
};

export function CommentForm({ animeId, isLoggedIn }: CommentFormProps) {
  if (!isLoggedIn) {
    return (
      <div className="portal-panel rounded-2xl p-5">
        <h3 className="text-lg font-black text-white">Join the Comments</h3>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Log in to leave a comment on this anime.
        </p>
        <Link
          className="portal-button-secondary mt-4 inline-flex h-10 items-center rounded-full px-4 text-sm font-black"
          href="/login"
        >
          Login to comment
        </Link>
      </div>
    );
  }

  return (
    <form action={createComment} className="portal-panel rounded-2xl p-5">
      <input name="animeId" type="hidden" value={animeId} />
      <label className="block text-sm font-bold text-slate-300">
        Comment
        <textarea
          className="portal-input mt-1 min-h-28 w-full rounded-xl px-3 py-3 leading-7"
          maxLength={1000}
          name="body"
          placeholder="Add a reaction, thought, or follow-up."
          required
        />
      </label>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xs font-medium text-slate-500">Up to 1000 characters</span>
        <SubmitButton
          className="portal-button-primary inline-flex h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-black disabled:cursor-not-allowed disabled:opacity-50"
          pendingLabel="Posting..."
        >
          <MessageSquarePlus className="h-4 w-4" aria-hidden="true" />
          Post Comment
        </SubmitButton>
      </div>
    </form>
  );
}
