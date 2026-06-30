import Link from "next/link";
import { Flag } from "lucide-react";

import { createReport } from "@/app/actions/social";
import { SubmitButton } from "@/components/SubmitButton";

type ReportFormProps = {
  targetId: string;
  targetType: "REVIEW" | "COMMENT";
  isLoggedIn: boolean;
  isReported: boolean;
};

export function ReportForm({ targetId, targetType, isLoggedIn, isReported }: ReportFormProps) {
  if (!isLoggedIn) {
    return (
      <Link className="text-xs font-bold text-slate-500 hover:text-mint" href="/login">
        通報するにはログイン
      </Link>
    );
  }

  if (isReported) {
    return <span className="text-xs font-bold text-slate-400">通報済み</span>;
  }

  return (
    <details className="rounded border border-slate-200 bg-slate-50 p-3">
      <summary className="cursor-pointer text-xs font-black text-slate-600">
        <span className="inline-flex items-center gap-1">
          <Flag className="h-3.5 w-3.5" aria-hidden="true" />
          通報
        </span>
      </summary>
      <form action={createReport} className="mt-3 space-y-3">
        <input name="targetId" type="hidden" value={targetId} />
        <input name="targetType" type="hidden" value={targetType} />
        <label className="block text-xs font-black text-slate-600">
          理由
          <select
            className="mt-1 h-9 w-full rounded border border-slate-300 bg-white px-2 text-xs outline-none focus:border-mint focus:ring-2 focus:ring-mint/20"
            name="selectedReason"
            required
          >
            <option value="スパム・宣伝">スパム・宣伝</option>
            <option value="誹謗中傷">誹謗中傷</option>
            <option value="ネタバレ配慮不足">ネタバレ配慮不足</option>
            <option value="その他">その他</option>
          </select>
        </label>
        <label className="block text-xs font-black text-slate-600">
          補足
          <textarea
            className="mt-1 min-h-20 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-mint focus:ring-2 focus:ring-mint/20"
            maxLength={500}
            name="customReason"
            placeholder="任意で詳しい理由を入力"
          />
        </label>
        <SubmitButton
          className="inline-flex h-9 items-center gap-2 rounded bg-ink px-3 text-xs font-black text-white transition hover:bg-slate-700 disabled:bg-slate-300"
          pendingLabel="送信中..."
        >
          <Flag className="h-4 w-4" aria-hidden="true" />
          通報する
        </SubmitButton>
      </form>
    </details>
  );
}
