import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import CustomDatePicker from "./components/CustomDatePicker/CustomDatePicker";
import axiosClient from "../../../services/axiosClient";
import { UserContext } from "../../../context/UserContext";
import "./RegistrationForm.css";

const RegistrationForm = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useContext(UserContext);
  const [showBackToTop, setShowBackToTop] = useState(false);

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
  const [submittedFormData, setSubmittedFormData] = useState(null);
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

  // Handle scroll for back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.pageYOffset > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lấy danh sách dịch vụ và kiểm tra kết nối API
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
    fetchAutoDoctorSchedule();
  }, [formData.doctorOption, doctors, formData.appointmentDate]);

  // Khi chọn bác sĩ tự động
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

  // Khi chọn bác sĩ thủ công
  const handleDoctorChange = async (e) => {
    const doctorId = e.target.value;
    console.log("[DEBUG] Chọn bác sĩ thủ công, doctorId:", doctorId);

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
      console.log("[DEBUG] Không có doctorId, reset availableDates");
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
      console.log("[DEBUG] API trả về availableDates:", dateList);
      setAvailableDates(dateList);
    } catch (err) {
      setAvailableDates([]);
      console.log("[DEBUG] Lỗi khi lấy availableDates:", err);
    } finally {
      setLoadingStates((prev) => ({ ...prev, dates: false }));
    }
  };

  // Xử lý khi chọn ngày từ DatePicker
  const handleDatePickerChange = async (date) => {
    console.log("[DEBUG] Chọn ngày:", date);
    setSelectedDate(date);

    if (!date) {
      console.log("[DEBUG] Không có ngày được chọn");
      return;
    }

    // Format date to YYYY-MM-DD using local date
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    console.log("[DEBUG] Ngày đã format:", formattedDate);

    setFormData((prev) => {
      const newFormData = {
        ...prev,
        appointmentDate: formattedDate,
        appointmentTime: "",
      };
      console.log("[DEBUG] formData sau khi chọn ngày:", newFormData);
      return newFormData;
    });

    // Determine doctorId based on selection mode
    let doctorIdToUse = formData.doctorId;
    if (formData.doctorOption === "auto" && doctors.length > 0) {
      doctorIdToUse = doctors[0].id;
    }
    console.log("[DEBUG] doctorId sử dụng để lấy giờ:", doctorIdToUse);

    if (!doctorIdToUse) {
      console.log("[DEBUG] Không có doctorId để lấy giờ");
      return;
    }

    try {
      setLoadingStates((prev) => ({ ...prev, slots: true }));
      const res = await axiosClient.get(
        `/api/service-request/doctor-available-times/${doctorIdToUse}?date=${formattedDate}`
      );
      console.log("[DEBUG] API trả về availableSlots:", res.data);
      const slots = res.data.map((item) => item.time);
      setAvailableSlots(slots);
    } catch (err) {
      setAvailableSlots([]);
      console.log("[DEBUG] Lỗi khi lấy availableSlots:", err);
    } finally {
      setLoadingStates((prev) => ({ ...prev, slots: false }));
    }
  };

  const handleSlotChange = (e) => {
    const selectedTime = e.target.value;
    console.log("[DEBUG] Chọn giờ:", selectedTime);
    setFormData((prev) => {
      const newFormData = {
        ...prev,
        appointmentTime: selectedTime,
      };
      console.log("[DEBUG] formData sau khi chọn giờ:", newFormData);
      return newFormData;
    });
    console.log("[DEBUG] availableSlots hiện tại:", availableSlots);
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
    const dateArray = availableDates.map((d) => new Date(d.date.date));
    return dateArray;
  };

  // Kiểm tra ngày có available không
  const isDateAvailable = (date) => {
    if (!Array.isArray(availableDates)) return false;
    // Sử dụng local date thay vì UTC để tránh lệch timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const isAvailable = availableDates.some((d) => d.date.date === dateStr);
    return isAvailable;
  };

  // Navigation handlers
  const handleBackToHome = () => {
    navigate("/");
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
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

    // Tạo datetime với timezone local (không chuyển đổi sang UTC)
    const appointmentDateTime = new Date(`${formData.appointmentDate}T${formData.appointmentTime}:00`);
    // Gửi thời gian local dưới dạng string để tránh lệch timezone
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

      // Lưu trữ thông tin form trước khi reset
      console.log("=== DEBUG: Saving form data ===");
      console.log("formData before submit:", formData);
      console.log("selectedDate:", selectedDate);

      const submittedData = {
        serviceId: formData.serviceId,
        serviceName:
          services.find((s) => s.id === formData.serviceId)?.name || "",
        doctorOption: formData.doctorOption,
        doctorId: formData.doctorId,
        doctorName:
          formData.doctorOption === "manual"
            ? doctors.find((d) => d.id === formData.doctorId)?.name || ""
            : "Hệ thống tự động chọn",
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
        notes: formData.notes,
        appointmentDateTime: appointmentTime,
      };

      console.log("submittedData created:", submittedData);

      // Backup vào localStorage để đảm bảo không mất
      localStorage.setItem("lastSubmittedData", JSON.stringify(submittedData));

      const res = await axiosClient.post("/api/service-request", dataToSubmit);
      console.log("Registration response:", res.data); // Debug log
      console.log("Submitted form data:", submittedData); // Debug log

      setRegisterInfo(res.data);
      setSubmittedFormData(submittedData);
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
    if (!dateTime) return "Chưa có thông tin";

    try {
      const date = new Date(dateTime);

      // Kiểm tra xem date có hợp lệ không
      if (isNaN(date.getTime())) {
        return "Thời gian không hợp lệ";
      }

      return date.toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Ho_Chi_Minh",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Lỗi định dạng thời gian";
    }
  };

  const formatFormDateTime = (date, time) => {
    console.log("=== DEBUG formatFormDateTime ===");
    console.log("Input date:", date, "type:", typeof date);
    console.log("Input time:", time, "type:", typeof time);

    try {
      if (!date || !time) {
        console.log("Missing date or time");
        return "Chưa có thông tin";
      }

      const dateObj = new Date(date);
      console.log("Date object:", dateObj);
      console.log("Date.getTime():", dateObj.getTime());

      if (isNaN(dateObj.getTime())) {
        console.log("Invalid date object");
        return "Ngày không hợp lệ";
      }

      const formattedDate = dateObj.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      console.log("Formatted date:", formattedDate);
      const result = `${formattedDate} lúc ${time}`;
      console.log("Final result:", result);
      return result;
    } catch (error) {
      console.error("Error formatting form date time:", error);
      return "Lỗi định dạng";
    }
  };

  const getDisplayDateTime = () => {
    console.log("=== DEBUG getDisplayDateTime ===");
    console.log(
      "registerInfo?.appointmentTime:",
      registerInfo?.appointmentTime
    );
    console.log("submittedFormData:", submittedFormData);

    // Ưu tiên hiển thị từ dữ liệu người dùng đã chọn (submittedFormData)
    if (
      submittedFormData?.appointmentDate &&
      submittedFormData?.appointmentTime
    ) {
      console.log("Using user's original selection from submittedFormData");
      console.log("appointmentDate:", submittedFormData.appointmentDate);
      console.log("appointmentTime:", submittedFormData.appointmentTime);

      try {
        const date = new Date(submittedFormData.appointmentDate);
        const vietnamDate = date.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
        
        // Sử dụng thời gian người dùng đã chọn (không phải từ API)
        const timeToDisplay = submittedFormData.appointmentTime;
        
        const result = `${vietnamDate} lúc ${timeToDisplay}`;
        console.log("User's original selection result:", result);
        return result;
      } catch (error) {
        console.error("Error formatting user's selection:", error);
        return `${submittedFormData.appointmentDate} lúc ${submittedFormData.appointmentTime}`;
      }
    }

    // Nếu không có submittedFormData, thử sử dụng API response
    if (registerInfo?.appointmentTime) {
      console.log("Using API response time as fallback");

      const timeValue = registerInfo.appointmentTime;
      console.log("API time value:", timeValue);

      // Nếu là time-only format (HH:mm:ss), kết hợp với ngày từ API hoặc localStorage
      if (timeValue.match(/^\d{2}:\d{2}:\d{2}$/)) {
        console.log("API time is time-only format");
        
        // 🆕 Kiểm tra xem có phải thời gian đã bị chuyển đổi timezone không
        // Nếu có submittedFormData, so sánh với thời gian gốc
        if (submittedFormData?.appointmentTime) {
          const originalTime = submittedFormData.appointmentTime;
          const apiTime = timeValue.substring(0, 5);
          
          console.log("Comparing times - Original:", originalTime, "API:", apiTime);
          
          // Nếu thời gian khác nhau, có thể đã bị chuyển đổi timezone
          if (originalTime !== apiTime) {
            console.log("Timezone conversion detected, using original time");
            const date = new Date(submittedFormData.appointmentDate);
            const vietnamDate = date.toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            });
            return `${vietnamDate} lúc ${originalTime}`;
          }
        }
        
        // Thử lấy ngày từ localStorage backup
        try {
          const backupData = localStorage.getItem("lastSubmittedData");
          if (backupData) {
            const parsedData = JSON.parse(backupData);
            if (parsedData?.appointmentDate) {
              const date = new Date(parsedData.appointmentDate);
              const vietnamDate = date.toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              });
              const timeOnly = timeValue.substring(0, 5); // Remove seconds, get HH:mm
              const result = `${vietnamDate} lúc ${timeOnly}`;
              console.log("API + localStorage backup result:", result);
              return result;
            }
          }
        } catch (error) {
          console.error("Error reading localStorage backup:", error);
        }
        
        // Fallback: chỉ hiển thị time
        console.log("No date available, showing time only");
        const timeOnly = timeValue.substring(0, 5);
        return `Hôm nay lúc ${timeOnly}`;
      } else {
        // Nếu là full datetime, format bình thường
        console.log("API time is full datetime format");
        const result = formatDateTime(timeValue);
        console.log("Formatted API time:", result);
        return result;
      }
    }

    // Fallback từ localStorage
    try {
      const backupData = localStorage.getItem("lastSubmittedData");
      if (backupData) {
        const parsedData = JSON.parse(backupData);
        if (parsedData?.appointmentDate && parsedData?.appointmentTime) {
          console.log("Using localStorage backup:", parsedData);
          const date = new Date(parsedData.appointmentDate);
          const vietnamDate = date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
          return `${vietnamDate} lúc ${parsedData.appointmentTime}`;
        }
      }
    } catch (error) {
      console.error("Error reading localStorage backup:", error);
    }

    // Fallback cuối cùng
    console.log("Using fallback");
    return "Đang cập nhật thông tin";
  };

  return (
    <main className="registration-form-container">
      {/* Back to Home Button */}
      <button className="back-to-home-btn" onClick={handleBackToHome}>
        <span className="back-icon">←</span>
        <span className="back-text">Trang chủ</span>
      </button>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button className="back-to-top-btn" onClick={scrollToTop}>
          <span>⬆️</span>
        </button>
      )}

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
          onClick={() => {
            setShowSuccess(false);
            setSubmittedFormData(null);
            localStorage.removeItem("lastSubmittedData");
          }}
        >
          <div className="success-modal" onClick={(e) => e.stopPropagation()}>
            <div className="success-header">
              <h2>✅ Đăng Ký Thành Công!</h2>
              <p>Lịch đăng ký khám của bạn đã được xác nhận</p>
            </div>

            <div className="success-content">
              <div className="info-list">
                <div className="info-row">
                  <span className="label">Mã đơn hẹn:</span>
                  <span className="value">#{registerInfo.id}</span>
                </div>

                <div className="info-row">
                  <span className="label">Thời gian hẹn:</span>
                  <span className="value">{getDisplayDateTime()}</span>
                </div>

                <div className="info-row">
                  <span className="label">Dịch vụ:</span>
                  <span className="value">
                    {registerInfo.service?.name ||
                      submittedFormData?.serviceName ||
                      "Đang cập nhật"}
                  </span>
                </div>

                <div className="info-row">
                  <span className="label">Bác sĩ:</span>
                  <span className="value">
                    {registerInfo.doctor?.fullName ||
                      registerInfo.doctor?.name ||
                      submittedFormData?.doctorName ||
                      "Sẽ được thông báo"}
                  </span>
                </div>

                {(registerInfo.note || submittedFormData?.notes) && (
                  <div className="info-row notes">
                    <span className="label">Ghi chú:</span>
                    <span className="value">
                      {registerInfo.note || submittedFormData?.notes}
                    </span>
                  </div>
                )}
              </div>

              <div className="notice">
                📧 Thông tin lịch hẹn đã được gửi qua email
              </div>
            </div>

            <button
              className="close-btn"
              onClick={() => {
                setShowSuccess(false);
                setSubmittedFormData(null);
                localStorage.removeItem("lastSubmittedData");
              }}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default RegistrationForm;
