import React, { useState, useEffect, useContext } from "react";
import {
  Card,
  Calendar,
  Button,
  Row,
  Col,
  Typography,
  Space,
  Badge,
  Tag,
  List,
  Avatar,
  Descriptions,
  Alert,
  message,
  Statistic,
  Tooltip,
  Spin,
  Empty,
  Modal,
  Form,
  Select,
  DatePicker,
  Input,
  TimePicker,
  Divider,
} from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  BellOutlined,
  MedicineBoxOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { UserContext } from "../../../context/UserContext";
import axiosClient from "../../../services/axiosClient";
import "./PatientPages.css";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const Schedule = () => {
  const { user } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (user?.id) {
      loadAppointments();
    }
  }, [user]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(
        "🏥 [PatientSchedule] Loading appointments for patient:",
        user.id
      );

      const response = await axiosClient.get(
        `/api/appointments/customer/${user.id}`
      );
      const appointmentsData = response.data || [];

      setAppointments(appointmentsData);

      console.log(
        "✅ [PatientSchedule] Appointments loaded:",
        appointmentsData.length
      );
    } catch (error) {
      console.error("❌ [PatientSchedule] Error loading appointments:", error);
      setError("Không thể tải lịch khám. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadAppointments();
    setRefreshing(false);
    message.success("Đã cập nhật lịch khám");
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "Chưa có thông tin";
    try {
      return dayjs(dateTimeString).format("DD/MM/YYYY HH:mm");
    } catch (error) {
      return "Thời gian không hợp lệ";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa có thông tin";
    try {
      return dayjs(dateString).format("DD/MM/YYYY");
    } catch (error) {
      return "Ngày không hợp lệ";
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return "Chưa có thông tin";
    try {
      return dayjs(timeString).format("HH:mm");
    } catch (error) {
      return "Giờ không hợp lệ";
    }
  };

  const getAppointmentStatus = (appointment) => {
    const now = dayjs();
    const appointmentTime = dayjs(appointment.appointmentTime);

    if (appointment.checkInStatus === "Completed") {
      return { status: "completed", text: "Đã hoàn thành", color: "green" };
    }

    if (appointment.checkInStatus === "Cancelled") {
      return { status: "cancelled", text: "Đã hủy", color: "red" };
    }

    if (appointmentTime.isBefore(now)) {
      return { status: "missed", text: "Đã bỏ lỡ", color: "red" };
    }

    if (appointment.checkInStatus === "CheckedIn") {
      return { status: "checked-in", text: "Đã check-in", color: "blue" };
    }

    return { status: "upcoming", text: "Sắp tới", color: "orange" };
  };

  const getAppointmentsForDate = (date) => {
    return appointments.filter((appointment) => {
      const appointmentDate = dayjs(appointment.appointmentTime);
      return appointmentDate.isSame(date, "day");
    });
  };

  const dateCellRender = (date) => {
    const dayAppointments = getAppointmentsForDate(date);

    if (dayAppointments.length === 0) return null;

    return (
      <div className="calendar-appointments">
        {dayAppointments.slice(0, 2).map((appointment, index) => {
          const status = getAppointmentStatus(appointment);
          return (
            <div key={index} className="calendar-appointment-item">
              <Badge
                color={status.color}
                text={formatTime(appointment.appointmentTime)}
              />
            </div>
          );
        })}
        {dayAppointments.length > 2 && (
          <div className="calendar-appointment-more">
            <Badge count={`+${dayAppointments.length - 2}`} />
          </div>
        )}
      </div>
    );
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      await axiosClient.post(`/api/appointments/${appointmentId}/cancel`);
      message.success("Đã hủy lịch hẹn thành công");
      loadAppointments();
    } catch (error) {
      message.error(
        "Không thể hủy lịch hẹn: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const upcomingAppointments = appointments
    .filter((appointment) => {
      const appointmentTime = dayjs(appointment.appointmentTime);
      const status = getAppointmentStatus(appointment);
      return appointmentTime.isAfter(dayjs()) && status.status === "upcoming";
    })
    .sort((a, b) => dayjs(a.appointmentTime).diff(dayjs(b.appointmentTime)))
    .slice(0, 5);

  const recentAppointments = appointments
    .filter((appointment) => {
      const appointmentTime = dayjs(appointment.appointmentTime);
      return appointmentTime.isBefore(dayjs());
    })
    .sort((a, b) => dayjs(b.appointmentTime).diff(dayjs(a.appointmentTime)))
    .slice(0, 5);

  if (loading) {
    return (
      <div className="patient-page-loading">
        <Spin size="large" />
        <Text>Đang tải lịch khám...</Text>
      </div>
    );
  }

  if (error) {
    return (
      <div className="patient-page-error">
        <Alert
          message="Lỗi tải dữ liệu"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" danger onClick={loadAppointments}>
              Thử lại
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="patient-schedule">
      {/* Header */}
      <div className="page-header">
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0 }}>
              <CalendarOutlined style={{ marginRight: 8, color: "white" }} />
              Lịch khám
            </Title>
            <Text
              type="secondary"
              style={{ color: "rgba(255, 255, 255, 0.8)" }}
            >
              Quản lý lịch hẹn và lịch trình khám bệnh
            </Text>
          </Col>
          <Col>
            <Button
              type="primary"
              ghost
              icon={<ReloadOutlined />}
              onClick={refreshData}
              loading={refreshing}
            >
              Làm mới
            </Button>
          </Col>
        </Row>
      </div>

      {/* Statistics */}
      <Row gutter={[24, 24]} className="mt-24">
        <Col xs={24} md={6}>
          <Card>
            <Statistic
              title="Tổng lịch hẹn"
              value={appointments.length}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic
              title="Sắp tới"
              value={upcomingAppointments.length}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic
              title="Đã hoàn thành"
              value={
                appointments.filter(
                  (a) => getAppointmentStatus(a).status === "completed"
                ).length
              }
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic
              title="Đã hủy"
              value={
                appointments.filter(
                  (a) => getAppointmentStatus(a).status === "cancelled"
                ).length
              }
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Row gutter={[24, 24]} className="mt-24">
        {/* Calendar */}
        <Col xs={24} lg={16}>
          <Card
            title="Lịch khám theo tháng"
            className="calendar-card"
            extra={
              <Badge count={appointments.length} showZero>
                <CalendarOutlined />
              </Badge>
            }
          >
            <Calendar
              dateCellRender={dateCellRender}
              onSelect={handleDateSelect}
              value={selectedDate}
            />
          </Card>
        </Col>

        {/* Sidebar */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            {/* Selected Date Appointments */}
            <Card
              title={`Lịch khám ngày ${selectedDate.format("DD/MM/YYYY")}`}
              className="date-appointments-card"
            >
              {(() => {
                const dayAppointments = getAppointmentsForDate(selectedDate);
                if (dayAppointments.length === 0) {
                  return (
                    <Empty
                      description="Không có lịch khám nào"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  );
                }

                return (
                  <List
                    dataSource={dayAppointments}
                    renderItem={(appointment) => {
                      const status = getAppointmentStatus(appointment);
                      return (
                        <List.Item
                          actions={[
                            status.status === "upcoming" && (
                              <Button
                                size="small"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() =>
                                  handleCancelAppointment(
                                    appointment.appointmentId
                                  )
                                }
                              >
                                Hủy
                              </Button>
                            ),
                          ].filter(Boolean)}
                        >
                          <List.Item.Meta
                            avatar={<Avatar icon={<UserOutlined />} />}
                            title={
                              <Space>
                                <Text strong>
                                  {formatTime(appointment.appointmentTime)}
                                </Text>
                                <Tag color={status.color}>{status.text}</Tag>
                              </Space>
                            }
                            description={
                              <div>
                                <Text>
                                  Phòng: {appointment.room || "Chưa phân công"}
                                </Text>
                                <br />
                                <Text type="secondary">
                                  {appointment.serviceName || "Khám tổng quát"}
                                </Text>
                              </div>
                            }
                          />
                        </List.Item>
                      );
                    }}
                  />
                );
              })()}
            </Card>

            {/* Upcoming Appointments */}
            <Card
              title="Lịch khám sắp tới"
              className="upcoming-card"
              extra={
                <Badge count={upcomingAppointments.length} showZero>
                  <ClockCircleOutlined />
                </Badge>
              }
            >
              {upcomingAppointments.length > 0 ? (
                <List
                  dataSource={upcomingAppointments}
                  renderItem={(appointment) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={<CalendarOutlined />} />}
                        title={
                          <Space>
                            <Text strong>
                              {formatDateTime(appointment.appointmentTime)}
                            </Text>
                            <Tag color="orange">Sắp tới</Tag>
                          </Space>
                        }
                        description={
                          <div>
                            <Text>
                              Phòng: {appointment.room || "Chưa phân công"}
                            </Text>
                            <br />
                            <Text type="secondary">
                              {appointment.serviceName || "Khám tổng quát"}
                            </Text>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty
                  description="Không có lịch khám sắp tới"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </Card>

            {/* Recent Appointments */}
            <Card
              title="Lịch khám gần đây"
              className="recent-card"
              extra={
                <Badge count={recentAppointments.length} showZero>
                  <HistoryOutlined />
                </Badge>
              }
            >
              {recentAppointments.length > 0 ? (
                <List
                  dataSource={recentAppointments}
                  renderItem={(appointment) => {
                    const status = getAppointmentStatus(appointment);
                    return (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar icon={<FileTextOutlined />} />}
                          title={
                            <Space>
                              <Text strong>
                                {formatDateTime(appointment.appointmentTime)}
                              </Text>
                              <Tag color={status.color}>{status.text}</Tag>
                            </Space>
                          }
                          description={
                            <div>
                              <Text>
                                Phòng: {appointment.room || "Chưa phân công"}
                              </Text>
                              <br />
                              <Text type="secondary">
                                {appointment.serviceName || "Khám tổng quát"}
                              </Text>
                            </div>
                          }
                        />
                      </List.Item>
                    );
                  }}
                />
              ) : (
                <Empty
                  description="Chưa có lịch khám nào"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </Card>
          </Space>
        </Col>
      </Row>

      {/* All Appointments List */}
      <Row gutter={[24, 24]} className="mt-24">
        <Col span={24}>
          <Card
            title="Tất cả lịch khám"
            className="all-appointments-card"
            extra={
              <Badge count={appointments.length} showZero>
                <MedicineBoxOutlined />
              </Badge>
            }
          >
            {appointments.length > 0 ? (
              <List
                dataSource={appointments.sort((a, b) =>
                  dayjs(b.appointmentTime).diff(dayjs(a.appointmentTime))
                )}
                renderItem={(appointment) => {
                  const status = getAppointmentStatus(appointment);
                  return (
                    <List.Item
                      actions={[
                        status.status === "upcoming" && (
                          <Button
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() =>
                              handleCancelAppointment(appointment.appointmentId)
                            }
                          >
                            Hủy
                          </Button>
                        ),
                      ].filter(Boolean)}
                    >
                      <List.Item.Meta
                        avatar={<Avatar icon={<UserOutlined />} />}
                        title={
                          <Space>
                            <Text strong>
                              {formatDateTime(appointment.appointmentTime)}
                            </Text>
                            <Tag color={status.color}>{status.text}</Tag>
                          </Space>
                        }
                        description={
                          <div>
                            <Text>
                              Phòng: {appointment.room || "Chưa phân công"}
                            </Text>
                            <br />
                            <Text type="secondary">
                              {appointment.serviceName || "Khám tổng quát"}
                            </Text>
                            {appointment.note && (
                              <>
                                <br />
                                <Text type="secondary">
                                  Ghi chú: {appointment.note}
                                </Text>
                              </>
                            )}
                          </div>
                        }
                      />
                    </List.Item>
                  );
                }}
              />
            ) : (
              <Empty
                description="Chưa có lịch khám nào"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Schedule;
