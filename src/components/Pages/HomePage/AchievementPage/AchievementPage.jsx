import React from "react";
import "./AchievementPage.css";

import img1 from "../../../../assets/img/achive.png";
import img2 from "../../../../assets/img/achive.png";
import img3 from "../../../../assets/img/achive.png";
import img4 from "../../../../assets/img/achive.png";
import img5 from "../../../../assets/img/achive.png";
import img6 from "../../../../assets/img/achive.png";

export default function AchievementPage() {
  const achievements = [
    {
      year: "2024",
      title: "Hơn 1000 ca điều trị thành công",
      desc: "Trung tâm đã hỗ trợ thành công hơn 1000 cặp vợ chồng trong hành trình vượt qua hiếm muộn và mang thai tự nhiên hoặc nhờ hỗ trợ sinh sản.",
      image: img1,
      location: "TP. Hồ Chí Minh",
      partner: "Bệnh viện Mỹ Đức",
    },
    {
      year: "2024",
      title: "Ứng dụng hệ thống theo dõi điều trị thông minh",
      desc: "Ra mắt hệ thống quản lý & nhắc lịch điều trị giúp khách hàng dễ dàng theo dõi tiến trình, đảm bảo hiệu quả điều trị tối ưu.",
      image: img2,
      location: "TP. Hồ Chí Minh",
      partner: "Bộ phận IT nội bộ",
    },
    {
      year: "2023",
      title: "Đưa vào vận hành thiết bị ICSI & tủ nuôi phôi hiện đại",
      desc: "Cập nhật trang thiết bị hiện đại giúp nâng cao tỷ lệ thụ thai và giảm tỷ lệ thất bại trong các ca IVF.",
      image: img3,
      location: "TP. Hồ Chí Minh",
      partner: "Vitrolife, ESCO Medical",
    },
    {
      year: "2022",
      title: "Xây dựng quy trình chăm sóc toàn diện",
      desc: "Áp dụng mô hình chăm sóc từ trước – trong – sau điều trị để đồng hành cùng khách hàng trong suốt hành trình sinh con.",
      image: img4,
      location: "TP. Hồ Chí Minh",
      partner: "Chuyên gia sản khoa – tâm lý",
    },
    {
      year: "2022",
      title: "Tiếp nhận 500 hồ sơ điều trị trong năm",
      desc: "Ghi nhận sự tin tưởng từ cộng đồng, số lượng hồ sơ điều trị tăng gấp đôi so với năm 2021.",
      image: img5,
      location: "TP. Hồ Chí Minh",
      partner: "Khách hàng trên toàn quốc",
    },
    {
      year: "2021",
      title: "Khởi động trung tâm điều trị hiếm muộn",
      desc: "Chính thức đi vào hoạt động với đội ngũ y bác sĩ chuyên môn cao và trang thiết bị đạt chuẩn quốc tế.",
      image: img6,
      location: "TP. Hồ Chí Minh",
      partner: "Bộ Y tế cấp phép",
    },
    {
      year: "2021",
      title: "Khởi động trung tâm điều trị hiếm muộn",
      desc: "Chính thức đi vào hoạt động với đội ngũ y bác sĩ chuyên môn cao và trang thiết bị đạt chuẩn quốc tế.",
      image: img6,
      location: "TP. Hồ Chí Minh",
      partner: "Bộ Y tế cấp phép",
    },
    {
      year: "2021",
      title: "Khởi động trung tâm điều trị hiếm muộn",
      desc: "Chính thức đi vào hoạt động với đội ngũ y bác sĩ chuyên môn cao và trang thiết bị đạt chuẩn quốc tế.",
      image: img6,
      location: "TP. Hồ Chí Minh",
      partner: "Bộ Y tế cấp phép",
    },
  ];

  return (
    <div className="achievement-container">
      <h1 className="achievement-title">Thành Tựu Nổi Bật</h1>
      <p className="achievement-intro">
        Những cột mốc đáng nhớ trong hành trình hỗ trợ điều trị hiếm muộn – đồng
        hành cùng bạn trên con đường trở thành cha mẹ.
      </p>

      <div className="achievement-list">
        {achievements.map((item, index) => (
          <div className="achievement-card" key={index}>
            <img
              src={item.image}
              alt={item.title}
              className="achievement-image"
            />
            <div className="achievement-content">
              <div className="achievement-year">{item.year}</div>
              <h3 className="achievement-name">{item.title}</h3>
              <p className="achievement-desc">{item.desc}</p>
              <div className="achievement-extra">
                <span>
                  <strong>Địa điểm:</strong> {item.location}
                </span>
                <br />
                <span>
                  <strong>Đối tác:</strong> {item.partner}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
