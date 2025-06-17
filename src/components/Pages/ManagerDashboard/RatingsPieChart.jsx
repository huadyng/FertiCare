import React, { useEffect, useState } from "react";
import axios from "axios";
import Slider from "react-slick";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const COLORS = ["#00C49F", "#FF8042"];

export default function RatingsPage() {
  const [dataPie, setDataPie] = useState([]);
  const [ratings, setRatings] = useState([]);

  useEffect(() => {
    axios
      .get("https://6846f5f97dbda7ee7ab10825.mockapi.io/ratings")
      .then((res) => {
        const all = res.data;
        const likeList = all.filter(
          (item) => item.feedbacks === true || item.feedbacks === "true"
        );
        const dislikeList = all.filter(
          (item) => item.feedbacks === false || item.feedbacks === "false"
        );

        setRatings(all);
        setDataPie([
          { name: "Like 👍", value: likeList.length },
          { name: "Dislike 👎", value: dislikeList.length }
        ]);
      })
      .catch((err) => console.error("Error fetching ratings:", err));
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 2, // or 2 for two comments per slide
    slidesToScroll: 1,
    arrows: true
  };

  const cardStyle = {
    border: "1px solid #ccc",
    borderRadius: "10px",
    padding: "20px",
    margin: "10px",
    backgroundColor: "#fff",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    textAlign: "center",
    minHeight: "180px"
  };

  const badgeStyle = (feedbacks) => ({
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "13px",
    color: "#fff",
    backgroundColor: feedbacks ? "#00C49F" : "#FF8042",
    display: "inline-block",
    marginBottom: "8px"
  });

  return (
    <div style={{ padding: "30px", maxWidth: "800px", margin: "auto" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        Biểu đồ tỷ lệ hài lòng
      </h2>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={dataPie}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label
          >
            {dataPie.map((_, idx) => (
              <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend verticalAlign="bottom" />
        </PieChart>
      </ResponsiveContainer>

      <h3 style={{ textAlign: "center", margin: "30px 0 10px" }}>
        📋 Đánh giá từ người dùng
      </h3>

      <Slider {...settings}>
        {ratings.map((item, idx) => (
          <div key={idx}>
            <div style={cardStyle}>
              <span style={badgeStyle(item.feedbacks)}>
                {item.feedbacks === true || item.feedbacks === "true"
                  ? "👍 Tích cực"
                  : "👎 Tiêu cực"}
              </span>
              <h4>{item.user}</h4>
              <p>{item.review}</p>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
}
