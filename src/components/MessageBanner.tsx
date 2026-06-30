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
            ? "rounded border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
            : "rounded border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"
        }
      >
        {error ?? message}
      </div>
    </>
  );
}
