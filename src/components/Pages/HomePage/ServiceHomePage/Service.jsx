import React from "react";
import "./Service.css";
import ivfImg from "../../../../assets/img/IVF.jpg";
import iuiImg from "../../../../assets/img/IUI.jpg";

const Service = () => {
  return (
    <div className="service-container" id="services">
      <h1 className="service-title">Dịch vụ hỗ trợ sinh sản</h1>
      <p className="service-intro">
        🌟 Trung tâm cung cấp các phương pháp điều trị hiếm muộn hiện đại nhất,
        với hai kỹ thuật chính là IVF (Thụ tinh trong ống nghiệm) và IUI (Bơm
        tinh trùng vào buồng tử cung) - mang lại hy vọng cho hàng ngàn gia đình.
      </p>

      <div className="service-components">
        {/* IVF Section */}
        <div className="service-section">
          <div className="service-image-container">
            <img
              src={ivfImg}
              alt="Thụ tinh trong ống nghiệm IVF"
              className="service-image"
            />
          </div>
          <div className="service-details">
            <h2>
              <span className="service-icon">🧪</span>
              IVF – Thụ tinh trong ống nghiệm
            </h2>
            <p className="service-description">
              IVF là phương pháp kết hợp trứng và tinh trùng bên ngoài cơ thể
              trong môi trường phòng thí nghiệm hiện đại, sau đó chuyển phôi đã
              thụ tinh vào tử cung người phụ nữ với tỷ lệ thành công cao.
            </p>
            <h4>Đối tượng phù hợp:</h4>
            <ul>
              <li>Phụ nữ tắc vòi trứng hoặc không có vòi trứng</li>
              <li>Nam giới tinh trùng yếu, ít hoặc không có tinh trùng</li>
              <li>Vô sinh không rõ nguyên nhân hoặc đã thất bại với IUI</li>
              <li>Tuổi cao, chất lượng trứng giảm</li>
            </ul>

            <div className="service-features">
              <div className="service-feature">
                <span className="service-feature-icon">⏱️</span>
                <h5>Thời gian</h5>
                <p>2-3 tháng</p>
              </div>
              <div className="service-feature">
                <span className="service-feature-icon">📊</span>
                <h5>Tỷ lệ thành công</h5>
                <p>65-75%</p>
              </div>
              <div className="service-feature">
                <span className="service-feature-icon">🔬</span>
                <h5>Công nghệ</h5>
                <p>Hiện đại nhất</p>
              </div>
            </div>
          </div>
        </div>

        {/* IUI Section */}
        <div className="service-section reverse">
          <div className="service-image-container">
            <img
              src={iuiImg}
              alt="Bơm tinh trùng vào buồng tử cung IUI"
              className="service-image"
            />
          </div>
          <div className="service-details">
            <h2>
              <span className="service-icon">💉</span>
              IUI – Bơm tinh trùng vào buồng tử cung
            </h2>
            <p className="service-description">
              IUI là phương pháp chọn lọc tinh trùng khỏe mạnh nhất, sau đó bơm
              trực tiếp vào tử cung người phụ nữ vào thời điểm rụng trứng để
              tăng khả năng thụ thai một cách tự nhiên và an toàn.
            </p>
            <h4>Đối tượng phù hợp:</h4>
            <ul>
              <li>Nam giới có tinh trùng yếu nhẹ hoặc vừa phải</li>
              <li>Nữ giới có rối loạn phóng noãn nhẹ</li>
              <li>Vô sinh không rõ nguyên nhân</li>
              <li>Khó khăn trong quan hệ tình dục</li>
            </ul>

            <div className="service-features">
              <div className="service-feature">
                <span className="service-feature-icon">⏱️</span>
                <h5>Thời gian</h5>
                <p>1-2 tháng</p>
              </div>
              <div className="service-feature">
                <span className="service-feature-icon">📊</span>
                <h5>Tỷ lệ thành công</h5>
                <p>25-35%</p>
              </div>
              <div className="service-feature">
                <span className="service-feature-icon">💰</span>
                <h5>Chi phí</h5>
                <p>Tiết kiệm</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Service;
