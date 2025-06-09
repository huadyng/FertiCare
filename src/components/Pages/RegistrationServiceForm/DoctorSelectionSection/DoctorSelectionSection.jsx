import React from "react";

const DoctorSelectionSection = ({ formData, handleChange }) => (
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
      <div className="mt-2">
        <select
          name="doctor"
          value={formData.doctor}
          onChange={handleChange}
          className="input"
        >
          <option value="">-- Chọn bác sĩ --</option>
          <option value="drA">Bác sĩ A</option>
          <option value="drB">Bác sĩ B</option>
        </select>
        <input
          name="schedule"
          type="time"
          value={formData.schedule}
          onChange={handleChange}
          className="input mt-2"
          placeholder="Chọn giờ"
        />
      </div>
    )}
  </section>
);

export default DoctorSelectionSection;
