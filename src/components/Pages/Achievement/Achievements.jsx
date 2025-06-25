import React from "react";
import "./Achievements.css";
import achievements from "./AchievementData";

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
