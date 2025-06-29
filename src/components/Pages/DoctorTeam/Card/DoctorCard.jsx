import React from "react";
import { useNavigate } from "react-router-dom";
import "./DoctorCard.css";

const DoctorCard = ({ id, name, expYears, cases, pic, animationDelay = 0 }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/doctor/${id}`);
  };

  // Generate specialty tags (mock data for demo)
  const specialties = ["Sản phụ khoa", "IVF", "Nội tiết sinh sản"];

  // Calculate success rate (mock calculation)
  const successRate = Math.min(95 + Math.floor(Math.random() * 5), 99);

  return (
    <div
      className="doctor-card"
      onClick={handleClick}
      style={{
        "--animation-delay": `${animationDelay}s`,
      }}
      data-delay={animationDelay}
    >
      <img
        src={pic || "/src/assets/img/default-avatar.png"}
        alt={name}
        className="doctor-image"
        onError={(e) => {
          e.target.src = "/src/assets/img/default-avatar.png";
        }}
      />

      <h3 className="doctor-name">{name}</h3>

      <p className="doctor-info">
        Bác sĩ chuyên khoa với nhiều năm kinh nghiệm trong lĩnh vực điều trị
        hiếm muộn, cam kết mang lại sự chăm sóc tốt nhất cho bệnh nhân.
      </p>

      <div className="doctor-stats">
        <div className="stat-badge">
          <span className="stat-number">{expYears}</span>
          <span className="stat-label">Năm KN</span>
        </div>
        <div className="stat-badge">
          <span className="stat-number">{cases}</span>
          <span className="stat-label">Ca điều trị</span>
        </div>
        <div className="stat-badge">
          <span className="stat-number">{successRate}%</span>
          <span className="stat-label">Thành công</span>
        </div>
      </div>

      <div className="doctor-specialties">
        {specialties.slice(0, 2).map((specialty, index) => (
          <span key={index} className="specialty-tag">
            {specialty}
          </span>
        ))}
      </div>

      <button
        className="view-profile-btn"
        onClick={(e) => {
          e.stopPropagation();
          handleClick();
        }}
      >
        <span>Xem hồ sơ</span>
      </button>
    </div>
  );
};

export default DoctorCard;
