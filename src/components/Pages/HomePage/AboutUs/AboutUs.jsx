import React from "react";
import "./AboutUs.css";
import intro from "../../../../assets/video/intro.mp4";

const AboutUs = () => {
  return (
    <div className="about-container" id="about-section">
      <section className="about-hero">
        <div className="about-description">
          <h1>Về chúng tôi</h1>
          <p>
            Trung tâm điều trị hiếm muộn hàng đầu Việt Nam với hơn 15 năm kinh
            nghiệm trong lĩnh vực hỗ trợ sinh sản, tự hào là nơi gửi gắm niềm
            tin của hàng ngàn cặp vợ chồng trên khắp cả nước.
          </p>
          <p>
            Với đội ngũ chuyên gia, bác sĩ đầu ngành có trình độ chuyên môn cao,
            được đào tạo chuyên sâu tại các quốc gia có nền y học phát triển như
            Nhật Bản, Mỹ, Úc..., chúng tôi không ngừng cập nhật những phương
            pháp điều trị tiên tiến nhất.
          </p>
        </div>
        <div className="about-video-container">
          <video src={intro} controls className="about-video"></video>
        </div>
      </section>

      {/* Main Content - 2 Column Layout */}
      <div className="about-main-content">
        {/* Left Column - Values */}
        <div className="about-section about-values">
          <h2>
            <span className="section-icon">💎</span>
            Giá trị cốt lõi
          </h2>
          <ul>
            <li>
              <strong>Tận tâm chăm sóc:</strong> Đặt sức khỏe và cảm xúc của
              bệnh nhân lên hàng đầu
            </li>
            <li>
              <strong>Chuyên nghiệp:</strong> Đội ngũ y bác sĩ giàu kinh nghiệm
              với trình độ chuyên môn cao
            </li>
            <li>
              <strong>Hiện đại:</strong> Trang thiết bị y tế tiên tiến, đạt
              chuẩn quốc tế
            </li>
            <li>
              <strong>Minh bạch:</strong> Thông tin rõ ràng về quy trình, chi
              phí điều trị
            </li>
            <li>
              <strong>Đồng hành:</strong> Hỗ trợ tâm lý và theo dõi suốt quá
              trình điều trị
            </li>
          </ul>
        </div>

        {/* Right Column - Achievements */}
        <div className="about-section about-numbers">
          <h2>
            <span className="section-icon">📊</span>
            Thành tựu nổi bật
          </h2>
          <div className="stats">
            <div className="stat-box">
              <span className="stat-icon">👨‍⚕️</span>
              <h3>15+</h3>
              <p>Năm kinh nghiệm</p>
            </div>
            <div className="stat-box">
              <span className="stat-icon">🏆</span>
              <h3>1000+</h3>
              <p>Ca điều trị thành công</p>
            </div>
            <div className="stat-box">
              <span className="stat-icon">👥</span>
              <h3>50+</h3>
              <p>Chuyên gia y tế</p>
            </div>
            <div className="stat-box">
              <span className="stat-icon">⭐</span>
              <h3>98%</h3>
              <p>Tỷ lệ hài lòng</p>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Team Section */}
      <div className="about-team-compact">
        <h2>
          <span className="section-icon">👨‍⚕️</span>
          Đội ngũ chuyên gia hàng đầu
        </h2>
        <div className="team-summary">
          <div className="team-stat">
            <span className="team-stat-icon">🔬</span>
            <div className="team-stat-content">
              <h4>Chuyên gia IVF & Phôi học</h4>
              <p>
                15+ bác sĩ chuyên khoa Sản phụ khoa & kỹ thuật viên phòng lab
              </p>
            </div>
          </div>
          <div className="team-stat">
            <span className="team-stat-icon">🩺</span>
            <div className="team-stat-content">
              <h4>Bác sĩ Nội tiết & Tư vấn</h4>
              <p>Chuyên gia điều trị nội tiết và hỗ trợ tâm lý chuyên nghiệp</p>
            </div>
          </div>
        </div>
        <div className="team-cta">
          <p>Được đào tạo tại Nhật Bản, Mỹ, Úc với chứng chỉ quốc tế</p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
