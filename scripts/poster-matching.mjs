const normalize = (value) => value.normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim();

export function matchPosters(titles, metadata, shows) {
  const byId = new Map();
  for (const anime of metadata) for (const source of anime.sources) {
    const match = source.match(/^https?:\/\/anidb.net\/(?:anime\/)?(\d+)$/);
    if (match) byId.set(match[1], [...(byId.get(match[1]) ?? []), anime]);
  }
  const names = new Map();
  for (const show of shows) {
    if (show.type !== "Animation" || show.language !== "Japanese") continue;
    const key = normalize(show.name);
    names.set(key, [...(names.get(key) ?? []), show]);
  }
  const matches = [];
  const pending = [];
  for (const title of titles) {
    const records = byId.get(title.anidbId) ?? [];
    if (records.length !== 1) { pending.push({ slug: title.slug, reason: "missing-or-ambiguous-metadata" }); continue; }
    const record = records[0];
    const aliases = [title.title, title.titleEn, title.originalTitle, record.title, ...record.synonyms].filter(Boolean);
    const candidates = new Map();
    for (const alias of aliases) for (const show of names.get(normalize(alias)) ?? []) {
      if (record.animeSeason?.year && Number(show.premiered?.slice(0, 4)) === record.animeSeason.year) candidates.set(show.id, show);
    }
    if (candidates.size !== 1 || !["TV", "ONA", "OVA"].includes(record.type)) {
      pending.push({ slug: title.slug, reason: "no-unique-name-year-format-match" }); continue;
    }
    const show = [...candidates.values()][0];
    const image = show.image?.original;
    if (!image || !/^https:\/\/static\.tvmaze\.com\/uploads\/images\//.test(image)) {
      pending.push({ slug: title.slug, reason: "no-poster" }); continue;
    }
    matches.push({ slug: title.slug, title: title.title, anidbId: title.anidbId, tvmazeId: show.id, sourceUrl: show.url, coverImage: image, year: record.animeSeason.year, matchedName: show.name });
  }
  const counts = new Map();
  for (const match of matches) counts.set(match.tvmazeId, (counts.get(match.tvmazeId) ?? 0) + 1);
  for (const match of matches) if (counts.get(match.tvmazeId) > 1) pending.push({ slug: match.slug, reason: "multiple-catalog-entries-for-show" });
  return { matches: matches.filter(match => counts.get(match.tvmazeId) === 1), pending };
}
