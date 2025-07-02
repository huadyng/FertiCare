import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ServiceDetail.css";

// Detailed service data matching the main Services page
const services = [
  {
    id: "ivf",
    title: "IVF - Thụ tinh trong ống nghiệm",
    subtitle: "In Vitro Fertilization",
    heroIcon: "🔬",
    image: "/src/assets/img/IVF.jpg",
    shortDesc: "Công nghệ hỗ trợ sinh sản tiên tiến nhất hiện nay",
    fullDesc:
      "IVF (In Vitro Fertilization) là kỹ thuật thụ tinh trong ống nghiệm được coi là đỉnh cao của công nghệ hỗ trợ sinh sản. Quy trình này bao gồm việc lấy trứng từ buồng trứng, thụ tinh với tinh trùng trong môi trường phòng thí nghiệm được kiểm soát hoàn hảo, sau đó chuyển phôi chất lượng tốt nhất vào tử cung của người mẹ.",
    price: "80.000.000 - 150.000.000 VNĐ",
    duration: "2-3 tháng",
    successRate: "65-80%",
    pregnancyRate: "70-85%",
    idealAge: "Dưới 35 tuổi",
    consultationPrice: "500.000 VNĐ",

    detailedDescription: [
      "IVF là phương pháp điều trị hiếm muộn hiện đại và hiệu quả nhất hiện nay, đặc biệt phù hợp với các trường hợp hiếm muộn phức tạp.",
      "Quy trình IVF được thực hiện trong môi trường phòng thí nghiệm tiên tiến với sự giám sát chặt chẽ của đội ngũ chuyên gia.",
      "Công nghệ hiện đại cho phép chọn lọc phôi chất lượng tốt nhất, tăng tỷ lệ thành công và giảm nguy cơ biến chứng.",
      "Phương pháp này mở ra hy vọng cho nhiều cặp vợ chồng đã thất bại với các phương pháp điều trị khác.",
    ],

    keyBenefits: [
      {
        icon: "🎯",
        title: "Tỷ lệ thành công cao",
        desc: "65-80% tùy theo tuổi và tình trạng sức khỏe",
      },
      {
        icon: "🔬",
        title: "Kiểm soát chất lượng",
        desc: "Theo dõi và đánh giá chất lượng phôi trước khi chuyển",
      },
      {
        icon: "🧬",
        title: "Chẩn đoán di truyền",
        desc: "Có thể thực hiện PGT để tầm soát bệnh di truyền",
      },
      {
        icon: "❄️",
        title: "Bảo quản phôi",
        desc: "Đông lạnh phôi dư để sử dụng cho lần sau",
      },
    ],

    processSteps: [
      {
        step: 1,
        title: "Tư vấn và đánh giá",
        duration: "3-7 ngày",
        description:
          "Khám toàn diện, xét nghiệm đầy đủ để đánh giá tình trạng sinh sản",
        details: [
          "Khám phụ khoa và nam khoa chi tiết",
          "Siêu âm âm đạo đánh giá buồng trứng và tử cung",
          "Xét nghiệm hormone: FSH, LH, E2, AMH, Prolactin",
          "Tinh dịch đồ chi tiết và đánh giá DNA tinh trùng",
          "Chụp HSG đánh giá vòi trứng và buồng tử cung",
        ],
      },
      {
        step: 2,
        title: "Kích thích buồng trứng",
        duration: "8-12 ngày",
        description:
          "Sử dụng hormone để kích thích phát triển nhiều nang trứng",
        details: [
          "Tiêm thuốc kích thích buồng trứng (Gonal-F, Puregon)",
          "Theo dõi bằng siêu âm và xét nghiệm E2 thường xuyên",
          "Điều chỉnh liều thuốc theo đáp ứng của bệnh nhân",
          "Sử dụng thuốc chống rụng trứng sớm khi cần thiết",
          "Theo dõi để tránh hội chứng quá kích buồng trứng",
        ],
      },
      {
        step: 3,
        title: "Lấy trứng",
        duration: "1 ngày",
        description: "Thủ thuật lấy trứng qua siêu âm âm đạo với gây mê nhẹ",
        details: [
          "Tiêm HCG 34-36 giờ trước khi lấy trứng",
          "Gây mê nhẹ để bệnh nhân không cảm thấy đau",
          "Sử dụng kim chọc qua âm đạo dưới hướng dẫn siêu âm",
          "Thời gian thủ thuật khoảng 15-30 phút",
          "Thường lấy được 8-15 trứng tùy theo đáp ứng",
        ],
      },
      {
        step: 4,
        title: "Thụ tinh và nuôi cấy",
        duration: "3-5 ngày",
        description:
          "Kết hợp trứng và tinh trùng, theo dõi sự phát triển của phôi",
        details: [
          "IVF cổ điển hoặc ICSI tùy theo chất lượng tinh trùng",
          "Nuôi cấy phôi trong tủ ấm CO2 với điều kiện tối ưu",
          "Theo dõi tỷ lệ thụ tinh và phát triển phôi hằng ngày",
          "Đánh giá chất lượng phôi ngày 3 và ngày 5",
          "Chọn phôi tốt nhất để chuyển và đông lạnh",
        ],
      },
      {
        step: 5,
        title: "Chuyển phôi",
        duration: "1 ngày",
        description: "Đưa phôi chất lượng tốt nhất vào tử cung",
        details: [
          "Chuẩn bị nội mạc tử cung bằng hormone",
          "Chọn 1-2 phôi tốt nhất để chuyển",
          "Sử dụng ống thông mềm, không cần gây mê",
          "Thời gian thủ thuật chỉ 5-10 phút",
          "Nghỉ ngơi 30 phút sau thủ thuật",
        ],
      },
      {
        step: 6,
        title: "Theo dõi và xét nghiệm",
        duration: "14-21 ngày",
        description: "Hỗ trợ hoàng thể và kiểm tra kết quả có thai",
        details: [
          "Sử dụng progesterone hỗ trợ hoàng thể",
          "Xét nghiệm beta-HCG sau 12-14 ngày",
          "Siêu âm xác nhận túi thai ở tuần 6-7",
          "Theo dõi thai kỳ đến 12 tuần",
          "Chuyển giao cho bác sĩ sản khoa",
        ],
      },
    ],

    risks: [
      "Hội chứng quá kích buồng trứng (5-10%)",
      "Thai đa thai nếu chuyển nhiều phôi",
      "Xuất huyết nhẹ khi lấy trứng (< 1%)",
      "Nhiễm trùng nhẹ (rất hiếm)",
      "Stress tâm lý do áp lực thành công",
      "Chi phí cao, có thể cần nhiều chu kỳ",
    ],
  },
  {
    id: "iui",
    title: "IUI - Bơm tinh trùng vào buồng tử cung",
    subtitle: "Intrauterine Insemination",
    heroIcon: "🏥",
    image: "/src/assets/img/IUI.jpg",
    shortDesc: "Phương pháp đơn giản, tự nhiên với chi phí hợp lý",
    fullDesc:
      "IUI (Intrauterine Insemination) là kỹ thuật đưa tinh trùng đã được xử lý và cô đặc trực tiếp vào buồng tử cung vào thời điểm phụ nữ rụng trứng. Đây là phương pháp hỗ trợ sinh sản ít xâm lấn, gần với quá trình thụ thai tự nhiên và thường được lựa chọn làm bước đầu tiên trong điều trị hiếm muộn.",
    price: "8.000.000 - 15.000.000 VNĐ",
    duration: "2-4 tuần",
    successRate: "15-25%",
    pregnancyRate: "20-30%",
    idealAge: "Dưới 38 tuổi",
    consultationPrice: "300.000 VNĐ",

    detailedDescription: [
      "IUI là phương pháp hỗ trợ sinh sản đơn giản, ít xâm lấn và có chi phí hợp lý, thích hợp làm bước đầu tiên trong điều trị hiếm muộn.",
      "Quy trình IUI gần gũi với quá trình thụ thai tự nhiên, giúp giảm thiểu stress tâm lý cho cặp vợ chồng.",
      "Phương pháp này đặc biệt hiệu quả với các trường hợp hiếm muộn nhẹ và chưa rõ nguyên nhân.",
      "IUI có thể được lặp lại nhiều lần với tác dụng phụ tối thiểu.",
    ],

    keyBenefits: [
      {
        icon: "💰",
        title: "Chi phí hợp lý",
        desc: "Thấp hơn 5-10 lần so với IVF",
      },
      {
        icon: "🌿",
        title: "Ít xâm lấn",
        desc: "Không cần gây mê hay phẫu thuật",
      },
      {
        icon: "🕒",
        title: "Thời gian ngắn",
        desc: "Chỉ mất 2-4 tuần cho một chu kỳ",
      },
      {
        icon: "🔄",
        title: "Có thể lặp lại",
        desc: "Thực hiện được nhiều chu kỳ liên tiếp",
      },
    ],

    processSteps: [
      {
        step: 1,
        title: "Khám và đánh giá",
        duration: "3-5 ngày",
        description: "Đánh giá cơ bản tình trạng sinh sản của cặp vợ chồng",
        details: [
          "Khám phụ khoa và tiền sử bệnh",
          "Siêu âm âm đạo đánh giá buồng trứng",
          "Xét nghiệm hormone cơ bản (FSH, LH, E2)",
          "Tinh dịch đồ để đánh giá chất lượng tinh trùng",
          "Chụp HSG để đánh giá vòi trứng thông thoáng",
        ],
      },
      {
        step: 2,
        title: "Theo dõi chu kỳ",
        duration: "8-12 ngày",
        description: "Theo dõi rụng trứng tự nhiên hoặc kích thích nhẹ",
        details: [
          "Có thể sử dụng chu kỳ tự nhiên",
          "Hoặc kích thích nhẹ bằng Clomid/Letrozole",
          "Siêu âm theo dõi kích thước nang trứng",
          "Xét nghiệm LH để dự đoán thời điểm rụng trứng",
          "Tránh kích thích quá mạnh gây thai đa",
        ],
      },
      {
        step: 3,
        title: "Kích thích rụng trứng",
        duration: "1 ngày",
        description: "Tiêm HCG để đảm bảo rụng trứng đúng thời điểm",
        details: [
          "Khi nang trứng đạt 18-20mm",
          "Tiêm HCG 5000-10000 đơn vị",
          "Có thể tiêm tại nhà hoặc bệnh viện",
          "Hẹn lịch IUI sau 36-40 giờ",
          "Tư vấn quan hệ tình dục hỗ trợ",
        ],
      },
      {
        step: 4,
        title: "Chuẩn bị tinh trùng",
        duration: "2-3 giờ",
        description: "Xử lý tinh dịch để tách lọc tinh trùng tốt nhất",
        details: [
          "Lấy tinh dịch sau kiêng 2-5 ngày",
          "Xử lý bằng phương pháp swim-up hoặc gradient",
          "Tách lọc tinh trùng khỏe mạnh và nhanh nhẹn",
          "Cô đặc tinh trùng trong môi trường nuôi cấy",
          "Đánh giá chất lượng tinh trùng sau xử lý",
        ],
      },
      {
        step: 5,
        title: "Thực hiện IUI",
        duration: "15-30 phút",
        description: "Bơm tinh trùng đã xử lý vào buồng tử cung",
        details: [
          "Sử dụng ống thông mềm chuyên dụng",
          "Đưa tinh trùng qua cổ tử cung vào buồng tử cung",
          "Thủ thuật không đau, không cần gây mê",
          "Bệnh nhân nằm nghỉ 15-30 phút",
          "Có thể về nhà ngay sau thủ thuật",
        ],
      },
      {
        step: 6,
        title: "Hỗ trợ và theo dõi",
        duration: "14 ngày",
        description: "Hỗ trợ hoàng thể và kiểm tra kết quả",
        details: [
          "Sử dụng progesterone hỗ trợ hoàng thể",
          "Hạn chế hoạt động mạnh trong 2-3 ngày",
          "Xét nghiệm beta-HCG sau 14 ngày",
          "Nếu thành công, tiếp tục theo dõi thai kỳ",
          "Nếu thất bại, có thể lặp lại chu kỳ tiếp theo",
        ],
      },
    ],

    risks: [
      "Tỷ lệ thành công thấp hơn IVF",
      "Thai đa thai nếu dùng thuốc kích thích",
      "Nhiễm trùng nhẹ (rất hiếm < 0.1%)",
      "Khó chịu nhẹ sau thủ thuật",
      "Cần lặp lại nhiều chu kỳ",
      "Không phù hợp với tắc vòi trứng",
    ],
  },
  {
    id: "khamsan",
    title: "Khám lâm sàng",
    subtitle: "Comprehensive Fertility Assessment",
    heroIcon: "👩‍⚕️",
    image: "https://source.unsplash.com/900x400/?doctor,checkup",
    shortDesc: "Đánh giá toàn diện tình trạng sinh sản",
    fullDesc:
      "Khám lâm sàng là bước đầu tiên quan trọng trong hành trình điều trị hiếm muộn. Quá trình này bao gồm đánh giá toàn diện tình trạng sức khỏe sinh sản của cả hai vợ chồng, xác định nguyên nhân hiếm muộn và đưa ra phương án điều trị phù hợp nhất.",
    price: "300.000 - 500.000 VNĐ",
    duration: "1-2 giờ",
    successRate: "100%",
    pregnancyRate: "Tùy thuộc phương pháp điều trị",
    idealAge: "Tất cả các độ tuổi",
    consultationPrice: "300.000 VNĐ",

    detailedDescription: [
      "Khám lâm sàng toàn diện giúp xác định chính xác nguyên nhân hiếm muộn và đưa ra hướng điều trị tối ưu.",
      "Đội ngũ bác sĩ chuyên khoa với nhiều năm kinh nghiệm sẽ thăm khám và tư vấn chi tiết.",
      "Sử dụng thiết bị hiện đại để chẩn đoán chính xác và đánh giá tình trạng sinh sản.",
      "Tư vấn về lối sống, dinh dưỡng và yếu tố môi trường ảnh hưởng đến khả năng sinh sản.",
    ],

    keyBenefits: [
      {
        icon: "🎯",
        title: "Chẩn đoán chính xác",
        desc: "Xác định đúng nguyên nhân hiếm muộn",
      },
      {
        icon: "📋",
        title: "Kế hoạch điều trị",
        desc: "Đưa ra phương án điều trị phù hợp",
      },
      {
        icon: "💡",
        title: "Tư vấn chuyên sâu",
        desc: "Giải đáp mọi thắc mắc về sinh sản",
      },
      {
        icon: "🏥",
        title: "Thiết bị hiện đại",
        desc: "Sử dụng công nghệ chẩn đoán tiên tiến",
      },
    ],

    processSteps: [
      {
        step: 1,
        title: "Hỏi tiền sử",
        duration: "30 phút",
        description:
          "Thu thập thông tin chi tiết về tiền sử bệnh và tình trạng hiếm muộn",
        details: [
          "Tiền sử bệnh của cả hai vợ chồng",
          "Thời gian hiếm muộn và các phương pháp đã điều trị",
          "Tiền sử sinh sản: có thai, sẩy thai, nạo hút thai",
          "Thói quen sinh hoạt, chế độ ăn uống",
          "Môi trường làm việc và tiếp xúc hóa chất",
        ],
      },
      {
        step: 2,
        title: "Khám phụ khoa",
        duration: "20 phút",
        description: "Khám lâm sàng chi tiết bộ phận sinh dục nữ",
        details: [
          "Khám ngoại sinh dục và âm đạo",
          "Khám cổ tử cung và buồng tử cung",
          "Đánh giá kích thước và vị trí tử cung",
          "Khám buồng trứng và vùng phần phụ",
          "Phát hiện các bất thường cấu trúc",
        ],
      },
      {
        step: 3,
        title: "Khám nam khoa",
        duration: "15 phút",
        description: "Đánh giá tình trạng sinh sản nam giới",
        details: [
          "Khám bộ phận sinh dục ngoài",
          "Đánh giá kích thước và tình trạng tinh hoàn",
          "Kiểm tra ống dẫn tinh và tuyến tiền liệt",
          "Phát hiện giãn tĩnh mạch tinh hoàn",
          "Đánh giá hormone nam và chức năng tình dục",
        ],
      },
      {
        step: 4,
        title: "Siêu âm chuyên khoa",
        duration: "20 phút",
        description: "Siêu âm âm đạo đánh giá chi tiết cơ quan sinh sản",
        details: [
          "Siêu âm tử cung và buồng trứng",
          "Đánh giá trữ lượng trứng (AMH, AFC)",
          "Kiểm tra nội mạc tử cung",
          "Phát hiện u xơ tử cung, nang buồng trứng",
          "Đánh giá lưu lượng máu buồng trứng",
        ],
      },
      {
        step: 5,
        title: "Tư vấn xét nghiệm",
        duration: "15 phút",
        description: "Chỉ định các xét nghiệm cần thiết",
        details: [
          "Xét nghiệm hormone sinh sản cơ bản",
          "Tinh dịch đồ và các xét nghiệm tinh trùng",
          "Xét nghiệm nhiễm trùng và miễn dịch",
          "Chụp HSG đánh giá vòi trứng",
          "Các xét nghiệm di truyền nếu cần",
        ],
      },
      {
        step: 6,
        title: "Tư vấn điều trị",
        duration: "20 phút",
        description: "Đưa ra kế hoạch điều trị phù hợp",
        details: [
          "Phân tích kết quả khám và xét nghiệm",
          "Đưa ra chẩn đoán nguyên nhân hiếm muộn",
          "Tư vấn các phương pháp điều trị",
          "Giải thích tỷ lệ thành công và rủi ro",
          "Lập kế hoạch điều trị chi tiết",
        ],
      },
    ],

    risks: [
      "Không có rủi ro y khoa",
      "Có thể cần khám lại để đánh giá thêm",
      "Một số xét nghiệm có thể gây khó chịu nhẹ",
    ],
  },
];

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const service = services.find((s) => s.id === id);

  if (!service) {
    return (
      <div className="service-detail-container">
        <div className="not-found">
          <h1>❌ Không tìm thấy dịch vụ</h1>
          <p>Dịch vụ bạn đang tìm kiếm không tồn tại hoặc đã được thay đổi.</p>
          <button className="back-btn" onClick={() => navigate("/services")}>
            ← Quay lại danh sách dịch vụ
          </button>
        </div>
      </div>
    );
  }

  const handleBookingClick = () => {
    navigate("/booking");
  };

  return (
    <div className="service-detail-container">
      {/* Navigation */}
      <button className="back-btn" onClick={() => navigate("/services")}>
        ← Quay lại dịch vụ
      </button>

      {/* Hero Section */}
      <div className="service-detail-hero">
        <div className="hero-content">
          <div className="hero-icon">{service.heroIcon}</div>
          <h1 className="hero-title">{service.title}</h1>
          <p className="hero-subtitle">{service.subtitle}</p>
          <p className="hero-description">{service.shortDesc}</p>

          <div className="hero-stats">
            <div className="stat-card">
              <span className="stat-label">Tỷ lệ thành công</span>
              <span className="stat-value success">{service.successRate}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Chi phí dự kiến</span>
              <span className="stat-value">{service.price}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Thời gian điều trị</span>
              <span className="stat-value">{service.duration}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Tỷ lệ có thai</span>
              <span className="stat-value">{service.pregnancyRate}</span>
            </div>
          </div>

          <div className="hero-actions">
            <button className="cta-btn primary" onClick={handleBookingClick}>
              <span className="btn-icon">📞</span>
              Đặt lịch tư vấn ngay
            </button>
            <button
              className="cta-btn secondary"
              onClick={() => window.open("tel:0123456789")}
            >
              <span className="btn-icon">💬</span>
              Gọi tư vấn: 012-345-6789
            </button>
          </div>
        </div>

        <div className="hero-image">
          <img src={service.image} alt={service.title} />
          <div className="image-overlay">
            <div className="price-tag">
              <span className="price-label">Phí tư vấn</span>
              <span className="price-value">{service.consultationPrice}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Service Overview */}
      <div className="service-overview">
        <h2>📋 Tổng quan dịch vụ</h2>
        <div className="overview-content">
          {service.detailedDescription.map((desc, index) => (
            <p key={index} className="overview-text">
              {desc}
            </p>
          ))}
        </div>
      </div>

      {/* Key Benefits */}
      <div className="key-benefits">
        <h2>✨ Ưu điểm nổi bật</h2>
        <div className="benefits-grid">
          {service.keyBenefits.map((benefit, index) => (
            <div key={index} className="benefit-card">
              <div className="benefit-icon">{benefit.icon}</div>
              <h3>{benefit.title}</h3>
              <p>{benefit.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Process */}
      <div className="detailed-process">
        <h2>⚕️ Quy trình thực hiện chi tiết</h2>
        <div className="process-timeline">
          {service.processSteps.map((step, index) => (
            <div key={index} className="timeline-step">
              <div className="step-indicator">
                <span className="step-number">{step.step}</span>
                <div className="step-line"></div>
              </div>
              <div className="step-content">
                <div className="step-header">
                  <h3>{step.title}</h3>
                  <span className="step-duration">🕐 {step.duration}</span>
                </div>
                <p className="step-description">{step.description}</p>
                <div className="step-details">
                  <h4>Chi tiết thực hiện:</h4>
                  <ul>
                    {step.details.map((detail, idx) => (
                      <li key={idx}>{detail}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risks and Considerations */}
      <div className="risks-section">
        <h2>⚠️ Rủi ro và lưu ý</h2>
        <div className="risks-content">
          <p className="risks-intro">
            Mặc dù {service.title.toLowerCase()} là phương pháp an toàn được áp
            dụng rộng rãi, nhưng vẫn có một số rủi ro và lưu ý mà bạn cần biết:
          </p>
          <div className="risks-list">
            {service.risks.map((risk, index) => (
              <div key={index} className="risk-item">
                <span className="risk-icon">⚠️</span>
                <span>{risk}</span>
              </div>
            ))}
          </div>
          <div className="risks-note">
            <p>
              <strong>Lưu ý quan trọng:</strong> Đội ngũ y bác sĩ của chúng tôi
              sẽ theo dõi chặt chẽ và có biện pháp phòng ngừa, xử lý kịp thời
              các biến chứng có thể xảy ra. Tỷ lệ biến chứng nghiêm trọng rất
              thấp khi thực hiện tại cơ sở y tế uy tín.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="service-faq">
        <h2>❓ Câu hỏi thường gặp</h2>
        <div className="faq-grid">
          <div className="faq-item">
            <h4>Tôi có phù hợp với {service.title.toLowerCase()} không?</h4>
            <p>
              Để xác định phương pháp phù hợp, bạn cần được khám và đánh giá chi
              tiết. Hãy đặt lịch tư vấn để bác sĩ có thể đưa ra lời khuyên chính
              xác nhất.
            </p>
          </div>
          <div className="faq-item">
            <h4>Thời gian chờ đợi kết quả là bao lâu?</h4>
            <p>
              Thời gian chờ kết quả thường là 14 ngày sau thủ thuật. Trong thời
              gian này, bạn cần sử dụng thuốc hỗ trợ và hạn chế hoạt động mạnh.
            </p>
          </div>
          <div className="faq-item">
            <h4>Chi phí có bao gồm tất cả các dịch vụ không?</h4>
            <p>
              Chi phí đã bao gồm hầu hết các dịch vụ cơ bản. Tuy nhiên, một số
              xét nghiệm hoặc dịch vụ bổ sung có thể phát sinh thêm chi phí.
            </p>
          </div>
          <div className="faq-item">
            <h4>Tôi có thể làm việc bình thường sau thủ thuật không?</h4>
            <p>
              Sau thủ thuật, bạn nên nghỉ ngơi 1-2 ngày và tránh hoạt động nặng.
              Với công việc văn phòng, bạn có thể trở lại làm việc sau 2-3 ngày.
            </p>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="final-cta">
        <div className="cta-content">
          <h2>Sẵn sàng bắt đầu hành trình của bạn?</h2>
          <p>
            Đừng để thời gian trôi qua. Hãy liên hệ với chúng tôi ngay hôm nay
            để được tư vấn miễn phí và bắt đầu hành trình tìm kiếm hạnh phúc.
          </p>

          <div className="cta-features">
            <div className="feature">
              <span className="feature-icon">🆓</span>
              <span>Tư vấn miễn phí</span>
            </div>
            <div className="feature">
              <span className="feature-icon">👨‍⚕️</span>
              <span>Bác sĩ chuyên khoa</span>
            </div>
            <div className="feature">
              <span className="feature-icon">🏆</span>
              <span>Công nghệ hiện đại</span>
            </div>
          </div>

          <div className="final-actions">
            <button
              className="final-cta-btn primary"
              onClick={handleBookingClick}
            >
              <span className="btn-icon">💝</span>
              Đặt lịch tư vấn ngay
            </button>
            <button
              className="final-cta-btn secondary"
              onClick={() => navigate("/services")}
            >
              <span className="btn-icon">📋</span>
              Xem dịch vụ khác
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
