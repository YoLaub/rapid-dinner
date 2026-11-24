// Google rating label. The figures live in site.json (read by hand, see checkedAt).
const scoreFormatter = new Intl.NumberFormat('fr-FR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

/** @param {{score: number, count: number}} rating */
export function formatRatingLabel({ score, count }) {
  return `${scoreFormatter.format(score)} sur 5 · ${count} avis Google`;
}
