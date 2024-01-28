import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  bids: [],
  asks: [],
  precision: 5,
};

const bookSlice = createSlice({
  name: 'book',
  initialState,
  reducers: {
    setBookData: (state, action) => {
      const { bids, asks } = action.payload;
      state.bids = bids;
      state.asks = asks;
    },
    setPrecision: (state, action) => {
      state.precision = action.payload;
    },
  },
});

export const { setBookData, setPrecision } = bookSlice.actions;
export default bookSlice.reducer;
