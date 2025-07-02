import React from "react";
import "./ServicesList.css";
import { useNavigate } from "react-router-dom";

const services = [
  {
    id: "ivf",
    title: "IVF – Thụ tinh trong ống nghiệm",
    subtitle: "In Vitro Fertilization",
    price: "80.000.000 - 150.000.000 VNĐ",
    description:
      "Công nghệ hỗ trợ sinh sản tiên tiến nhất hiện nay với tỷ lệ thành công cao. Quy trình IVF bao gồm việc lấy trứng từ buồng trứng, thụ tinh với tinh trùng trong môi trường phòng thí nghiệm được kiểm soát hoàn hảo, sau đó chuyển phôi chất lượng tốt nhất vào tử cung.",
    icon: "🔬",
    duration: "2-3 tháng",
    successRate: "65-80%",
    pregnancyRate: "70-85%",
    idealAge: "Dưới 35 tuổi",
    featured: true,
    highlights: [
      "Tỷ lệ thành công cao nhất trong các phương pháp HTSS",
      "Kiểm soát hoàn toàn chất lượng phôi trước khi chuyển",
      "Có thể chẩn đoán di truyền trước làm tổ (PGT-A, PGT-M)",
      "Bảo quản phôi dư bằng đông lạnh để sử dụng sau này",
      "Phù hợp với hầu hết các nguyên nhân hiếm muộn",
      "Công nghệ ICSI giúp xử lý tinh trùng yếu",
    ],
    detailedFeatures: [
      {
        icon: "🎯",
        title: "Tỷ lệ thành công vượt trội",
        desc: "65-80% tùy theo độ tuổi và tình trạng sức khỏe",
        details: "Cao nhất trong tất cả phương pháp hỗ trợ sinh sản",
      },
      {
        icon: "🔬",
        title: "Kiểm soát chất lượng tối ưu",
        desc: "Theo dõi và đánh giá từng giai đoạn phát triển phôi",
        details: "Chọn lọc phôi tốt nhất có khả năng làm tổ cao",
      },
      {
        icon: "🧬",
        title: "Chẩn đoán di truyền tiền làm tổ",
        desc: "PGT-A (sàng lọc bất thường nhiễm sắc thể)",
        details: "Giảm nguy cơ sẩy thai và sinh con khuyết tật",
      },
      {
        icon: "❄️",
        title: "Đông lạnh phôi tiên tiến",
        desc: "Công nghệ vitrification bảo quản phôi dư",
        details: "Tỷ lệ sống sót phôi sau rã đông > 95%",
      },
      {
        icon: "⚕️",
        title: "Kỹ thuật ICSI tích hợp",
        desc: "Tiêm tinh trùng trực tiếp vào tế bào trứng",
        details: "Giải quyết vấn đề tinh trùng yếu, ít hoặc dị tật",
      },
      {
        icon: "🏥",
        title: "Môi trường phòng lab tối ưu",
        desc: "Hệ thống tủ ấm time-lapse theo dõi 24/7",
        details: "Không cần lấy phôi ra ngoài để quan sát",
      },
    ],
    processSteps: [
      {
        step: 1,
        title: "Khám và tư vấn toàn diện",
        timeframe: "3-7 ngày",
        description: "Đánh giá chi tiết tình trạng sinh sản của cặp vợ chồng",
      },
      {
        step: 2,
        title: "Kích thích buồng trứng",
        timeframe: "8-14 ngày",
        description: "Sử dụng hormone FSH/LH để phát triển nhiều nang trứng",
      },
      {
        step: 3,
        title: "Lấy trứng và tinh trùng",
        timeframe: "1 ngày",
        description: "Thủ thuật lấy trứng qua siêu âm với gây mê nhẹ",
      },
      {
        step: 4,
        title: "Thụ tinh và nuôi cấy phôi",
        timeframe: "3-6 ngày",
        description: "Kết hợp trứng-tinh trùng, theo dõi phát triển phôi",
      },
      {
        step: 5,
        title: "Chuyển phôi vào tử cung",
        timeframe: "1 ngày",
        description: "Đưa 1-2 phôi tốt nhất vào tử cung của mẹ",
      },
      {
        step: 6,
        title: "Theo dõi và xét nghiệm",
        timeframe: "14-21 ngày",
        description: "Hỗ trợ hoàng thể và kiểm tra kết quả thai",
      },
    ],
    advantages: [
      "Tỷ lệ thành công cao nhất (65-80%)",
      "Kiểm soát hoàn toàn quá trình thụ tinh",
      "Chọn lọc phôi chất lượng tốt nhất",
      "Có thể làm chẩn đoán di truyền",
      "Đông lạnh phôi dư cho lần sau",
      "Phù hợp nhiều nguyên nhân hiếm muộn",
      "Giảm nguy cơ thai ngoài tử cung",
    ],
    suitableFor: [
      "Tắc vòi trứng hoàn toàn",
      "Tinh trùng rất ít hoặc yếu nặng",
      "Nội mạc tử cung lạc chỗ độ III-IV",
      "Thất bại IUI nhiều lần",
      "Tuổi mẹ trên 35",
      "Cần chẩn đoán di truyền",
      "Hiếm muộn không rõ nguyên nhân",
    ],
  },
  {
    id: "iui",
    title: "IUI – Bơm tinh trùng vào buồng tử cung",
    subtitle: "Intrauterine Insemination",
    price: "8.000.000 - 15.000.000 VNĐ",
    description:
      "Phương pháp hỗ trợ sinh sản đơn giản, ít xâm lấn, gần với quá trình thụ thai tự nhiên. IUI là kỹ thuật đưa tinh trùng đã được xử lý và cô đặc trực tiếp vào buồng tử cung vào thời điểm phụ nữ rụng trứng, tăng cơ hội thụ thai tự nhiên.",
    icon: "💉",
    duration: "2-4 tuần",
    successRate: "15-25%",
    pregnancyRate: "20-30%",
    idealAge: "Dưới 38 tuổi",
    featured: false,
    highlights: [
      "Quy trình đơn giản, ít xâm lấn và gần tự nhiên",
      "Chi phí thấp hơn đáng kể so với IVF",
      "Không cần gây mê hay phẫu thuật phức tạp",
      "Thời gian điều trị ngắn, phù hợp bước đầu",
      "Có thể thực hiện nhiều chu kỳ liên tiếp",
      "Stress tâm lý thấp hơn các phương pháp khác",
    ],
    detailedFeatures: [
      {
        icon: "💰",
        title: "Chi phí hợp lý",
        desc: "Thấp hơn 5-10 lần so với IVF",
        details: "Phù hợp cho nhiều gia đình Việt Nam",
      },
      {
        icon: "🌿",
        title: "Ít xâm lấn",
        desc: "Không cần gây mê hay thủ thuật phức tạp",
        details: "Gần với quá trình thụ thai tự nhiên nhất",
      },
      {
        icon: "⏰",
        title: "Thời gian ngắn",
        desc: "Hoàn thành trong 2-4 tuần",
        details: "Phù hợp với lịch trình công việc bận rộn",
      },
      {
        icon: "🔄",
        title: "Có thể lặp lại",
        desc: "Thực hiện được 3-6 chu kỳ an toàn",
        details: "Tăng dần tỷ lệ thành công sau mỗi lần",
      },
      {
        icon: "🧘‍♀️",
        title: "Stress tâm lý thấp",
        desc: "Quy trình đơn giản, tự nhiên",
        details: "Giúp cặp vợ chồng thoải mái hơn",
      },
      {
        icon: "👨‍⚕️",
        title: "Thủ thuật nhanh chóng",
        desc: "Chỉ mất 15-30 phút thực hiện",
        details: "Có thể về nhà ngay sau thủ thuật",
      },
    ],
    processSteps: [
      {
        step: 1,
        title: "Khám và đánh giá ban đầu",
        timeframe: "3-5 ngày",
        description: "Khám phụ khoa, siêu âm và xét nghiệm cơ bản",
      },
      {
        step: 2,
        title: "Theo dõi chu kỳ rụng trứng",
        timeframe: "8-12 ngày",
        description: "Siêu âm theo dõi nang trứng và dự đoán rụng trứng",
      },
      {
        step: 3,
        title: "Kích thích rụng trứng",
        timeframe: "1 ngày",
        description: "Tiêm HCG để đảm bảo rụng trứng đúng thời điểm",
      },
      {
        step: 4,
        title: "Chuẩn bị tinh trùng",
        timeframe: "2-3 giờ",
        description: "Xử lý tinh dịch để tách lọc tinh trùng tốt nhất",
      },
      {
        step: 5,
        title: "Thực hiện IUI",
        timeframe: "15-30 phút",
        description: "Bơm tinh trùng vào buồng tử cung qua ống thông",
      },
      {
        step: 6,
        title: "Hỗ trợ và theo dõi",
        timeframe: "14 ngày",
        description: "Dùng progesterone hỗ trợ và kiểm tra kết quả",
      },
    ],
    advantages: [
      "Chi phí thấp, dễ tiếp cận",
      "Thủ thuật đơn giản, an toàn",
      "Không cần gây mê",
      "Thời gian điều trị ngắn",
      "Ít tác dụng phụ",
      "Gần với thụ thai tự nhiên",
      "Có thể lặp lại nhiều lần",
    ],
    suitableFor: [
      "Cổ tử cung có vấn đề niêm dịch",
      "Tinh trùng yếu, ít nhẹ đến trung bình",
      "Rối loạn xuất tinh",
      "Hiếm muộn không rõ nguyên nhân",
      "Rối loạn rụng trứng nhẹ",
      "Nội mạc lạc chỗ độ I-II",
      "Sử dụng tinh trùng hiến tặng",
    ],
  },
];

