import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Services.css";

const Services = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [activeService, setActiveService] = useState(null);
  const [selectedComparison, setSelectedComparison] = useState("overview");

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.pageYOffset > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      subtitle: "In Vitro Fertilization",
      icon: "🧪",
      heroIcon: "🔬",
      shortDesc: "Công nghệ hỗ trợ sinh sản tiên tiến nhất hiện nay",
      fullDesc:
        "IVF (In Vitro Fertilization) là kỹ thuật thụ tinh trong ống nghiệm được coi là đỉnh cao của công nghệ hỗ trợ sinh sản. Quy trình này bao gồm việc lấy trứng từ buồng trứng, thụ tinh với tinh trùng trong môi trường phòng thí nghiệm được kiểm soát hoàn hảo, sau đó chuyển phôi chất lượng tốt nhất vào tử cung của người mẹ.",
      price: "80.000.000 - 150.000.000 VNĐ",
      duration: "2-3 tháng",
      successRate: "65-80%",
      pregnancyRate: "70-85%",
      idealAge: "Dưới 35 tuổi",
      consultationPrice: "500.000 VNĐ",

      highlights: [
        "Tỷ lệ thành công cao nhất trong các phương pháp HTSS",
        "Kiểm soát hoàn toàn chất lượng phôi",
        "Có thể chẩn đoán di truyền trước làm tổ (PGT)",
        "Bảo quản phôi dư để sử dụng sau",
        "Phù hợp với nhiều nguyên nhân hiếm muộn",
      ],

      suitableFor: [
        "Tắc vòi trứng hoàn toàn hoặc không thể phẫu thuật",
        "Nam giới có tinh trùng rất ít hoặc chất lượng kém",
        "Nội mạc tử cung lạc chỗ độ III-IV",
        "Rối loạn rụng trứng không đáp ứng với điều trị",
        "Hiếm muộn không rõ nguyên nhân trên 2 năm",
        "Thất bại với IUI từ 3-4 chu kỳ",
        "Tuổi mẹ trên 35 và muốn có con nhanh",
        "Cần chẩn đoán di truyền tiền làm tổ",
      ],

      process: [
        {
          step: 1,
          title: "Khám và tư vấn ban đầu",
          desc: "Đánh giá toàn diện tình trạng sinh sản, xét nghiệm máu, siêu âm, HSG, đánh giá tinh dịch đồ",
          time: "3-7 ngày",
          details:
            "Khám phụ khoa, siêu âm âm đạo, xét nghiệm hormone cơ bản (FSH, LH, E2, AMH), xét nghiệm tinh dịch đồ chi tiết",
        },
        {
          step: 2,
          title: "Kích thích buồng trứng có kiểm soát",
          desc: "Tiêm hormone FSH/LH để kích thích phát triển nhiều nang trứng, theo dõi bằng siêu âm và xét nghiệm",
          time: "8-12 ngày",
          details:
            "Tiêm Gonal-F, Puregon hoặc Menopur, theo dõi siêu âm 3-4 lần, xét nghiệm E2, có thể dùng thêm thuốc chống rụng trứng sớm",
        },
        {
          step: 3,
          title: "Tiêm HCG và lấy trứng",
          desc: "Tiêm HCG để trứng chín cuối cùng, sau 34-36h tiến hành lấy trứng qua siêu âm âm đạo",
          time: "1-2 ngày",
          details:
            "Gây mê nhẹ, dùng kim lấy trứng qua âm đạo, thường lấy được 8-15 trứng, thời gian 15-30 phút",
        },
        {
          step: 4,
          title: "Thụ tinh và nuôi cấy phôi",
          desc: "Kết hợp trứng và tinh trùng trong phòng lab, theo dõi sự phát triển của phôi 3-5 ngày",
          time: "3-5 ngày",
          details:
            "IVF cổ điển hoặc ICSI, nuôi phôi trong tủ ấm CO2, theo dõi quá trình phân chia tế bào, đánh giá chất lượng phôi",
        },
        {
          step: 5,
          title: "Chuyển phôi vào tử cung",
          desc: "Chọn 1-2 phôi tốt nhất để chuyển vào tử cung, bảo quản phôi dư bằng đông lạnh",
          time: "1 ngày",
          details:
            "Dùng ống thông mềm, không cần gây mê, thời gian 5-10 phút, nghỉ ngơi 30 phút sau đó",
        },
        {
          step: 6,
          title: "Hỗ trợ hoàng thể và theo dõi",
          desc: "Sử dụng progesterone hỗ trợ, xét nghiệm beta-HCG sau 12-14 ngày, siêu âm xác nhận thai",
          time: "14-21 ngày",
          details:
            "Dùng progesterone âm đạo hoặc tiêm, xét nghiệm máu định lượng beta-HCG, siêu âm thai 4-5 tuần",
        },
      ],

      advantages: [
        "Tỷ lệ thành công cao nhất (65-80% tùy tuổi)",
        "Kiểm soát hoàn toàn quá trình thụ tinh",
        "Có thể chọn lọc phôi tốt nhất",
        "Giảm nguy cơ thai ngoài tử cung",
        "Có thể làm chẩn đoán di truyền trước làm tổ",
        "Bảo quản phôi dư cho lần sau",
        "Phù hợp nhiều nguyên nhân hiếm muộn",
        "Có thể điều chỉnh thời gian có thai",
      ],

      risks: [
        "Hội chứng quá kích buồng trứng (5-10%)",
        "Thai đa thai nếu chuyển nhiều phôi",
        "Xuất huyết, nhiễm trùng nhẹ khi lấy trứng",
        "Stress tâm lý do áp lực thành công",
        "Chi phí cao, có thể cần nhiều chu kỳ",
        "Tác dụng phụ của thuốc hormone",
        "Nguy cơ sẩy thai sớm như thai tự nhiên",
      ],

      costs: [
        {
          item: "Khám tư vấn và xét nghiệm",
          price: "3.000.000 - 5.000.000 VNĐ",
        },
        {
          item: "Thuốc kích thích buồng trứng",
          price: "15.000.000 - 25.000.000 VNĐ",
        },
        { item: "Thủ thuật lấy trứng", price: "8.000.000 - 12.000.000 VNĐ" },
        {
          item: "Thụ tinh và nuôi cấy phôi",
          price: "10.000.000 - 15.000.000 VNĐ",
        },
        { item: "Chuyển phôi", price: "5.000.000 - 8.000.000 VNĐ" },
        { item: "Theo dõi và hỗ trợ", price: "3.000.000 - 5.000.000 VNĐ" },
        {
          item: "Đông lạnh phôi dư (nếu có)",
          price: "2.000.000 - 3.000.000 VNĐ",
        },
      ],
    },
    {
      id: "iui",
      title: "IUI - Bơm tinh trùng vào buồng tử cung",
      subtitle: "Intrauterine Insemination",
      icon: "💉",
      heroIcon: "🏥",
      shortDesc: "Phương pháp đơn giản, tự nhiên với chi phí hợp lý",
      fullDesc:
        "IUI (Intrauterine Insemination) là kỹ thuật đưa tinh trùng đã được xử lý và cô đặc trực tiếp vào buồng tử cung vào thời điểm phụ nữ rụng trứng. Đây là phương pháp hỗ trợ sinh sản ít xâm lấn, gần với quá trình thụ thai tự nhiên và thường được lựa chọn làm bước đầu tiên trong điều trị hiếm muộn.",
      price: "8.000.000 - 15.000.000 VNĐ",
      duration: "2-4 tuần",
      successRate: "15-25%",
      pregnancyRate: "20-30%",
      idealAge: "Dưới 38 tuổi",
      consultationPrice: "300.000 VNĐ",

      highlights: [
        "Quy trình đơn giản, ít xâm lấn",
        "Chi phí thấp hơn đáng kể so với IVF",
        "Gần với quá trình thụ thai tự nhiên",
        "Không cần gây mê hay phẫu thuật",
        "Thời gian điều trị ngắn",
      ],

      suitableFor: [
        "Cổ tử cung có vấn đề về niêm dịch hoặc kháng thể",
        "Tinh trùng yếu, ít hoặc chậm chạp nhẹ",
        "Rối loạn xuất tinh hoặc cương dương",
        "Hiếm muộn không rõ nguyên nhân dưới 3 năm",
        "Rối loạn rụng trứng nhẹ",
        "Nội mạc tử cung lạc chỗ độ I-II",
        "Yếu tố tâm lý ảnh hưởng quan hệ",
        "Sử dụng tinh trùng hiến tặng",
      ],

      process: [
        {
          step: 1,
          title: "Khám và đánh giá ban đầu",
          desc: "Khám phụ khoa, siêu âm, xét nghiệm hormone cơ bản, đánh giá tinh dịch đồ và HSG",
          time: "3-5 ngày",
          details:
            "Khám phụ khoa, siêu âm âm đạo, xét nghiệm hormone (FSH, LH, E2), tinh dịch đồ, chụp HSG đánh giá vòi trứng",
        },
        {
          step: 2,
          title: "Theo dõi chu kỳ và kích thích nhẹ",
          desc: "Theo dõi nang trứng tự nhiên hoặc kích thích nhẹ bằng Clomid/Letrozole, siêu âm theo dõi",
          time: "8-12 ngày",
          details:
            "Có thể dùng chu kỳ tự nhiên hoặc kích thích nhẹ, siêu âm theo dõi kích thước nang trứng, xét nghiệm LH",
        },
        {
          step: 3,
          title: "Tiêm HCG kích thích rụng trứng",
          desc: "Khi nang trứng đạt 18-20mm, tiêm HCG để kích thích rụng trứng trong 36-40h",
          time: "1 ngày",
          details:
            "Tiêm HCG 5000-10000 đơn vị, có thể tiêm tại nhà hoặc bệnh viện, hẹn lịch IUI sau 36-40h",
        },
        {
          step: 4,
          title: "Xử lý tinh trùng",
          desc: "Lấy tinh dịch, xử lý trong phòng lab để tách lọc tinh trùng khỏe mạnh và nhanh nhẹn",
          time: "2-3 giờ",
          details:
            "Chuẩn bị tinh dịch bằng phương pháp swim-up hoặc gradient, cô đặc tinh trùng tốt nhất",
        },
        {
          step: 5,
          title: "Thực hiện IUI",
          desc: "Đưa tinh trùng đã xử lý vào buồng tử cung qua ống thông mềm, thủ thuật không đau",
          time: "15-30 phút",
          details:
            "Dùng ống thông mềm đưa tinh trùng qua cổ tử cung vào buồng tử cung, không gây mê, nghỉ 15-30 phút",
        },
        {
          step: 6,
          title: "Hỗ trợ hoàng thể và theo dõi",
          desc: "Sử dụng progesterone hỗ trợ, xét nghiệm thai sau 14 ngày, có thể lặp lại nếu không thành công",
          time: "14 ngày",
          details:
            "Dùng progesterone âm đạo, xét nghiệm beta-HCG sau 14 ngày, có thể thực hiện 3-4 chu kỳ",
        },
      ],

      advantages: [
        "Chi phí thấp, dễ tiếp cận",
        "Thủ thuật đơn giản, ít xâm lấn",
        "Không cần gây mê hoặc phẫu thuật",
        "Thời gian điều trị ngắn",
        "Ít tác dụng phụ và biến chứng",
        "Gần với quá trình thụ thai tự nhiên",
        "Có thể lặp lại nhiều lần",
        "Stress tâm lý thấp hơn",
      ],

      risks: [
        "Tỷ lệ thành công thấp hơn IVF",
        "Thai đa thai nếu dùng thuốc kích thích",
        "Nhiễm trùng nhẹ (rất hiếm)",
        "Khó chịu nhẹ sau thủ thuật",
        "Cần lặp lại nhiều chu kỳ",
        "Không phù hợp với nhiều nguyên nhân",
        "Yêu cầu vòi trứng thông",
      ],

      costs: [
        {
          item: "Khám tư vấn và xét nghiệm",
          price: "1.500.000 - 2.500.000 VNĐ",
        },
        {
          item: "Theo dõi siêu âm (2-3 lần)",
          price: "600.000 - 1.000.000 VNĐ",
        },
        {
          item: "Thuốc kích thích nhẹ (nếu cần)",
          price: "500.000 - 1.500.000 VNĐ",
        },
        { item: "Tiêm HCG", price: "200.000 - 400.000 VNĐ" },
        { item: "Xử lý tinh trùng", price: "1.000.000 - 2.000.000 VNĐ" },
        { item: "Thủ thuật IUI", price: "2.000.000 - 3.000.000 VNĐ" },
        { item: "Thuốc hỗ trợ hoàng thể", price: "300.000 - 500.000 VNĐ" },
      ],
    },
  ];

  const comparisonData = {
    overview: [
      { criteria: "Tỷ lệ thành công", ivf: "65-80%", iui: "15-25%" },
      {
        criteria: "Chi phí trung bình",
        ivf: "80-150 triệu VNĐ",
        iui: "8-15 triệu VNĐ",
      },
      { criteria: "Thời gian điều trị", ivf: "2-3 tháng", iui: "2-4 tuần" },
      {
        criteria: "Độ xâm lấn",
        ivf: "Cao (gây mê, lấy trứng)",
        iui: "Thấp (không gây mê)",
      },
      { criteria: "Tuổi tối ưu", ivf: "Dưới 40 tuổi", iui: "Dưới 38 tuổi" },
    ],
    process: [
      {
        criteria: "Chuẩn bị",
        ivf: "Kích thích buồng trứng 8-12 ngày",
        iui: "Theo dõi tự nhiên hoặc kích thích nhẹ",
      },
      {
        criteria: "Thủ thuật chính",
        ivf: "Lấy trứng + Thụ tinh ngoài cơ thể",
        iui: "Bơm tinh trùng vào tử cung",
      },
      { criteria: "Gây mê", ivf: "Có (khi lấy trứng)", iui: "Không cần" },
      { criteria: "Thời gian phục hồi", ivf: "1-2 ngày", iui: "Vài giờ" },
      {
        criteria: "Số lần thực hiện",
        ivf: "1-3 lần thường đủ",
        iui: "3-6 lần mới đánh giá",
      },
    ],
    suitability: [
      {
        criteria: "Tắc vòi trứng",
        ivf: "Phù hợp hoàn toàn",
        iui: "Không phù hợp",
      },
      {
        criteria: "Tinh trùng yếu nặng",
        ivf: "Rất phù hợp (ICSI)",
        iui: "Ít hiệu quả",
      },
      {
        criteria: "Tuổi cao (>38)",
        ivf: "Ưu tiên lựa chọn",
        iui: "Hiệu quả giảm nhiều",
      },
      {
        criteria: "Hiếm muộn không rõ nguyên nhân",
        ivf: "Hiệu quả cao",
        iui: "Thử nghiệm đầu tiên",
      },
      { criteria: "Nội mạc lạc chỗ nặng", ivf: "Phù hợp", iui: "Ít hiệu quả" },
    ],
  };

  return (
    <div className="services-container">
      {/* Back to Home Button - Only show when not on homepage */}
      {location.pathname !== "/" && (
        <button className="back-to-home-btn" onClick={() => navigate("/")}>
          <span className="back-icon">←</span>
          <span className="back-text">Trang chủ</span>
        </button>
      )}

      {/* Back to Top Button */}
      {showBackToTop && (
        <button className="back-to-top-btn" onClick={scrollToTop}>
          <span>⬆️</span>
        </button>
      )}

      {/* Hero Section */}
      <div className="services-hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Dịch vụ hỗ trợ sinh sản
            <span className="title-highlight">chuyên nghiệp</span>
          </h1>
          <p className="hero-subtitle">
            Chúng tôi chuyên cung cấp hai phương pháp hỗ trợ sinh sản hiện đại
            và hiệu quả nhất:
            <strong> IVF và IUI</strong>. Với đội ngũ chuyên gia hàng đầu và
            công nghệ tiên tiến, chúng tôi đồng hành cùng bạn trên hành trình
            tìm kiếm hạnh phúc.
          </p>

          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-icon">👥</span>
              <span className="stat-number">15,000+</span>
              <span className="stat-label">Cặp vợ chồng đã thành công</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🏆</span>
              <span className="stat-number">80%</span>
              <span className="stat-label">Tỷ lệ thành công IVF</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">⚕️</span>
              <span className="stat-number">20+</span>
              <span className="stat-label">Năm kinh nghiệm</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Comparison */}
      <div className="quick-comparison">
        <h2>So sánh nhanh IVF vs IUI</h2>
        <div className="comparison-tabs">
          <button
            className={`tab-btn ${
              selectedComparison === "overview" ? "active" : ""
            }`}
            onClick={() => setSelectedComparison("overview")}
          >
            Tổng quan
          </button>
          <button
            className={`tab-btn ${
              selectedComparison === "process" ? "active" : ""
            }`}
            onClick={() => setSelectedComparison("process")}
          >
            Quy trình
          </button>
          <button
            className={`tab-btn ${
              selectedComparison === "suitability" ? "active" : ""
            }`}
            onClick={() => setSelectedComparison("suitability")}
          >
            Phù hợp
          </button>
        </div>

        <div className="comparison-table">
          <div className="table-header">
            <div className="criteria-col">Tiêu chí</div>
            <div className="ivf-col">
              <span className="service-icon">🧪</span>
              IVF
            </div>
            <div className="iui-col">
              <span className="service-icon">💉</span>
              IUI
            </div>
          </div>

          {comparisonData[selectedComparison].map((row, index) => (
            <div key={index} className="table-row">
              <div className="criteria-cell">{row.criteria}</div>
              <div className="ivf-cell">{row.ivf}</div>
              <div className="iui-cell">{row.iui}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Services Overview Cards */}
      <div className="services-overview">
        <h2>Lựa chọn dịch vụ phù hợp</h2>
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
              <div className="service-hero">
                <div className="service-icon-large">{service.heroIcon}</div>
                <div className="service-header">
                  <h3 className="service-title">{service.title}</h3>
                  <p className="service-subtitle">{service.subtitle}</p>
                </div>
              </div>

              <p className="service-description">{service.shortDesc}</p>

              <div className="service-highlights">
                {service.highlights.slice(0, 3).map((highlight, index) => (
                  <div key={index} className="highlight-item">
                    <span className="highlight-icon">✨</span>
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>

              <div className="service-stats">
                <div className="stat">
                  <span className="stat-label">Tỷ lệ thành công</span>
                  <span className="stat-value success">
                    {service.successRate}
                  </span>
                </div>
                <div className="stat">
                  <span className="stat-label">Chi phí</span>
                  <span className="stat-value">{service.price}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Thời gian</span>
                  <span className="stat-value">{service.duration}</span>
                </div>
              </div>

              <button className="service-action-btn">
                {activeService === service.id
                  ? "Thu gọn thông tin"
                  : "Xem chi tiết"}
                <span className="btn-arrow">
                  {activeService === service.id ? "↑" : "↓"}
                </span>
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
              <div key={service.id} className="service-detail-container">
                <div className="detail-hero">
                  <span className="detail-icon">{service.heroIcon}</span>
                  <h2>{service.title}</h2>
                  <p>{service.fullDesc}</p>
                </div>

                <div className="detail-sections">
                  {/* Key Information */}
                  <div className="detail-section key-info">
                    <h3>🎯 Thông tin cơ bản</h3>
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="info-label">Tỷ lệ thành công</span>
                        <span className="info-value success">
                          {service.successRate}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Tỷ lệ có thai</span>
                        <span className="info-value">
                          {service.pregnancyRate}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Tuổi lý tưởng</span>
                        <span className="info-value">{service.idealAge}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Phí tư vấn</span>
                        <span className="info-value">
                          {service.consultationPrice}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Suitable For */}
                  <div className="detail-section">
                    <h3>👥 Phù hợp với những trường hợp</h3>
                    <div className="suitable-grid">
                      {service.suitableFor.map((item, index) => (
                        <div key={index} className="suitable-item">
                          <span className="suitable-icon">✅</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Process Timeline */}
                  <div className="detail-section">
                    <h3>⚕️ Quy trình thực hiện chi tiết</h3>
                    <div className="process-timeline">
                      {service.process.map((step) => (
                        <div key={step.step} className="process-step">
                          <div className="step-number">{step.step}</div>
                          <div className="step-content">
                            <h4>{step.title}</h4>
                            <p>{step.desc}</p>
                            <div className="step-details">
                              <span className="step-time">⏱️ {step.time}</span>
                              <div className="step-more-info">
                                <strong>Chi tiết:</strong> {step.details}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Advantages & Risks */}
                  <div className="pros-cons-section">
                    <div className="pros-section">
                      <h3>✅ Ưu điểm vượt trội</h3>
                      <div className="pros-grid">
                        {service.advantages.map((advantage, index) => (
                          <div key={index} className="pros-item">
                            <span className="pros-icon">🌟</span>
                            <span>{advantage}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="cons-section">
                      <h3>⚠️ Rủi ro và lưu ý</h3>
                      <div className="cons-grid">
                        {service.risks.map((risk, index) => (
                          <div key={index} className="cons-item">
                            <span className="cons-icon">⚠️</span>
                            <span>{risk}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Cost Breakdown */}
                  <div className="detail-section cost-section">
                    <h3>💰 Chi phí chi tiết</h3>
                    <div className="cost-breakdown">
                      {service.costs.map((cost, index) => (
                        <div key={index} className="cost-item">
                          <span className="cost-name">{cost.item}</span>
                          <span className="cost-price">{cost.price}</span>
                        </div>
                      ))}
                      <div className="cost-total">
                        <span className="cost-name">
                          <strong>Tổng chi phí dự kiến</strong>
                        </span>
                        <span className="cost-price total">
                          {service.price}
                        </span>
                      </div>
                    </div>
                    <div className="cost-note">
                      <p>
                        <strong>Lưu ý:</strong> Chi phí có thể thay đổi tùy
                        thuộc vào tình trạng cụ thể của từng bệnh nhân và các
                        dịch vụ bổ sung được yêu cầu.
                      </p>
                    </div>
                  </div>

                  {/* Call to Action */}
                  <div className="service-cta">
                    <div className="cta-content">
                      <h3>Sẵn sàng bắt đầu hành trình của bạn?</h3>
                      <p>
                        Đội ngũ chuyên gia của chúng tôi sẽ tư vấn chi tiết và
                        đồng hành cùng bạn trong suốt quá trình điều trị
                      </p>
                      <div className="cta-buttons">
                        <button
                          className="cta-btn primary"
                          onClick={handleBookingClick}
                        >
                          <span className="btn-icon">📞</span>
                          Đặt lịch tư vấn
                        </button>
                        <button
                          className="cta-btn secondary"
                          onClick={() => window.open("tel:0123456789")}
                        >
                          <span className="btn-icon">💬</span>
                          Gọi tư vấn ngay
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
            <h4>❓ Làm sao để biết nên chọn IVF hay IUI?</h4>
            <p>
              Lựa chọn phụ thuộc vào nhiều yếu tố: nguyên nhân hiếm muộn, tuổi
              tác, tình trạng sức khỏe sinh sản, thời gian hiếm muộn và khả năng
              tài chính. Bác sĩ sẽ đánh giá toàn diện và tư vấn phương pháp phù
              hợp nhất.
            </p>
          </div>
          <div className="faq-item">
            <h4>❓ Tỷ lệ thành công phụ thuộc vào yếu tố nào?</h4>
            <p>
              Tuổi của người mẹ là yếu tố quan trọng nhất. Ngoài ra còn có: chất
              lượng tinh trùng, nguyên nhân hiếm muộn, thời gian hiếm muộn, tình
              trạng sức khỏe tổng quát và kinh nghiệm của đội ngũ y tế.
            </p>
          </div>
          <div className="faq-item">
            <h4>❓ Có cần chuẩn bị gì đặc biệt trước khi điều trị?</h4>
            <p>
              Nên khám tổng quát, xét nghiệm đầy đủ, bổ sung acid folic, vitamin
              D. Bỏ thuốc lá, rượu bia, duy trì cân nặng hợp lý, tập thể dục nhẹ
              nhàng và giữ tinh thần thoải mái.
            </p>
          </div>
          <div className="faq-item">
            <h4>❓ Bảo hiểm y tế có hỗ trợ chi phí không?</h4>
            <p>
              Hiện tại bảo hiểm xã hội chưa chi trả cho các phương pháp hỗ trợ
              sinh sản. Tuy nhiên, một số bảo hiểm tư nhân có gói hỗ trợ. Bạn
              nên kiểm tra với công ty bảo hiểm để biết chi tiết.
            </p>
          </div>
          <div className="faq-item">
            <h4>❓ Sau bao nhiêu lần thất bại thì nên chuyển phương pháp?</h4>
            <p>
              Với IUI: sau 3-4 chu kỳ thất bại nên cân nhắc chuyển sang IVF. Với
              IVF: sau 2-3 chu kỳ thất bại cần đánh giá lại và có thể thay đổi
              phác đồ điều trị hoặc xem xét các phương pháp khác.
            </p>
          </div>
          <div className="faq-item">
            <h4>❓ Có thể làm nhiều chu kỳ liên tiếp không?</h4>
            <p>
              Nên nghỉ ít nhất 1-2 chu kỳ kinh nguyệt giữa các lần điều trị để
              cơ thể hồi phục. Điều này giúp tăng hiệu quả điều trị và giảm
              stress tâm lý. Bác sĩ sẽ tư vấn lịch trình phù hợp.
            </p>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="final-cta">
        <div className="final-cta-content">
          <h2>Đừng để thời gian trôi qua</h2>
          <p>
            Mỗi ngày trôi qua là một cơ hội ít đi. Hãy liên hệ với chúng tôi
            ngay hôm nay để được tư vấn miễn phí và bắt đầu hành trình tìm kiếm
            hạnh phúc của bạn.
          </p>
          <div className="final-cta-features">
            <div className="cta-feature">
              <span className="feature-icon">🆓</span>
              <span>Tư vấn miễn phí</span>
            </div>
            <div className="cta-feature">
              <span className="feature-icon">👨‍⚕️</span>
              <span>Chuyên gia hàng đầu</span>
            </div>
            <div className="cta-feature">
              <span className="feature-icon">🏆</span>
              <span>Công nghệ tiên tiến</span>
            </div>
          </div>
          <button className="final-cta-btn" onClick={handleBookingClick}>
            <span className="btn-icon">💝</span>
            Bắt đầu hành trình hạnh phúc
          </button>
        </div>
      </div>
    </div>
  );
};

export default Services;
