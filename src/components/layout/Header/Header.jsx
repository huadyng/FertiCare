import React from "react";

import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "./Header.css";
import logo from "../../../assets/img/logo.png";

export default function Header() {
  const navigate = useNavigate();
  const handleLoginClick = () =>{
    navigate("/login");
  }

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
          <button onClick={handleLoginClick}>Đăng nhập</button>
        </div>
      </div>
    </>
  );
}
