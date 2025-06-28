import React, { useContext, useState } from "react";
import "./HeroSection.css";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../../../context/UserContext";

export default function HeroSection() {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useContext(UserContext);
  const [searchQuery, setSearchQuery] = useState("");

  const handleBookingClick = () => {
    if (isLoggedIn && user) {
      navigate("/booking");
    } else {
      navigate("/login");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Handle search functionality
      console.log("Searching for:", searchQuery);
    }
  };

  const handleLearnMore = () => {
    document.getElementById("about-section")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1>
          Đồng hành cùng <span className="highlight">hạnh phúc</span> gia đình
        </h1>
        <p>
          🌟 Trung tâm chẩn đoán và điều trị hiếm muộn hàng đầu Việt Nam với đội
          ngũ chuyên gia giàu kinh nghiệm và thiết bị hiện đại nhất
        </p>

        <div className="hero-search">
          <form onSubmit={handleSearch} className="hero-search-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Tìm kiếm dịch vụ, bác sĩ, thông tin..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-button">
              Tìm kiếm
            </button>
          </form>
        </div>

        <div className="hero-buttons">
          <button className="btn-primary" onClick={handleBookingClick}>
            📅 {isLoggedIn ? "Đặt lịch khám" : "Đăng ký ngay"}
          </button>
          <button className="btn-outline" onClick={handleLearnMore}>
            📖 Tìm hiểu thêm
          </button>
        </div>

        <div className="hero-features">
          <div className="hero-feature">
            <span className="hero-feature-icon">👨‍⚕️</span>
            <span>15+ năm kinh nghiệm</span>
          </div>
          <div className="hero-feature">
            <span className="hero-feature-icon">🏆</span>
            <span>1000+ ca thành công</span>
          </div>
          <div className="hero-feature">
            <span className="hero-feature-icon">🔬</span>
            <span>Công nghệ hiện đại</span>
          </div>
          <div className="hero-feature">
            <span className="hero-feature-icon">❤️</span>
            <span>Chăm sóc tận tâm</span>
          </div>
        </div>
      </div>
    </section>
  );
}
