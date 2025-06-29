import React, { useState } from "react";
import "./NewsPage.css";

import news1 from "../../../../assets/img/news.png";
import news2 from "../../../../assets/img/news.png";
import news3 from "../../../../assets/img/news.png";
import news4 from "../../../../assets/img/news.png";

export default function NewsPage() {
  const [visibleNews, setVisibleNews] = useState(4);

  const newsList = [
    {
      title: "Cập nhật công nghệ IVF tiên tiến năm 2025",
      desc: "Trung tâm đã triển khai hệ thống AI hỗ trợ phôi tốt hơn, giúp tăng tỉ lệ thành công trong điều trị hiếm muộn. Công nghệ mới này sử dụng machine learning để phân tích chất lượng phôi với độ chính xác cao hơn 95%.",
      image: news1,
      date: "01/06/2025",
      author: "TS.BS Nguyễn Văn A",
      tags: ["Công nghệ", "IVF", "AI"],
      views: "1.2k",
      likes: "89",
    },
    {
      title: "Hội thảo 'Hiểu đúng về vô sinh và hiếm muộn'",
      desc: "Buổi hội thảo thu hút hơn 500 người tham dự với sự góp mặt của các chuyên gia đầu ngành. Được tổ chức tại Trung tâm Hội nghị Quốc gia với nhiều thông tin hữu ích cho các cặp đôi.",
      image: news2,
      date: "28/05/2025",
      author: "PGS.TS Trần Thị B",
      tags: ["Hội thảo", "Giáo dục", "Tư vấn"],
      views: "856",
      likes: "67",
    },
    {
      title: "Trung tâm được cấp chứng nhận ISO 15189",
      desc: "Đảm bảo tiêu chuẩn chất lượng quốc tế trong phòng xét nghiệm hỗ trợ sinh sản. Chứng nhận này khẳng định cam kết của chúng tôi về chất lượng dịch vụ y tế hàng đầu.",
      image: news3,
      date: "15/05/2025",
      author: "Ban Giám đốc",
      tags: ["Chứng nhận", "Chất lượng", "ISO"],
      views: "642",
      likes: "45",
    },
    {
      title: "Chương trình hỗ trợ tài chính cho bệnh nhân",
      desc: "Chúng tôi triển khai gói hỗ trợ chi phí điều trị cho các cặp đôi khó khăn từ tháng 6/2025. Chương trình nhằm giúp đỡ những gia đình có hoàn cảnh khó khăn tiếp cận dịch vụ điều trị hiếm muộn.",
      image: news4,
      date: "05/05/2025",
      author: "Phòng Chăm sóc KH",
      tags: ["Hỗ trợ", "Tài chính", "Xã hội"],
      views: "923",
      likes: "134",
    },
    {
      title: "Kỹ thuật ICSI mới giúp tăng tỷ lệ thành công",
      desc: "Áp dụng kỹ thuật tiêm tinh trúng vào bào tương trứng thế hệ mới với độ chính xác cao hơn. Phương pháp này đặc biệt hiệu quả cho những trường hợp vô sinh nam nghiêm trọng.",
      image: news1,
      date: "02/05/2025",
      author: "ThS.BS Lê Văn C",
      tags: ["ICSI", "Kỹ thuật", "Nam khoa"],
      views: "567",
      likes: "78",
    },
    {
      title: "Nghiên cứu mới về điều trị buồng trứng đa nang",
      desc: "Công bố kết quả nghiên cứu về phương pháp điều trị PCOS hiệu quả với tỷ lệ thành công lên tới 85%. Nghiên cứu được thực hiện trong 2 năm với 300 bệnh nhân tham gia.",
      image: news2,
      date: "28/04/2025",
      author: "TS.BS Phạm Thị D",
      tags: ["Nghiên cứu", "PCOS", "Nữ khoa"],
      views: "1.5k",
      likes: "156",
    },
  ];

  const loadMoreNews = () => {
    setVisibleNews((prev) => Math.min(prev + 2, newsList.length));
  };

  return (
    <div className="news-container" id="news-section">
      <div className="news-header">
        <h1 className="news-title">Tin Tức Mới Nhất</h1>
        <p className="news-intro">
          Cập nhật những thông tin nổi bật về điều trị vô sinh hiếm muộn, công
          nghệ mới và các hoạt động tại trung tâm. Luôn đồng hành cùng bạn trên
          hành trình tìm kiếm hạnh phúc gia đình.
        </p>
      </div>

      <div className="news-list">
        {newsList.slice(0, visibleNews).map((item, index) => (
          <article className="news-card" key={index}>
            <div className="news-image-container">
              <img src={item.image} alt={item.title} className="news-image" />
              <div className="news-image-overlay"></div>
            </div>

            <div className="news-content">
              <div className="news-date">{item.date}</div>

              <h3 className="news-headline">{item.title}</h3>

              <div className="news-tags">
                {item.tags?.map((tag, tagIndex) => (
                  <span key={tagIndex} className="news-tag">
                    {tag}
                  </span>
                ))}
              </div>

              <p className="news-desc">{item.desc}</p>

              <div className="news-meta">
                <div className="news-author">{item.author}</div>
                <div className="news-stats">
                  <span className="news-stat">👁️ {item.views}</span>
                  <span className="news-stat">❤️ {item.likes}</span>
                </div>
              </div>

              <button className="read-more">Xem thêm</button>
            </div>
          </article>
        ))}
      </div>

      {visibleNews < newsList.length && (
        <div className="load-more-section">
          <button className="load-more-button" onClick={loadMoreNews}>
            <span>Xem thêm tin tức</span>
          </button>
        </div>
      )}
    </div>
  );
}
