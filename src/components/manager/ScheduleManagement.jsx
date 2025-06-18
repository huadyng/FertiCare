import React, { useState, useEffect } from "react";
import {
  Card,
  Calendar,
  Badge,
  Modal,
  Form,
  Select,
  DatePicker,
  TimePicker,
  Button,
  Space,
  Table,
  Tag,
  Tabs,
  Row,
  Col,
  Statistic,
  message,
  Popconfirm,
  Tooltip,
  Alert,
  List,
  Avatar,
  Switch,
  Input,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  TeamOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);
import { formatDate, formatCurrency } from "../../utils";

const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

// Mock data
const mockDoctors = [
  {
    id: 1,
    name: "Dr. Nguyễn Văn An",
    department: "Khám tổng quát",
    specialization: "Sản phụ khoa",
  },
  {
    id: 2,
    name: "Dr. Trần Thị Bình",
    department: "Điều trị chuyên sâu",
    specialization: "Nội tiết sinh sản",
  },
  {
    id: 3,
    name: "Dr. Lê Văn Cường",
    department: "Phẫu thuật",
    specialization: "Phẫu thuật nội soi",
  },
  {
    id: 4,
    name: "Dr. Phạm Thị Dung",
    department: "Chẩn đoán",
    specialization: "Chẩn đoán hình ảnh",
  },
];

const mockSchedules = [
  {
    id: 1,
    doctorId: 1,
    doctorName: "Dr. Nguyễn Văn An",
    date: "2024-01-15",
    shift: "morning",
    startTime: "08:00",
    endTime: "12:00",
    room: "Phòng 101",
    type: "consultation",
    status: "confirmed",
    patientLimit: 20,
    currentPatients: 15,
  },
  {
    id: 2,
    doctorId: 1,
    doctorName: "Dr. Nguyễn Văn An",
    date: "2024-01-15",
    shift: "afternoon",
    startTime: "13:00",
    endTime: "17:00",
    room: "Phòng 101",
    type: "consultation",
    status: "confirmed",
    patientLimit: 20,
    currentPatients: 18,
  },
  {
    id: 3,
    doctorId: 2,
    doctorName: "Dr. Trần Thị Bình",
    date: "2024-01-15",
    shift: "morning",
    startTime: "08:00",
    endTime: "12:00",
    room: "Phòng 201",
    type: "treatment",
    status: "confirmed",
    patientLimit: 10,
    currentPatients: 8,
  },
  {
    id: 4,
    doctorId: 3,
    doctorName: "Dr. Lê Văn Cường",
    date: "2024-01-16",
    shift: "morning",
    startTime: "07:00",
    endTime: "11:00",
    room: "Phòng phẫu thuật 1",
    type: "surgery",
    status: "pending",
    patientLimit: 3,
    currentPatients: 2,
  },
];

const shifts = [
  {
    value: "morning",
    label: "Ca sáng",
    time: "08:00 - 12:00",
    color: "#52c41a",
  },
  {
    value: "afternoon",
    label: "Ca chiều",
    time: "13:00 - 17:00",
    color: "#1890ff",
  },
  {
    value: "evening",
    label: "Ca tối",
    time: "18:00 - 22:00",
    color: "#722ed1",
  },
];

const scheduleTypes = [
  { value: "consultation", label: "Khám bệnh", color: "blue" },
  { value: "treatment", label: "Điều trị", color: "green" },
  { value: "surgery", label: "Phẫu thuật", color: "red" },
  { value: "emergency", label: "Cấp cứu", color: "orange" },
];

const rooms = [
  "Phòng 101",
  "Phòng 102",
  "Phòng 103",
  "Phòng 201",
  "Phòng 202",
  "Phòng 203",
  "Phòng phẫu thuật 1",
  "Phòng phẫu thuật 2",
  "Phòng cấp cứu 1",
  "Phòng cấp cứu 2",
];

