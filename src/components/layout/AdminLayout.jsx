import { useState, useContext } from "react";
import { Layout, Menu, Avatar, Dropdown, Badge, Button, message } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
  BarChartOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { UserContext } from "../../context/UserContext";
import "./Layout.css";

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
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
      onClick: () => navigate("/admin/profile"),
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Cài đặt",
      onClick: () => navigate("/admin/settings"),
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
      key: "/admin/dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
      onClick: () => navigate("/admin/dashboard"),
    },
    {
      key: "/admin/users",
      icon: <UserOutlined />,
      label: "Quản lý người dùng",
      onClick: () => navigate("/admin/users"),
    },
    {
      key: "/admin/departments",
      icon: <MedicineBoxOutlined />,
      label: "Quản lý phòng ban",
      onClick: () => navigate("/admin/departments"),
    },
    {
      key: "/admin/doctors",
      icon: <TeamOutlined />,
      label: "Quản lý bác sĩ",
      onClick: () => navigate("/admin/doctors"),
    },
    {
      key: "/admin/schedule",
      icon: <CalendarOutlined />,
      label: "Quản lý lịch trình",
      onClick: () => navigate("/admin/schedule"),
    },
    {
      key: "/admin/reports",
      icon: <BarChartOutlined />,
      label: "Báo cáo hệ thống",
      onClick: () => navigate("/admin/reports"),
    },
    {
      key: "/admin/settings",
      icon: <SettingOutlined />,
      label: "Cài đặt hệ thống",
      onClick: () => navigate("/admin/settings"),
    },
  ];

  return (
    <Layout className="admin-layout">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="admin-sider"
        width={250}
      >
        <div className="admin-logo">
          <div className="logo-icon">
            <MedicineBoxOutlined />
          </div>
          {!collapsed && <span className="logo-text">FertiCare Admin</span>}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={sidebarItems}
          className="admin-menu"
        />
      </Sider>

      <Layout className="admin-main-layout">
        <Header className="admin-header">
          <div className="admin-header-left">
            <Button
              type="text"
              icon={collapsed ? <UserOutlined /> : <UserOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="collapse-btn"
            />
            <h2 className="page-title">Quản trị hệ thống</h2>
          </div>

          <div className="admin-header-right">
            <Badge count={5} className="notification-badge">
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
                <span className="user-name">{user?.fullName || "Admin"}</span>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content className="admin-content">
          <div className="admin-content-wrapper">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
