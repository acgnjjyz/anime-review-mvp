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
      <div className="rounded border border-slate-200 bg-white p-5">
        <h2 className="text-xl font-black text-ink">レビュー投稿</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          レビューを書くにはログインしてください。ログイン後、この作品ページから投稿できます。
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

  const isEditing = Boolean(existingReview);

  return (
    <div className="space-y-3">
      <form action={saveReview} className="rounded border border-slate-200 bg-white p-5">
        <input name="animeId" type="hidden" value={animeId} />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-black text-ink">
              {isEditing ? "レビュー編集" : "レビュー投稿"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {isEditing
                ? "自分のレビューだけ編集できます。点数の変更はランキングにも反映されます。"
                : "点数は1から100で入力します。"}
            </p>
          </div>
          <label className="text-sm font-bold text-slate-700">
            点数
            <input
              className="mt-1 h-11 w-28 rounded border border-slate-300 px-3 text-base font-black outline-none focus:border-mint focus:ring-2 focus:ring-mint/20"
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

        <label className="mt-4 block text-sm font-bold text-slate-700">
          タイトル
          <input
            className="mt-1 h-11 w-full rounded border border-slate-300 px-3 outline-none focus:border-mint focus:ring-2 focus:ring-mint/20"
            defaultValue={existingReview?.title}
            maxLength={80}
            name="title"
            placeholder="例: 余韻が残る良作"
            required
          />
          <span className="mt-1 block text-xs font-medium text-slate-500">80文字以内</span>
        </label>

        <label className="mt-4 block text-sm font-bold text-slate-700">
          本文
          <textarea
            className="mt-1 min-h-36 w-full rounded border border-slate-300 px-3 py-3 leading-7 outline-none focus:border-mint focus:ring-2 focus:ring-mint/20"
            defaultValue={existingReview?.body}
            maxLength={2000}
            minLength={10}
            name="body"
            placeholder="好きだった点、気になった点、誰におすすめしたいかを書いてみましょう。"
            required
          />
          <span className="mt-1 block text-xs font-medium text-slate-500">10-2000文字</span>
        </label>

        <SubmitButton
          className="mt-4 inline-flex h-11 items-center gap-2 rounded bg-mint px-4 text-sm font-black text-white transition hover:bg-teal-700"
          pendingLabel={isEditing ? "更新中..." : "保存中..."}
        >
          <Send className="h-4 w-4" aria-hidden="true" />
          {isEditing ? "更新する" : "保存する"}
        </SubmitButton>
      </form>

      {isEditing ? (
        <form action={deleteReview} className="rounded border border-red-200 bg-red-50 p-4">
          <input name="animeId" type="hidden" value={animeId} />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-red-700">
              このレビューを削除すると、同じ作品への評価点もランキングから外れます。
            </p>
            <ConfirmSubmitButton
              className="inline-flex h-10 items-center justify-center gap-2 rounded bg-red-600 px-4 text-sm font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
              confirmMessage="このレビューを削除しますか？関連する評価点も削除されます。"
              pendingLabel="削除中..."
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              削除する
            </ConfirmSubmitButton>
          </div>
        </form>
      ) : null}
    </div>
  );
}
