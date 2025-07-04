// ForgotPassword.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ForgotPassword.css";
export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!email.trim()) return "Email không được bỏ trống.";
    if (!emailRegex.test(email)) return "Email không đúng định dạng.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    const err = validateEmail(email);
    if (err) {
      setMessage(err);
      return;
    }
    setLoading(true);
    try {
      await axios.post("/api/notifications/request-password-reset", { email });
      setMessage("✅ Yêu cầu đã được gửi. Vui lòng kiểm tra email.");
    } catch (error) {
      setMessage("❌ Email không tồn tại hoặc lỗi máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #fcc6ff, #85d1fa)' }}>
      <div className="login-form" style={{ width: 480, background: '#fff', borderRadius: 32, boxShadow: '0 16px 48px rgba(255, 105, 180, 0.18)', padding: 56, margin: '60px 0' }}>
        <h2 style={{ color: '#f0619a', textAlign: 'center', fontWeight: 800, fontSize: 40, marginBottom: 38, letterSpacing: 1 }}>Quên mật khẩu</h2>
        <form onSubmit={handleSubmit} className="form-fade-slide">
          <input
            type="email"
            placeholder="Nhập email của bạn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: 24, borderRadius: 18, border: '2.5px solid #fbc1cc', fontSize: 22, marginBottom: 28, width: '100%' }}
            autoFocus
          />
          <button
            type="submit"
            className="btn-login"
            style={{ width: '100%', padding: 22, borderRadius: 16, background: 'linear-gradient(90deg, #fb61ae, #93c5fd)', color: '#fff', fontWeight: 800, fontSize: 22, border: 'none', marginBottom: 16, letterSpacing: 1 }}
            disabled={loading}
          >
            {loading ? "Đang gửi..." : "Gửi yêu cầu"}
          </button>
        </form>
        {message && (
          <div style={{ marginTop: 24, color: message.startsWith("✅") ? "#2e7d32" : "#d32f2f", textAlign: "center", fontWeight: 700, fontSize: 18 }}>{message}</div>
        )}
        <button
          onClick={() => navigate("/login")}
          style={{ marginTop: 32, width: "100%", padding: 16, borderRadius: 12, background: "#eee", color: "#333", border: "none", fontWeight: 600, fontSize: 18 }}
        >
          Quay lại đăng nhập
        </button>
      </div>
    </div>
  );
}
