import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../redux/authSlice";
import appsettingReducer from "../redux/appsettingSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    appsetting: appsettingReducer,
  },
});
