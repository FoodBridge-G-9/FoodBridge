export const STORAGE_KEYS = {
  session: "foodbridge-session",
  donations: "foodbridge-donations",
  requests: "foodbridge-requests-v2",
  reviews: "foodbridge-provider-reviews-v1",
  safetyReports: "foodbridge-safety-reports-v1",
};

export function makeUserId(name) {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "guest"
  );
}

export function resetDemoData() {
  localStorage.removeItem(STORAGE_KEYS.donations);
  localStorage.removeItem(STORAGE_KEYS.requests);
  localStorage.removeItem(STORAGE_KEYS.reviews);
  localStorage.removeItem(STORAGE_KEYS.safetyReports);
}
