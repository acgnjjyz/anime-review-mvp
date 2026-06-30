import Link from "next/link";
import { Save } from "lucide-react";

import { createAdminAnime, updateAdminAnime } from "@/app/actions/admin-anime";
import { ImageUrlPreviewField } from "@/components/ImageUrlPreviewField";
import { SubmitButton } from "@/components/SubmitButton";

type AdminAnimeFormProps = {
  anime?: {
    id: string;
    title: string;
    synopsis: string;
    genres: string[];
    releaseYear: number;
    coverImage: string;
    isPublished: boolean;
  };
};

export function AdminAnimeForm({ anime }: AdminAnimeFormProps) {
  const isEditing = Boolean(anime);
  const action = isEditing ? updateAdminAnime : createAdminAnime;

  return (
    <form action={action} className="space-y-5 rounded border border-slate-200 bg-white p-5">
      {anime ? <input name="animeId" type="hidden" value={anime.id} /> : null}

      <label className="block text-sm font-bold text-slate-700">
        タイトル
        <input
          className="mt-1 h-11 w-full rounded border border-slate-300 px-3 outline-none focus:border-mint focus:ring-2 focus:ring-mint/20"
          defaultValue={anime?.title}
          maxLength={120}
          name="title"
          placeholder="例: 新作アニメタイトル"
          required
        />
      </label>

      <label className="block text-sm font-bold text-slate-700">
        概要
        <textarea
          className="mt-1 min-h-36 w-full rounded border border-slate-300 px-3 py-3 leading-7 outline-none focus:border-mint focus:ring-2 focus:ring-mint/20"
          defaultValue={anime?.synopsis}
          maxLength={2000}
          name="synopsis"
          placeholder="作品のあらすじや見どころを入力します。"
          required
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-bold text-slate-700">
          ジャンル
          <input
            className="mt-1 h-11 w-full rounded border border-slate-300 px-3 outline-none focus:border-mint focus:ring-2 focus:ring-mint/20"
            defaultValue={anime?.genres.join(", ")}
            name="genres"
            placeholder="例: SF, 冒険, ドラマ"
            required
          />
          <span className="mt-1 block text-xs font-medium text-slate-500">
            カンマ区切りで複数入力できます。
          </span>
        </label>

        <label className="block text-sm font-bold text-slate-700">
          放送年
          <input
            className="mt-1 h-11 w-full rounded border border-slate-300 px-3 outline-none focus:border-mint focus:ring-2 focus:ring-mint/20"
            defaultValue={anime?.releaseYear ?? 2026}
            max={2100}
            min={1950}
            name="releaseYear"
            required
            type="number"
          />
        </label>
      </div>

      <ImageUrlPreviewField defaultValue={anime?.coverImage} />

      <label className="flex items-start gap-3 rounded border border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-700">
        <input
          className="mt-1 h-4 w-4 rounded border-slate-300 text-mint focus:ring-mint"
          defaultChecked={anime?.isPublished ?? true}
          name="isPublished"
          type="checkbox"
        />
        <span>
          公開する
          <span className="mt-1 block text-xs font-medium leading-5 text-slate-500">
            オフにすると一般の一覧、トップ、ランキング、詳細ページには表示されません。
          </span>
        </span>
      </label>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link className="text-sm font-bold text-mint hover:text-teal-700" href="/admin/anime">
          作品管理へ戻る
        </Link>
        <SubmitButton
          className="inline-flex h-11 items-center justify-center gap-2 rounded bg-ink px-4 text-sm font-black text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          pendingLabel={isEditing ? "更新中..." : "作成中..."}
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          {isEditing ? "更新する" : "追加する"}
        </SubmitButton>
      </div>
    </form>
  );
}
