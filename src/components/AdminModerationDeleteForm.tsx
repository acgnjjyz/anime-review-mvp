"use client";

import { useState } from "react";
import { Trash2, X } from "lucide-react";

import { deleteAdminComment, deleteAdminReview } from "@/app/actions/admin-moderation";
import { SubmitButton } from "@/components/SubmitButton";

type SharedProps = {
  label: string;
  reportId?: string;
  source?: "reviews" | "comments" | "reports";
};

type AdminModerationDeleteFormProps =
  | (SharedProps & {
      kind: "review";
      reviewId: string;
    })
  | (SharedProps & {
      kind: "comment";
      commentId: string;
    });

export function AdminModerationDeleteForm(props: AdminModerationDeleteFormProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const action = props.kind === "review" ? deleteAdminReview : deleteAdminComment;
  const hiddenName = props.kind === "review" ? "reviewId" : "commentId";
  const hiddenValue = props.kind === "review" ? props.reviewId : props.commentId;

  return (
    <form action={action} className="min-w-44">
      <input name={hiddenName} type="hidden" value={hiddenValue} />
      {props.reportId ? <input name="reportId" type="hidden" value={props.reportId} /> : null}
      {props.source ? <input name="source" type="hidden" value={props.source} /> : null}

      {!isConfirming ? (
        <button
          className="inline-flex h-9 items-center gap-2 rounded border border-red-200 bg-white px-3 text-xs font-black text-red-600 transition hover:bg-red-50"
          onClick={() => setIsConfirming(true)}
          type="button"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          削除
        </button>
      ) : (
        <div className="space-y-3 rounded border border-red-200 bg-red-50 p-3">
          <p className="text-xs font-bold leading-5 text-red-700">
            「{props.label}」を削除しますか？
            <br />
            この操作は元に戻せません。
          </p>
          <label className="block text-xs font-black text-red-700">
            削除理由
            <textarea
              className="mt-1 min-h-20 w-full rounded border border-red-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-200"
              maxLength={500}
              name="reason"
              placeholder="例: 誹謗中傷を含むため"
              required
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              className="inline-flex h-9 items-center gap-1 rounded border border-slate-200 bg-white px-3 text-xs font-black text-slate-600 transition hover:bg-slate-50"
              onClick={() => setIsConfirming(false)}
              type="button"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              キャンセル
            </button>
            <SubmitButton
              className="inline-flex h-9 items-center gap-2 rounded bg-red-600 px-3 text-xs font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
              pendingLabel="削除中..."
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              削除する
            </SubmitButton>
          </div>
        </div>
      )}
    </form>
  );
}
