import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./ContactForm.css";

const hospitalIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/854/854878.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

export default function Contact() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.pageYOffset > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleBookingClick = () => {
    navigate("/booking");
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="contact-container" id="contact-section">
      {/* Back to Home Button - Only show when not on homepage */}
      {location.pathname !== "/" && (
        <button className="back-to-home-btn" onClick={handleBackToHome}>
          <span className="back-icon">←</span>
          <span className="back-text">Trang chủ</span>
        </button>
      )}

      {/* Back to Top Button */}
      {showBackToTop && (
        <button className="back-to-top-btn" onClick={scrollToTop}>
          <span>⬆️</span>
        </button>
      )}

      {/* Header Section */}
      <div className="contact-header">
        <h1 className="contact-title">Liên hệ với chúng tôi</h1>
        <p className="contact-subtitle">
          Đội ngũ chuyên gia luôn sẵn sàng tư vấn và hỗ trợ bạn 24/7. Hãy liên
          hệ với chúng tôi để được chăm sóc tốt nhất.
        </p>
      </div>

      {/* Main Content */}
      <div className="contact-content">
        {/* Contact Info Cards */}
        <div className="contact-info-section">
          <div className="contact-info-cards">
            <div className="contact-card">
              <div className="contact-card-icon">📍</div>
              <h3>Địa chỉ</h3>
              <p>
                108 Hoàng Như Tiếp
                <br />
                Long Biên, Hà Nội
              </p>
            </div>

            <div className="contact-card">
              <div className="contact-card-icon">📞</div>
              <h3>Hotline</h3>
              <p>
                1800 6858
                <br />
                Tư vấn miễn phí 24/7
              </p>
            </div>

            <div className="contact-card">
              <div className="contact-card-icon">✉️</div>
              <h3>Email</h3>
              <p>
                info@ferticare.vn
                <br />
                support@ferticare.vn
              </p>
            </div>

            <div className="contact-card">
              <div className="contact-card-icon">⏰</div>
              <h3>Giờ làm việc</h3>
              <p>
                T2-T7: 7:00 - 17:00
                <br />
                CN: 8:00 - 12:00
              </p>
            </div>
          </div>

          <div className="quick-actions">
            <button className="action-btn primary" onClick={handleBookingClick}>
              <span className="btn-icon">📅</span>
              Đặt lịch khám ngay
            </button>
          </div>
        </div>

        {/* Map Section */}
        <div className="map-section-wrapper">
          <div className="map-section">
            <div className="map-header">
              <h2>Vị trí bệnh viện</h2>
              <p>Tìm đường đến trung tâm chúng tôi</p>
            </div>

            <div className="map-container">
              <MapContainer
                center={[21.039047, 105.886243]}
                zoom={16}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                />
                <Marker position={[21.039047, 105.886243]} icon={hospitalIcon}>
                  <Popup>
                    <div className="popup-content">
                      <strong>Trung tâm Hỗ trợ Sinh sản FertiCare</strong>
                      <br />
                      108 Hoàng Như Tiếp, Long Biên, Hà Nội
                      <br />
                      <small>Hotline: 1800 6858</small>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>

            <div className="map-actions">
              <a
                href="https://maps.google.com/?q=21.039047,105.886243"
                target="_blank"
                rel="noopener noreferrer"
                className="map-action-btn"
              >
                <span>🗺️</span>
                Mở Google Maps
              </a>
              <button className="map-action-btn">
                <span>🚗</span>
                Chỉ đường
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info Section */}
      <div className="additional-info">
        <div className="info-grid">
          <div className="info-item">
            <div className="info-icon">🚗</div>
            <h4>Giao thông</h4>
            <p>
              Gần bến xe Gia Lâm, thuận tiện di chuyển bằng xe bus, taxi hoặc xe
              cá nhân
            </p>
          </div>
          <div className="info-item">
            <div className="info-icon">🏥</div>
            <h4>Cơ sở vật chất</h4>
            <p>
              Trang thiết bị hiện đại, phòng khám sạch sẽ, thoải mái theo tiêu
              chuẩn quốc tế
            </p>
          </div>
          <div className="info-item">
            <div className="info-icon">👨‍⚕️</div>
            <h4>Đội ngũ y tế</h4>
            <p>
              Bác sĩ chuyên khoa giàu kinh nghiệm, được đào tạo tại các nước
              phát triển
            </p>
          </div>
          <div className="info-item">
            <div className="info-icon">🔒</div>
            <h4>Bảo mật thông tin</h4>
            <p>
              Cam kết bảo vệ tuyệt đối thông tin cá nhân và y tế của bệnh nhân
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
