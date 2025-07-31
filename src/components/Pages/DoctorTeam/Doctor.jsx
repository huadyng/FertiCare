import React, { useEffect, useState } from "react";
import axios from "axios";
import DoctorCard from "./Card/DoctorCard";
import "./Doctor.css";

const Doctor = () => {
  const [doctor, setDoctors] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const doctorsPerPage = 6; // Số bác sĩ hiển thị mỗi trang

  //goi axios de lay du lieu tu API
  useEffect(() => {
    setIsLoading(true);
    axios
      .get("https://6836811f664e72d28e4105f7.mockapi.io/api/doctor")
      .then((response) => {
        setDoctors(response.data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching doctors:", error);
        setIsLoading(false);
      });
  }, []);

  // Tính toán thống kê
  const totalExperience = doctor.reduce(
    (sum, doc) => sum + (parseInt(doc.expyears) || 0),
    0,
  );
  const totalCases = doctor.reduce(
    (sum, doc) => sum + (parseInt(doc.cases) || 0),
    0,
  );
  const avgExperience =
    doctor.length > 0 ? Math.round(totalExperience / doctor.length) : 0;

  // Tính toán pagination
  const totalPages = Math.ceil(doctor.length / doctorsPerPage);
  const indexOfLastDoctor = currentPage * doctorsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
  const currentDoctors = doctor.slice(indexOfFirstDoctor, indexOfLastDoctor);

  // Xử lý chuyển trang
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top of doctor list
    document.querySelector(".doctor-list")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // Tạo số trang hiển thị
  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    if (currentPage > 1) {
      pageNumbers.push(
        <button
          key="prev"
          className="pagination-btn pagination-prev"
          onClick={() => handlePageChange(currentPage - 1)}
        >
          <i className="fas fa-chevron-left"></i>
        </button>,
      );
    }

    // First page
    if (startPage > 1) {
      pageNumbers.push(
        <button
          key={1}
          className="pagination-btn"
          onClick={() => handlePageChange(1)}
        >
          1
        </button>,
      );
      if (startPage > 2) {
        pageNumbers.push(
          <span key="dots1" className="pagination-dots">
            ...
          </span>,
        );
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          className={`pagination-btn ${currentPage === i ? "active" : ""}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>,
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageNumbers.push(
          <span key="dots2" className="pagination-dots">
            ...
          </span>,
        );
      }
      pageNumbers.push(
        <button
          key={totalPages}
          className="pagination-btn"
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </button>,
      );
    }

    // Next button
    if (currentPage < totalPages) {
      pageNumbers.push(
        <button
          key="next"
          className="pagination-btn pagination-next"
          onClick={() => handlePageChange(currentPage + 1)}
        >
          <i className="fas fa-chevron-right"></i>
        </button>,
      );
    }

    return pageNumbers;
  };

  if (isLoading) {
    return (
      <div className="doctor-container">
        <div className="loading-wrapper">
          <div className="loading-spinner"></div>
          <p className="loading-text">Đang tải thông tin bác sĩ...</p>
        </div>
      </div>
    );
  }

  // Render list of doctors
  return (
    <div className="doctor-container">
      {/* Hero Section */}
      <div className="hero-section">
        <h1 className="title">Đội ngũ bác sĩ chuyên khoa</h1>
        <p className="doctor-intro">
          🌟 Đội ngũ bác sĩ chuyên khoa hàng đầu với nhiều năm kinh nghiệm trong
          lĩnh vực điều trị hiếm muộn. Chúng tôi tự hào mang đến sự chăm sóc tận
          tâm và chuyên nghiệp nhất cho từng bệnh nhân.
        </p>
      </div>

      {/* Main Content Wrapper */}
      <div className="main-content">
        {/* Statistics Section */}
        <div className="doctor-stats">
          <h3 className="stats-title">📊 Thống kê đội ngũ</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-icon">👨‍⚕️</div>
              <span className="stat-number">{doctor.length}</span>
              <span className="stat-label">Bác sĩ chuyên khoa</span>
            </div>
            <div className="stat-item">
              <div className="stat-icon">⏰</div>
              <span className="stat-number">{totalExperience}+</span>
              <span className="stat-label">Năm kinh nghiệm</span>
            </div>
            <div className="stat-item">
              <div className="stat-icon">✅</div>
              <span className="stat-number">{totalCases}+</span>
              <span className="stat-label">Ca điều trị thành công</span>
            </div>
            <div className="stat-item">
              <div className="stat-icon">📈</div>
              <span className="stat-number">{avgExperience}</span>
              <span className="stat-label">Kinh nghiệm trung bình</span>
            </div>
          </div>
        </div>

        {/* Pagination Info */}
        <div className="pagination-info">
          
        </div>

        {/* Doctor Cards */}
        <div className="doctor-list">
          {currentDoctors.map((doctor, index) => (
            <DoctorCard
              id={doctor.id}
              key={doctor.id}
              name={doctor.name}
              expYears={doctor.expyears}
              cases={doctor.cases}
              pic={doctor.pic}
              animationDelay={index * 0.1}
            />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination-container">
            <div className="pagination">{renderPageNumbers()}</div>
            <div className="pagination-summary">
              Trang {currentPage} / {totalPages}
            </div>
          </div>
        )}
      </div>

      {/* Call to Action */}
      <div className="doctor-cta">
        <button
          className="cta-button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <i className="fas fa-calendar-plus"></i>
          <span>Đặt lịch tư vấn ngay</span>
        </button>
      </div>
    </div>
  );
};

export default Doctor;