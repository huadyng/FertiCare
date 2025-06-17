import React from "react";
import "./Achievements.css";

const achievements = [
  {
    title: "5000+ ca IVF thành công",
    image: "https://source.unsplash.com/400x250/?success,hospital",
    description: "Chúng tôi tự hào đã giúp hơn 5000 cặp vợ chồng thực hiện giấc mơ làm cha mẹ.",
  },
  {
    title: "Trung tâm IVF hàng đầu Việt Nam",
    image: "https://source.unsplash.com/400x250/?clinic,award",
    description: "Được bình chọn là một trong những trung tâm hỗ trợ sinh sản hàng đầu cả nước.",
  },
  {
    title: "Đội ngũ chuyên gia hàng đầu",
    image: "https://source.unsplash.com/400x250/?doctor,team",
    description: "Quy tụ đội ngũ bác sĩ chuyên môn cao, tận tâm với người bệnh.",
  },
  {
    title: "Ứng dụng công nghệ tiên tiến",
    image: "https://source.unsplash.com/400x250/?technology,medical",
    description: "Áp dụng công nghệ hỗ trợ sinh sản hiện đại, tăng tỉ lệ thành công lên đến 70%.",
  },
];

export default function Achievements() {
  return (
    <div className="achievements-container">
      <h1 className="achievements-title">Thành Tựu Nổi Bật</h1>
      <div className="achievements-grid">
        {achievements.map((item, index) => (
          <div className="achievement-card" key={index}>
            <img src={item.image} alt={item.title} className="achievement-image" />
            <div className="achievement-content">
              <h3 className="achievement-title">{item.title}</h3>
              <p className="achievement-description">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
