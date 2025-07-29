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
  Select,
  DatePicker,
  Modal,
  Form,
  Input,
  message,
} from "antd";
import {
  TeamOutlined,
  UserOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  TrophyOutlined,
  RiseOutlined,
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { dashboardAPI, userAPI, appointmentAPI } from "../../services/api";

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const ManagerDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({});
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isScheduleModalVisible, setIsScheduleModalVisible] = useState(false);
  const [form] = Form.useForm();

  // TODO: Replace with actual API data
  const performanceData = [];

  const departmentData = [
    { name: "IVF", value: 45, color: "#1890ff" },
    { name: "Khám tổng quát", value: 30, color: "#52c41a" },
    { name: "Siêu âm", value: 15, color: "#faad14" },
    { name: "Xét nghiệm", value: 10, color: "#f5222d" },
  ];

  useEffect(() => {
    fetchDashboardData();
    fetchDoctors();
    fetchAppointments();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await dashboardAPI.getManagerData();
      setDashboardData(response);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
    setLoading(false);
  };

  const fetchDoctors = async () => {
    try {
      const response = await userAPI.getAll({ role: "doctor" });
      setDoctors(response.data);
    } catch (error) {
      console.error("Error fetching doctors:", error);
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

  const handleScheduleAppointment = async (values) => {
    try {
      await appointmentAPI.create(values);
      message.success("Đặt lịch hẹn thành công");
      setIsScheduleModalVisible(false);
      fetchAppointments();
    } catch (error) {
      message.error("Lỗi khi đặt lịch hẹn");
    }
  };

  // Doctor performance columns
  const doctorColumns = [
    {
      title: "Bác sĩ",
      key: "doctor",
      render: (_, record) => (
        <Space>
          <Avatar
            icon={<UserOutlined />}
            style={{ backgroundColor: "#722ed1" }}
          >
            {record.fullName?.charAt(0)}
          </Avatar>
          <div>
            <div style={{ fontWeight: "bold" }}>{record.fullName}</div>
            <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
              {record.specialty}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Bệnh nhân",
      dataIndex: "patientCount",
      key: "patientCount",
      render: (count) => (
        <Badge count={count} style={{ backgroundColor: "#52c41a" }} />
      ),
    },
    {
      title: "Lịch hẹn hôm nay",
      dataIndex: "todayAppointments",
      key: "todayAppointments",
      render: (count) => (
        <Badge count={count} style={{ backgroundColor: "#1890ff" }} />
      ),
    },
    {
      title: "Hiệu suất",
      dataIndex: "performance",
      key: "performance",
      render: (performance) => (
        <Progress
          percent={performance || 85}
          size="small"
          strokeColor="#52c41a"
        />
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusMap = {
          active: { color: "success", text: "Đang làm việc" },
          busy: { color: "warning", text: "Bận" },
          offline: { color: "default", text: "Offline" },
        };
        const statusInfo = statusMap[status] || statusMap.active;
        return <Badge status={statusInfo.color} text={statusInfo.text} />;
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} size="small">
            Chi tiết
          </Button>
          <Button type="link" icon={<CalendarOutlined />} size="small">
            Lịch trình
          </Button>
        </Space>
      ),
    },
  ];

  // Appointment columns
  const appointmentColumns = [
    {
      title: "Thời gian",
      dataIndex: "time",
      key: "time",
      render: (time, record) => (
        <div>
          <div style={{ fontWeight: "bold" }}>{time}</div>
          <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
            {record.date}
          </div>
        </div>
      ),
    },
    {
      title: "Bệnh nhân",
      dataIndex: "patientName",
      key: "patientName",
    },
    {
      title: "Bác sĩ",
      dataIndex: "doctorName",
      key: "doctorName",
    },
    {
      title: "Loại khám",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusMap = {
          confirmed: { color: "success", text: "Đã xác nhận" },
          pending: { color: "warning", text: "Chờ xác nhận" },
          cancelled: { color: "error", text: "Đã hủy" },
        };
        const statusInfo = statusMap[status] || statusMap.pending;
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
    },
  ];

  const getListData = (value) => {
    const listData = [];
    const dayAppointments = appointments.filter(
      (apt) =>
        new Date(apt.date).toDateString() === value.toDate().toDateString()
    );

    dayAppointments.forEach((apt) => {
      listData.push({
        type: apt.status === "confirmed" ? "success" : "warning",
        content: `${apt.time} - ${apt.type}`,
      });
    });

    return listData;
  };

  const dateCellRender = (value) => {
    const listData = getListData(value);
    return (
      <ul style={{ listStyle: "none", padding: 0 }}>
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
    <div className="manager-dashboard" style={{ padding: "24px" }}>
      {/* Header Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Đội ngũ"
              value={dashboardData.teamSize || 12}
              prefix={<TeamOutlined style={{ color: "#1890ff" }} />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Bác sĩ hoạt động"
              value={dashboardData.activeDoctors || 10}
              prefix={<UserOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="BN tháng này"
              value={dashboardData.monthlyPatients || 156}
              prefix={<RiseOutlined style={{ color: "#faad14" }} />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Chờ duyệt"
              value={dashboardData.approvalsPending || 8}
              prefix={
                <ExclamationCircleOutlined style={{ color: "#f5222d" }} />
              }
              valueStyle={{ color: "#f5222d" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content Tabs */}
      <Tabs defaultActiveKey="overview" size="large">
        <TabPane tab="Tổng quan" key="overview">
          <Row gutter={[16, 16]}>
            {/* Performance Chart */}
            <Col xs={24} lg={12}>
              <Card title="Hiệu suất theo tháng" className="dashboard-card">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="patients"
                      stroke="#1890ff"
                      name="Bệnh nhân"
                    />
                    <Line
                      type="monotone"
                      dataKey="appointments"
                      stroke="#52c41a"
                      name="Lịch hẹn"
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

            {/* Department Distribution */}
            <Col xs={24} lg={12}>
              <Card title="Phân bổ theo khoa" className="dashboard-card">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={departmentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {departmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>

            {/* Recent Activities */}
            <Col xs={24} lg={12}>
              <Card title="Hoạt động gần đây" className="dashboard-card">
                <Timeline>
                  <Timeline.Item color="green">
                    <p>BS. Nguyễn Văn A hoàn thành ca IVF</p>
                    <p style={{ fontSize: "12px", color: "#8c8c8c" }}>
                      2 phút trước
                    </p>
                  </Timeline.Item>
                  <Timeline.Item color="blue">
                    <p>Lịch hẹn mới được đặt - BN Trần Thị B</p>
                    <p style={{ fontSize: "12px", color: "#8c8c8c" }}>
                      15 phút trước
                    </p>
                  </Timeline.Item>
                  <Timeline.Item color="red">
                    <p>Báo cáo tuần cần phê duyệt</p>
                    <p style={{ fontSize: "12px", color: "#8c8c8c" }}>
                      1 giờ trước
                    </p>
                  </Timeline.Item>
                  <Timeline.Item>
                    <p>Cuộc họp team buổi sáng kết thúc</p>
                    <p style={{ fontSize: "12px", color: "#8c8c8c" }}>
                      3 giờ trước
                    </p>
                  </Timeline.Item>
                </Timeline>
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
                    onClick={() => setIsScheduleModalVisible(true)}
                  >
                    Đặt lịch hẹn mới
                  </Button>
                  <Button icon={<TeamOutlined />} block>
                    Quản lý đội ngũ
                  </Button>
                  <Button icon={<TrophyOutlined />} block>
                    Xem báo cáo hiệu suất
                  </Button>
                  <Button icon={<CalendarOutlined />} block>
                    Lập kế hoạch tuần
                  </Button>
                </Space>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Quản lý đội ngũ" key="team">
          <Card title="Danh sách bác sĩ" className="dashboard-card">
            <Table
              columns={doctorColumns}
              dataSource={doctors.map((doctor) => ({
                ...doctor,
                patientCount: Math.floor(Math.random() * 50) + 10,
                todayAppointments: Math.floor(Math.random() * 8) + 1,
                performance: Math.floor(Math.random() * 30) + 70,
                status: ["active", "busy", "offline"][
                  Math.floor(Math.random() * 3)
                ],
              }))}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 8 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Lịch trình" key="schedule">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
              <Card title="Lịch làm việc" className="dashboard-card">
                <Calendar
                  dateCellRender={dateCellRender}
                  onSelect={setSelectedDate}
                />
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title="Lịch hẹn hôm nay" className="dashboard-card">
                <Table
                  columns={appointmentColumns}
                  dataSource={appointments
                    .filter(
                      (apt) =>
                        new Date(apt.date).toDateString() ===
                        selectedDate.toDateString()
                    )
                    .map((apt) => ({
                      ...apt,
                      patientName: `Bệnh nhân ${apt.patientId}`,
                      doctorName: `BS. ${apt.doctorId}`,
                    }))}
                  rowKey="id"
                  size="small"
                  pagination={false}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Báo cáo" key="reports">
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card title="Báo cáo hiệu suất" className="dashboard-card">
                <div style={{ marginBottom: 16 }}>
                  <Space>
                    <RangePicker />
                    <Select defaultValue="all" style={{ width: 120 }}>
                      <Option value="all">Tất cả</Option>
                      <Option value="ivf">IVF</Option>
                      <Option value="general">Tổng quát</Option>
                    </Select>
                    <Button type="primary">Xuất báo cáo</Button>
                  </Space>
                </div>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="patients" fill="#1890ff" name="Bệnh nhân" />
                    <Bar
                      dataKey="appointments"
                      fill="#52c41a"
                      name="Lịch hẹn"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>

      {/* Schedule Appointment Modal */}
      <Modal
        title="Đặt lịch hẹn mới"
        open={isScheduleModalVisible}
        onCancel={() => setIsScheduleModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleScheduleAppointment}
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
                  <Option value={1}>Nguyễn Thị A</Option>
                  <Option value={2}>Lê Thị B</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Bác sĩ"
                name="doctorId"
                rules={[{ required: true, message: "Vui lòng chọn bác sĩ!" }]}
              >
                <Select placeholder="Chọn bác sĩ">
                  {doctors.map((doctor) => (
                    <Option key={doctor.id} value={doctor.id}>
                      {doctor.fullName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Ngày khám"
                name="date"
                rules={[{ required: true, message: "Vui lòng chọn ngày!" }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Giờ khám"
                name="time"
                rules={[{ required: true, message: "Vui lòng chọn giờ!" }]}
              >
                <Select placeholder="Chọn giờ">
                  <Option value="08:00">08:00</Option>
                  <Option value="09:00">09:00</Option>
                  <Option value="10:00">10:00</Option>
                  <Option value="14:00">14:00</Option>
                  <Option value="15:00">15:00</Option>
                  <Option value="16:00">16:00</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Loại khám"
            name="type"
            rules={[{ required: true, message: "Vui lòng nhập loại khám!" }]}
          >
            <Select placeholder="Chọn loại khám">
              <Option value="Tư vấn">Tư vấn</Option>
              <Option value="Siêu âm">Siêu âm</Option>
              <Option value="Xét nghiệm">Xét nghiệm</Option>
              <Option value="IVF">IVF</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Ghi chú" name="notes">
            <Input.TextArea rows={3} placeholder="Ghi chú thêm..." />
          </Form.Item>

          <div style={{ textAlign: "right" }}>
            <Space>
              <Button onClick={() => setIsScheduleModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Đặt lịch
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ManagerDashboard;
