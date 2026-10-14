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
          <article className="portal-panel-soft rounded-2xl p-4" key={comment.id}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-bold text-secondary">
                  {comment.user.name ?? "Anonymous"} · {formatDate(comment.createdAt)}
                </p>
                {isEdited ? (
                  <p className="mt-1 text-xs font-medium text-muted">
                    Edited: {formatDate(comment.updatedAt)}
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
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-red-400/30 bg-red-500/10 px-3 text-xs font-black text-red-ink transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                      confirmMessage="Delete this comment?"
                      pendingLabel="Deleting..."
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      Delete
                    </ConfirmSubmitButton>
                  </form>
                ) : null}
              </div>
            </div>

            <p className="mt-3 whitespace-pre-wrap leading-7 text-secondary">{comment.body}</p>

            {isMine ? (
              <details className="mt-4 rounded-2xl border border-stroke/25 bg-field/50 p-3">
                <summary className="cursor-pointer text-sm font-black text-cyan-ink">
                  Edit comment
                </summary>
                <form action={updateComment} className="mt-3">
                  <input name="commentId" type="hidden" value={comment.id} />
                  <label className="block text-sm font-bold text-secondary">
                    Updated text
                    <textarea
                      className="portal-input mt-1 min-h-24 w-full rounded-xl px-3 py-3 leading-7"
                      defaultValue={comment.body}
                      maxLength={1000}
                      name="body"
                      required
                    />
                  </label>
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-xs font-medium text-muted">Up to 1000 characters</span>
                    <SubmitButton
                      className="portal-button-primary inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-black disabled:cursor-not-allowed disabled:opacity-50"
                      pendingLabel="Updating..."
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                      Update
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
