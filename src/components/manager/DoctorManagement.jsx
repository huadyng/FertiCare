import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Tag,
  Avatar,
  Tabs,
  Statistic,
  Row,
  Col,
  DatePicker,
  TimePicker,
  Switch,
  message,
  Popconfirm,
  Tooltip,
  Badge,
  Progress,
  Rate,
  Divider,
  Upload,
  notification,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  PhoneOutlined,
  MailOutlined,
  MedicineBoxOutlined,
  StarOutlined,
  UploadOutlined,
  EyeOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { formatDate, formatCurrency, getRelativeTime } from "../../utils";
import { USER_ROLES, ROUTES } from "../../constants";

const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

// Mock data - Replace with API calls
const mockDoctors = [
  {
    id: 1,
    name: "Dr. Nguyễn Văn An",
    email: "nguyen.van.an@fertility.com",
    phone: "0901234567",
    avatar: null,
    specialization: "Sản phụ khoa",
    department: "Khám tổng quát",
    experience: 5,
    rating: 4.8,
    status: "active",
    schedule: {
      monday: { morning: true, afternoon: true, evening: false },
      tuesday: { morning: true, afternoon: false, evening: true },
      wednesday: { morning: false, afternoon: true, evening: true },
      thursday: { morning: true, afternoon: true, evening: false },
      friday: { morning: true, afternoon: true, evening: true },
      saturday: { morning: true, afternoon: false, evening: false },
      sunday: { morning: false, afternoon: false, evening: false },
    },
    performance: {
      totalPatients: 245,
      completedTreatments: 198,
      successRate: 81,
      avgRating: 4.8,
      patientSatisfaction: 92,
    },
    joinDate: "2020-03-15",
    salary: 25000000,
    contractType: "full-time",
  },
  {
    id: 2,
    name: "Dr. Trần Thị Bình",
    email: "tran.thi.binh@fertility.com",
    phone: "0912345678",
    avatar: null,
    specialization: "Nội tiết sinh sản",
    department: "Điều trị chuyên sâu",
    experience: 8,
    rating: 4.9,
    status: "active",
    schedule: {
      monday: { morning: true, afternoon: true, evening: true },
      tuesday: { morning: true, afternoon: true, evening: false },
      wednesday: { morning: true, afternoon: true, evening: true },
      thursday: { morning: false, afternoon: true, evening: true },
      friday: { morning: true, afternoon: true, evening: false },
      saturday: { morning: true, afternoon: true, evening: false },
      sunday: { morning: false, afternoon: false, evening: false },
    },
    performance: {
      totalPatients: 312,
      completedTreatments: 267,
      successRate: 85,
      avgRating: 4.9,
      patientSatisfaction: 95,
    },
    joinDate: "2018-08-22",
    salary: 35000000,
    contractType: "full-time",
  },
];

const specializations = [
  "Sản phụ khoa",
  "Nội tiết sinh sản",
  "Hiếm muộn",
  "Thai sản",
  "Phẫu thuật nội soi",
  "Chẩn đoán hình ảnh",
];

const departments = [
  "Khám tổng quát",
  "Điều trị chuyên sâu",
  "Phẫu thuật",
  "Chẩn đoán",
  "Hỗ trợ sinh sản",
];

const contractTypes = [
  { value: "full-time", label: "Toàn thời gian" },
  { value: "part-time", label: "Bán thời gian" },
  { value: "contract", label: "Hợp đồng" },
];

