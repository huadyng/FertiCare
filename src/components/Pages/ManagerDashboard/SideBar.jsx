import React from "react";
import "./ManagerDashboard.css";

export default function Sidebar({ onSelectChart }) {
  return (
    <div className="sidebar">
      <h2 className="sidebar-title">Manager</h2>
      <ul>
        <li onClick={() => onSelectChart("ratings")}>Phân tích đánh giá</li>
        {/* Có thể thêm mục khác */}
      </ul>
    </div>
  );
}
