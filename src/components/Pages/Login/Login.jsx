import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import "./Login.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../../context/UserContext";
import { decodeGoogleToken } from "../../../helpers/decodeGoogleToken";
import apiLogin from "../../../api/apiLogin";
export default function Login({ setIsLoggedIn }) {
  const [taikhoan, setTaikhoan] = useState("");
  const [matkhau, setMatkhau] = useState("");
  const [message, setMessage] = useState("");

  const clientId =
    "298912881431-a0l5ibtfk8jd44eh51b3f4vre3gr4pu3.apps.googleusercontent.com";
  const { setUser, loginWithGoogle } = useContext(UserContext); //Lấy hàm setUser từ Context
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const user = await apiLogin(taikhoan, matkhau); //Gọi API để đăng nhập từ apiLogin.js
      console.log("✅ Đăng nhập thành công", user);
      setMessage("✅ Đăng nhập thành công!");
      //Lưu thông tin người dùng vào UserStorage
      localStorage.setItem("user", JSON.stringify(user));
      setIsLoggedIn(true);
      //Cập nhật tráng thái toàn ứng dụng
      setUser(user);
      if (user) {
        console.log("Đăng nhập thành công");
        // Redirect sau khi login thành công
        navigate("/");
      } else {
        setMessage("❌ Đăng nhập thất bại. Tài khoản hoặc mật khẩu sai.");
      }
    } catch (error) {
      console.error("🔥 Lỗi khi login:", error);

      if (error.response && error.response.data) {
        console.log("📦 JSON trả về:", error.response.data);
        const errorData = error.response.data;

        // Nếu errorData.message là chuỗi thì dùng, không thì stringify toàn bộ
        const msg =
          typeof errorData.message === "string"
            ? errorData.message
            : JSON.stringify(errorData);

        setMessage(`❌ ${msg}`);
      } else if (error.request) {
        console.log("📡 Không có phản hồi từ server");
        setMessage("❌ Không thể kết nối đến máy chủ.");
      } else {
        console.log("🚨 Lỗi không xác định:", error.message);
        setMessage("❌ Đã xảy ra lỗi không xác định.");
      }
    }
  };

  const handleGoogleLoginSuccess = (credentialResponse) => {
    console.log("Google login success:", credentialResponse.credential);
    //Sử dụng helper để giải mã token
    const user = decodeGoogleToken(credentialResponse.credential);
    if (user) {
      loginWithGoogle(user);
      setIsLoggedIn(true);
      navigate("/");
    } else {
      console.error("Lỗi khi lấy thông tin người dùng từ Google");
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
      <div className="login fullpage">
        <div className="wrapper">
          <form className="action" onSubmit={handleLogin}>
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

            {typeof message === "string" && message && (
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
                Bạn chưa có tài khoản?{" "}
                <span
                  onClick={() => navigate("/register")}
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
