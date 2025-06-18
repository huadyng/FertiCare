import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Select,
  DatePicker,
  TimePicker,
  Space,
  Tag,
  Row,
  Col,
  Statistic,
  Alert,
  Tabs,
  Calendar,
  Badge,
  Progress,
  message,
  Popconfirm,
  Tooltip,
  Avatar,
  Input,
  Switch,
  Divider,
} from "antd";
import {
  TeamOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SwapOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { formatDate, formatCurrency } from "../../utils";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(customParseFormat);

const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

// Mock data
const mockStaff = [
  {
    id: 1,
    name: "Dr. Nguyễn Văn An",
    role: "doctor",
    department: "Khám tổng quát",
    maxHoursPerWeek: 40,
    currentHours: 32,
    status: "active",
  },
  {
    id: 2,
    name: "Dr. Trần Thị Bình",
    role: "doctor",
    department: "Điều trị chuyên sâu",
    maxHoursPerWeek: 40,
    currentHours: 38,
    status: "active",
  },
  {
    id: 3,
    name: "Y tá Lê Thị Cúc",
    role: "nurse",
    department: "Khám tổng quát",
    maxHoursPerWeek: 48,
    currentHours: 45,
    status: "active",
  },
  {
    id: 4,
    name: "Kỹ thuật viên Phạm Văn Dũng",
    role: "technician",
    department: "Chẩn đoán",
    maxHoursPerWeek: 40,
    currentHours: 35,
    status: "active",
  },
];

const mockShifts = [
  {
    id: 1,
    name: "Ca sáng - Khám tổng quát",
    department: "Khám tổng quát",
    date: "2024-01-15",
    startTime: "08:00",
    endTime: "12:00",
    requiredStaff: {
      doctor: 2,
      nurse: 3,
      technician: 1,
    },
    assignedStaff: [
      { id: 1, name: "Dr. Nguyễn Văn An", role: "doctor", status: "confirmed" },
      { id: 3, name: "Y tá Lê Thị Cúc", role: "nurse", status: "confirmed" },
    ],
    status: "understaffed",
    priority: "high",
  },
  {
    id: 2,
    name: "Ca chiều - Điều trị",
    department: "Điều trị chuyên sâu",
    date: "2024-01-15",
    startTime: "13:00",
    endTime: "17:00",
    requiredStaff: {
      doctor: 1,
      nurse: 2,
      technician: 1,
    },
    assignedStaff: [
      { id: 2, name: "Dr. Trần Thị Bình", role: "doctor", status: "confirmed" },
      { id: 3, name: "Y tá Lê Thị Cúc", role: "nurse", status: "pending" },
      {
        id: 4,
        name: "Kỹ thuật viên Phạm Văn Dũng",
        role: "technician",
        status: "confirmed",
      },
    ],
    status: "partially_staffed",
    priority: "medium",
  },
];

const shiftTemplates = [
  {
    id: 1,
    name: "Ca sáng tiêu chuẩn",
    startTime: "08:00",
    endTime: "12:00",
    requiredStaff: { doctor: 2, nurse: 3, technician: 1 },
  },
  {
    id: 2,
    name: "Ca chiều tiêu chuẩn",
    startTime: "13:00",
    endTime: "17:00",
    requiredStaff: { doctor: 2, nurse: 3, technician: 1 },
  },
  {
    id: 3,
    name: "Ca tối",
    startTime: "18:00",
    endTime: "22:00",
    requiredStaff: { doctor: 1, nurse: 2, technician: 1 },
  },
];

const departments = [
  "Khám tổng quát",
  "Điều trị chuyên sâu",
  "Phẫu thuật",
  "Chẩn đoán",
];
const staffRoles = [
  { value: "doctor", label: "Bác sĩ", color: "blue" },
  { value: "nurse", label: "Y tá", color: "green" },
  { value: "technician", label: "Kỹ thuật viên", color: "orange" },
  { value: "admin", label: "Hành chính", color: "purple" },
];

const ShiftManagement = () => {
  const [shifts, setShifts] = useState(mockShifts);
  const [staff, setStaff] = useState(mockStaff);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
  const [currentShift, setCurrentShift] = useState(null);
  const [form] = Form.useForm();
  const [assignForm] = Form.useForm();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [viewMode, setViewMode] = useState("table");

  // Statistics
  const stats = {
    totalShifts: shifts.length,
    understaffedShifts: shifts.filter((s) => s.status === "understaffed")
      .length,
    fullyStaffedShifts: shifts.filter((s) => s.status === "fully_staffed")
      .length,
    avgStaffingRate: Math.round(
      shifts.reduce((sum, shift) => {
        const assigned = shift.assignedStaff.length;
        const required = Object.values(shift.requiredStaff).reduce(
          (a, b) => a + b,
          0
        );
        return sum + (assigned / required) * 100;
      }, 0) / shifts.length || 0
    ),
  };

  const showModal = (shift = null) => {
    setCurrentShift(shift);
    setIsModalVisible(true);
    if (shift) {
      form.setFieldsValue({
        ...shift,
        date: dayjs(shift.date),
        timeRange: [
          dayjs(shift.startTime, "HH:mm"),
          dayjs(shift.endTime, "HH:mm"),
        ],
      });
    } else {
      form.resetFields();
    }
  };

  const showAssignModal = (shift) => {
    setCurrentShift(shift);
    setIsAssignModalVisible(true);
    assignForm.resetFields();
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const shiftData = {
        ...values,
        date: values.date.format("YYYY-MM-DD"),
        startTime: values.timeRange[0].format("HH:mm"),
        endTime: values.timeRange[1].format("HH:mm"),
        assignedStaff: currentShift ? currentShift.assignedStaff : [],
        status: "understaffed",
      };

      if (currentShift) {
        setShifts((prev) =>
          prev.map((s) =>
            s.id === currentShift.id ? { ...s, ...shiftData } : s
          )
        );
        message.success("Cập nhật ca làm việc thành công!");
      } else {
        const newShift = {
          ...shiftData,
          id: Date.now(),
        };
        setShifts((prev) => [...prev, newShift]);
        message.success("Thêm ca làm việc mới thành công!");
      }
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error("Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignStaff = async (values) => {
    setLoading(true);
    try {
      const selectedStaff = staff.find((s) => s.id === values.staffId);
      const newAssignment = {
        id: selectedStaff.id,
        name: selectedStaff.name,
        role: selectedStaff.role,
        status: "pending",
      };

      setShifts((prev) =>
        prev.map((s) =>
          s.id === currentShift.id
            ? {
                ...s,
                assignedStaff: [...s.assignedStaff, newAssignment],
                status: calculateShiftStatus(
                  [...s.assignedStaff, newAssignment],
                  s.requiredStaff
                ),
              }
            : s
        )
      );

      message.success("Phân công nhân viên thành công!");
      setIsAssignModalVisible(false);
      assignForm.resetFields();
    } catch (error) {
      message.error("Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  const calculateShiftStatus = (assignedStaff, requiredStaff) => {
    const assignedByRole = {};
    assignedStaff.forEach((staff) => {
      assignedByRole[staff.role] = (assignedByRole[staff.role] || 0) + 1;
    });

    let isFullyStaffed = true;
    let isPartiallyStaffed = false;

    Object.entries(requiredStaff).forEach(([role, required]) => {
      const assigned = assignedByRole[role] || 0;
      if (assigned < required) {
        isFullyStaffed = false;
      }
      if (assigned > 0) {
        isPartiallyStaffed = true;
      }
    });

    if (isFullyStaffed) return "fully_staffed";
    if (isPartiallyStaffed) return "partially_staffed";
    return "understaffed";
  };

  const removeStaffFromShift = (shiftId, staffId) => {
    setShifts((prev) =>
      prev.map((s) =>
        s.id === shiftId
          ? {
              ...s,
              assignedStaff: s.assignedStaff.filter(
                (staff) => staff.id !== staffId
              ),
              status: calculateShiftStatus(
                s.assignedStaff.filter((staff) => staff.id !== staffId),
                s.requiredStaff
              ),
            }
          : s
      )
    );
    message.success("Đã hủy phân công nhân viên");
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      setShifts((prev) => prev.filter((s) => s.id !== id));
      message.success("Xóa ca làm việc thành công!");
    } catch (error) {
      message.error("Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  const copyShift = (shift) => {
    const newShift = {
      ...shift,
      id: Date.now(),
      date: dayjs().add(1, "day").format("YYYY-MM-DD"),
      assignedStaff: [],
      status: "understaffed",
    };
    setShifts((prev) => [...prev, newShift]);
    message.success("Đã sao chép ca làm việc");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "fully_staffed":
        return "green";
      case "partially_staffed":
        return "orange";
      case "understaffed":
        return "red";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "fully_staffed":
        return "Đủ nhân sự";
      case "partially_staffed":
        return "Thiếu nhân sự";
      case "understaffed":
        return "Chưa có nhân sự";
      default:
        return "Không xác định";
    }
  };

  const columns = [
    {
      title: "Tên ca",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{text}</div>
          <div style={{ fontSize: 12, color: "#666" }}>{record.department}</div>
        </div>
      ),
    },
    {
      title: "Ngày",
      dataIndex: "date",
      key: "date",
      render: (date) => formatDate(date),
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: "Thời gian",
      key: "time",
      render: (_, record) => (
        <Tag color="blue">
          {record.startTime} - {record.endTime}
        </Tag>
      ),
    },
    {
      title: "Yêu cầu nhân sự",
      key: "required",
      render: (_, record) => (
        <div>
          {Object.entries(record.requiredStaff).map(([role, count]) => {
            const roleInfo = staffRoles.find((r) => r.value === role);
            return (
              <Tag key={role} color={roleInfo?.color} style={{ margin: "2px" }}>
                {roleInfo?.label}: {count}
              </Tag>
            );
          })}
        </div>
      ),
    },
    {
      title: "Đã phân công",
      key: "assigned",
      render: (_, record) => (
        <div>
          <div style={{ marginBottom: 8 }}>
            {record.assignedStaff.map((staff) => {
              const roleInfo = staffRoles.find((r) => r.value === staff.role);
              return (
                <div
                  key={staff.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 4,
                  }}
                >
                  <Avatar size="small" icon={<UserOutlined />} />
                  <span style={{ marginLeft: 8, fontSize: 12 }}>
                    {staff.name}
                  </span>
                  <Tag
                    size="small"
                    color={roleInfo?.color}
                    style={{ marginLeft: 8 }}
                  >
                    {roleInfo?.label}
                  </Tag>
                  <Button
                    size="small"
                    type="text"
                    danger
                    onClick={() => removeStaffFromShift(record.id, staff.id)}
                  >
                    ×
                  </Button>
                </div>
              );
            })}
          </div>
          <Button
            size="small"
            type="dashed"
            icon={<PlusOutlined />}
            onClick={() => showAssignModal(record)}
          >
            Phân công
          </Button>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_, record) => (
        <Tag color={getStatusColor(record.status)}>
          {getStatusText(record.status)}
        </Tag>
      ),
    },
    {
      title: "Ưu tiên",
      dataIndex: "priority",
      key: "priority",
      render: (priority) => (
        <Tag
          color={
            priority === "high"
              ? "red"
              : priority === "medium"
              ? "orange"
              : "green"
          }
        >
          {priority === "high"
            ? "Cao"
            : priority === "medium"
            ? "Trung bình"
            : "Thấp"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => showModal(record)}
            />
          </Tooltip>
          <Tooltip title="Sao chép">
            <Button
              icon={<CopyOutlined />}
              size="small"
              onClick={() => copyShift(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa ca làm việc này?"
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

  // Calendar cell render
  const dateCellRender = (value) => {
    const dayShifts = shifts.filter((shift) =>
      dayjs(shift.date).isSame(value, "day")
    );

    return (
      <div style={{ minHeight: 80 }}>
        {dayShifts.map((shift) => (
          <div
            key={shift.id}
            style={{
              fontSize: 10,
              padding: "2px 4px",
              margin: "1px 0",
              borderRadius: 2,
              backgroundColor: getStatusColor(shift.status) + "20",
              border: `1px solid ${getStatusColor(shift.status)}`,
              cursor: "pointer",
            }}
            onClick={() => showModal(shift)}
          >
            <div style={{ fontWeight: 600 }}>{shift.name}</div>
            <div style={{ color: "#666" }}>
              {shift.startTime} - {shift.endTime}
            </div>
            <div style={{ fontSize: 8 }}>
              {shift.assignedStaff.length}/
              {Object.values(shift.requiredStaff).reduce((a, b) => a + b, 0)}{" "}
              người
            </div>
          </div>
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
              title="Tổng ca làm việc"
              value={stats.totalShifts}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Thiếu nhân sự"
              value={stats.understaffedShifts}
              prefix={<WarningOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đủ nhân sự"
              value={stats.fullyStaffedShifts}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tỷ lệ phân công"
              value={stats.avgStaffingRate}
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
              <Option value="table">Bảng</Option>
              <Option value="calendar">Lịch</Option>
            </Select>
          </div>

          <Space>
            <Button
              icon={<SwapOutlined />}
              onClick={() =>
                message.info("Tính năng tự động phân công đang phát triển")
              }
            >
              Tự động phân công
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => showModal()}
            >
              Thêm ca làm việc
            </Button>
          </Space>
        </div>

        {viewMode === "table" ? (
          <Table
            columns={columns}
            dataSource={shifts}
            rowKey="id"
            loading={loading}
            pagination={{
              total: shifts.length,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `Tổng ${total} ca làm việc`,
            }}
          />
        ) : (
          <Calendar
            dateCellRender={dateCellRender}
            onSelect={setSelectedDate}
          />
        )}
      </Card>

      {/* Add/Edit Shift Modal */}
      <Modal
        title={currentShift ? "Chỉnh sửa ca làm việc" : "Thêm ca làm việc mới"}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Tên ca làm việc"
                name="name"
                rules={[{ required: true, message: "Vui lòng nhập tên ca!" }]}
              >
                <Input placeholder="Nhập tên ca làm việc" />
              </Form.Item>
            </Col>
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
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Ngày"
                name="date"
                rules={[{ required: true, message: "Vui lòng chọn ngày!" }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Thời gian"
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

          <Divider>Yêu cầu nhân sự</Divider>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Bác sĩ"
                name={["requiredStaff", "doctor"]}
                rules={[{ required: true, message: "Vui lòng nhập số lượng!" }]}
              >
                <Input type="number" min={0} placeholder="Số lượng bác sĩ" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Y tá"
                name={["requiredStaff", "nurse"]}
                rules={[{ required: true, message: "Vui lòng nhập số lượng!" }]}
              >
                <Input type="number" min={0} placeholder="Số lượng y tá" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Kỹ thuật viên"
                name={["requiredStaff", "technician"]}
                rules={[{ required: true, message: "Vui lòng nhập số lượng!" }]}
              >
                <Input
                  type="number"
                  min={0}
                  placeholder="Số lượng kỹ thuật viên"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Mức ưu tiên"
            name="priority"
            rules={[{ required: true, message: "Vui lòng chọn mức ưu tiên!" }]}
          >
            <Select placeholder="Chọn mức ưu tiên">
              <Option value="low">Thấp</Option>
              <Option value="medium">Trung bình</Option>
              <Option value="high">Cao</Option>
            </Select>
          </Form.Item>

          <div style={{ textAlign: "right" }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {currentShift ? "Cập nhật" : "Thêm mới"}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Assign Staff Modal */}
      <Modal
        title={`Phân công nhân viên - ${currentShift?.name}`}
        visible={isAssignModalVisible}
        onCancel={() => setIsAssignModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form form={assignForm} layout="vertical" onFinish={handleAssignStaff}>
          <Form.Item
            label="Chọn nhân viên"
            name="staffId"
            rules={[{ required: true, message: "Vui lòng chọn nhân viên!" }]}
          >
            <Select placeholder="Chọn nhân viên">
              {staff
                .filter(
                  (s) =>
                    !currentShift?.assignedStaff.some((as) => as.id === s.id)
                )
                .map((member) => {
                  const roleInfo = staffRoles.find(
                    (r) => r.value === member.role
                  );
                  const workloadPercent = Math.round(
                    (member.currentHours / member.maxHoursPerWeek) * 100
                  );
                  return (
                    <Option key={member.id} value={member.id}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <div>{member.name}</div>
                          <div style={{ fontSize: 12, color: "#666" }}>
                            <Tag size="small" color={roleInfo?.color}>
                              {roleInfo?.label}
                            </Tag>
                            {member.department}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 12 }}>
                            {member.currentHours}/{member.maxHoursPerWeek}h
                          </div>
                          <Progress
                            percent={workloadPercent}
                            size="small"
                            showInfo={false}
                            strokeColor={
                              workloadPercent > 90 ? "#ff4d4f" : "#52c41a"
                            }
                          />
                        </div>
                      </div>
                    </Option>
                  );
                })}
            </Select>
          </Form.Item>

          <div style={{ textAlign: "right" }}>
            <Space>
              <Button onClick={() => setIsAssignModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Phân công
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Alerts */}
      {stats.understaffedShifts > 0 && (
        <Alert
          message="Cảnh báo thiếu nhân sự"
          description={`Có ${stats.understaffedShifts} ca làm việc thiếu nhân sự. Vui lòng phân công thêm nhân viên.`}
          type="warning"
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

export default ShiftManagement;
