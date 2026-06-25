import { useSelector } from "react-redux";
import UserHeader from "./UserHeader";
import GuestHeader from "./GuestHeader";
import Footer from "./Footer";

const Layout = ({ children }) => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  return (
    <>
      {isAuthenticated ? <UserHeader /> : <GuestHeader />}
      {children}
      <Footer />
    </>
  );
};

export default Layout;
