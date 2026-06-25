import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLoading: false,
  services: null,
};

const appsettingSlice = createSlice({
  name: "appsetting",
  initialState,
  reducers: {
    setIsLoading(state, action) {
      state.isLoading = action.payload.isLoading;
    },
    setServices(state, action) {
      state.services = action.payload.services;
    },
  },
});

export const { setIsLoading, setServices } = appsettingSlice.actions;

export default appsettingSlice.reducer;
