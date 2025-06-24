import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Button,
  Space,
  Avatar,
  Progress,
  Tag,
  Calendar,
  Badge,
  List,
  Timeline,
  Tabs,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Descriptions,
  Drawer,
  Steps,
  Alert,
  Divider,
} from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  MedicineBoxOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  HeartOutlined,
  FileTextOutlined,
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  PhoneOutlined,
  MailOutlined,
} from "@ant-design/icons";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  dashboardAPI,
  patientAPI,
  appointmentAPI,
  treatmentAPI,
} from "../../services/api";

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;

const DoctorDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({});
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [treatmentPlans, setTreatmentPlans] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isPatientDrawerVisible, setIsPatientDrawerVisible] = useState(false);
  const [isTreatmentModalVisible, setIsTreatmentModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Mock data for charts
  const treatmentProgressData = [
    { month: "T1", completed: 12, ongoing: 8, success: 85 },
    { month: "T2", completed: 15, ongoing: 10, success: 88 },
    { month: "T3", completed: 18, ongoing: 12, success: 90 },
    { month: "T4", completed: 14, ongoing: 9, success: 87 },
    { month: "T5", completed: 20, ongoing: 15, success: 92 },
    { month: "T6", completed: 22, ongoing: 18, success: 89 },
  ];

  const patientStatusData = [
    { status: "Điều trị", count: 12, color: "#1890ff" },
    { status: "Theo dõi", count: 8, color: "#52c41a" },
    { status: "Hoàn thành", count: 25, color: "#faad14" },
    { status: "Tạm dừng", count: 3, color: "#f5222d" },
  ];

  useEffect(() => {
    fetchDashboardData();
    fetchPatients();
    fetchAppointments();
    fetchTreatmentPlans();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await dashboardAPI.getDoctorData();
      setDashboardData(response);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
    setLoading(false);
  };

  const fetchPatients = async () => {
    try {
      const response = await patientAPI.getAll();
      setPatients(response.data);
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await appointmentAPI.getAll();
      setAppointments(response.data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  const fetchTreatmentPlans = async () => {
    try {
      const response = await treatmentAPI.getAll();
      setTreatmentPlans(response.data);
    } catch (error) {
      console.error("Error fetching treatment plans:", error);
    }
  };

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    setIsPatientDrawerVisible(true);
  };

  const handleCreateTreatmentPlan = async (values) => {
    try {
      await treatmentAPI.create(values);
      // message.success("Tạo kế hoạch điều trị thành công");
      setIsTreatmentModalVisible(false);
      fetchTreatmentPlans();
    } catch (error) {
      // message.error("Lỗi khi tạo kế hoạch điều trị");
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      in_treatment: "#1890ff",
      consultation: "#52c41a",
      completed: "#faad14",
      paused: "#f5222d",
    };
    return statusColors[status] || "#8c8c8c";
  };

  const getStatusText = (status) => {
    const statusTexts = {
      in_treatment: "Đang điều trị",
      consultation: "Tư vấn",
      completed: "Hoàn thành",
      paused: "Tạm dừng",
    };
    return statusTexts[status] || status;
  };

  // Patient columns
  const patientColumns = [
    {
      title: "Bệnh nhân",
      key: "patient",
      render: (_, record) => (
        <Space>
          <Avatar
            icon={<UserOutlined />}
            style={{ backgroundColor: "#f56a00" }}
          >
            {record.fullName?.charAt(0)}
          </Avatar>
          <div>
            <div style={{ fontWeight: "bold" }}>{record.fullName}</div>
            <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
              {record.age} tuổi • {record.phone}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Giai đoạn điều trị",
      dataIndex: "treatmentPhase",
      key: "treatmentPhase",
      render: (phase) => <Tag color="blue">{phase}</Tag>,
    },
    {
      title: "Tiến độ",
      dataIndex: "progress",
      key: "progress",
      render: (progress) => (
        <Progress percent={progress} size="small" strokeColor="#52c41a" />
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: "Lịch hẹn tiếp theo",
      dataIndex: "nextAppointment",
      key: "nextAppointment",
      render: (appointment) => (
        <div style={{ fontSize: "12px" }}>
          {appointment
            ? new Date(appointment).toLocaleString("vi-VN")
            : "Chưa có"}
        </div>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewPatient(record)}
          >
            Chi tiết
          </Button>
          <Button type="link" icon={<EditOutlined />}>
            Cập nhật
          </Button>
        </Space>
      ),
    },
  ];

  // Appointment columns
  const appointmentColumns = [
    {
      title: "Thời gian",
      key: "time",
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: "bold" }}>{record.time}</div>
          <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
            {record.date}
          </div>
        </div>
      ),
    },
    {
      title: "Bệnh nhân",
      dataIndex: "patientId",
      key: "patientId",
      render: (patientId) => {
        const patient = patients.find((p) => p.id === patientId);
        return patient ? patient.fullName : `Bệnh nhân ${patientId}`;
      },
    },
    {
      title: "Loại khám",
      dataIndex: "type",
      key: "type",
      render: (type) => <Tag>{type}</Tag>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusMap = {
          confirmed: { color: "success", text: "Đã xác nhận" },
          pending: { color: "warning", text: "Chờ xác nhận" },
          completed: { color: "success", text: "Hoàn thành" },
        };
        const statusInfo = statusMap[status] || statusMap.pending;
        return <Badge status={statusInfo.color} text={statusInfo.text} />;
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button type="link" size="small">
            Bắt đầu
          </Button>
          <Button type="link" size="small">
            Hoãn
          </Button>
        </Space>
      ),
    },
  ];

  const todayAppointments = appointments.filter(
    (apt) => new Date(apt.date).toDateString() === new Date().toDateString()
  );

  return (
    <div className="doctor-dashboard" style={{ padding: "24px" }}>
      {/* Header Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Tổng bệnh nhân"
              value={dashboardData.totalPatients || 45}
              prefix={<UserOutlined style={{ color: "#1890ff" }} />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Lịch hẹn hôm nay"
              value={dashboardData.todayAppointments || 8}
              prefix={<CalendarOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Đang điều trị"
              value={dashboardData.activeTreatments || 12}
              prefix={<MedicineBoxOutlined style={{ color: "#faad14" }} />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Tỷ lệ thành công"
              value={dashboardData.successRate || 78.5}
              suffix="%"
              prefix={<HeartOutlined style={{ color: "#f5222d" }} />}
              valueStyle={{ color: "#f5222d" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content Tabs */}
      <Tabs defaultActiveKey="overview" size="large">
        <TabPane tab="Tổng quan" key="overview">
          <Row gutter={[16, 16]}>
            {/* Today's Schedule */}
            <Col xs={24} lg={12}>
              <Card
                title="Lịch trình hôm nay"
                className="dashboard-card"
                extra={
                  <Button type="primary" size="small" icon={<PlusOutlined />}>
                    Thêm lịch hẹn
                  </Button>
                }
              >
                <Timeline
                  items={todayAppointments.slice(0, 5).map((apt, index) => ({
                    color: apt.status === "confirmed" ? "green" : "blue",
                    dot:
                      apt.status === "completed" ? (
                        <CheckCircleOutlined />
                      ) : (
                        <ClockCircleOutlined />
                      ),
                    children: (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <p style={{ margin: 0, fontWeight: "bold" }}>
                            {apt.time} - {apt.type}
                          </p>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "12px",
                              color: "#8c8c8c",
                            }}
                          >
                            Bệnh nhân {apt.patientId}
                          </p>
                        </div>
                        <Button size="small" type="link">
                          Chi tiết
                        </Button>
                      </div>
                    ),
                  }))}
                />
              </Card>
            </Col>

            {/* Treatment Progress Chart */}
            <Col xs={24} lg={12}>
              <Card title="Tiến độ điều trị" className="dashboard-card">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={treatmentProgressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="completed"
                      stroke="#52c41a"
                      name="Hoàn thành"
                    />
                    <Line
                      type="monotone"
                      dataKey="ongoing"
                      stroke="#1890ff"
                      name="Đang điều trị"
                    />
                    <Line
                      type="monotone"
                      dataKey="success"
                      stroke="#faad14"
                      name="Tỷ lệ thành công (%)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>

            {/* Patient Status Overview */}
            <Col xs={24} lg={12}>
              <Card title="Tình trạng bệnh nhân" className="dashboard-card">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={patientStatusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#1890ff" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>

            {/* Quick Actions */}
            <Col xs={24} lg={12}>
              <Card title="Thao tác nhanh" className="dashboard-card">
                <Space
                  direction="vertical"
                  style={{ width: "100%" }}
                  size="middle"
                >
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    block
                    onClick={() => setIsTreatmentModalVisible(true)}
                  >
                    Tạo kế hoạch điều trị
                  </Button>
                  <Button icon={<FileTextOutlined />} block>
                    Viết đơn thuốc
                  </Button>
                  <Button icon={<CalendarOutlined />} block>
                    Xem lịch tuần
                  </Button>
                  <Button icon={<MedicineBoxOutlined />} block>
                    Cập nhật tiến độ
                  </Button>
                </Space>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Bệnh nhân" key="patients">
          <Card title="Danh sách bệnh nhân" className="dashboard-card">
            <Table
              columns={patientColumns}
              dataSource={patients}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
              scroll={{ x: 1000 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Lịch hẹn" key="appointments">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
              <Card title="Danh sách lịch hẹn" className="dashboard-card">
                <Table
                  columns={appointmentColumns}
                  dataSource={appointments}
                  rowKey="id"
                  loading={loading}
                  pagination={{ pageSize: 8 }}
                />
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title="Lịch hẹn hôm nay" className="dashboard-card">
                <List
                  dataSource={todayAppointments}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={<ClockCircleOutlined />} />}
                        title={`${item.time} - ${item.type}`}
                        description={`Bệnh nhân ${item.patientId}`}
                      />
                      <Tag
                        color={item.status === "confirmed" ? "green" : "orange"}
                      >
                        {item.status === "confirmed"
                          ? "Đã xác nhận"
                          : "Chờ xác nhận"}
                      </Tag>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Kế hoạch điều trị" key="treatments">
          <Card title="Kế hoạch điều trị" className="dashboard-card">
            <List
              dataSource={treatmentPlans}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button type="link" icon={<EyeOutlined />}>
                      Chi tiết
                    </Button>,
                    <Button type="link" icon={<EditOutlined />}>
                      Cập nhật
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        icon={<MedicineBoxOutlined />}
                        style={{ backgroundColor: "#722ed1" }}
                      />
                    }
                    title={item.title}
                    description={
                      <div>
                        <p>{item.description}</p>
                        <div>
                          <Tag color="blue">Bệnh nhân {item.patientId}</Tag>
                          <Tag color="green">
                            {item.phases?.filter(
                              (p) => p.status === "completed"
                            ).length || 0}
                            /{item.phases?.length || 0} giai đoạn
                          </Tag>
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </TabPane>
      </Tabs>

      {/* Patient Details Drawer */}
      <Drawer
        title="Thông tin bệnh nhân"
        placement="right"
        width={600}
        onClose={() => setIsPatientDrawerVisible(false)}
        open={isPatientDrawerVisible}
      >
        {selectedPatient && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <Avatar
                size={80}
                icon={<UserOutlined />}
                style={{ backgroundColor: "#f56a00" }}
              >
                {selectedPatient.fullName?.charAt(0)}
              </Avatar>
              <h3 style={{ marginTop: 16, marginBottom: 8 }}>
                {selectedPatient.fullName}
              </h3>
              <Tag color={getStatusColor(selectedPatient.status)}>
                {getStatusText(selectedPatient.status)}
              </Tag>
            </div>

            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Tuổi">
                {selectedPatient.age}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                <Space>
                  <PhoneOutlined />
                  {selectedPatient.phone}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                <Space>
                  <MailOutlined />
                  {selectedPatient.email}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Giai đoạn điều trị">
                {selectedPatient.treatmentPhase}
              </Descriptions.Item>
              <Descriptions.Item label="Tiến độ">
                <Progress percent={selectedPatient.progress} size="small" />
              </Descriptions.Item>
              <Descriptions.Item label="Lịch hẹn tiếp theo">
                {selectedPatient.nextAppointment
                  ? new Date(selectedPatient.nextAppointment).toLocaleString(
                      "vi-VN"
                    )
                  : "Chưa có"}
              </Descriptions.Item>
            </Descriptions>

            <Divider>Tiến trình điều trị</Divider>

            <Steps direction="vertical" size="small" current={2}>
              <Step
                title="Khám ban đầu"
                description="Hoàn thành - 15/12/2023"
              />
              <Step
                title="Chuẩn bị chu kỳ"
                description="Hoàn thành - 20/12/2023"
              />
              <Step
                title="Kích thích buồng trứng"
                description="Đang thực hiện"
              />
              <Step title="Chọc hút trứng" description="Chưa bắt đầu" />
              <Step title="Chuyển phôi" description="Chưa bắt đầu" />
            </Steps>

            <Divider />

            <div style={{ textAlign: "center" }}>
              <Space>
                <Button type="primary" icon={<EditOutlined />}>
                  Cập nhật tiến độ
                </Button>
                <Button icon={<CalendarOutlined />}>Đặt lịch hẹn</Button>
                <Button icon={<FileTextOutlined />}>Viết đơn thuốc</Button>
              </Space>
            </div>
          </div>
        )}
      </Drawer>

      {/* Create Treatment Plan Modal */}
      <Modal
        title="Tạo kế hoạch điều trị"
        open={isTreatmentModalVisible}
        onCancel={() => setIsTreatmentModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateTreatmentPlan}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Bệnh nhân"
                name="patientId"
                rules={[
                  { required: true, message: "Vui lòng chọn bệnh nhân!" },
                ]}
              >
                <Select placeholder="Chọn bệnh nhân">
                  {patients.map((patient) => (
                    <Option key={patient.id} value={patient.id}>
                      {patient.fullName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Tiêu đề kế hoạch"
                name="title"
                rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
              >
                <Input placeholder="VD: Phác đồ IVF cơ bản" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Mô tả"
            name="description"
            rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
          >
            <TextArea
              rows={3}
              placeholder="Mô tả chi tiết kế hoạch điều trị..."
            />
          </Form.Item>

          <Alert
            message="Lưu ý"
            description="Sau khi tạo kế hoạch, bạn có thể thêm các giai đoạn điều trị và thuốc cụ thể."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <div style={{ textAlign: "right" }}>
            <Space>
              <Button onClick={() => setIsTreatmentModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Tạo kế hoạch
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default DoctorDashboard;
