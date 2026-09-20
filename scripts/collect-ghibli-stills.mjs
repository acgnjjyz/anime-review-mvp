import { mkdir, readFile, writeFile } from "node:fs/promises";
import { setTimeout as delay } from "node:timers/promises";
import { load } from "cheerio";
import { resolveCatalogIdentities } from "./catalog-identities.mjs";
import { matchGhibliWork, parseGhibliWork } from "./ghibli-source.mjs";

const root = new URL("../", import.meta.url);
const json = async path => JSON.parse(await readFile(new URL(path, root), "utf8"));
const catalog = await json("prisma/title-only-japan-anime.json");
const localized = await json("prisma/japanese-title-matches.json");
const metadata = await json("work/poster-cache/offline.json");
const tvmaze = await json("public/data/anime-posters.json");
const occupied = new Set(tvmaze.matches.map(entry => entry.slug));
const identities = resolveCatalogIdentities(catalog.entries, localized.matches, metadata.data).resolved;
await mkdir(new URL("work/ghibli-cache/", root), { recursive: true });
async function page(url, name) {
  const file = new URL(`work/ghibli-cache/${name}.html`, root);
  try { return await readFile(file, "utf8"); }
  catch (error) { if (error.code !== "ENOENT") throw error; }
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`Official source returned HTTP ${response.status}`);
  const html = await response.text();
  await writeFile(file, html);
  await delay(600);
  return html;
}
const index = load(await page("https://www.ghibli.jp/works/", "index"));
const links = [...new Set(index("a[href]").map((i, element) => new URL(index(element).attr("href"), "https://www.ghibli.jp/works/").href).get())]
  .filter(url => /^https:\/\/www\.ghibli\.jp\/works\/[a-z0-9]+\/$/.test(url));
const matches = [];
const pending = [];
for (const sourceUrl of links) {
  const work = parseGhibliWork(await page(sourceUrl, new URL(sourceUrl).pathname.split("/")[2]), sourceUrl);
  if (!work) { pending.push({ sourceUrl, reason: "no-permitted-still" }); continue; }
  const identity = matchGhibliWork(work, identities, metadata.data);
  if (!identity) { pending.push({ sourceUrl, reason: "no-unique-title-year-match" }); continue; }
  if (occupied.has(identity.slug)) continue;
  const response = await fetch(work.coverImage, { method: "HEAD", signal: AbortSignal.timeout(30000) });
  if (!response.ok || !response.headers.get("content-type")?.startsWith("image/")) throw new Error("Official still is unavailable");
  matches.push({ slug: identity.slug, title: identity.title, anidbId: identity.anidbId, provider: "Studio Ghibli", imageType: "official-still", ...work });
  console.log(JSON.stringify({ title: identity.title, matched: matches.length }));
}
if (new Set(matches.map(entry => entry.slug)).size !== matches.length) throw new Error("Duplicate official matches");
await writeFile(new URL("public/data/official-anime-images.json", root), JSON.stringify({ provider: "Studio Ghibli", termsUrl: "https://www.ghibli.jp/info/013344/", usage: "Official stills offered for use within common sense; copyright remains with the listed owners. Not CC-licensed or public domain.", checkedAt: new Date().toISOString(), matches }, null, 2) + "\n");
await writeFile(new URL("work/ghibli-pending.json", root), JSON.stringify(pending, null, 2));
console.log(JSON.stringify({ added: matches.length, total: tvmaze.matches.length + matches.length, remaining: catalog.entries.length - tvmaze.matches.length - matches.length, pending }));
