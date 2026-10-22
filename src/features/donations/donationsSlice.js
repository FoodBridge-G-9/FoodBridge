import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
};

const getDonationId = (donation) => String(donation?._id ?? donation?.id ?? "");

const donationsSlice = createSlice({
  name: "donations",
  initialState,

  reducers: {
    addDonation: (state, action) => {
      const donation = action.payload;

      if (!donation) return;

      const id = donation._id ?? donation.id ?? Date.now();

      state.items.push({
        ...donation,
        id,
        _id: id,
      });
    },

    removeDonation: (state, action) => {
      const id =
        typeof action.payload === "object"
          ? (action.payload._id ?? action.payload.id)
          : action.payload;

      state.items = state.items.filter(
        (donation) => getDonationId(donation) !== String(id),
      );
    },

    updateDonation: (state, action) => {
      const updates = action.payload;

      if (!updates) return;

      const id = updates._id ?? updates.id;

      const index = state.items.findIndex(
        (donation) => getDonationId(donation) === String(id),
      );

      if (index !== -1) {
        state.items[index] = {
          ...state.items[index],
          ...updates,
          id: state.items[index].id ?? id,
          _id: state.items[index]._id ?? id,
        };
      }
    },

    setDonations: (state, action) => {
      state.items = (action.payload ?? []).map((donation) => {
        const id = donation._id ?? donation.id;

        return {
          ...donation,
          id,
          _id: id,
        };
      });
    },
  },
});

export const { addDonation, removeDonation, updateDonation, setDonations } =
  donationsSlice.actions;

export default donationsSlice.reducer;
