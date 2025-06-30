//
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";
import apiRegist from "../../../api/apiRegist";
import { UserContext } from "../../../context/UserContext";
import registerImage from "../../../assets/img/register.jpg";

// Regex lấy từ backend
const emailRegex = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const phoneRegex = /^(\+84|0)[3-9]\d{8}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
const fullNameRegex = /^[a-zA-ZÀ-ỹĐđ\s]{2,50}$/;

const INIT_DATA = {
  fullName: "",
  gender: "",
  email: "",
  password: "",
  confirmPassword: "",
  dateOfBirth: "",
  phone: "",
  address: "",
  acceptTerms: false,
};

export default function Register() {
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setUser(storedUser);
  }, [setUser]);

  const [formData, setFormData] = useState(INIT_DATA);
  const [errors, setErrors] = useState({});
  const [serverMessage, setServerMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  function validateField(name, value) {
    switch (name) {
      case "fullName":
        if (!value.trim()) return "Họ tên không được bỏ trống.";
        if (!fullNameRegex.test(value))
          return "Họ tên chỉ chứa chữ cái, khoảng trắng và dài 2-50 ký tự.";
        break;
      case "gender":
        if (!value) return "Vui lòng chọn giới tính.";
        break;
      case "dateOfBirth":
        if (!value) return "Vui lòng chọn ngày sinh.";
        break;
      case "email":
        if (!value.trim()) return "Email không được bỏ trống.";
        if (!emailRegex.test(value)) return "Email không đúng định dạng.";
        break;
      case "password":
        if (!value) return "Mật khẩu không được bỏ trống.";
        if (!passwordRegex.test(value))
          return "Mật khẩu từ 8 ký tự, có chữ hoa, chữ thường, số";
        break;
      case "confirmPassword":
        if (!value) return "Vui lòng xác nhận mật khẩu.";
        if (value !== formData.password) return "Xác nhận mật khẩu không khớp.";
        break;
      case "phone":
        if (!value.trim()) return "Số điện thoại không được bỏ trống.";
        if (!phoneRegex.test(value))
          return "Số điện thoại hợp lệ (bắt đầu +84 hoặc 0, đầu số 3-9, 10 số).";
        break;
      case "address":
        if (!value.trim()) return "Địa chỉ không được bỏ trống.";
        break;
      case "acceptTerms":
        if (!value) return "Bạn cần chấp nhận điều khoản!";
        break;
      default:
        break;
    }
    return "";
  }

  const validateForm = (data) => {
    const errs = {};
    Object.keys(data).forEach((key) => {
      const err = validateField(key, data[key]);
      if (err) errs[key] = err;
    });
    return errs;
  };

  // Auto-validate when values change after first submit
  useEffect(() => {
    if (submitted) {
      const newErrors = validateForm(formData);
      setErrors(newErrors);
    }
  }, [formData, submitted]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
    if (touched[name] || submitted) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, val),
      }));
    }
    setServerMessage("");
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, formData[name]),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerMessage("");
    setSubmitted(true);

    setTouched(
      Object.keys(formData).reduce((acc, k) => ({ ...acc, [k]: true }), {})
    );
    const err = validateForm(formData);
    setErrors(err);

    if (Object.keys(err).length > 0) {
      const firstErr = Object.keys(err)[0];
      const el = document.querySelector(`[name='${firstErr}']`);
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setLoading(true);
    const { confirmPassword, acceptTerms, ...dataToSend } = formData;

    // ✅ Log dữ liệu gửi lên
    console.log("📤 Payload gửi lên server:", dataToSend);

    try {
      const response = await apiRegist.register(dataToSend);
      console.log("✅ Phản hồi thành công:", response.data);

      setServerMessage(
        "🎉 Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản."
      );
      setFormData(INIT_DATA);
      setTouched({});
      setSubmitted(false);

      setTimeout(() => {
        setServerMessage(
          "📧 Email xác thực đã được gửi! Vui lòng kiểm tra hộp thư (kể cả thư spam). Nhấn vào liên kết trong email để kích hoạt tài khoản."
        );
      }, 3000);
    } catch (error) {
      let msg = "❌ Đăng ký thất bại.";

      // ✅ Ghi log chi tiết lỗi
      if (error.response) {
        console.error("❗Lỗi từ server:", error.response.data);
        console.error("📄 Status code:", error.response.status);

        const errorData = error.response.data;
        msg =
          typeof errorData === "string" ? errorData : errorData.message || msg;

        if (error.response.status === 409) {
          msg =
            "❌ Email này đã được đăng ký. Vui lòng sử dụng email khác hoặc đăng nhập.";
        } else if (error.response.status === 400) {
          msg = "❌ Thông tin đăng ký không hợp lệ. Vui lòng kiểm tra lại.";
        } else if (error.response.status === 500) {
          msg = "❌ Lỗi server. Vui lòng thử lại sau ít phút.";
        }
      } else if (error.request) {
        console.error("❌ Không nhận được phản hồi từ server:", error.request);
        msg =
          "❌ Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.";
      } else {
        console.error("❌ Lỗi không xác định:", error.message);
      }

      setServerMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-left">
          <img
            src={registerImage}
            alt="Đăng ký tài khoản FertiCare"
            className="register-image"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextElementSibling.style.display = "flex";
            }}
          />
          <div
            className="register-fallback"
            style={{
              display: "none",
              width: "100%",
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
              background:
                "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
            }}
          >
            <svg
              viewBox="0 0 400 300"
              style={{ width: "100%", height: "100%", maxWidth: "400px" }}
            >
              <rect width="400" height="300" fill="transparent" />
              <circle cx="200" cy="120" r="40" fill="rgba(255,255,255,0.2)" />
              <path
                d="M160 120 L200 80 L240 120 L200 160 Z"
                fill="rgba(255,255,255,0.3)"
              />
              <text
                x="200"
                y="200"
                textAnchor="middle"
                fill="white"
                fontSize="24"
                fontWeight="600"
              >
                FertiCare
              </text>
              <text
                x="200"
                y="225"
                textAnchor="middle"
                fill="rgba(255,255,255,0.8)"
                fontSize="16"
              >
                Đăng ký tài khoản
              </text>
            </svg>
          </div>
          <div className="register-quote">
            "Hành trình nào cũng xứng đáng với những yêu thương và chờ đợi."
          </div>
        </div>
        <form
          className="register-form form-fade-slide"
          onSubmit={handleSubmit}
          noValidate
        >
          <h2>ĐĂNG KÝ</h2>

          {submitted && Object.keys(errors).length > 0 && (
            <div className="validation-summary">
              <h3>Vui lòng sửa các lỗi sau:</h3>
              <ul>
                {Object.entries(errors).map(([field, message]) => (
                  <li
                    key={field}
                    onClick={() =>
                      document.querySelector(`[name='${field}']`).focus()
                    }
                  >
                    {message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <label htmlFor="fullName">Họ và tên:</label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            value={formData.fullName}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Nhập họ và tên đầy đủ (2-50 ký tự)"
            required
            autoComplete="off"
            autoFocus
            className={
              errors.fullName && (touched.fullName || submitted) ? "error" : ""
            }
          />
          {errors.fullName && (touched.fullName || submitted) && (
            <p className="field-error">{errors.fullName}</p>
          )}

          <label htmlFor="gender">Giới tính:</label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            className={
              errors.gender && (touched.gender || submitted) ? "error" : ""
            }
          >
            <option value="">Chọn Giới tính</option>
            <option value="MALE">Nam</option>
            <option value="FEMALE">Nữ</option>
          </select>
          {errors.gender && (touched.gender || submitted) && (
            <p className="field-error">{errors.gender}</p>
          )}

          <label htmlFor="dateOfBirth">Ngày tháng năm sinh:</label>
          <input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            max={new Date().toISOString().split("T")[0]}
            className={
              errors.dateOfBirth && (touched.dateOfBirth || submitted)
                ? "error"
                : ""
            }
          />
          {errors.dateOfBirth && (touched.dateOfBirth || submitted) && (
            <p className="field-error">{errors.dateOfBirth}</p>
          )}

          <label htmlFor="email">Email:</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="abc@gmail.com"
            required
            autoComplete="off"
            className={
              errors.email && (touched.email || submitted) ? "error" : ""
            }
          />
          {errors.email && (touched.email || submitted) && (
            <p className="field-error">{errors.email}</p>
          )}

          <label htmlFor="password">Mật khẩu:</label>
          <div className="input-container">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              placeholder="Ít nhất 8 ký tự, có chữ hoa, chữ thường, số"
              autoComplete="new-password"
              className={
                errors.password && (touched.password || submitted)
                  ? "error"
                  : ""
              }
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex="-1"
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPassword ? (
                <svg
                  className="eye-icon eye-closed"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              ) : (
                <svg
                  className="eye-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              )}
            </button>
          </div>
          {!errors.password && !touched.password && !submitted && (
            <div className="input-note">
              <strong>Yêu cầu mật khẩu:</strong> Ít nhất 8 ký tự, bao gồm chữ
              hoa, chữ thường, số
            </div>
          )}
          {errors.password && (touched.password || submitted) && (
            <p className="field-error">{errors.password}</p>
          )}

          <label htmlFor="confirmPassword">Xác nhận mật khẩu:</label>
          <div className="input-container">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              placeholder="Nhập lại mật khẩu"
              autoComplete="new-password"
              className={
                errors.confirmPassword && (touched.confirmPassword || submitted)
                  ? "error"
                  : ""
              }
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              tabIndex="-1"
              aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showConfirmPassword ? (
                <svg
                  className="eye-icon eye-closed"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              ) : (
                <svg
                  className="eye-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              )}
            </button>
          </div>
          {errors.confirmPassword && (touched.confirmPassword || submitted) && (
            <p className="field-error">{errors.confirmPassword}</p>
          )}

          <label htmlFor="phone">SĐT:</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            placeholder="Nhập số điện thoại"
            className={
              errors.phone && (touched.phone || submitted) ? "error" : ""
            }
          />
          {errors.phone && (touched.phone || submitted) && (
            <p className="field-error">{errors.phone}</p>
          )}

          <label htmlFor="address">Địa chỉ:</label>
          <input
            id="address"
            name="address"
            type="text"
            value={formData.address}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            placeholder="Nhập địa chỉ"
            className={
              errors.address && (touched.address || submitted) ? "error" : ""
            }
          />
          {errors.address && (touched.address || submitted) && (
            <p className="field-error">{errors.address}</p>
          )}

          <div
            className={`checkbox-group ${
              errors.acceptTerms && (touched.acceptTerms || submitted)
                ? "error"
                : ""
            }`}
          >
            <input
              id="acceptTerms"
              name="acceptTerms"
              type="checkbox"
              checked={formData.acceptTerms}
              onChange={handleChange}
              onBlur={handleBlur}
              required
            />
            <label htmlFor="acceptTerms">
              Tôi chấp nhận Điều khoản sử dụng và Chính sách bảo mật.
            </label>
          </div>
          {errors.acceptTerms && (touched.acceptTerms || submitted) && (
            <p className="field-error">{errors.acceptTerms}</p>
          )}

          <button type="submit" className="btn-register" disabled={loading}>
            {loading && <div className="loading-spinner"></div>}
            {loading ? "Đang xử lý..." : "ĐĂNG KÝ"}
          </button>

          {serverMessage && (
            <div
              className={
                serverMessage.startsWith("🎉") || serverMessage.startsWith("📧")
                  ? "server-success"
                  : "server-error"
              }
              style={{ marginTop: 10 }}
            >
              {serverMessage}
              {(serverMessage.startsWith("🎉") ||
                serverMessage.startsWith("📧")) && (
                <div style={{ marginTop: 15 }}>
                  <button
                    type="button"
                    className="btn-login-redirect"
                    onClick={() => navigate("/login")}
                  >
                    ➡️ Chuyển đến trang đăng nhập
                  </button>
                </div>
              )}
            </div>
          )}

          <p className="login-text">
            Bạn đã có tài khoản?{" "}
            <span onClick={() => navigate("/login")} className="login-link">
              Đăng nhập
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}
