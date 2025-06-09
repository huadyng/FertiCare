import React from "react";

const NotesSection = ({ formData, handleChange }) => (
  <section className="notes-section">
    <h2 className="section-title">4. Ghi chú</h2>
    <textarea
      name="notes"
      value={formData.notes}
      onChange={handleChange}
      placeholder="Ghi chú y tế hoặc cá nhân..."
      className="textarea-field"
    />
    <div className="policy-confirmation">
      <label>
        <input
          type="checkbox"
          name="agreePolicy"
          checked={formData.agreePolicy}
          onChange={handleChange}
          required
        />
        Tôi xác nhận đã đọc và đồng ý chính sách.
      </label>
    </div>
  </section>
);

export default NotesSection;
