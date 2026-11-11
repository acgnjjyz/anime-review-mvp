import React from "react";
import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { load } from "cheerio";
import { AnimeFilter } from "../src/components/AnimeFilter";

test("sidebar filter retains the full GET form and search anchors", () => {
  const page = load(renderToStaticMarkup(<AnimeFilter genres={["Action", "Drama"]} years={[2026, 2024]} />));
  assert.equal(page("form").attr("action"), "/anime");
  assert.equal(page("form").attr("method"), "get");
  assert.equal(page("form").attr("id"), "anime-search");
  assert.equal(page("#genres button").attr("aria-label"), "ジャンル");
  assert.equal(page("h2").text(), "アニメを詳しく絞り込む");
  assert.deepEqual(page("input[name]").map((_, e) => page(e).attr("name")).get(), [
    "q", "genre", "country", "season", "year", "type", "status", "language", "rating", "sort",
  ]);
  assert.equal(page("input[name=sort]").attr("value"), "newest");
  assert.equal(page("a").length, 0);
});

test("catalog filters preserve active query, genre, year, sort and tag", () => {
  const page = load(renderToStaticMarkup(<AnimeFilter
    genres={["Action", "Drama"]}
    headingLevel="h1"
    values={{ q: "作品名", genre: "Drama", year: "2024", sort: "score", tag: "Healing" }}
    years={[2026, 2024]}
  />));
  for (const [name, value] of Object.entries({ q: "作品名", genre: "Drama", year: "2024", sort: "score", tag: "Healing" })) {
    assert.equal(page(`input[name=${name}]`).attr("value"), value);
  }
  assert.equal(page("h1").text(), "アニメを詳しく絞り込む");
  assert.equal(page("a").attr("href"), "/anime");
  assert.match(page("a").text(), /絞り込みを解除/);
  assert.match(page("#genres button").text(), /ドラマ/);
});

test("wide home filter keeps the same fields in a responsive horizontal layout", () => {
  const page = load(renderToStaticMarkup(<AnimeFilter genres={["Action"]} layout="wide" years={[2026]} />));
  assert.equal(page(".xl\\:grid-cols-6").length, 1);
  assert.equal(page("input[name]").length, 10);
  assert.equal(page("input[name=sort]").attr("value"), "newest");
  assert.equal(page("form").attr("action"), "/anime");
});
