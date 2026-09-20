import { load } from "cheerio";

export const normalizeTitle = value => value.normalize("NFKC").toLowerCase().replace(/\s+/g, "").trim();

export function parseGhibliWork(html, sourceUrl) {
  const page = new URL(sourceUrl);
  if (page.origin !== "https://www.ghibli.jp" || !/^\/works\/[^/]+\/$/.test(page.pathname)) return null;
  const dom = load(html);
  if (!dom("body").text().includes("画像は常識の範囲でご自由にお使いください")) return null;
  const heading = dom("h1").map((i, element) => dom(element).text().trim()).get()
    .map(value => value.match(/^(.+?)（(\d{4})）/)).find(Boolean);
  if (!heading) return null;
  const image = dom("a[href]").map((i, element) => dom(element).attr("href")).get()
    .map(value => new URL(value, page).href)
    .find(value => /^https:\/\/www\.ghibli\.jp\/gallery\/[a-z0-9]+\d{3}\.jpg$/.test(value));
  const copyright = dom("p").map((i, element) => dom(element).text().trim()).get().find(value => value.startsWith("©"));
  if (!image || !copyright) return null;
  return { officialTitle: heading[1], year: Number(heading[2]), coverImage: image, sourceUrl, copyright };
}

export function matchGhibliWork(work, identities, metadata) {
  const bySource = new Map();
  for (const record of metadata) for (const source of record.sources) {
    bySource.set(source, [...(bySource.get(source) ?? []), record]);
  }
  const candidates = identities.filter(identity => {
    const records = bySource.get(identity.metadataSource ?? `https://anidb.net/anime/${identity.anidbId}`) ?? [];
    if (records.length !== 1 || records[0].animeSeason?.year !== work.year) return false;
    const record = records[0];
    return [identity.title, record.title, ...record.synonyms].some(title => normalizeTitle(title) === normalizeTitle(work.officialTitle));
  });
  return candidates.length === 1 ? candidates[0] : null;
}
