import { useState, useContext } from "react";
import { Layout, Menu, Avatar, Dropdown, Badge, Button, message } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  LogoutOutlined,
  BellOutlined,
  CalendarOutlined,
  FileTextOutlined,
  HeartOutlined,
  HistoryOutlined,
  MessageOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { UserContext } from "../../context/UserContext";
import "./Layout.css";

const { Header, Sider, Content } = Layout;

const PatientLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    message.success("Đăng xuất thành công");
    navigate("/login");
  };

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Thông tin cá nhân",
      onClick: () => navigate("/patient/profile"),
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Cài đặt",
      onClick: () => navigate("/patient/settings"),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      onClick: handleLogout,
    },
  ];

  const sidebarItems = [
    {
      key: "/patient/dashboard",
      icon: <DashboardOutlined />,
      label: "Tổng quan",
      onClick: () => navigate("/patient/dashboard"),
    },
    {
      key: "/patient/treatment-process",
      icon: <HeartOutlined />,
      label: "Tiến trình điều trị",
      onClick: () => navigate("/patient/treatment-process"),
    },
    {
      key: "/patient/schedule",
      icon: <CalendarOutlined />,
      label: "Lịch khám",
      onClick: () => navigate("/patient/schedule"),
    },
    {
      key: "/patient/medical-records",
      icon: <FileTextOutlined />,
      label: "Hồ sơ y tế",
      onClick: () => navigate("/patient/medical-records"),
    },
    {
      key: "/patient/history",
      icon: <HistoryOutlined />,
      label: "Lịch sử khám",
      onClick: () => navigate("/patient/history"),
    },
    {
      key: "/patient/notifications",
      icon: <MessageOutlined />,
      label: "Thông báo",
      onClick: () => navigate("/patient/notifications"),
    },
  ];

  return (
    <Layout className="patient-layout">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="patient-sider"
        width={250}
      >
        <div className="patient-logo">
          <div className="logo-icon">
            <HeartOutlined />
          </div>
          {!collapsed && <span className="logo-text">FertiCare Patient</span>}
        </div>

        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={sidebarItems}
          className="patient-menu"
        />
      </Sider>

      <Layout className="patient-main-layout">
        <Header className="patient-header">
          <div className="patient-header-left">
            <Button
              type="text"
              icon={collapsed ? <UserOutlined /> : <UserOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="collapse-btn"
            />
            <h2 className="page-title">Chăm sóc sinh sản</h2>
          </div>

          <div className="patient-header-right">
            <Badge count={2} className="notification-badge">
              <Button
                type="text"
                icon={<BellOutlined />}
                className="notification-btn"
                onClick={() => navigate("/patient/notifications")}
              />
            </Badge>

            <Dropdown
              menu={{ items: userMenuItems }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <div className="user-profile">
                <Avatar
                  size="small"
                  icon={<UserOutlined />}
                  className="user-avatar"
                />
                <span className="user-name">
                  {user?.fullName || "Bệnh nhân"}
                </span>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content className="patient-content">
          <div className="patient-content-wrapper">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default PatientLayout;
