import React, { useContext } from "react";

import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "./Header.css";
import logo from "../../../assets/img/logo.png";
import { UserContext } from "../../../context/UserContext";

export default function Header({ setIsLoggedIn }) {
  const navigate = useNavigate();
  const { user, logout } = useContext(UserContext);
  const handleLoginClick = () => {
    navigate("/login");
  };
  const handleLogoutClick = () => {
    logout(); // ✅ Gọi hàm logout đúng cách
    setIsLoggedIn(false);
    navigate("/"); // Chuyển hướng về trang đăng nhập
  };
  return (
    <>
      <div className="header">
        <div className="logo">
          <img src={logo} alt="" />
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
          </ul>
        </div>
        <div className="button">
          {user ? (
            <div className="user-info">
              <span>Xin chào, {user.name}</span>
              <button onClick={handleLogoutClick}>Đăng xuất</button>
            </div>
          ) : (
            <button onClick={handleLoginClick}>Đăng nhập</button>
          )}
        </div>
      </div>
    </>
  );
}