export default function ServicesList() {
  const navigate = useNavigate();

  const handleBookingClick = (serviceId) => {
    navigate(`/services/${serviceId}`);
  };

  const handleConsultationClick = () => {
    navigate("/booking");
  };

  return (
    <div className="services-container">
      {/* Hero Section */}
      <div className="services-hero">
        <h1 className="services-title">
          Dịch Vụ Hỗ Trợ Sinh Sản Chuyên Nghiệp
        </h1>
        <p className="services-subtitle">
          Chúng tôi chuyên cung cấp hai phương pháp hỗ trợ sinh sản hiện đại và
          hiệu quả nhất:
          <strong> IVF và IUI</strong>. Với đội ngũ chuyên gia hàng đầu và công
          nghệ tiên tiến, chúng tôi đồng hành cùng bạn trên hành trình tìm kiếm
          hạnh phúc làm cha mẹ.
        </p>

        <div className="services-stats">
          <div className="stat-card">
            <span className="stat-number">15,000+</span>
            <span className="stat-label">Cặp vợ chồng thành công</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">80%</span>
            <span className="stat-label">Tỷ lệ thành công IVF</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">25%</span>
            <span className="stat-label">Tỷ lệ thành công IUI</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">20+</span>
            <span className="stat-label">Năm kinh nghiệm</span>
          </div>
        </div>
      </div>

      {/* Services List */}
      <div className="services-list-container">
        <div className="services-list">
          {services.map((service, index) => (
            <div
              className={`service-card ${service.featured ? "featured" : ""}`}
              key={index}
            >
              {service.featured && (
                <div className="featured-badge">Khuyến nghị</div>
              )}

              {/* Service Header */}
              <div className="service-header-section">
                <div className="service-icon">{service.icon}</div>
                <div className="service-header-content">
                  <h3 className="service-name">{service.title}</h3>
                  <p className="service-subtitle">{service.subtitle}</p>
                  <div className="service-price">{service.price}</div>
                </div>
              </div>

              {/* Service Description */}
              <div className="service-description">{service.description}</div>

              {/* Success Rate and Key Stats */}
              <div className="service-key-stats">
                <div className="key-stat">
                  <span className="stat-label">Tỷ lệ thành công</span>
                  <span className="stat-value success">
                    {service.successRate}
                  </span>
                </div>
                <div className="key-stat">
                  <span className="stat-label">Tỷ lệ có thai</span>
                  <span className="stat-value">{service.pregnancyRate}</span>
                </div>
                <div className="key-stat">
                  <span className="stat-label">Thời gian điều trị</span>
                  <span className="stat-value">{service.duration}</span>
                </div>
                <div className="key-stat">
                  <span className="stat-label">Tuổi lý tưởng</span>
                  <span className="stat-value">{service.idealAge}</span>
                </div>
              </div>

              {/* Detailed Features */}
              <div className="detailed-features">
                <h4 className="features-title">✨ Tính năng nổi bật</h4>
                <div className="features-grid">
                  {service.detailedFeatures.map((feature, idx) => (
                    <div key={idx} className="feature-item">
                      <div className="feature-icon-large">{feature.icon}</div>
                      <div className="feature-content">
                        <h5 className="feature-title">{feature.title}</h5>
                        <p className="feature-desc">{feature.desc}</p>
                        <small className="feature-details">
                          {feature.details}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Process Overview */}
              <div className="process-overview">
                <h4 className="process-title">
                  ⚕️ Quy trình điều trị ({service.processSteps.length} bước)
                </h4>
                <div className="process-steps">
                  {service.processSteps.map((step, idx) => (
                    <div key={idx} className="process-step-mini">
                      <div className="step-number-mini">{step.step}</div>
                      <div className="step-content-mini">
                        <h6 className="step-title-mini">{step.title}</h6>
                        <p className="step-desc-mini">{step.description}</p>
                        <span className="step-time-mini">
                          ⏱️ {step.timeframe}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advantages */}
              <div className="service-advantages">
                <h4 className="advantages-title">✅ Ưu điểm vượt trội</h4>
                <div className="advantages-list">
                  {service.advantages.slice(0, 4).map((advantage, idx) => (
                    <div key={idx} className="advantage-item">
                      <span className="advantage-icon">🌟</span>
                      <span className="advantage-text">{advantage}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suitable For */}
              <div className="service-suitable">
                <h4 className="suitable-title">👥 Phù hợp với</h4>
                <div className="suitable-list">
                  {service.suitableFor.slice(0, 4).map((condition, idx) => (
                    <div key={idx} className="suitable-item">
                      <span className="suitable-icon">✅</span>
                      <span className="suitable-text">{condition}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Service Action */}
              <div className="service-action">
                <button
                  onClick={() => handleBookingClick(service.id)}
                  className="read-more"
                >
                  Tìm hiểu chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="services-cta">
        <h2 className="cta-title">Bắt đầu hành trình hạnh phúc của bạn</h2>
        <p className="cta-description">
          Đội ngũ chuyên gia giàu kinh nghiệm của chúng tôi sẵn sàng tư vấn và
          đồng hành cùng bạn trong suốt quá trình điều trị. Mỗi cặp vợ chồng đều
          có những đặc điểm riêng, chúng tôi sẽ tư vấn phương pháp phù hợp nhất
          cho bạn.
        </p>

        <div className="cta-features">
          <div className="cta-feature">
            <span className="feature-icon">🆓</span>
            <span>Tư vấn miễn phí lần đầu</span>
          </div>
          <div className="cta-feature">
            <span className="feature-icon">👨‍⚕️</span>
            <span>Chuyên gia 20+ năm kinh nghiệm</span>
          </div>
          <div className="cta-feature">
            <span className="feature-icon">🏆</span>
            <span>Công nghệ hiện đại nhất</span>
          </div>
          <div className="cta-feature">
            <span className="feature-icon">🎯</span>
            <span>Tỷ lệ thành công cao</span>
          </div>
        </div>

        <button className="cta-button" onClick={handleConsultationClick}>
          Đặt lịch tư vấn miễn phí ngay
        </button>
      </div>
    </div>
  );
}
