import React, { useState, useContext } from "react";
import {
  Card,
  Row,
  Col,
  Avatar,
  Typography,
  Space,
  Tag,
  Button,
  Statistic,
  List,
  Progress,
  Calendar,
  Badge,
  Tabs,
  Alert,
  Divider,
} from "antd";
import {
  UserOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  StarOutlined,
  TrophyOutlined,
  EditOutlined,
} from "@ant-design/icons";

import { UserContext } from "../../context/UserContext";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const DoctorProfile = () => {
  const { user } = useContext(UserContext);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Mock doctor data
  const doctorInfo = {
    id: user?.id || "doctor1",
    name: user?.fullName || "BS. Lê Văn Doctor",
    email: user?.email || "doctor@ferticare.com",
    specialization: "Hỗ trợ sinh sản",
    department: "Khoa Sản phụ",
    experience: 8,
    rating: 4.8,
    totalPatients: 245,
    successfulTreatments: 189,
    workingHours: "8:00 - 17:00",
    phone: "0909-123-456",
    bio: "Bác sĩ chuyên khoa về hỗ trợ sinh sản với 8 năm kinh nghiệm. Chuyên về IVF, IUI và các phương pháp điều trị hiếm muộn hiện đại.",
  };

  const achievements = [
    { title: "Tỷ lệ thành công IVF", value: "77%", icon: <TrophyOutlined /> },
    { title: "Số ca điều trị", value: 245, icon: <MedicineBoxOutlined /> },
    { title: "Bệnh nhân hài lòng", value: "95%", icon: <StarOutlined /> },
    { title: "Năm kinh nghiệm", value: 8, icon: <TeamOutlined /> },
  ];

  const recentActivities = [
    {
      date: "2024-01-15",
      type: "Khám bệnh",
      patient: "Nguyễn Thị Mai",
      status: "completed",
      time: "09:00",
    },
    {
      date: "2024-01-15",
      type: "Lập phác đồ IVF",
      patient: "Trần Văn Nam",
      status: "completed",
      time: "10:30",
    },
    {
      date: "2024-01-15",
      type: "Theo dõi điều trị",
      patient: "Lê Thị Hoa",
      status: "in-progress",
      time: "14:00",
    },
    {
      date: "2024-01-16",
      type: "Tư vấn điều trị",
      patient: "Phạm Thị Lan",
      status: "scheduled",
      time: "09:00",
    },
  ];

  const upcomingAppointments = [
    { time: "09:00", patient: "Nguyễn Thị A", type: "Khám định kỳ" },
    { time: "10:30", patient: "Trần Văn B", type: "Tư vấn IVF" },
    { time: "14:00", patient: "Lê Thị C", type: "Theo dõi kết quả" },
    { time: "15:30", patient: "Phạm Thị D", type: "Khám lần đầu" },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "green";
      case "in-progress":
        return "blue";
      case "scheduled":
        return "orange";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "completed":
        return "Hoàn thành";
      case "in-progress":
        return "Đang thực hiện";
      case "scheduled":
        return "Đã lên lịch";
      default:
        return "Không xác định";
    }
  };

  return (
    <div style={{ padding: "24px", background: "#f5f5f5", minHeight: "100vh" }}>
      <Row gutter={[24, 24]}>
        {/* Doctor Info Card */}
        <Col span={24}>
          <Card>
            <Row gutter={24}>
              <Col span={6}>
                <div style={{ textAlign: "center" }}>
                  <Avatar
                    size={120}
                    icon={<UserOutlined />}
                    style={{ marginBottom: 16 }}
                  />
                  <div>
                    <Title level={4} style={{ margin: "8px 0 4px" }}>
                      {doctorInfo.name}
                    </Title>
                    <Text type="secondary">{doctorInfo.specialization}</Text>
                    <br />
                    <Text type="secondary">{doctorInfo.department}</Text>
                    <div style={{ marginTop: 16 }}>
                      <Space>
                        <Button type="primary" icon={<EditOutlined />}>
                          Chỉnh sửa thông tin
                        </Button>
                      </Space>
                    </div>
                  </div>
                </div>
              </Col>
              <Col span={18}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Space
                      direction="vertical"
                      size="middle"
                      style={{ width: "100%" }}
                    >
                      <div>
                        <Text strong>Email:</Text>
                        <br />
                        <Text>{doctorInfo.email}</Text>
                      </div>
                      <div>
                        <Text strong>Số điện thoại:</Text>
                        <br />
                        <Text>{doctorInfo.phone}</Text>
                      </div>
                      <div>
                        <Text strong>Giờ làm việc:</Text>
                        <br />
                        <Text>{doctorInfo.workingHours}</Text>
                      </div>
                    </Space>
                  </Col>
                  <Col span={12}>
                    <div>
                      <Text strong>Giới thiệu:</Text>
                      <Paragraph style={{ marginTop: 8 }}>
                        {doctorInfo.bio}
                      </Paragraph>
                    </div>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Achievements */}
        <Col span={24}>
          <Row gutter={16}>
            {achievements.map((achievement, index) => (
              <Col span={6} key={index}>
                <Card>
                  <Statistic
                    title={achievement.title}
                    value={achievement.value}
                    prefix={achievement.icon}
                    valueStyle={{
                      color:
                        index === 0
                          ? "#52c41a"
                          : index === 1
                          ? "#1890ff"
                          : index === 2
                          ? "#faad14"
                          : "#722ed1",
                    }}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </Col>

        {/* Main Content */}
        <Col span={24}>
          <Tabs defaultActiveKey="dashboard">
            <TabPane tab="Tổng quan" key="dashboard">
              <Row gutter={[24, 24]}>
                <Col span={12}>
                  <Card
                    title="Lịch hẹn hôm nay"
                    extra={<Badge count={upcomingAppointments.length} />}
                  >
                    <List
                      dataSource={upcomingAppointments}
                      renderItem={(item) => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={<Avatar icon={<ClockCircleOutlined />} />}
                            title={`${item.time} - ${item.patient}`}
                            description={item.type}
                          />
                          <Button size="small">Chi tiết</Button>
                        </List.Item>
                      )}
                    />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="Hoạt động gần đây">
                    <List
                      dataSource={recentActivities.slice(0, 4)}
                      renderItem={(activity) => (
                        <List.Item>
                          <List.Item.Meta
                            title={`${activity.type} - ${activity.patient}`}
                            description={
                              <Space>
                                <Text type="secondary">
                                  {activity.date} {activity.time}
                                </Text>
                                <Tag color={getStatusColor(activity.status)}>
                                  {getStatusText(activity.status)}
                                </Tag>
                              </Space>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  </Card>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab="Lịch làm việc" key="schedule">
              <Row gutter={[24, 24]}>
                <Col span={16}>
                  <Card title="Lịch tháng">
                    <Calendar
                      onSelect={(date) => setSelectedDate(date)}
                      dateCellRender={(value) => {
                        const dayActivities = recentActivities.filter(
                          (activity) =>
                            activity.date === value.format("YYYY-MM-DD")
                        );
                        return (
                          <div>
                            {dayActivities.map((activity, index) => (
                              <div
                                key={index}
                                style={{ fontSize: 10, padding: 2 }}
                              >
                                <Badge
                                  status={
                                    activity.status === "completed"
                                      ? "success"
                                      : activity.status === "in-progress"
                                      ? "processing"
                                      : "warning"
                                  }
                                  text={activity.time}
                                />
                              </div>
                            ))}
                          </div>
                        );
                      }}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card title="Thống kê theo tháng">
                    <Space
                      direction="vertical"
                      size="large"
                      style={{ width: "100%" }}
                    >
                      <Statistic title="Tổng ca khám" value={28} />
                      <Statistic title="Ca điều trị" value={15} />
                      <Statistic title="Tư vấn" value={12} />
                      <Progress percent={85} text="Hoàn thành mục tiêu" />
                    </Space>
                  </Card>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab="Bệnh nhân" key="patients">
              <Alert
                message="Quản lý bệnh nhân"
                description="Chức năng quản lý bệnh nhân đã được tích hợp vào Dashboard chính. Bạn có thể truy cập từ menu sidebar."
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
                action={
                  <Button size="small" type="primary">
                    Đi tới Dashboard
                  </Button>
                }
              />
            </TabPane>

            <TabPane tab="Báo cáo" key="reports">
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="Tỷ lệ thành công"
                      value={77}
                      suffix="%"
                      valueStyle={{ color: "#3f8600" }}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="Tổng ca điều trị"
                      value={245}
                      valueStyle={{ color: "#1890ff" }}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="Đánh giá trung bình"
                      value={4.8}
                      suffix="/ 5.0"
                      valueStyle={{ color: "#722ed1" }}
                    />
                  </Card>
                </Col>
              </Row>
            </TabPane>
          </Tabs>
        </Col>
      </Row>
    </div>
  );
};

export default DoctorProfile;
