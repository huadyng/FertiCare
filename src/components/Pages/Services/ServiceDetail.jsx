import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ServiceDetail.css";

// Tạm thời dùng data cứng, có thể thay bằng fetch API sau
const services = [
  {
    id: "ivf",
    title: "IVF – Thụ tinh trong ống nghiệm",
    image: "https://source.unsplash.com/900x400/?ivf,medical",
    description: [
      "Phương pháp IVF là kỹ thuật hỗ trợ sinh sản tiên tiến...",
      "Tỉ lệ thành công có thể lên đến 50–70% tùy trường hợp.",
    ],
    price: "70.000.000đ - 100.000.000đ",
  },
  {
    id: "iui",
    title: "IUI – Bơm tinh trùng vào buồng tử cung",
    image: "https://source.unsplash.com/900x400/?pregnancy,medical",
    description: [
      "IUI là phương pháp hỗ trợ sinh sản đơn giản hơn IVF.",
      "Hiệu quả tốt trong những trường hợp tinh trùng yếu nhẹ.",
    ],
    price: "15.000.000đ - 20.000.000đ",
  },
  {
    id: "khamsan",
    title: "Khám lâm sàng",
    image: "https://source.unsplash.com/900x400/?doctor,checkup",
    description: [
      "Đánh giá tổng quát sức khỏe sinh sản.",
      "Tư vấn kế hoạch điều trị phù hợp cho từng cặp vợ chồng.",
    ],
    price: "300.000đ",
  },
];

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const service = services.find((s) => s.id === id);

  if (!service) return <div>Không tìm thấy dịch vụ</div>;

  return (
    <div className="service-detail-container">
      <h1 className="service-title">{service.title}</h1>
      <img src={service.image} alt={service.title} className="service-image" />
      {service.description.map((desc, idx) => (
        <p key={idx} className="service-description">{desc}</p>
      ))}
      <p className="service-price">Chi phí: {service.price}</p>

      <button className="book-button" onClick={() => navigate("/booking")}>
        Đặt khám ngay
      </button>
    </div>
  );
}
