import { readFile, readdir, writeFile } from "node:fs/promises";
import { resolveCatalogIdentities } from "./catalog-identities.mjs";
const json = async path => JSON.parse(await readFile(path, "utf8"));
const catalog = await json("prisma/title-only-japan-anime.json");
const localized = await json("prisma/japanese-title-matches.json");
const metadata = await json("work/poster-cache/offline.json");
const existing = await json("public/data/anime-posters.json");
const stills = await json("public/data/official-anime-images.json");
const slugs = new Set([...existing.matches, ...stills.matches].map(x => x.slug));
const usedIds = new Set(existing.matches.map(x => x.tvmazeId));
const bySource = new Map();
for (const record of metadata.data) for (const source of record.sources) bySource.set(source, [...(bySource.get(source) ?? []), record]);
const normalize = value => value.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
const shows = [];
for (const file of (await readdir("work/poster-cache")).filter(x => /^tvmaze-\d+\.json$/.test(x))) shows.push(...await json(`work/poster-cache/${file}`));
const candidates = [];
for (const identity of resolveCatalogIdentities(catalog.entries, localized.matches, metadata.data).resolved) {
  if (slugs.has(identity.slug)) continue;
  const records = bySource.get(identity.metadataSource ?? `https://anidb.net/anime/${identity.anidbId}`) ?? [];
  if (records.length !== 1 || !["TV", "ONA", "OVA"].includes(records[0].type)) continue;
  const record = records[0];
  const aliases = [record.title, ...record.synonyms];
  const matches = shows.filter(show => !usedIds.has(show.id) && show.type === "Animation" && show.language === "Japanese" && show.image?.original && Number(show.premiered?.slice(0,4)) === record.animeSeason.year && aliases.some(alias => normalize(alias) === normalize(show.name)));
  if (matches.length === 1) candidates.push({ slug: identity.slug, title: identity.title, original: record.title, type: record.type, year: record.animeSeason.year, tvmazeId: matches[0].id, tvmazeName: matches[0].name, alias: aliases.find(alias => normalize(alias) === normalize(matches[0].name)) });
}
await writeFile("work/poster-alias-candidates.json", JSON.stringify(candidates,null,2));
console.log(JSON.stringify(candidates,null,2));
