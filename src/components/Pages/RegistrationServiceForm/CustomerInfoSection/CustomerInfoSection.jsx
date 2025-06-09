import React from "react";

const CustomerInfoSection = ({ formData, handleChange }) => (
  <section className="customer-info-section">
    <h2 className="section-title">1. Thông tin khách hàng</h2>
    <input
      name="name"
      placeholder="Họ tên"
      value={formData.name}
      onChange={handleChange}
      required
      className="input-field"
    />
    <select
      name="gender"
      value={formData.gender}
      onChange={handleChange}
      required
      className="input-field"
    >
      <option value="">Giới tính</option>
      <option value="male">Nam</option>
      <option value="female">Nữ</option>
    </select>
    <input
      name="dob"
      type="date"
      value={formData.dob}
      onChange={handleChange}
      required
      className="input-field"
    />
    <input
      name="contact"
      placeholder="Liên hệ"
      value={formData.contact}
      onChange={handleChange}
      required
      className="input-field"
    />
    <input
      name="idNumber"
      placeholder="CCCD / Mã bệnh nhân"
      value={formData.idNumber}
      onChange={handleChange}
      className="input-field"
    />
  </section>
);

export default CustomerInfoSection;
