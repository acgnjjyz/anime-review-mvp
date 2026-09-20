import test from "node:test";
import assert from "node:assert/strict";
import { matchPosters } from "./poster-matching.mjs";

const title = { slug: "one", anidbId: "1", title: "Example", originalTitle: "Example" };
const record = { title: "Example", synonyms: [], sources: ["https://anidb.net/anime/1"], type: "TV", animeSeason: { year: 2000 } };
const show = { id: 1, name: "Example", type: "Animation", language: "Japanese", premiered: "2000-01-01", url: "https://www.tvmaze.com/shows/1/example", image: { original: "https://static.tvmaze.com/uploads/images/original_untouched/1/1.jpg" } };

test("uses the matching premiere year instead of a same-name remake", () => {
  const result = matchPosters([title], [record], [show, { ...show, id: 2, premiered: "2020-01-01" }]);
  assert.equal(result.matches[0].tvmazeId, 1);
});
test("holds ambiguous names and separate entries that map to the same show", () => {
  assert.equal(matchPosters([title], [record], [show, { ...show, id: 2 }]).matches.length, 0);
  assert.equal(matchPosters([title, { ...title, slug: "two" }], [record], [show]).matches.length, 0);
});
test("rejects movies, absent years, missing posters and partial-name matches", () => {
  for (const replacement of [{ ...record, type: "MOVIE" }, { ...record, animeSeason: {} }]) {
    assert.equal(matchPosters([title], [replacement], [show]).matches.length, 0);
  }
  for (const replacement of [{ ...show, image: null }, { ...show, name: "Example Season 2" }, { ...show, language: "English" }]) {
    assert.equal(matchPosters([title], [record], [replacement]).matches.length, 0);
  }
});
test("rejects duplicate source IDs and untrusted image hosts", () => {
  assert.equal(matchPosters([title], [record, record], [show]).matches.length, 0);
  assert.equal(matchPosters([title], [record], [{ ...show, image: { original: "https://example.com/poster.jpg" } }]).matches.length, 0);
});
