import React, { useContext } from "react";
import "./HeroSection.css";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../../../context/UserContext";
import SearchBox from "../../../common/SearchBox/SearchBox";

export default function HeroSection() {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useContext(UserContext);

  const handleBookingClick = () => {
    if (isLoggedIn && user) {
      navigate("/booking");
    } else {
      navigate("/login");
    }
  };

  const handleSearch = (searchQuery) => {
    console.log("Searching for:", searchQuery);

    // Tìm kiếm chung - thử tìm trong tất cả các section
    const sections = [
      "services-section",
      "doctors-section",
      "about-section",
      "achievements-section",
      "news-section",
      "contact-section",
      "feedback-section",
    ];

    // Tìm section đầu tiên có thể scroll được
    for (const sectionId of sections) {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        break;
      }
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
          <SearchBox onSearch={handleSearch} />
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
