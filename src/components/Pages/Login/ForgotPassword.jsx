// ForgotPassword.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ForgotPassword.css";
export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Gọi API backend gửi mail reset mật khẩu
      await axios.post("http://localhost:5000/api/auth/forgot-password", { email });
      setMessage("✅ Yêu cầu đã được gửi. Vui lòng kiểm tra email.");
    } catch (error) {
      setMessage("❌ Email không tồn tại hoặc lỗi máy chủ.");
    }
  };

  return (
    <div className="forgot-password-page">
      <h2>Quên mật khẩu</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Nhập email của bạn"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Gửi yêu cầu</button>
      </form>
      {message && <p>{message}</p>}
      <button onClick={() => navigate("/login")}>Quay lại đăng nhập</button>
    </div>
  );
}
