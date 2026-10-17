
import { configureStore } from "@reduxjs/toolkit";
import donationsReducer from "../features/donations/donationsSlice";
import { STORAGE_KEYS } from "../utils/storage";
import { initialDonations } from "../data/donations";

function loadDonations() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.donations);

    return saved ? JSON.parse(saved) : initialDonations;
  } catch {
    return initialDonations;
  }
}

export const store = configureStore({
  reducer: {
    donations: donationsReducer,
  },
  preloadedState: {
    donations: {
      items: loadDonations(),
    },
  },
});

// Save Redux donations to localStorage after every store update.
store.subscribe(() => {
  try {
    localStorage.setItem(
      STORAGE_KEYS.donations,
      JSON.stringify(store.getState().donations.items)
    );
  } catch {
    // Storage may be unavailable.
  }
});
