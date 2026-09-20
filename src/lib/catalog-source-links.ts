import officialData from "../../public/data/official-anime-links.json";
import referenceData from "../../public/data/catalog-reference-links.json";

const official = new Map(officialData.matches.map(entry => [entry.slug, entry]));
const references = new Map(referenceData.matches.map(entry => [entry.slug, entry]));

export function getCatalogSourceLink(slug: string, title: string) {
  const verified = official.get(slug);
  if (verified) return { ...verified, kind: "official" as const };
  const reference = references.get(slug);
  if (reference) return { ...reference, kind: "reference" as const };
  return {
    url: getCatalogSearchLinks(title)[0].url,
    publisher: "Google",
    label: "掲載元を検索",
    kind: "search" as const,
  };
}

export function getCatalogSearchLinks(title: string) {
  const query = `${title} アニメ 公式`;
  return [
    { publisher: "Google", url: `https://www.google.com/search?${new URLSearchParams({ q: query })}` },
    { publisher: "Yahoo!", url: `https://search.yahoo.co.jp/search?${new URLSearchParams({ p: query })}` },
    { publisher: "Yandex", url: `https://yandex.com/search/?${new URLSearchParams({ text: query })}` },
  ];
}
