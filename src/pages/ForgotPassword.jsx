import React, { useState } from "react";
import { Link } from "react-router-dom";
import Alert from "../components/Alert";
import { post } from "../utils/axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [alertMsg, setAlertMsg] = useState("");
  const [alertType, setAlertType] = useState("danger");
  const [loading, setLoading] = useState(false);

  const handleSendLink = async () => {
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

    const url = "/forgot/password";
    const data = {
      email,
    };
    setLoading(true);
    try {
      const result = await post(url, data);
      const resResult = result.data;
      setLoading(false);
      if (resResult.status) {
        setAlertMsg(resResult.message);
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
    <div>
      <div className="login-section pt-50">
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
                <div
                  className="form-title mb-3"
                  style={{ marginBottom: "44px" }}
                >
                  <h3>Forgot Password?</h3>
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
                    <div className="col-12">
                      <div className="form-inner">
                        <label>Enter Your Email *</label>
                        <input
                          type="email"
                          placeholder="ex. johndoe@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    className="account-btn"
                    onClick={handleSendLink}
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
                    {loading ? "Loading..." : "Send Link"}
                  </button>
                </div>
                <div className="form-poicy-area mt-4 px-5">
                  <p>
                    Clicking the 'Send Link' button will search for your email
                    in PawPrints and send a link to it.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
