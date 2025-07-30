import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Progress,
  Tag,
  Timeline,
  Badge,
} from "antd";
import {
  UserOutlined,
  TeamOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  RiseOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    // TODO: Replace with actual API call
    setLoading(false);
  }, []);

  // TODO: Replace with actual API data
  const userGrowthData = [];
  const departmentData = [];

  const recentActivities = [
    {
      key: "1",
      user: "BS. Nguyễn Văn A",
      action: "Tạo phác đồ điều trị mới",
      time: "2 phút trước",
      status: "success",
    },
    {
      key: "2",
      user: "Quản lý Trần Thị B",
      action: "Phê duyệt lịch làm việc",
      time: "15 phút trước",
      status: "processing",
    },
    {
      key: "3",
      user: "Hệ thống",
      action: "Backup dữ liệu hoàn tất",
      time: "1 giờ trước",
      status: "success",
    },
    {
      key: "4",
      user: "BN. Nguyễn Thị C",
      action: "Đăng ký lịch khám",
      time: "2 giờ trước",
      status: "default",
    },
  ];

  const columns = [
    {
      title: "Người dùng",
      dataIndex: "user",
      key: "user",
    },
    {
      title: "Hoạt động",
      dataIndex: "action",
      key: "action",
    },
    {
      title: "Thời gian",
      dataIndex: "time",
      key: "time",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={
            status === "success"
              ? "green"
              : status === "processing"
              ? "blue"
              : "default"
          }
        >
          {status === "success"
            ? "Hoàn thành"
            : status === "processing"
            ? "Đang xử lý"
            : "Mới"}
        </Tag>
      ),
    },
  ];

  // Custom colors for the pie chart
  const COLORS = ["#1890ff", "#52c41a", "#722ed1", "#fa8c16"];

  if (loading) {
    return (
      <div className="flex-center" style={{ height: "400px" }}>
        Đang tải...
      </div>
    );
  }

  return (
    <div className="admin-dashboard fade-in">
      <div className="dashboard-header mb-24">
        <h1>Dashboard Quản trị viên</h1>
        <p>Tổng quan hoạt động hệ thống FertiCare</p>
      </div>

      {/* Statistics Cards */}
      <div className="dashboard-stats">
        <div className="stat-card admin-stat-card">
          <div className="stat-icon">
            <UserOutlined />
          </div>
          <div className="stat-number">{dashboardData?.totalUsers}</div>
          <div className="stat-label">Tổng người dùng</div>
          <div className="stat-trend">
            <RiseOutlined style={{ color: "#52c41a" }} />
            <span style={{ color: "#52c41a", marginLeft: "4px" }}>
              +{dashboardData?.monthlyGrowth}% tháng này
            </span>
          </div>
        </div>

        <div className="stat-card admin-stat-card">
          <div className="stat-icon">
            <TeamOutlined />
          </div>
          <div className="stat-number">{dashboardData?.totalDoctors}</div>
          <div className="stat-label">Bác sĩ</div>
          <div className="stat-trend">
            <CheckCircleOutlined style={{ color: "#52c41a" }} />
            <span style={{ color: "#52c41a", marginLeft: "4px" }}>
              Hoạt động: {dashboardData?.activeUsers}
            </span>
          </div>
        </div>

        <div className="stat-card admin-stat-card">
          <div className="stat-icon">
            <MedicineBoxOutlined />
          </div>
          <div className="stat-number">{dashboardData?.totalDepartments}</div>
          <div className="stat-label">Phòng ban</div>
          <div className="stat-trend">
            <ClockCircleOutlined style={{ color: "#fa8c16" }} />
            <span style={{ color: "#fa8c16", marginLeft: "4px" }}>
              Chờ duyệt: {dashboardData?.pendingApprovals}
            </span>
          </div>
        </div>

        <div className="stat-card admin-stat-card">
          <div className="stat-icon">
            <CalendarOutlined />
          </div>
          <div className="stat-number">{dashboardData?.systemHealth}%</div>
          <div className="stat-label">Tình trạng hệ thống</div>
          <Progress
            percent={dashboardData?.systemHealth}
            showInfo={false}
            size="small"
            strokeColor="#52c41a"
          />
        </div>
      </div>

      {/* Charts Section */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card title="Tăng trưởng người dùng" className="dashboard-card">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#1890ff"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title="Phân bố bệnh nhân theo phòng ban"
            className="dashboard-card"
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="patients"
                  nameKey="department"
                  label={({ department, patients }) =>
                    `${department}: ${patients}`
                  }
                >
                  {departmentData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Activity Table */}
      <Row gutter={[24, 24]} className="mt-24">
        <Col xs={24} lg={16}>
          <Card title="Hoạt động gần đây" className="dashboard-card">
            <Table
              columns={columns}
              dataSource={recentActivities}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Thông báo hệ thống" className="dashboard-card">
            <Timeline>
              <Timeline.Item color="green">
                <div>
                  <strong>Backup hoàn tất</strong>
                  <div style={{ color: "#8c8c8c", fontSize: "12px" }}>
                    10:30 AM
                  </div>
                </div>
              </Timeline.Item>
              <Timeline.Item color="blue" dot={<AlertOutlined />}>
                <div>
                  <strong>Cập nhật hệ thống</strong>
                  <div style={{ color: "#8c8c8c", fontSize: "12px" }}>
                    9:15 AM
                  </div>
                </div>
              </Timeline.Item>
              <Timeline.Item color="red">
                <div>
                  <strong>Cảnh báo bảo mật</strong>
                  <div style={{ color: "#8c8c8c", fontSize: "12px" }}>
                    8:45 AM
                  </div>
                </div>
              </Timeline.Item>
              <Timeline.Item>
                <div>
                  <strong>Khởi động hệ thống</strong>
                  <div style={{ color: "#8c8c8c", fontSize: "12px" }}>
                    8:00 AM
                  </div>
                </div>
              </Timeline.Item>
            </Timeline>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row gutter={[24, 24]} className="mt-24">
        <Col span={24}>
          <Card title="Hành động nhanh" className="dashboard-card">
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={8} md={6}>
                <div className="quick-action-item">
                  <UserOutlined
                    style={{ fontSize: "24px", color: "#1890ff" }}
                  />
                  <div>Thêm người dùng</div>
                </div>
              </Col>
              <Col xs={12} sm={8} md={6}>
                <div className="quick-action-item">
                  <MedicineBoxOutlined
                    style={{ fontSize: "24px", color: "#52c41a" }}
                  />
                  <div>Tạo phòng ban</div>
                </div>
              </Col>
              <Col xs={12} sm={8} md={6}>
                <div className="quick-action-item">
                  <TeamOutlined
                    style={{ fontSize: "24px", color: "#722ed1" }}
                  />
                  <div>Quản lý bác sĩ</div>
                </div>
              </Col>
              <Col xs={12} sm={8} md={6}>
                <div className="quick-action-item">
                  <CalendarOutlined
                    style={{ fontSize: "24px", color: "#fa8c16" }}
                  />
                  <div>Xem báo cáo</div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
