import React from "react";

const ServiceSelectionSection = ({ formData, handleChange }) => (
  <section className="p-4 border rounded mb-4">
    <h2 className="text-xl font-bold mb-2">2. Dịch vụ đăng ký</h2>
    <label>
      <input
        type="checkbox"
        name="ivf"
        checked={formData.ivf}
        onChange={handleChange}
      />{" "}
      IVF
    </label>
    <label className="ml-4">
      <input
        type="checkbox"
        name="iui"
        checked={formData.iui}
        onChange={handleChange}
      />{" "}
      IUI
    </label>
  </section>
);

export default ServiceSelectionSection;
