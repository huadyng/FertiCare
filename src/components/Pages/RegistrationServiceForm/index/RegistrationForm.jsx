import React, { useState, useEffect } from "react";
import axiosClient from "../../../../api/axiosClient";
import "./RegistrationForm.css";

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
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

  // Lấy danh sách dịch vụ từ API
  useEffect(() => {
    axiosClient.get("/api/services").then((res) => setServices(res.data));
  }, []);

  // Lấy danh sách bác sĩ theo dịch vụ
  useEffect(() => {
    if (!formData.serviceId) return;
    axiosClient
      .get(`/api/service-request/available-doctors/${formData.serviceId}`)
      .then((res) => setDoctors(res.data));

    // Reset lại chọn cũ
    setFormData((prev) => ({
      ...prev,
      doctorId: "",
      appointmentDate: "",
      appointmentTime: "",
    }));
    setAvailableDates([]);
    setAvailableSlots([]);
  }, [formData.serviceId]);

  // Nếu chọn "auto", sau khi có doctors thì chọn bác sĩ đầu tiên và lấy lịch
  useEffect(() => {
    const fetchAutoDoctorSchedule = async () => {
      if (
        formData.doctorOption === "auto" &&
        doctors.length > 0 &&
        !formData.appointmentDate
      ) {
        const autoDoctorId = doctors[0].id;
        setFormData((prev) => ({ ...prev, doctorId: autoDoctorId }));

        try {
          const res = await axiosClient.get(
            `/api/service-request/doctor-available-times/${autoDoctorId}`
          );
          const grouped = {};
          res.data.forEach((item) => {
            const date = item.dateTime.split("T")[0];
            const time = item.time;
            if (!grouped[date]) grouped[date] = [];
            grouped[date].push(time);
          });
          const dateList = Object.keys(grouped).map((d) => ({
            date: d,
            slots: grouped[d],
          }));
          setAvailableDates(dateList);
          setAvailableSlots([]);
        } catch (err) {
          console.error("Lỗi lấy lịch bác sĩ auto:", err);
        }
      }
    };
    fetchAutoDoctorSchedule();
    // eslint-disable-next-line
  }, [formData.doctorOption, doctors]);

  const handleDoctorChange = async (e) => {
    const doctorId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      doctorId,
      appointmentDate: "",
      appointmentTime: "",
    }));
    if (!doctorId) return;

    const res = await axiosClient.get(
      `/api/service-request/doctor-available-times/${doctorId}`
    );
    const grouped = {};
    res.data.forEach((item) => {
      const date = item.dateTime.split("T")[0];
      const time = item.time;
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(time);
    });
    const dateList = Object.keys(grouped).map((d) => ({
      date: d,
      slots: grouped[d],
    }));
    setAvailableDates(dateList);
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

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.agreePolicy) return alert("Bạn cần đồng ý chính sách.");
    if (!formData.serviceId) return alert("Vui lòng chọn dịch vụ.");
    if (formData.doctorOption === "manual" && !formData.doctorId)
      return alert("Vui lòng chọn bác sĩ.");
    if (!formData.appointmentDate || !formData.appointmentTime)
      return alert("Vui lòng chọn ngày và giờ.");

    const appointmentTime = `${formData.appointmentDate}T${formData.appointmentTime}:00`;

    const dataToSubmit = {
      serviceId: formData.serviceId,
      doctorId: formData.doctorOption === "manual" ? formData.doctorId : null,
      doctorSelection: formData.doctorOption,
      note: formData.notes,
      appointmentTime,
    };

    try {
      const res = await axiosClient.post("/api/service-request", dataToSubmit);
      setRegisterInfo(res.data);
      setShowSuccess(true);

      // Sau khi gửi, nếu là auto thì tiếp tục lấy lịch
      if (formData.doctorOption === "auto" && res.data.doctor?.id) {
        const doctorId = res.data.doctor.id;
        setFormData((prev) => ({ ...prev, doctorId }));

        const res2 = await axiosClient.get(
          `/api/service-request/doctor-available-times/${doctorId}`
        );
        const grouped = {};
        res2.data.forEach((item) => {
          const date = item.dateTime.split("T")[0];
          const time = item.time;
          if (!grouped[date]) grouped[date] = [];
          grouped[date].push(time);
        });
        const dateList = Object.keys(grouped).map((d) => ({
          date: d,
          slots: grouped[d],
        }));
        setAvailableDates(dateList);
        setAvailableSlots([]);
      }
    } catch (err) {
      alert("Đăng ký thất bại: " + (err.response?.data || err.message));
    }
  };

  return (
    <main className="registration-form-container">
      <form onSubmit={handleSubmit} className="registration-form">
        <h1 className="h1">ĐĂNG KÝ DỊCH VỤ</h1>

        {/* Dịch vụ */}
        <section className="section">
          <h2 className="section-title">1. DỊCH VỤ ĐIỀU TRỊ</h2>
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

        {/* Bác sĩ */}
        {formData.serviceId && (
          <section className="section">
            <h2 className="section-title">2. CHỌN BÁC SĨ</h2>
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

            {formData.doctorOption === "manual" && (
              <div>
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
              </div>
            )}

            {(formData.doctorOption === "manual" && formData.doctorId) ||
            formData.doctorOption === "auto" ? (
              <div>
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
                    {availableSlots.map((slot, i) => (
                      <option key={i} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ) : null}
          </section>
        )}

        {/* Ghi chú + Chính sách */}
        <section className="section">
          <h2 className="section-title">3. GHI CHÚ</h2>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Thông tin y tế hoặc yêu cầu đặc biệt..."
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
            Tôi xác nhận đã đọc và đồng ý chính sách bảo mật.
          </label>
        </section>

        <button type="submit" className="submit-button">
          Gửi đăng ký
        </button>
      </form>

      {showSuccess && registerInfo && (
        <div className="success-modal">
          <h2>Đăng ký thành công!</h2>
          <p>
            <b>Mã đơn:</b> {registerInfo.id}
          </p>
          <p>
            <b>Ngày hẹn:</b> {registerInfo.appointmentDate}
          </p>
          <p>
            <b>Giờ:</b> {registerInfo.appointmentTime}
          </p>
          <p>
            <b>Dịch vụ:</b> {registerInfo.service?.name}
          </p>
          <p>
            <b>Bác sĩ:</b> {registerInfo.doctor?.fullName || "Tự động chọn"}
          </p>
          <button onClick={() => setShowSuccess(false)}>Đóng</button>
        </div>
      )}
    </main>
  );
};

export default RegistrationForm;
