import React from "react";
import { Link } from "react-router-dom";
import "./UserProfile.css";

const ProfileDemo = () => {
  return (
    <div className="profile-container">
      <div
        style={{
          textAlign: "center",
          padding: "40px",
          background: "white",
          borderRadius: "12px",
          marginBottom: "20px",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h1 style={{ color: "#1976d2", marginBottom: "20px" }}>
          🎉 Trang User Profile đã được tạo thành công!
        </h1>

        <div style={{ marginBottom: "30px" }}>
          <h3>Tính năng đã implement:</h3>
          <ul
            style={{
              textAlign: "left",
              maxWidth: "600px",
              margin: "20px auto",
              lineHeight: "1.8",
            }}
          >
            <li>
              ✅ API integration với <code>/api/profiles/me</code>
            </li>
            <li>
              ✅ Hiển thị thông tin theo role (Doctor, Customer, Manager, Admin)
            </li>
            <li>✅ Responsive design</li>
            <li>✅ Loading và error states</li>
            <li>✅ Navigation từ Header dropdown</li>
            <li>✅ Protected routes</li>
          </ul>
        </div>

        <div style={{ marginBottom: "30px" }}>
          <h3>Các routes có sẵn:</h3>
          <div
            style={{
              display: "flex",
              gap: "15px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link
              to="/profile"
              style={{
                padding: "10px 20px",
                background: "#1976d2",
                color: "white",
                textDecoration: "none",
                borderRadius: "8px",
              }}
            >
              /profile (Public)
            </Link>
            <Link
              to="/admin/profile"
              style={{
                padding: "10px 20px",
                background: "#1976d2",
                color: "white",
                textDecoration: "none",
                borderRadius: "8px",
              }}
            >
              /admin/profile
            </Link>
            <Link
              to="/manager/profile"
              style={{
                padding: "10px 20px",
                background: "#1976d2",
                color: "white",
                textDecoration: "none",
                borderRadius: "8px",
              }}
            >
              /manager/profile
            </Link>
            <Link
              to="/doctor-panel/profile"
              style={{
                padding: "10px 20px",
                background: "#1976d2",
                color: "white",
                textDecoration: "none",
                borderRadius: "8px",
              }}
            >
              /doctor-panel/profile
            </Link>
            <Link
              to="/patient/profile"
              style={{
                padding: "10px 20px",
                background: "#1976d2",
                color: "white",
                textDecoration: "none",
                borderRadius: "8px",
              }}
            >
              /patient/profile
            </Link>
          </div>
        </div>

        <div
          style={{
            background: "#f0f7ff",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          <h3 style={{ color: "#1976d2" }}>Hướng dẫn sử dụng:</h3>
          <ol
            style={{ textAlign: "left", maxWidth: "500px", margin: "0 auto" }}
          >
            <li>Đăng nhập với một tài khoản</li>
            <li>Click vào avatar/tên user ở header</li>
            <li>Chọn "👤 Thông tin cá nhân"</li>
            <li>
              Hoặc truy cập trực tiếp <code>/profile</code>
            </li>
          </ol>
        </div>

        <div
          style={{
            background: "#fff3cd",
            padding: "15px",
            borderRadius: "8px",
            color: "#856404",
          }}
        >
          <strong>Lưu ý:</strong> Trang profile sẽ hiển thị thông tin khác nhau
          tùy thuộc vào role của user (Doctor sẽ có thông tin chuyên môn,
          Customer/Patient có thông tin sức khỏe, etc.)
        </div>
      </div>
    </div>
  );
};

export default ProfileDemo;
