import React, { useEffect, useState } from "react";
import axios from "axios";
import "./DoctorCarousel.css";
import { useNavigate } from "react-router-dom";


export default function DoctorCarousel() {
  const [doctors, setDoctors] = useState([]);
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();
  const visibleCount = 3;
  const maxIndex = doctors.length > visibleCount ? doctors.length - visibleCount : 0;

  useEffect(() => {
    axios
      .get("https://6836811f664e72d28e4105f7.mockapi.io/api/doctor")
      .then((res) => setDoctors(res.data))
      .catch((err) => console.error("Lỗi khi gọi API:", err));
  }, []);

  const nextSlide = () => {
    setIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
  };

  const prevSlide = () => {
    setIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      nextSlide();
    }, 4000);
    return () => clearTimeout(timer);
  }, [index, doctors]);

  return (
    <div className="carousel-container">
      <h1 className="title">Đội Ngũ Y Bác Sĩ</h1>
      <p className="description">
        Các bác sĩ tại trung tâm có nhiều năm kinh nghiệm và chuyên môn sâu trong lĩnh vực điều trị.
      </p>
      <button className="view-all" onClick={() => navigate("/doctor")}>Xem tất cả</button>

      <div className="carousel-wrapper">
        <button className="nav-button left" onClick={prevSlide}>
          &#8592;
        </button>
        <div className="carousel-viewport">
          <div
            className="carousel-track"
            style={{
              transform: `translateX(-${index * (300 + 20)}px)`,
            }}
          >
            {doctors.map((doc, i) => (
              <div className="card" key={i}>
                <img
                  src={doc.pic}
                  alt={doc.name}
                  className="card-image"
                />
                <div className="card-info">
                  <h3 className="card-name">{doc.name}</h3>
                  <p className="card-position">Số ca: {doc.cases}</p>
                  <p className="card-desc">Kinh nghiệm: {doc.expyears} năm</p>
                  <button className="read-more" onClick={() => navigate(`/doctor/${doc.id}`)}>Xem thêm →</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button className="nav-button right" onClick={nextSlide}>
          &#8594;
        </button>
      </div>
    </div>
  );
}
