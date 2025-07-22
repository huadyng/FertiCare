import React, { useState, useEffect, useContext } from "react";
import {
  Card,
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
  Timeline,
  Divider,
  Switch,
  Select,
} from "antd";
import {
  UserOutlined,
  BellOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  ReloadOutlined,
  MedicineBoxOutlined,
  HeartOutlined,
  HistoryOutlined,
  SettingOutlined,
  DeleteOutlined,
  MailOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { UserContext } from "../../../context/UserContext";
import "./PatientPages.css";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const Notifications = () => {
  const { user } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [showRead, setShowRead] = useState(true);

  // Mock notifications data (sẽ thay bằng API thật sau)
  const mockNotifications = [
    {
      id: 1,
      type: "appointment",
      title: "Lịch khám sắp tới",
      message:
        "Bạn có lịch khám vào ngày 15/01/2024 lúc 9:00. Vui lòng đến đúng giờ và mang theo các giấy tờ cần thiết.",
      timestamp: "2024-01-10T10:30:00",
      isRead: false,
      priority: "high",
      icon: <CalendarOutlined />,
      color: "blue",
    },
    {
      id: 2,
      type: "treatment",
      title: "Cập nhật tiến trình điều trị",
      message:
        "Giai đoạn 'Kích thích buồng trứng' đã hoàn thành. Bác sĩ sẽ liên hệ để lên lịch cho giai đoạn tiếp theo.",
      timestamp: "2024-01-09T14:20:00",
      isRead: true,
      priority: "medium",
      icon: <MedicineBoxOutlined />,
      color: "green",
    },
    {
      id: 3,
      type: "result",
      title: "Kết quả xét nghiệm có sẵn",
      message:
        "Kết quả xét nghiệm hormone của bạn đã có. Vui lòng đăng nhập để xem chi tiết.",
      timestamp: "2024-01-08T16:45:00",
      isRead: false,
      priority: "high",
      icon: <FileTextOutlined />,
      color: "orange",
    },
    {
      id: 4,
      type: "reminder",
      title: "Nhắc nhở uống thuốc",
      message:
        "Đừng quên uống thuốc Gonal-F vào tối nay lúc 20:00 theo đúng liều lượng đã được chỉ định.",
      timestamp: "2024-01-08T18:00:00",
      isRead: true,
      priority: "medium",
      icon: <HeartOutlined />,
      color: "red",
    },
    {
      id: 5,
      type: "system",
      title: "Cập nhật hệ thống",
      message:
        "Hệ thống đã được cập nhật với các tính năng mới. Bạn có thể xem hướng dẫn sử dụng trong phần trợ giúp.",
      timestamp: "2024-01-07T09:15:00",
      isRead: true,
      priority: "low",
      icon: <SettingOutlined />,
      color: "purple",
    },
  ];

  useEffect(() => {
    if (user?.id) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(
        "🏥 [PatientNotifications] Loading notifications for patient:",
        user.id
      );

      // TODO: Thay thế bằng API thật khi có
      // const response = await axiosClient.get(`/api/notifications/patient/${user.id}`);
      // setNotifications(response.data || []);

      // Sử dụng mock data tạm thời
      setTimeout(() => {
        setNotifications(mockNotifications);
        setLoading(false);
      }, 1000);

      console.log(
        "✅ [PatientNotifications] Notifications loaded:",
        mockNotifications.length
      );
    } catch (error) {
      console.error(
        "❌ [PatientNotifications] Error loading notifications:",
        error
      );
      setError("Không thể tải thông báo. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
    message.success("Đã cập nhật thông báo");
  };

  const markAsRead = async (notificationId) => {
    try {
      // TODO: Gọi API để đánh dấu đã đọc
      // await axiosClient.put(`/api/notifications/${notificationId}/read`);

      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );

      message.success("Đã đánh dấu đã đọc");
    } catch (error) {
      message.error("Không thể cập nhật trạng thái");
    }
  };

  const markAllAsRead = async () => {
    try {
      // TODO: Gọi API để đánh dấu tất cả đã đọc
      // await axiosClient.put(`/api/notifications/patient/${user.id}/read-all`);

      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      );

      message.success("Đã đánh dấu tất cả đã đọc");
    } catch (error) {
      message.error("Không thể cập nhật trạng thái");
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      // TODO: Gọi API để xóa thông báo
      // await axiosClient.delete(`/api/notifications/${notificationId}`);

      setNotifications((prev) =>
        prev.filter((notif) => notif.id !== notificationId)
      );

      message.success("Đã xóa thông báo");
    } catch (error) {
      message.error("Không thể xóa thông báo");
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "Chưa có thông tin";
    try {
      return dayjs(dateTimeString).format("DD/MM/YYYY HH:mm");
    } catch (error) {
      return "Thời gian không hợp lệ";
    }
  };

  const formatRelativeTime = (dateTimeString) => {
    if (!dateTimeString) return "Chưa có thông tin";
    try {
      const now = dayjs();
      const notificationTime = dayjs(dateTimeString);
      const diffMinutes = now.diff(notificationTime, "minute");

      if (diffMinutes < 1) return "Vừa xong";
      if (diffMinutes < 60) return `${diffMinutes} phút trước`;

      const diffHours = now.diff(notificationTime, "hour");
      if (diffHours < 24) return `${diffHours} giờ trước`;

      const diffDays = now.diff(notificationTime, "day");
      if (diffDays < 7) return `${diffDays} ngày trước`;

      return formatDateTime(dateTimeString);
    } catch (error) {
      return "Thời gian không hợp lệ";
    }
  };

  const viewNotificationDetail = (notification) => {
    setSelectedNotification(notification);
    setModalVisible(true);

    // Đánh dấu đã đọc khi xem chi tiết
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "red";
      case "medium":
        return "orange";
      case "low":
        return "blue";
      default:
        return "default";
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case "high":
        return "Cao";
      case "medium":
        return "Trung bình";
      case "low":
        return "Thấp";
      default:
        return "Không xác định";
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case "appointment":
        return "Lịch khám";
      case "treatment":
        return "Điều trị";
      case "result":
        return "Kết quả";
      case "reminder":
        return "Nhắc nhở";
      case "system":
        return "Hệ thống";
      default:
        return "Khác";
    }
  };

  const filterNotifications = () => {
    let filtered = notifications;

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter((notif) => notif.type === filterType);
    }

    // Filter by read status
    if (!showRead) {
      filtered = filtered.filter((notif) => !notif.isRead);
    }

    // Sort by timestamp (newest first)
    return filtered.sort((a, b) => dayjs(b.timestamp).diff(dayjs(a.timestamp)));
  };

  const filteredNotifications = filterNotifications();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading) {
    return (
      <div className="patient-page-loading">
        <Spin size="large" />
        <Text>Đang tải thông báo...</Text>
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
            <Button size="small" danger onClick={loadNotifications}>
              Thử lại
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="patient-notifications">
      {/* Header */}
      <div className="page-header">
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2}>Thông báo</Title>
            <Text type="secondary">
              Quản lý thông báo và cập nhật từ hệ thống
            </Text>
          </Col>
          <Col>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={refreshData}
                loading={refreshing}
              >
                Làm mới
              </Button>
              {unreadCount > 0 && (
                <Button type="primary" onClick={markAllAsRead}>
                  Đánh dấu tất cả đã đọc
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </div>

      {/* Statistics */}
      <Row gutter={[24, 24]} className="mt-24">
        <Col xs={24} md={6}>
          <Card>
            <Statistic
              title="Tổng thông báo"
              value={notifications.length}
              prefix={<BellOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic
              title="Chưa đọc"
              value={unreadCount}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic
              title="Đã đọc"
              value={notifications.length - unreadCount}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic
              title="Ưu tiên cao"
              value={notifications.filter((n) => n.priority === "high").length}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Row gutter={[24, 24]} className="mt-24">
        <Col span={24}>
          <Card title="Bộ lọc" size="small">
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} md={8}>
                <Text strong>Loại thông báo:</Text>
                <Select
                  value={filterType}
                  onChange={setFilterType}
                  style={{ width: "100%", marginTop: 8 }}
                >
                  <Option value="all">Tất cả</Option>
                  <Option value="appointment">Lịch khám</Option>
                  <Option value="treatment">Điều trị</Option>
                  <Option value="result">Kết quả</Option>
                  <Option value="reminder">Nhắc nhở</Option>
                  <Option value="system">Hệ thống</Option>
                </Select>
              </Col>
              <Col xs={24} md={8}>
                <Text strong>Trạng thái:</Text>
                <div style={{ marginTop: 8 }}>
                  <Switch
                    checked={showRead}
                    onChange={setShowRead}
                    checkedChildren="Hiện đã đọc"
                    unCheckedChildren="Chỉ chưa đọc"
                  />
                </div>
              </Col>
              <Col xs={24} md={8}>
                <Button
                  onClick={() => {
                    setFilterType("all");
                    setShowRead(true);
                  }}
                  style={{ marginTop: 24 }}
                >
                  Xóa bộ lọc
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Notifications List */}
      <Row gutter={[24, 24]} className="mt-24">
        <Col span={24}>
          <Card
            title="Danh sách thông báo"
            className="notifications-card"
            extra={
              <Badge count={unreadCount} showZero>
                <BellOutlined />
              </Badge>
            }
          >
            {filteredNotifications.length > 0 ? (
              <List
                dataSource={filteredNotifications}
                renderItem={(notification) => (
                  <List.Item
                    className={
                      notification.isRead
                        ? "notification-read"
                        : "notification-unread"
                    }
                    actions={[
                      !notification.isRead && (
                        <Button
                          size="small"
                          onClick={() => markAsRead(notification.id)}
                        >
                          Đánh dấu đã đọc
                        </Button>
                      ),
                      <Button
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => deleteNotification(notification.id)}
                      >
                        Xóa
                      </Button>,
                    ].filter(Boolean)}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          icon={notification.icon}
                          style={{ backgroundColor: notification.color }}
                        />
                      }
                      title={
                        <Space>
                          <Text strong>{notification.title}</Text>
                          {!notification.isRead && (
                            <Badge status="processing" />
                          )}
                          <Tag color={getPriorityColor(notification.priority)}>
                            {getPriorityText(notification.priority)}
                          </Tag>
                          <Tag color="blue">
                            {getTypeText(notification.type)}
                          </Tag>
                        </Space>
                      }
                      description={
                        <div>
                          <Text>{notification.message}</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: "12px" }}>
                            {formatRelativeTime(notification.timestamp)}
                          </Text>
                        </div>
                      }
                    />
                    <Button
                      type="primary"
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => viewNotificationDetail(notification)}
                    >
                      Xem chi tiết
                    </Button>
                  </List.Item>
                )}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} của ${total} thông báo`,
                }}
              />
            ) : (
              <Empty
                description="Không có thông báo nào"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Timeline View */}
      <Row gutter={[24, 24]} className="mt-24">
        <Col span={24}>
          <Card
            title="Thông báo theo thời gian"
            className="timeline-card"
            extra={
              <Badge count={filteredNotifications.length} showZero>
                <HistoryOutlined />
              </Badge>
            }
          >
            {filteredNotifications.length > 0 ? (
              <Timeline>
                {filteredNotifications.map((notification) => (
                  <Timeline.Item
                    key={notification.id}
                    dot={notification.icon}
                    color={notification.isRead ? "gray" : notification.color}
                  >
                    <div className="timeline-notification">
                      <div className="timeline-header">
                        <Space>
                          <Text strong>{notification.title}</Text>
                          {!notification.isRead && (
                            <Badge status="processing" />
                          )}
                          <Tag color={getPriorityColor(notification.priority)}>
                            {getPriorityText(notification.priority)}
                          </Tag>
                        </Space>
                      </div>
                      <div className="timeline-message">
                        <Text>{notification.message}</Text>
                      </div>
                      <div className="timeline-footer">
                        <Space>
                          <Text type="secondary" style={{ fontSize: "12px" }}>
                            {formatRelativeTime(notification.timestamp)}
                          </Text>
                          <Button
                            type="primary"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => viewNotificationDetail(notification)}
                          >
                            Xem chi tiết
                          </Button>
                        </Space>
                      </div>
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            ) : (
              <Empty
                description="Không có thông báo nào"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết thông báo"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={600}
      >
        {selectedNotification && (
          <div>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Tiêu đề">
                {selectedNotification.title}
              </Descriptions.Item>
              <Descriptions.Item label="Loại">
                <Tag color="blue">{getTypeText(selectedNotification.type)}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Mức độ ưu tiên">
                <Tag color={getPriorityColor(selectedNotification.priority)}>
                  {getPriorityText(selectedNotification.priority)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian">
                {formatDateTime(selectedNotification.timestamp)}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={selectedNotification.isRead ? "green" : "orange"}>
                  {selectedNotification.isRead ? "Đã đọc" : "Chưa đọc"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Nội dung">
                <Paragraph>{selectedNotification.message}</Paragraph>
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Notifications;
