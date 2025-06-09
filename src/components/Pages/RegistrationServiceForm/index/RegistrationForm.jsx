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
    ivf: false,
    iui: false,
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

  const handleDoctorChange = (e) => {
    const doctorId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      doctor: doctorId,
      appointmentDate: "",
      appointmentTime: "",
    }));

    const selectedDoctor = doctors.find((d) => d.id === doctorId);
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

  return (
    <>
      <Header />
      <main className="registration-form-container">
        <form onSubmit={handleSubmit} className="registration-form">
          {/* 1. Thông tin khách hàng */}
          <section className="section customer-info-section">
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
              name="idNumber"
              placeholder="CCCD / Mã bệnh nhân"
              value={formData.idNumber}
              onChange={handleChange}
              required
              className="input-field"
            />
          </section>

          {/* 2. Dịch vụ đăng ký */}
          <section className="section service-selection-section">
            <h2 className="section-title">2. Dịch vụ đăng ký</h2>
            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="ivf"
                  checked={formData.ivf}
                  onChange={handleChange}
                />
                IVF
              </label>
              <label>
                <input
                  type="checkbox"
                  name="iui"
                  checked={formData.iui}
                  onChange={handleChange}
                />
                IUI
              </label>
            </div>
          </section>

          {/* 3. Chọn bác sĩ */}
          <section className="section doctor-selection-section">
            <h2 className="section-title">3. Chọn bác sĩ</h2>
            <div className="radio-group">
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
                  {doctors.map((doc) => (
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

          {/* 4. Ghi chú */}
          <section className="section notes-section">
            <h2 className="section-title">4. Ghi chú</h2>
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

          <button type="submit" className="submit-button">
            Gửi đăng ký
          </button>
        </form>
      </main>
      <Footer />
    </>
  );
};

export default RegistrationForm;
