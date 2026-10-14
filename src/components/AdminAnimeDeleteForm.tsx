"use client";

import { useState } from "react";
import { Trash2, X } from "lucide-react";

import { deleteAdminAnime } from "@/app/actions/admin-anime";
import { SubmitButton } from "@/components/SubmitButton";

type AdminAnimeDeleteFormProps = {
  animeId: string;
  animeTitle: string;
};

export function AdminAnimeDeleteForm({ animeId, animeTitle }: AdminAnimeDeleteFormProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  return (
    <form action={deleteAdminAnime} className="min-w-44">
      <input name="animeId" type="hidden" value={animeId} />

      {!isConfirming ? (
        <button
          className="inline-flex h-9 items-center gap-2 rounded border border-red-200 bg-panel px-3 text-xs font-black text-red-600 transition hover:bg-red-50"
          onClick={() => setIsConfirming(true)}
          type="button"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          削除
        </button>
      ) : (
        <div
          aria-label={`${animeTitle}の削除確認`}
          className="space-y-3 rounded border border-red-200 bg-red-50 p-3"
          role="dialog"
        >
          <p className="text-xs font-bold leading-5 text-red-700">
            「{animeTitle}」を削除しますか？
            <br />
            レビュー等がある作品は削除されません。
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              className="inline-flex h-9 items-center gap-1 rounded border border-stroke/20 bg-panel px-3 text-xs font-black text-secondary transition hover:bg-raised"
              onClick={() => setIsConfirming(false)}
              type="button"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              キャンセル
            </button>
            <SubmitButton
              className="inline-flex h-9 items-center gap-2 rounded bg-red-600 px-3 text-xs font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
              pendingLabel="削除中..."
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              削除する
            </SubmitButton>
          </div>
        </div>
      )}
    </form>
  );
}