const DoctorManagement = () => {
  const [doctors, setDoctors] = useState(mockDoctors);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isScheduleModalVisible, setIsScheduleModalVisible] = useState(false);
  const [isPerformanceModalVisible, setIsPerformanceModalVisible] =
    useState(false);
  const [currentDoctor, setCurrentDoctor] = useState(null);
  const [form] = Form.useForm();
  const [scheduleForm] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDepartment, setFilterDepartment] = useState("all");

  // Statistics
  const stats = {
    total: doctors.length,
    active: doctors.filter((d) => d.status === "active").length,
    inactive: doctors.filter((d) => d.status === "inactive").length,
    avgRating: (
      doctors.reduce((sum, d) => sum + d.rating, 0) / doctors.length
    ).toFixed(1),
  };

  const showModal = (doctor = null) => {
    setCurrentDoctor(doctor);
    setIsModalVisible(true);
    if (doctor) {
      form.setFieldsValue({
        ...doctor,
        joinDate: doctor.joinDate ? new Date(doctor.joinDate) : null,
      });
    } else {
      form.resetFields();
    }
  };

  const showScheduleModal = (doctor) => {
    setCurrentDoctor(doctor);
    setIsScheduleModalVisible(true);
    scheduleForm.setFieldsValue(doctor.schedule);
  };

  const showPerformanceModal = (doctor) => {
    setCurrentDoctor(doctor);
    setIsPerformanceModalVisible(true);
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      if (currentDoctor) {
        // Update doctor
        setDoctors((prev) =>
          prev.map((d) => (d.id === currentDoctor.id ? { ...d, ...values } : d))
        );
        message.success("Cập nhật thông tin bác sĩ thành công!");
      } else {
        // Add new doctor
        const newDoctor = {
          ...values,
          id: Date.now(),
          rating: 0,
          status: "active",
          performance: {
            totalPatients: 0,
            completedTreatments: 0,
            successRate: 0,
            avgRating: 0,
            patientSatisfaction: 0,
          },
          schedule: {
            monday: { morning: false, afternoon: false, evening: false },
            tuesday: { morning: false, afternoon: false, evening: false },
            wednesday: { morning: false, afternoon: false, evening: false },
            thursday: { morning: false, afternoon: false, evening: false },
            friday: { morning: false, afternoon: false, evening: false },
            saturday: { morning: false, afternoon: false, evening: false },
            sunday: { morning: false, afternoon: false, evening: false },
          },
        };
        setDoctors((prev) => [...prev, newDoctor]);
        message.success("Thêm bác sĩ mới thành công!");
      }
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error("Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleSubmit = async (values) => {
    setLoading(true);
    try {
      setDoctors((prev) =>
        prev.map((d) =>
          d.id === currentDoctor.id ? { ...d, schedule: values } : d
        )
      );
      message.success("Cập nhật lịch làm việc thành công!");
      setIsScheduleModalVisible(false);
    } catch (error) {
      message.error("Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      setDoctors((prev) => prev.filter((d) => d.id !== id));
      message.success("Xóa bác sĩ thành công!");
    } catch (error) {
      message.error("Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id, status) => {
    setLoading(true);
    try {
      setDoctors((prev) =>
        prev.map((d) =>
          d.id === id
            ? { ...d, status: status === "active" ? "inactive" : "active" }
            : d
        )
      );
      message.success(
        `${
          status === "active" ? "Vô hiệu hóa" : "Kích hoạt"
        } bác sĩ thành công!`
      );
    } catch (error) {
      message.error("Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  // Filter doctors
  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(searchText.toLowerCase()) ||
      doctor.email.toLowerCase().includes(searchText.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || doctor.status === filterStatus;
    const matchesDepartment =
      filterDepartment === "all" || doctor.department === filterDepartment;

    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const columns = [
    {
      title: "Bác sĩ",
      key: "doctor",
      width: 250,
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar size={48} src={record.avatar} icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              {record.name}
            </div>
            <div style={{ color: "#666", fontSize: 12 }}>
              <MailOutlined style={{ marginRight: 4 }} />
              {record.email}
            </div>
            <div style={{ color: "#666", fontSize: 12 }}>
              <PhoneOutlined style={{ marginRight: 4 }} />
              {record.phone}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Chuyên khoa",
      dataIndex: "specialization",
      key: "specialization",
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Khoa/Phòng",
      dataIndex: "department",
      key: "department",
    },
    {
      title: "Kinh nghiệm",
      dataIndex: "experience",
      key: "experience",
      render: (years) => `${years} năm`,
    },
    {
      title: "Đánh giá",
      key: "rating",
      render: (_, record) => (
        <div>
          <Rate disabled value={record.rating} style={{ fontSize: 14 }} />
          <div style={{ fontSize: 12, color: "#666" }}>
            {record.rating}/5.0 ({record.performance.totalPatients} BN)
          </div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_, record) => (
        <Switch
          checked={record.status === "active"}
          onChange={() => toggleStatus(record.id, record.status)}
          checkedChildren="Hoạt động"
          unCheckedChildren="Tạm dừng"
        />
      ),
    },
    {
      title: "Hợp đồng",
      dataIndex: "contractType",
      key: "contractType",
      render: (type) => {
        const contract = contractTypes.find((c) => c.value === type);
        return <Tag color="green">{contract?.label || type}</Tag>;
      },
    },
    {
      title: "Lương",
      dataIndex: "salary",
      key: "salary",
      render: (salary) => formatCurrency(salary),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 200,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => showPerformanceModal(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => showModal(record)}
            />
          </Tooltip>
          <Tooltip title="Lịch làm việc">
            <Button
              icon={<CalendarOutlined />}
              size="small"
              onClick={() => showScheduleModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa bác sĩ này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const renderScheduleForm = () => {
    const days = [
      { key: "monday", label: "Thứ 2" },
      { key: "tuesday", label: "Thứ 3" },
      { key: "wednesday", label: "Thứ 4" },
      { key: "thursday", label: "Thứ 5" },
      { key: "friday", label: "Thứ 6" },
      { key: "saturday", label: "Thứ 7" },
      { key: "sunday", label: "Chủ nhật" },
    ];

    const shifts = [
      { key: "morning", label: "Sáng (8:00-12:00)" },
      { key: "afternoon", label: "Chiều (13:00-17:00)" },
      { key: "evening", label: "Tối (18:00-22:00)" },
    ];

    return (
      <div>
        {days.map((day) => (
          <Card key={day.key} size="small" style={{ marginBottom: 8 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <strong>{day.label}</strong>
              <Space>
                {shifts.map((shift) => (
                  <Form.Item
                    key={`${day.key}.${shift.key}`}
                    name={[day.key, shift.key]}
                    valuePropName="checked"
                    style={{ margin: 0 }}
                  >
                    <Switch size="small" />
                  </Form.Item>
                ))}
              </Space>
            </div>
            <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
              {shifts.map((shift) => (
                <span key={shift.key} style={{ marginRight: 16 }}>
                  {shift.label}
                </span>
              ))}
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div style={{ padding: "24px", background: "#f5f5f5", minHeight: "100vh" }}>
      {/* Header Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng số bác sĩ"
              value={stats.total}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đang hoạt động"
              value={stats.active}
              prefix={<MedicineBoxOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tạm dừng"
              value={stats.inactive}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đánh giá TB"
              value={stats.avgRating}
              prefix={<StarOutlined />}
              suffix="/ 5.0"
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Card>
        <div
          style={{
            marginBottom: 16,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <Input.Search
              placeholder="Tìm kiếm bác sĩ..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
            />
            <Select
              value={filterStatus}
              onChange={setFilterStatus}
              style={{ width: 120 }}
            >
              <Option value="all">Tất cả</Option>
              <Option value="active">Hoạt động</Option>
              <Option value="inactive">Tạm dừng</Option>
            </Select>
            <Select
              value={filterDepartment}
              onChange={setFilterDepartment}
              style={{ width: 150 }}
            >
              <Option value="all">Tất cả khoa</Option>
              {departments.map((dept) => (
                <Option key={dept} value={dept}>
                  {dept}
                </Option>
              ))}
            </Select>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
          >
            Thêm bác sĩ
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={filteredDoctors}
          rowKey="id"
          loading={loading}
          pagination={{
            total: filteredDoctors.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Tổng ${total} bác sĩ`,
          }}
        />
      </Card>

      {/* Add/Edit Doctor Modal */}
      <Modal
        title={currentDoctor ? "Chỉnh sửa bác sĩ" : "Thêm bác sĩ mới"}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Họ và tên"
                name="name"
                rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
              >
                <Input placeholder="Nhập họ và tên" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Vui lòng nhập email!" },
                  { type: "email", message: "Email không hợp lệ!" },
                ]}
              >
                <Input placeholder="Nhập email" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Số điện thoại"
                name="phone"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại!" },
                ]}
              >
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Chuyên khoa"
                name="specialization"
                rules={[
                  { required: true, message: "Vui lòng chọn chuyên khoa!" },
                ]}
              >
                <Select placeholder="Chọn chuyên khoa">
                  {specializations.map((spec) => (
                    <Option key={spec} value={spec}>
                      {spec}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Khoa/Phòng"
                name="department"
                rules={[{ required: true, message: "Vui lòng chọn khoa!" }]}
              >
                <Select placeholder="Chọn khoa">
                  {departments.map((dept) => (
                    <Option key={dept} value={dept}>
                      {dept}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Kinh nghiệm (năm)"
                name="experience"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập số năm kinh nghiệm!",
                  },
                ]}
              >
                <Input type="number" placeholder="Nhập số năm" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Loại hợp đồng"
                name="contractType"
                rules={[
                  { required: true, message: "Vui lòng chọn loại hợp đồng!" },
                ]}
              >
                <Select placeholder="Chọn loại hợp đồng">
                  {contractTypes.map((type) => (
                    <Option key={type.value} value={type.value}>
                      {type.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Lương (VNĐ)"
                name="salary"
                rules={[{ required: true, message: "Vui lòng nhập lương!" }]}
              >
                <Input type="number" placeholder="Nhập mức lương" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Ngày vào làm"
            name="joinDate"
            rules={[{ required: true, message: "Vui lòng chọn ngày vào làm!" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <div style={{ textAlign: "right" }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {currentDoctor ? "Cập nhật" : "Thêm mới"}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Schedule Modal */}
      <Modal
        title={`Lịch làm việc - ${currentDoctor?.name}`}
        visible={isScheduleModalVisible}
        onCancel={() => setIsScheduleModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={scheduleForm}
          layout="vertical"
          onFinish={handleScheduleSubmit}
        >
          {renderScheduleForm()}

          <div style={{ textAlign: "right", marginTop: 24 }}>
            <Space>
              <Button onClick={() => setIsScheduleModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Cập nhật lịch
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Performance Modal */}
      <Modal
        title={`Hiệu suất làm việc - ${currentDoctor?.name}`}
        visible={isPerformanceModalVisible}
        onCancel={() => setIsPerformanceModalVisible(false)}
        footer={null}
        width={800}
      >
        {currentDoctor && (
          <div>
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={8}>
                <Statistic
                  title="Tổng bệnh nhân"
                  value={currentDoctor.performance.totalPatients}
                  prefix={<UserOutlined />}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Điều trị hoàn thành"
                  value={currentDoctor.performance.completedTreatments}
                  prefix={<MedicineBoxOutlined />}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Tỷ lệ thành công"
                  value={currentDoctor.performance.successRate}
                  suffix="%"
                  prefix={<StarOutlined />}
                />
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Card size="small">
                  <div style={{ marginBottom: 8 }}>Đánh giá trung bình</div>
                  <Progress
                    percent={currentDoctor.performance.avgRating * 20}
                    format={() => `${currentDoctor.performance.avgRating}/5.0`}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small">
                  <div style={{ marginBottom: 8 }}>Độ hài lòng bệnh nhân</div>
                  <Progress
                    percent={currentDoctor.performance.patientSatisfaction}
                    strokeColor="#52c41a"
                  />
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DoctorManagement;
