import React, {useEffect, useState} from "react";
import axios from "axios";
import DoctorCard from "./Card/DoctorCard";
import "./Doctor.css";

const Doctor = () => {
    const [doctor, setDoctors] = useState([]);
//goi axios de lay du lieu tu API
    useEffect(() => {
  axios.get("https://6836811f664e72d28e4105f7.mockapi.io/api/doctor")
    .then((response) => {
      setDoctors(response.data);
    })
    .catch((error) => {
      console.error("Error fetching doctors:", error);
    });
}, []);

// Render list of doctors
    return (
        <div className="doctor-container">
            <h1 className="title">Đội ngũ bác sĩ</h1>
            <div className="doctor-list">
                {doctor.map((doctor) => (
                    <DoctorCard
                        key={doctor.id}
                        name={doctor.name}
                        expYears={doctor.expYears}
                        cases={doctor.cases}
                        pic={doctor.pic}
                    />
                ))}
            </div>
        </div>
    );
};

export default Doctor;