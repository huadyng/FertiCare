import React, { useState, useEffect } from "react";
import CustomDatePicker from "../components/CustomDatePicker";
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
  const [formErrors, setFormErrors] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStates, setLoadingStates] = useState({
    services: false,
    doctors: false,
    dates: false,
    slots: false,
  });

  // Kiểm tra kết nối API khi component mount
  useEffect(() => {
    const checkAPIConnection = async () => {
      try {
        setLoadingStates((prev) => ({ ...prev, services: true }));
        await axiosClient.get("/api/services");
        setConnectionError(false);
      } catch (error) {
        setConnectionError(true);
      } finally {
        setLoadingStates((prev) => ({ ...prev, services: false }));
      }
    };
    checkAPIConnection();
  }, []);

  // Lấy danh sách dịch vụ
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoadingStates((prev) => ({ ...prev, services: true }));
        const res = await axiosClient.get("/api/services");
        setServices(res.data);
        setConnectionError(false);
      } catch (error) {
        setConnectionError(true);
      } finally {
        setLoadingStates((prev) => ({ ...prev, services: false }));
      }
    };
    fetchServices();
  }, []);

  // Khi chọn dịch vụ, lấy danh sách bác sĩ
  useEffect(() => {
    if (!formData.serviceId) return;

    const fetchDoctors = async () => {
      try {
        setLoadingStates((prev) => ({ ...prev, doctors: true }));
        const res = await axiosClient.get(
          `/api/service-request/available-doctors/${formData.serviceId}`
        );
        setDoctors(res.data);
      } catch (error) {
        // Silent error handling
      } finally {
        setLoadingStates((prev) => ({ ...prev, doctors: false }));
      }
    };

    fetchDoctors();

    // Reset các trường liên quan
    setFormData((prev) => ({
      ...prev,
      doctorId: "",
      appointmentDate: "",
      appointmentTime: "",
    }));
    setAvailableDates([]);
    setAvailableSlots([]);
    setSelectedDate(null);
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
          setLoadingStates((prev) => ({ ...prev, dates: true }));

          const res = await axiosClient.get(
            `/api/service-request/available-dates/${autoDoctorId}`
          );
          const dateList = res.data.map((dateStr) => ({
            date: dateStr,
            slots: [],
          }));

          setAvailableDates(dateList);
          setAvailableSlots([]);
        } catch (err) {
          setAvailableDates([]);
        } finally {
          setLoadingStates((prev) => ({ ...prev, dates: false }));
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
    setSelectedDate(null);
    setAvailableSlots([]);

    if (!doctorId) {
      setAvailableDates([]);
      return;
    }

    try {
      setLoadingStates((prev) => ({ ...prev, dates: true }));

      const res = await axiosClient.get(
        `/api/service-request/available-dates/${doctorId}`
      );
      const dateList = res.data.map((dateStr) => ({
        date: dateStr,
        slots: [],
      }));

      setAvailableDates(dateList);
    } catch (err) {
      setAvailableDates([]);
    } finally {
      setLoadingStates((prev) => ({ ...prev, dates: false }));
    }
  };

  // Xử lý khi chọn ngày từ DatePicker
  const handleDatePickerChange = async (date) => {
    setSelectedDate(date);

    if (!date) {
      return;
    }

    // Format date to YYYY-MM-DD
    const formattedDate = date.toISOString().split("T")[0];

    setFormData((prev) => ({
      ...prev,
      appointmentDate: formattedDate,
      appointmentTime: "",
    }));

    // Determine doctorId based on selection mode
    let doctorIdToUse = formData.doctorId;

    if (formData.doctorOption === "auto" && doctors.length > 0) {
      doctorIdToUse = doctors[0].id;
    }

    if (!doctorIdToUse) {
      return;
    }

    try {
      setLoadingStates((prev) => ({ ...prev, slots: true }));

      const res = await axiosClient.get(
        `/api/service-request/doctor-available-times/${doctorIdToUse}?date=${formattedDate}`
      );

      const slots = res.data.map((item) => item.time);
      setAvailableSlots(slots);
    } catch (err) {
      setAvailableSlots([]);
    } finally {
      setLoadingStates((prev) => ({ ...prev, slots: false }));
    }
  };

  const handleSlotChange = (e) => {
    const selectedTime = e.target.value;

    setFormData((prev) => ({
      ...prev,
      appointmentTime: selectedTime,
    }));
  };

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFieldBlur = (fieldName) => {
    // Clear any existing error for this field
    setFormErrors((prev) => ({
      ...prev,
      [fieldName]: "",
    }));
  };

  // Tạo danh sách các ngày có thể chọn
  const getAvailableDatesArray = () => {
    if (!Array.isArray(availableDates)) return [];
    const dateArray = availableDates.map((d) => new Date(d.date));
    return dateArray;
  };

  // Kiểm tra ngày có available không
  const isDateAvailable = (date) => {
    if (!Array.isArray(availableDates)) return false;
    const dateStr = date.toISOString().split("T")[0];
    const isAvailable = availableDates.some((d) => d.date === dateStr);
    return isAvailable;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.agreePolicy) {
      alert("⚠️ Bạn cần đồng ý với chính sách và điều khoản sử dụng.");
      return;
    }
    if (!formData.serviceId) {
      alert("⚠️ Vui lòng chọn dịch vụ điều trị.");
      return;
    }
    if (formData.doctorOption === "manual" && !formData.doctorId) {
      alert("⚠️ Vui lòng chọn bác sĩ.");
      return;
    }
    if (!formData.appointmentDate || !formData.appointmentTime) {
      alert("⚠️ Vui lòng chọn ngày và giờ hẹn.");
      return;
    }

    const appointmentTime = `${formData.appointmentDate}T${formData.appointmentTime}:00`;

    const dataToSubmit = {
      serviceId: formData.serviceId,
      doctorId: formData.doctorOption === "manual" ? formData.doctorId : null,
      doctorSelection: formData.doctorOption,
      note: formData.notes,
      appointmentTime,
    };

    try {
      setIsLoading(true);
      const res = await axiosClient.post("/api/service-request", dataToSubmit);
      setRegisterInfo(res.data);
      setShowSuccess(true);

      // Reset form
      setFormData({
        serviceId: "",
        doctorOption: "auto",
        doctorId: "",
        appointmentDate: "",
        appointmentTime: "",
        notes: "",
        agreePolicy: false,
      });
      setSelectedDate(null);
      setAvailableDates([]);
      setAvailableSlots([]);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.response?.data || err.message;
      alert("❌ Đăng ký thất bại: " + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "";
    const date = new Date(dateTime);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <main className="registration-form-container">
      {connectionError && (
        <div className="error-banner">
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
        <h1>ĐĂNG KÝ DỊCH VỤ ĐIỀU TRỊ</h1>

        {/* Dịch vụ */}
        <section className="section">
          <h2 className="section-title">Chọn Dịch Vụ Điều Trị</h2>
          {loadingStates.services ? (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <div>⏳ Đang tải danh sách dịch vụ...</div>
            </div>
          ) : (
            <div className="radio-group">
              {services.map((service) => (
                <label key={service.id}>
                  <input
                    type="radio"
                    name="serviceId"
                    value={service.id}
                    checked={formData.serviceId === service.id}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  <span>{service.name}</span>
                </label>
              ))}
            </div>
          )}
        </section>

        {/* Bác sĩ */}
        {formData.serviceId && (
          <section className="section">
            <h2 className="section-title">Chọn Bác Sĩ</h2>

            <div className="doctor-option-group">
              <label className="doctor-option-label">
                <input
                  type="radio"
                  name="doctorOption"
                  value="auto"
                  checked={formData.doctorOption === "auto"}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <span className="option-text">
                  🤖 Hệ thống tự động chọn bác sĩ phù hợp
                </span>
              </label>
              <label className="doctor-option-label">
                <input
                  type="radio"
                  name="doctorOption"
                  value="manual"
                  checked={formData.doctorOption === "manual"}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <span className="option-text">👩‍⚕️ Tôi muốn tự chọn bác sĩ</span>
              </label>
            </div>

            {formData.doctorOption === "manual" && (
              <div className="doctor-selection-container">
                <div className="input-group">
                  <label className="input-label">Chọn bác sĩ:</label>
                  {loadingStates.doctors ? (
                    <div style={{ textAlign: "center", padding: "20px" }}>
                      <div>⏳ Đang tải danh sách bác sĩ...</div>
                    </div>
                  ) : (
                    <select
                      name="doctorId"
                      value={formData.doctorId}
                      onChange={handleDoctorChange}
                      className="input-field"
                      required
                      disabled={isLoading}
                    >
                      <option value="">-- Vui lòng chọn bác sĩ --</option>
                      {doctors.map((doc) => (
                        <option key={doc.id} value={doc.id}>
                          👨‍⚕️ {doc.name} -{" "}
                          {doc.specialization || "Bác sĩ chuyên khoa"}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            )}

            {((formData.doctorOption === "manual" && formData.doctorId) ||
              formData.doctorOption === "auto") && (
              <div className="appointment-scheduling">
                <div className="scheduling-header">
                  <h3 className="scheduling-title">📅 Đặt Lịch Hẹn</h3>
                  <p className="scheduling-subtitle">
                    Chọn ngày và giờ phù hợp với lịch trình của bạn
                  </p>
                </div>

                {loadingStates.dates ? (
                  <div style={{ textAlign: "center", padding: "30px" }}>
                    <div>⏳ Đang tải lịch khám...</div>
                  </div>
                ) : availableDates.length > 0 ? (
                  <div className="datetime-container">
                    <div className="date-picker-container">
                      <label className="input-label date-label">
                        <span className="label-icon">📅</span>
                        <span className="label-text">Chọn ngày hẹn</span>
                        <span className="label-required">*</span>
                      </label>
                      <div className="date-picker-wrapper">
                        <CustomDatePicker
                          id="appointmentDate"
                          selected={selectedDate}
                          onChange={handleDatePickerChange}
                          includeDates={getAvailableDatesArray()}
                          placeholder="🗓️ Nhấn để chọn ngày hẹn..."
                          className="input-field date-picker-input"
                          minDate={new Date()}
                          maxDate={
                            new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
                          } // 3 months from now
                          required
                          disabled={isLoading}
                          onBlur={() => handleFieldBlur("appointmentDate")}
                          isDateAvailable={isDateAvailable}
                        />
                      </div>
                      {formErrors.appointmentDate && (
                        <div
                          className="error-message"
                          id="appointmentDate-error"
                        >
                          ⚠️ {formErrors.appointmentDate}
                        </div>
                      )}
                    </div>

                    {selectedDate && (
                      <div className="time-picker-container">
                        <label className="input-label time-label">
                          <span className="label-icon">🕐</span>
                          <span className="label-text">Chọn giờ hẹn</span>
                          <span className="label-required">*</span>
                        </label>

                        {loadingStates.slots ? (
                          <div className="loading-container">
                            <div className="loading-spinner">
                              <div className="spinner-ring"></div>
                            </div>
                            <div className="loading-text">
                              <span className="loading-emoji">⏳</span>
                              Đang tải khung giờ có sẵn...
                            </div>
                            <div className="loading-dots">
                              <span></span>
                              <span></span>
                              <span></span>
                            </div>
                          </div>
                        ) : availableSlots.length > 0 ? (
                          <div className="time-slots-wrapper">
                            <div className="time-slots-header">
                              <span className="slots-count">
                                {availableSlots.length} khung giờ có sẵn
                              </span>
                              <span className="selected-date-display">
                                📅 {selectedDate.toLocaleDateString("vi-VN")}
                              </span>
                            </div>
                            <div className="time-slots-grid">
                              {availableSlots.map((slot, i) => (
                                <label
                                  key={i}
                                  className={`time-slot ${
                                    formData.appointmentTime === slot
                                      ? "selected"
                                      : ""
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name="appointmentTime"
                                    value={slot}
                                    checked={formData.appointmentTime === slot}
                                    onChange={handleSlotChange}
                                    required
                                    disabled={isLoading}
                                  />
                                  <div className="time-slot-content">
                                    <span className="time-slot-icon">🕐</span>
                                    <span className="time-slot-text">
                                      {slot}
                                    </span>
                                    <div className="time-slot-indicator"></div>
                                  </div>
                                </label>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="no-slots-available">
                            <div className="no-slots-icon">
                              <svg
                                width="48"
                                height="48"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zM12 7c.553 0 1 .447 1 1v4c0 .553-.447 1-1 1s-1-.447-1-1V8c0-.553.447-1 1-1zm0 8c-.553 0-1 .447-1 1s.447 1 1 1 1-.447 1-1-.447-1-1-1z"
                                  fill="currentColor"
                                />
                              </svg>
                            </div>
                            <div className="no-slots-content">
                              <h4>Không có khung giờ trống</h4>
                              <p>
                                Ngày bạn chọn hiện không có khung giờ nào có
                                sẵn.
                              </p>
                              <p>Vui lòng chọn ngày khác hoặc thử lại sau.</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="no-dates-available">
                    <div className="no-dates-icon">
                      <svg
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M8 2V5M16 2V5M3.5 9.5H20.5M4 18V7C4 5.89543 4.89543 5 6 5H18C19.1046 5 20 5.89543 20 7V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M15 13L9 13"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    <div className="no-dates-content">
                      <h4>Chưa có lịch hẹn</h4>
                      <p>Bác sĩ hiện tại chưa có lịch trống nào.</p>
                      <p>Vui lòng thử lại sau hoặc chọn bác sĩ khác.</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* Ghi chú + Chính sách */}
        <section className="section">
          <h2 className="section-title">Thông Tin Bổ Sung</h2>
          <div className="notes-container">
            <label className="input-label">📝 Ghi chú (tùy chọn):</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Ví dụ: Triệu chứng cụ thể, tiền sử bệnh, yêu cầu đặc biệt, thời gian thuận tiện..."
              className="textarea-field"
              rows="4"
              disabled={isLoading}
            />
          </div>

          <label className="policy-confirmation">
            <input
              type="checkbox"
              name="agreePolicy"
              checked={formData.agreePolicy}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
            <span className="policy-text">
              🔒 Tôi xác nhận đã đọc và đồng ý với{" "}
              <strong>chính sách bảo mật thông tin</strong> và{" "}
              <strong>điều khoản sử dụng dịch vụ</strong> của phòng khám
            </span>
          </label>
        </section>

        <button
          type="submit"
          className="submit-button"
          disabled={!formData.agreePolicy || isLoading}
        >
          {isLoading ? "⏳ Đang xử lý..." : "🚀 Hoàn Tất Đăng Ký"}
        </button>
      </form>

      {/* Success Modal */}
      {showSuccess && registerInfo && (
        <div
          className="success-modal-overlay"
          onClick={() => setShowSuccess(false)}
        >
          <div className="success-modal" onClick={(e) => e.stopPropagation()}>
            <div className="success-header">
              <h2>🎉 Đăng Ký Thành Công!</h2>
              <p>Thông tin lịch hẹn của bạn đã được xác nhận</p>
            </div>
            <div className="success-content">
              <div className="info-item">
                <span className="info-label">📋 Mã đơn hẹn:</span>
                <span className="info-value">#{registerInfo.id}</span>
              </div>
              <div className="info-item">
                <span className="info-label">📅 Thời gian hẹn:</span>
                <span className="info-value">
                  {formatDateTime(registerInfo.appointmentTime)}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">🏥 Dịch vụ:</span>
                <span className="info-value">{registerInfo.service?.name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">👨‍⚕️ Bác sĩ:</span>
                <span className="info-value">
                  {registerInfo.doctor?.fullName || "Sẽ được thông báo sau"}
                </span>
              </div>
              {registerInfo.note && (
                <div className="info-item">
                  <span className="info-label">📝 Ghi chú:</span>
                  <span className="info-value">{registerInfo.note}</span>
                </div>
              )}
              <div
                style={{
                  marginTop: "20px",
                  padding: "16px",
                  backgroundColor: "#f0f9ff",
                  borderRadius: "8px",
                  textAlign: "center",
                }}
              >
                <p style={{ margin: 0, color: "#0369a1", fontWeight: "500" }}>
                  📱 Phòng khám sẽ liên hệ với bạn để xác nhận lịch hẹn trong
                  vòng 24 giờ
                </p>
              </div>
            </div>
            <button
              className="success-close-btn"
              onClick={() => setShowSuccess(false)}
            >
              ✅ Đóng
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default RegistrationForm;
