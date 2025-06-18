import React, { useState, useEffect } from "react";
import {
  Card,
  Timeline,
  Calendar,
  Badge,
  Button,
  Row,
  Col,
  Space,
  Tag,
  Typography,
  Divider,
  Alert,
  List,
  Avatar,
  Tabs,
  Progress,
  Statistic,
  Modal,
  Empty,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  MedicineBoxOutlined,
  ExperimentOutlined,
  UserOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  BellOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { treatmentScheduleAPI } from "../../../services/treatmentAPI.js";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const PatientScheduleView = ({
  patientId,
  patientInfo,
  isPatientView = true,
}) => {
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [detailModal, setDetailModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    loadPatientSchedule();
  }, [patientId]);

  const loadPatientSchedule = async () => {
    try {
      setLoading(true);
      const schedules = await treatmentScheduleAPI.getPatientSchedule(
        patientId
      );

      if (schedules.length > 0) {
        const latestSchedule = schedules[0];
        setSchedule(latestSchedule);

        // Lọc các buổi sắp tới
        const today = new Date();
        const upcoming = latestSchedule.sessions
          .filter((session) => {
            const sessionDate = new Date(session.date + " " + session.time);
            return sessionDate >= today && session.status === "scheduled";
          })
          .sort(
            (a, b) =>
              new Date(a.date + " " + a.time) - new Date(b.date + " " + b.time)
          );

        setUpcomingAppointments(upcoming.slice(0, 5)); // Lấy 5 buổi gần nhất
      }
    } catch (error) {
      console.error("Error loading schedule:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSessionIcon = (type) => {
    if (type.includes("siêu âm")) return <ExperimentOutlined />;
    if (type.includes("xét nghiệm")) return <ExperimentOutlined />;
    if (type.includes("tiêm")) return <MedicineBoxOutlined />;
    if (type.includes("khám")) return <UserOutlined />;
    return <CalendarOutlined />;
  };

  const getSessionColor = (type, status) => {
    if (status === "completed") return "green";
    if (type.includes("siêu âm")) return "blue";
    if (type.includes("xét nghiệm")) return "red";
    if (type.includes("tiêm")) return "orange";
    if (type.includes("khám")) return "purple";
    return "default";
  };

  const getStatusText = (status) => {
    switch (status) {
      case "scheduled":
        return "Đã lên lịch";
      case "completed":
        return "Hoàn thành";
      case "cancelled":
        return "Đã hủy";
      case "missed":
        return "Đã bỏ lỡ";
      default:
        return status;
    }
  };

  // Calendar data
  const getCalendarData = (value) => {
    if (!schedule) return [];
    const dateStr = value.format("YYYY-MM-DD");
    return schedule.sessions.filter((session) => session.date === dateStr);
  };

  const dateCellRender = (value) => {
    const sessions = getCalendarData(value);
    return (
      <div style={{ minHeight: "80px" }}>
        {sessions.map((session, index) => (
          <div key={index} style={{ marginBottom: "4px" }}>
            <Badge
              status={session.status === "completed" ? "success" : "processing"}
              text={
                <span
                  style={{
                    fontSize: "11px",
                    cursor: "pointer",
                    display: "block",
                  }}
                  onClick={() => {
                    setSelectedSession(session);
                    setDetailModal(true);
                  }}
                >
                  {session.time} - {session.type}
                </span>
              }
            />
          </div>
        ))}
      </div>
    );
  };

  // Tính toán tiến độ điều trị
  const calculateProgress = () => {
    if (!schedule) return { completed: 0, total: 0, percentage: 0 };

    const total = schedule.sessions.length;
    const completed = schedule.sessions.filter(
      (s) => s.status === "completed"
    ).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, total, percentage };
  };

  const progress = calculateProgress();

  const formatDateTime = (date, time) => {
    const dateObj = new Date(date + " " + time);
    return dateObj.toLocaleString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeRemaining = (date, time) => {
    const sessionDate = new Date(date + " " + time);
    const now = new Date();
    const diff = sessionDate - now;

    if (diff < 0) return "Đã qua";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `Còn ${days} ngày`;
    if (hours > 0) return `Còn ${hours} giờ`;
    return "Sắp tới";
  };

  if (!schedule) {
    return (
      <div
        style={{ padding: "24px", background: "#f5f5f5", minHeight: "100vh" }}
      >
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Chưa có lịch trình điều trị"
          />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", background: "#f5f5f5", minHeight: "100vh" }}>
      <Title level={2}>
        {isPatientView
          ? "Lịch Trình Điều Trị Của Tôi"
          : "Lịch Trình Điều Trị Bệnh Nhân"}
      </Title>

      {/* Thông tin tổng quan */}
      <Row gutter={24} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tiến độ điều trị"
              value={progress.percentage}
              suffix="%"
              prefix={<CheckCircleOutlined />}
            />
            <Progress percent={progress.percentage} size="small" />
            <Text type="secondary">
              {progress.completed}/{progress.total} buổi hoàn thành
            </Text>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Buổi sắp tới"
              value={upcomingAppointments.length}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng số buổi"
              value={schedule.sessions.length}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Bệnh nhân"
              value={patientInfo?.name || "N/A"}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Cảnh báo buổi sắp tới */}
      {upcomingAppointments.length > 0 && (
        <Alert
          message="Buổi điều trị sắp tới"
          description={
            <div>
              <Text strong>{upcomingAppointments[0].type}</Text> -{" "}
              {formatDateTime(
                upcomingAppointments[0].date,
                upcomingAppointments[0].time
              )}
              <br />
              <Text type="secondary">
                Phòng: {upcomingAppointments[0].room} |{" "}
                {getTimeRemaining(
                  upcomingAppointments[0].date,
                  upcomingAppointments[0].time
                )}
              </Text>
            </div>
          }
          type="info"
          icon={<BellOutlined />}
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <Tabs defaultActiveKey="upcoming">
        <TabPane tab="Lịch sắp tới" key="upcoming">
          <Card title="Các buổi điều trị sắp tới">
            <List
              dataSource={upcomingAppointments}
              renderItem={(session) => (
                <List.Item
                  actions={[
                    <Button
                      type="link"
                      onClick={() => {
                        setSelectedSession(session);
                        setDetailModal(true);
                      }}
                    >
                      Chi tiết
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        icon={getSessionIcon(session.type)}
                        style={{
                          backgroundColor:
                            getSessionColor(session.type, session.status) ===
                            "blue"
                              ? "#1890ff"
                              : getSessionColor(
                                  session.type,
                                  session.status
                                ) === "red"
                              ? "#ff4d4f"
                              : getSessionColor(
                                  session.type,
                                  session.status
                                ) === "orange"
                              ? "#fa8c16"
                              : "#722ed1",
                        }}
                      />
                    }
                    title={
                      <Space>
                        <Text strong>{session.type}</Text>
                        <Tag
                          color={getSessionColor(session.type, session.status)}
                        >
                          {getStatusText(session.status)}
                        </Tag>
                      </Space>
                    }
                    description={
                      <div>
                        <Space direction="vertical" size="small">
                          <Text type="secondary">
                            <CalendarOutlined />{" "}
                            {formatDateTime(session.date, session.time)}
                          </Text>
                          <Text type="secondary">
                            <EnvironmentOutlined /> {session.room} | Thời gian:{" "}
                            {session.duration} phút
                          </Text>
                          <Text type="secondary">
                            <ClockCircleOutlined />{" "}
                            {getTimeRemaining(session.date, session.time)}
                          </Text>
                          {session.notes && (
                            <Text type="secondary">
                              <InfoCircleOutlined /> {session.notes}
                            </Text>
                          )}
                        </Space>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </TabPane>

        <TabPane tab="Timeline" key="timeline">
          <Card title="Timeline điều trị">
            <Timeline mode="left">
              {schedule.sessions
                .sort(
                  (a, b) =>
                    new Date(a.date + " " + a.time) -
                    new Date(b.date + " " + b.time)
                )
                .map((session, index) => (
                  <Timeline.Item
                    key={index}
                    color={session.status === "completed" ? "green" : "blue"}
                    dot={
                      session.status === "completed" ? (
                        <CheckCircleOutlined />
                      ) : (
                        getSessionIcon(session.type)
                      )
                    }
                  >
                    <Card size="small" style={{ marginBottom: 16 }}>
                      <Space
                        direction="vertical"
                        size="small"
                        style={{ width: "100%" }}
                      >
                        <div>
                          <Text strong>{session.type}</Text>
                          <Tag
                            color={getSessionColor(
                              session.type,
                              session.status
                            )}
                            style={{ marginLeft: 8 }}
                          >
                            {getStatusText(session.status)}
                          </Tag>
                        </div>
                        <Text type="secondary">
                          <CalendarOutlined />{" "}
                          {formatDateTime(session.date, session.time)}
                        </Text>
                        <Text type="secondary">
                          <EnvironmentOutlined /> {session.room}
                        </Text>
                        {session.medications &&
                          session.medications.length > 0 && (
                            <div>
                              <Text type="secondary">
                                <MedicineBoxOutlined /> Thuốc:{" "}
                                {session.medications.join(", ")}
                              </Text>
                            </div>
                          )}
                        {session.tests && session.tests.length > 0 && (
                          <div>
                            <Text type="secondary">
                              <ExperimentOutlined /> Xét nghiệm:{" "}
                              {session.tests.join(", ")}
                            </Text>
                          </div>
                        )}
                        {session.notes && (
                          <Text type="secondary">
                            <InfoCircleOutlined /> {session.notes}
                          </Text>
                        )}
                      </Space>
                    </Card>
                  </Timeline.Item>
                ))}
            </Timeline>
          </Card>
        </TabPane>

        <TabPane tab="Lịch Calendar" key="calendar">
          <Card title="Lịch điều trị">
            <Calendar
              dateCellRender={dateCellRender}
              onSelect={(date) => {
                setSelectedDate(date);
                const sessions = getCalendarData(date);
                if (sessions.length > 0) {
                  setSelectedSession(sessions[0]);
                  setDetailModal(true);
                }
              }}
            />
          </Card>
        </TabPane>
      </Tabs>

      {/* Modal chi tiết buổi điều trị */}
      <Modal
        title="Chi tiết buổi điều trị"
        open={detailModal}
        onCancel={() => setDetailModal(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModal(false)}>
            Đóng
          </Button>,
        ]}
        width={600}
      >
        {selectedSession && (
          <div>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <div>
                <Title level={4}>
                  {selectedSession.type}
                  <Tag
                    color={getSessionColor(
                      selectedSession.type,
                      selectedSession.status
                    )}
                    style={{ marginLeft: 8 }}
                  >
                    {getStatusText(selectedSession.status)}
                  </Tag>
                </Title>
              </div>

              <Divider />

              <Row gutter={16}>
                <Col span={12}>
                  <Text strong>Ngày giờ:</Text>
                  <br />
                  <Text>
                    {formatDateTime(selectedSession.date, selectedSession.time)}
                  </Text>
                </Col>
                <Col span={12}>
                  <Text strong>Thời gian:</Text>
                  <br />
                  <Text>{selectedSession.duration} phút</Text>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Text strong>Phòng:</Text>
                  <br />
                  <Text>{selectedSession.room}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Nhân viên:</Text>
                  <br />
                  <Text>{selectedSession.staff}</Text>
                </Col>
              </Row>

              {selectedSession.medications &&
                selectedSession.medications.length > 0 && (
                  <div>
                    <Text strong>Thuốc cần chuẩn bị:</Text>
                    <br />
                    <Space wrap>
                      {selectedSession.medications.map((med, index) => (
                        <Tag key={index} color="blue">
                          {med}
                        </Tag>
                      ))}
                    </Space>
                  </div>
                )}

              {selectedSession.tests && selectedSession.tests.length > 0 && (
                <div>
                  <Text strong>Xét nghiệm cần làm:</Text>
                  <br />
                  <Space wrap>
                    {selectedSession.tests.map((test, index) => (
                      <Tag key={index} color="red">
                        {test}
                      </Tag>
                    ))}
                  </Space>
                </div>
              )}

              {selectedSession.notes && (
                <div>
                  <Text strong>Ghi chú:</Text>
                  <br />
                  <Paragraph>{selectedSession.notes}</Paragraph>
                </div>
              )}

              <div>
                <Text strong>Thời gian còn lại:</Text>
                <br />
                <Text type="secondary">
                  {getTimeRemaining(selectedSession.date, selectedSession.time)}
                </Text>
              </div>
            </Space>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PatientScheduleView;
