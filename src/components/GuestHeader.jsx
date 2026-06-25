import React, { useEffect, useReducer, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

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

function GuestHeader() {
  const navigate = useNavigate();

  const [state, dispatch] = useReducer(reducer, initialState);
  const headerRef = useRef(null);
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

  return (
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
              src="assets/images/pp-logo.png"
              style={{ maxWidth: "100px", height: "auto" }}
            />
          </Link>
        </div>
        <div className="top-bar bg-transparent">
          <div className="opening-time text-center">
            <p>
              Opening Hours
              <br />
              <span style={{ backgroundColor: "white" }}>
                Mon - Sat 9.00 - 19.00
              </span>
            </p>
          </div>
        </div>
        <div className="nav-right d-flex jsutify-content-end align-items-center">
          <ul style={{ gap: "12px", marginTop: "8px" }}>
            <li
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/login")}
            >
              <span className="primary-btn1 px-4 py-1 no-tran">Log In</span>
            </li>
            <li
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/signup")}
            >
              <span className="primary-btn1 px-4 py-1 no-tran outline-btn">
                Sign Up
              </span>
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
  );
}

export default GuestHeader;
