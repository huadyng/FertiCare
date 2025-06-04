import React from "react";
<<<<<<< Updated upstream
import './DoctorCard.css';

const DoctorCard = ({name, expYears, cases, pic })=>{
    return(
        <div className="doctor-card">
            <img src={pic} alt={`${name}'s profile`} className="doctor-pic" />
            <h3 className="doctor-name">{name}</h3>
            <p className="doctor-exp">Experience: {expYears} years</p>
            <p className="doctor-cases">Cases Handled: {cases}</p>
        </div>
    );
}
=======
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
>>>>>>> Stashed changes

export default DoctorCard;