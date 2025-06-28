import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <div className="footer-logo">
            <span className="footer-logo-icon">🩺</span>
            <h3>FertiCare</h3>
          </div>
          <p>
            Trung tâm điều trị hiếm muộn hàng đầu Việt Nam với hơn 15 năm kinh
            nghiệm. Chúng tôi đồng hành cùng bạn trên hành trình tìm kiếm hạnh
            phúc gia đình.
          </p>
          <div className="footer-social">
            <div className="footer-social-item">
              <span className="footer-social-icon">📘</span>
            </div>
            <div className="footer-social-item">
              <span className="footer-social-icon">📷</span>
            </div>
            <div className="footer-social-item">
              <span className="footer-social-icon">🐦</span>
            </div>
            <div className="footer-social-item">
              <span className="footer-social-icon">📺</span>
            </div>
          </div>
        </div>

        <div className="footer-section">
          <h3>Dịch vụ</h3>
          <ul>
            <li>
              <a href="#ivf">🧪 Thụ tinh ống nghiệm (IVF)</a>
            </li>
            <li>
              <a href="#icsi">💉 Tiêm tinh trùng (ICSI)</a>
            </li>
            <li>
              <a href="#consultation">👩‍⚕️ Tư vấn chuyên khoa</a>
            </li>
            <li>
              <a href="#ultrasound">🔍 Siêu âm theo dõi</a>
            </li>
            <li>
              <a href="#health-check">📋 Khám sức khỏe tổng quát</a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Thông tin</h3>
          <ul>
            <li>
              <a href="/about">ℹ️ Về chúng tôi</a>
            </li>
            <li>
              <a href="/doctors">👨‍⚕️ Đội ngũ bác sĩ</a>
            </li>
            <li>
              <a href="/news">📰 Tin tức</a>
            </li>
            <li>
              <a href="/achievements">🏆 Thành tựu</a>
            </li>
            <li>
              <a href="/faq">❓ Câu hỏi thường gặp</a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Liên hệ</h3>
          <div className="footer-contact-item">
            <span className="footer-contact-icon">📍</span>
            <span>123 Đường ABC, Quận 1, TP.HCM</span>
          </div>
          <div className="footer-contact-item">
            <span className="footer-contact-icon">📞</span>
            <span>1900 1234</span>
          </div>
          <div className="footer-contact-item">
            <span className="footer-contact-icon">✉️</span>
            <span>info@ferticare.com</span>
          </div>
          <div className="footer-contact-item">
            <span className="footer-contact-icon">🕒</span>
            <span>T2-T7: 7:00 - 18:00</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          &copy; 2024 FertiCare. Tất cả quyền được bảo lưu. | 🔒 Chính sách bảo
          mật | 📋 Điều khoản sử dụng
        </p>
      </div>
    </footer>
  );
};

export default Footer;
