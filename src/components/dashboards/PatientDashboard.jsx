import React, { useState, useEffect, useContext } from "react";
import {
  Row,
  Col,
  Card,
  Progress,
  Timeline,
  Calendar,
  Alert,
  Tag,
  Avatar,
  Button,
} from "antd";
import {
  HeartOutlined,
  CalendarOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  TrophyOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { UserContext } from "../../context/UserContext";

const PatientDashboard = () => {
  const { user } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [treatmentData, setTreatmentData] = useState(null);

  useEffect(() => {
    // Simulate API call to get patient data
    setTimeout(() => {
      setTreatmentData({
        treatmentProgress: 65,
        currentPhase: "Kích thích buồng trứng",
        nextAppointment: "2024-01-15 09:00",
        doctorName: "BS. Nguyễn Thị Lan",
        totalSessions: 12,
        completedSessions: 8,
        upcomingTests: ["Siêu âm kiểm tra", "Xét nghiệm hormone"],
        medications: [
          { name: "Gonal-F", dosage: "150 IU", time: "Tối", status: "active" },
          {
            name: "Cetrotide",
            dosage: "0.25mg",
            time: "Sáng",
            status: "active",
          },
        ],
      });
      setLoading(false);
    }, 1000);
  }, []);

  const treatmentTimeline = [
    {
      dot: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
      color: "green",
      children: (
        <div>
          <div>
            <strong>Khám ban đầu</strong>
          </div>
          <div style={{ color: "#8c8c8c", fontSize: "12px" }}>
            15/12/2023 - Hoàn thành
          </div>
          <div style={{ fontSize: "13px", marginTop: "4px" }}>
            Đánh giá tổng quát và lập kế hoạch điều trị
          </div>
        </div>
      ),
    },
    {
      dot: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
      color: "green",
      children: (
        <div>
          <div>
            <strong>Chuẩn bị chu kỳ</strong>
          </div>
          <div style={{ color: "#8c8c8c", fontSize: "12px" }}>
            20/12/2023 - Hoàn thành
          </div>
          <div style={{ fontSize: "13px", marginTop: "4px" }}>
            Điều chỉnh nội tiết và chuẩn bị buồng trứng
          </div>
        </div>
      ),
    },
    {
      dot: <ClockCircleOutlined style={{ color: "#1890ff" }} />,
      color: "blue",
      children: (
        <div>
          <div>
            <strong>Kích thích buồng trứng</strong>
          </div>
          <div style={{ color: "#1890ff", fontSize: "12px" }}>
            Đang thực hiện
          </div>
          <div style={{ fontSize: "13px", marginTop: "4px" }}>
            Tiêm thuốc kích thích và theo dõi phát triển noãn
          </div>
        </div>
      ),
    },
    {
      dot: <ClockCircleOutlined style={{ color: "#8c8c8c" }} />,
      color: "gray",
      children: (
        <div>
          <div>
            <strong>Chọc hút trứng</strong>
          </div>
          <div style={{ color: "#8c8c8c", fontSize: "12px" }}>
            Dự kiến: 22/01/2024
          </div>
        </div>
      ),
    },
    {
      dot: <ClockCircleOutlined style={{ color: "#8c8c8c" }} />,
      color: "gray",
      children: (
        <div>
          <div>
            <strong>Chuyển phôi</strong>
          </div>
          <div style={{ color: "#8c8c8c", fontSize: "12px" }}>
            Dự kiến: 25/01/2024
          </div>
        </div>
      ),
    },
  ];

  const upcomingAppointments = [
    {
      date: "15/01/2024",
      time: "09:00",
      type: "Siêu âm kiểm tra",
      doctor: "BS. Nguyễn Thị Lan",
      status: "confirmed",
    },
    {
      date: "18/01/2024",
      time: "14:00",
      type: "Tái khám",
      doctor: "BS. Nguyễn Thị Lan",
      status: "pending",
    },
  ];

  if (loading) {
    return (
      <div className="flex-center" style={{ height: "400px" }}>
        Đang tải...
      </div>
    );
  }

  return (
    <div className="patient-dashboard fade-in">
      <div className="dashboard-header mb-24">
        <Row justify="space-between" align="middle">
          <Col>
            <h1>Chào mừng, {user?.fullName}!</h1>
            <p>Theo dõi tiến trình điều trị của bạn</p>
          </Col>
          <Col>
            <Avatar size={64} icon={<UserOutlined />} />
          </Col>
        </Row>
      </div>

      {/* Alert for important information */}
      <Alert
        message="Lưu ý quan trọng"
        description="Bạn có lịch khám vào ngày 15/01/2024 lúc 9:00. Vui lòng đến đúng giờ và mang theo các giấy tờ cần thiết."
        type="info"
        showIcon
        style={{ marginBottom: "24px" }}
      />

      {/* Main Statistics */}
      <div className="dashboard-stats">
        <div className="stat-card patient-stat-card">
          <div className="stat-icon">
            <HeartOutlined />
          </div>
          <div className="stat-number">{treatmentData?.treatmentProgress}%</div>
          <div className="stat-label">Tiến trình điều trị</div>
          <Progress
            percent={treatmentData?.treatmentProgress}
            showInfo={false}
            size="small"
            strokeColor="#ff4d4f"
          />
        </div>

        <div className="stat-card patient-stat-card">
          <div className="stat-icon">
            <CalendarOutlined />
          </div>
          <div className="stat-number">
            {treatmentData?.completedSessions}/{treatmentData?.totalSessions}
          </div>
          <div className="stat-label">Buổi điều trị</div>
          <div style={{ fontSize: "12px", color: "#52c41a", marginTop: "4px" }}>
            Đã hoàn thành {treatmentData?.completedSessions} buổi
          </div>
        </div>

        <div className="stat-card patient-stat-card">
          <div className="stat-icon">
            <MedicineBoxOutlined />
          </div>
          <div className="stat-number">
            {treatmentData?.medications?.length}
          </div>
          <div className="stat-label">Thuốc đang dùng</div>
          <div style={{ fontSize: "12px", color: "#fa8c16", marginTop: "4px" }}>
            Đang theo dõi
          </div>
        </div>

        <div className="stat-card patient-stat-card">
          <div className="stat-icon">
            <TrophyOutlined />
          </div>
          <div className="stat-number">Giai đoạn 3</div>
          <div className="stat-label">Trạng thái hiện tại</div>
          <div style={{ fontSize: "12px", color: "#1890ff", marginTop: "4px" }}>
            {treatmentData?.currentPhase}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Row gutter={[24, 24]}>
        {/* Treatment Timeline */}
        <Col xs={24} lg={12}>
          <Card title="Tiến trình điều trị" className="dashboard-card">
            <Timeline items={treatmentTimeline} />
          </Card>
        </Col>

        {/* Upcoming Appointments */}
        <Col xs={24} lg={12}>
          <Card title="Lịch khám sắp tới" className="dashboard-card">
            {upcomingAppointments.map((appointment, index) => (
              <div
                key={index}
                className="appointment-item"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 0",
                  borderBottom:
                    index < upcomingAppointments.length - 1
                      ? "1px solid #f0f0f0"
                      : "none",
                }}
              >
                <div>
                  <div style={{ fontWeight: 500 }}>{appointment.type}</div>
                  <div style={{ color: "#8c8c8c", fontSize: "12px" }}>
                    {appointment.doctor}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 500 }}>{appointment.date}</div>
                  <div style={{ color: "#8c8c8c", fontSize: "12px" }}>
                    {appointment.time}
                  </div>
                  <Tag
                    color={
                      appointment.status === "confirmed" ? "green" : "orange"
                    }
                  >
                    {appointment.status === "confirmed"
                      ? "Đã xác nhận"
                      : "Chờ xác nhận"}
                  </Tag>
                </div>
              </div>
            ))}
          </Card>
        </Col>
      </Row>

      {/* Medications and Tests */}
      <Row gutter={[24, 24]} className="mt-24">
        <Col xs={24} lg={12}>
          <Card title="Thuốc đang sử dụng" className="dashboard-card">
            {treatmentData?.medications?.map((med, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 0",
                  borderBottom:
                    index < treatmentData.medications.length - 1
                      ? "1px solid #f0f0f0"
                      : "none",
                }}
              >
                <div>
                  <div style={{ fontWeight: 500 }}>{med.name}</div>
                  <div style={{ color: "#8c8c8c", fontSize: "12px" }}>
                    {med.dosage} - {med.time}
                  </div>
                </div>
                <Tag color="green">Đang dùng</Tag>
              </div>
            ))}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Xét nghiệm sắp tới" className="dashboard-card">
            {treatmentData?.upcomingTests?.map((test, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 0",
                  borderBottom:
                    index < treatmentData.upcomingTests.length - 1
                      ? "1px solid #f0f0f0"
                      : "none",
                }}
              >
                <div>
                  <div style={{ fontWeight: 500 }}>{test}</div>
                  <div style={{ color: "#8c8c8c", fontSize: "12px" }}>
                    Theo lịch hẹn
                  </div>
                </div>
                <Tag color="blue">Dự kiến</Tag>
              </div>
            ))}
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row gutter={[24, 24]} className="mt-24">
        <Col span={24}>
          <Card title="Hành động nhanh" className="dashboard-card">
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={8} md={6}>
                <Button type="primary" block icon={<CalendarOutlined />}>
                  Đặt lịch hẹn
                </Button>
              </Col>
              <Col xs={12} sm={8} md={6}>
                <Button block icon={<FileTextOutlined />}>
                  Xem hồ sơ
                </Button>
              </Col>
              <Col xs={12} sm={8} md={6}>
                <Button block icon={<BellOutlined />}>
                  Thông báo
                </Button>
              </Col>
              <Col xs={12} sm={8} md={6}>
                <Button block icon={<UserOutlined />}>
                  Liên hệ bác sĩ
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PatientDashboard;
