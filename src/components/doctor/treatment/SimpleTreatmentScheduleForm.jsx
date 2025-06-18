import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  DatePicker,
  TimePicker,
  Button,
  Typography,
  message,
  Row,
  Col,
  Select,
  Table,
  Tag,
  Alert,
  Descriptions,
  Space,
  Timeline,
  Divider,
  Statistic,
  Modal,
  Input,
  InputNumber,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  MedicineBoxOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  generateScheduleFromTemplate,
  getTemplateByType,
} from "./data/treatmentTemplates";

const { Title, Text } = Typography;
const { Option } = Select;

const SimpleTreatmentScheduleForm = ({
  patientId,
  patientInfo,
  treatmentPlan,
  examinationData,
  existingSchedule,
  isEditing,
  subStepsData,
  onNext,
  onSubStepComplete,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [generatedSchedule, setGeneratedSchedule] = useState([]);
  const [template, setTemplate] = useState(null);
  const [editingSession, setEditingSession] = useState(null);
  const [sessionModal, setSessionModal] = useState(false);
  const [sessionForm] = Form.useForm();

  // Doctor customization states
  const [doctorNotes, setDoctorNotes] = useState("");
  const [customSessions, setCustomSessions] = useState([]);
  const [scheduleAdjustments, setScheduleAdjustments] = useState({});

  useEffect(() => {
    // Load existing schedule if editing
    if (existingSchedule && isEditing) {
      setGeneratedSchedule(existingSchedule.sessions || []);
      setTemplate(existingSchedule.template);
      setDoctorNotes(existingSchedule.doctorNotes || "");
      setCustomSessions(existingSchedule.customSessions || []);
      setScheduleAdjustments(existingSchedule.adjustments || {});

      form.setFieldsValue({
        startDate: dayjs(existingSchedule.startDate),
        preferredTime: dayjs(
          existingSchedule.preferredTime || "09:00",
          "HH:mm"
        ),
      });

      message.info("📝 Đang chỉnh sửa lịch điều trị hiện có");
      return;
    }

    // Load template and generate schedule when treatmentPlan changes
    if (treatmentPlan?.template || treatmentPlan?.finalPlan) {
      // Use finalPlan if available (contains customizations), otherwise use template
      const templateData =
        treatmentPlan.finalPlan ||
        treatmentPlan.template ||
        treatmentPlan.originalTemplate;

      console.log("📋 Treatment plan received:", treatmentPlan);
      console.log("🔧 Template data being used:", templateData);

      setTemplate(templateData);

      // Generate initial schedule with default start date or from plan
      const defaultStartDate =
        treatmentPlan.estimatedStartDate ||
        dayjs().add(3, "days").format("YYYY-MM-DD");

      const schedule = generateScheduleFromTemplate(
        templateData,
        defaultStartDate
      );
      setGeneratedSchedule(schedule);

      form.setFieldsValue({
        startDate: dayjs(defaultStartDate),
        preferredTime: dayjs("09:00", "HH:mm"),
      });

      message.success(
        `✅ Đã tải phác đồ ${templateData?.type} với ${schedule.length} hoạt động điều trị`
      );
    } else {
      console.warn("⚠️ No treatment plan template found:", treatmentPlan);
      message.warning(
        "Chưa có phác đồ điều trị. Vui lòng hoàn thành bước lập phác đồ trước."
      );
    }
  }, [treatmentPlan, existingSchedule, isEditing, form]);

  const handleStartDateChange = (date) => {
    if (date && template) {
      const schedule = generateScheduleFromTemplate(
        template,
        date.format("YYYY-MM-DD")
      );
      setGeneratedSchedule(schedule);
    }
  };

  // Doctor customization functions
  const handleEditSession = (session) => {
    setEditingSession(session);
    sessionForm.setFieldsValue({
      activity: session.activity,
      date: dayjs(session.date),
      duration: session.duration,
      room: session.room,
      type: session.type,
      required: session.required,
    });
    setSessionModal(true);
  };

  const handleSaveSession = async (values) => {
    try {
      const updatedSession = {
        ...editingSession,
        activity: values.activity,
        date: values.date.format("YYYY-MM-DD"),
        duration: values.duration,
        room: values.room,
        type: values.type,
        required: values.required,
        modified: true, // Mark as doctor-modified
      };

      // Update the schedule
      setGeneratedSchedule((prev) =>
        prev.map((session) =>
          session.id === editingSession.id ? updatedSession : session
        )
      );

      // Track adjustments
      setScheduleAdjustments((prev) => ({
        ...prev,
        [editingSession.id]: {
          originalActivity: editingSession.activity,
          newActivity: values.activity,
          reason: values.reason || "Điều chỉnh của bác sĩ",
          modifiedAt: new Date().toISOString(),
        },
      }));

      message.success("Đã cập nhật buổi điều trị");
      setSessionModal(false);
      setEditingSession(null);
    } catch (error) {
      message.error("Có lỗi khi cập nhật buổi điều trị");
    }
  };

  const handleAddCustomSession = () => {
    const newSession = {
      id: `custom_${Date.now()}`,
      phaseId: "custom",
      phaseName: "Tùy chỉnh bác sĩ",
      date: dayjs().add(1, "day").format("YYYY-MM-DD"),
      activity: "",
      type: "consultation",
      duration: 30,
      room: "Phòng khám",
      required: true,
      completed: false,
      order: 999,
      custom: true,
    };

    setEditingSession(newSession);
    sessionForm.setFieldsValue({
      activity: "",
      date: dayjs().add(1, "day"),
      duration: 30,
      room: "Phòng khám",
      type: "consultation",
      required: true,
    });
    setSessionModal(true);
  };

  const handleDeleteSession = (sessionId) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc muốn xóa buổi điều trị này?",
      onOk: () => {
        setGeneratedSchedule((prev) =>
          prev.filter((session) => session.id !== sessionId)
        );
        message.success("Đã xóa buổi điều trị");
      },
    });
  };

  const generateDoctorSuggestions = () => {
    let suggestions = [];

    if (examinationData?.diagnosis?.includes("tuổi cao")) {
      suggestions.push(
        "💡 Bệnh nhân tuổi cao - cân nhắc tăng tần suất theo dõi"
      );
    }

    if (examinationData?.diagnosis?.includes("AMH thấp")) {
      suggestions.push("💡 AMH thấp - theo dõi sát phản ứng buồng trứng");
    }

    if (template?.type === "IVF") {
      suggestions.push("💡 IVF - có thể cần điều chỉnh thời gian lấy trứng");
    }

    return suggestions.join("\n");
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      const scheduleData = {
        ...values,
        patientId,
        treatmentPlanId: treatmentPlan?.id,
        templateId: template?.id,
        sessions: generatedSchedule,
        totalSessions: generatedSchedule.length,
        estimatedDuration: template?.estimatedDuration,
        createdBy: "doctor1",
        status: isEditing ? "updated" : "active",
        // Enhanced schedule data
        template: template,
        doctorNotes: doctorNotes,
        customSessions: customSessions,
        adjustments: scheduleAdjustments,
        startDate: values.startDate?.format("YYYY-MM-DD"),
        preferredTime: values.preferredTime?.format("HH:mm"),
        subStepsData: subStepsData,
        createdAt: isEditing
          ? existingSchedule?.createdAt
          : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        modificationCount:
          (existingSchedule?.modificationCount || 0) + (isEditing ? 1 : 0),
      };

      console.log("✅ Lịch điều trị hoàn chỉnh:", scheduleData);

      // Validate required fields
      if (!scheduleData.sessions || scheduleData.sessions.length === 0) {
        throw new Error("Lịch điều trị không được để trống");
      }

      // Enhanced success message
      const actionText = isEditing ? "Cập nhật" : "Tạo";
      message.success(
        `✅ ${actionText} lịch điều trị thành công - ${scheduleData.totalSessions} buổi điều trị`
      );

      // Auto-complete first sub-step if exists
      if (subStepsData?.subSteps?.length > 0 && !isEditing) {
        setTimeout(() => {
          onSubStepComplete &&
            onSubStepComplete(0, {
              title: "Lập lịch điều trị hoàn thành",
              completedAt: new Date().toISOString(),
            });
        }, 1000);
      }

      onNext && onNext(scheduleData);
    } catch (error) {
      console.error("❌ Lỗi lưu lịch điều trị:", error);
      message.error(error.message || "Có lỗi xảy ra khi lưu lịch điều trị");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSubStep = (subStepIndex) => {
    Modal.confirm({
      title: "Hoàn thành giai đoạn",
      content: `Xác nhận hoàn thành giai đoạn: ${subStepsData?.subSteps[subStepIndex]?.title}?`,
      okText: "Hoàn thành",
      cancelText: "Hủy",
      onOk: () => {
        onSubStepComplete &&
          onSubStepComplete(subStepIndex, {
            title: subStepsData.subSteps[subStepIndex].title,
            completedAt: new Date().toISOString(),
            notes: `Hoàn thành bởi bác sĩ`,
          });
      },
    });
  };

  // Columns for schedule table
  const scheduleColumns = [
    {
      title: "Ngày",
      dataIndex: "date",
      key: "date",
      render: (date) => (
        <Space direction="vertical" size="small">
          <Text strong>{dayjs(date).format("DD/MM/YYYY")}</Text>
          <Text type="secondary">{dayjs(date).format("dddd")}</Text>
        </Space>
      ),
      width: 120,
    },
    {
      title: "Giai đoạn",
      dataIndex: "phaseName",
      key: "phaseName",
      render: (text, record) => (
        <Space>
          <Tag color={record.custom ? "orange" : "blue"}>
            {record.order}. {text}
          </Tag>
          {record.modified && (
            <Tag color="green" size="small">
              Đã sửa
            </Tag>
          )}
          {record.custom && (
            <Tag color="purple" size="small">
              Tùy chỉnh
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: "Hoạt động",
      dataIndex: "activity",
      key: "activity",
      render: (text, record) => (
        <Space direction="vertical" size="small">
          <Text>{text}</Text>
          <Space>
            <Tag icon={<ClockCircleOutlined />}>{record.duration} phút</Tag>
            <Tag color={record.required ? "red" : "green"}>
              {record.required ? "Bắt buộc" : "Tùy chọn"}
            </Tag>
          </Space>
          {scheduleAdjustments[record.id] && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              Sửa từ: {scheduleAdjustments[record.id].originalActivity}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      render: (type) => {
        const typeMap = {
          consultation: { color: "blue", text: "Tư vấn" },
          test: { color: "orange", text: "Xét nghiệm" },
          ultrasound: { color: "purple", text: "Siêu âm" },
          injection: { color: "red", text: "Tiêm thuốc" },
          procedure: { color: "green", text: "Thủ thuật" },
          laboratory: { color: "cyan", text: "Xét nghiệm lab" },
        };
        const config = typeMap[type] || { color: "default", text: type };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "Phòng",
      dataIndex: "room",
      key: "room",
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditSession(record)}
            type="link"
            title="Chỉnh sửa buổi điều trị"
          />
          <Button
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteSession(record.id)}
            type="link"
            danger
            title="Xóa buổi điều trị"
          />
        </Space>
      ),
    },
  ];

  // Generate timeline data
  const timelineData =
    template?.phases.map((phase, index) => ({
      color: index % 2 === 0 ? "blue" : "green",
      children: (
        <div>
          <Title level={5}>{phase.name}</Title>
          <Text type="secondary">{phase.duration}</Text>
          <div style={{ marginTop: 8 }}>
            <Text>{phase.notes}</Text>
          </div>
        </div>
      ),
    })) || [];

  return (
    <div>
      <Card>
        <Title level={3}>Lập Lịch Điều Trị Theo Phác Đồ</Title>

        {!treatmentPlan || !template ? (
          <Alert
            message="Chưa có phác đồ điều trị"
            description="Vui lòng hoàn thành bước lập phác đồ điều trị trước khi lập lịch"
            type="warning"
            showIcon
            action={
              <Button
                type="primary"
                onClick={() => {
                  console.log("Current treatment plan:", treatmentPlan);
                  message.info("Vui lòng quay lại bước lập phác đồ");
                }}
              >
                Quay lại lập phác đồ
              </Button>
            }
          />
        ) : (
          <>
            <Alert
              message="Lịch trình được tự động tạo dựa trên phác đồ điều trị đã chọn"
              description={
                <div>
                  <Text strong>Phác đồ:</Text>{" "}
                  {treatmentPlan?.templateName ||
                    template?.name ||
                    "Chưa có phác đồ"}
                  <br />
                  <Text strong>Tổng thời gian:</Text>{" "}
                  {template?.estimatedDuration || "N/A"}
                  {treatmentPlan?.customizedPhases > 0 && (
                    <>
                      <br />
                      <Text strong style={{ color: "#ff7a00" }}>
                        ⚙️ Đã tùy chỉnh {treatmentPlan.customizedPhases} giai
                        đoạn
                      </Text>
                    </>
                  )}
                </div>
              }
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={8}>
                <Text strong>Bệnh nhân: </Text>
                <Text>{patientInfo?.name || "Không có thông tin"}</Text>
              </Col>
              <Col span={8}>
                <Text strong>Loại điều trị: </Text>
                <Tag color={template?.type === "IVF" ? "blue" : "green"}>
                  {template?.type || "N/A"}
                </Tag>
                {treatmentPlan?.treatmentType &&
                  treatmentPlan.treatmentType !== template?.type && (
                    <Tag color="orange">
                      Đã cập nhật: {treatmentPlan.treatmentType}
                    </Tag>
                  )}
              </Col>
              <Col span={8}>
                <Text strong>Tỷ lệ thành công: </Text>
                <Text>
                  {template?.successRate || treatmentPlan?.successRate || "N/A"}
                  %
                </Text>
              </Col>
            </Row>

            {template && (
              <>
                <Row gutter={16} style={{ marginBottom: 16 }}>
                  <Col span={6}>
                    <Statistic
                      title="Tổng giai đoạn"
                      value={template.phases.length}
                      suffix="giai đoạn"
                      prefix={<CalendarOutlined />}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="Tổng hoạt động"
                      value={generatedSchedule.length}
                      suffix="hoạt động"
                      prefix={<CheckCircleOutlined />}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="Thời gian dự kiến"
                      value={template.estimatedDuration}
                      prefix={<ClockCircleOutlined />}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="Chi phí dự kiến"
                      value={template.cost}
                      prefix={<MedicineBoxOutlined />}
                    />
                  </Col>
                </Row>

                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSubmit}
                  initialValues={{
                    startDate: dayjs().add(3, "days"),
                    preferredTime: dayjs("09:00", "HH:mm"),
                  }}
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        label="Ngày bắt đầu điều trị"
                        name="startDate"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng chọn ngày bắt đầu",
                          },
                        ]}
                      >
                        <DatePicker
                          style={{ width: "100%" }}
                          placeholder="Chọn ngày bắt đầu điều trị"
                          onChange={handleStartDateChange}
                          disabledDate={(current) =>
                            current && current < dayjs().startOf("day")
                          }
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label="Giờ hẹn ưu tiên"
                        name="preferredTime"
                        tooltip="Giờ mặc định cho các buổi hẹn, có thể điều chỉnh từng buổi riêng"
                      >
                        <TimePicker
                          style={{ width: "100%" }}
                          format="HH:mm"
                          placeholder="Chọn giờ hẹn ưu tiên"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item label="Ghi chú đặc biệt" name="notes">
                    <Select
                      mode="multiple"
                      placeholder="Chọn ghi chú đặc biệt"
                      allowClear
                    >
                      <Option value="morning_preferred">
                        Ưu tiên buổi sáng
                      </Option>
                      <Option value="afternoon_preferred">
                        Ưu tiên buổi chiều
                      </Option>
                      <Option value="weekend_available">
                        Có thể cuối tuần
                      </Option>
                      <Option value="flexible_time">Thời gian linh hoạt</Option>
                      <Option value="urgent">Khẩn cấp</Option>
                    </Select>
                  </Form.Item>

                  <Divider>Lịch Trình Chi Tiết</Divider>

                  {/* Doctor Controls */}
                  <Card
                    title="🔧 Điều chỉnh bác sĩ"
                    size="small"
                    style={{ marginBottom: 16 }}
                  >
                    <Space>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAddCustomSession}
                      >
                        Thêm buổi tùy chỉnh
                      </Button>
                      <Button
                        icon={<CalendarOutlined />}
                        onClick={() => {
                          const suggestions = generateDoctorSuggestions();
                          if (suggestions) {
                            setDoctorNotes(suggestions);
                          }
                        }}
                      >
                        Gợi ý điều chỉnh
                      </Button>
                      <Text type="secondary">
                        {Object.keys(scheduleAdjustments).length > 0 &&
                          `Đã điều chỉnh ${
                            Object.keys(scheduleAdjustments).length
                          } buổi điều trị`}
                      </Text>
                    </Space>
                  </Card>

                  {/* Doctor Suggestions */}
                  {(doctorNotes || generateDoctorSuggestions()) && (
                    <Alert
                      message="💡 Gợi ý điều chỉnh cho bác sĩ"
                      description={
                        <div>
                          {generateDoctorSuggestions() && (
                            <pre
                              style={{
                                whiteSpace: "pre-line",
                                fontFamily: "inherit",
                              }}
                            >
                              {generateDoctorSuggestions()}
                            </pre>
                          )}
                          <Input.TextArea
                            placeholder="Thêm ghi chú của bác sĩ..."
                            value={doctorNotes}
                            onChange={(e) => setDoctorNotes(e.target.value)}
                            rows={3}
                            style={{ marginTop: 8 }}
                          />
                        </div>
                      }
                      type="info"
                      showIcon
                      style={{ marginBottom: 16 }}
                    />
                  )}

                  {/* Sub-steps progress integration */}
                  {subStepsData?.subSteps?.length > 0 && (
                    <Card
                      title={
                        <Space>
                          <CalendarOutlined />
                          Tiến trình giai đoạn điều trị
                          <Tag color="blue">
                            {subStepsData.completedSubSteps.length}/
                            {subStepsData.subSteps.length} hoàn thành
                          </Tag>
                        </Space>
                      }
                      style={{ marginBottom: 16 }}
                      size="small"
                    >
                      <Row gutter={16}>
                        <Col span={16}>
                          <Timeline size="small">
                            {subStepsData.subSteps.map((subStep, index) => (
                              <Timeline.Item
                                key={index}
                                color={
                                  subStepsData.completedSubSteps.includes(index)
                                    ? "green"
                                    : index === subStepsData.currentSubStep
                                    ? "blue"
                                    : "gray"
                                }
                                dot={
                                  subStepsData.completedSubSteps.includes(
                                    index
                                  ) ? (
                                    <CheckCircleOutlined
                                      style={{ color: "green" }}
                                    />
                                  ) : index === subStepsData.currentSubStep ? (
                                    <PlayCircleOutlined
                                      style={{ color: "blue" }}
                                    />
                                  ) : (
                                    <ClockCircleOutlined
                                      style={{ color: "gray" }}
                                    />
                                  )
                                }
                              >
                                <div>
                                  <Space>
                                    <Text
                                      strong={
                                        index === subStepsData.currentSubStep
                                      }
                                      type={
                                        subStepsData.completedSubSteps.includes(
                                          index
                                        )
                                          ? "success"
                                          : undefined
                                      }
                                    >
                                      {subStep.title}
                                    </Text>
                                    {subStepsData.completedSubSteps.includes(
                                      index
                                    ) && (
                                      <Tag color="green" size="small">
                                        Hoàn thành
                                      </Tag>
                                    )}
                                    {index === subStepsData.currentSubStep && (
                                      <Tag color="blue" size="small">
                                        Hiện tại
                                      </Tag>
                                    )}
                                  </Space>
                                  <br />
                                  <Text
                                    type="secondary"
                                    style={{ fontSize: "12px" }}
                                  >
                                    {subStep.description} • {subStep.duration}
                                  </Text>
                                </div>
                              </Timeline.Item>
                            ))}
                          </Timeline>
                        </Col>
                        <Col span={8}>
                          <Space direction="vertical" style={{ width: "100%" }}>
                            <Statistic
                              title="Giai đoạn hiện tại"
                              value={
                                subStepsData.subSteps[
                                  subStepsData.currentSubStep
                                ]?.title
                              }
                              prefix={<PlayCircleOutlined />}
                            />
                            <Button
                              type="primary"
                              onClick={() =>
                                handleCompleteSubStep(
                                  subStepsData.currentSubStep
                                )
                              }
                              disabled={subStepsData.completedSubSteps.includes(
                                subStepsData.currentSubStep
                              )}
                              style={{ width: "100%" }}
                            >
                              ✅ Hoàn thành giai đoạn này
                            </Button>
                            <Text
                              type="secondary"
                              style={{
                                fontSize: "12px",
                                textAlign: "center",
                                display: "block",
                              }}
                            >
                              Hoàn thành giai đoạn để tiếp tục quy trình
                            </Text>
                          </Space>
                        </Col>
                      </Row>
                    </Card>
                  )}

                  {/* Timeline Overview */}
                  <Row gutter={16}>
                    <Col span={8}>
                      <Card title="📅 Tổng quan giai đoạn" size="small">
                        <Timeline items={timelineData} />
                      </Card>
                    </Col>
                    <Col span={16}>
                      <Card title="📋 Lịch trình chi tiết" size="small">
                        <Table
                          columns={scheduleColumns}
                          dataSource={generatedSchedule}
                          pagination={false}
                          size="small"
                          rowKey="id"
                          scroll={{ y: 400 }}
                        />
                      </Card>
                    </Col>
                  </Row>

                  <Form.Item style={{ marginTop: 24 }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      size="large"
                      style={{ marginRight: 8 }}
                    >
                      Xác Nhận Lịch Điều Trị
                    </Button>
                    <Button size="large">Hủy</Button>
                  </Form.Item>
                </Form>
              </>
            )}
          </>
        )}

        {/* Session Edit Modal */}
        <Modal
          title={
            editingSession?.custom
              ? "Thêm buổi tùy chỉnh"
              : "Chỉnh sửa buổi điều trị"
          }
          open={sessionModal}
          onOk={() => sessionForm.submit()}
          onCancel={() => {
            setSessionModal(false);
            setEditingSession(null);
          }}
          width={800}
          okText="Lưu thay đổi"
          cancelText="Hủy"
        >
          <Form
            form={sessionForm}
            layout="vertical"
            onFinish={
              editingSession?.custom
                ? (values) => {
                    // Handle adding custom session
                    const newSession = {
                      ...editingSession,
                      activity: values.activity,
                      date: values.date.format("YYYY-MM-DD"),
                      duration: values.duration,
                      room: values.room,
                      type: values.type,
                      required: values.required,
                    };

                    setGeneratedSchedule((prev) => [...prev, newSession]);
                    message.success("Đã thêm buổi điều trị tùy chỉnh");
                    setSessionModal(false);
                    setEditingSession(null);
                  }
                : handleSaveSession
            }
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Tên hoạt động"
                  name="activity"
                  rules={[
                    { required: true, message: "Vui lòng nhập tên hoạt động" },
                  ]}
                >
                  <Input placeholder="VD: Siêu âm kiểm tra đặc biệt" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Ngày thực hiện"
                  name="date"
                  rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
                >
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  label="Thời gian (phút)"
                  name="duration"
                  rules={[
                    { required: true, message: "Vui lòng nhập thời gian" },
                  ]}
                >
                  <InputNumber min={5} max={480} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Phòng"
                  name="room"
                  rules={[{ required: true, message: "Vui lòng chọn phòng" }]}
                >
                  <Select>
                    <Option value="Phòng khám">Phòng khám</Option>
                    <Option value="Phòng siêu âm">Phòng siêu âm</Option>
                    <Option value="Phòng xét nghiệm">Phòng xét nghiệm</Option>
                    <Option value="Phòng thủ thuật">Phòng thủ thuật</Option>
                    <Option value="Phòng lab">Phòng lab</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Loại hoạt động"
                  name="type"
                  rules={[{ required: true, message: "Vui lòng chọn loại" }]}
                >
                  <Select>
                    <Option value="consultation">Tư vấn</Option>
                    <Option value="test">Xét nghiệm</Option>
                    <Option value="ultrasound">Siêu âm</Option>
                    <Option value="injection">Tiêm thuốc</Option>
                    <Option value="procedure">Thủ thuật</Option>
                    <Option value="laboratory">Lab</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Mức độ quan trọng" name="required">
                  <Select>
                    <Option value={true}>Bắt buộc</Option>
                    <Option value={false}>Tùy chọn</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Lý do thay đổi" name="reason">
                  <Input placeholder="VD: Điều chỉnh theo tình trạng bệnh nhân" />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default SimpleTreatmentScheduleForm;
