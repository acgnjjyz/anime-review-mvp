export const POSTER_BUCKET = "anime-posters";
export const MAX_POSTER_BYTES = 5 * 1024 * 1024;
export const POSTER_MIME_EXTENSIONS: Readonly<Record<string, string>> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export function validatePosterFile(file: { type: string; size: number }) {
  if (!Object.hasOwn(POSTER_MIME_EXTENSIONS, file.type)) return "JPEG・PNG・WebP・GIFの画像を選択してください。";
  if (file.size === 0) return "空のファイルはアップロードできません。";
  if (file.size > MAX_POSTER_BYTES) return "画像は5MB以下にしてください。";
  return null;
}
