import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const json = async path => JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
const links = (await json("../public/data/official-anime-links.json")).matches;
const catalog = await json("../prisma/title-only-japan-anime.json");
const localized = await json("../prisma/japanese-title-matches.json");
const { resolveCatalogIdentities } = await import("./catalog-identities.mjs");
test("official links use unique existing catalog slugs and safe external URLs", () => {
  const identities = resolveCatalogIdentities(catalog.entries, localized.matches, []);
  const slugs = new Set([...identities.resolved, ...identities.unresolved].map(entry => entry.slug));
  assert.equal(new Set(links.map(entry => entry.slug)).size, links.length);
  for (const link of links) {
    assert.ok(slugs.has(link.slug));
    const url = new URL(link.url);
    assert.equal(url.protocol, "https:");
    assert.equal(url.username, "");
    assert.equal(url.password, "");
    assert.ok(link.publisher && link.label && link.checkedAt);
    const identity = localized.matches.find(entry => entry.slug === link.slug);
    if (identity) assert.equal(link.anidbId, identity.anidbId);
  }
});
test("source links are separate from card detail anchors and protected in new tabs", async () => {
  const card = await readFile(new URL("../src/components/AnimeCard.tsx", import.meta.url), "utf8");
  const component = await readFile(new URL("../src/components/OfficialSourceLink.tsx", import.meta.url), "utf8");
  assert.ok(card.indexOf("</Link>") < card.indexOf("<OfficialSourceLink"));
  assert.match(component, /noopener noreferrer/);
  assert.match(component, /coverImage !== "\/images\/catalog-placeholder.svg"/);
});
