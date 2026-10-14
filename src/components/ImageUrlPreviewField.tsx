"use client";

import { ImageOff } from "lucide-react";
import { useMemo, useState } from "react";

type ImageUrlPreviewFieldProps = {
  defaultValue?: string;
};

function isHttpUrl(value: string) {
  if (value === "/images/catalog-placeholder.svg") return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function ImageUrlPreviewField({ defaultValue = "" }: ImageUrlPreviewFieldProps) {
  const [imageUrl, setImageUrl] = useState(defaultValue);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const trimmedUrl = imageUrl.trim();
  const canPreview = useMemo(() => isHttpUrl(trimmedUrl), [trimmedUrl]);
  const hasFailed = Boolean(trimmedUrl && failedUrl === trimmedUrl);

  return (
    <div className="space-y-3">
      <label className="block text-sm font-bold text-foreground">
        画像URL
        <input
          className="mt-1 h-11 w-full rounded border border-stroke/20 px-3 outline-none focus:border-mint focus:ring-2 focus:ring-mint/20"
          defaultValue={defaultValue}
          maxLength={1000}
          name="coverImage"
          onChange={(event) => {
            setImageUrl(event.target.value);
            setFailedUrl(null);
          }}
          placeholder="https://..."
          required
          type="text"
          inputMode="url"
        />
      </label>

      <div className="overflow-hidden rounded border border-stroke/20 bg-raised">
        {trimmedUrl.length === 0 ? (
          <div className="grid aspect-[16/9] place-items-center px-4 text-center text-sm font-bold text-muted">
            画像URLを入力するとプレビューが表示されます。
          </div>
        ) : hasFailed || !canPreview ? (
          <div className="grid aspect-[16/9] place-items-center gap-2 px-4 text-center text-sm font-bold text-red-600">
            <ImageOff className="mx-auto h-8 w-8" aria-hidden="true" />
            画像を読み込めません
          </div>
        ) : (
          <img
            alt="画像プレビュー"
            className="aspect-[16/9] w-full object-cover"
            onError={() => setFailedUrl(trimmedUrl)}
            src={trimmedUrl}
          />
        )}
      </div>
    </div>
  );
}
