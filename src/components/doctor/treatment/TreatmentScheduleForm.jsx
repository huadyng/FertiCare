import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Select,
  DatePicker,
  TimePicker,
  Button,
  Table,
  Modal,
  Row,
  Col,
  Space,
  Tag,
  Typography,
  Input,
  InputNumber,
  Tooltip,
  Calendar,
  Badge,
  message,
  Divider,
  Tabs,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  MedicineBoxOutlined,
  ExperimentOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  treatmentScheduleAPI,
  resourceAPI,
} from "../../../services/treatmentAPI";

const { Option } = Select;
const { Title, Text } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

const TreatmentScheduleForm = ({
  patientId,
  patientInfo,
  treatmentPlan,
  onNext,
}) => {
  const [form] = Form.useForm();
  const [sessionForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [sessionModal, setSessionModal] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [staff, setStaff] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarView, setCalendarView] = useState(false);

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      const [roomsData, staffData, doctorsData] = await Promise.all([
        resourceAPI.getRooms(),
        resourceAPI.getStaff(),
        resourceAPI.getDoctors(),
      ]);
      setRooms(roomsData);
      setStaff(staffData);
      setDoctors(doctorsData);
    } catch (error) {
      console.error("Error loading resources:", error);
      message.error("Không thể tải danh sách phòng và nhân viên");
    }
  };

  // Danh sách loại buổi điều trị
  const sessionTypes = [
    {
      value: "siêu âm kiểm tra",
      label: "Siêu âm kiểm tra",
      icon: <ExperimentOutlined />,
      color: "blue",
    },
    {
      value: "siêu âm theo dõi",
      label: "Siêu âm theo dõi",
      icon: <ExperimentOutlined />,
      color: "cyan",
    },
    {
      value: "xét nghiệm máu",
      label: "Xét nghiệm máu",
      icon: <ExperimentOutlined />,
      color: "red",
    },
    {
      value: "tiêm thuốc",
      label: "Tiêm thuốc",
      icon: <MedicineBoxOutlined />,
      color: "green",
    },
    {
      value: "khám kiểm tra",
      label: "Khám kiểm tra",
      icon: <UserOutlined />,
      color: "orange",
    },
    {
      value: "lấy trứng",
      label: "Lấy trứng",
      icon: <ExperimentOutlined />,
      color: "purple",
    },
    {
      value: "chuyển phôi",
      label: "Chuyển phôi",
      icon: <ExperimentOutlined />,
      color: "magenta",
    },
    {
      value: "bơm tinh trùng",
      label: "Bơm tinh trùng (IUI)",
      icon: <ExperimentOutlined />,
      color: "volcano",
    },
  ];

  const handleAddSession = () => {
    setEditingSession(null);
    sessionForm.resetFields();
    if (selectedDate) {
      sessionForm.setFieldsValue({
        date: selectedDate,
      });
    }
    setSessionModal(true);
  };

  const handleEditSession = (session) => {
    setEditingSession(session);
    sessionForm.setFieldsValue({
      ...session,
      date: new Date(session.date),
      time: session.time,
    });
    setSessionModal(true);
  };

  const handleDeleteSession = (sessionId) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa buổi điều trị này?",
      onOk: () => {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        message.success("Đã xóa buổi điều trị");
      },
    });
  };

  const handleSaveSession = async (values) => {
    try {
      const sessionData = {
        id: editingSession?.id || Date.now().toString(),
        date: values.date.format("YYYY-MM-DD"),
        time: values.time.format("HH:mm"),
        type: values.type,
        room: values.room,
        staff: values.staff,
        duration: values.duration || 30,
        status: "scheduled",
        notes: values.notes,
        medications: values.medications || [],
        tests: values.tests || [],
      };

      if (editingSession) {
        setSessions((prev) =>
          prev.map((s) => (s.id === editingSession.id ? sessionData : s))
        );
        message.success("Đã cập nhật buổi điều trị");
      } else {
        setSessions((prev) => [...prev, sessionData]);
        message.success("Đã thêm buổi điều trị");
      }

      setSessionModal(false);
      sessionForm.resetFields();
      setEditingSession(null);
    } catch (error) {
      console.error("Error saving session:", error);
      message.error("Có lỗi xảy ra khi lưu buổi điều trị");
    }
  };

  const handleSaveSchedule = async () => {
    try {
      setLoading(true);

      const scheduleData = {
        patientId,
        planId: treatmentPlan?.id,
        sessions: sessions.map((session, index) => ({
          ...session,
          id: `session${index + 1}`,
        })),
        reminders: sessions.map((session, index) => ({
          sessionId: `session${index + 1}`,
          reminderTime: `${session.date} 20:00`,
          message: `Nhắc nhở: Bạn có lịch ${session.type} vào ${session.time} ngày ${session.date}`,
          sent: false,
        })),
      };

      await treatmentScheduleAPI.createTreatmentSchedule(scheduleData);
      message.success("Đã lưu lịch trình điều trị thành công");
      onNext && onNext(scheduleData);
    } catch (error) {
      console.error("Error saving schedule:", error);
      message.error("Có lỗi xảy ra khi lưu lịch trình");
    } finally {
      setLoading(false);
    }
  };

  // Columns cho bảng lịch trình
  const scheduleColumns = [
    {
      title: "Ngày",
      dataIndex: "date",
      key: "date",
      render: (date) => (
        <Space>
          <CalendarOutlined />
          {date}
        </Space>
      ),
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
    },
    {
      title: "Giờ",
      dataIndex: "time",
      key: "time",
      render: (time) => (
        <Space>
          <ClockCircleOutlined />
          {time}
        </Space>
      ),
    },
    {
      title: "Loại điều trị",
      dataIndex: "type",
      key: "type",
      render: (type) => {
        const sessionType = sessionTypes.find((t) => t.value === type);
        return (
          <Tag color={sessionType?.color} icon={sessionType?.icon}>
            {sessionType?.label || type}
          </Tag>
        );
      },
    },
    {
      title: "Phòng",
      dataIndex: "room",
      key: "room",
    },
    {
      title: "Nhân viên",
      dataIndex: "staff",
      key: "staff",
      render: (staffId) => {
        const staffMember = [...staff, ...doctors].find(
          (s) => s.id === staffId
        );
        return staffMember?.name || staffId;
      },
    },
    {
      title: "Thời gian (phút)",
      dataIndex: "duration",
      key: "duration",
      render: (duration) => `${duration} phút`,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "scheduled" ? "blue" : "green"}>
          {status === "scheduled" ? "Đã lên lịch" : "Hoàn thành"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (record) => (
        <Space>
          <Tooltip title="Sửa">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEditSession(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteSession(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Calendar data for rendering
  const getCalendarData = (value) => {
    const dateStr = value.format("YYYY-MM-DD");
    const dayTreatments = sessions.filter(
      (session) => session.date === dateStr
    );
    return dayTreatments;
  };

  const dateCellRender = (value) => {
    const treatments = getCalendarData(value);
    return (
      <div style={{ minHeight: "60px" }}>
        {treatments.map((treatment, index) => (
          <div key={index} style={{ marginBottom: "2px" }}>
            <Badge
              status={
                treatment.type.includes("siêu âm")
                  ? "processing"
                  : treatment.type.includes("xét nghiệm")
                  ? "error"
                  : treatment.type.includes("tiêm")
                  ? "success"
                  : "default"
              }
              text={
                <span style={{ fontSize: "10px" }}>
                  {treatment.time} - {treatment.type}
                </span>
              }
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ padding: "24px", background: "#f5f5f5", minHeight: "100vh" }}>
      <Card>
        <Title level={2}>Tạo Lịch Trình Điều Trị</Title>

        {/* Thông tin bệnh nhân và phác đồ */}
        <Card size="small" style={{ marginBottom: 24, background: "#f9f9f9" }}>
          <Row gutter={16}>
            <Col span={8}>
              <Text strong>Bệnh nhân:</Text> {patientInfo?.name}
              <br />
              <Text strong>Phác đồ:</Text> {treatmentPlan?.templateName}
            </Col>
            <Col span={8}>
              <Text strong>Loại điều trị:</Text>
              <Tag color={treatmentPlan?.type === "IVF" ? "blue" : "green"}>
                {treatmentPlan?.type}
              </Tag>
            </Col>
            <Col span={8}>
              <Text strong>Ngày bắt đầu dự kiến:</Text>{" "}
              {treatmentPlan?.estimatedStartDate}
            </Col>
          </Row>
        </Card>

        <Tabs defaultActiveKey="table">
          <TabPane tab="Danh sách buổi điều trị" key="table">
            <Row gutter={24}>
              <Col span={24}>
                <Card
                  title="Lịch trình điều trị"
                  extra={
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={handleAddSession}
                    >
                      Thêm buổi điều trị
                    </Button>
                  }
                >
                  <Table
                    dataSource={sessions.map((session, index) => ({
                      ...session,
                      key: index,
                    }))}
                    columns={scheduleColumns}
                    pagination={false}
                    size="small"
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Lịch calendar" key="calendar">
            <Card title="Lịch điều trị">
              <Calendar
                dateCellRender={dateCellRender}
                onSelect={(date) => {
                  setSelectedDate(date);
                  message.info(
                    `Đã chọn ngày ${date.format(
                      "DD/MM/YYYY"
                    )}. Bấm "Thêm buổi điều trị" để tạo lịch cho ngày này.`
                  );
                }}
              />
              <div style={{ marginTop: 16, textAlign: "center" }}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddSession}
                  disabled={!selectedDate}
                >
                  Thêm buổi điều trị cho ngày đã chọn
                </Button>
              </div>
            </Card>
          </TabPane>
        </Tabs>

        <div style={{ textAlign: "right", marginTop: 24 }}>
          <Space>
            <Button>Lưu nháp</Button>
            <Button
              type="primary"
              loading={loading}
              onClick={handleSaveSchedule}
              size="large"
              disabled={sessions.length === 0}
            >
              Lưu lịch trình & Hoàn thành
            </Button>
          </Space>
        </div>
      </Card>

      {/* Modal thêm/sửa buổi điều trị */}
      <Modal
        title={editingSession ? "Sửa buổi điều trị" : "Thêm buổi điều trị"}
        open={sessionModal}
        onCancel={() => setSessionModal(false)}
        onOk={() => sessionForm.submit()}
        width={800}
      >
        <Form form={sessionForm} layout="vertical" onFinish={handleSaveSession}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Ngày điều trị"
                name="date"
                rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Giờ điều trị"
                name="time"
                rules={[{ required: true, message: "Vui lòng chọn giờ" }]}
              >
                <TimePicker style={{ width: "100%" }} format="HH:mm" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Thời gian (phút)"
                name="duration"
                initialValue={30}
              >
                <InputNumber min={15} max={240} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Loại điều trị"
                name="type"
                rules={[
                  { required: true, message: "Vui lòng chọn loại điều trị" },
                ]}
              >
                <Select placeholder="Chọn loại điều trị">
                  {sessionTypes.map((type) => (
                    <Option key={type.value} value={type.value}>
                      <Space>
                        {type.icon}
                        {type.label}
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Phòng"
                name="room"
                rules={[{ required: true, message: "Vui lòng chọn phòng" }]}
              >
                <Select placeholder="Chọn phòng">
                  {rooms.map((room) => (
                    <Option key={room.id} value={room.name}>
                      {room.name} ({room.type})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Nhân viên thực hiện"
                name="staff"
                rules={[{ required: true, message: "Vui lòng chọn nhân viên" }]}
              >
                <Select placeholder="Chọn nhân viên">
                  <Option value="" disabled>
                    -- Bác sĩ --
                  </Option>
                  {doctors.map((doctor) => (
                    <Option key={doctor.id} value={doctor.id}>
                      {doctor.name} ({doctor.specialty})
                    </Option>
                  ))}
                  <Option value="" disabled>
                    -- Nhân viên khác --
                  </Option>
                  {staff.map((member) => (
                    <Option key={member.id} value={member.id}>
                      {member.name} ({member.role})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Thuốc cần chuẩn bị" name="medications">
                <Select mode="tags" placeholder="Nhập tên thuốc...">
                  <Option value="Gonal-F">Gonal-F</Option>
                  <Option value="Cetrotide">Cetrotide</Option>
                  <Option value="Utrogestan">Utrogestan</Option>
                  <Option value="HCG">HCG</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Xét nghiệm cần làm" name="tests">
                <Select mode="tags" placeholder="Nhập tên xét nghiệm...">
                  <Option value="E2">E2</Option>
                  <Option value="LH">LH</Option>
                  <Option value="P4">P4</Option>
                  <Option value="FSH">FSH</Option>
                  <Option value="beta HCG">beta HCG</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Ghi chú" name="notes">
            <TextArea rows={3} placeholder="Ghi chú cho buổi điều trị..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TreatmentScheduleForm;
