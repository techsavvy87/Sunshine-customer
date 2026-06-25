import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import Alert from "../components/Alert";
import PasswordInput from "../components/PasswordInput";
import { login } from "../redux/authSlice";
import { setServices } from "../redux/appsettingSlice";
import { post } from "../utils/axios";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const { alert_type, alert_message } = location.state || {};

  useEffect(() => {
    if (alert_type && alert_message) {
      setAlertType(alert_type);
      setAlertMsg(alert_message);
    }
  }, [alert_type, alert_message]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alertMsg, setAlertMsg] = useState("");
  const [alertType, setAlertType] = useState("danger");
  const [isAgreed, setIsAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email) {
      setAlertMsg("Please enter your email");
      setAlertType("danger");
      return;
    } else {
      const mailformat = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (mailformat.test(email.trim()) === false) {
        setAlertMsg("Please enter a valid email");
        setAlertType("danger");
        return;
      }
    }
    if (!password) {
      setAlertMsg("Please enter your password");
      setAlertType("danger");
      return;
    }
    if (!isAgreed) {
      setAlertMsg("You must agree to the terms and conditions");
      setAlertType("danger");
      return;
    }

    const url = "/login";
    const data = {
      email,
      password,
    };
    setLoading(true);
    try {
      const result = await post(url, data);
      const resResult = result.data;
      setLoading(false);
      if (resResult.status) {
        // Set services in the app setting slice
        dispatch(
          setServices({
            services: resResult.result.services.map((s) => ({
              id: s.id,
              name: s.name,
            })),
          })
        );
        window.localStorage.setItem(
          "services",
          JSON.stringify(
            resResult.result.services.map((s) => ({ id: s.id, name: s.name }))
          )
        );

        dispatch(
          login({
            isAuthenticated: true,
            user: resResult.result.user,
            token: resResult.result.access_token,
          })
        );
        window.localStorage.setItem("isAuthenticated", "done");
        window.localStorage.setItem(
          "user",
          JSON.stringify(resResult.result.user)
        );
        window.localStorage.setItem("token", resResult.result.access_token);
        navigate(from, { replace: true });
      } else {
        setAlertMsg(resResult.message);
        setAlertType("danger");
      }
    } catch (err) {
      console.log("Error: ", err);
      setLoading(false);
      setAlertMsg("Something went wrong.");
      setAlertType("danger");
    }
  };

  return (
    <div className="login-section pt-40 pb-80">
      <div className="container">
        <Link to="/">
          <img
            src="assets/images/pp-logo-color.png"
            className="rounded mx-auto d-block"
            alt="duke logo"
            style={{ maxWidth: "150px", marginBottom: "20px" }}
          />
        </Link>
        <div className="row d-flex justify-content-center g-4">
          <div className="col-xl-6 col-lg-8 col-md-10">
            <div
              className="form-wrapper wow fadeInUp"
              data-wow-duration="1.5s"
              data-wow-delay=".2s"
            >
              <div className="form-title mb-3">
                <h3>Log In</h3>
                <p>
                  New Member? <Link to="/signup">signup here</Link>
                </p>
              </div>
              <div className="w-100">
                {alertMsg && (
                  <Alert
                    message={alertMsg}
                    type={alertType}
                    iconClass="bi bi-exclamation-circle me-2"
                    onClose={() => setAlertMsg("")}
                  />
                )}
                <div className="row mt-4">
                  <div className="col-12">
                    <div className="form-inner">
                      <label className="mb-1">Enter Your Email *</label>
                      <input
                        type="email"
                        placeholder="ex. johndoe@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-12">
                    <PasswordInput
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      label="Password *"
                    />
                  </div>
                  <div className="col-12">
                    <div className="form-agreement form-inner d-flex justify-content-between flex-wrap">
                      <div className="form-group">
                        <input
                          type="checkbox"
                          id="agree"
                          checked={isAgreed}
                          onChange={(e) => setIsAgreed(e.target.checked)}
                        />
                        <label htmlFor="agree">
                          I agree to the <Link to="/">Terms &amp; Policy</Link>
                        </label>
                      </div>
                      <Link to="/forgot-password" className="forgot-pass">
                        Forgotten Password
                      </Link>
                    </div>
                  </div>
                </div>
                <button
                  className="account-btn"
                  onClick={handleLogin}
                  disabled={loading}
                >
                  {loading && (
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                      style={{ marginBottom: 2 }}
                    ></span>
                  )}
                  {loading ? "Loading..." : "Log In"}
                </button>
              </div>
              <div className="alternate-signup-box">
                <h6>or signup WITH</h6>
                <div className="btn-group gap-4">
                  <Link
                    to="#"
                    className="eg-btn google-btn d-flex align-items-center"
                  >
                    <i className="bx bxl-google" />
                    <span>signup whit google</span>
                  </Link>
                  <Link
                    to="#"
                    className="eg-btn facebook-btn d-flex align-items-center"
                  >
                    <i className="bx bxl-facebook" />
                    signup whit facebook
                  </Link>
                </div>
              </div>
              <div className="form-poicy-area">
                <p>
                  By clicking the "signup" button, you create a PawPrints
                  account, and you agree to{" "}
                  <Link to="#">Terms &amp; Conditions</Link> &amp;{" "}
                  <Link to="#">Privacy Policy.</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