const ScheduleManagement = () => {
  const [schedules, setSchedules] = useState(mockSchedules);
  const [doctors, setDoctors] = useState(mockDoctors);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("calendar");
  const [filterDoctor, setFilterDoctor] = useState("all");
  const [filterType, setFilterType] = useState("all");

  // Statistics
  const stats = {
    totalSchedules: schedules.length,
    todaySchedules: schedules.filter((s) =>
      dayjs(s.date).isSame(dayjs(), "day")
    ).length,
    pendingSchedules: schedules.filter((s) => s.status === "pending").length,
    utilization: Math.round(
      (schedules.reduce((sum, s) => sum + s.currentPatients, 0) /
        schedules.reduce((sum, s) => sum + s.patientLimit, 0)) *
        100
    ),
  };

  const showModal = (schedule = null, date = null) => {
    setCurrentSchedule(schedule);
    setIsModalVisible(true);
    if (schedule) {
      form.setFieldsValue({
        ...schedule,
        date: dayjs(schedule.date),
        timeRange: [
          dayjs(schedule.startTime, "HH:mm"),
          dayjs(schedule.endTime, "HH:mm"),
        ],
      });
    } else {
      form.resetFields();
      if (date) {
        form.setFieldsValue({ date: dayjs(date) });
      }
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const scheduleData = {
        ...values,
        date: values.date.format("YYYY-MM-DD"),
        startTime: values.timeRange[0].format("HH:mm"),
        endTime: values.timeRange[1].format("HH:mm"),
        doctorName: doctors.find((d) => d.id === values.doctorId)?.name,
        status: currentSchedule ? currentSchedule.status : "pending",
        currentPatients: currentSchedule ? currentSchedule.currentPatients : 0,
      };

      if (currentSchedule) {
        setSchedules((prev) =>
          prev.map((s) =>
            s.id === currentSchedule.id ? { ...s, ...scheduleData } : s
          )
        );
        message.success("Cập nhật lịch trình thành công!");
      } else {
        const newSchedule = {
          ...scheduleData,
          id: Date.now(),
        };
        setSchedules((prev) => [...prev, newSchedule]);
        message.success("Thêm lịch trình mới thành công!");
      }
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error("Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      setSchedules((prev) => prev.filter((s) => s.id !== id));
      message.success("Xóa lịch trình thành công!");
    } catch (error) {
      message.error("Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    setLoading(true);
    try {
      setSchedules((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status } : s))
      );
      message.success("Cập nhật trạng thái thành công!");
    } catch (error) {
      message.error("Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  // Calendar cell render
  const dateCellRender = (value) => {
    const daySchedules = schedules.filter((schedule) =>
      dayjs(schedule.date).isSame(value, "day")
    );

    return (
      <div style={{ minHeight: 80 }}>
        {daySchedules.map((schedule) => {
          const shift = shifts.find((s) => s.value === schedule.shift);
          const type = scheduleTypes.find((t) => t.value === schedule.type);
          return (
            <div
              key={schedule.id}
              style={{
                fontSize: 10,
                padding: "1px 4px",
                margin: "1px 0",
                borderRadius: 2,
                backgroundColor: shift?.color + "20",
                border: `1px solid ${shift?.color}`,
                cursor: "pointer",
              }}
              onClick={() => showModal(schedule)}
            >
              <div style={{ fontWeight: 600, color: shift?.color }}>
                {schedule.doctorName.split(" ").pop()}
              </div>
              <div style={{ color: "#666" }}>
                {schedule.startTime} - {type?.label}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Table columns
  const columns = [
    {
      title: "Ngày",
      dataIndex: "date",
      key: "date",
      render: (date) => formatDate(date),
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: "Bác sĩ",
      dataIndex: "doctorName",
      key: "doctorName",
      render: (name) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar size="small" icon={<UserOutlined />} />
          {name}
        </div>
      ),
    },
    {
      title: "Ca làm việc",
      key: "shift",
      render: (_, record) => {
        const shift = shifts.find((s) => s.value === record.shift);
        return (
          <Tag color={shift?.color}>
            {shift?.label} ({record.startTime} - {record.endTime})
          </Tag>
        );
      },
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      render: (type) => {
        const typeInfo = scheduleTypes.find((t) => t.value === type);
        return <Tag color={typeInfo?.color}>{typeInfo?.label}</Tag>;
      },
    },
    {
      title: "Phòng",
      dataIndex: "room",
      key: "room",
    },
    {
      title: "Bệnh nhân",
      key: "patients",
      render: (_, record) => (
        <div>
          <div>
            {record.currentPatients}/{record.patientLimit}
          </div>
          <div style={{ fontSize: 10, color: "#666" }}>
            {Math.round((record.currentPatients / record.patientLimit) * 100)}%
            sử dụng
          </div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_, record) => (
        <Select
          value={record.status}
          size="small"
          style={{ width: 100 }}
          onChange={(value) => handleStatusChange(record.id, value)}
        >
          <Option value="pending">
            <Tag color="orange">Chờ duyệt</Tag>
          </Option>
          <Option value="confirmed">
            <Tag color="green">Đã duyệt</Tag>
          </Option>
          <Option value="cancelled">
            <Tag color="red">Đã hủy</Tag>
          </Option>
        </Select>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => showModal(record)}
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa lịch trình này?"
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

  // Filter schedules
  const filteredSchedules = schedules.filter((schedule) => {
    const matchesDoctor =
      filterDoctor === "all" || schedule.doctorId.toString() === filterDoctor;
    const matchesType = filterType === "all" || schedule.type === filterType;
    return matchesDoctor && matchesType;
  });

  return (
    <div style={{ padding: "24px", background: "#f5f5f5", minHeight: "100vh" }}>
      {/* Header Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng lịch trình"
              value={stats.totalSchedules}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Lịch hôm nay"
              value={stats.todaySchedules}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Chờ duyệt"
              value={stats.pendingSchedules}
              prefix={<WarningOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tỷ lệ sử dụng"
              value={stats.utilization}
              suffix="%"
              prefix={<TeamOutlined />}
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
            <Select
              value={viewMode}
              onChange={setViewMode}
              style={{ width: 120 }}
            >
              <Option value="calendar">Lịch</Option>
              <Option value="table">Bảng</Option>
            </Select>

            <Select
              value={filterDoctor}
              onChange={setFilterDoctor}
              style={{ width: 150 }}
              placeholder="Lọc theo bác sĩ"
            >
              <Option value="all">Tất cả bác sĩ</Option>
              {doctors.map((doctor) => (
                <Option key={doctor.id} value={doctor.id.toString()}>
                  {doctor.name}
                </Option>
              ))}
            </Select>

            <Select
              value={filterType}
              onChange={setFilterType}
              style={{ width: 120 }}
              placeholder="Lọc theo loại"
            >
              <Option value="all">Tất cả</Option>
              {scheduleTypes.map((type) => (
                <Option key={type.value} value={type.value}>
                  {type.label}
                </Option>
              ))}
            </Select>
          </div>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
          >
            Thêm lịch trình
          </Button>
        </div>

        {viewMode === "calendar" ? (
          <Calendar
            dateCellRender={dateCellRender}
            onSelect={setSelectedDate}
            onPanelChange={(value, mode) => {
              setSelectedDate(value);
            }}
          />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredSchedules}
            rowKey="id"
            loading={loading}
            pagination={{
              total: filteredSchedules.length,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `Tổng ${total} lịch trình`,
            }}
          />
        )}
      </Card>

      {/* Add/Edit Schedule Modal */}
      <Modal
        title={currentSchedule ? "Chỉnh sửa lịch trình" : "Thêm lịch trình mới"}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Bác sĩ"
                name="doctorId"
                rules={[{ required: true, message: "Vui lòng chọn bác sĩ!" }]}
              >
                <Select placeholder="Chọn bác sĩ">
                  {doctors.map((doctor) => (
                    <Option key={doctor.id} value={doctor.id}>
                      <div>
                        <div>{doctor.name}</div>
                        <div style={{ fontSize: 12, color: "#666" }}>
                          {doctor.department} - {doctor.specialization}
                        </div>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Ngày"
                name="date"
                rules={[{ required: true, message: "Vui lòng chọn ngày!" }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Ca làm việc"
                name="shift"
                rules={[{ required: true, message: "Vui lòng chọn ca!" }]}
              >
                <Select placeholder="Chọn ca làm việc">
                  {shifts.map((shift) => (
                    <Option key={shift.value} value={shift.value}>
                      <Tag color={shift.color}>{shift.label}</Tag>
                      <span style={{ marginLeft: 8 }}>{shift.time}</span>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Thời gian cụ thể"
                name="timeRange"
                rules={[
                  { required: true, message: "Vui lòng chọn thời gian!" },
                ]}
              >
                <TimePicker.RangePicker
                  format="HH:mm"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Loại lịch trình"
                name="type"
                rules={[{ required: true, message: "Vui lòng chọn loại!" }]}
              >
                <Select placeholder="Chọn loại lịch trình">
                  {scheduleTypes.map((type) => (
                    <Option key={type.value} value={type.value}>
                      <Tag color={type.color}>{type.label}</Tag>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Phòng"
                name="room"
                rules={[{ required: true, message: "Vui lòng chọn phòng!" }]}
              >
                <Select placeholder="Chọn phòng">
                  {rooms.map((room) => (
                    <Option key={room} value={room}>
                      {room}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Giới hạn bệnh nhân"
            name="patientLimit"
            rules={[{ required: true, message: "Vui lòng nhập giới hạn!" }]}
          >
            <Input type="number" placeholder="Số lượng bệnh nhân tối đa" />
          </Form.Item>

          <div style={{ textAlign: "right" }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {currentSchedule ? "Cập nhật" : "Thêm mới"}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Today's Schedule Alert */}
      {stats.todaySchedules > 0 && (
        <Alert
          message="Lịch trình hôm nay"
          description={`Có ${
            stats.todaySchedules
          } lịch trình được sắp xếp cho hôm nay. ${
            stats.pendingSchedules > 0
              ? `${stats.pendingSchedules} lịch trình cần duyệt.`
              : ""
          }`}
          type="info"
          showIcon
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            width: 300,
            zIndex: 1000,
          }}
          closable
        />
      )}
    </div>
  );
};

export default ScheduleManagement;
