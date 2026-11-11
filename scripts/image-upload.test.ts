import assert from "node:assert/strict";
import test from "node:test";
import { MAX_POSTER_BYTES, validatePosterFile } from "../src/lib/image-upload";

test("poster uploads only accept allowed raster formats", () => {
  for (const type of ["image/jpeg", "image/png", "image/webp", "image/gif"]) {
    assert.equal(validatePosterFile({ type, size: MAX_POSTER_BYTES }), null);
  }
  for (const type of ["image/svg+xml", "text/html", "application/pdf", "__proto__", "constructor", ""]) {
    assert.ok(validatePosterFile({ type, size: 100 }));
  }
});

test("empty and oversized files are rejected", () => {
  assert.ok(validatePosterFile({ type: "image/jpeg", size: 0 }));
  assert.ok(validatePosterFile({ type: "image/jpeg", size: MAX_POSTER_BYTES + 1 }));
});
