import { ExternalLink } from "lucide-react";
import officialLinks from "../../public/data/official-anime-links.json";

export function OfficialSourceLink({ slug, coverImage }: { slug: string; coverImage: string }) {
  if (coverImage !== "/images/catalog-placeholder.svg") return null;
  const source = officialLinks.matches.find(entry => entry.slug === slug);
  if (!source) return null;

  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex max-w-full items-center gap-1.5 rounded px-1 py-2 text-xs font-bold text-cyan-300 transition hover:text-violet-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"
      aria-label={`${source.title}：${source.label}（新しいタブ）`}
      title={`${source.publisher}（新しいタブ）`}
    >
      <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{source.label}</span>
    </a>
  );
}
