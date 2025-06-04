import React from "react";


import "./DoctorCard.css"; // Nếu có style riêng

const DoctorCard = ({ name, expYears, cases, pic }) => {
  return (
    <div className="doctor-card">
      <img src={pic} alt={name} className="doctor-image" />
      <h3>{name}</h3>
      <p>Số ca chữa: {cases}</p>
      <p>Kinh nghiệm: {expYears} năm</p>
    </div>
  );
};


export default DoctorCard;