import { Filter } from "lucide-react";

import { PortalSelect } from "@/components/PortalSelect";

type HomeAnimeFilterProps = {
  genres: string[];
  years: number[];
};

export function HomeAnimeFilter({ genres, years }: HomeAnimeFilterProps) {
  return (
    <form
      action="/anime"
      aria-label="作品フィルター"
      className="mt-4 space-y-4 border-y border-line/10 py-5"
      method="get"
    >
      <h2 className="text-xl font-semibold text-heading sm:text-2xl">
        Advanced Anime Filter
      </h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <label className="col-span-2 block min-w-0 md:col-span-1">
          <span className="sr-only">Search</span>
          <input
            className="portal-input h-10 w-full px-3 text-sm text-heading"
            id="home-anime-query"
            name="q"
            placeholder="Search..."
            type="search"
          />
        </label>
        <PortalSelect
          hideLabel
          label="Genre"
          name="genre"
          options={[
            { label: "Genre", value: "" },
            ...genres.map((genre) => ({ label: genre, value: genre })),
          ]}
          value=""
        />
        <PortalSelect
          hideLabel
          label="Country"
          name="country"
          options={[
            { label: "Country", value: "" },
            { label: "Japan", value: "jp" },
            { label: "Original", value: "original" },
          ]}
          value=""
        />
        <PortalSelect
          hideLabel
          label="Season"
          name="season"
          options={[
            { label: "Season", value: "" },
            { label: "Spring", value: "spring" },
            { label: "Summer", value: "summer" },
            { label: "Autumn", value: "autumn" },
            { label: "Winter", value: "winter" },
          ]}
          value=""
        />
        <PortalSelect
          hideLabel
          label="Year"
          name="year"
          options={[
            { label: "Year", value: "" },
            ...years.map((year) => ({ label: String(year), value: String(year) })),
          ]}
          value=""
        />
        <PortalSelect
          hideLabel
          label="Type"
          name="type"
          options={[
            { label: "Type", value: "" },
            { label: "TV", value: "tv" },
            { label: "Movie", value: "movie" },
            { label: "OVA", value: "ova" },
            { label: "ONA", value: "ona" },
          ]}
          value=""
        />
        <PortalSelect
          hideLabel
          label="Status"
          name="status"
          options={[
            { label: "Status", value: "" },
            { label: "Watching", value: "watching" },
            { label: "Completed", value: "completed" },
            { label: "Planned", value: "planned" },
          ]}
          value=""
        />
        <PortalSelect
          hideLabel
          label="Language"
          name="language"
          options={[
            { label: "Language", value: "" },
            { label: "Japanese", value: "ja" },
            { label: "Subtitled", value: "sub" },
            { label: "Dubbed", value: "dub" },
          ]}
          value=""
        />
        <PortalSelect
          hideLabel
          label="Rating"
          name="rating"
          options={[
            { label: "Rating", value: "" },
            { label: "9+ score", value: "9" },
            { label: "8+ score", value: "8" },
            { label: "7+ score", value: "7" },
          ]}
          value=""
        />
        <PortalSelect
          hideLabel
          label="Recently updated"
          name="sort"
          options={[
            { label: "Recently updated", value: "newest" },
            { label: "Oldest anime", value: "oldest" },
            { label: "Highest score", value: "score" },
            { label: "Most reviewed", value: "reviews" },
          ]}
          value="newest"
        />
        <button
          className="inline-flex h-10 items-center justify-center gap-2 bg-violet-600 px-4 text-sm font-semibold text-white transition hover:bg-violet-500 xl:w-max"
          type="submit"
        >
          <Filter aria-hidden="true" className="h-4 w-4 shrink-0" />
          Filter
        </button>
      </div>
    </form>
  );
}
