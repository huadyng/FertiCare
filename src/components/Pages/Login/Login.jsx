import React, { useState, useEffect, useContext } from "react";
import "./Login.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../../context/UserContext";
import { decodeGoogleToken } from "../../../helpers/decodeGoogleToken";
import apiLogin from "../../../api/apiLogin";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const clientId =
    "298912881431-a0l5ibtfk8jd44eh51b3f4vre3gr4pu3.apps.googleusercontent.com";
  const { login, getDashboardPath } = useContext(UserContext);
  const navigate = useNavigate();

  // ✅ Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!email.trim()) return "Email không được bỏ trống.";
    if (!emailRegex.test(email)) return "Email không đúng định dạng.";
    return "";
  };

  const validatePassword = (password) => {
    if (!password) return "Mật khẩu không được bỏ trống.";
    if (password.length < 8) return "Mật khẩu phải có ít nhất 8 ký tự.";
    return "";
  };

  // ✅ Handle form changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;

    setFormData((prev) => ({ ...prev, [name]: val }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setMessage("");
  };

  // ✅ Handle blur validation
  const handleBlur = (e) => {
    const { name, value } = e.target;
    let error = "";

    if (name === "email") {
      error = validateEmail(value);
    } else if (name === "password") {
      error = validatePassword(value);
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  // ✅ Regular login with improved error handling
  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    // Validate form
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    if (emailError || passwordError) {
      setErrors({
        email: emailError,
        password: passwordError,
      });
      setLoading(false);
      return;
    }

    // ✅ Log dữ liệu gửi lên
    console.log("🔐 Đăng nhập với:", { email: formData.email });

    try {
      const userData = await apiLogin.login(formData.email, formData.password);
      console.log("✅ Đăng nhập thành công:", userData);

      await login(userData);

      // ✅ Redirect theo role
      const dashboardPath = getDashboardPath();
      navigate(dashboardPath || "/");
    } catch (error) {
      console.error("❌ Lỗi đăng nhập:", error);

      let errorMsg = "❌ Đăng nhập thất bại.";

      if (error.response) {
        const { status, data } = error.response;
        console.error("❗Lỗi từ server:", data);
        console.error("📄 Status code:", status);

        switch (status) {
          case 403:
            errorMsg =
              "❌ Email của bạn chưa được xác thực. Vui lòng kiểm tra hộp thư để kích hoạt tài khoản.";
            break;
          case 401:
            errorMsg = "❌ Email hoặc mật khẩu không đúng.";
            break;
          case 423:
            errorMsg =
              "❌ Tài khoản của bạn đã bị khóa. Vui lòng liên hệ admin.";
            break;
          case 400:
            errorMsg = "❌ Thông tin đăng nhập không hợp lệ.";
            break;
          case 500:
            errorMsg = "❌ Lỗi server. Vui lòng thử lại sau ít phút.";
            break;
          default:
            errorMsg = data?.message || errorMsg;
        }
      } else if (error.request) {
        console.error("❌ Không nhận được phản hồi từ server:", error.request);
        errorMsg =
          "❌ Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.";
      }

      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Google login with better error handling
  const handleGoogleLoginSuccess = async (credentialResponse) => {
    setMessage("");
    setLoading(true);

    try {
      console.log("🔍 Google credential response:", credentialResponse);

      const googleUser = decodeGoogleToken(credentialResponse.credential);
      if (!googleUser) {
        throw new Error("Không thể giải mã Google token");
      }

      console.log("🔐 Google user data:", googleUser);

      const userData = await apiLogin.googleLogin({
        ...googleUser,
        credential: credentialResponse.credential,
      });

      console.log("✅ Google login thành công:", userData);

      await login(userData);

      // ✅ Redirect theo role
      const dashboardPath = getDashboardPath();
      navigate(dashboardPath || "/");
    } catch (error) {
      console.error("❌ Lỗi Google login:", error);

      let errorMsg = "❌ Đăng nhập Google thất bại.";

      if (error.response) {
        const { status, data } = error.response;
        console.error("❗Lỗi Google login từ server:", data);

        switch (status) {
          case 400:
            errorMsg = "❌ Token Google không hợp lệ.";
            break;
          case 403:
            errorMsg = "❌ Tài khoản Google chưa được đăng ký trong hệ thống.";
            break;
          case 500:
            errorMsg = "❌ Lỗi server trong quá trình xác thực Google.";
            break;
          default:
            errorMsg = data?.message || errorMsg;
        }
      } else if (error.request) {
        errorMsg = "❌ Không thể kết nối đến server để xác thực Google.";
      } else {
        errorMsg =
          "❌ Có lỗi xảy ra trong quá trình đăng nhập Google: " + error.message;
      }

      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginError = () => {
    console.log("❌ Google Login Failed");
    setMessage("❌ Đăng nhập Google thất bại. Vui lòng thử lại.");
  };

  useEffect(() => {
    console.log("🌐 Current origin:", window.location.origin);
    console.log("🔑 Google Client ID:", clientId);
  }, []);

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="login-page">
        <div className="login-container">
          <form
            className="login-form form-fade-slide"
            onSubmit={handleLogin}
            noValidate
          >
            <h2>ĐĂNG NHẬP</h2>

            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                autoComplete="email"
                className={errors.email ? "input-error" : ""}
              />
              {errors.email && <p className="field-error">{errors.email}</p>}
            </div>

            <div className="form-group">
              <input
                type="password"
                name="password"
                placeholder="Mật khẩu"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                autoComplete="current-password"
                className={errors.password ? "input-error" : ""}
              />
              {errors.password && (
                <p className="field-error">{errors.password}</p>
              )}
            </div>

            <div className="login-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <span>Ghi nhớ đăng nhập</span>
              </label>
              <button
                type="button"
                className="forgot-btn"
                onClick={() => navigate("/forgot-password")}
              >
                Quên mật khẩu?
              </button>
            </div>

            <button
              type="submit"
              className="btn-login"
              disabled={loading}
              style={loading ? { opacity: 0.7, pointerEvents: "none" } : {}}
            >
              {loading ? "Đang đăng nhập..." : "ĐĂNG NHẬP"}
            </button>

            {message && (
              <div
                className={
                  message.startsWith("✅") ? "server-success" : "server-error"
                }
                style={{ marginTop: 10 }}
              >
                {message}
                {message.includes("chưa được xác thực") && (
                  <div style={{ marginTop: 10, fontSize: "0.9em" }}>
                    <span
                      onClick={() => navigate("/verify-email")}
                      className="link-style"
                      style={{
                        color: "#007bff",
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                    >
                      📧 Gửi lại email xác thực
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="google-login">
              <p>Hoặc đăng nhập với Google</p>
              <GoogleLogin
                onSuccess={handleGoogleLoginSuccess}
                onError={handleGoogleLoginError}
                disabled={loading}
              />
            </div>

            <p className="register-text">
              Bạn chưa có tài khoản?{" "}
              <span
                onClick={() => navigate("/register")}
                className="register-link"
              >
                Đăng ký ngay
              </span>
            </p>
          </form>

          <div className="login-image-container">
            <img
              src="/src/assets/img/login.jpg"
              alt="Fertility Support"
              className="login-image"
            />
            <div className="login-quote">
              "Hãy để chúng tôi đồng hành cùng bạn trên hành trình tìm kiếm hạnh
              phúc."
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
