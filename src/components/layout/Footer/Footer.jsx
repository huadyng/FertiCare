import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleNavigation = async (path) => {
    setIsNavigating(true);
    try {
      navigate(path);
      // Scroll to top immediately
      window.scrollTo(0, 0);
    } catch (error) {
      console.error("Navigation error:", error);
    } finally {
      setTimeout(() => setIsNavigating(false), 300);
    }
  };

  const handleExternalLink = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Brand Section */}
        <div className="footer-section brand-section">
          <div className="footer-logo">
            <span className="footer-logo-icon">💖</span>
            <h3>Fertix</h3>
          </div>
          <p className="footer-description">
            Trung tâm Hỗ trợ Sinh sản hàng đầu Việt Nam - Đồng hành cùng hạnh
            phúc gia đình với công nghệ tiên tiến và đội ngũ chuyên gia giàu
            kinh nghiệm.
          </p>
          <div className="footer-cta">
            <button
              onClick={() => handleNavigation("/services")}
              className="footer-cta-btn"
              disabled={isNavigating}
            >
              <span className="cta-icon">🌟</span>
              {isNavigating ? "Đang chuyển..." : "Khám phá dịch vụ"}
            </button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h3>Liên kết nhanh</h3>
          <ul>
            <li>
              <button
                onClick={() => handleNavigation("/services")}
                className="footer-link-btn"
                disabled={isNavigating}
              >
                🏥 Dịch vụ y tế
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigation("/doctor")}
                className="footer-link-btn"
                disabled={isNavigating}
              >
                👨‍⚕️ Đội ngũ bác sĩ
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigation("/blog-public")}
                className="footer-link-btn"
                disabled={isNavigating}
              >
                📰 Tin tức & Blog
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigation("/contact")}
                className="footer-link-btn"
                disabled={isNavigating}
              >
                📞 Liên hệ tư vấn
              </button>
            </li>
          </ul>
        </div>

        {/* Contact Information */}
        <div className="footer-section contact-section">
          <h3>Thông tin liên hệ</h3>
          <div className="footer-contact-info">
            <div className="footer-contact-item">
              <span className="footer-contact-icon">📍</span>
              <span>108 Hoàng Như Tiếp, Long Biên, Hà Nội</span>
            </div>
            <div className="footer-contact-item">
              <span className="footer-contact-icon">📞</span>
              <span className="hotline-number">Hotline: 1800 6858</span>
            </div>
            <div className="footer-contact-item">
              <span className="footer-contact-icon">⏰</span>
              <span>Thứ 2 - Chủ nhật: 7:00 - 20:00</span>
            </div>
            <div className="footer-contact-item">
              <span className="footer-contact-icon">✉️</span>
              <span>info@ferticare.vn</span>
            </div>
            <div className="footer-contact-item">
              <span className="footer-contact-icon">🌐</span>
              <span>ferticare@gmail.com</span>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p className="copyright">
            © {currentYear} FertiCare. Tất cả quyền được bảo lưu.
          </p>
          <div className="footer-social">
            <div
              className="footer-social-item"
              title="Facebook"
              onClick={() => handleExternalLink("https://facebook.com")}
            >
              <span className="footer-social-icon">📘</span>
            </div>
            <div
              className="footer-social-item"
              title="Instagram"
              onClick={() => handleExternalLink("https://instagram.com")}
            >
              <span className="footer-social-icon">📷</span>
            </div>
            <div
              className="footer-social-item"
              title="YouTube"
              onClick={() => handleExternalLink("https://youtube.com")}
            >
              <span className="footer-social-icon">📺</span>
            </div>
            <div
              className="footer-social-item"
              title="Zalo"
              onClick={() => handleExternalLink("https://zalo.me")}
            >
              <span className="footer-social-icon">💬</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
