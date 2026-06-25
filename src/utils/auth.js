import { store } from "../app/store";
import { logout } from "../redux/authSlice";

let navigateHandler = null;

export const registerAuthNavigate = (handler) => {
  navigateHandler = handler;

  return () => {
    if (navigateHandler === handler) {
      navigateHandler = null;
    }
  };
};

export const clearAuthStorage = () => {
  window.localStorage.removeItem("isAuthenticated");
  window.localStorage.removeItem("user");
  window.localStorage.removeItem("token");
};

export const forceLogout = () => {
  const from = {
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
  };

  clearAuthStorage();
  store.dispatch(logout());

  if (navigateHandler) {
    navigateHandler("/login", { replace: true, state: { from } });
    return;
  }

  window.location.assign("/login");
};