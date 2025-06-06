import React, { useState } from "react";
import axios from "axios";
import "./Register.css";

export default function Register({ onClose }) {
  const [formData, setFormData] = useState({
    Name: "",
    email: "",
    password: "",
    confirmPassword: "",
    dob: "",
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
      const response = await axios.post(
        "https://your-api-url.com/register",
        formData
      );
      alert("Registration successful!");
      // thêm logic nếu cần
    } catch (error) {
      alert("Registration failed.");
    }
  };

  return (
    <div className="popup-overlay" style={{ background: "none" }}>
      <div className="popup-container">
        <button type="button" onClick={onClose} className="btn-close">
          ❌
        </button>
        <div className="popup-left">
          <img
            src="/src/assets/img/mom&baby.jpg"
            alt="Visual"
            className="popup-image"
          />
        </div>

        <form className="popup-form" onSubmit={handleSubmit}>
          <h2>ĐĂNG KÝ TÀI KHOẢN</h2>

          <label htmlFor="Name">Họ và tên</label>
          <input
            id="Name"
            name="Name"
            type="text"
            value={formData.Name}
            onChange={handleChange}
            required
            placeholder="Nhập họ và tên"
          />

          <label htmlFor="dob">Ngày tháng năm sinh</label>
          <input
            id="dob"
            name="dob"
            type="date"
            value={formData.dob}
            onChange={handleChange}
            required
          />

          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="abc@gmail.com"
            required
          />

          <label htmlFor="password">Mật khẩu</label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Nhập mật khẩu"
          />

          <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            placeholder="Nhập lại mật khẩu"
          />

          <label htmlFor="phone">SĐT</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            required
            placeholder="Nhập số điện thoại"
          />

          <label htmlFor="address">Địa chỉ</label>
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
        </form>
      </div>
    </div>
  );
}
