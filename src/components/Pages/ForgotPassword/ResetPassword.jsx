import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import apiForgotPassword from "../../../api/apiForgotPassword";
import "./ForgotPassword.css";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!newPassword || !confirmPassword) {
      setMessage("Vui lòng nhập đầy đủ thông tin.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage("Mật khẩu nhập lại không khớp.");
      return;
    }
    if (!token) {
      setMessage("Thiếu mã xác thực (token). Vui lòng kiểm tra lại link email.");
      return;
    }
    setLoading(true);
    try {
      await apiForgotPassword.resetPassword(token, newPassword);
      setSuccess(true);
      setMessage("Đặt lại mật khẩu thành công! Bạn có thể đăng nhập với mật khẩu mới.");
    } catch (error) {
      setMessage(error.message || "❌ Đặt lại mật khẩu thất bại hoặc token không hợp lệ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-bg">
      <div className="forgot-container">
        <h2 className="forgot-title">🔒 Đặt lại mật khẩu</h2>
        {success ? (
          <div>
            <div className="forgot-message">{message}</div>
            <Link to="/login" className="forgot-btn" style={{display: "block", marginTop: 24}}>Quay về đăng nhập</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="forgot-form">
            <div style={{position: 'relative', width: '100%'}}>
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="Mật khẩu mới"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="forgot-input"
                minLength={8}
                autoComplete="new-password"
                style={{width: '100%'}}
              />
              <span
                className={`input-eye-icon${showNewPassword ? "" : " inactive"}`}
                onClick={() => setShowNewPassword(v => !v)}
                title={showNewPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                tabIndex={0}
                onKeyDown={e => { if (e.key === "Enter" || e.key === " ") setShowNewPassword(v => !v); }}
                aria-label={showNewPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showNewPassword
                  ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e84393" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
                  : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.81 21.81 0 0 1 5.06-6.06"/><path d="M1 1l22 22"/></svg>
                }
              </span>
            </div>
            <div style={{position: 'relative', width: '100%'}}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="forgot-input"
                minLength={8}
                autoComplete="new-password"
                style={{width: '100%'}}
              />
              <span
                className={`input-eye-icon${showConfirmPassword ? "" : " inactive"}`}
                onClick={() => setShowConfirmPassword(v => !v)}
                title={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                tabIndex={0}
                onKeyDown={e => { if (e.key === "Enter" || e.key === " ") setShowConfirmPassword(v => !v); }}
                aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showConfirmPassword
                  ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e84393" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
                  : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.81 21.81 0 0 1 5.06-6.06"/><path d="M1 1l22 22"/></svg>
                }
              </span>
            </div>
            <button className="forgot-btn" disabled={loading}>
              {loading ? "Đang xử lý..." : "Xác nhận"}
            </button>
          </form>
        )}
        {message && !success && (
          <div className="forgot-message" style={{color: "#e84343"}}>{message}</div>
        )}
      </div>
    </div>
  );
}
