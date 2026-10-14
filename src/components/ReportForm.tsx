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
      <Link className="text-xs font-bold text-muted hover:text-cyan-ink" href="/login">
        Login to report
      </Link>
    );
  }

  if (isReported) {
    return <span className="text-xs font-bold text-muted">Reported</span>;
  }

  return (
    <details className="rounded-2xl border border-stroke/25 bg-field/60 p-3">
      <summary className="cursor-pointer text-xs font-black text-secondary">
        <span className="inline-flex items-center gap-1">
          <Flag className="h-3.5 w-3.5" aria-hidden="true" />
          Report
        </span>
      </summary>
      <form action={createReport} className="mt-3 space-y-3">
        <input name="targetId" type="hidden" value={targetId} />
        <input name="targetType" type="hidden" value={targetType} />
        <label className="block text-xs font-black text-secondary">
          Reason
          <select
            className="portal-input mt-1 h-9 w-full rounded-xl px-2 text-xs"
            name="selectedReason"
            required
          >
            <option value="Spam or promotion">Spam or promotion</option>
            <option value="Harassment or hate">Harassment or hate</option>
            <option value="Major spoiler without warning">Major spoiler without warning</option>
            <option value="Other">Other</option>
          </select>
        </label>
        <label className="block text-xs font-black text-secondary">
          Details
          <textarea
            className="portal-input mt-1 min-h-20 w-full rounded-xl px-3 py-2 text-sm"
            maxLength={500}
            name="customReason"
            placeholder="Optional details"
          />
        </label>
        <SubmitButton
          className="portal-button-secondary inline-flex h-9 items-center gap-2 rounded-full px-3 text-xs font-black disabled:opacity-50"
          pendingLabel="Sending..."
        >
          <Flag className="h-4 w-4" aria-hidden="true" />
          Send Report
        </SubmitButton>
      </form>
    </details>
  );
}
