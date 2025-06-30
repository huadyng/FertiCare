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
  const [connectionError, setConnectionError] = useState(false);

  // Kiểm tra kết nối API khi component mount
  useEffect(() => {
    const checkAPIConnection = async () => {
      try {
        await axiosClient.get("/api/services");
        setConnectionError(false);
      } catch (error) {
        console.error("❌ [RegistrationForm] API Connection failed:", error);
        setConnectionError(true);
      }
    };
    checkAPIConnection();
  }, []);

  // Lấy danh sách dịch vụ
  useEffect(() => {
    axiosClient
      .get("/api/services")
      .then((res) => {
        setServices(res.data);
        setConnectionError(false); // Reset error nếu thành công
      })
      .catch((error) => {
        console.error("❌ [RegistrationForm] Failed to load services:", error);
        setConnectionError(true);
      });
  }, []);

  // Khi chọn dịch vụ, lấy danh sách bác sĩ
  useEffect(() => {
    if (!formData.serviceId) return;
    axiosClient
      .get(`/api/service-request/available-doctors/${formData.serviceId}`)
      .then((res) => setDoctors(res.data));

    // Reset các trường liên quan
    setFormData((prev) => ({
      ...prev,
      doctorId: "",
      appointmentDate: "",
      appointmentTime: "",
    }));
    setAvailableDates([]);
    setAvailableSlots([]);
  }, [formData.serviceId]);

  // Nếu chọn auto thì load lịch bác sĩ đầu tiên
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
          // Sử dụng endpoint mới để lấy danh sách ngày có sẵn
          const res = await axiosClient.get(
            `/api/service-request/available-dates/${autoDoctorId}`
          );
          const dateList = res.data.map((dateStr) => ({
            date: dateStr,
            slots: [], // Slots sẽ được load khi chọn ngày
          }));
          setAvailableDates(dateList);
          setAvailableSlots([]);
        } catch (err) {
          console.error("Lỗi lấy lịch bác sĩ auto:", err);
        }
      }
    };
    fetchAutoDoctorSchedule();
  }, [formData.doctorOption, doctors, formData.appointmentDate]);

  // Khi chọn bác sĩ thủ công
  const handleDoctorChange = async (e) => {
    const doctorId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      doctorId,
      appointmentDate: "",
      appointmentTime: "",
    }));
    if (!doctorId) return;

    try {
      // Sử dụng endpoint mới để lấy danh sách ngày có sẵn
      const res = await axiosClient.get(
        `/api/service-request/available-dates/${doctorId}`
      );
      const dateList = res.data.map((dateStr) => ({
        date: dateStr,
        slots: [], // Slots sẽ được load khi chọn ngày
      }));
      setAvailableDates(dateList);
      setAvailableSlots([]);
    } catch (err) {
      console.error("Lỗi lấy danh sách ngày:", err);
    }
  };

  const handleDateChange = async (e) => {
    const date = e.target.value;
    setFormData((prev) => ({
      ...prev,
      appointmentDate: date,
      appointmentTime: "",
    }));

    if (!date || !formData.doctorId) return;

    try {
      // Lấy slots cho ngày được chọn
      const res = await axiosClient.get(
        `/api/service-request/doctor-available-times/${formData.doctorId}?date=${date}`
      );
      const slots = res.data.map((item) => item.time);
      setAvailableSlots(slots);
    } catch (err) {
      console.error("Lỗi lấy slots cho ngày:", err);
      setAvailableSlots([]);
    }
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

      // Nếu là auto, cập nhật lịch tiếp theo
      if (formData.doctorOption === "auto" && res.data.doctor?.id) {
        const doctorId = res.data.doctor.id;
        setFormData((prev) => ({ ...prev, doctorId }));

        try {
          // Sử dụng endpoint mới để lấy danh sách ngày có sẵn
          const res2 = await axiosClient.get(
            `/api/service-request/available-dates/${doctorId}`
          );
          const dateList = res2.data.map((dateStr) => ({
            date: dateStr,
            slots: [], // Slots sẽ được load khi chọn ngày
          }));
          setAvailableDates(dateList);
          setAvailableSlots([]);
        } catch (err) {
          console.error("Lỗi cập nhật lịch sau khi đăng ký:", err);
        }
      }
    } catch (err) {
      alert("Đăng ký thất bại: " + (err.response?.data || err.message));
    }
  };

  return (
    <main className="registration-form-container">
      {connectionError && (
        <div
          className="error-banner"
          style={{
            backgroundColor: "#ffebee",
            border: "1px solid #f44336",
            borderRadius: "4px",
            padding: "12px",
            marginBottom: "20px",
            color: "#c62828",
          }}
        >
          <strong>⚠️ Lỗi kết nối:</strong> Không thể kết nối tới server. Vui
          lòng kiểm tra:
          <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
            <li>Backend có đang chạy trên port 8080 không</li>
            <li>
              Chạy lệnh: <code>npm run backend</code>
            </li>
            <li>
              Hoặc chạy: <code>npm start</code> để khởi động cả frontend và
              backend
            </li>
          </ul>
        </div>
      )}
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
