import React from "react";
import {
  Card,
  Button,
  Typography,
  Space,
  Row,
  Col,
  Progress,
  Tag,
  Alert,
  Statistic,
  Avatar,
  Timeline,
  Steps,
  Badge,
  Table,
  Descriptions,
} from "antd";
import {
  UserOutlined,
  HeartOutlined,
  CalendarOutlined,
  MedicineBoxOutlined,
  CheckCircleOutlined,
  StarOutlined,
  TeamOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import "./DoctorTheme.css";

const { Title, Text } = Typography;

const ThemeDemo = () => {
  const statisticsData = [
    {
      title: "Tổng bệnh nhân",
      value: 245,
      icon: <TeamOutlined />,
      color: "var(--primary-color)",
    },
    {
      title: "Lịch hẹn hôm nay",
      value: 8,
      icon: <CalendarOutlined />,
      color: "var(--accent-color)",
    },
    {
      title: "Đang điều trị",
      value: 12,
      icon: <MedicineBoxOutlined />,
      color: "var(--primary-light)",
    },
    {
      title: "Tỷ lệ thành công",
      value: 87,
      suffix: "%",
      icon: <TrophyOutlined />,
      color: "var(--primary-dark)",
    },
  ];

  const timelineData = [
    {
      color: "var(--primary-color)",
      children: (
        <div>
          <Text strong>Khám lâm sàng hoàn thành</Text>
          <br />
          <Text type="secondary">09:30 - Bệnh nhân Nguyễn Thị Mai</Text>
        </div>
      ),
    },
    {
      color: "var(--accent-color)",
      children: (
        <div>
          <Text strong>Lập phác đồ IVF</Text>
          <br />
          <Text type="secondary">10:15 - Đã tùy chỉnh theo tình trạng</Text>
        </div>
      ),
    },
    {
      color: "var(--primary-light)",
      children: (
        <div>
          <Text strong>Lên lịch điều trị</Text>
          <br />
          <Text type="secondary">10:45 - 12 buổi trong 3 tuần</Text>
        </div>
      ),
    },
  ];

  const tableData = [
    {
      key: "1",
      patient: "Nguyễn Thị Mai",
      age: 32,
      service: "IVF",
      status: "Đang điều trị",
      progress: 60,
    },
    {
      key: "2",
      patient: "Trần Văn Nam",
      age: 35,
      service: "IUI",
      status: "Hoàn thành",
      progress: 100,
    },
    {
      key: "3",
      patient: "Lê Thị Hoa",
      age: 28,
      service: "IVF",
      status: "Tư vấn",
      progress: 25,
    },
  ];

  const tableColumns = [
    {
      title: "Bệnh nhân",
      dataIndex: "patient",
      key: "patient",
      render: (text) => (
        <Space>
          <Avatar icon={<UserOutlined />} className="doctor-avatar" />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: "Tuổi",
      dataIndex: "age",
      key: "age",
    },
    {
      title: "Dịch vụ",
      dataIndex: "service",
      key: "service",
      render: (service) => (
        <Tag
          className={
            service === "IVF" ? "doctor-tag-primary" : "doctor-tag-secondary"
          }
        >
          {service}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          className={
            status === "Hoàn thành"
              ? "doctor-tag-primary"
              : "doctor-tag-secondary"
          }
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "Tiến độ",
      dataIndex: "progress",
      key: "progress",
      render: (progress) => (
        <Progress percent={progress} className="doctor-progress" />
      ),
    },
  ];

  return (
    <div
      className="doctor-dashboard"
      style={{ padding: "24px", minHeight: "100vh" }}
    >
      {/* Header */}
      <Card className="doctor-card doctor-fade-in" style={{ marginBottom: 24 }}>
        <div className="doctor-header">
          <Title level={2} style={{ color: "var(--text-white)", margin: 0 }}>
            <HeartOutlined style={{ marginRight: 12 }} />
            Demo Giao Diện Mới - Doctor Dashboard
          </Title>
        </div>

        <div style={{ padding: "24px" }}>
          <Alert
            message="🎨 Giao diện mới đã được áp dụng!"
            description="Theme gradient hồng với hiệu ứng glass morphism và animations mượt mà."
            type="info"
            showIcon
            className="doctor-alert-info"
            style={{ marginBottom: 24 }}
          />

          {/* Statistics Cards */}
          <Title
            level={4}
            style={{ color: "var(--primary-color)", marginBottom: 16 }}
          >
            📊 Thống kê tổng quan
          </Title>
          <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
            {statisticsData.map((stat, index) => (
              <Col span={6} key={index}>
                <Card
                  className="doctor-stat-card doctor-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Statistic
                    title={stat.title}
                    value={stat.value}
                    suffix={stat.suffix}
                    prefix={React.cloneElement(stat.icon, {
                      style: { color: stat.color },
                    })}
                    valueStyle={{ color: stat.color, fontWeight: 600 }}
                  />
                </Card>
              </Col>
            ))}
          </Row>

          {/* Buttons Demo */}
          <Title
            level={4}
            style={{ color: "var(--primary-color)", marginBottom: 16 }}
          >
            🎯 Buttons & Controls
          </Title>
          <Card className="doctor-glass-card" style={{ marginBottom: 24 }}>
            <Space wrap>
              <Button
                type="primary"
                size="large"
                className="doctor-btn-primary"
              >
                <CheckCircleOutlined /> Button Primary
              </Button>
              <Button size="large" className="doctor-btn-secondary">
                <UserOutlined /> Button Secondary
              </Button>
              <Button type="primary" ghost className="doctor-btn-secondary">
                Ghost Button
              </Button>
              <Button danger>Danger Button</Button>
            </Space>
          </Card>

          {/* Progress & Tags Demo */}
          <Row gutter={24} style={{ marginBottom: 24 }}>
            <Col span={12}>
              <Card className="doctor-glass-card">
                <Title level={5} style={{ color: "var(--primary-color)" }}>
                  📈 Progress Bars
                </Title>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <div>
                    <Text>Tiến độ điều trị</Text>
                    <Progress percent={75} className="doctor-progress" />
                  </div>
                  <div>
                    <Text>Hiệu quả</Text>
                    <Progress
                      percent={88}
                      status="active"
                      className="doctor-progress"
                    />
                  </div>
                  <div>
                    <Text>Hoàn thành</Text>
                    <Progress percent={100} className="doctor-progress" />
                  </div>
                </Space>
              </Card>
            </Col>
            <Col span={12}>
              <Card className="doctor-glass-card">
                <Title level={5} style={{ color: "var(--primary-color)" }}>
                  🏷️ Tags & Badges
                </Title>
                <Space wrap>
                  <Tag className="doctor-tag-primary">IVF</Tag>
                  <Tag className="doctor-tag-primary">Hoàn thành</Tag>
                  <Tag className="doctor-tag-secondary">IUI</Tag>
                  <Tag className="doctor-tag-secondary">Đang điều trị</Tag>
                  <Badge count={5} className="doctor-badge">
                    <Avatar icon={<UserOutlined />} className="doctor-avatar" />
                  </Badge>
                </Space>
              </Card>
            </Col>
          </Row>

          {/* Timeline Demo */}
          <Row gutter={24} style={{ marginBottom: 24 }}>
            <Col span={12}>
              <Card className="doctor-card">
                <Title level={5} style={{ color: "var(--primary-color)" }}>
                  ⏰ Timeline - Hoạt động gần đây
                </Title>
                <Timeline className="doctor-timeline" items={timelineData} />
              </Card>
            </Col>
            <Col span={12}>
              <Card className="doctor-card">
                <Title level={5} style={{ color: "var(--primary-color)" }}>
                  📋 Steps - Quy trình điều trị
                </Title>
                <Steps
                  direction="vertical"
                  size="small"
                  current={1}
                  className="doctor-steps"
                  items={[
                    {
                      title: "Khám lâm sàng",
                      description: "Hoàn thành",
                      icon: <CheckCircleOutlined />,
                    },
                    {
                      title: "Lập phác đồ",
                      description: "Đang thực hiện",
                      icon: <MedicineBoxOutlined />,
                    },
                    {
                      title: "Điều trị",
                      description: "Chờ thực hiện",
                      icon: <CalendarOutlined />,
                    },
                  ]}
                />
              </Card>
            </Col>
          </Row>

          {/* Table Demo */}
          <Card className="doctor-card">
            <Title
              level={4}
              style={{ color: "var(--primary-color)", marginBottom: 16 }}
            >
              👥 Danh sách bệnh nhân
            </Title>
            <Table
              columns={tableColumns}
              dataSource={tableData}
              pagination={false}
              className="doctor-table"
            />
          </Card>

          {/* Patient Info Demo */}
          <Card className="doctor-glass-card" style={{ marginTop: 24 }}>
            <Title
              level={4}
              style={{ color: "var(--primary-color)", marginBottom: 16 }}
            >
              📝 Thông tin chi tiết bệnh nhân
            </Title>
            <Descriptions bordered column={3} size="small">
              <Descriptions.Item label="Họ tên">
                Nguyễn Thị Mai
              </Descriptions.Item>
              <Descriptions.Item label="Tuổi">32</Descriptions.Item>
              <Descriptions.Item label="Giới tính">Nữ</Descriptions.Item>
              <Descriptions.Item label="Dịch vụ">
                <Tag className="doctor-tag-primary">IVF</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Bác sĩ">
                BS. Lê Văn Doctor
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Badge status="processing" text="Đang điều trị" />
              </Descriptions.Item>
              <Descriptions.Item label="Chẩn đoán" span={3}>
                Vô sinh nguyên phát, khuyến nghị điều trị IVF với phác đồ cá
                nhân hóa
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Action Buttons */}
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <Space size="large">
              <Button
                type="primary"
                size="large"
                className="doctor-btn-primary"
                icon={<StarOutlined />}
              >
                Áp dụng Theme Mới
              </Button>
              <Button
                size="large"
                className="doctor-btn-secondary"
                icon={<HeartOutlined />}
              >
                Xem Demo Khác
              </Button>
            </Space>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ThemeDemo;
