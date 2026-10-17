import { createSlice } from "@reduxjs/toolkit";
const initialState={
    items:[],
}
const donationsSlice = createSlice({
  name: "donations",
  initialState,
  reducers: {
    addDonation:(state,action)=>{
        state.items.push(action.payload);
    },
     removeDonation: (state, action) => {
      state.items = state.items.filter(
        (donation) => donation.id !== action.payload
      );
    },
    updateDonation: (state, action) => {
  const index = state.items.findIndex(
    (donation) => donation.id === action.payload.id
  );

  if (index !== -1) {
    state.items[index] = {
      ...state.items[index],
      ...action.payload,
    };
  }
},
  },
});
export const {
  addDonation,
  removeDonation,
  updateDonation,
} = donationsSlice.actions;

export default donationsSlice.reducer;