import React from "react";
import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { load } from "cheerio";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";
import { japaneseUi, translateUi } from "../src/lib/i18n";
import { LocaleProvider } from "../src/components/LocaleProvider";
import { UiInput, UiText, UiTextarea } from "../src/components/UiText";

test("Japanese UI covers home, menu and admin labels", () => {
  for (const en of ["Highest Scores", "Schedule Style Picks", "No anime yet", "All genres", "Title", "Synopsis", "Published", "Create anime", "Official PV", "Advanced Anime Filter"]) {
    assert.notEqual(translateUi(en, "ja"), en);
    assert.equal(translateUi(en, "en"), en);
  }
  assert.ok(Object.keys(japaneseUi).length > 250);
});

test("dynamic UI labels and genre lists preserve identifiers", () => {
  assert.equal(translateUi("8910 results / 1-12", "ja"), "8910件 / 1-12");
  assert.equal(translateUi("Action / Romance", "ja"), "アクション / 恋愛");
  for (const value of [".hack//G.U. Returner", "https://example.com/image.png", "__proto__", "constructor"]) {
    assert.equal(translateUi(value, "ja"), value);
  }
});

test("server rendering uses the selected locale before hydration", () => {
  assert.equal(renderToStaticMarkup(<LocaleProvider initialLocale="ja"><UiText text="Home" /></LocaleProvider>), "ホーム");
  assert.equal(renderToStaticMarkup(<LocaleProvider initialLocale="en"><UiText text="Home" /></LocaleProvider>), "Home");
});

test("localized admin fields preserve submitted values until edited", () => {
  const synopsis = "Title-only catalog entry. Add an original review-site synopsis before using detailed metadata.";
  const $ = load(renderToStaticMarkup(<LocaleProvider initialLocale="ja">
    <UiInput localizeInitialValue name="genres" defaultValue="Romance, Youth" placeholder="Action, Romance, Mystery" />
    <UiTextarea localizeInitialValue name="synopsis" defaultValue={synopsis} />
  </LocaleProvider>));
  assert.equal($("input:not([type=hidden])").attr("value"), "恋愛, 青春");
  assert.equal($("input[name=genres]").attr("value"), "Romance, Youth");
  assert.equal($("input:not([type=hidden])").attr("placeholder"), "アクション, 恋愛, ミステリー");
  assert.match($("textarea").text(), /タイトルのみ登録/);
  assert.equal($("input[name=synopsis]").attr("value"), synopsis);
});

test("UI prose does not bypass the localization layer", () => {
  const allowed = new Set(["EN", "JP", "S", "esc", "TV", "OVA", "ONA", "TVmaze", "CC BY-SA 4.0", "AniDB", "anime-offline-database", "ODbL 1.0 / DbCL 1.0"]);
  const missing: string[] = [];
  function scan(directory: string) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const file = join(directory, entry.name);
      if (entry.isDirectory()) { scan(file); continue; }
      if (!file.endsWith(".tsx")) continue;
      const source = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
      function visit(node: ts.Node) {
        if (ts.isJsxText(node)) {
          const text = node.text.replace(/\s+/g, " ").trim();
          if (/^[A-Za-z][A-Za-z0-9 ,.;:/!?\x27\x22()\-\s]*$/.test(text) && !allowed.has(text)) missing.push(`${file}: ${text}`);
        }
        ts.forEachChild(node, visit);
      }
      visit(source);
    }
  }
  scan("src");
  assert.deepEqual(missing, []);
});
