import test from "node:test";
import assert from "node:assert/strict";
import { parseGhibliWork, matchGhibliWork } from "./ghibli-source.mjs";
const html = '<h1>Example（2000）</h1><p>© Studio</p><p>画像は常識の範囲でご自由にお使いください</p><a href="/gallery/example001.jpg">still</a>';
test("requires official domain, permission notice and gallery still", () => {
  assert.equal(parseGhibliWork(html, "https://www.ghibli.jp/works/example/").year, 2000);
  assert.equal(parseGhibliWork(html, "https://example.com/works/example/"), null);
  assert.equal(parseGhibliWork(html.replace("画像は常識の範囲でご自由にお使いください", ""), "https://www.ghibli.jp/works/example/"), null);
  assert.equal(parseGhibliWork(html.replace("/gallery/", "/poster/"), "https://www.ghibli.jp/works/example/"), null);
});
test("requires unique identity and verified year", () => {
  const work = { officialTitle: "Example", year: 2000 };
  const identity = { title: "Example", anidbId: "1" };
  const record = { title: "Example", synonyms: [], sources: ["https://anidb.net/anime/1"], animeSeason: { year: 2000 } };
  assert.deepEqual(matchGhibliWork(work, [identity], [record]), identity);
  assert.equal(matchGhibliWork({ ...work, year: 2026 }, [identity], [record]), null);
  assert.equal(matchGhibliWork(work, [identity, identity], [record]), null);
});
