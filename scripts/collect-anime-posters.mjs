import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { setTimeout as delay } from "node:timers/promises";
import { decompress } from "fzstd";
import { matchPosters } from "./poster-matching.mjs";

const root = new URL("../", import.meta.url);
const cache = new URL("work/poster-cache/", root);
await mkdir(cache, { recursive: true });
async function cachedJson(name, url) {
  const file = new URL(name, cache);
  try { return JSON.parse(await readFile(file, "utf8")); }
  catch (error) { if (error.code !== "ENOENT") throw error; }
  for (let attempt = 0; attempt < 3; attempt++) {
    let response;
    try {
      response = await fetch(url, { headers: { "User-Agent": "Anisearch-Catalog/1.0 (anime-review-mvp.vercel.app)" }, signal: AbortSignal.timeout(name === "offline.json" ? 300000 : 90000) });
    } catch (error) {
      if (attempt === 2) throw error;
      await delay(3000 * (attempt + 1));
      continue;
    }
    if (response.status === 404) return null;
    if (response.status === 429 || response.status >= 500) {
      await delay(10000 * (attempt + 1));
      continue;
    }
    if (!response.ok) throw new Error(`Metadata request failed: HTTP ${response.status}`);
    let data;
    try {
      data = url.endsWith(".zst")
        ? JSON.parse(new TextDecoder().decode(decompress(new Uint8Array(await response.arrayBuffer()))))
        : await response.json();
    } catch (error) {
      if (attempt === 2) throw error;
      await delay(3000 * (attempt + 1));
      continue;
    }
    await writeFile(file, JSON.stringify(data));
    return data;
  }
  throw new Error("Metadata provider unavailable; rerun to resume from cache");
}

const offline = await cachedJson("offline.json", "https://github.com/manami-project/anime-offline-database/releases/download/2026-27/anime-offline-database-minified.json.zst");
console.log(JSON.stringify({ offlineRecords: offline.data.length, license: offline.license }));
const shows = [];
let finished = false;
for (let page = 0; page < 1000 && !finished; page += 6) {
  const jobs = [];
  for (let i = 0; i < 6; i++) {
    jobs.push(cachedJson(`tvmaze-${page + i}.json`, `https://api.tvmaze.com/shows?page=${page + i}`).then(value => ({ value }), error => ({ error })));
    if (!existsSync(new URL(`tvmaze-${page + i}.json`, cache))) await delay(650);
  }
  const results = await Promise.allSettled(jobs);
  for (const result of results) {
    if (result.status === "rejected") throw result.reason;
    if (result.value.error) throw result.value.error;
    if (result.value.value === null) { finished = true; continue; }
    shows.push(...result.value.value.filter((show) => show.type === "Animation" && show.language === "Japanese"));
  }
  if (page % 24 === 0 || finished) console.log(JSON.stringify({ scannedPages: page + 6, japaneseShows: shows.length }));
}
if (!finished) throw new Error("Provider pagination did not finish");

const titleData = JSON.parse(await readFile(new URL("prisma/japanese-title-matches.json", root), "utf8"));
const { matches, pending } = matchPosters(titleData.matches, offline.data, shows);
const result = { provider: "TVmaze", source: "https://www.tvmaze.com/api", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/", matchingSource: offline.repository, matchingSourceLicense: offline.license, matchedAt: new Date().toISOString(), totalCatalog: titleData.total, matched: matches.length, pending: titleData.total - matches.length, matches };
await mkdir(new URL("public/data/", root), { recursive: true });
await writeFile(new URL("public/data/anime-posters.json", root), JSON.stringify(result, null, 2) + "\n");
await writeFile(new URL("work/anime-poster-pending.json", root), JSON.stringify(pending, null, 2));
console.log(JSON.stringify({ matched: result.matched, pending: result.pending, sample: matches.slice(0, 3) }, null, 2));
