import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { get, post } from "../utils/axios";
import { logout } from "../redux/authSlice";
import ppLogo from "/assets/images/pp-logo.png";
import DefaultUserAvatar from "/assets/images/pp-default-user-avatar.jpg";

const initialState = {
  activeMenu: "",
  mobileMenuState: false,
  navState: false,
  scrollY: 0,
};

function reducer(state, action) {
  switch (action.type) {
    case "home":
      return { ...state, activeMenu: "home" };
    case "blog":
      return { ...state, activeMenu: "blog" };
    case "shop":
      return { ...state, activeMenu: "shop" };
    case "services":
      return { ...state, activeMenu: "services" };
    case "pages":
      return { ...state, activeMenu: "pages" };
    case "mobileMenu":
      return { ...state, mobileMenuState: action.isMobileMenu };
    case "setScrollY":
      return { ...state, scrollY: action.payload };
    default:
      throw new Error();
  }
}

function UserHeader() {
  // const currentRoute = useRouter().pathname;
  const location = useLocation();
  const navigate = useNavigate();
  const currentRoute = location.pathname;

  const dispatchRedux = useDispatch();

  const user = useSelector((state) => state.auth.user);
  const services = useSelector((state) => state.appsetting.services);

  const [state, dispatch] = useReducer(reducer, initialState);
  const headerRef = useRef(null);
  const isPollingRef = useRef(false);
  const [notifications, setNotifications] = useState([]);

  const parseNotificationDate = (value) => {
    if (!value) return null;
    if (value instanceof Date && !Number.isNaN(value.getTime())) return value;

    if (typeof value === "string") {
      // Backend returns "YYYY-MM-DD HH:mm:ss" in UTC; append "Z" so the browser
      // parses it as UTC and converts to the user's local timezone correctly.
      const normalizedValue = value.includes(" ") ? value.replace(" ", "T") + "Z" : value;
      const parsed = new Date(normalizedValue);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }

    const parsedFallback = new Date(value);
    if (!Number.isNaN(parsedFallback.getTime())) return parsedFallback;

    return null;
  };

  const normalizeNotifications = (payload) => {
    if (!Array.isArray(payload)) return [];

    return payload.map((notification, index) => {
      return {
        id: notification?.id || `notification-${index}`,
        sender: notification?.sender || "Unknown User",
        sender_image: notification?.sender_image || DefaultUserAvatar,
        message: notification?.message || "You have a new notification.",
        timestamp: notification?.created_at || ""
      };
    });
  };

  const formatNotificationTime = (timestamp) => {
    if (!timestamp) return "";

    const date = parseNotificationDate(timestamp);
    if (!date) return "";

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    if (diffMs < 0) return "just now";

    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    const week = 7 * day;

    if (diffMs < minute) return "just now";

    if (diffMs < hour) {
      const minutes = Math.floor(diffMs / minute);
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    }

    if (diffMs < day) {
      const hours = Math.floor(diffMs / hour);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    }

    if (diffMs < week) {
      const days = Math.floor(diffMs / day);
      return `${days} day${days > 1 ? "s" : ""} ago`;
    }

    const weeks = Math.floor(diffMs / week);
    return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  };

  const unreadCount = notifications.length;

  const groupedNotifications = useMemo(() => {
    const groupedMap = {
      today: [],
      yesterday: [],
      previous: [],
    };

    const now = new Date();
    const todayDateString = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ).toDateString();

    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(now.getDate() - 1);
    const yesterdayDateString = new Date(
      yesterdayDate.getFullYear(),
      yesterdayDate.getMonth(),
      yesterdayDate.getDate()
    ).toDateString();

    notifications.forEach((notification) => {
      if (!notification.timestamp) {
        groupedMap.previous.push(notification);
        return;
      }

      const parsedDate = parseNotificationDate(notification.timestamp);
      if (!parsedDate) {
        groupedMap.previous.push(notification);
        return;
      }

      const itemDateString = new Date(
        parsedDate.getFullYear(),
        parsedDate.getMonth(),
        parsedDate.getDate()
      ).toDateString();

      if (itemDateString === todayDateString) {
        groupedMap.today.push(notification);
      } else if (itemDateString === yesterdayDateString) {
        groupedMap.yesterday.push(notification);
      } else {
        groupedMap.previous.push(notification);
      }
    });

    return [
      { key: "today", label: "Today", items: groupedMap.today },
      { key: "yesterday", label: "Yesterday", items: groupedMap.yesterday },
      { key: "previous", label: "Previous", items: groupedMap.previous },
    ].filter((group) => group.items.length > 0);
  }, [notifications]);

  const handleScroll = () => {
    const { scrollY } = window;
    dispatch({ type: "setScrollY", payload: scrollY });
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    const sendUserIdToBackend = async () => {
      if (isPollingRef.current) return;
      isPollingRef.current = true;

      try {
        const result = await post("/notifications/poll", { user_id: user.id });
        const normalizedNotifications = normalizeNotifications(
          result?.data?.notifications
        );
        setNotifications(normalizedNotifications);
      } catch (error) {
        console.error("Notification polling failed:", error);
      } finally {
        isPollingRef.current = false;
      }
    };

    const handleNotificationsRefresh = () => {
      sendUserIdToBackend();
    };

    sendUserIdToBackend();
    const intervalId = window.setInterval(sendUserIdToBackend, 15000);
    window.addEventListener(
      "notifications:refresh-menu",
      handleNotificationsRefresh
    );

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener(
        "notifications:refresh-menu",
        handleNotificationsRefresh
      );
    };
  }, [user?.id]);

  const handleNotificationClick = async (notificationId) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter(
        (notification) => notification.id !== notificationId
      )
    );

    try {
      await post("/notifications/read", { id: notificationId });
      window.dispatchEvent(new Event("notifications:refresh-page"));
    } catch (error) {
      console.error("Mark notification as read failed:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    const ids = notifications.map((n) => n.id);
    setNotifications([]);
    if (ids.length > 0) {
      try {
        await post("/notifications/mark-all-read", { ids });
        window.dispatchEvent(new Event("notifications:refresh-page"));
      } catch (_) {}
    }
  };

  const handleViewAllNotifications = () => {
    navigate("/notifications");
  };

  const handleLogout = async (e) => {
    e.preventDefault();

    try {
      const result = await get("/logout");
      const resResult = result.data;
      if (resResult.status) {
        dispatchRedux(logout());
        localStorage.clear();
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <header
        ref={headerRef}
        className={
          state.scrollY > 150
            ? "header-area style-1 sticky"
            : "header-area style-1"
        }
      >
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <div className="header-logo">
            <Link to="/">
              <img
                alt="image"
                className="img-fluid ms-4"
                src={ppLogo}
                style={{ maxWidth: "100px", height: "auto" }}
              />
            </Link>
          </div>
          <div
            className={
              state.mobileMenuState === true
                ? "main-menu show-menu"
                : "main-menu"
            }
          >
            <div className="mobile-logo-area d-lg-none d-flex justify-content-between align-items-center">
              <div className="mobile-logo-wrap">
                <Link to="/">
                  <img
                    alt="image"
                    src={ppLogo}
                    style={{ maxWidth: "120px", height: "auto" }}
                  />
                </Link>
              </div>
              <div className="menu-close-btn">
                <i
                  className="bi bi-x-lg text-white"
                  onClick={() =>
                    dispatch({ type: "mobileMenu", isMobileMenu: false })
                  }
                />
              </div>
            </div>
            <ul className="menu-list">
              <li className={currentRoute === "/" ? "active" : ""}>
                <Link to="/">Home</Link>
              </li>
              <li className={currentRoute === "/about" ? "active" : ""}>
                <Link to="/about">About</Link>
              </li>
              <li className="menu-item-has-children">
                <Link to="/">Services</Link>
                <i
                  className="bi bi-plus dropdown-icon"
                  onClick={() => dispatch({ type: "services" })}
                />
                <ul
                  className={
                    state.activeMenu === "services"
                      ? "sub-menu  d-block"
                      : "sub-menu d-xl-block d-none"
                  }
                >
                  {services &&
                    services.map((service) => (
                      <li key={service.id}>
                        <Link
                          to={
                            service.name.toLowerCase().includes("package")
                              ? `/service/package/${service.id}`
                              : `/service/detail/${service.id}`
                          }
                        >
                          <span
                            className={
                              currentRoute === `/service/detail/${service.id}`
                                ? "active"
                                : ""
                            }
                          >
                            {service.name}
                          </span>
                        </Link>
                      </li>
                    ))}
                </ul>
              </li>
              <li className={currentRoute === "/packages" ? "active" : ""}>
                <Link to="/packages">Packages</Link>
              </li>
              <li className={currentRoute === "/blogs" ? "active" : ""}>
                <Link to="/blogs">Blogs</Link>
              </li>
              <li className={currentRoute === "/contact" ? "active" : ""}>
                <Link to="/contact">Contact</Link>
              </li>
            </ul>
            <div className="for-mobile-menu d-lg-none d-block">
              <div className="hotline mb-5">
                <div className="hotline-info">
                  <span>{user.name}</span>
                  <h6 style={{ fontSize: 16 }}>{user.email}</h6>
                </div>
              </div>
              <ul className="social-link mb-5">
                <li>
                  <Link to="/profile?tab=personal">
                    <svg
                      width={15}
                      height={15}
                      viewBox="0 0 15 15"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g clipPath="url(#clip0_1585_341)">
                        <path d="M6.98716 0.938832C6.28609 1.04711 5.65949 1.38227 5.169 1.90563C4.62972 2.48055 4.3498 3.14571 4.31128 3.94235C4.25735 5.0561 4.80177 6.12086 5.74167 6.73703C6.20391 7.04125 6.64818 7.19594 7.18747 7.23977C8.18643 7.31711 9.03901 7.00258 9.72724 6.29875C10.2742 5.74188 10.5516 5.13344 10.6183 4.35743C10.7108 3.32102 10.3205 2.3568 9.54234 1.68133C9.03901 1.24821 8.57676 1.03164 7.93733 0.938832C7.62916 0.895004 7.26964 0.892426 6.98716 0.938832Z" />
                        <path d="M4.65531 7.29655C3.49456 7.4203 2.68821 8.25561 2.31327 9.7303C2.06418 10.7126 1.99998 11.8933 2.15919 12.5405C2.29016 13.0587 2.71902 13.5846 3.21465 13.8373C3.43807 13.9507 3.75907 14.0435 4.02871 14.0744C4.18793 14.0951 5.40004 14.1002 7.71896 14.0951L11.1729 14.0873L11.3912 14.0255C12.2027 13.8037 12.7574 13.2572 12.9603 12.4889C13.0656 12.0893 13.0527 11.1354 12.9295 10.3826C12.6598 8.70678 11.9767 7.70131 10.8956 7.38678C10.6491 7.31459 10.2074 7.26045 10.0764 7.28623C9.95057 7.30944 9.77594 7.40225 9.38047 7.65749C8.95931 7.93077 8.90025 7.9617 8.58438 8.0803C8.21972 8.21694 7.91926 8.27624 7.56745 8.27624C7.20792 8.27624 6.93058 8.22467 6.56592 8.09577C6.2218 7.97202 6.20639 7.96428 5.66711 7.62139C5.38463 7.44092 5.17405 7.32491 5.09187 7.3017C4.94806 7.26561 4.94806 7.26561 4.65531 7.29655Z" />
                      </g>
                    </svg>
                  </Link>
                </li>
                <li>
                  <Link to="/account?tab=password">
                    <svg
                      width={15}
                      height={15}
                      viewBox="0 0 15 15"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M14.1429 6.42857H12.8036C12.6964 6.05357 12.5446 5.69643 12.3571 5.35714L13.3036 4.41071C13.5 4.21429 13.5 3.89286 13.3036 3.69643L11.3036 1.69643C11.1071 1.5 10.7857 1.5 10.5893 1.69643L9.64286 2.64286C9.30357 2.45536 8.94643 2.30357 8.57143 2.19643V0.857143C8.57143 0.589286 8.35714 0.375 8.08929 0.375H5.91071C5.64286 0.375 5.42857 0.589286 5.42857 0.857143V2.19643C5.05357 2.30357 4.69643 2.45536 4.35714 2.64286L3.41071 1.69643C3.21429 1.5 2.89286 1.5 2.69643 1.69643L0.696429 3.69643C0.5 3.89286 0.5 4.21429 0.696429 4.41071L1.64286 5.35714C1.45536 5.69643 1.30357 6.05357 1.19643 6.42857H0.857143C0.589286 6.42857 0.375 6.64286 0.375 6.91071V9.08929C0.375 9.35714 0.589286 9.57143 0.857143 9.57143H1.19643C1.30357 9.94643 1.45536 10.3036 1.64286 10.6429L0.696429 11.5893C0.5 11.7857 0.5 12.1071 0.696429 12.3036L2.69643 14.3036C2.89286 14.5 3.21429 14.5 3.41071 14.3036L4.35714 13.3571C4.69643 13.5446 5.05357 13.6964 5.42857 13.8036V15.1429C5.42857 15.4107 5.64286 15.625 5.91071 15.625H8.08929C8.35714 15.625 8.57143 15.4107 8.57143 15.1429V13.8036C8.94643 13.6964 9.30357 13.5446 9.64286 13.3571L10.5893 14.3036C10.7857 14.5 11.1071 14.5 11.3036 14.3036L13.3036 12.3036C13.5 12.1071 13.5 11.7857 13.3036 11.5893L12.3571 10.6429C12.5446 10.3036 12.6964 9.94643 12.8036 9.57143H14.1429C14.4107 9.57143 14.625 9.35714 14.625 9.08929V6.91071C14.625 6.64286 14.4107 6.42857 14.1429 6.42857ZM7 10.5C5.61607 10.5 4.5 9.38393 4.5 8C4.5 6.61607 5.61607 5.5 7 5.5C8.38393 5.5 9.5 6.61607 9.5 8C9.5 9.38393 8.38393 10.5 7 10.5Z" />
                    </svg>
                  </Link>
                </li>
                <li onClick={handleLogout}>
                  <Link to="#">
                    <svg
                      width={15}
                      height={15}
                      viewBox="0 0 15 15"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M5.625 13.125H2.8125C2.46497 13.125 2.13161 12.9868 1.88531 12.7405C1.63902 12.4942 1.50078 12.1608 1.50078 11.8133V2.6875C1.50078 2.33997 1.63902 2.00661 1.88531 1.76031C2.13161 1.51402 2.46497 1.37578 2.8125 1.37578H5.625C5.79076 1.37578 5.94973 1.44158 6.06694 1.55879C6.18415 1.676 6.24995 1.83497 6.24995 2.00073C6.24995 2.16649 6.18415 2.32546 6.06694 2.44267C5.94973 2.55988 5.79076 2.62568 5.625 2.62568H2.8125C2.79592 2.62568 2.77803 2.63408 2.76412 2.64799C2.75021 2.6619 2.75078 2.67979 2.75078 2.6875V11.8133C2.75078 11.8299 2.75021 11.8478 2.76412 11.8617C2.77803 11.8756 2.79592 11.8757 2.8125 11.8757H5.625C5.79076 11.8757 5.94973 11.9415 6.06694 12.0587C6.18415 12.1759 6.24995 12.3349 6.24995 12.5007C6.24995 12.6664 6.18415 12.8254 6.06694 12.9426C5.94973 13.0598 5.79076 13.125 5.625 13.125ZM10.8839 10.4411L13.6839 7.64114C13.7424 7.58273 13.7889 7.51331 13.8207 7.437C13.8526 7.36069 13.8693 7.27896 13.8693 7.19646C13.8693 7.11396 13.8526 7.03223 13.8207 6.95592C13.7889 6.87961 13.7424 6.81019 13.6839 6.75178L10.8839 3.95178C10.7665 3.83432 10.6073 3.76836 10.4414 3.76836C10.2755 3.76836 10.1162 3.83432 9.99889 3.95178C9.88143 4.06924 9.81547 4.22849 9.81547 4.3944C9.81547 4.56032 9.88143 4.71957 9.99889 4.83703L11.5376 6.37568H5.625C5.45924 6.37568 5.30027 6.44148 5.18306 6.55869C5.06585 6.6759 5 6.83487 5 7.00063C5 7.16639 5.06585 7.32536 5.18306 7.44257C5.30027 7.55978 5.45924 7.62558 5.625 7.62558H11.5376L9.99889 9.16423C9.88143 9.28169 9.81547 9.44094 9.81547 9.60686C9.81547 9.77277 9.88143 9.93202 9.99889 10.0495C10.1162 10.1669 10.2755 10.2329 10.4414 10.2329C10.6073 10.2329 10.7665 10.1669 10.8839 10.0495V10.4411Z" />
                    </svg>
                  </Link>
                </li>
              </ul>
              <form className="mobile-menu-form">
                <div className="input-with-btn d-flex flex-column">
                  <input type="text" placeholder="Search here..." />
                  <button className="primary-btn1" type="submit">
                    Search
                  </button>
                </div>
              </form>
            </div>
          </div>
          <div className="nav-right d-flex jsutify-content-end align-items-center">
            <ul>
              <li className="search-btn">
                <Link to="/">
                  <svg width={15} height={15} viewBox="0 0 15 15">
                    <path d="M13.8914 12.3212L11.3164 9.74312C11.1877 9.63999 11.0332 9.56265 10.8787 9.56265H10.4667C11.1619 8.6603 11.5997 7.52593 11.5997 6.26265C11.5997 3.32358 9.1792 0.900146 6.2437 0.900146C3.28245 0.900146 0.887695 3.32358 0.887695 6.26265C0.887695 9.22749 3.28245 11.6251 6.2437 11.6251C7.4797 11.6251 8.6127 11.2126 9.5397 10.4908V10.9291C9.5397 11.0837 9.5912 11.2384 9.71995 11.3673L12.2692 13.9197C12.5267 14.1775 12.9129 14.1775 13.1447 13.9197L13.8657 13.1978C14.1232 12.9658 14.1232 12.5791 13.8914 12.3212ZM6.2437 9.56265C4.41545 9.56265 2.9477 8.09312 2.9477 6.26265C2.9477 4.45796 4.41545 2.96265 6.2437 2.96265C8.0462 2.96265 9.5397 4.45796 9.5397 6.26265C9.5397 8.09312 8.0462 9.56265 6.2437 9.56265Z" />
                  </svg>
                </Link>
                <form className="nav__search-form">
                  <input type="text" placeholder="Search keyword" />
                  <button type="submit">
                    <svg width={15} height={15} viewBox="0 0 15 15">
                      <path d="M13.8914 12.3212L11.3164 9.74312C11.1877 9.63999 11.0332 9.56265 10.8787 9.56265H10.4667C11.1619 8.6603 11.5997 7.52593 11.5997 6.26265C11.5997 3.32358 9.1792 0.900146 6.2437 0.900146C3.28245 0.900146 0.887695 3.32358 0.887695 6.26265C0.887695 9.22749 3.28245 11.6251 6.2437 11.6251C7.4797 11.6251 8.6127 11.2126 9.5397 10.4908V10.9291C9.5397 11.0837 9.5912 11.2384 9.71995 11.3673L12.2692 13.9197C12.5267 14.1775 12.9129 14.1775 13.1447 13.9197L13.8657 13.1978C14.1232 12.9658 14.1232 12.5791 13.8914 12.3212ZM6.2437 9.56265C4.41545 9.56265 2.9477 8.09312 2.9477 6.26265C2.9477 4.45796 4.41545 2.96265 6.2437 2.96265C8.0462 2.96265 9.5397 4.45796 9.5397 6.26265C9.5397 8.09312 8.0462 9.56265 6.2437 9.56265Z" />
                    </svg>
                  </button>
                </form>
              </li>
              <li>
                <Link to="/">
                  <svg
                    width={14}
                    height={13}
                    viewBox="0 0 14 13"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12.4147 1.51371C11.0037 0.302997 8.92573 0.534835 7.61736 1.87434L7.12993 2.38954L6.61684 1.87434C5.33413 0.534835 3.23047 0.302997 1.81948 1.51371C0.203258 2.90473 0.126295 5.37767 1.56294 6.87174L6.53988 12.0237C6.84773 12.3586 7.38647 12.3586 7.69433 12.0237L12.6713 6.87174C14.1079 5.37767 14.0309 2.90473 12.4147 1.51371Z" />
                  </svg>
                </Link>
              </li>
              <li>
                <Link to="/">
                  <svg
                    width={16}
                    height={13}
                    viewBox="0 0 16 13"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M8 12.5C8.828 12.5 9.5 11.828 9.5 11H6.5C6.5 11.828 7.172 12.5 8 12.5ZM14 10V6.5C14 4.015 12.209 1.99 9.9 1.5V1C9.9 0.448 9.452 0 8.9 0H7.1C6.548 0 6.1 0.448 6.1 1V1.5C3.791 1.99 2 4.015 2 6.5V10L0.9 11.1C0.7 11.3 0.7 11.6 0.9 11.8C1 11.9 1.15 12 1.3 12H14.7C14.85 12 15 11.9 15.1 11.8C15.3 11.6 15.3 11.3 15.1 11.1L14 10ZM12.5 10.5H3.5V6.5C3.5 4.57 4.96 3 6.8 3C8.64 3 10.1 4.57 10.1 6.5V10.5H12.5Z"/>
                  </svg>
                  {unreadCount > 0 && (
                    <span className="notification-badge">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
                <div
                  className="header-user-menu notification-menu"
                >
                  <div style={{ width: "100%" }}>
                    <div className="notification-menu-header">
                      <h6>Notifications</h6>
                      {unreadCount > 0 && <span>{unreadCount} New</span>}
                    </div>

                    <div className="notification-list">
                      {notifications.length === 0 ? (
                        <p className="notification-empty">No notifications yet.</p>
                      ) : (
                        groupedNotifications.map((group) => (
                          <div key={group.key} className="notification-group">
                            <div className="notification-group-label">
                              <span>{group.label}</span>
                            </div>

                            {group.items.map((notification) => (
                              <button
                                type="button"
                                key={notification.id}
                                className="notification-item unread"
                                onClick={() => {
                                  handleNotificationClick(notification.id);
                                }}
                              >
                                <div className="notification-item-top">
                                  <div className="notification-sender flex-grow-1">
                                    <img
                                      src={notification.sender_image || DefaultUserAvatar}
                                      alt="sender"
                                      className="notification-sender-avatar"
                                      onError={(event) => {
                                        event.currentTarget.src = DefaultUserAvatar;
                                      }}
                                    />
                                    <div className="flex-grow-1">
                                      <p>{notification.message}</p>
                                      {notification.timestamp && (
                                        <span className="notification-time">
                                          {formatNotificationTime(notification.timestamp)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        ))
                      )}
                    </div>
                      <div className="notification-actions">
                        <button
                          type="button"
                          className="notification-action-btn"
                          onClick={handleMarkAllAsRead}
                          disabled={unreadCount === 0}
                          style={{ opacity: unreadCount === 0 ? 0.5 : 1, cursor: unreadCount === 0 ? "not-allowed" : "pointer" }}
                        >
                          Mark as read
                        </button>
                        <button
                          type="button"
                          className="notification-action-btn"
                          onClick={handleViewAllNotifications}
                        >
                          View All
                        </button>
                      </div>
                  </div>
                </div>
              </li>
              <li>
                <Link to="/">
                  <svg
                    width={15}
                    height={15}
                    viewBox="0 0 15 15"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clipPath="url(#clip0_1585_341)">
                      <path d="M6.98716 0.938832C6.28609 1.04711 5.65949 1.38227 5.169 1.90563C4.62972 2.48055 4.3498 3.14571 4.31128 3.94235C4.25735 5.0561 4.80177 6.12086 5.74167 6.73703C6.20391 7.04125 6.64818 7.19594 7.18747 7.23977C8.18643 7.31711 9.03901 7.00258 9.72724 6.29875C10.2742 5.74188 10.5516 5.13344 10.6183 4.35743C10.7108 3.32102 10.3205 2.3568 9.54234 1.68133C9.03901 1.24821 8.57676 1.03164 7.93733 0.938832C7.62916 0.895004 7.26964 0.892426 6.98716 0.938832Z" />
                      <path d="M4.65531 7.29655C3.49456 7.4203 2.68821 8.25561 2.31327 9.7303C2.06418 10.7126 1.99998 11.8933 2.15919 12.5405C2.29016 13.0587 2.71902 13.5846 3.21465 13.8373C3.43807 13.9507 3.75907 14.0435 4.02871 14.0744C4.18793 14.0951 5.40004 14.1002 7.71896 14.0951L11.1729 14.0873L11.3912 14.0255C12.2027 13.8037 12.7574 13.2572 12.9603 12.4889C13.0656 12.0893 13.0527 11.1354 12.9295 10.3826C12.6598 8.70678 11.9767 7.70131 10.8956 7.38678C10.6491 7.31459 10.2074 7.26045 10.0764 7.28623C9.95057 7.30944 9.77594 7.40225 9.38047 7.65749C8.95931 7.93077 8.90025 7.9617 8.58438 8.0803C8.21972 8.21694 7.91926 8.27624 7.56745 8.27624C7.20792 8.27624 6.93058 8.22467 6.56592 8.09577C6.2218 7.97202 6.20639 7.96428 5.66711 7.62139C5.38463 7.44092 5.17405 7.32491 5.09187 7.3017C4.94806 7.26561 4.94806 7.26561 4.65531 7.29655Z" />
                    </g>
                  </svg>
                </Link>
                <div className="header-user-menu">
                  <div style={{ width: "100%" }}>
                    <div
                      className="d-flex align-items-start gap-2 pt-3 px-3 mb-2"
                      style={{ borderBottom: "1px solid #4d4d4d" }}
                    >
                      <img
                        src={DefaultUserAvatar}
                        alt="User"
                        className="img-fluid rounded-circle"
                        style={{ width: "44px", height: "44px" }}
                      />
                      <div>
                        <h6 className="text-white mb-0">{user.name}</h6>
                        <p className="mb-1" style={{ fontSize: "14px" }}>
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <div className="user-menu-link">
                      <i
                        className="bi bi-person text-white me-2"
                        style={{ fontSize: "13px" }}
                      />
                      <Link to="/profile?tab=personal">My Profile</Link>
                    </div>
                    <div className="user-menu-link">
                      <i
                        className="bi bi-gear text-white me-2"
                        style={{ fontSize: "13px" }}
                      />
                      <Link to="/account?tab=password">My Account</Link>
                    </div>
                    <div className="user-menu-link" onClick={handleLogout}>
                      <i
                        className="bi bi-box-arrow-right text-white me-2"
                        style={{ fontSize: "13px" }}
                      />
                      <Link to="#">Logout</Link>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
            <div className="sidebar-button mobile-menu-btn">
              <i
                className="bi bi-list"
                onClick={() =>
                  dispatch({ type: "mobileMenu", isMobileMenu: true })
                }
              />
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

export default UserHeader;
