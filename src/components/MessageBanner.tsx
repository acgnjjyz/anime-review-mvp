import { ClearMessageQuery } from "@/components/ClearMessageQuery";

type MessageBannerProps = {
  error?: string;
  message?: string;
};

export function MessageBanner({ error, message }: MessageBannerProps) {
  if (!error && !message) {
    return null;
  }

  return (
    <>
      <ClearMessageQuery enabled={Boolean(error || message)} />
      <div
        role={error ? "alert" : "status"}
        className={
          error
            ? "rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-ink"
            : "rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-ink"
        }
      >
        {error ?? message}
      </div>
    </>
  );
}
