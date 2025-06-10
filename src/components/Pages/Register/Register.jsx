import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";
import apiRegist from "../../../api/apiRegist"; // Điều chỉnh đường dẫn nếu cần
import { UserContext } from "../../../context/UserContext"; // Điều chỉnh đường dẫn nếu cần

export default function Register() {
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  // Lần đầu mount, cập nhật thông tin người dùng từ localStorage (nếu có) vào context
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    }
  }, [setUser]);

  const [formData, setFormData] = useState({
    fullName: "",
    gender: "",
    email: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    phone: "",
    address: "",
    acceptTerms: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      await apiRegist.register(formData);
      alert("Registration successful!");
      navigate("/");
    } catch (error) {
      if (error.response && error.response.data) {
        const message =
          typeof error.response.data === "string"
            ? error.response.data
            : error.response.data.message || "Đăng ký thất bại.";
        alert("❌ " + message);
      } else {
        alert("❌ Không thể kết nối đến máy chủ.");
      }
    }
  };

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

        <form className="register-form form-fade-slide" onSubmit={handleSubmit}>
          <h2>ĐĂNG KÝ</h2>

          <label htmlFor="fullName">Họ và tên:</label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            value={formData.fullName}
            onChange={handleChange}
            required
            placeholder="Nhập họ và tên"
          />

          <label htmlFor="gender">Giới tính:</label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
          >
            <option value="">Chọn Giới tính</option>
            <option value="MALE">Nam</option>
            <option value="FEMALE">Nữ</option>
          </select>

          <label htmlFor="dateOfBirth">Ngày tháng năm sinh:</label>
          <input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={handleChange}
            required
          />

          <label htmlFor="email">Email:</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="abc@gmail.com"
            required
          />

          <label htmlFor="password">Mật khẩu:</label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Nhập mật khẩu"
          />

          <label htmlFor="confirmPassword">Xác nhận mật khẩu:</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            placeholder="Nhập lại mật khẩu"
          />

          <label htmlFor="phone">SĐT:</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            required
            placeholder="Nhập số điện thoại"
          />

          <label htmlFor="address">Địa chỉ:</label>
          <input
            id="address"
            name="address"
            type="text"
            value={formData.address}
            onChange={handleChange}
            required
            placeholder="Nhập địa chỉ"
          />

          <div className="checkbox-group">
            <input
              id="acceptTerms"
              name="acceptTerms"
              type="checkbox"
              checked={formData.acceptTerms}
              onChange={handleChange}
              required
            />
            <label htmlFor="acceptTerms">
              Tôi chấp nhận Điều khoản sử dụng và Chính sách bảo mật.
            </label>
          </div>

          <button type="submit" className="btn-register">
            ĐĂNG KÝ
          </button>

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
