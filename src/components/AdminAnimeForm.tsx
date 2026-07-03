import Link from "next/link";
import { Save } from "lucide-react";
import { AiringDay } from "@prisma/client";

import { createAdminAnime, updateAdminAnime } from "@/app/actions/admin-anime";
import { ImageUrlPreviewField } from "@/components/ImageUrlPreviewField";
import { SubmitButton } from "@/components/SubmitButton";

const dayOptions: { value: AiringDay; label: string }[] = [
  { value: AiringDay.MONDAY, label: "Monday / 月" },
  { value: AiringDay.TUESDAY, label: "Tuesday / 火" },
  { value: AiringDay.WEDNESDAY, label: "Wednesday / 水" },
  { value: AiringDay.THURSDAY, label: "Thursday / 木" },
  { value: AiringDay.FRIDAY, label: "Friday / 金" },
  { value: AiringDay.SATURDAY, label: "Saturday / 土" },
  { value: AiringDay.SUNDAY, label: "Sunday / 日" },
];

type AdminAnimeFormProps = {
  anime?: {
    id: string;
    title: string;
    synopsis: string;
    genres: string[];
    releaseYear: number;
    coverImage: string;
    trailerUrl: string | null;
    airingDay: AiringDay | null;
    isPublished: boolean;
  };
};

export function AdminAnimeForm({ anime }: AdminAnimeFormProps) {
  const isEditing = Boolean(anime);
  const action = isEditing ? updateAdminAnime : createAdminAnime;

  return (
    <form action={action} className="portal-panel space-y-5 rounded-2xl p-5">
      {anime ? <input name="animeId" type="hidden" value={anime.id} /> : null}

      <label className="block text-sm font-bold text-slate-300">
        Title
        <input
          className="portal-input mt-1 h-11 w-full rounded-xl px-3"
          defaultValue={anime?.title}
          maxLength={120}
          name="title"
          placeholder="Anime title"
          required
        />
      </label>

      <label className="block text-sm font-bold text-slate-300">
        Synopsis
        <textarea
          className="portal-input mt-1 min-h-36 w-full rounded-xl px-3 py-3 leading-7"
          defaultValue={anime?.synopsis}
          maxLength={2000}
          name="synopsis"
          placeholder="Short summary for the review portal"
          required
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-bold text-slate-300">
          Genres
          <input
            className="portal-input mt-1 h-11 w-full rounded-xl px-3"
            defaultValue={anime?.genres.join(", ")}
            name="genres"
            placeholder="Action, Romance, Mystery"
            required
          />
          <span className="mt-1 block text-xs font-medium text-slate-500">
            Separate multiple genres with commas.
          </span>
        </label>

        <label className="block text-sm font-bold text-slate-300">
          Release year
          <input
            className="portal-input mt-1 h-11 w-full rounded-xl px-3"
            defaultValue={anime?.releaseYear ?? 2026}
            max={2100}
            min={1950}
            name="releaseYear"
            required
            type="number"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-bold text-slate-300">
          Airing day
          <select
            className="portal-input mt-1 h-11 w-full rounded-xl px-3"
            defaultValue={anime?.airingDay ?? ""}
            name="airingDay"
          >
            <option value="">Not set</option>
            {dayOptions.map((day) => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-bold text-slate-300">
          Official PV / Trailer URL
          <input
            className="portal-input mt-1 h-11 w-full rounded-xl px-3"
            defaultValue={anime?.trailerUrl ?? ""}
            maxLength={1000}
            name="trailerUrl"
            placeholder="https://www.youtube.com/watch?v=..."
            type="url"
          />
          <span className="mt-1 block text-xs font-medium text-slate-500">
            Official trailers only. Episode uploads are not supported.
          </span>
        </label>
      </div>

      <ImageUrlPreviewField defaultValue={anime?.coverImage} />

      <label className="flex items-start gap-3 rounded-xl border border-slate-700 bg-slate-950/60 p-4 text-sm font-bold text-slate-300">
        <input
          className="mt-1 h-4 w-4 rounded border-slate-500 bg-slate-950 text-violet-500 focus:ring-violet-500"
          defaultChecked={anime?.isPublished ?? true}
          name="isPublished"
          type="checkbox"
        />
        <span>
          Published
          <span className="mt-1 block text-xs font-medium leading-5 text-slate-500">
            Unpublished anime stays visible in admin, but hidden from public lists, ranking, and
            non-admin detail pages.
          </span>
        </span>
      </label>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link className="text-sm font-bold text-sky-200 hover:text-white" href="/admin/anime">
          Back to anime admin
        </Link>
        <SubmitButton
          className="portal-button-primary inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-black disabled:cursor-not-allowed disabled:opacity-60"
          pendingLabel={isEditing ? "Updating..." : "Creating..."}
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          {isEditing ? "Update anime" : "Create anime"}
        </SubmitButton>
      </div>
    </form>
  );
}
