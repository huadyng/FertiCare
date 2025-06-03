import React, { useState } from "react";
import axios from "axios";
import "./Login.css";

export default function Login() {
  const [taikhoan, setTaikhoan] = useState("");
  const [matkhau, setMatkhau] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.get(
        "https://6836811f664e72d28e4105f7.mockapi.io/api/users"
      );
      const users = response.data;

      const user = users.find(
        (u) => u.email === taikhoan && u.password === matkhau
      );

      if (user) {
        setMessage(`✅ Chào bạn, đăng nhập thành công!`);
      } else {
        setMessage("❌ Đăng nhập thất bại. Tài khoản hoặc mật khẩu sai.");
      }
    } catch (error) {
      setMessage("❌ Lỗi khi kết nối đến máy chủ.");
    }
  };

  return (
    <div className="login">
      <div className="wrapper">
        <form className="action" onSubmit={handleLogin}>
          <h1>Login</h1>

          <div className="input-box">
            <input
              type="text"
              placeholder="Username"
              required
              value={taikhoan}
              onChange={(e) => setTaikhoan(e.target.value)}
            />
            <i className="bx bxs-user"></i>
          </div>

          <div className="input-box">
            <input
              type="password"
              placeholder="Password"
              required
              value={matkhau}
              onChange={(e) => setMatkhau(e.target.value)}
            />
            <i className="bx bxs-lock-alt"></i>
          </div>

          <div className="remember-forgot">
            <label>
              <input type="checkbox" /> Remember me
            </label>
            <a href="#">Forgot password?</a>
          </div>

          <button type="submit" className="btn">
            Login
          </button>

          {message && (
            <p style={{ marginTop: "10px", color: "#f00" }}>{message}</p>
          )}

          <div className="register-link">
            <p>
              Don't have an account? <a href="#">Register</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
