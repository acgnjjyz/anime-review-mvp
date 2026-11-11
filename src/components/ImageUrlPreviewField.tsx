"use client";

import { UiImage, UiInput, UiText } from "@/components/UiText";
import { ImageOff, LoaderCircle, Upload } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { createClient } from "@/lib/supabase/browser";
import { POSTER_BUCKET, POSTER_MIME_EXTENSIONS, validatePosterFile } from "@/lib/image-upload";

type ImageUrlPreviewFieldProps = {
  defaultValue?: string;
  onUploadStateChange?: (uploading: boolean) => void;
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

export function ImageUrlPreviewField({ defaultValue = "", onUploadStateChange }: ImageUrlPreviewFieldProps) {
  const [imageUrl, setImageUrl] = useState(defaultValue);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const trimmedUrl = imageUrl.trim();
  const canPreview = useMemo(() => isHttpUrl(trimmedUrl), [trimmedUrl]);
  const hasFailed = Boolean(trimmedUrl && failedUrl === trimmedUrl);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploaded, setUploaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const busyRef = useRef(false);

  async function uploadFile(file: File) {
    if (busyRef.current) return;
    setUploadError("");
    setUploaded(false);
    const validationError = validatePosterFile(file);
    if (validationError) {
      setUploadError(validationError);
      return;
    }
    busyRef.current = true;
    setUploading(true);
    onUploadStateChange?.(true);
    try {
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("ログインし直してからアップロードしてください。");
      const path = `${user.id}/${crypto.randomUUID()}.${POSTER_MIME_EXTENSIONS[file.type]}`;
      const { error } = await supabase.storage.from(POSTER_BUCKET).upload(path, file, {
        contentType: file.type,
        cacheControl: "31536000",
        upsert: false,
      });
      if (error) {
        throw new Error("画像をアップロードできませんでした。管理者権限と通信状態を確認して、もう一度お試しください。");
      }
      const { data } = supabase.storage.from(POSTER_BUCKET).getPublicUrl(path);
      setImageUrl(data.publicUrl);
      setFailedUrl(null);
      setUploaded(true);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "画像のアップロードに失敗しました。");
    } finally {
      busyRef.current = false;
      setUploading(false);
      onUploadStateChange?.(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <button
          className="portal-button-secondary inline-flex min-h-11 items-center gap-2 px-4 text-sm font-bold disabled:cursor-wait disabled:opacity-60"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          type="button"
        >
          {uploading ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Upload className="h-4 w-4" aria-hidden="true" />}
          <UiText text={uploading ? "Uploading..." : "Choose and upload an image"} />
        </button>
        <UiInput
          accept="image/jpeg,image/png,image/webp,image/gif"
          aria-label="作品画像のファイル"
          className="hidden"
          disabled={uploading}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) void uploadFile(file);
          }}
          ref={fileInputRef}
          type="file"
        />
        <span className="text-xs text-muted"><UiText text="JPEG, PNG, WebP or GIF, up to 5MB" /></span>
      </div>
      {uploadError ? <p className="text-sm text-red-ink" role="alert"><UiText text={uploadError} /></p> : null}
      {uploaded ? <p className="text-sm text-emerald-ink" role="status"><UiText text="Upload complete. Save the anime to apply this image." /></p> : null}
      <label className="block text-sm font-bold text-foreground">
        画像URL
        <UiInput
          className="mt-1 h-11 w-full rounded border border-stroke/20 px-3 outline-none focus:border-mint focus:ring-2 focus:ring-mint/20"
          disabled={uploading}
          value={imageUrl}
          maxLength={1000}
          name="coverImage"
          onChange={(event) => {
            setImageUrl(event.target.value);
            setFailedUrl(null);
            setUploaded(false);
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
          <UiImage
            alt="画像プレビュー"
            className="aspect-[16/9] max-h-96 w-full object-contain"
            onError={() => setFailedUrl(trimmedUrl)}
            src={trimmedUrl}
          />
        )}
      </div>
    </div>
  );
}
