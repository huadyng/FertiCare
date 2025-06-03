import React from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "./Header.css";
import logo from "../../../assets/img/logo.png";
export default function Header() {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/login");
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
              <a href="">Giới thiệu</a>
            </li>
            <li>
              <a href="">Dịch vụ</a>
            </li>
            <li><Link to="/doctor">Chuyên gia - bác sĩ</Link>
            </li>
            <li>
              <a href="">Thành tựu</a>
            </li>
            <li>
              <a href="">Tin tức</a>
            </li>
            <li>
              <a href="">Liên hệ</a>
            </li>
          </ul>
        </div>
        <div className="button">
          <a href="">
            <button onClick={handleLoginClick}>Đăng nhập</button>
          </a>
        </div>
      </div>
    </>
  );
}
