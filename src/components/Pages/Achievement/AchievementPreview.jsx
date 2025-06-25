import React from "react";
import achievements from "./AchivementData";
import "./Achievements.css";
export default function AchievementsPreview() {
  const previewItems = achievements.slice(0, 3); // Lấy 3 thành tựu đầu tiên

  return (
    <div className="achievements-preview">
      <h2 className="achievements-title">Thành tựu nổi bật</h2>
      <div className="achievements-grid">
        {previewItems.map((item, index) => (
          <div className="achievement-card" key={index}>
            <img src={item.image} alt={item.title} className="achievement-image" />
            <div className="achievement-content">
              <h3 className="achievement-title">{item.title}</h3>
              <p className="achievement-desc">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
