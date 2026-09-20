import { ExternalLink } from "lucide-react";
import { getCatalogSearchLinks, getCatalogSourceLink } from "@/lib/catalog-source-links";

export function OfficialSourceLink({ slug, title, coverImage, showSearch = false }: { slug: string; title: string; coverImage: string; showSearch?: boolean }) {
  if (coverImage !== "/images/catalog-placeholder.svg") return null;
  const source = getCatalogSourceLink(slug, title);

  return (
    <div>
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex max-w-full items-center gap-1.5 rounded px-1 py-2 text-xs font-bold text-cyan-300 transition hover:text-violet-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"
      aria-label={`${title}：${source.label}（新しいタブ）`}
      title={`${source.publisher}（新しいタブ）`}
    >
      <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{source.label}</span>
    </a>
    {showSearch ? (
      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
        <span>掲載元を検索</span>
        {getCatalogSearchLinks(title).map(search => (
          <a key={search.publisher} href={search.url} target="_blank" rel="noopener noreferrer"
            className="py-2 text-cyan-300 hover:underline focus-visible:outline focus-visible:outline-cyan-300"
            aria-label={`${title}を${search.publisher}で検索（新しいタブ）`}>
            {search.publisher}
          </a>
        ))}
      </div>
    ) : null}
    </div>
  );
}
