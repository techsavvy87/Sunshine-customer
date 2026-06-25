import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(state, action) {
      const { isAuthenticated, user, token } = action.payload;
      state.isAuthenticated = isAuthenticated;
      state.user = user;
      state.token = token;
    },

    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
    },
    updateUser(state, action) {
      if (state.user) {
        state.user = {
          ...state.user,
          ...action.payload,
        };
      }
    },
  },
});

export const { login, logout, updateUser } = authSlice.actions;

export default authSlice.reducer;
