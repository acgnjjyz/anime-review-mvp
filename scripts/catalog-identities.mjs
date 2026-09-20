const normalize = (value) => value.normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim();

export function resolveCatalogIdentities(catalog, japaneseMatches, metadata) {
  const localized = new Map(japaneseMatches.map((entry) => [entry.slug, entry]));
  const aliases = new Map();
  for (const [index, record] of metadata.entries()) {
    for (const value of [record.title, ...record.synonyms]) {
      const key = normalize(value);
      const indexes = aliases.get(key) ?? new Set();
      indexes.add(index);
      aliases.set(key, indexes);
    }
  }
  const usedSlugs = new Set();
  const resolved = [];
  const unresolved = [];
  for (const [index, entry] of catalog.entries()) {
    const base = entry.title.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 72) || `title-${index + 1}`;
    const baseSlug = `aniwaves-japan-title-${base}`;
    let slug = baseSlug;
    let suffix = 2;
    while (usedSlugs.has(slug)) slug = `${baseSlug}-${suffix++}`;
    usedSlugs.add(slug);
    if (localized.has(slug)) { resolved.push(localized.get(slug)); continue; }
    const evidence = [entry.title, entry.titleEn].filter(Boolean).map(value => aliases.get(normalize(value))).filter(Boolean);
    const candidates = evidence.length ? [...evidence[0]].filter(id => evidence.every(ids => ids.has(id))) : [];
    if (candidates.length !== 1) {
      unresolved.push({ slug, reason: candidates.length > 1 ? "ambiguous-catalog-identity" : "unmatched-catalog-identity" });
      continue;
    }
    const record = metadata[candidates[0]];
    if (!record.sources.length) { unresolved.push({ slug, reason: "missing-metadata-id" }); continue; }
    const anidb = record.sources.find(source => /^https?:\/\/anidb.net\/anime\/\d+$/.test(source));
    resolved.push({ slug, title: entry.title, titleEn: entry.titleEn, originalTitle: entry.title, metadataSource: record.sources[0], ...(anidb ? { anidbId: anidb.split("/").pop() } : {}) });
  }
  return { resolved, unresolved };
}
