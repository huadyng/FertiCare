import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";
import apiRegist from "../../../api/apiRegist";
import { UserContext } from "../../../context/UserContext";

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

  // --- Validation từng trường ---
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
          return "Mật khẩu từ 8 ký tự, có chữ hoa, chữ thường, số, ký tự @$!%*?&.";
        break;
      case "confirmPassword":
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

  // --- Validate toàn bộ form ---
  const validateForm = (data) => {
    const errs = {};
    Object.keys(data).forEach((key) => {
      const err = validateField(key, data[key]);
      if (err) errs[key] = err;
    });
    return errs;
  };

  // --- Xử lý khi user nhập ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));

    // validate realtime khi đã touch hoặc sau submit
    if (touched[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, val),
      }));
    }
    setServerMessage("");
  };

  // --- Đánh dấu đã focus khỏi trường để hiện lỗi realtime ---
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, formData[name]),
    }));
  };

  // --- Submit form ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerMessage("");
    setTouched(
      Object.keys(formData).reduce((acc, k) => ({ ...acc, [k]: true }), {})
    );
    const err = validateForm(formData);
    setErrors(err);

    if (Object.keys(err).length > 0) {
      // focus vào field đầu tiên bị lỗi
      const firstErr = Object.keys(err)[0];
      const el = document.querySelector(`[name='${firstErr}']`);
      el && el.focus();
      return;
    }

    setLoading(true);
    const { confirmPassword, acceptTerms, ...dataToSend } = formData;

    try {
      const response = await apiRegist.register(dataToSend);
      console.log("✅ Đăng ký thành công:", response);

      setServerMessage(
        "🎉 Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản. " +
          "Sau khi xác thực, bạn có thể đăng nhập."
      );

      // Không tự động chuyển về login ngay, để user có thời gian đọc thông báo
      setFormData(INIT_DATA);
      setTouched({});

      // Hiển thị thông báo hướng dẫn thêm
      setTimeout(() => {
        setServerMessage(
          "📧 Email xác thực đã được gửi! Vui lòng kiểm tra hộp thư (kể cả thư spam). " +
            "Nhấn vào liên kết trong email để kích hoạt tài khoản."
        );
      }, 3000);
    } catch (error) {
      console.error("❌ Lỗi đăng ký:", error);
      let msg = "❌ Đăng ký thất bại.";

      if (error.response && error.response.data) {
        const errorData = error.response.data;
        msg =
          typeof errorData === "string" ? errorData : errorData.message || msg;

        // Xử lý các lỗi cụ thể
        if (error.response.status === 409) {
          msg =
            "❌ Email này đã được đăng ký. Vui lòng sử dụng email khác hoặc đăng nhập.";
        } else if (error.response.status === 400) {
          msg = "❌ Thông tin đăng ký không hợp lệ. Vui lòng kiểm tra lại.";
        } else if (error.response.status === 500) {
          msg = "❌ Lỗi server. Vui lòng thử lại sau ít phút.";
        }
      } else if (error.request) {
        msg =
          "❌ Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.";
      }

      setServerMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  // --- Render ---
  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-left">
          <img
            src="/src/assets/img/register.jpg"
            alt="Visual"
            className="register-image"
          />
          <div className="register-quote">
            “Hành trình nào cũng xứng đáng với những yêu thương và chờ đợi.”
          </div>
        </div>
        <form
          className="register-form form-fade-slide"
          onSubmit={handleSubmit}
          noValidate
        >
          <h2>ĐĂNG KÝ</h2>

          {/* Họ tên */}
          <label htmlFor="fullName">Họ và tên:</label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            value={formData.fullName}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Nhập họ và tên"
            required
            autoComplete="off"
            className={errors.fullName && touched.fullName ? "input-error" : ""}
          />
          {errors.fullName && touched.fullName && (
            <p className="field-error">{errors.fullName}</p>
          )}

          {/* Giới tính */}
          <label htmlFor="gender">Giới tính:</label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            className={errors.gender && touched.gender ? "input-error" : ""}
          >
            <option value="">Chọn Giới tính</option>
            <option value="MALE">Nam</option>
            <option value="FEMALE">Nữ</option>
          </select>
          {errors.gender && touched.gender && (
            <p className="field-error">{errors.gender}</p>
          )}

          {/* Ngày sinh */}
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
              errors.dateOfBirth && touched.dateOfBirth ? "input-error" : ""
            }
          />
          {errors.dateOfBirth && touched.dateOfBirth && (
            <p className="field-error">{errors.dateOfBirth}</p>
          )}

          {/* Email */}
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
            className={errors.email && touched.email ? "input-error" : ""}
          />
          {errors.email && touched.email && (
            <p className="field-error">{errors.email}</p>
          )}

          {/* Password */}
          <label htmlFor="password">Mật khẩu:</label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            placeholder="Ít nhất 8 ký tự, có chữ hoa, chữ thường, số"
            autoComplete="new-password"
            className={errors.password && touched.password ? "input-error" : ""}
          />
          {errors.password && touched.password && (
            <p className="field-error">{errors.password}</p>
          )}

          {/* Confirm password */}
          <label htmlFor="confirmPassword">Xác nhận mật khẩu:</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            placeholder="Nhập lại mật khẩu"
            autoComplete="new-password"
            className={
              errors.confirmPassword && touched.confirmPassword
                ? "input-error"
                : ""
            }
          />
          {errors.confirmPassword && touched.confirmPassword && (
            <p className="field-error">{errors.confirmPassword}</p>
          )}

          {/* Phone */}
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
            className={errors.phone && touched.phone ? "input-error" : ""}
          />
          {errors.phone && touched.phone && (
            <p className="field-error">{errors.phone}</p>
          )}

          {/* Address */}
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
            className={errors.address && touched.address ? "input-error" : ""}
          />
          {errors.address && touched.address && (
            <p className="field-error">{errors.address}</p>
          )}

          {/* Điều khoản */}
          <div className="checkbox-group">
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
          {errors.acceptTerms && touched.acceptTerms && (
            <p className="field-error">{errors.acceptTerms}</p>
          )}

          {/* Nút đăng ký */}
          <button
            type="submit"
            className="btn-register"
            disabled={loading}
            style={loading ? { opacity: 0.7, pointerEvents: "none" } : {}}
          >
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
              {/* Hiện nút login nếu đăng ký thành công */}
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
