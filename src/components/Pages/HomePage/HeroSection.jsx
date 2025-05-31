import React from "react";
import "./HeroSection.css"; // Link tới file CSS

export default function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1>Đồng hành cùng hạnh phúc gia đình</h1>
        <p>
          Trung tâm chẩn đoán và điều trị hiếm muộn hàng đầu Việt Nam với đội
          ngũ chuyên gia giàu kinh nghiệm và thiết bị hiện đại
        </p>
        <div className="hero-search">
          <input type="text" placeholder="Tìm kiếm dịch vụ..." />
        </div>
        <div className="hero-buttons">
          <button className="btn-primary">Đặt lịch hẹn</button>
          <button className="btn-outline">Tìm hiểu thêm</button>
        </div>
      </div>
    </section>
  );
}
