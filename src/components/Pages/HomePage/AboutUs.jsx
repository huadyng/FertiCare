import React from "react";
import "./AboutUs.css";
import intro from "../../../assets/video/intro.mp4";

const AboutUs = () => {
  return (
    <div className="about-container">
      <section className="about-hero">
        <div className="about-description">
          <h1>Về chúng tôi</h1>
          <p>
            Trung tâm điều trị hiếm muộn hàng đầu Việt Nam với hơn 15 năm kinh
            nghiệm trong lĩnh vực hỗ trợ sinh sản, tự hào là nơi gửi gắm niềm
            tin của hàng ngàn cặp vợ chồng trên khắp cả nước. Với đội ngũ chuyên
            gia, bác sĩ đầu ngành có trình độ chuyên môn cao, được đào tạo
            chuyên sâu tại các quốc gia có nền y học phát triển như Nhật Bản,
            Mỹ, Úc..., chúng tôi không ngừng cập nhật những phương pháp điều trị
            tiên tiến nhất nhằm mang lại hiệu quả tối ưu cho từng trường hợp
            bệnh nhân.
          </p>
          <p>
            Trung tâm điều trị hiếm muộn không chỉ là nơi điều trị, mà còn là
            mái nhà thứ hai – nơi bạn được lắng nghe, được thấu hiểu, và được
            tiếp thêm hy vọng. Chúng tôi sẵn sàng đồng hành cùng bạn trên hành
            trình mang lại một khởi đầu mới – khởi đầu của một cuộc sống trọn
            vẹn hơn, hạnh phúc hơn.
          </p>
        </div>
        <video src={intro} controls className="about-video"></video>
      </section>
      {/* 
      <section className="about-values">
        <h2>Sứ mệnh & Giá trị</h2>
        <ul>
          <li>
            <strong>Chuyên môn:</strong> Luôn cập nhật phương pháp điều trị hiện
            đại và hiệu quả nhất.
          </li>
          <li>
            <strong>Tận tâm:</strong> Đặt bệnh nhân làm trung tâm, đồng hành từ
            lúc bắt đầu đến lúc thành công.
          </li>
          <li>
            <strong>Minh bạch:</strong> Mọi thông tin được tư vấn rõ ràng, chính
            xác.
          </li>
        </ul>
      </section>

      <section className="about-numbers">
        <h2>Những con số ấn tượng</h2>
        <div className="stats">
          <div className="stat-box">
            <h3>15+</h3>
            <p>Năm kinh nghiệm</p>
          </div>
          <div className="stat-box">
            <h3>5,000+</h3>
            <p>Ca điều trị thành công</p>
          </div>
          <div className="stat-box">
            <h3>20+</h3>
            <p>Bác sĩ chuyên môn</p>
          </div>
        </div>
      </section>

      <section className="about-team">
        <h2>Đội ngũ bác sĩ</h2>
        <p>
          Chúng tôi quy tụ những chuyên gia hàng đầu trong lĩnh vực sản phụ
          khoa, hỗ trợ sinh sản, và nội tiết. Mỗi bác sĩ đều có trên 10 năm kinh
          nghiệm trong điều trị hiếm muộn.
        </p>
        <img
          src="/assets/img/2.jpg"
          alt="Đội ngũ bác sĩ"
          className="about-image"
        />
      </section> */}
    </div>
  );
};

export default AboutUs;
