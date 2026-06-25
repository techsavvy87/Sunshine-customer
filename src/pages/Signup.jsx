import { useState } from "react";
import { Link } from "react-router-dom";
import PasswordInput from "../components/PasswordInput";
import Alert from "../components/Alert";
import { post } from "../utils/axios";

function Signup() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [alertMsg, setAlertMsg] = useState("");
  const [alertType, setAlertType] = useState("danger");
  const [loading, setLoading] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);

  const handleSignup = async () => {
    if (!firstName) {
      setAlertMsg("Please enter your first name");
      setAlertType("danger");
      return;
    }
    if (!lastName) {
      setAlertMsg("Please enter your last name");
      setAlertType("danger");
      return;
    }
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
    if (password !== confirmPassword) {
      setAlertMsg("Passwords do not match");
      setAlertType("danger");
      return;
    }
    if (!isAgreed) {
      setAlertMsg("You must agree to the terms and conditions");
      setAlertType("danger");
      return;
    }

    const url = "/register";
    const data = {
      firstName,
      lastName,
      email,
      password,
    };
    setLoading(true);
    try {
      const result = await post(url, data);
      const resResult = result.data;
      setLoading(false);
      if (resResult.status) {
        setAlertMsg(
          "Signup successful! Please check your email to verify your account."
        );
        setAlertType("success");
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
                <h3>Sign Up</h3>
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
                  <div className="col-md-6">
                    <div className="form-inner">
                      <label className="mb-1">First Name *</label>
                      <input
                        type="text"
                        placeholder="ex. John"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-inner">
                      <label className="mb-1">Last Name *</label>
                      <input
                        type="text"
                        placeholder="ex. Doe"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-12">
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
                  <div className="col-md-12">
                    <div className="form-agreement form-inner d-flex justify-content-between flex-wrap">
                      <div className="form-group">
                        <input
                          type="checkbox"
                          id="agree"
                          checked={isAgreed}
                          onChange={(e) => setIsAgreed(e.target.checked)}
                        />
                        <label htmlFor="agree">
                          I agree to the Terms &amp; Policy
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  className="account-btn"
                  onClick={handleSignup}
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
                  {loading ? "Loading..." : "Create Account"}
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

export default Signup;
