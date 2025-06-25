import { useState, useContext } from "react";
import { Layout, Menu, Avatar, Dropdown, Badge, Button, message } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  LogoutOutlined,
  BellOutlined,
  BarChartOutlined,
  CalendarOutlined,
  ScheduleOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { UserContext } from "../../context/UserContext";
import "./Layout.css";

const { Header, Sider, Content } = Layout;

const ManagerLayout = () => {
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
      onClick: () => navigate("/manager/profile"),
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
      key: "/manager/dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
      onClick: () => navigate("/manager/dashboard"),
    },
    {
      key: "/manager/doctors",
      icon: <TeamOutlined />,
      label: "Quản lý bác sĩ",
      onClick: () => navigate("/manager/doctors"),
    },
    {
      key: "/manager/schedule",
      icon: <CalendarOutlined />,
      label: "Lịch trình nhóm",
      onClick: () => navigate("/manager/schedule"),
    },
    {
      key: "/manager/shift-management",
      icon: <ScheduleOutlined />,
      label: "Phân ca làm việc",
      onClick: () => navigate("/manager/shift-management"),
    },
    {
      key: "/manager/treatment-approval",
      icon: <FileTextOutlined />,
      label: "Duyệt phác đồ điều trị",
      onClick: () => navigate("/manager/treatment-approval"),
    },
    {
      key: "/manager/reports",
      icon: <BarChartOutlined />,
      label: "Báo cáo nhóm",
      onClick: () => navigate("/manager/reports"),
    },
  ];

  return (
    <Layout className="manager-layout">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="manager-sider"
        width={250}
      >
        <div className="manager-logo">
          <div className="logo-icon">
            <TeamOutlined />
          </div>
          {!collapsed && <span className="logo-text">FertiCare Manager</span>}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={sidebarItems}
          className="manager-menu"
        />
      </Sider>

      <Layout className="manager-main-layout">
        <Header className="manager-header">
          <div className="manager-header-left">
            <Button
              type="text"
              icon={collapsed ? <UserOutlined /> : <UserOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="collapse-btn"
            />
            <h2 className="page-title">Quản lý nhóm</h2>
          </div>

          <div className="manager-header-right">
            <Badge count={3} className="notification-badge">
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
                <span className="user-name">{user?.fullName || "Manager"}</span>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content className="manager-content">
          <div className="manager-content-wrapper">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default ManagerLayout;
