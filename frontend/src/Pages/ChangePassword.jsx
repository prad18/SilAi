import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { connect } from "react-redux";
import { changePassword } from "../reducer/Actions";
import "../css/changepwd.css";

const ChangePassword = ({ isAuthenticated, changePassword }) => {
  const [formData, setFormData] = useState({
    new_password: "",
    old_password: "",
  });

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const { new_password, old_password } = formData;

  const handlingInput = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handlingSubmit = (e) => {
    e.preventDefault();
    changePassword(new_password, new_password, old_password);
  };

  if (!isAuthenticated && !localStorage.getItem("access")) {
    return <Navigate to="../login" />;
  }

  return (
    <div className="change-password-container">
      <div className="top-wrapper">
        <h2 className="heading">Change Password</h2>
        <form className="password-form" onSubmit={handlingSubmit}>
          <label className="form-label">Old Password</label>
          <div className="input-wrapper">
            <input
              type={showOld ? "text" : "password"}
              name="old_password"
              value={old_password}
              onChange={handlingInput}
              className="input-field"
            />
            <span className="toggle-icon" onClick={() => setShowOld(!showOld)}>
              {showOld ? (
                // Eye open SVG
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye-icon lucide-eye"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>
              ) : (
                // Eye closed SVG
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye-closed-icon lucide-eye-closed"><path d="m15 18-.722-3.25"/><path d="M2 8a10.645 10.645 0 0 0 20 0"/><path d="m20 15-1.726-2.05"/><path d="m4 15 1.726-2.05"/><path d="m9 18 .722-3.25"/></svg>
              )}
            </span>
          </div>

          <label className="form-label">New Password</label>
          <div className="input-wrapper">
            <input
              type={showNew ? "text" : "password"}
              name="new_password"
              value={new_password}
              onChange={handlingInput}
              className="input-field"
            />
            <span className="toggle-icon" onClick={() => setShowNew(!showNew)}>
              {showNew ? (
                // Eye open SVG
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye-icon lucide-eye"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>
              ) : (
                // Eye closed SVG
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye-closed-icon lucide-eye-closed"><path d="m15 18-.722-3.25"/><path d="M2 8a10.645 10.645 0 0 0 20 0"/><path d="m20 15-1.726-2.05"/><path d="m4 15 1.726-2.05"/><path d="m9 18 .722-3.25"/></svg>
              )}
            </span>
          </div>

          <button type="submit" className="save-button">
            SAVE CHANGES
          </button>
        </form>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  isAuthenticated: state.AuthReducer.isAuthenticated,
});

export default connect(mapStateToProps, { changePassword })(ChangePassword);
