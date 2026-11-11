import React from "react";
import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { load } from "cheerio";
import { AnimeCard } from "../src/components/AnimeCard";

const anime = {
  slug: "layout-test",
  title: "A long anime title that needs two lines without changing the card height",
  titleEn: "Alternate title",
  synopsis: "Detailed synopsis belongs in the existing floating preview.",
  coverImage: "/images/layout-test.webp",
  studio: "Example Studio",
  season: "2026 Season",
  episodes: 12,
  releaseYear: 2026,
  genres: ["Action", "Adventure"],
  reviews: [{ score: 80 }],
  isPublished: true,
};

test("compact cards keep poster, title, score and detail access", () => {
  const page = load(renderToStaticMarkup(<AnimeCard anime={anime} />));
  assert.equal(page("article.portal-anime-card").length, 1);
  assert.equal(page(".portal-anime-card-poster img").attr("src"), anime.coverImage);
  assert.equal(page(".portal-anime-card-title").text(), anime.title);
  assert.equal(page(".portal-anime-card-title").attr("href"), `/anime/${anime.slug}`);
  assert.ok(page(".portal-anime-card-title").hasClass("line-clamp-2"));
  assert.match(page(".portal-anime-card-body").text(), /80\.0/);
  assert.equal(page("button[aria-haspopup=dialog]").length, 1);
  assert.ok(!page(".portal-anime-card-body").text().includes(anime.synopsis));
  assert.ok(!page(".portal-anime-card-body").text().includes(anime.studio));
});

test("compact cards retain source links and status indicators", () => {
  const page = load(renderToStaticMarkup(<AnimeCard anime={{ ...anime, coverImage: "/images/catalog-placeholder.svg", isPublished: false }} isFavorite showPublishedBadge />));
  const source = page(".portal-anime-card-source a");
  assert.equal(source.length, 1);
  assert.equal(source.attr("target"), "_blank");
  assert.ok(source.attr("rel")?.includes("noopener"));
  assert.equal(page(".portal-anime-card-poster a").length, 0);
  assert.match(page("article").text(), /非公開/);
  assert.match(page("article").text(), /お気に入り/);
});
