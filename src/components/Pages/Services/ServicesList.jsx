import React from "react";
import "./ServicesList.css";
import { useNavigate } from "react-router-dom";
const services = [
  {
    id: "khamsan",
    title: "Khám lâm sàng",
    price: "300.000đ",
    description: "Đánh giá tổng quát sức khỏe sinh sản, tư vấn điều trị phù hợp với từng cặp vợ chồng.",
  },
  {
    id: "ivf",
    title: "IVF – Thụ tinh trong ống nghiệm",
    price: "70.000.000đ - 100.000.000đ",
    description: "Phương pháp hỗ trợ sinh sản tiên tiến, giúp tinh trùng và trứng kết hợp ngoài cơ thể.",
  },
  {
    id: "iui",
    title: "IUI – Bơm tinh trùng vào buồng tử cung",
    price: "15.000.000đ - 20.000.000đ",
    description: "Là phương pháp hỗ trợ sinh sản đơn giản, hiệu quả trong một số trường hợp hiếm muộn.",
  },
];

export default function Services() {
  const navigate = useNavigate();
  return (
    <div className="services-container">
      <h1 className="services-title">Dịch Vụ Điều Trị</h1>
      <div className="services-list">
        {services.map((service, index) => (
          <div className="service-card" key={index}>
            <h3 className="service-name">{service.title}</h3>
            <p className="service-price">{service.price}</p>
            <p className="service-description">{service.description}</p>
             <button
            onClick={() => navigate(`/services/${service.id}`)}
            className="read-more"
          >Đặt lịch</button>
          </div>
        ))}
      </div>
    </div>
  );
}
