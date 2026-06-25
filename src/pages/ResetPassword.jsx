import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import PasswordInput from "../components/PasswordInput";
import Alert from "../components/Alert";
import { post } from "../utils/axios";

function ResetPassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [alertMsg, setAlertMsg] = useState("");
  const [alertType, setAlertType] = useState("danger");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    }
  }, []);

  const handleResetPassword = async () => {
    if (!password) {
      setAlertMsg("Please enter your password.");
      setAlertType("danger");
      return;
    }
    if (password !== confirmPassword) {
      setAlertMsg("Passwords do not match.");
      setAlertType("danger");
      return;
    }
    if (!token) {
      setAlertMsg("The password reset token is missing.");
      setAlertType("danger");
      return;
    }

    const url = "/reset/password";
    const data = {
      new_password: password,
      token,
    };
    setLoading(true);
    try {
      const result = await post(url, data);
      const resResult = result.data;
      setLoading(false);
      if (resResult.status) {
        navigate("/login", {
          state: { alert_type: "success", alert_message: resResult.message },
        });
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
    <div className="signup-section pt-40 pb-80">
      <div className="container">
        <Link to="/">
          <img
            src="assets/images/pp-logo-color.png"
            className="rounded mx-auto d-block"
            alt="duke logo"
            style={{ maxWidth: "150px", marginBottom: "20px" }}
          />
        </Link>
        <div className="row d-flex justify-content-center">
          <div className="col-xl-6 col-lg-8 col-md-10">
            <div
              className="form-wrapper wow fadeInUp"
              data-wow-duration="1.5s"
              data-wow-delay=".2s"
            >
              <div className="form-title mb-3">
                <h3>Reset Password</h3>
                <p>
                  Do you already have an account?{" "}
                  <Link to="/login">Log in here</Link>
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
                  <div className="col-md-12">
                    <PasswordInput
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create A Password"
                      label="Password *"
                    />
                  </div>
                  <div className="col-md-12">
                    <PasswordInput
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm Password"
                      label="Confirm Password *"
                    />
                  </div>
                </div>
                <button
                  className="account-btn"
                  onClick={handleResetPassword}
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
                  {loading ? "Loading..." : "Reset Password"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
