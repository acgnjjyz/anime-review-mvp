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
