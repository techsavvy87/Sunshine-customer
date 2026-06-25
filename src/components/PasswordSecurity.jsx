import { useState } from "react";
import toast from "react-hot-toast";
import PasswordInput from "./PasswordInput";
import { post } from "../utils/axios";

const PasswordSecurity = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const updatePassword = async () => {
    if (!currentPassword) {
      toast.error("Please enter your current password");
      return;
    }
    if (!newPassword) {
      toast.error("Please enter your new password");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }
    const url = "/password/update";
    const data = {
      currentPassword,
      newPassword,
    };
    setLoading(true);
    try {
      const result = await post(url, data);
      const resResult = result.data;
      if (resResult.status) {
        toast.success("Password updated successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(resResult.message);
      }
    } catch (error) {
      console.log("Error: ", error);
      toast.error("An error occurred while updating password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="checkout-section">
        <div className="form-wrap p-0">
          <div className="row justify-content-center">
            <div
              className="col-lg-6 form-wrapper"
              style={{ boxShadow: "none", background: "transparent" }}
            >
              <PasswordInput
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter Current Password"
                label="Current Password *"
              />
              <PasswordInput
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Create A Password"
                label="New Password *"
              />
              <PasswordInput
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                label="Confirm Password *"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="text-center">
        <div className="reservation-btn">
          <button
            className="primary-btn1 form-btn"
            style={{ padding: "8px 36px" }}
            onClick={updatePassword}
          >
            {loading && (
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
                style={{ marginBottom: 2 }}
              ></span>
            )}
            {loading ? "Loading..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordSecurity;
