export function getProviderRatingSummary(reviews, providerId) {
  const matching = (Array.isArray(reviews) ? reviews : []).filter(
    (review) => String(review.providerId) === String(providerId),
  );
  const count = matching.length;
  const average = count
    ? matching.reduce(
        (total, review) => total + Number(review.rating || 0),
        0,
      ) / count
    : 0;
  return { average, count };
}

export function formatProviderRating(reviews, providerId) {
  const summary = getProviderRatingSummary(reviews, providerId);
  return summary.count
    ? `${summary.average.toFixed(1)} ★ (${summary.count} ${summary.count === 1 ? "review" : "reviews"})`
    : "Not rated yet";
}

// Bayesian-style score used only for ranking: providers with very few reviews
// are pulled toward the overall review average until more evidence exists.
export function getFairProviderScore(reviews, providerId, priorWeight = 3) {
  const allReviews = Array.isArray(reviews) ? reviews : [];
  const overallAverage = allReviews.length
    ? allReviews.reduce(
        (total, review) => total + Number(review.rating || 0),
        0,
      ) / allReviews.length
    : 0;
  const summary = getProviderRatingSummary(allReviews, providerId);
  if (!summary.count) return 0;
  return (
    (summary.average * summary.count + overallAverage * priorWeight) /
    (summary.count + priorWeight)
  );
}
