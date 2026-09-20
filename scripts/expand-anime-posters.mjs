import { readFile, readdir, writeFile } from "node:fs/promises";
import { resolveCatalogIdentities } from "./catalog-identities.mjs";
import { matchPosters } from "./poster-matching.mjs";

const root = new URL("../", import.meta.url);
const json = async (path) => JSON.parse(await readFile(new URL(path, root), "utf8"));
const catalog = await json("prisma/title-only-japan-anime.json");
const localized = await json("prisma/japanese-title-matches.json");
const offline = await json("work/poster-cache/offline.json");
const existing = await json("public/data/anime-posters.json");
const shows = [];
for (const file of (await readdir(new URL("work/poster-cache/", root))).filter(name => /^tvmaze-\d+\.json$/.test(name))) {
  shows.push(...await json(`work/poster-cache/${file}`));
}
const identities = resolveCatalogIdentities(catalog.entries, localized.matches, offline.data);
const result = matchPosters(identities.resolved, offline.data, shows);
const bySlug = new Map(existing.matches.map(match => [match.slug, match]));
const occupiedIds = new Set(existing.matches.map(match => match.tvmazeId));
const additions = [];
for (const match of result.matches) {
  if (bySlug.has(match.slug) || occupiedIds.has(match.tvmazeId)) continue;
  bySlug.set(match.slug, match);
  occupiedIds.add(match.tvmazeId);
  additions.push(match);
}
const matches = [...bySlug.values()];
await writeFile(new URL("public/data/anime-posters.json", root), JSON.stringify({ ...existing, matchedAt: new Date().toISOString(), matched: matches.length, pending: catalog.entries.length - matches.length, matches }, null, 2) + "\n");
await writeFile(new URL("work/anime-poster-expansion.json", root), JSON.stringify({ resolvedIdentities: identities.resolved.length, unresolvedIdentities: identities.unresolved.length, additions, pending: [...identities.unresolved, ...result.pending].filter(entry => !bySlug.has(entry.slug)) }, null, 2));
console.log(JSON.stringify({ resolvedIdentities: identities.resolved.length, added: additions.length, total: matches.length, pending: catalog.entries.length - matches.length, sample: additions.slice(0, 5) }, null, 2));
