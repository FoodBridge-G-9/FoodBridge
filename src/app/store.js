import { configureStore } from "@reduxjs/toolkit";
import donationsReducer from "../features/donations/donationsSlice";
import { STORAGE_KEYS } from "../utils/storage";
import { initialDonations } from "../data/donations";
import { parseDeadline } from "../utils/donationUtils";

function loadDonations() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.donations);
    if (!saved) return initialDonations;

    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return initialDonations;

    // Migrate older demo records whose deadline was stored as text such as
    // "Today, 10:30 PM" and therefore could not be parsed as a real date.
    return parsed.map((donation, index) => {
      let record = donation;
      if (parseDeadline(record.pickupDeadline) === null) {
        record = {
          ...record,
          pickupDeadline: new Date(
            Date.now() + (index + 2) * 60 * 60 * 1000,
          ).toISOString(),
        };
      }
      const initialMatch = initialDonations.find(
        (item) => String(item.id) === String(record.id),
      );
      if (!record.coordinates && initialMatch?.coordinates) {
        record = {
          ...record,
          coordinates: initialMatch.coordinates,
        };
      }
      return record;
    });
  } catch {
    return initialDonations;
  }
}

export const store = configureStore({
  reducer: { donations: donationsReducer },
  preloadedState: { donations: { items: loadDonations() } },
});

store.subscribe(() => {
  try {
    localStorage.setItem(
      STORAGE_KEYS.donations,
      JSON.stringify(store.getState().donations.items),
    );
  } catch (error) {
    console.warn(
      "FoodBridge could not persist donations in this browser.",
      error,
    );
  }
});
