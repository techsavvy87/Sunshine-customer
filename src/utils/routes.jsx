import AuthRequire from "../components/AuthRequire";
import Layout from "../components/Layout";
import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import ForgotPassword from "../pages/ForgotPassword";
import VerifyAccount from "../pages/VerifyAccount";
import ResetPassword from "../pages/ResetPassword";
import Profile from "../pages/Profile";
import ServiceDetail from "../pages/ServiceDetail";
import Questionnaire from "../pages/Questionnaire";
import Process from "../pages/Process";
import PreCheckIn from "../pages/PreCheckIn";
import Checkout from "../pages/Checkout";
import Invoice from "../pages/Invoice";
import Account from "../pages/Account";
import PaymentSuccess from "../pages/PaymentSuccess";
import CheckoutClass from "../pages/CheckoutClass";
import Packages from "../pages/Packages";
import PackageDetail from "../pages/PackageDetail";
import PackageBooking from "../pages/PackageBooking";
import CheckoutPackage from "../pages/CheckoutPackage";
import ServicePackage from "../pages/ServicePackage";
import About from "../pages/About";
import ContactUS from "../pages/ContactUS";
import Notifications from "../pages/Notifications";

export const routes = [
  {
    path: "/",
    layout: Layout,
    component: <Landing />,
  },
  {
    path: "/login",
    component: <Login />,
  },
  {
    path: "/signup",
    component: <Signup />,
  },
  {
    path: "/forgot-password",
    component: <ForgotPassword />,
  },
  {
    path: "/verify-account",
    component: <VerifyAccount />,
  },
  {
    path: "/reset-password",
    component: <ResetPassword />,
  },
  {
    path: "/profile",
    guard: AuthRequire,
    layout: Layout,
    component: <Profile />,
  },
  {
    path: "/account",
    guard: AuthRequire,
    layout: Layout,
    component: <Account />,
  },
  {
    path: "/service/detail/:id",
    guard: AuthRequire,
    layout: Layout,
    component: <ServiceDetail />,
  },
  {
    path: "/service/package/:id",
    guard: AuthRequire,
    layout: Layout,
    component: <ServicePackage />,
  },
  {
    path: "/questionnaire/:petId",
    guard: AuthRequire,
    layout: Layout,
    component: <Questionnaire />,
  },
  {
    path: "/process/:appoId",
    guard: AuthRequire,
    layout: Layout,
    component: <Process />,
  },
  {
    path: "/pre-checkin/:appoId",
    guard: AuthRequire,
    layout: Layout,
    component: <PreCheckIn />,
  },
  {
    path: "/checkout/:appoId",
    guard: AuthRequire,
    layout: Layout,
    component: <Checkout />,
  },
  {
    path: "/invoice/:invoiceId",
    guard: AuthRequire,
    layout: Layout,
    component: <Invoice />,
  },
  {
    path: "/payment-success",
    guard: AuthRequire,
    layout: Layout,
    component: <PaymentSuccess />,
  },
  {
    path: "/checkout/class",
    guard: AuthRequire,
    layout: Layout,
    component: <CheckoutClass />,
  },
  {
    path: "/packages",
    guard: AuthRequire,
    layout: Layout,
    component: <Packages />,
  },
  {
    path: "/package/detail/:id",
    guard: AuthRequire,
    layout: Layout,
    component: <PackageDetail />,
  },
  {
    path: "/package/booking/:id/:packageId",
    guard: AuthRequire,
    layout: Layout,
    component: <PackageBooking />,
  },
  {
    path: "/checkout/package/:packageId",
    guard: AuthRequire,
    layout: Layout,
    component: <CheckoutPackage />,
  },
  {
    path: "/about",
    guard: AuthRequire,
    layout: Layout,
    component: <About />,
  },
  {
    path: "/contact",
    guard: AuthRequire,
    layout: Layout,
    component: <ContactUS />,
  },
  {
    path: "/notifications",
    guard: AuthRequire,
    layout: Layout,
    component: <Notifications />,
  },
];
