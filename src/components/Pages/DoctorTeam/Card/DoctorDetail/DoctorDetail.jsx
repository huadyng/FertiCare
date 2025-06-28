import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "./DoctorDetail.css";

const DoctorDetail = () => {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);

  useEffect(() => {
    axios
      .get(`https://6836811f664e72d28e4105f7.mockapi.io/api/doctor/${id}`)
      .then((response) => {
        setDoctor(response.data);
      })
      .catch((error) => {
        console.error("Error fetching doctor details:", error);
      });
  }, [id]);

  if (!doctor) {
    return <div>Loading...</div>;
  }

  return (
    <div className="doctor-detail-container">
      <h1 className="doctor-name">{doctor.name}</h1>
      <div className="doctor-content">
        <div className="doctor-info">
          <p>
            <strong>Số ca chữa:</strong> {doctor.cases}
          </p>
          <p>
            <strong>Kinh nghiệm:</strong> {doctor.expYears} năm
          </p>
          <p>
            <strong>Giới thiệu:</strong> {doctor.Descrpition || "Chưa có mô tả"}
          </p>
        </div>
        <div className="doctor-image">
          <img src={doctor.pic} alt={doctor.name} />
        </div>
      </div>
    </div>
  );
};
export default DoctorDetail;
