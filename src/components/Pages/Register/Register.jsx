import React, { useState } from "react";
import axios from "axios";
import './Register.css';


export default function Register() {
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
      const response = await axios.post("https://your-api-url.com/register", formData); // Thay bằng URL thật
      console.log("Success:", response.data);
      alert("Registration successful!");
    } catch (error) {
      console.error("Error:", error);
      alert("Registration failed.");
    }
  };

  return (
    <div className="register-container container-fluid">
      <div className="row align-items-center min-vh-100">
        {/* Image Section */}
        <div className="register-image col-lg-6 d-none d-lg-block text-center">
          <img
            src="/src/assets/img/mon&baby.jpg"
            alt="Visual"
            className="img-fluid"
            style={{ maxHeight: "90vh", objectFit: "contain" }}
          />
        </div>
        {/* Form Section */}
        <div className=" col-lg-6 px-5">
          
          <form className="register-form" onSubmit={handleSubmit}>
            <h2 className="text-center fw-bold mb-4">ĐĂNG KÝ TÀI KHOẢN</h2>
            <div className="row mb-3">
              <div className="col">
                <label className="form-label fw-bold">Họ và tên</label>
                <input
                  type="text"
                  className="form-control rounded-pill"
                  name="Name"

                  value={formData.Name}
                  onChange={handleChange}
                  required
                />
              </div>
             
            </div>
               <div className="mb-3 fw-bold">
              <label className="form-label">Ngày tháng năm sinh:</label>
              <input
                type="date"
                className="form-control rounded-pill"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3 fw-bold">
              <label className="form-label">Email:</label>
              <input
                type="email"
                className="form-control rounded-pill"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="abc@gmail.com"
                required
              />
            </div>

            <div className="mb-3 fw-bold">
              <label className="form-label">Mật khẩu:</label>
              <input
                type="password"
                className="form-control rounded-pill"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3 fw-bold">
              <label className="form-label">Xác nhận mật khẩu:</label>
              <input
                type="password"
                className="form-control rounded-pill"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

         
            <div className="mb-3 fw-bold">
              <label className="form-label">SĐT:</label>
              <input
                type="tel"
                className="form-control rounded-pill"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                
                required
              />
            </div>
            <div className="mb-3 fw-bold">
              <label className="form-label">Địa chỉ:</label>
              <input
                type="tel"
                className="form-control rounded-pill"
                name="address"
                value={formData.address}
                onChange={handleChange}
                
                required
              />
            </div>
            

            <div className="form-check mb-3">
              <input
                type="checkbox"
                className="form-check-input"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                id="terms"
                required
              />
              <label className="form-check-label fw-bold" htmlFor="terms">
                Tôi chấp nhận Điều khoản sử dụng và Chính sách bảo mật.
              </label>
            </div>

            <button type="submit" className="btn btn-register w-100 rounded-pill fw-bold">
              ĐĂNG KÝ
            </button>
          </form>
        </div>

        
      </div>
    </div>
  );
}
