import React from "react";
import "./Service.css";
import ivfImg from "../../../../assets/img/IVF.jpg";
import iuiImg from "../../../../assets/img/iui.jpg";

const Service = () => {
  return (
    <div className="service-container">
      <h1 className="service-title">Dịch vụ hỗ trợ sinh sản</h1>
      <p className="service-intro">
        Trung tâm cung cấp các phương pháp điều trị hiếm muộn hiện đại nhất, với
        hai kỹ thuật chính là IVF (Thụ tinh trong ống nghiệm) và IUI (Bơm tinh
        trùng vào buồng tử cung).
      </p>
      <div className="service-components">
        {/* IVF Section */}
        <div className="service-section">
          <img
            src={ivfImg}
            alt="Thụ tinh trong ống nghiệm IVF"
            className="service-image"
          />
          <div className="service-details">
            <h2>IVF – Thụ tinh trong ống nghiệm</h2>
            <p>
              IVF là phương pháp kết hợp trứng và tinh trùng bên ngoài cơ thể
              trong môi trường phòng thí nghiệm, sau đó chuyển phôi đã thụ tinh
              vào tử cung người phụ nữ.
            </p>
            <h4>Đối tượng phù hợp:</h4>
            <ul>
              <li>Phụ nữ tắc vòi trứng hoặc không có vòi trứng</li>
              <li>Nam giới tinh trùng yếu, ít hoặc không có tinh trùng</li>
              <li>Vô sinh không rõ nguyên nhân hoặc đã thất bại với IUI</li>
            </ul>
          </div>
        </div>

        {/* IUI Section */}
        <div className="service-section">
          <img
            src={iuiImg}
            alt="Bơm tinh trùng vào buồng tử cung IUI"
            className="service-image"
          />
          <div className="service-details">
            <h2>IUI – Bơm tinh trùng vào buồng tử cung</h2>
            <p>
              IUI là phương pháp chọn lọc tinh trùng khỏe mạnh, sau đó bơm trực
              tiếp vào tử cung người phụ nữ vào thời điểm rụng trứng để tăng khả
              năng thụ thai.
            </p>
            <h4>Đối tượng phù hợp:</h4>
            <ul>
              <li>Nam giới có tinh trùng yếu nhẹ</li>
              <li>Nữ giới có rối loạn phóng noãn</li>
              <li>Vô sinh không rõ nguyên nhân</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Service;
