import React, { useState } from "react";
import {
  Card,
  Table,
  Button,
  Typography,
  Tag,
  Row,
  Col,
  Calendar,
  Badge,
  message,
} from "antd";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const PatientScheduleView = ({
  patientId,
  patientInfo,
  schedule,
  treatmentFlow,
  scheduleSubSteps,
  isPatientView = false,
}) => {
  const [viewMode, setViewMode] = useState("table");

  // Use schedule data if available, otherwise use mock data
  const scheduleData = schedule?.schedule || [
    {
      key: "1",
      date: "2025-01-20",
      time: "09:00",
      treatment: "Siêu âm theo dõi",
      activity: "Siêu âm theo dõi",
      status: "scheduled",
      doctor: "BS. Lê Văn Doctor",
      room: "Phòng 101",
    },
    {
      key: "2",
      date: "2025-01-22",
      time: "10:30",
      treatment: "Tiêm kích thích buồng trứng",
      activity: "Tiêm kích thích buồng trứng",
      status: "completed",
      doctor: "BS. Lê Văn Doctor",
      room: "Phòng 102",
    },
    {
      key: "3",
      date: "2025-01-25",
      time: "14:00",
      treatment: "Lấy trứng",
      activity: "Lấy trứng",
      status: "pending",
      doctor: "BS. Lê Văn Doctor",
      room: "Phòng phẫu thuật",
    },
  ];

  // Convert schedule format if needed
  const mockScheduleData = scheduleData.map((item, index) => ({
    key: item.key || index.toString(),
    date: item.date,
    time: item.time || "09:00",
    treatment: item.activity || item.treatment || item.name,
    status: item.status || "scheduled",
    doctor: item.doctor || "BS. Lê Văn Doctor",
    room: item.room || "Phòng điều trị",
  }));

  const columns = [
    {
      title: "Ngày",
      dataIndex: "date",
      key: "date",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Giờ",
      dataIndex: "time",
      key: "time",
    },
    {
      title: "Điều trị",
      dataIndex: "treatment",
      key: "treatment",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusMap = {
          scheduled: { color: "blue", text: "Đã lên lịch" },
          completed: { color: "green", text: "Hoàn thành" },
          pending: { color: "orange", text: "Chờ xử lý" },
          cancelled: { color: "red", text: "Đã hủy" },
        };
        const config = statusMap[status] || { color: "default", text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "Bác sĩ",
      dataIndex: "doctor",
      key: "doctor",
    },
    {
      title: "Phòng",
      dataIndex: "room",
      key: "room",
    },
  ];

  const getCalendarData = (value) => {
    const dateStr = value.format("YYYY-MM-DD");
    const appointment = mockScheduleData.find((item) => item.date === dateStr);

    if (appointment) {
      return [
        {
          type:
            appointment.status === "completed"
              ? "success"
              : appointment.status === "pending"
              ? "warning"
              : "processing",
          content: `${appointment.time} - ${appointment.treatment}`,
        },
      ];
    }
    return [];
  };

  const calendarCellRender = (value) => {
    const listData = getCalendarData(value);
    return (
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {listData.map((item, index) => (
          <li key={index}>
            <Badge
              status={item.type}
              text={item.content}
              style={{ fontSize: "10px" }}
            />
          </li>
        ))}
      </ul>
    );
  };

  return (
    <Card>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={3}>Theo Dõi Bệnh Nhân</Title>
          <Text strong>Bệnh nhân: </Text>
          <Text>{patientInfo?.name || "Không có thông tin"}</Text>
        </Col>
        <Col>
          <Space.Compact>
            <Button
              type={viewMode === "table" ? "primary" : "default"}
              onClick={() => setViewMode("table")}
            >
              Dạng bảng
            </Button>
            <Button
              type={viewMode === "calendar" ? "primary" : "default"}
              onClick={() => setViewMode("calendar")}
            >
              Lịch
            </Button>
          </Space.Compact>
        </Col>
      </Row>

      {viewMode === "table" ? (
        <Table
          columns={columns}
          dataSource={mockScheduleData}
          pagination={false}
          size="middle"
        />
      ) : (
        <Calendar cellRender={calendarCellRender} mode="month" />
      )}

      <Row style={{ marginTop: 16 }} justify="space-between" align="middle">
        <Col>
          <Text type="secondary">
            💡 Tip: Chuyển đổi giữa dạng bảng và lịch để xem thông tin theo cách
            khác nhau
          </Text>
        </Col>
        <Col>
          <Button
            type="primary"
            size="large"
            onClick={() => {
              message.success(
                "✅ Quy trình điều trị đã hoàn thành thành công!"
              );
            }}
          >
            🎉 Hoàn thành quy trình điều trị
          </Button>
        </Col>
      </Row>
    </Card>
  );
};

export default PatientScheduleView;
