import React, { useContext, useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";
import logo from "../../../assets/img/logo.png";
import { UserContext } from "../../../context/UserContext";

export default function Header() {
  const navigate = useNavigate();
  const { user, logout, isLoggedIn, getDashboardPath } =
    useContext(UserContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleRegisterClick = () => {
    navigate("/register");
  };

  const handleLogoutClick = () => {
    logout();
    navigate("/");
    setShowDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDropdownItemClick = (action) => {
    setShowDropdown(false);
    if (action === "profile") {
      navigate("/profile");
    } else if (action === "dashboard") {
      navigate(getDashboardPath());
    }
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
            <Link to="/chart">Thành tựu</Link>
          </li>
          <li>
            <Link to="/">Tin tức</Link>
          </li>
          <li>
            <Link to="/contact">Liên hệ</Link>
          </li>
          <li>
            {isLoggedIn && user?.role?.toUpperCase() === "MANAGER" ? (
              <Link to="/blog-manager">Quản lý Blog</Link>
            ) : (
              <Link to="/blog-public">Cộng đồng Blog</Link>
            )}
          </li>
          <li>
            <Link to="/test-profile" style={{ fontSize: "12px", opacity: 0.7 }}>
              🧪
            </Link>
          </li>
          <li>
            <Link
              to="/profile-debug"
              style={{ fontSize: "12px", opacity: 0.7 }}
            >
              🔧
            </Link>
          </li>
        </ul>
      </div>

      <div className="button">
        {isLoggedIn && user ? (
          <div className="user-info" ref={dropdownRef}>
            <div
              className="user-avatar-section"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt="avatar"
                  className="user-avatar"
                  onError={(e) => {
                    e.target.src = "/src/assets/img/default-avatar.png";
                  }}
                />
              ) : (
                <div className="user-avatar-placeholder">
                  {user.fullName?.charAt(0)?.toUpperCase() || "U"}
                </div>
              )}
              <span className="user-greeting">
                Xin chào, {user.fullName || "User"}
              </span>
              <span className={`dropdown-arrow ${showDropdown ? "open" : ""}`}>
                ▼
              </span>
            </div>

            {showDropdown && (
              <div className="user-dropdown-menu">
                <div
                  className="dropdown-item"
                  onClick={() => handleDropdownItemClick("profile")}
                >
                  <span className="dropdown-icon">👤</span>
                  <span>Thông tin cá nhân</span>
                </div>
                <div
                  className="dropdown-item"
                  onClick={() => handleDropdownItemClick("dashboard")}
                >
                  <span className="dropdown-icon">📊</span>
                  <span>Dashboard</span>
                </div>
                <div className="dropdown-divider"></div>
                <div
                  className="dropdown-item logout-item"
                  onClick={handleLogoutClick}
                >
                  <span className="dropdown-icon">🚪</span>
                  <span>Đăng xuất</span>
                </div>
              </div>
            )}
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
