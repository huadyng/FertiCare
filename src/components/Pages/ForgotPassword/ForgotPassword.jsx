// ForgotPassword.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiForgotPassword from "../../../api/apiForgotPassword";
import "./ForgotPassword.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!email.trim()) {
      setMessage("Vui lòng nhập email.");
      return;
    }
    setLoading(true);
    try {
      await apiForgotPassword.forgotPassword(email);
      setMessage("✅ Yêu cầu đã được gửi. Vui lòng kiểm tra email.");
    } catch (error) {
      setMessage(error.message || "❌ Email không tồn tại hoặc lỗi máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-bg">
      <div className="forgot-container">
        <h2 className="forgot-title">🔑 Quên mật khẩu</h2>
        <form onSubmit={handleSubmit} className="forgot-form">
          <input
            type="email"
            placeholder="Nhập email của bạn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="forgot-input"
            autoFocus
          />
          <button className="forgot-btn" disabled={loading}>
            {loading ? "Đang gửi..." : "Gửi yêu cầu"}
          </button>
        </form>
        {message && <div className="forgot-message">{message}</div>}
        <button className="forgot-back" onClick={() => navigate("/login")}>Quay lại đăng nhập</button>
      </div>
    </div>
  );
}
