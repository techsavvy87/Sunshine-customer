import { useDispatch, useSelector } from "react-redux";
import { Fragment } from "react";
import Banner from "../components/Banner";
import VideoBanner from "../components/VideoBanner";
import HomeService from "../components/HomeService";
import HomeAbout from "../components/HomeAbout";
import HomeFeature from "../components/HomeFeature";
import FeatureCounter from "../components/FeatureCounter";
import ChooseUs from "../components/ChooseUs";
import HomePartner from "../components/HomePartner";
import HomePricePlan from "../components/HomePricePlan";
import HomeTestimonial from "../components/HomeTestmonial";
import HomeTeam from "../components/HomeTeam";
import HomeNewsletter from "../components/HomeNewsletter";
import HomeBlog from "../components/HomeBlog";
import { login } from "../redux/authSlice";

export default function Landing() {
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
    }
  }

  return (
    <Fragment>
      <Banner />
      <VideoBanner />
      <HomeService />
      <HomeAbout />
      <HomeFeature />
      <FeatureCounter />
      <ChooseUs />
      <HomePartner />
      <HomePricePlan />
      <HomeTestimonial />
      <HomeTeam />
      <HomeNewsletter />
      <HomeBlog />
    </Fragment>
  );
}
