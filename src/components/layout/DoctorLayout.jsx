import { useState, useContext } from "react";
import { Layout, Menu, Avatar, Dropdown, Badge, Button, message } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  LogoutOutlined,
  BellOutlined,
  CalendarOutlined,
  FileTextOutlined,
  HeartOutlined,
  ExperimentOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { UserContext } from "../../context/UserContext";
import "./Layout.css";

const { Header, Sider, Content } = Layout;

const DoctorLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    // message.success("Đăng xuất thành công");
    navigate("/login");
  };

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Thông tin cá nhân",
      onClick: () => navigate("/doctor/profile"),
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
      key: "/doctor-dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
      onClick: () => navigate("/doctor-dashboard"),
    },
    {
      key: "/doctor-panel/patients",
      icon: <UserOutlined />,
      label: "Danh sách bệnh nhân",
      onClick: () => navigate("/doctor-panel/patients"),
    },
    {
      key: "/doctor-panel/treatment-plans",
      icon: <MedicineBoxOutlined />,
      label: "Phác đồ điều trị",
      onClick: () => navigate("/doctor-panel/treatment-plans"),
    },
    {
      key: "/doctor-panel/clinical-examination",
      icon: <ExperimentOutlined />,
      label: "Khám lâm sàng",
      onClick: () => navigate("/doctor-panel/clinical-examination"),
    },
    {
      key: "/doctor-panel/treatment-monitoring",
      icon: <HeartOutlined />,
      label: "Theo dõi điều trị",
      onClick: () => navigate("/doctor-panel/treatment-monitoring"),
    },
    {
      key: "/doctor-panel/schedule",
      icon: <CalendarOutlined />,
      label: "Lịch làm việc",
      onClick: () => navigate("/doctor-panel/schedule"),
    },
    {
      key: "/doctor-panel/reports",
      icon: <FileTextOutlined />,
      label: "Báo cáo cá nhân",
      onClick: () => navigate("/doctor-panel/reports"),
    },
  ];

  return (
    <Layout className="doctor-layout">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="doctor-sider"
        width={250}
      >
        <div className="doctor-logo">
          <div className="logo-icon">
            <MedicineBoxOutlined />
          </div>
          {!collapsed && <span className="logo-text">FertiCare Doctor</span>}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={sidebarItems}
          className="doctor-menu"
        />
      </Sider>

      <Layout className="doctor-main-layout">
        <Header className="doctor-header">
          <div className="doctor-header-left">
            <Button
              type="text"
              icon={collapsed ? <UserOutlined /> : <UserOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="collapse-btn"
            />
            <h2 className="page-title">Bác sĩ điều trị</h2>
          </div>

          <div className="doctor-header-right">
            <Badge count={7} className="notification-badge">
              <Button
                type="text"
                icon={<BellOutlined />}
                className="notification-btn"
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
                  BS. {user?.fullName || "Doctor"}
                </span>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content className="doctor-content">
          <div className="doctor-content-wrapper">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default DoctorLayout;
