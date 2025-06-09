import React, { useEffect, useState } from "react";
import axiosClient from "../../../../api/axiosClient";

const DoctorSelectionSection = ({ formData, handleChange, updateSchedule }) => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);

  useEffect(() => {
    // Gọi API để lấy danh sách bác sĩ và lịch làm việc
    axiosClient.get("/doctors").then((res) => setDoctors(res.data));
  }, []);

  const handleDoctorChange = (e) => {
    const doctorId = e.target.value;
    handleChange(e);
    const doctor = doctors.find((d) => d.id === doctorId);
    setSelectedDoctor(doctor);
    setAvailableDates(doctor?.schedule || []);
    setAvailableSlots([]);
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    handleChange({ target: { name: "appointmentDate", value: date } });

    const selected = availableDates.find((d) => d.date === date);
    setAvailableSlots(selected?.slots || []);
  };

  return (
    <section className="p-4 border rounded mb-4">
      <h2 className="text-xl font-bold mb-2">3. Chọn bác sĩ</h2>

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
      <label className="ml-4">
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
        <div className="mt-3">
          {/* Chọn bác sĩ */}
          <select
            name="doctor"
            value={formData.doctor}
            onChange={handleDoctorChange}
            className="input block mb-2"
          >
            <option value="">-- Chọn bác sĩ --</option>
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name}
              </option>
            ))}
          </select>

          {/* Chọn ngày */}
          {availableDates.length > 0 && (
            <select
              name="appointmentDate"
              value={formData.appointmentDate}
              onChange={handleDateChange}
              className="input block mb-2"
            >
              <option value="">-- Chọn ngày hẹn --</option>
              {availableDates.map((d) => (
                <option key={d.date} value={d.date}>
                  {d.date}
                </option>
              ))}
            </select>
          )}

          {/* Chọn giờ */}
          {availableSlots.length > 0 && (
            <select
              name="appointmentTime"
              value={formData.appointmentTime}
              onChange={handleSlotChange}
              className="input block"
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
  );
};

export default DoctorSelectionSection;
