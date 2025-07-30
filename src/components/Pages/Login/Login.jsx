import React, { useState, useEffect, useContext } from "react";
import "./Login.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();

  // ✅ Helper function to calculate dashboard path directly (avoiding timing issues)
  const calculateDashboardPath = (userData) => {
    const USER_ROLES = {
      ADMIN: "ADMIN",
      MANAGER: "MANAGER",
      DOCTOR: "DOCTOR",
      PATIENT: "PATIENT",
      CUSTOMER: "CUSTOMER",
    };

    const ROLE_MAPPING = {
      ADMIN: USER_ROLES.ADMIN,
      MANAGER: USER_ROLES.MANAGER,
      DOCTOR: USER_ROLES.DOCTOR,
      PATIENT: USER_ROLES.PATIENT,
      CUSTOMER: USER_ROLES.CUSTOMER,
      Admin: USER_ROLES.ADMIN,
      Manager: USER_ROLES.MANAGER,
      Doctor: USER_ROLES.DOCTOR,
      Patient: USER_ROLES.PATIENT,
      Customer: USER_ROLES.CUSTOMER,
      admin: USER_ROLES.ADMIN,
      manager: USER_ROLES.MANAGER,
      doctor: USER_ROLES.DOCTOR,
      patient: USER_ROLES.PATIENT,
      customer: USER_ROLES.CUSTOMER,
    };

    // Auto-detect doctor role for test accounts
    let finalRole = userData.role;
    if (!finalRole && userData.email) {
      const doctorEmails = [
        "doctor.test@ferticare.com",
        "doctor.ivf@ferticare.com",
        "doctor.iui@ferticare.com",
        "doctor.ob@ferticare.com",
      ];

      if (
        doctorEmails.includes(userData.email) ||
        userData.fullName?.includes("BS.") ||
        userData.fullName?.includes("Dr.") ||
        userData.email?.includes("doctor.")
      ) {
        finalRole = "DOCTOR";
      }
    }

    const mappedRole = ROLE_MAPPING[finalRole] || USER_ROLES.CUSTOMER;

    switch (mappedRole.toUpperCase()) {
      case USER_ROLES.ADMIN:
        return "/admin/dashboard";
      case USER_ROLES.MANAGER:
        return "/manager/dashboard";
      case USER_ROLES.DOCTOR:
        return "/doctor-dashboard";
      case USER_ROLES.PATIENT:
        return "/patient/dashboard";
      case USER_ROLES.CUSTOMER:
      default:
        return "/";
    }
  };

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

    // Chỉ log khi debug mode
    if (process.env.NODE_ENV === 'development' && false) { // Tắt log
      console.log("🔐 Đăng nhập với:", { email: formData.email });
    }

    try {
      const userData = await apiLogin.login(formData.email, formData.password);
      
      // Chỉ log khi debug mode
      if (process.env.NODE_ENV === 'development' && false) { // Tắt log
        console.log("✅ Đăng nhập thành công:", userData);
        console.log("👤 Role từ backend:", userData.role);
      }

      // ✅ Calculate dashboard path directly to avoid timing issues with UserContext
      const dashboardPath = calculateDashboardPath(userData);

      // Chỉ log khi debug mode
      if (process.env.NODE_ENV === 'development' && false) { // Tắt log
        console.log("🎯 Calculated dashboard path:", dashboardPath);
      }

      // ✅ Gọi login trước để cập nhật context
      await login(userData);
      
      // ✅ Redirect ngay lập tức khi thành công
      navigate(dashboardPath, { replace: true });
    } catch (error) {
      // Chỉ log lỗi khi debug mode
      if (process.env.NODE_ENV === 'development' && false) {
        console.error("❌ Lỗi đăng nhập:", error);
      }

      let errorMsg = "❌ Đăng nhập thất bại.";

      if (error.response) {
        const { status, data } = error.response;
        
        // Chỉ log khi debug mode
        if (process.env.NODE_ENV === 'development' && false) {
          console.error("❗Lỗi từ server:", data);
          console.error("📄 Status code:", status);
        }

        switch (status) {
          case 403:
            errorMsg = "❌ Email của bạn chưa được xác thực. Vui lòng kiểm tra hộp thư.";
            break;
          case 401:
            errorMsg = "❌ Email hoặc mật khẩu không đúng.";
            break;
          case 423:
            errorMsg = "❌ Tài khoản đã bị khóa. Vui lòng liên hệ admin.";
            break;
          case 400:
            errorMsg = "❌ Thông tin đăng nhập không hợp lệ.";
            break;
          case 500:
            errorMsg = "❌ Lỗi server. Vui lòng thử lại sau.";
            break;
          default:
            errorMsg = data?.message || "❌ Đăng nhập thất bại.";
        }
      } else if (error.request) {
        // Chỉ log khi debug mode
        if (process.env.NODE_ENV === 'development' && false) {
          console.error("❌ Không nhận được phản hồi từ server:", error.request);
        }
        errorMsg = "❌ Không thể kết nối server. Vui lòng kiểm tra mạng.";
      } else {
        errorMsg = "❌ Có lỗi xảy ra. Vui lòng thử lại.";
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

      // ✅ Calculate dashboard path directly to avoid timing issues with UserContext
      const dashboardPath = calculateDashboardPath(userData);

      console.log("🎯 Google login dashboard path:", dashboardPath);

      // ✅ Redirect ngay lập tức trước khi gọi login để tránh delay
      navigate(dashboardPath, { replace: true });

      // ✅ Sau đó mới gọi login để cập nhật context
      await login(userData);
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

  // Debug function để test role mapping
  const testRoleMapping = () => {
    const testRoles = ["doctor", "DOCTOR", "physician", "PHYSICIAN"];
    testRoles.forEach((role) => {
      console.log(`Test role "${role}":`, getDashboardPath());
    });
  };

  const handleGoogleLoginError = () => {
    console.log("❌ Google Login Failed");
    setMessage("❌ Đăng nhập Google thất bại. Vui lòng thử lại hoặc sử dụng đăng nhập thường.");
  };

  // 🆕 Handle Google Sign-In configuration error
  useEffect(() => {
    // Check if Google Sign-In is properly configured
    const checkGoogleSignInConfig = () => {
      const currentOrigin = window.location.origin;
      console.log("🔍 [Login] Current origin:", currentOrigin);
      console.log("🔑 [Login] Google Client ID:", clientId);
      
      // Show warning if not localhost
      if (!currentOrigin.includes('localhost') && !currentOrigin.includes('127.0.0.1')) {
        console.warn("⚠️ [Login] Google Sign-In may not work on this domain:", currentOrigin);
      }
    };
    
    checkGoogleSignInConfig();
  }, []);

  useEffect(() => {
    // Bỏ log để tránh spam
    // console.log("🌐 Current origin:", window.location.origin);
    // console.log("🔑 Google Client ID:", clientId);
  }, []);

  // ✅ Handle messages from Register page (email verification success)
  useEffect(() => {
    if (location.state?.message) {
      // ✅ Special handling for email verification success
      if (location.state?.emailVerified) {
        setMessage("EMAIL_VERIFIED:" + location.state.message);
      } else {
        setMessage("✅ " + location.state.message);
      }

      // Pre-fill email if provided
      if (location.state.email || location.state.userEmail) {
        setFormData((prev) => ({
          ...prev,
          email: location.state.email || location.state.userEmail,
        }));
      }

      // Clear the state to avoid showing message on page refresh
      window.history.replaceState({}, "", location.pathname);
    }
  }, [location.state]);

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

            {/* ✅ Email verification success banner */}
            {message.startsWith("EMAIL_VERIFIED:") && (
              <div
                style={{
                  background: "linear-gradient(135deg, #28a745, #20c997)",
                  color: "white",
                  padding: "20px",
                  borderRadius: "12px",
                  textAlign: "center",
                  marginBottom: "25px",
                  boxShadow: "0 4px 15px rgba(40, 167, 69, 0.3)",
                  animation: "slideInFromTop 0.5s ease-out",
                }}
              >
                <div style={{ fontSize: "40px", marginBottom: "10px" }}>✅</div>
                <h3
                  style={{
                    margin: "0 0 10px 0",
                    fontSize: "18px",
                    fontWeight: "600",
                  }}
                >
                  Email Xác Thực Thành Công!
                </h3>
                <p
                  style={{
                    margin: "0 0 10px 0",
                    fontSize: "14px",
                    lineHeight: "1.4",
                  }}
                >
                  {message.replace("EMAIL_VERIFIED:", "")}
                </p>
                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.2)",
                    borderRadius: "6px",
                    padding: "8px 12px",
                    fontSize: "13px",
                    fontWeight: "500",
                  }}
                >
                  💡 Email đã được điền sẵn, chỉ cần nhập mật khẩu để đăng nhập
                </div>
              </div>
            )}

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

            {message && !message.startsWith("EMAIL_VERIFIED:") && (
              <div
                className={
                  message.startsWith("✅") ? "server-success" : "server-error"
                }
                style={{ 
                  marginTop: 10,
                  padding: "12px 16px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  textAlign: "center",
                  background: message.startsWith("✅") ? "#f6ffed" : "#fff2f0",
                  border: message.startsWith("✅") ? "1px solid #b7eb8f" : "1px solid #ffccc7",
                  color: message.startsWith("✅") ? "#52c41a" : "#ff4d4f"
                }}
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

      {/* ✅ CSS Animations for email verification success banner */}
      <style>{`
        @keyframes slideInFromTop {
          0% {
            opacity: 0;
            transform: translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* ✅ Ẩn thông báo lỗi token từ antd */
        .ant-message-notice {
          display: none !important;
        }
        
        /* ✅ Ẩn thông báo lỗi network */
        .ant-message-error {
          display: none !important;
        }
      `}</style>
    </GoogleOAuthProvider>
  );
}
