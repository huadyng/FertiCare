import React, { useContext } from "react";
import "./HeroSection.css"; // Link tới file CSS
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../../context/UserContext";

export default function HeroSection() {
  //Điều hướng
  const navigate = useNavigate();
  const user = useContext(UserContext);
  const handleBookingClick = () => {
    if (user) {
      navigate("/booking");
    } else {
      navigate("/login");
    }
  };
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
          <button className="btn-primary" onClick={handleBookingClick}>
            Đặt lịch khám
          </button>
          <button className="btn-outline">Tìm hiểu thêm</button>
        </div>
      </div>
    </section>
  );
}
