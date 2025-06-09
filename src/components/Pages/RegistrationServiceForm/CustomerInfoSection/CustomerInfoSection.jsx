import React from "react";

const CustomerInfoSection = ({ formData, handleChange }) => (
  <section className="p-4 border rounded mb-4">
    <h2 className="text-xl font-bold mb-2">1. Thông tin khách hàng</h2>
    <input
      name="name"
      placeholder="Họ tên"
      value={formData.name}
      onChange={handleChange}
      required
      className="input"
    />
    <select
      name="gender"
      value={formData.gender}
      onChange={handleChange}
      required
      className="input"
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
      className="input"
    />
    <input
      name="contact"
      placeholder="Liên hệ"
      value={formData.contact}
      onChange={handleChange}
      required
      className="input"
    />
    <input
      name="idNumber"
      placeholder="CCCD / Mã bệnh nhân"
      value={formData.idNumber}
      onChange={handleChange}
      className="input"
    />
  </section>
);

export default CustomerInfoSection;
