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
  Empty,
  Statistic,
  Spin,
  Typography,
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
import apiTreatmentManagement from "../../api/apiTreatmentManagement";
import axiosClient from "../../services/axiosClient";

const { Text } = Typography;

const PatientDashboard = () => {
  const { user } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [treatmentData, setTreatmentData] = useState(null);

  useEffect(() => {
    if (user?.id) {
      loadPatientData();
    }
  }, [user]);

  const loadPatientData = async () => {
    try {
      setLoading(true);

      console.log("🏥 [PatientDashboard] Loading patient data for:", user.id);

      // Load all patient data in parallel
      const [phasesResponse, appointmentsResponse, clinicalResponse] =
        await Promise.allSettled([
          apiTreatmentManagement.getPatientTreatmentPhases(user.id),
          axiosClient.get(`/api/appointments/customer/${user.id}`),
          apiTreatmentManagement.getPatientClinicalResults(user.id),
        ]);

      // Process treatment phases
      let treatmentProgress = 0;
      let currentPhase = "Chưa bắt đầu";
      let totalSessions = 0;
      let completedSessions = 0;

      if (
        phasesResponse.status === "fulfilled" &&
        phasesResponse.value?.success
      ) {
        const phases = phasesResponse.value.data || [];
        totalSessions = phases.length;
        completedSessions = phases.filter(
          (phase) => phase.status === "Completed"
        ).length;
        const inProgressPhase = phases.find(
          (phase) => phase.status === "In Progress"
        );
        currentPhase = inProgressPhase?.phaseName || "Chưa bắt đầu";
        treatmentProgress =
          totalSessions > 0
            ? Math.round((completedSessions / totalSessions) * 100)
            : 0;
      }

      // Process appointments
      const appointments =
        appointmentsResponse.status === "fulfilled"
          ? appointmentsResponse.value.data || []
          : [];

      const upcomingAppts = appointments
        .filter((apt) => new Date(apt.appointmentTime) > new Date())
        .sort(
          (a, b) => new Date(a.appointmentTime) - new Date(b.appointmentTime)
        )
        .slice(0, 2)
        .map((apt) => ({
          date: formatDateTime(apt.appointmentTime).date,
          time: formatDateTime(apt.appointmentTime).time,
          type: apt.serviceName || "Khám tổng quát",
          doctor: "BS. Điều trị",
          status: "confirmed",
        }));

      setUpcomingAppointments(upcomingAppts);

      // Process clinical results
      const clinicalResults =
        clinicalResponse.status === "fulfilled" &&
        clinicalResponse.value?.success
          ? clinicalResponse.value.data || []
          : [];

      setTreatmentData({
        treatmentProgress,
        currentPhase,
        nextAppointment:
          upcomingAppts.length > 0 ? upcomingAppts[0].appointmentTime : null,
        doctorName:
          upcomingAppts.length > 0 ? "BS. Điều trị" : "Chưa phân công",
        totalSessions,
        completedSessions,
        upcomingTests:
          clinicalResults.length > 0
            ? ["Siêu âm kiểm tra", "Xét nghiệm hormone"]
            : [],
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

      console.log("✅ [PatientDashboard] Patient data loaded successfully");
    } catch (error) {
      console.error("❌ [PatientDashboard] Error loading patient data:", error);
      // Fallback to default data
      setTreatmentData({
        treatmentProgress: 0,
        currentPhase: "Chưa bắt đầu",
        nextAppointment: null,
        doctorName: "Chưa phân công",
        totalSessions: 0,
        completedSessions: 0,
        upcomingTests: [],
        medications: [],
      });
    } finally {
      setLoading(false);
    }
  };

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

  const [upcomingAppointments, setUpcomingAppointments] = useState([]);

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return { date: "Chưa có", time: "" };
    try {
      const date = new Date(dateTimeString);
      return {
        date: date.toLocaleDateString("vi-VN"),
        time: date.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    } catch (error) {
      return { date: "Không hợp lệ", time: "" };
    }
  };

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
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((appointment, index) => (
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
              ))
            ) : (
              <Empty
                description="Không có lịch khám sắp tới"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
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
