// ResetPassword.jsx

import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "./ForgotPassword.css";
// Có thể import thêm css chung cho login/register nếu cần


export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy token từ query param (?token=...)
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get("token");

  // Validate password: >=8 ký tự, có chữ hoa, chữ thường, số
  const validatePassword = (pw) => {
    if (pw.length < 8) return "Mật khẩu phải có ít nhất 8 ký tự.";
    if (!/[A-Z]/.test(pw)) return "Mật khẩu phải chứa ít nhất 1 chữ hoa.";
    if (!/[a-z]/.test(pw)) return "Mật khẩu phải chứa ít nhất 1 chữ thường.";
    if (!/[0-9]/.test(pw)) return "Mật khẩu phải chứa ít nhất 1 số.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!password || !confirmPassword) {
      setMessage("Vui lòng nhập đầy đủ mật khẩu mới.");
      return;
    }
    const pwErr = validatePassword(password);
    if (pwErr) {
      setMessage(pwErr);
      return;
    }
    if (password !== confirmPassword) {
      setMessage("Mật khẩu xác nhận không khớp.");
      return;
    }
    if (!token) {
      setMessage("Thiếu token xác thực. Vui lòng kiểm tra lại link email.");
      return;
    }
    setLoading(true);
    try {
      await axios.post("/api/notifications/reset-password", {
        token,
        newPassword: password,
      });
      setMessage("✅ Đặt lại mật khẩu thành công. Bạn sẽ được chuyển về trang đăng nhập.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setMessage(
        error?.response?.data?.message || "❌ Token không hợp lệ hoặc đã hết hạn."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #fcc6ff, #85d1fa)' }}>
      <div className="login-form" style={{ width: 380, background: '#fff', borderRadius: 20, boxShadow: '0 12px 30px rgba(255, 105, 180, 0.15)', padding: 40, margin: '40px 0' }}>
        <h2 style={{ color: '#f0619a', textAlign: 'center', fontWeight: 700, fontSize: 32, marginBottom: 30 }}>Đặt lại mật khẩu</h2>
        <form onSubmit={handleSubmit} className="form-fade-slide">
          <input
            type="password"
            placeholder="Mật khẩu mới"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ padding: 18, borderRadius: 12, border: '2px solid #fbc1cc', fontSize: 18, marginBottom: 20, width: '100%' }}
            autoFocus
          />
          <input
            type="password"
            placeholder="Xác nhận mật khẩu mới"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={{ padding: 18, borderRadius: 12, border: '2px solid #fbc1cc', fontSize: 18, marginBottom: 20, width: '100%' }}
          />
          <button
            type="submit"
            className="btn-login"
            style={{ width: '100%', padding: 18, borderRadius: 12, background: 'linear-gradient(90deg, #fb61ae, #93c5fd)', color: '#fff', fontWeight: 700, fontSize: 18, border: 'none', marginBottom: 10 }}
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
          </button>
        </form>
        {message && (
          <div style={{ marginTop: 18, color: message.startsWith("✅") ? "#2e7d32" : "#d32f2f", textAlign: "center", fontWeight: 600 }}>{message}</div>
        )}
        <button
          onClick={() => navigate("/login")}
          style={{ marginTop: 24, width: "100%", padding: 12, borderRadius: 8, background: "#eee", color: "#333", border: "none", fontWeight: 500, fontSize: 16 }}
        >
          Quay lại đăng nhập
        </button>
      </div>
    </div>
  );
}
