import React from "react";
import { useNavigate } from "react-router-dom";

import "./DoctorCard.css"; 

const DoctorCard = ({id, name, expYears, cases, pic }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/doctor/${id}`);
  }

  return (
    <div className="doctor-card" onClick={handleClick} style={{ cursor: "pointer" }}>
      <img src={pic} alt={name} className="doctor-image" />
      <h3>{name}</h3>
      <p>Số ca chữa: {cases}</p>
      <p>Kinh nghiệm: {expYears} năm</p>
    </div>
  );
};


export default DoctorCard;