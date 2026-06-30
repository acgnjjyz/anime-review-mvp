import { Pencil, Trash2 } from "lucide-react";

import { deleteComment, updateComment } from "@/app/actions/comment";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";
import { ReportForm } from "@/components/ReportForm";
import { SubmitButton } from "@/components/SubmitButton";

type CommentListProps = {
  comments: {
    id: string;
    userId: string;
    body: string;
    createdAt: Date;
    updatedAt: Date;
    user: {
      name: string | null;
    };
    reports: {
      reporterId: string;
    }[];
  }[];
  currentUserId: string | null;
};

function formatDate(date: Date) {
  return date.toLocaleString("ja-JP", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CommentList({ comments, currentUserId }: CommentListProps) {
  return (
    <div className="space-y-3">
      {comments.map((comment) => {
        const isMine = currentUserId === comment.userId;
        const isEdited = comment.updatedAt.getTime() !== comment.createdAt.getTime();
        const isReported = Boolean(
          currentUserId && comment.reports.some((report) => report.reporterId === currentUserId),
        );

        return (
          <article className="rounded border border-slate-200 bg-white p-4" key={comment.id}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-bold text-slate-500">
                  {comment.user.name ?? "匿名ユーザー"} ・ {formatDate(comment.createdAt)}
                </p>
                {isEdited ? (
                  <p className="mt-1 text-xs font-medium text-slate-400">
                    編集済み: {formatDate(comment.updatedAt)}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap items-start gap-2">
                <ReportForm
                  isLoggedIn={Boolean(currentUserId)}
                  isReported={isReported}
                  targetId={comment.id}
                  targetType="COMMENT"
                />
                {isMine ? (
                  <form action={deleteComment}>
                    <input name="commentId" type="hidden" value={comment.id} />
                    <ConfirmSubmitButton
                      className="inline-flex h-9 items-center justify-center gap-2 rounded border border-red-200 bg-white px-3 text-xs font-black text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:bg-red-100"
                      confirmMessage="このコメントを削除しますか？"
                      pendingLabel="削除中..."
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      削除
                    </ConfirmSubmitButton>
                  </form>
                ) : null}
              </div>
            </div>

            <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-700">{comment.body}</p>

            {isMine ? (
              <details className="mt-4 rounded border border-slate-200 bg-slate-50 p-3">
                <summary className="cursor-pointer text-sm font-black text-mint">
                  コメントを編集
                </summary>
                <form action={updateComment} className="mt-3">
                  <input name="commentId" type="hidden" value={comment.id} />
                  <label className="block text-sm font-bold text-slate-700">
                    編集本文
                    <textarea
                      className="mt-1 min-h-24 w-full rounded border border-slate-300 bg-white px-3 py-3 leading-7 outline-none focus:border-mint focus:ring-2 focus:ring-mint/20"
                      defaultValue={comment.body}
                      maxLength={1000}
                      name="body"
                      required
                    />
                  </label>
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-xs font-medium text-slate-500">1000文字以内</span>
                    <SubmitButton
                      className="inline-flex h-10 items-center justify-center gap-2 rounded bg-mint px-4 text-sm font-black text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-teal-300"
                      pendingLabel="更新中..."
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                      更新する
                    </SubmitButton>
                  </div>
                </form>
              </details>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
