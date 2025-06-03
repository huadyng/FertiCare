import React from "react";
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

export default DoctorCard;