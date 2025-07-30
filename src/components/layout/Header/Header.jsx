import React, { useContext, useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";
import logo from "../../../assets/img/logo.png";
import { UserContext } from "../../../context/UserContext";

export default function Header() {
  const navigate = useNavigate();
  const { user, logout, isLoggedIn, getDashboardPath, refreshUserData } =
    useContext(UserContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const [avatarKey, setAvatarKey] = useState(Date.now()); // Force refresh avatar
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

  // Force refresh avatar when user changes
  useEffect(() => {
    if (user?.avatarUrl) {
      setAvatarKey(Date.now());
    }
  }, [user?.avatarUrl]);

  const handleDropdownItemClick = (action) => {
    setShowDropdown(false);
    if (action === "profile") {
      navigate("/profile");
    } else if (action === "dashboard") {
      navigate(getDashboardPath());
    } else if (action === "refresh-avatar") {
      // Refresh user data để sync avatar mới
      refreshUserData?.();
    }
  };

  return (
    <div className="header">
      <div className="logo">
        <img src={logo} alt="Logo" />
        <span className="logo-text">Fertix</span>
      </div>

      <div className="navbar">
        <ul>
          <li>
            <Link to="/">
              <span className="navbar-icon">🏠</span>
              <span>Trang chủ</span>
            </Link>
          </li>
          <li>
            <Link to="/services">
              <span className="navbar-icon">⚕️</span>
              <span>Dịch vụ</span>
            </Link>
          </li>
          <li>
            <Link to="/doctor">
              <span className="navbar-icon">👨‍⚕️</span>
              <span>Chuyên gia - bác sĩ</span>
            </Link>
          </li>
          {/* <li>
            <Link to="/achievements">
              <span className="navbar-icon">🏆</span>
              <span>Thành tựu</span>
            </Link>
          </li> */}
          <li>
            <Link to="/articles">
              <span className="navbar-icon">📰</span>
              <span>Tin tức</span>
            </Link>
          </li>
          <li>
            <Link to="/contact">
              <span className="navbar-icon">📞</span>
              <span>Liên hệ</span>
            </Link>
          </li>
          {isLoggedIn && user?.role?.toUpperCase() === "MANAGER" && (
            <li>
              <Link to="/blog-manager">
                <span className="navbar-icon">📝</span>
                <span>Quản lý Blog</span>
              </Link>
            </li>
          )}
          <li>
            <Link to="/blog-public">
              <span className="navbar-icon">📝</span>
              <span>Blog</span>
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
                  src={`${user.avatarUrl}?t=${avatarKey}`}
                  alt="avatar"
                  className="user-avatar"
                  onError={(e) => {
                    e.target.src = "/src/assets/img/default-avatar.png";
                  }}
                />
              ) : (
                <div className="user-avatar-placeholder">
                  <img
                    src="/src/assets/img/default-avatar.png"
                    alt="avatar"
                    className="user-avatar"
                  />
                </div>
              )}
              <span className="user-greeting">{user.fullName || "User"}</span>
              <span className={`dropdown-arrow ${showDropdown ? "open" : ""}`}>
                ▼
              </span>
            </div>

            {showDropdown && (
              <div className="user-dropdown-menu">
                <div className="dropdown-header">
                  <div className="dropdown-user-info">
                    <strong>{user.fullName || "User"}</strong>
                    <small>{user.email}</small>
                    <span className="user-role-badge">
                      {user.role === "ADMIN" && "Quản trị viên"}
                      {user.role === "MANAGER" && "Quản lý"}
                      {user.role === "DOCTOR" && "Bác sĩ"}
                      {user.role === "PATIENT" && "Bệnh nhân"}
                      {user.role === "CUSTOMER" && "Khách hàng"}
                      {![
                        "ADMIN",
                        "MANAGER",
                        "DOCTOR",
                        "PATIENT",
                        "CUSTOMER",
                      ].includes(user.role) && user.role}
                    </span>
                  </div>
                </div>
                <div className="dropdown-divider"></div>
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
                  className="dropdown-item"
                  onClick={() => {
                    setShowDropdown(false);
                    navigate("/my-appointments");
                  }}
                >
                  <span className="dropdown-icon">📅</span>
                  <span>Lịch hẹn của tôi</span>
                </div>
                <div
                  className="dropdown-item"
                  onClick={() => {
                    setShowDropdown(false);
                    navigate("/clinical-results");
                  }}
                >
                  <span className="dropdown-icon">🩺</span>
                  <span>Khám lâm sàng</span>
                </div>
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
          <div className="auth-buttons-container">
            <button className="login-btn ripple" onClick={handleLoginClick}>
              <span className="button-icon">👤</span>
              <span>Đăng nhập</span>
            </button>
            <button
              className="register-btn ripple"
              onClick={handleRegisterClick}
            >
              <span className="button-icon">🚀</span>
              <span>Đăng ký</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
