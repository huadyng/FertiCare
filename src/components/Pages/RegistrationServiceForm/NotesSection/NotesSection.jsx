import React from "react";

const NotesSection = ({ formData, handleChange }) => (
  <section className="p-4 border rounded mb-4">
    <h2 className="text-xl font-bold mb-2">4. Ghi chú</h2>
    <textarea
      name="notes"
      value={formData.notes}
      onChange={handleChange}
      placeholder="Ghi chú y tế hoặc cá nhân..."
      className="input"
    />
    <div className="mt-2">
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
