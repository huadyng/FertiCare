import React, { useState, useEffect } from "react";
import {
  Card,
  Calendar,
  List,
  Tag,
  Button,
  Modal,
  Space,
  Typography,
  Row,
  Col,
  message,
  Tooltip,
  Alert,
} from "antd";
import {
  ClockCircleOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  ReloadOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import "./DoctorTheme.css";
import apiDoctorWorkSchedule from "../../api/apiDoctorWorkSchedule";

const { Title, Text } = Typography;

const DoctorSchedule = () => {
  const [scheduleData, setScheduleData] = useState([]);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load work schedule data from API
  const loadWorkScheduleData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("🔄 [DoctorSchedule] Loading work schedule data...");
      
      // Lấy lịch làm việc của tháng hiện tại
      const currentYear = dayjs().year();
      const currentMonth = dayjs().month() + 1;
      
              const response = await apiDoctorWorkSchedule.getWorkScheduleByMonth(currentYear, currentMonth);
        // Data đã được transform trong helper function, không cần transform thêm
        const transformedData = response;
      
      setScheduleData(transformedData);
      
      // Load today's schedule
      try {
        const todayData = await apiDoctorWorkSchedule.getTodayWorkSchedule();
        setTodaySchedule(todayData);
      } catch (error) {
        console.error("❌ [DoctorSchedule] Error loading today's schedule:", error);
        // TODO: Handle empty today schedule
        setTodaySchedule([]);
      }
      
      console.log("✅ [DoctorSchedule] Work schedule data loaded:", transformedData);
    } catch (error) {
      console.error("❌ [DoctorSchedule] Error loading work schedule data:", error);
      setError("Không thể tải lịch làm việc. Vui lòng thử lại sau.");
      
      // TODO: Handle empty schedule data
      setScheduleData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkScheduleData();
  }, []);

  const getScheduleForDate = (date) => {
    const dateStr = date.format("YYYY-MM-DD");
    return scheduleData.filter((item) => item.date === dateStr);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "green";
      case "inactive":
        return "red";
      case "pending":
        return "orange";
      default:
        return "default";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "work":
        return <MedicineBoxOutlined />;
      case "meeting":
        return <TeamOutlined />;
      case "break":
        return <ClockCircleOutlined />;
      case "training":
        return <FileTextOutlined />;
      default:
        return <CalendarOutlined />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "work":
        return "blue";
      case "meeting":
        return "purple";
      case "break":
        return "orange";
      case "training":
        return "green";
      default:
        return "default";
    }
  };

  const dateCellRender = (value) => {
    const scheduleForDate = getScheduleForDate(value);
    return (
      <div style={{ height: "100%", padding: "4px" }}>
        {scheduleForDate.map((schedule) => (
          <div
            key={schedule.id}
            className={`schedule-item ${schedule.type}`}
          >
            <div style={{ width: "100%", textAlign: "center" }}>
              <div style={{ fontSize: "10px", fontWeight: 500 }}>
                {dayjs(schedule.time, 'HH:mm:ss').format('HH:mm')} - {dayjs(schedule.endTime, 'HH:mm:ss').format('HH:mm')}
              </div>
              {schedule.location && (
                <div style={{ fontSize: "10px", color: "#888", marginTop: "1px" }}>
                  {schedule.location}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const handleScheduleClick = (schedule) => {
    // Chỉ hiển thị thông tin chi tiết, không cho phép chỉnh sửa
    Modal.info({
      title: `Lịch làm việc - ${dayjs(schedule.time, 'HH:mm:ss').format('HH:mm')} - ${dayjs(schedule.endTime, 'HH:mm:ss').format('HH:mm')}`,
      content: (
        <div>
          <p><strong>Ngày:</strong> {dayjs(schedule.date).format('DD/MM/YYYY')}</p>
          <p><strong>Thời gian & phòng:</strong> {dayjs(schedule.time, 'HH:mm:ss').format('HH:mm')} - {dayjs(schedule.endTime, 'HH:mm:ss').format('HH:mm')}{schedule.location ? `, ${schedule.location}` : ''}</p>
        </div>
      ),
      width: 500,
    });
  };

  const getTodaySchedule = () => {
    return todaySchedule;
  };

  return (
    <div className="doctor-schedule">
      {/* Error State */}
      {error && (
        <Alert
          message="Thông báo"
          description={error}
          type="warning"
          showIcon
          style={{ marginBottom: "24px" }}
          action={
            <Button size="small" onClick={loadWorkScheduleData}>
              Thử lại
            </Button>
          }
        />
      )}

      <Row gutter={[24, 24]}>
        {/* Calendar Section */}
        <Col xs={24} lg={16}>
          <Card
            className="doctor-card doctor-fade-in"
            title={
              <Space>
                <CalendarOutlined style={{ color: "var(--primary-color)" }} />
                <Text strong style={{ color: "var(--primary-color)" }}>
                  📅 Lịch làm việc tháng
                </Text>
              </Space>
            }
            extra={
              <Button
                icon={<ReloadOutlined />}
                onClick={loadWorkScheduleData}
                loading={loading}
              >
                Làm mới
              </Button>
            }
          >
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div
                  className="loading-spinner"
                  style={{
                    width: "40px",
                    height: "40px",
                    border: "4px solid #f3f3f3",
                    borderTop: "4px solid var(--primary-color)",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                    margin: "0 auto 16px",
                  }}
                ></div>
                <Text type="secondary">Đang tải lịch làm việc...</Text>
              </div>
            ) : (
              <Calendar
                cellRender={dateCellRender}
                onSelect={(date) => setSelectedDate(date)}
                className="doctor-calendar"
              />
            )}
          </Card>
        </Col>

        {/* Today's Schedule */}
        <Col xs={24} lg={8}>
          <Card
            className="doctor-card doctor-fade-in"
            title={
              <Space>
                <ClockCircleOutlined style={{ color: "var(--secondary-color)" }} />
                <Text strong style={{ color: "var(--secondary-color)" }}>
                  🕒 Lịch hôm nay
                </Text>
              </Space>
            }
          >
            <div className="today-schedule">
              <List
                dataSource={getTodaySchedule()}
                renderItem={(schedule) => (
                  <List.Item
                    actions={[
                      <Tooltip title="Xem chi tiết">
                        <Button
                          size="small"
                          icon={<FileTextOutlined />}
                          onClick={() => handleScheduleClick(schedule)}
                        />
                      </Tooltip>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <div
                          style={{
                            background: `var(--${getTypeColor(schedule.type)}-gradient)`,
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {getTypeIcon(schedule.type)}
                        </div>
                      }
                      title={
                        <div>
                          <Text strong style={{ fontSize: "14px" }}>
                            {dayjs(schedule.time, 'HH:mm:ss').format('HH:mm')} - {dayjs(schedule.endTime, 'HH:mm:ss').format('HH:mm')}
                          </Text>
                          <br />
                                                  <Text style={{ color: "var(--primary-color)", fontWeight: 600 }}>
                          {schedule.title}
                        </Text>
                        </div>
                      }
                      description={
                        <div>
                                                  <Tag color={getStatusColor(schedule.status)}>
                          {schedule.status === "active" && "Đang hoạt động"}
                          {schedule.status === "inactive" && "Không hoạt động"}
                          {schedule.status === "pending" && "Chờ xác nhận"}
                        </Tag>
                        {schedule.workShift && (
                          <Tag color={getTypeColor(schedule.type)}>
                            {schedule.workShift === "sang" && "Sáng (07:00-11:00)"}
                            {schedule.workShift === "chieu" && "Chiều (13:00-17:00)"}
                            {schedule.workShift === "dem" && "Đêm"}
                            {schedule.workShift === "full" && "Toàn ngày"}
                          </Tag>
                        )}
                        {schedule.location && (
                          <Tag color="cyan">
                            📍 {schedule.location}
                          </Tag>
                        )}
                          {schedule.notes && (
                            <Text type="secondary" style={{ fontSize: "12px", display: "block", marginTop: "4px" }}>
                              {schedule.notes}
                            </Text>
                          )}
                        </div>
                      }
                    />
                  </List.Item>
                )}
                locale={{
                  emptyText: (
                    <div style={{ textAlign: "center", padding: "20px" }}>
                      <ClockCircleOutlined style={{ fontSize: "32px", color: "var(--text-muted)" }} />
                      <div style={{ marginTop: "8px" }}>
                        <Text type="secondary">Không có lịch hẹn hôm nay</Text>
                      </div>
                    </div>
                  ),
                }}
              />
            </div>
          </Card>
        </Col>
      </Row>


    </div>
  );
};

export default DoctorSchedule; 