import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";
import logo from "../../../assets/img/logo.png";
import { UserContext } from "../../../context/UserContext";

export default function Header() {
  const navigate = useNavigate();
  const { user, logout, isLoggedIn } = useContext(UserContext);

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleRegisterClick = () => {
    navigate("/register");
  };

  const handleLogoutClick = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="header">
      <div className="logo">
        <img src={logo} alt="Logo" />
      </div>

      <div className="navbar">
        <ul>
          <li>
            <Link to="/">Giới thiệu</Link>
          </li>
          <li>
            <Link to="/">Dịch vụ</Link>
          </li>
          <li>
            <Link to="/doctor">Chuyên gia - bác sĩ</Link>
          </li>
          <li>
            <Link to="/">Thành tựu</Link>
          </li>
          <li>
            <Link to="/">Tin tức</Link>
          </li>
          <li>
            <Link to="/">Liên hệ</Link>
          </li>
           <li>
            {isLoggedIn && user?.role === "manager" ? (
              <Link to="/blog-manager">Quản lý Blog</Link>
            ) : (
              <Link to="/blog-public">Cộng đồng Blog</Link>
            )}
          </li>
           
        </ul>
      </div>

      <div className="button">
        {isLoggedIn && user ? (
          <div className="user-info">
            {user.avatar && (
              <img
                src={user.avatar}
                alt="avatar"
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  marginRight: "8px",
                }}
              />
            )}
            <span>Xin chào, {user.name}</span>
            <button onClick={handleLogoutClick}>Đăng xuất</button>
          </div>
        ) : (
          <div>
            <button style={{ marginRight: "10px" }} onClick={handleLoginClick}>
              Đăng nhập
            </button>
            <button
              style={{ padding: "10px 22px" }}
              onClick={handleRegisterClick}
            >
              Đăng ký
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
