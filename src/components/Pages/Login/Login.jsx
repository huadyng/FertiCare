import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import "./Login.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../../context/UserContext";
import { decodeGoogleToken } from "../../../helpers/decodeGoogleToken";
import apiLogin from "../../../api/apiLogin";

export default function Login() {
  const [taikhoan, setTaikhoan] = useState("");
  const [matkhau, setMatkhau] = useState("");
  const [message, setMessage] = useState("");
  const [emailForgot, setEmailForgot] = useState("");

  const clientId =
    "298912881431-a0l5ibtfk8jd44eh51b3f4vre3gr4pu3.apps.googleusercontent.com";
  const { setUser, login, loginWithGoogle } = useContext(UserContext);
  const navigate = useNavigate();

  // Login thường
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const user = await apiLogin(taikhoan, matkhau);
      login(user); // ✅ dùng hàm login từ context
      navigate("/");
    } catch (error) {
      setMessage("❌ Đăng nhập thất bại...");
    }
  };

  // Login Google
  const handleGoogleLoginSuccess = (credentialResponse) => {
    const user = decodeGoogleToken(credentialResponse.credential);
    if (user) {
      loginWithGoogle(user);
      navigate("/");
    } else {
      setMessage("❌ Không thể xác thực từ Google.");
    }
  };
  const handleGoogleLoginError = () => {
    setMessage("❌ Đăng nhập Google thất bại.");
  };

  useEffect(() => {
    console.log("🌐 Current origin:", window.location.origin);
    console.log("🔑 Google Client ID:", clientId);
  }, []);

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="login-page">
        <div className="login-container">
          {/* Form bên trái */}
          <form className="login-form form-fade-slide" onSubmit={handleLogin}>
            <h2>ĐĂNG NHẬP</h2>

            <input
              type="text"
              placeholder="Email hoặc Username"
              value={taikhoan}
              onChange={(e) => setTaikhoan(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Mật khẩu"
              value={matkhau}
              onChange={(e) => setMatkhau(e.target.value)}
              required
            />

            <div className="login-options">
              <label>
                <input type="checkbox" /> Ghi nhớ đăng nhập
              </label>
              <button
                type="button"
                className="forgot-btn"
                onClick={() => navigate("/forgot-password")}
              >
                Quên mật khẩu?
              </button>
            </div>

            <button type="submit" className="btn-login">
              Đăng nhập
            </button>

            {message && <p className="error-message">{message}</p>}

            <div className="google-login">
              <p>Hoặc đăng nhập với Google</p>
              <GoogleLogin
                onSuccess={handleGoogleLoginSuccess}
                onError={handleGoogleLoginError}
              />
            </div>

            <p className="register-text">
              Bạn chưa có tài khoản?{" "}
              <span
                onClick={() => navigate("/register")}
                className="register-link"
              >
                Đăng ký
              </span>
            </p>
          </form>

          {/* Ảnh bên phải */}
          <div className="login-image-container">
            <img
              src="/src/assets/img/login.jpg"
              alt="Mom & Baby"
              className="login-image"
            />
            <div className="login-quote">
              “Hãy để chúng tôi đồng hành cùng bạn.”
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
