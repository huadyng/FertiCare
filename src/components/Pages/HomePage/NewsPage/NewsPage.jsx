import React from "react";
import "./NewsPage.css";

import news1 from "../../../../assets/img/news.png";
import news2 from "../../../../assets/img/news.png";
import news3 from "../../../../assets/img/news.png";
import news4 from "../../../../assets/img/news.png";

export default function NewsPage() {
  const newsList = [
    {
      title: "Cập nhật công nghệ IVF tiên tiến năm 2025",
      desc: "Trung tâm đã triển khai hệ thống AI hỗ trợ phôi tốt hơn, giúp tăng tỉ lệ thành công trong điều trị hiếm muộn.",
      image: news1,
      date: "01/06/2025",
    },
    {
      title: "Hội thảo 'Hiểu đúng về vô sinh và hiếm muộn'",
      desc: "Buổi hội thảo thu hút hơn 500 người tham dự với sự góp mặt của các chuyên gia đầu ngành.",
      image: news2,
      date: "28/05/2025",
    },
    {
      title: "Trung tâm được cấp chứng nhận ISO 15189",
      desc: "Đảm bảo tiêu chuẩn chất lượng quốc tế trong phòng xét nghiệm hỗ trợ sinh sản.",
      image: news3,
      date: "15/05/2025",
    },
    {
      title: "Chương trình hỗ trợ tài chính cho bệnh nhân",
      desc: "Chúng tôi triển khai gói hỗ trợ chi phí điều trị cho các cặp đôi khó khăn từ tháng 6/2025.",
      image: news4,
      date: "05/05/2025",
    },
  ];

  return (
    <div className="news-container">
      <h1 className="news-title">Tin Tức Mới Nhất</h1>
      <p className="news-intro">
        Cập nhật những thông tin nổi bật về điều trị vô sinh hiếm muộn, công
        nghệ mới và các hoạt động tại trung tâm.
      </p>
      <div className="news-list">
        {newsList.map((item, index) => (
          <div className="news-card" key={index}>
            <img src={item.image} alt={item.title} className="news-image" />
            <div className="news-content">
              <div className="news-date">{item.date}</div>
              <h3 className="news-headline">{item.title}</h3>
              <p className="news-desc">{item.desc}</p>
              <button className="read-more">Xem thêm</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
