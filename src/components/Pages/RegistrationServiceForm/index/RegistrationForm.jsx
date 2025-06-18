import React, { useState, useEffect } from "react";
import axiosClient from "../../../../api/axiosClient";
import "./RegistrationForm.css";

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    gender: "",
    dateOfBirth: "",
    phone: "",
    email: "",
    idNumber: "",
    address: "",
    serviceId: "",
    doctorOption: "auto",
    doctorId: "",
    appointmentDate: "",
    appointmentTime: "",
    notes: "",
    agreePolicy: false,
  });

  const [services, setServices] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [registerInfo, setRegisterInfo] = useState(null);

  // Regex validation
  const phoneRegex = /^0\d{9}$/;
  const idRegex = /^\d{9,12}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Lấy danh sách dịch vụ
  useEffect(() => {
    // const fetchServices = async () => {
    //   try {
    //     const res = await axiosClient.get("/services");
    //     setServices(res.data);
    //   } catch (err) {
    //     console.error("Lỗi lấy dịch vụ:", err);
    //   }
    // };
    // fetchServices();
    setServices([
      {
        id: "service-id-IVF",
        name: "IVF - Thụ tinh trong ống nghiệm",
        description: "Mô tả IVF",
      },
      {
        id: "service-id-IUI",
        name: "IUI - Thụ tinh nhân tạo",
        description: "Mô tả IUI",
      },
    ]);
  }, []);

  // // Lấy danh sách bác sĩ khi chọn dịch vụ
  // useEffect(() => {
  //   const fetchDoctors = async () => {
  //     if (!formData.serviceId) return;
  //     try {
  //       const res = await axiosClient.get("/doctors", {
  //         params: { serviceId: formData.serviceId },
  //       });
  //       setDoctors(res.data);
  //     } catch (err) {
  //       console.error("Lỗi lấy bác sĩ:", err);
  //     }
  //   };
  //   fetchDoctors();
  //   // Reset khi đổi dịch vụ
  //   setFormData((prev) => ({
  //     ...prev,
  //     doctorId: "",
  //     appointmentDate: "",
  //     appointmentTime: "",
  //   }));
  //   setAvailableDates([]);
  //   setAvailableSlots([]);
  // }, [formData.serviceId]);
  useEffect(() => {
    if (!formData.serviceId) return;
    // Mock doctors theo service
    if (formData.serviceId === "service-id-IVF") {
      setDoctors([
        {
          id: "doc-1",
          name: "BS. Nguyễn Văn A",
          specialtyId: "service-id-IVF",
          schedule: [
            { date: "2025-06-20", slots: ["08:00", "09:00"] },
            { date: "2025-06-21", slots: ["10:00", "11:00"] },
          ],
        },
      ]);
    } else if (formData.serviceId === "service-id-IUI") {
      setDoctors([
        {
          id: "doc-2",
          name: "BS. Trần Thị B",
          specialtyId: "service-id-IUI",
          schedule: [{ date: "2025-06-22", slots: ["13:00", "14:00"] }],
        },
      ]);
    }
  }, [formData.serviceId]);

  // Khi chọn bác sĩ (manual), lấy lịch schedule
  const handleDoctorChange = (e) => {
    const doctorId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      doctorId,
      appointmentDate: "",
      appointmentTime: "",
    }));

    const selectedDoctor = doctors.find((d) => d.id === doctorId);
    setAvailableDates(selectedDoctor?.schedule || []);
    setAvailableSlots([]);
  };

  // Khi chọn ngày hẹn
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

  // Khi chọn giờ hẹn
  const handleSlotChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      appointmentTime: e.target.value,
    }));
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Gửi form đăng ký
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate các trường
    if (!phoneRegex.test(formData.phone)) {
      alert("Số điện thoại không hợp lệ.");
      return;
    }
    if (!idRegex.test(formData.idNumber)) {
      alert("CCCD/Mã bệnh nhân không hợp lệ.");
      return;
    }
    if (new Date(formData.dateOfBirth) > new Date()) {
      alert("Ngày sinh không hợp lệ.");
      return;
    }
    if (!emailRegex.test(formData.email)) {
      alert("Email không hợp lệ.");
      return;
    }
    if (!formData.agreePolicy) {
      alert("Bạn cần đồng ý chính sách.");
      return;
    }
    if (!formData.serviceId) {
      alert("Vui lòng chọn dịch vụ.");
      return;
    }
    if (formData.doctorOption === "manual" && !formData.doctorId) {
      alert("Vui lòng chọn bác sĩ.");
      return;
    }

    // // Chuẩn bị dữ liệu gửi đi (theo đúng schema Swagger)
    // const dataToSubmit = {
    //   fullName: formData.fullName,
    //   gender: formData.gender,
    //   dateOfBirth: formData.dateOfBirth,
    //   phone: formData.phone,
    //   email: formData.email,
    //   idNumber: formData.idNumber,
    //   address: formData.address,
    //   serviceId: formData.serviceId,
    //   doctorId: formData.doctorOption === "manual" ? formData.doctorId : null,
    //   appointmentDate: formData.appointmentDate || null,
    //   appointmentTime: formData.appointmentTime || null,
    //   notes: formData.notes || "",
    //   agreePolicy: formData.agreePolicy,
    // };

    // try {
    //   const res = await axiosClient.post("/service-request", dataToSubmit);
    //   setRegisterInfo(res.data); // lưu lại đơn đăng ký trả về từ BE
    //   setShowSuccess(true);
    //   // setFormData({ ... }); // Reset nếu cần
    // } catch (err) {
    //   alert("Đăng ký thất bại.");
    //   console.error(err);
    // }
    const fakeRes = {
      id: "request-001",
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      service: services.find((s) => s.id === formData.serviceId),
      doctor:
        formData.doctorOption === "manual"
          ? doctors.find((d) => d.id === formData.doctorId)
          : null,
      appointmentDate: formData.appointmentDate,
      appointmentTime: formData.appointmentTime,
      notes: formData.notes,
    };
    setRegisterInfo(fakeRes);
    setShowSuccess(true);
  };

  return (
    <main className="registration-form-container">
      <form onSubmit={handleSubmit} className="registration-form">
        <h1 className="h1">ĐĂNG KÝ DỊCH VỤ</h1>
        <div className="form-row">
          {/* Cột trái: Thông tin khách hàng */}
          <section className="section customer-info-section">
            <h2 className="section-title" style={{ textAlign: "center" }}>
              Thông tin khách hàng
            </h2>
            <input
              name="fullName"
              placeholder="Họ tên"
              value={formData.fullName}
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
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
              className="input-field"
              max={new Date().toISOString().split("T")[0]}
            />
            <input
              name="phone"
              placeholder="Số điện thoại"
              value={formData.phone}
              onChange={handleChange}
              required
              className="input-field"
            />
            <input
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="input-field"
              type="email"
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
                {services.map((service) => (
                  <label key={service.id}>
                    <input
                      type="radio"
                      name="serviceId"
                      value={service.id}
                      checked={formData.serviceId === service.id}
                      onChange={handleChange}
                    />
                    {service.name}
                  </label>
                ))}
              </div>
            </section>
            {/* Chỉ hiển thị chọn bác sĩ khi đã chọn dịch vụ */}
            {formData.serviceId && (
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
                {/* Chỉ hiện chọn bác sĩ và lịch khi chọn 'manual' */}
                {formData.doctorOption === "manual" && (
                  <div className="doctor-selection-container">
                    <select
                      name="doctorId"
                      value={formData.doctorId}
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
      {/* Modal xác nhận */}
      {showSuccess && registerInfo && (
        <div className="success-modal">
          <h2>Đăng ký thành công!</h2>
          <div>
            <b>Mã đơn:</b> {registerInfo.id} <br />
            <b>Khách hàng:</b> {registerInfo.fullName} <br />
            <b>Email:</b> {registerInfo.email} <br />
            <b>Số điện thoại:</b> {registerInfo.phone} <br />
            <b>Dịch vụ:</b> {registerInfo.service?.name} <br />
            <b>Bác sĩ:</b> {registerInfo.doctor?.name || "Hệ thống tự gợi ý"}{" "}
            <br />
            <b>Ngày hẹn:</b> {registerInfo.appointmentDate} <br />
            <b>Giờ:</b> {registerInfo.appointmentTime} <br />
            <b>Ghi chú:</b> {registerInfo.notes} <br />
          </div>
          <div style={{ color: "green", marginTop: 12 }}>
            Bạn sẽ nhận được email xác nhận thông tin đăng ký.
          </div>
          <button onClick={() => setShowSuccess(false)}>Đóng</button>
        </div>
      )}
    </main>
  );
};

export default RegistrationForm;
