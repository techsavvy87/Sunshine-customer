import { useState } from "react";

const PasswordInput = ({ value, onChange, placeholder, label }) => {
  const [showPwd, setShowPwd] = useState(false);

  return (
    <div className="form-inner">
      <label className="mb-1">{label}</label>
      <input
        type={showPwd ? "text" : "password"}
        name="password"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      {showPwd ? (
        <i
          className="bi bi-eye"
          style={{ cursor: "pointer" }}
          onClick={() => setShowPwd(!showPwd)}
        />
      ) : (
        <i
          className="bi bi-eye-slash"
          style={{ cursor: "pointer" }}
          onClick={() => setShowPwd(!showPwd)}
        />
      )}
    </div>
  );
};

export default PasswordInput;
