import test from "node:test";
import assert from "node:assert/strict";
import { resolveCatalogIdentities } from "./catalog-identities.mjs";

const record = { title: "Example", synonyms: ["Alias"], sources: ["https://example.org/anime/1"] };
test("resolves unique aliases without requiring an AniDB identifier", () => {
  const result = resolveCatalogIdentities([{ title: "Alias", titleEn: "Example" }], [], [record]);
  assert.equal(result.resolved[0].metadataSource, record.sources[0]);
  assert.equal(result.resolved[0].slug, "aniwaves-japan-title-alias");
});
test("rejects conflicting or ambiguous identity evidence", () => {
  const other = { ...record, title: "Other", synonyms: [] };
  assert.equal(resolveCatalogIdentities([{ title: "Example", titleEn: "Other" }], [], [record, other]).resolved.length, 0);
  assert.equal(resolveCatalogIdentities([{ title: "Example" }], [], [record, record]).resolved.length, 0);
});
test("preserves localized identities and collision suffixes", () => {
  const localized = { slug: "aniwaves-japan-title-example", title: "Localized", anidbId: "123" };
  const result = resolveCatalogIdentities([{ title: "Example" }, { title: "Example" }], [localized], [record]);
  assert.deepEqual(result.resolved[0], localized);
  assert.equal(result.resolved[1].slug, "aniwaves-japan-title-example-2");
});
