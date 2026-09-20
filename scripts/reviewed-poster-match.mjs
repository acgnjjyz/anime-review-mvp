export function validateReviewedPoster(review, show) {
  const comparable = value => value.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
  if (show.id !== review.tvmazeId || show.name !== review.tvmazeName || show.type !== "Animation" || show.language !== "Japanese") return false;
  if (Number(show.premiered?.slice(0, 4)) !== review.year || !["TV", "ONA", "OVA"].includes(review.type)) return false;
  if (comparable(review.alias) !== comparable(show.name)) return false;
  return /^https:\/\/static\.tvmaze\.com\/uploads\/images\//.test(show.image?.original ?? "") &&
    new RegExp(`^https://www\\.tvmaze\\.com/shows/${show.id}/`).test(show.url ?? "");
}
