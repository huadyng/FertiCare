import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const COLORS = ["#00C49F", "#FF8042"];

export default function RatingsPieChart() {
  const [dataPie, setDataPie] = useState([]);
  const [likes, setLikes] = useState([]);
  const [dislikes, setDislikes] = useState([]);

  useEffect(() => {
    axios
      .get("https://6846f5f97dbda7ee7ab10825.mockapi.io/ratings")
      .then(res => {
        const all = res.data;
        const likeList = all.filter(item => item.feedbacks === true || item.feedbacks === "true");
        const dislikeList = all.filter(item => item.feedbacks === false || item.feedbacks === "false");

        setLikes(likeList);
        setDislikes(dislikeList);
        setDataPie([
          { name: "Like 👍", value: likeList.length },
          { name: "Dislike 👎", value: dislikeList.length }
        ]);
      })
      .catch(err => console.error("Error fetching ratings:", err));
  }, []);

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "16px",
  };

  const thStyle = {
    background: "#f0f0f0",
    border: "1px solid #ccc",
    padding: "12px",
    textAlign: "left",
  };

  const tdStyle = {
    border: "1px solid #ccc",
    padding: "12px",
  };

  return (
    <div style={{ width: "100%", paddingBottom: "50px" }}>
      <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>
        Tỷ lệ hài lòng (Like/Dislike)
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={dataPie}
            dataKey="value"
            nameKey="name"
            cx="50%" cy="50%"
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

      {/* Hai bảng chia hai bên */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: "60px",
        marginTop: "40px",
        flexWrap: "wrap",
      }}>
        {/* Bảng tích cực */}
        <div style={{ width: "45%" }}>
          <h3 style={{ color: "#00C49F", textAlign: "center" }}>👍 Đánh giá tích cực</h3>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Người dùng</th>
                <th style={thStyle}>Đánh giá</th>
              </tr>
            </thead>
            <tbody>
              {likes.map((item, index) => (
                <tr key={index}>
                  <td style={tdStyle}>{item.user}</td>
                  <td style={tdStyle}>{item.review}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bảng tiêu cực */}
        <div style={{ width: "45%" }}>
          <h3 style={{ color: "#FF8042", textAlign: "center" }}>👎 Đánh giá tiêu cực</h3>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Người dùng</th>
                <th style={thStyle}>Đánh giá</th>
              </tr>
            </thead>
            <tbody>
              {dislikes.map((item, index) => (
                <tr key={index}>
                  <td style={tdStyle}>{item.user}</td>
                  <td style={tdStyle}>{item.review}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
