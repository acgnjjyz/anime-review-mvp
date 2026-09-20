# Anime posters

Images come from TVmaze's public API. Its documentation explicitly permits
hotlinking to its image CDN: https://www.tvmaze.com/api#images . API data is
CC BY-SA 4.0, with attribution in the footer and on `/credits`.

Matching uses AniDB IDs in the existing Japanese title mapping, cross references
and aliases from anime-offline-database (2026-07-04, ODbL 1.0 / DbCL 1.0), and
TVmaze's current Japanese-language animation records. An exact normalized alias
and matching premiere year are required. Ambiguous records, movies and specials
are not automatically matched. Multiple catalog entries pointing at a single
TVmaze show are also held for review. Do not use the placeholder 2026 seed year
as matching evidence.

`npm run posters:collect` caches metadata under `work/poster-cache/` and creates
`public/data/anime-posters.json`. The correspondence dataset, original sources
and licenses are publicly available at `/data/anime-posters.json`. Only source
URLs are retained, not copies of the poster images. Do not interpret dataset
licenses as ownership of the underlying artwork.

`npm run posters:preview` lists planned counts. `npm run posters:apply` saves
the old values in `work/poster-backup-*.json`, then updates only imported catalog
records still using the original seed photos or the catalog placeholder. Manual
images are preserved. Missing matches use `/images/catalog-placeholder.svg`.
Deploy this asset and the attribution page before updating the database.
The seed uses the same correspondence for new records. Existing records are
updated only by the dedicated apply script; do not reseed production demo data.

TVmaze does not cover every anime, movie or OVA. Unmatched records stay without
a poster pending an additional permitted provider or a manually verified image.

`npm run posters:expand` reuses the downloaded caches to resolve additional
catalog identities by intersecting exact original-title and English-title aliases.
It preserves existing published matches and never reassigns their TVmaze IDs.
The full collector uses the same expanded identity lookup and preservation rules.
Run `node --test scripts/poster-matching.test.mjs scripts/catalog-identities.test.mjs`
before applying a new batch.

Movies need a separate provider. TMDB requires account API credentials and
compliance with its attribution and usage terms (commercial use requires a
separate license): https://developer.themoviedb.org/docs/faq . No TMDB images
are imported by the current scripts. Never paste API tokens into chat or commit
them; provider setup and attribution must be completed before an import.

## Official Studio Ghibli stills

`npm run posters:official` visits the official works index and individual work
pages, requiring the published still-use notice, a gallery image, copyright
credit, and a unique catalog identity with matching title and verified year.
It skips works already covered by TVmaze and does not collect poster artwork,
trailers or video. HTML is cached in ignored `work/ghibli-cache/`; only image
URLs are stored. These stills are not CC-licensed or public domain.

The separate `public/data/official-anime-images.json` records each official
source, copyright and image type. The apply script and seed read both datasets;
existing custom images remain protected. `/credits` and applicable detail pages
display the official attribution. Deploy attribution before applying the batch.
Test the collector with `node --test scripts/ghibli-source.test.mjs`.

## Official source links for missing images

`public/data/official-anime-links.json` is a manually verified correspondence of
catalog slugs to official/producer/licensed distributor work pages. Each record
includes its verification date, publisher, identity and year. Do not generate
official URLs from titles or label search results as official sources. Recheck
the target page before adding entries, especially old domains or redirects.

`OfficialSourceLink` displays these links for placeholder images in cards and
detail pages. Links open in a protected new tab, outside existing detail anchors.
No images are downloaded or embedded from these pages, and linking does not
imply reuse permission. Unverified works retain the placeholder without a link.
No database migration is required. Run `node --test scripts/official-links.test.mjs`.

`npm run links:build` processes the entire original catalog against the cached
offline metadata. Unique identities with a unique recognized MyAnimeList, AniDB
or Anime-Planet URL become **reference** links, never official links. The output
is `public/data/catalog-reference-links.json` with explicit coverage counts and
the source license. Links are identity-checked but not individually uptime-checked.
No AniList API bulk collection is used.

For unresolved identities the UI supplies a title-encoded search link, explicitly
labelled as search. Detail pages also offer Google, Yahoo! and Yandex. Search only
runs when the visitor clicks; it neither embeds nor downloads search images.
Official links take precedence. All these links remain hidden for entries with
registered images. Test with `npx tsx --test scripts/catalog-source-links.test.ts`.

## Reviewed punctuation aliases

`node scripts/find-poster-alias-candidates.mjs` writes discovery candidates to
ignored `work/` only. Punctuation-insensitive results must never be auto-applied:
punctuation can distinguish seasons and metadata may group multiple catalog entries.
Explicitly reviewed pairs are stored in `prisma/reviewed-poster-aliases.json`.
`npm run posters:reviewed` rechecks their source IDs, exact current TVmaze name,
year, format, image availability and duplicate assignments before updating the
public mapping. It does not modify the database. Then run `links:build`, deploy,
and use the existing `posters:preview` / `posters:apply` commands.
