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
      <div className="rounded border border-slate-200 bg-white p-5">
        <h3 className="text-lg font-black text-ink">コメント投稿</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          コメントを書くにはログインしてください。ログイン後、この作品ページから投稿できます。
        </p>
        <Link
          className="mt-4 inline-flex h-10 items-center rounded bg-ink px-4 text-sm font-bold text-white hover:bg-slate-700"
          href="/login"
        >
          ログインへ
        </Link>
      </div>
    );
  }

  return (
    <form action={createComment} className="rounded border border-slate-200 bg-white p-5">
      <input name="animeId" type="hidden" value={animeId} />
      <label className="block text-sm font-bold text-slate-700">
        コメント本文
        <textarea
          className="mt-1 min-h-28 w-full rounded border border-slate-300 px-3 py-3 leading-7 outline-none focus:border-mint focus:ring-2 focus:ring-mint/20"
          maxLength={1000}
          name="body"
          placeholder="作品の感想や、ほかのレビューへの反応を書いてみましょう。"
          required
        />
      </label>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xs font-medium text-slate-500">1000文字以内</span>
        <SubmitButton
          className="inline-flex h-11 items-center justify-center gap-2 rounded bg-ink px-4 text-sm font-black text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          pendingLabel="投稿中..."
        >
          <MessageSquarePlus className="h-4 w-4" aria-hidden="true" />
          コメントする
        </SubmitButton>
      </div>
    </form>
  );
}
