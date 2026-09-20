# Japanese catalog titles

The existing 8,879-entry Japan catalog comes from Aniwaves. Preserve that
catalog as the source inventory; its JP field can contain romanized titles.

Japanese display titles are matched against the official Japanese (`4|ja`)
records in the AniDB title dump: https://anidb.net/api/anime-titles.dat.gz
AniDB attribution: https://anidb.net/

Run `npm run titles:match` to produce `prisma/japanese-title-matches.json`.
The dump is cached in `work/anidb-titles.dat`; reuse it rather than repeatedly
downloading. Matching uses exact aliases after Unicode, case and whitespace
normalization. Punctuation and season numbers remain significant. Known aliases
must identify a single common AniDB record with one Japanese title. Conflicting,
ambiguous and missing matches remain unchanged and are reported in
`work/japanese-title-pending.json`. A unique alias match is evidence, not a
guarantee: verify questionable titles against the official work website.

Run `npm run titles:preview` to inspect the update count, then
`npm run titles:apply` to update only imported records whose current title still
matches the original title. A local backup of the old titles is written to
`work/` first. IDs, slugs, English titles, reviews and other relations remain
unchanged. Manually edited titles are skipped. Re-running is idempotent.

The seed uses the same mapping for newly inserted catalog records. Do not run
the full demo seed to update production titles. These scripts do not import
images, descriptions, streaming URLs or videos. Unmatched records need further
source-ID or year/format verification before being renamed.
