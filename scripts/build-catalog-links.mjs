import { readFile, writeFile } from "node:fs/promises";
import { resolveCatalogIdentities } from "./catalog-identities.mjs";

const root = new URL("../", import.meta.url);
const json = async path => JSON.parse(await readFile(new URL(path, root), "utf8"));
const catalog = await json("prisma/title-only-japan-anime.json");
const localized = await json("prisma/japanese-title-matches.json");
const metadata = await json("work/poster-cache/offline.json");
const official = await json("public/data/official-anime-links.json");
const posters = await json("public/data/anime-posters.json");
const stills = await json("public/data/official-anime-images.json");
const identities = resolveCatalogIdentities(catalog.entries, localized.matches, metadata.data);
const bySource = new Map();
for (const record of metadata.data) for (const source of record.sources) {
  bySource.set(source, [...(bySource.get(source) ?? []), record]);
}
const officialSlugs = new Set(official.matches.map(entry => entry.slug));
const imageSlugs = new Set([...posters.matches, ...stills.matches].map(entry => entry.slug));
const matches = [];
for (const identity of identities.resolved) {
  if (officialSlugs.has(identity.slug)) continue;
  const source = identity.metadataSource ?? `https://anidb.net/anime/${identity.anidbId}`;
  const records = bySource.get(source) ?? [];
  if (records.length !== 1) continue;
  const sources = records[0].sources;
  const providers = [
    ["MyAnimeList", /^https:\/\/myanimelist\.net\/anime\/[1-9]\d*$/],
    ["AniDB", /^https:\/\/anidb\.net\/anime\/[1-9]\d*$/],
    ["Anime-Planet", /^https:\/\/anime-planet\.com\/anime\/[a-z0-9-]+$/],
  ];
  for (const [publisher, pattern] of providers) {
    const urls = sources.filter(url => pattern.test(url));
    if (urls.length !== 1) continue;
    matches.push({ slug: identity.slug, url: urls[0], publisher, label: `${publisher}の作品情報`, identitySource: source });
    break;
  }
}
const allSlugs = [...identities.resolved, ...identities.unresolved].map(entry => entry.slug);
if (allSlugs.length !== catalog.entries.length || new Set(allSlugs).size !== allSlugs.length) throw new Error("Incomplete catalog coverage");
const referenceSlugs = new Set(matches.map(entry => entry.slug));
const missingImages = allSlugs.filter(slug => !imageSlugs.has(slug));
const coverage = {
  total: allSlugs.length,
  missingImages: missingImages.length,
  official: missingImages.filter(slug => officialSlugs.has(slug)).length,
  reference: missingImages.filter(slug => !officialSlugs.has(slug) && referenceSlugs.has(slug)).length,
  searchOnly: missingImages.filter(slug => !officialSlugs.has(slug) && !referenceSlugs.has(slug)).length,
};
await writeFile(new URL("public/data/catalog-reference-links.json", root), JSON.stringify({
  description: "Identity-matched third-party reference pages, not official sites. Availability is not individually verified.",
  source: metadata.repository, sourceLicense: metadata.license, coverage, matches,
}, null, 2) + "\n");
console.log(JSON.stringify(coverage));
