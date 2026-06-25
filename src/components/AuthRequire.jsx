import { useDispatch, useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { login } from "../redux/authSlice";

const AuthRequire = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const dispatch = useDispatch();

  if (!isAuthenticated) {
    // when redux store is initialized but data in localstorage is still alive, then get data from
    // localstorage and restructure the redux store auth data.
    let isAuthStorage = localStorage.getItem("isAuthenticated");
    if (isAuthStorage === "done") {
      let userStorage = localStorage.getItem("user");
      let tokenStorage = localStorage.getItem("token");
      dispatch(
        login({
          isAuthenticated: true,
          user: JSON.parse(userStorage),
          token: tokenStorage,
        })
      );
    } else {
      // Redirect them to the /login page, but save the current location they were
      // trying to go to when they were redirected. This allows us to send them
      // along to that page after they login, which is a nicer user experience
      // than dropping them off on the home page.
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  }

  return children;
};

export default AuthRequire;
