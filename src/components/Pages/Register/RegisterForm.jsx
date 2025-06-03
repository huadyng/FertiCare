import React, { useState } from "react";
import "./RegisterForm.css";
const RegisterForm = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
    setSuccess("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Kiểm tra mật khẩu trùng khớp
    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu không khớp");
      return;
    }

    // Giả lập thành công
    setSuccess("Đăng ký thành công!");
    setFormData({
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>Đăng ký tài khoản</h2>

        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "lightgreen" }}>{success}</p>}

        <div>
          <label>Họ và tên</label>
          <input
            type="text"
            name="fullName"
            placeholder="Nhập họ tên"
            value={formData.fullName}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Email</label>
          <input
            type="text"
            name="email"
            placeholder="Nhập email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Nhập mật khẩu"
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Nhập lại mật khẩu"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
        </div>

        <button type="submit">ĐĂNG KÝ</button>
      </form>
    </div>
  );
};

export default RegisterForm;
