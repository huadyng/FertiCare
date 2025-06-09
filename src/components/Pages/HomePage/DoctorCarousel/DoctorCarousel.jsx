import React, { useEffect, useRef, useState } from "react";
import "./DoctorCarousel.css";
import doctor from "../../../../assets/img/doctor1.png";

const doctors = [
  {
    name: "ThS. BS. Võ Thị Thành",
    position: "BS. Sản phụ khoa",
    desc: "BS. Thành được đào tạo chuyên khoa Sản Phụ khoa với kinh nghiệm lâu năm...",
    img: doctor,
  },
  {
    name: "BS. Thái Doãn Minh",
    position: "BS. Hiếm muộn",
    desc: "BS. Minh hiện đang công tác tại Bệnh viện Mỹ Đức...",
    img: doctor,
  },
  {
    name: "BS. Nguyễn Đức Tài",
    position: "BS. IVF",
    desc: "BS. Tài tốt nghiệp Đại học Y Dược TP.HCM, là thành viên của Hiệp hội...",
    img: doctor,
  },
  {
    name: "BS. Trần Văn Phúc",
    position: "BS. Nội khoa",
    desc: "Chuyên sâu về nội tiết và sức khỏe sinh sản nữ...",
    img: doctor,
  },
  {
    name: "BS. Lê Thị Lan",
    position: "BS. Tâm lý trị liệu",
    desc: "Hỗ trợ tâm lý trong quá trình điều trị hiếm muộn...",
    img: doctor,
  },
  {
    name: "BS. Phạm Lê Hoàng Phúc",
    position: "BS. Tâm lý trị liệu",
    desc: "Hỗ trợ tâm lý trong quá trình điều trị hiếm muộn...",
    img: doctor,
  },
];

export default function DoctorCarousel() {
  const [index, setIndex] = useState(0);
  const visibleCount = 3;
  const maxIndex = doctors.length - visibleCount;

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
  }, [index]);

  const getVisibleDoctors = () => {
    let result = [];
    for (let i = 0; i < visibleCount; i++) {
      const current = (index + i) % doctors.length;
      result.push(doctors[current]);
    }
    return result;
  };

  return (
    <div className="carousel-container">
      <h1 className="title">Đội Ngũ Y Bác Sĩ</h1>
      <p className="description">
        Mỗi bệnh nhân khi đến với trung tâm đều mang theo những câu chuyện vui,
        buồn khác nhau. Nếu các anh chị em có điều gì trăn trở, băn khoăn về
        bệnh tình của mình thì hãy xem bác sĩ Mỹ Đức là một người đồng hành tin
        tưởng, sẵn sàng lắng nghe và chia sẻ với câu chuyện của mỗi người.
      </p>
      <button className="view-all">Xem tất cả</button>

      <div className="carousel-wrapper">
        <button className="nav-button left" onClick={prevSlide}>
          &#8592;
        </button>
        <div className="carousel-viewport">
          <div
            className="carousel-track"
            style={{
              transform: `translateX(-${index * (300 + 20)}px)`,
              transition: "transform 0.5s ease",
            }}
          >
            {doctors.map((doc, i) => (
              <div className="card" key={i}>
                <img src={doc.img} alt={doc.name} className="card-image" />
                <div className="card-info">
                  <h3 className="card-name">{doc.name}</h3>
                  <p className="card-position">{doc.position}</p>
                  <p className="card-desc">{doc.desc}</p>
                  <button className="read-more">Xem thêm →</button>
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
