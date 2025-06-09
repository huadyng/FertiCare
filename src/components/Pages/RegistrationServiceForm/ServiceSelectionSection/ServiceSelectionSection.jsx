import React from "react";

const ServiceSelectionSection = ({ formData, handleChange }) => (
  <section className="service-selection-section">
    <h2 className="section-title">2. Dịch vụ đăng ký</h2>
    <div className="checkbox-group">
      <label>
        <input
          type="checkbox"
          name="ivf"
          checked={formData.ivf}
          onChange={handleChange}
        />{" "}
        IVF
      </label>
      <label>
        <input
          type="checkbox"
          name="iui"
          checked={formData.iui}
          onChange={handleChange}
        />{" "}
        IUI
      </label>
    </div>
  </section>
);

export default ServiceSelectionSection;
