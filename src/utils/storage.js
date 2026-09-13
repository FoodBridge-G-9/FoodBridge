export const STORAGE_KEYS = {
  session: "foodbridge-session-v2",
  donations: "foodbridge-donations-v2",
  requests: "foodbridge-requests-v2",
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
}
