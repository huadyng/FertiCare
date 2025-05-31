import React from "react";
import "./Footer.css";

export default function Footer() {
  return (
    <div className="footer">
      <div className="footer-content">
        <div className="footer-section about">
          <h3>Về chúng tôi</h3>
          <p>
            Trung tâm điều trị hiếm muộn với đội ngũ bác sĩ chuyên môn cao, tận
            tâm đồng hành cùng bạn trong hành trình làm cha mẹ.
          </p>
        </div>

        <div className="footer-section contact">
          <h3>Liên hệ</h3>
          <p>📍 123 Nguyễn Văn Cừ, Quận 5, TP.HCM</p>
          <p>📞 0909 422 807</p>
          <p>📧 info@infertilitycenter.vn</p>
        </div>

        <div className="footer-section services">
          <h3>Dịch vụ</h3>
          <ul>
            <li>
              <a href="#">IUI – Thụ tinh trong tử cung</a>
            </li>
            <li>
              <a href="#">IVF – Thụ tinh trong ống nghiệm</a>
            </li>
            <li>
              <a href="#">Khám – Tư vấn vô sinh</a>
            </li>
          </ul>
        </div>

        <div className="footer-section links">
          <h3>Liên kết nhanh</h3>
          <ul>
            <li>
              <a href="#">Trang chủ</a>
            </li>
            <li>
              <a href="#">Đăng ký</a>
            </li>
            <li>
              <a href="#">Đăng nhập</a>
            </li>
            <li>
              <a href="#">Chính sách bảo mật</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2025 Infertility Treatment Center. All rights reserved.</p>
      </div>
    </div>
  );
}
