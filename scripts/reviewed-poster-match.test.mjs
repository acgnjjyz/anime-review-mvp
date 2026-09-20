import test from "node:test";
import assert from "node:assert/strict";
import { validateReviewedPoster } from "./reviewed-poster-match.mjs";
const review = { tvmazeId: 1, tvmazeName: "Example: Title", alias: "Example Title", year: 2000, type: "TV" };
const show = { id: 1, name: review.tvmazeName, premiered: "2000-01-01", type: "Animation", language: "Japanese", image: { original: "https://static.tvmaze.com/uploads/images/1/1.jpg" }, url: "https://www.tvmaze.com/shows/1/example" };
test("accepts reviewed punctuation variants only with matching identity and year", () => {
  assert.equal(validateReviewedPoster(review, show), true);
  for (const change of [{ id: 2 }, { name: "Example Title 2" }, { premiered: "2001-01-01" }, { language: "English" }, { image: null }, { url: "https://example.com/" }]) assert.equal(validateReviewedPoster(review, { ...show, ...change }), false);
});
test("does not discard sequel numbers or permit movies", () => {
  assert.equal(validateReviewedPoster({ ...review, alias: "Example Title 2" }, show), false);
  assert.equal(validateReviewedPoster({ ...review, type: "MOVIE" }, show), false);
});
