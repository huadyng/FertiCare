import React from "react";
import "./AboutUs.css";
import intro from "../../../../assets/video/intro.mp4";

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
    </div>
  );
};

export default AboutUs;
