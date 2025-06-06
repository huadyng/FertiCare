import React, { useState } from "react";
import axios from "axios";
import "./Login.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

export default function Login({ visible, onClose, onRegisterClick }) {
  const [taikhoan, setTaikhoan] = useState("");
  const [matkhau, setMatkhau] = useState("");
  const [message, setMessage] = useState("");

  const clientId =
    "298912881431-a0l5ibtfk8jd44eh51b3f4vre3gr4pu3.apps.googleusercontent.com";

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
        console.log("Đăng nhập thành công");
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setMessage("❌ Đăng nhập thất bại. Tài khoản hoặc mật khẩu sai.");
      }
    } catch (error) {
      setMessage("❌ Lỗi khi kết nối đến máy chủ.");
    }
  };

  const handleGoogleLoginSuccess = (credentialResponse) => {
    console.log("Google login success:", credentialResponse.credential);
    onClose();
  };

  const handleGoogleLoginError = () => {
    setMessage("❌ Đăng nhập Google thất bại.");
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className={`login ${visible ? "visible" : ""}`}>
        <div className="wrapper">
          <form className="action" onSubmit={handleLogin}>
            <button
              type="button"
              onClick={onClose}
              style={{
                float: "right",
                border: "none",
                background: "transparent",
                fontSize: "18px",
                cursor: "pointer",
              }}
              aria-label="Close login modal"
            >
              ❌
            </button>
            <h1>Login</h1>

            <div className="input-box">
              <input
                type="text"
                placeholder="Username/Email"
                required
                value={taikhoan}
                onChange={(e) => setTaikhoan(e.target.value)}
              />
            </div>

            <div className="input-box">
              <input
                type="password"
                placeholder="Password"
                required
                value={matkhau}
                onChange={(e) => setMatkhau(e.target.value)}
              />
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

            <div style={{ textAlign: "center", margin: "20px 0" }}>
              <p>Hoặc đăng nhập với Google</p>
              <GoogleLogin
                onSuccess={handleGoogleLoginSuccess}
                onError={handleGoogleLoginError}
              />
            </div>

            <div className="register-link">
              <p>
                Bạn chưa có tài khoản?
                <span
                  onClick={onRegisterClick}
                  style={{
                    cursor: "pointer",
                    color: "#c2185b",
                    fontWeight: "600",
                  }}
                >
                  Đăng ký
                </span>
              </p>
            </div>
          </form>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
