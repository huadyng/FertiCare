import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Services.css";

const Services = () => {
  const navigate = useNavigate();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [activeService, setActiveService] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.pageYOffset > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleBackToHome = () => {
    navigate("/");
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBookingClick = () => {
    navigate("/booking");
  };

  const services = [
    {
      id: "ivf",
      title: "IVF - Thụ tinh trong ống nghiệm",
      icon: "🧪",
      shortDesc: "Công nghệ hỗ trợ sinh sản hiện đại và hiệu quả",
      fullDesc:
        "IVF (In Vitro Fertilization) là kỹ thuật thụ tinh trong ống nghiệm, được coi là giải pháp hiệu quả nhất cho các cặp vợ chồng hiếm muộn. Quy trình này bao gồm việc lấy trứng từ buồng trứng, thụ tinh với tinh trùng trong phòng thí nghiệm, sau đó chuyển phôi chất lượng tốt vào tử cung.",
      price: "80.000.000 - 120.000.000 VNĐ",
      duration: "2-3 tháng",
      successRate: "60-70%",
      suitableFor: [
        "Tắc vòi trứng không thể phẫu thuật",
        "Nam giới có số lượng tinh trùng thấp",
        "Nội mạc tử cung lạc chỗ nặng",
        "Hiếm muộn không rõ nguyên nhân",
        "Thất bại với các phương pháp khác",
      ],
      process: [
        {
          step: 1,
          title: "Kích thích buồng trứng",
          desc: "Sử dụng thuốc hormone để kích thích phát triển nhiều nang trứng",
          time: "10-14 ngày",
        },
        {
          step: 2,
          title: "Theo dõi và lấy trứng",
          desc: "Siêu âm theo dõi, lấy trứng khi chín qua phương pháp nội soi",
          time: "1 ngày",
        },
        {
          step: 3,
          title: "Thụ tinh trong phòng lab",
          desc: "Kết hợp trứng và tinh trùng trong môi trường nuôi cấy đặc biệt",
          time: "3-5 ngày",
        },
        {
          step: 4,
          title: "Chuyển phôi",
          desc: "Đưa phôi chất lượng tốt nhất vào tử cung thông qua ống thông mềm",
          time: "1 ngày",
        },
        {
          step: 5,
          title: "Theo dõi và xét nghiệm",
          desc: "Kiểm tra kết quả thụ thai sau 14 ngày và theo dõi thai kỳ",
          time: "14 ngày",
        },
      ],
      advantages: [
        "Tỷ lệ thành công cao nhất trong các PLTSS",
        "Kiểm soát được chất lượng phôi",
        "Có thể chọn lọc phôi tốt nhất",
        "Phù hợp với nhiều nguyên nhân hiếm muộn",
        "Có thể bảo quản phôi dư để sử dụng sau",
      ],
      risks: [
        "Hội chứng quá kích buồng trứng",
        "Thai đa thai",
        "Xuất huyết, nhiễm trùng nhẹ",
        "Stress tâm lý",
        "Chi phí cao",
      ],
    },
    {
      id: "iui",
      title: "IUI - Bơm tinh trùng vào buồng tử cung",
      icon: "💉",
      shortDesc: "Phương pháp đơn giản, ít xâm lấn với chi phí hợp lý",
      fullDesc:
        "IUI (Intrauterine Insemination) là kỹ thuật đưa tinh trùng đã được xử lý trực tiếp vào buồng tử cung vào thời điểm phụ nữ rụng trứng. Đây là phương pháp đơn giản, ít xâm lấn và được nhiều cặp vợ chồng lựa chọn làm bước đầu trong điều trị hiếm muộn.",
      price: "5.000.000 - 15.000.000 VNĐ",
      duration: "2-4 tuần",
      successRate: "15-25%",
      suitableFor: [
        "Cổ tử cung có vấn đề về niêm dịch",
        "Tinh trùng yếu, ít hoặc chậm chạp",
        "Hiếm muộn không rõ nguyên nhân",
        "Vấn đề về xuất tinh hoặc cương dương",
        "Sử dụng tinh trùng hiến tặng",
      ],
      process: [
        {
          step: 1,
          title: "Theo dõi chu kỳ rụng trứng",
          desc: "Siêu âm và xét nghiệm hormone để xác định thời điểm rụng trứng",
          time: "10-14 ngày",
        },
        {
          step: 2,
          title: "Chuẩn bị tinh trùng",
          desc: "Xử lý tinh dịch để tách lọc tinh trùng khỏe mạnh và nhanh nhẹn",
          time: "2-3 giờ",
        },
        {
          step: 3,
          title: "Thực hiện IUI",
          desc: "Đưa tinh trùng vào buồng tử cung qua ống thông mềm, không đau",
          time: "15-30 phút",
        },
        {
          step: 4,
          title: "Hỗ trợ hoàng thể",
          desc: "Sử dụng thuốc progesterone để hỗ trợ làm tổ của phôi",
          time: "14 ngày",
        },
        {
          step: 5,
          title: "Kiểm tra kết quả",
          desc: "Xét nghiệm beta-HCG để xác định có thai hay không",
          time: "14 ngày",
        },
      ],
      advantages: [
        "Chi phí thấp hơn nhiều so với IVF",
        "Thủ thuật đơn giản, ít xâm lấn",
        "Không cần gây mê hoặc phẫu thuật",
        "Thời gian điều trị ngắn",
        "Ít tác dụng phụ và biến chứng",
      ],
      risks: [
        "Tỷ lệ thành công thấp hơn IVF",
        "Thai đa thai (nếu dùng thuốc kích thích)",
        "Nhiễm trùng nhẹ",
        "Khó chịu nhẹ sau thủ thuật",
        "Cần lặp lại nhiều chu kỳ",
      ],
    },
  ];

  return (
    <div className="services-container">
      {/* Back to Home Button */}
      <button className="back-to-home-btn" onClick={handleBackToHome}>
        <span className="back-icon">←</span>
        <span className="back-text">Trang chủ</span>
      </button>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button className="back-to-top-btn" onClick={scrollToTop}>
          <span>⬆️</span>
        </button>
      )}

      {/* Header Section */}
      <div className="services-header">
        <h1 className="services-title">Dịch vụ hỗ trợ sinh sản</h1>
        <p className="services-subtitle">
          Chúng tôi cung cấp các giải pháp hỗ trợ sinh sản hiện đại, an toàn và
          hiệu quả nhất
        </p>
      </div>

      {/* Services Overview */}
      <div className="services-overview">
        <div className="services-grid">
          {services.map((service) => (
            <div
              key={service.id}
              className={`service-card ${
                activeService === service.id ? "active" : ""
              }`}
              onClick={() =>
                setActiveService(
                  activeService === service.id ? null : service.id
                )
              }
            >
              <div className="service-card-header">
                <div className="service-icon">{service.icon}</div>
                <h3 className="service-title">{service.title}</h3>
              </div>
              <p className="service-short-desc">{service.shortDesc}</p>

              <div className="service-quick-info">
                <div className="quick-info-item">
                  <span className="info-label">Chi phí:</span>
                  <span className="info-value">{service.price}</span>
                </div>
                <div className="quick-info-item">
                  <span className="info-label">Thời gian:</span>
                  <span className="info-value">{service.duration}</span>
                </div>
                <div className="quick-info-item">
                  <span className="info-label">Tỷ lệ thành công:</span>
                  <span className="info-value success-rate">
                    {service.successRate}
                  </span>
                </div>
              </div>

              <button className="learn-more-btn">
                {activeService === service.id ? "Thu gọn" : "Tìm hiểu thêm"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Service Information */}
      {activeService && (
        <div className="service-details">
          {services
            .filter((service) => service.id === activeService)
            .map((service) => (
              <div key={service.id} className="service-detail-content">
                <div className="detail-header">
                  <div className="detail-icon">{service.icon}</div>
                  <h2>{service.title}</h2>
                </div>

                <div className="detail-sections">
                  {/* Description */}
                  <div className="detail-section">
                    <h3>📋 Mô tả chi tiết</h3>
                    <p>{service.fullDesc}</p>
                  </div>

                  {/* Suitable For */}
                  <div className="detail-section">
                    <h3>👥 Phù hợp với</h3>
                    <ul className="suitable-list">
                      {service.suitableFor.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Process */}
                  <div className="detail-section">
                    <h3>⚕️ Quy trình thực hiện</h3>
                    <div className="process-timeline">
                      {service.process.map((step) => (
                        <div key={step.step} className="process-step">
                          <div className="step-number">{step.step}</div>
                          <div className="step-content">
                            <h4>{step.title}</h4>
                            <p>{step.desc}</p>
                            <span className="step-time">⏱️ {step.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Advantages & Risks */}
                  <div className="pros-cons-section">
                    <div className="pros-section">
                      <h3>✅ Ưu điểm</h3>
                      <ul className="pros-list">
                        {service.advantages.map((advantage, index) => (
                          <li key={index}>{advantage}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="cons-section">
                      <h3>⚠️ Rủi ro và lưu ý</h3>
                      <ul className="cons-list">
                        {service.risks.map((risk, index) => (
                          <li key={index}>{risk}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* CTA Section */}
                  <div className="service-cta">
                    <div className="cta-content">
                      <h3>Sẵn sàng bắt đầu hành trình?</h3>
                      <p>
                        Đội ngũ chuyên gia của chúng tôi sẽ tư vấn chi tiết và
                        đồng hành cùng bạn
                      </p>
                      <div className="cta-buttons">
                        <button
                          className="cta-btn primary"
                          onClick={handleBookingClick}
                        >
                          <span className="btn-icon">📞</span>
                          Tư vấn miễn phí
                        </button>
                        <button className="cta-btn secondary">
                          <span className="btn-icon">📅</span>
                          Đặt lịch khám
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* FAQ Section */}
      <div className="faq-section">
        <h2>Câu hỏi thường gặp</h2>
        <div className="faq-grid">
          <div className="faq-item">
            <h4>❓ Tôi nên chọn IVF hay IUI?</h4>
            <p>
              Lựa chọn phụ thuộc vào nguyên nhân hiếm muộn, tuổi tác, tình trạng
              sức khỏe và khả năng tài chính. Bác sĩ sẽ tư vấn phương pháp phù
              hợp nhất cho từng trường hợp.
            </p>
          </div>
          <div className="faq-item">
            <h4>❓ Các phương pháp này có an toàn không?</h4>
            <p>
              Cả IVF và IUI đều là các phương pháp an toàn khi được thực hiện
              bởi đội ngũ chuyên gia có kinh nghiệm. Tỷ lệ biến chứng rất thấp.
            </p>
          </div>
          <div className="faq-item">
            <h4>❓ Cần chuẩn bị gì trước khi điều trị?</h4>
            <p>
              Cần khám tổng quát, xét nghiệm đầy đủ, tư vấn dinh dưỡng và tâm
              lý. Bỏ thuốc lá, rượu bia và duy trì lối sống lành mạnh.
            </p>
          </div>
          <div className="faq-item">
            <h4>❓ Bảo hiểm có chi trả không?</h4>
            <p>
              Một số bảo hiểm y tế có hỗ trợ chi phí điều trị hiếm muộn. Bạn nên
              kiểm tra với công ty bảo hiểm để biết chi tiết.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bottom-cta">
        <div className="bottom-cta-content">
          <h2>Bắt đầu hành trình tìm kiếm hạnh phúc</h2>
          <p>
            Đừng để thời gian trôi qua, hãy liên hệ với chúng tôi ngay hôm nay!
          </p>
          <button className="bottom-cta-btn" onClick={handleBookingClick}>
            <span className="btn-icon">💬</span>
            Đặt lịch khám
          </button>
        </div>
      </div>
    </div>
  );
};

export default Services;
