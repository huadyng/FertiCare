import React, { useEffect, useState, useCallback } from "react";
import { getPatientAppointments } from "../../../api/apiAppointment";
import apiAuth from "../../../api/apiAuth";
import {
  Card,
  Table,
  Badge,
  Typography,
  Button,
  Empty,
  Spin,
  Alert,
  Row,
  Col,
  Space,
} from "antd";
import { CalendarOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const statusMap = {
  PENDING: { color: "warning", text: "Chờ xác nhận" },
  CONFIRMED: { color: "processing", text: "Đã xác nhận" },
  COMPLETED: { color: "success", text: "Hoàn thành" },
  CANCELLED: { color: "error", text: "Đã hủy" },
  CHECKED_IN: { color: "blue", text: "Đã check-in" },
};

const columns = [
  {
    title: "Ngày hẹn",
    dataIndex: "appointmentDate",
    key: "appointmentDate",
    render: (date) =>
      date ? new Date(date).toLocaleDateString("vi-VN") : "N/A",
    responsive: ["xs", "sm", "md", "lg", "xl"],
  },
  {
    title: "Giờ hẹn",
    dataIndex: "appointmentTimeOnly",
    key: "appointmentTimeOnly",
    render: (time) => time || "N/A",
    responsive: ["sm", "md", "lg", "xl"],
  },
  {
    title: "Bác sĩ",
    dataIndex: "doctorName",
    key: "doctorName",
    render: (name) =>
      name ? (
        <span>👨‍⚕️ {name}</span>
      ) : (
        <Text type="secondary">Chưa phân công</Text>
      ),
    responsive: ["sm", "md", "lg", "xl"],
  },
  {
    title: "Phòng khám",
    dataIndex: "room",
    key: "room",
    render: (room) =>
      room ? (
        <span>🏥 {room}</span>
      ) : (
        <Text type="secondary">Chưa phân phòng</Text>
      ),
    responsive: ["md", "lg", "xl"],
  },
  {
    title: "Trạng thái",
    dataIndex: "checkInStatus",
    key: "checkInStatus",
    render: (status) => {
      const s = statusMap[status] || { color: "default", text: status };
      return <Badge status={s.color} text={s.text} />;
    },
    responsive: ["xs", "sm", "md", "lg", "xl"],
  },
  {
    title: "Ngày tạo",
    dataIndex: "createdAt",
    key: "createdAt",
    render: (date) =>
      date ? new Date(date).toLocaleDateString("vi-VN") : "N/A",
    responsive: ["lg", "xl"],
  },
];

const PatientAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const user = apiAuth.getCurrentUser();

  const fetchAppointments = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await getPatientAppointments(user.id);
      if (res.isSuccess === true || (res.data && Array.isArray(res.data))) {
        setAppointments(res.data);
        setError("");
      } else {
        const errorMsg =
          res.message?.messageDetail || res.message || "Không lấy được dữ liệu";
        setError(errorMsg);
      }
    } catch (err) {
      setError("Lỗi khi lấy lịch hẹn: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Summary
  const total = appointments.length;
  const confirmed = appointments.filter(
    (a) => a.checkInStatus === "CONFIRMED"
  ).length;
  const completed = appointments.filter(
    (a) => a.checkInStatus === "COMPLETED"
  ).length;

  return (
    <Row
      justify="center"
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #ffeef3 0%, #ffe4e6 50%, #fff1f2 100%)",
        padding: 24,
      }}
    >
      <Col xs={24} sm={22} md={20} lg={18} xl={16}>
        <Card
          style={{
            marginTop: 32,
            borderRadius: 24,
            boxShadow: "0 8px 32px rgba(255,126,179,0.10)",
          }}
          styles={{ body: { padding: 32 } }}
        >
          <Space direction="vertical" style={{ width: "100%" }} size={32}>
            <div style={{ textAlign: "center" }}>
              <Title
                level={2}
                style={{
                  marginBottom: 0,
                  fontWeight: 800,
                  color: "#ff6b9d",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                }}
              >
                <CalendarOutlined
                  style={{ fontSize: 36, color: "#ff6b9d", marginRight: 8 }}
                />
                Lịch hẹn của tôi
              </Title>
              <Text type="secondary" style={{ fontSize: 16 }}>
                Quản lý và theo dõi các lịch hẹn khám bệnh của bạn
              </Text>
            </div>

            {/* Summary */}
            <Row gutter={16} justify="center">
              <Col xs={24} sm={8}>
                <Card
                  variant="borderless"
                  style={{
                    background: "#fff0f6",
                    borderRadius: 16,
                    textAlign: "center",
                  }}
                >
                  <Text strong style={{ fontSize: 28, color: "#ff6b9d" }}>
                    {total}
                  </Text>
                  <div style={{ color: "#ff6b9d", fontWeight: 600 }}>
                    Tổng lịch hẹn
                  </div>
                </Card>
              </Col>
              <Col xs={12} sm={8}>
                <Card
                  variant="borderless"
                  style={{
                    background: "#e6f7ff",
                    borderRadius: 16,
                    textAlign: "center",
                  }}
                >
                  <Text strong style={{ fontSize: 28, color: "#1890ff" }}>
                    {confirmed}
                  </Text>
                  <div style={{ color: "#1890ff", fontWeight: 600 }}>
                    Đã xác nhận
                  </div>
                </Card>
              </Col>
              <Col xs={12} sm={8}>
                <Card
                  variant="borderless"
                  style={{
                    background: "#f6ffed",
                    borderRadius: 16,
                    textAlign: "center",
                  }}
                >
                  <Text strong style={{ fontSize: 28, color: "#52c41a" }}>
                    {completed}
                  </Text>
                  <div style={{ color: "#52c41a", fontWeight: 600 }}>
                    Hoàn thành
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Main content */}
            {loading ? (
              <Spin size="large" tip="Đang tải dữ liệu lịch hẹn...">
                <div style={{ height: 120 }} />
              </Spin>
            ) : error ? (
              <Alert
                message="Không thể tải dữ liệu"
                description={error}
                type="error"
                showIcon
                action={
                  <Button
                    type="primary"
                    onClick={fetchAppointments}
                    style={{ background: "#ff6b9d", borderColor: "#ff6b9d" }}
                  >
                    Thử lại
                  </Button>
                }
                style={{ margin: "32px 0" }}
              />
            ) : total === 0 ? (
              <Empty
                description={
                  <span>
                    Bạn chưa có lịch hẹn hoặc dịch vụ nào được đăng ký.
                    <br />
                    <Button
                      type="primary"
                      style={{
                        marginTop: 16,
                        background: "#ff6b9d",
                        borderColor: "#ff6b9d",
                      }}
                    >
                      Đặt lịch hẹn ngay
                    </Button>
                  </span>
                }
                imageStyle={{ height: 80 }}
                style={{ margin: "32px 0" }}
              />
            ) : (
              <Table
                columns={columns}
                dataSource={appointments.map((a) => ({
                  ...a,
                  key: a.appointmentId,
                }))}
                pagination={{ pageSize: 8, showSizeChanger: false }}
                bordered
                size="middle"
                style={{ background: "white", borderRadius: 16 }}
                scroll={{ x: true }}
              />
            )}
          </Space>
        </Card>
      </Col>
    </Row>
  );
};

export default PatientAppointments;
