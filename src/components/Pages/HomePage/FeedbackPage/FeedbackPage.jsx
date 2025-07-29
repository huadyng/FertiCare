import React from "react";
import "./FeedbackPage.css";

import avatar1 from "../../../../assets/img/phúc.png";
import avatar2 from "../../../../assets/img/thiên.png";
import avatar3 from "../../../../assets/img/sơn.png";

const feedbacks = [
  {
    name: "Phúc Đẹp Trai",
    rating: 5,
    comment:
      "Tôi rất hài lòng với dịch vụ ở đây. Nhân viên tận tình, bác sĩ giỏi và máy móc hiện đại.",
    avatar: avatar1,
  },
  {
    name: "Thiên Bé'ss",
    rating: 4,
    comment:
      "Quy trình điều trị rõ ràng, được theo dõi sát sao. Rất tin tưởng trung tâm này.",
    avatar: avatar2,
  },
  {
    name: "Lil Sơn",
    rating: 5,
    comment:
      "Sau nhiều năm chờ đợi, nhờ sự hỗ trợ từ đội ngũ ở đây mà tôi đã có tin vui. Cảm ơn rất nhiều!",
    avatar: avatar3,
  },
];

export default function FeedbackPage() {
  return (
    <div className="feedback-container">
      <h1 className="feedback-title">Đánh Giá Từ Khách Hàng</h1>
      <p className="feedback-subtitle">
        Cảm nhận từ những người đã tin tưởng và điều trị tại trung tâm của chúng
        tôi.
      </p>

      <div className="feedback-list">
        {feedbacks.map((fb, index) => (
          <div className="feedback-card" key={index}>
            <img src={fb.avatar} alt={fb.name} className="feedback-avatar" />
            <h3 className="feedback-name">{fb.name}</h3>
            <div className="feedback-rating">
              {"★".repeat(fb.rating)}
              {"☆".repeat(5 - fb.rating)}
            </div>
            <p className="feedback-comment">{fb.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
