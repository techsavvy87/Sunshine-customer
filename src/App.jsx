import { Fragment, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";
import "./App.css";
import { routes } from "./utils/routes";
import { setServices } from "./redux/appsettingSlice.js";
import { registerAuthNavigate } from "./utils/auth";

function AuthNavigationBridge() {
  const navigate = useNavigate();

  useEffect(() => {
    return registerAuthNavigate((to, options) => navigate(to, options));
  }, [navigate]);

  return null;
}

function App() {
  useEffect(() => {
    import("../public/assets/js/bootstrap.bundle.min.js");
  });

  const dispatch = useDispatch();

  const services = useSelector((state) => state.appsetting.services);
  if (!services) {
    let servicesStorage = localStorage.getItem("services");
    if (servicesStorage) {
      servicesStorage = JSON.parse(servicesStorage);
      dispatch(setServices({ services: servicesStorage }));
    }
  }

  return (
    <Fragment>
      <BrowserRouter>
        <AuthNavigationBridge />
        <Routes>
          {routes.map((route, idx) => {
            const AuthRequire = route.guard || Fragment;
            const Component = route.component;
            const Layout = route.layout || Fragment;

            return (
              <Route
                key={idx}
                path={route.path}
                element={
                  <AuthRequire>
                    <Layout>{Component}</Layout>
                  </AuthRequire>
                }
              />
            );
          })}
        </Routes>
      </BrowserRouter>
      <Toaster
        toastOptions={{
          position: "bottom-center",
          duration: 4000,
          style: {
            background: "#333",
            color: "#fff",
            fontFamily: "Cabin",
          },
        }}
      />
    </Fragment>
  );
}

export default App;
