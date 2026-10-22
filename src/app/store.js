// import { configureStore } from "@reduxjs/toolkit";
// import donationsReducer from "../features/donations/donationsSlice";
// import { STORAGE_KEYS } from "../utils/storage";
// import { initialDonations } from "../data/donations";

// function loadDonations() {
//   try {
//     const saved = localStorage.getItem(STORAGE_KEYS.donations);

//     return saved ? JSON.parse(saved) : initialDonations;
//   } catch {
//     return initialDonations;
//   }
// }

// export const store = configureStore({
//   reducer: {
//     donations: donationsReducer,
//   },
//   preloadedState: {
//     donations: {
//       items: loadDonations(),
//     },
//   },
// });

// // Save Redux donations to localStorage after every store update.
// store.subscribe(() => {
//   try {
//     localStorage.setItem(
//       STORAGE_KEYS.donations,
//       JSON.stringify(store.getState().donations.items)
//     );
//   } catch {
//     // Storage may be unavailable.
//   }
// });

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
      if (parseDeadline(donation.pickupDeadline) !== null) return donation;
      return {
        ...donation,
        pickupDeadline: new Date(
          Date.now() + (index + 2) * 60 * 60 * 1000,
        ).toISOString(),
      };
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
