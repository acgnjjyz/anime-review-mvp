import { WatchStatus } from "@prisma/client";
import { BookmarkCheck } from "lucide-react";

import { updateWatchStatus } from "@/app/actions/anime-extras";
import { SubmitButton } from "@/components/SubmitButton";

const statusOptions = [
  { value: "", label: "Not in shelf" },
  { value: WatchStatus.WANT_TO_WATCH, label: "\u89b3\u305f\u3044" },
  { value: WatchStatus.WATCHING, label: "\u8996\u8074\u4e2d" },
  { value: WatchStatus.COMPLETED, label: "\u89b3\u7d42\u308f\u3063\u305f" },
  { value: WatchStatus.DROPPED, label: "\u4e2d\u65ad" },
  { value: WatchStatus.FAVORITE, label: "\u304a\u6c17\u306b\u5165\u308a" },
];

type WatchStatusFormProps = {
  animeId: string;
  currentStatus?: WatchStatus | null;
  isLoggedIn: boolean;
};

export function WatchStatusForm({ animeId, currentStatus, isLoggedIn }: WatchStatusFormProps) {
  if (!isLoggedIn) {
    return (
      <div className="portal-panel rounded-2xl p-5">
        <h2 className="flex items-center gap-2 text-lg font-black text-heading">
          <BookmarkCheck className="h-5 w-5 text-cyan-ink" aria-hidden="true" />
          My Anime Shelf
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted">
          Log in to save watch status for this anime.
        </p>
      </div>
    );
  }

  return (
    <form action={updateWatchStatus} className="portal-panel rounded-2xl p-5">
      <input name="animeId" type="hidden" value={animeId} />
      <h2 className="flex items-center gap-2 text-lg font-black text-heading">
        <BookmarkCheck className="h-5 w-5 text-cyan-ink" aria-hidden="true" />
        My Anime Shelf
      </h2>
      <label className="mt-4 block text-sm font-bold text-secondary">
        Watch status
        <select
          className="portal-input mt-1 h-11 w-full rounded-xl px-3"
          defaultValue={currentStatus ?? ""}
          name="status"
        >
          {statusOptions.map((option) => (
            <option key={option.value || "none"} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <SubmitButton
        className="portal-button-primary mt-4 inline-flex h-10 w-full items-center justify-center rounded-xl px-4 text-sm font-black"
        pendingLabel="Saving..."
      >
        Save status
      </SubmitButton>
    </form>
  );
}
