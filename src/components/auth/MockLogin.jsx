import React, { useContext } from "react";
import { Card, Button, Space, Typography, Divider, message } from "antd";
import { UserContext, USER_ROLES } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const MockLogin = () => {
  const { login } = useContext(UserContext);
  const navigate = useNavigate();

  const mockUsers = [
    {
      id: 1,
      fullName: "Nguyễn Văn Admin",
      email: "admin@ferticare.com",
      role: USER_ROLES.ADMIN,
      token: "mock-admin-token",
      description: "Quản trị viên hệ thống - Có toàn quyền quản lý",
    },
    {
      id: 2,
      fullName: "Trần Thị Manager",
      email: "manager@ferticare.com",
      role: USER_ROLES.MANAGER,
      token: "mock-manager-token",
      description: "Quản lý nhóm - Quản lý bác sĩ và lịch trình",
    },
    {
      id: 3,
      fullName: "BS. Lê Văn Doctor",
      email: "doctor@ferticare.com",
      role: USER_ROLES.DOCTOR,
      token: "mock-doctor-token",
      description: "Bác sĩ - Điều trị và chăm sóc bệnh nhân",
    },
    {
      id: 4,
      fullName: "Phạm Thị Patient",
      email: "patient@ferticare.com",
      role: USER_ROLES.PATIENT,
      token: "mock-patient-token",
      hasRegisteredService: true,
      description: "Bệnh nhân - Theo dõi tiến trình điều trị",
    },
    {
      id: 5,
      fullName: "Lê Văn Customer",
      email: "customer@ferticare.com",
      role: USER_ROLES.CUSTOMER,
      token: "mock-customer-token",
      hasRegisteredService: false,
      description: "Khách hàng - Chưa đăng ký dịch vụ",
    },
  ];

  const handleMockLogin = (user) => {
    login(user);
    message.success(
      `Đăng nhập thành công với vai trò ${getRoleDisplayName(user.role)}!`
    );

    // Navigate to appropriate dashboard
    switch (user.role) {
      case USER_ROLES.ADMIN:
        navigate("/admin/dashboard");
        break;
      case USER_ROLES.MANAGER:
        navigate("/manager/dashboard");
        break;
      case USER_ROLES.DOCTOR:
        navigate("/doctor-dashboard");
        break;
      case USER_ROLES.PATIENT:
        navigate("/patient/dashboard");
        break;
      case USER_ROLES.CUSTOMER:
        navigate("/"); // Customer stays on homepage to register for service
        break;
      default:
        navigate("/");
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case USER_ROLES.ADMIN:
        return "Quản trị viên";
      case USER_ROLES.MANAGER:
        return "Quản lý";
      case USER_ROLES.DOCTOR:
        return "Bác sĩ";
      case USER_ROLES.PATIENT:
        return "Bệnh nhân";
      case USER_ROLES.CUSTOMER:
        return "Khách hàng";
      default:
        return "Không xác định";
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case USER_ROLES.ADMIN:
        return "#1890ff";
      case USER_ROLES.MANAGER:
        return "#52c41a";
      case USER_ROLES.DOCTOR:
        return "#722ed1";
      case USER_ROLES.PATIENT:
        return "#ff4d4f";
      case USER_ROLES.CUSTOMER:
        return "#fa8c16"; // Orange color for customer
      default:
        return "#8c8c8c";
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: "600px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          borderRadius: "16px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <Title level={2} style={{ color: "#262626", marginBottom: "8px" }}>
            🩺 FertiCare System
          </Title>
          <Text type="secondary" style={{ fontSize: "16px" }}>
            Demo đăng nhập với các vai trò khác nhau
          </Text>
        </div>

        <Divider />

        <div style={{ marginBottom: "24px" }}>
          <Text strong style={{ fontSize: "16px" }}>
            Chọn vai trò để đăng nhập:
          </Text>
        </div>

        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          {mockUsers.map((user) => (
            <Card
              key={user.id}
              size="small"
              style={{
                border: `2px solid ${getRoleColor(user.role)}20`,
                borderRadius: "12px",
                transition: "all 0.3s",
              }}
              hoverable
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        backgroundColor: getRoleColor(user.role),
                        marginRight: "8px",
                      }}
                    />
                    <Text strong style={{ fontSize: "16px" }}>
                      {user.fullName}
                    </Text>
                  </div>
                  <Text
                    type="secondary"
                    style={{ display: "block", marginBottom: "4px" }}
                  >
                    {user.email}
                  </Text>
                  <Text style={{ fontSize: "13px", color: "#8c8c8c" }}>
                    {user.description}
                  </Text>
                </div>
                <Button
                  type="primary"
                  onClick={() => handleMockLogin(user)}
                  style={{
                    backgroundColor: getRoleColor(user.role),
                    borderColor: getRoleColor(user.role),
                    borderRadius: "8px",
                    fontWeight: "500",
                  }}
                >
                  Đăng nhập
                </Button>
              </div>
            </Card>
          ))}
        </Space>

        <Divider />

        <div style={{ textAlign: "center" }}>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            💡 Đây là bản demo. Mỗi vai trò sẽ có giao diện và quyền truy cập
            khác nhau.
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default MockLogin;
