import { ReportStatus } from "@prisma/client";

import { updateReportStatus } from "@/app/actions/social";
import { SubmitButton } from "@/components/SubmitButton";

type AdminReportStatusFormProps = {
  reportId: string;
  status: ReportStatus;
};

export function AdminReportStatusForm({ reportId, status }: AdminReportStatusFormProps) {
  return (
    <form action={updateReportStatus} className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <input name="reportId" type="hidden" value={reportId} />
      <select
        className="h-9 rounded border border-slate-300 bg-white px-2 text-xs font-bold outline-none focus:border-mint focus:ring-2 focus:ring-mint/20"
        defaultValue={status}
        name="status"
      >
        <option value={ReportStatus.PENDING}>未対応</option>
        <option value={ReportStatus.RESOLVED}>対応済み</option>
        <option value={ReportStatus.REJECTED}>却下</option>
      </select>
      <SubmitButton
        className="h-9 rounded bg-ink px-3 text-xs font-black text-white transition hover:bg-slate-700 disabled:bg-slate-300"
        pendingLabel="更新中..."
      >
        更新
      </SubmitButton>
    </form>
  );
}
