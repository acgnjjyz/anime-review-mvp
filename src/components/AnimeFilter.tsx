import { UiInput, UiText } from "@/components/UiText";
import { Filter, RotateCcw } from "lucide-react";

import { PortalSelect } from "@/components/PortalSelect";

type AnimeFilterProps = {
  genres: string[];
  years: number[];
  headingLevel?: "h1" | "h2";
  values?: {
    q?: string;
    genre?: string;
    year?: string;
    sort?: string;
    tag?: string;
  };
};

export function AnimeFilter({ genres, years, headingLevel = "h2", values = {} }: AnimeFilterProps) {
  const { q = "", genre = "", year = "", sort = "newest", tag = "" } = values;
  const hasFilters = Boolean(q || genre || year || tag || sort !== "newest");
  const Heading = headingLevel;

  return (
    <form
      action="/anime"
      aria-label="作品フィルター"
      className="portal-anime-filter space-y-3 border border-line/10 bg-panel/95 p-3"
      id="anime-search"
      method="get"
    >
      <Heading className="text-lg font-semibold leading-6 text-heading">
        <UiText text={"Advanced Anime Filter"} />
      </Heading>
      {tag ? <input name="tag" type="hidden" value={tag} /> : null}
      <div className="grid grid-cols-2 gap-2">
        <label className="col-span-2 block min-w-0">
          <span className="sr-only"><UiText text={"Search"} /></span>
          <UiInput
            className="portal-input h-10 w-full px-3 text-sm text-heading"
            defaultValue={q}
            id="anime-query"
            name="q"
            placeholder="Search..."
            type="search"
          />
        </label>
        <div className="min-w-0" id="genres">
          <PortalSelect
            hideLabel
            label="Genre"
            name="genre"
            options={[
              { label: "Genre", value: "" },
              ...genres.map((genre) => ({ label: genre, value: genre })),
            ]}
            value={genre}
          />
        </div>
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
          value={year}
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
        <div className="col-span-2 min-w-0">
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
            value={sort}
          />
        </div>
        <button
          className="col-span-2 inline-flex h-11 items-center justify-center gap-2 bg-violet-600 px-4 text-sm font-semibold text-white transition hover:bg-violet-500"
          type="submit"
        >
          <Filter aria-hidden="true" className="h-4 w-4 shrink-0" />
          <UiText text={"Filter"} />
        </button>
      </div>
      {hasFilters ? (
        <a className="inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-heading" href="/anime">
          <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
          <UiText text="Clear filters" />
        </a>
      ) : null}
    </form>
  );
}
