import { readFile, writeFile, mkdir } from "node:fs/promises";
import { gunzipSync } from "node:zlib";

const sourceUrl = "https://anidb.net/api/anime-titles.dat.gz";
const cache = new URL("../work/anidb-titles.dat", import.meta.url);
const input = new URL("../prisma/title-only-japan-anime.json", import.meta.url);
await mkdir(new URL("../work/", import.meta.url), { recursive: true });
let dump;
try {
  dump = await readFile(cache, "utf8");
} catch (error) {
  if (error.code !== "ENOENT") throw error;
  const response = await fetch(sourceUrl, { signal: AbortSignal.timeout(120000) });
  if (!response.ok) throw new Error(`Title download failed: HTTP ${response.status}`);
  dump = gunzipSync(Buffer.from(await response.arrayBuffer())).toString("utf8");
  if (!dump.includes("<aid>|<type>|<language>|<title>")) throw new Error("Unexpected title dump format");
  await writeFile(cache, dump);
}

// Preserve punctuation and numbers so seasons and similarly named works stay distinct.
const normalize = (value) => value.normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim();
const titles = new Map();
const aliases = new Map();
for (const line of dump.split(/\r?\n/)) {
  if (!line || line.startsWith("#")) continue;
  const [id, type, language, ...parts] = line.split("|");
  const title = parts.join("|");
  if (!/^\d+$/.test(id) || !title) continue;
  if (type === "4" && language === "ja") {
    const values = titles.get(id) ?? new Set();
    values.add(title);
    titles.set(id, values);
  }
  if (!["en", "x-jat", "ja"].includes(language) || type === "3") continue;
  const key = normalize(title);
  const ids = aliases.get(key) ?? new Set();
  ids.add(id);
  aliases.set(key, ids);
}

const catalog = JSON.parse(await readFile(input, "utf8"));
const usedSlugs = new Set();
const matches = [];
const pending = [];
for (const [index, entry] of catalog.entries.entries()) {
  const base = entry.title.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 72) || `title-${index + 1}`;
  const baseSlug = `aniwaves-japan-title-${base}`;
  let slug = baseSlug;
  let suffix = 2;
  while (usedSlugs.has(slug)) slug = `${baseSlug}-${suffix++}`;
  usedSlugs.add(slug);
  const evidence = [entry.title, entry.titleEn].filter(Boolean).map((title) => aliases.get(normalize(title))).filter(Boolean);
  // Both known names must agree; missing aliases alone do not imply a conflict.
  const candidates = evidence.length ? [...evidence[0]].filter((id) => evidence.every((ids) => ids.has(id))) : [];
  const japanese = candidates.length === 1 ? [...(titles.get(candidates[0]) ?? [])] : [];
  if (japanese.length !== 1) {
    pending.push({ slug, ...entry, reason: candidates.length > 1 ? "ambiguous" : candidates.length === 1 ? "no-japanese-title" : evidence.length ? "conflicting-aliases" : "unmatched", candidates });
    continue;
  }
  matches.push({ slug, originalTitle: entry.title, titleEn: entry.titleEn, title: japanese[0], anidbId: candidates[0], sourceUrl: `https://anidb.net/anime/${candidates[0]}` });
}
const result = { sourceUrl, sourceDate: dump.split(/\r?\n/)[0], method: "Unique exact normalized alias intersection; AniDB official ja title", total: catalog.entries.length, matched: matches.length, pending: pending.length, matches };
await writeFile(new URL("../prisma/japanese-title-matches.json", import.meta.url), JSON.stringify(result, null, 2) + "\n");
await writeFile(new URL("../work/japanese-title-pending.json", import.meta.url), JSON.stringify(pending, null, 2) + "\n");
console.log(JSON.stringify({ total: result.total, matched: result.matched, pending: result.pending, sample: matches.slice(0, 6) }, null, 2));
