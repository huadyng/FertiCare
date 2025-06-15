import React, { useState, useEffect } from "react";
import axiosClient from "../../../../api/axiosClient";
import "./RegistrationForm.css";
import Header from "../../../layout/Header/Header";
import Footer from "../../../layout/Footer/Footer";

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    dob: "",
    contact: "",
    idNumber: "",
    address: "",
    service: "",
    doctorOption: "auto",
    appointmentDate: "",
    appointmentTime: "",
    doctor: "",
    schedule: "",
    notes: "",
    agreePolicy: false,
  });

  const [doctors, setDoctors] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);

  const phoneRegex = /^0\d{9}$/;
  const idRegex = /^\d{9,12}$/;

  useEffect(() => {
    axiosClient.get("/doctors").then((res) => setDoctors(res.data));
  }, []);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Reset các trường liên quan bác sĩ khi đổi dịch vụ
  const handleServiceChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      service: e.target.value,
      doctor: "",
      appointmentDate: "",
      appointmentTime: "",
    }));
    setAvailableDates([]);
    setAvailableSlots([]);
  };

  const handleDoctorChange = (e) => {
    const doctorId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      doctor: doctorId,
      appointmentDate: "",
      appointmentTime: "",
    }));

    const selectedDoctor = filteredDoctors.find((d) => d.id === doctorId);
    setAvailableDates(selectedDoctor?.schedule || []);
    setAvailableSlots([]);
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setFormData((prev) => ({
      ...prev,
      appointmentDate: date,
      appointmentTime: "",
    }));

    const selected = availableDates.find((d) => d.date === date);
    setAvailableSlots(selected?.slots || []);
  };

  const handleSlotChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      appointmentTime: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!phoneRegex.test(formData.contact)) {
      alert("Số điện thoại không hợp lệ.");
      return;
    }
    if (!idRegex.test(formData.idNumber)) {
      alert("CCCD/Mã bệnh nhân không hợp lệ.");
      return;
    }
    if (new Date(formData.dob) > new Date()) {
      alert("Ngày sinh không hợp lệ.");
      return;
    }

    const dataToSubmit = {
      ...formData,
      schedule:
        formData.doctorOption === "manual"
          ? `${formData.appointmentDate} ${formData.appointmentTime}`
          : formData.schedule,
    };

    try {
      await axiosClient.post("/registrations", dataToSubmit);
      alert("Đăng ký thành công!");
    } catch (error) {
      console.error(error);
      alert("Đăng ký thất bại.");
    }
  };

  // Lọc danh sách bác sĩ theo dịch vụ đã chọn
  const filteredDoctors = doctors.filter(
    (doc) => doc.specialty && doc.specialty.toUpperCase() === formData.service
  );

  return (
    <>
      {/* <Header /> */}
      <main className="registration-form-container">
        <form onSubmit={handleSubmit} className="registration-form">
          <h1 className="h1">ĐĂNG KÝ DỊCH VỤ</h1>

          {/* ===== Row 1: Thông tin + dịch vụ & chọn bác sĩ ===== */}
          <div className="form-row">
            {/* Cột trái: Thông tin khách hàng */}
            <section className="section customer-info-section">
              <h2 className="section-title" style={{ textAlign: "center" }}>
                Thông tin khách hàng
              </h2>
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
                max={new Date().toISOString().split("T")[0]}
              />
              <input
                name="contact"
                placeholder="Số điện thoại"
                value={formData.contact}
                onChange={handleChange}
                required
                className="input-field"
              />
              <input
                name="address"
                placeholder="Địa chỉ"
                value={formData.address}
                onChange={handleChange}
                required
                className="input-field"
              />
              <input
                name="idNumber"
                placeholder="CCCD / Mã bệnh nhân"
                value={formData.idNumber}
                onChange={handleChange}
                required
                className="input-field"
              />
            </section>

            {/* Cột phải: dịch vụ + chọn bác sĩ */}
            <div className="right-col">
              <section className="section service-selection-section">
                <h2 className="section-title" style={{ textAlign: "center" }}>
                  Dịch vụ đăng ký
                </h2>
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      name="service"
                      value="IVF"
                      checked={formData.service === "IVF"}
                      onChange={handleServiceChange}
                    />
                    IVF - Thụ tinh trong ống nghiệm
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="service"
                      value="IUI"
                      checked={formData.service === "IUI"}
                      onChange={handleServiceChange}
                    />
                    IUI - Thụ tinh nhân tạo
                  </label>
                </div>
              </section>

              {/* Chỉ hiển thị chọn bác sĩ khi đã chọn dịch vụ */}
              {formData.service && (
                <section className="section doctor-selection-section">
                  <h2 className="section-title" style={{ textAlign: "center" }}>
                    Chọn bác sĩ
                  </h2>
                  <div className="radio-group" style={{ marginBottom: "20px" }}>
                    <label>
                      <input
                        type="radio"
                        name="doctorOption"
                        value="manual"
                        checked={formData.doctorOption === "manual"}
                        onChange={handleChange}
                      />
                      Tự chọn bác sĩ
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="doctorOption"
                        value="auto"
                        checked={formData.doctorOption === "auto"}
                        onChange={handleChange}
                      />
                      Hệ thống gợi ý
                    </label>
                  </div>

                  {formData.doctorOption === "manual" && (
                    <div className="doctor-selection-container">
                      <select
                        name="doctor"
                        value={formData.doctor}
                        onChange={handleDoctorChange}
                        className="input-field"
                        required
                      >
                        <option value="">-- Chọn bác sĩ --</option>
                        {filteredDoctors.map((doc) => (
                          <option key={doc.id} value={doc.id}>
                            {doc.name}
                          </option>
                        ))}
                      </select>

                      {availableDates.length > 0 && (
                        <select
                          name="appointmentDate"
                          value={formData.appointmentDate}
                          onChange={handleDateChange}
                          className="input-field"
                          required
                        >
                          <option value="">-- Chọn ngày hẹn --</option>
                          {availableDates.map((d) => (
                            <option key={d.date} value={d.date}>
                              {d.date}
                            </option>
                          ))}
                        </select>
                      )}

                      {availableSlots.length > 0 && (
                        <select
                          name="appointmentTime"
                          value={formData.appointmentTime}
                          onChange={handleSlotChange}
                          className="input-field"
                          required
                        >
                          <option value="">-- Chọn giờ --</option>
                          {availableSlots.map((slot, index) => (
                            <option key={index} value={slot}>
                              {slot}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}
                </section>
              )}
            </div>
          </div>

          {/* ===== Row 2: Ghi chú + Chính sách ===== */}
          <div className="form-row single-column">
            <section className="section notes-section">
              <h2 className="section-title">Ghi chú</h2>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Ghi chú y tế hoặc cá nhân..."
                className="textarea-field"
              />
              <label className="policy-confirmation">
                <input
                  type="checkbox"
                  name="agreePolicy"
                  checked={formData.agreePolicy}
                  onChange={handleChange}
                  required
                />
                Tôi xác nhận đã đọc và đồng ý chính sách.
              </label>
            </section>
          </div>

          <button type="submit" className="submit-button">
            Gửi đăng ký
          </button>
        </form>
      </main>
      {/* <Footer /> */}
    </>
  );
};

export default RegistrationForm;
