import test from "node:test";
import assert from "node:assert/strict";
import { getCatalogSearchLinks, getCatalogSourceLink } from "../src/lib/catalog-source-links";
import data from "../public/data/catalog-reference-links.json";

test("keeps official, reference and search links distinct", () => {
  assert.equal(getCatalogSourceLink("aniwaves-japan-title-hotaru-no-haka", "test").kind, "official");
  assert.equal(getCatalogSourceLink(data.matches[0].slug, "test").kind, "reference");
  const missing = getCatalogSourceLink("unknown-entry", "Unknown");
  assert.equal(missing.kind, "search");
  assert.equal(missing.label, "掲載元を検索");
});
test("search links preserve titles safely in query parameters", () => {
  const title = '作品 & # / ? "日本語"';
  for (const link of getCatalogSearchLinks(title)) {
    const url = new URL(link.url);
    assert.equal(url.protocol, "https:");
    assert.equal(url.hash, "");
    assert.deepEqual([...url.searchParams.values()], [`${title} アニメ 公式`]);
  }
});
test("covers every missing-image entry without inventing official URLs", () => {
  assert.equal(data.coverage.total, 8879);
  assert.equal(data.coverage.official + data.coverage.reference + data.coverage.searchOnly, data.coverage.missingImages);
  assert.equal(new Set(data.matches.map(entry => entry.slug)).size, data.matches.length);
  for (const entry of data.matches) {
    const url = new URL(entry.url);
    assert.equal(url.protocol, "https:");
    assert.ok(["myanimelist.net", "anidb.net", "anime-planet.com"].includes(url.hostname));
    assert.ok(entry.label.endsWith("の作品情報"));
  }
});
