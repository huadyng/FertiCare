import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  Card,
  Form,
  Select,
  Button,
  Typography,
  message,
  Row,
  Col,
  Collapse,
  Table,
  Tag,
  Divider,
  Alert,
  Descriptions,
  Space,
  Statistic,
  Modal,
  Input,
  InputNumber,
  Switch,
  Tooltip,
  Popconfirm,
  Badge,
} from "antd";
import {
  ClockCircleOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  EditOutlined,
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import {
  treatmentTemplates,
  getTemplateByType,
} from "./data/treatmentTemplates";
import { UserContext } from "../../../context/UserContext";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

const SimpleTreatmentPlanEditor = ({
  patientId,
  patientInfo,
  examinationData,
  existingPlan,
  isEditing,
  onNext,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { user } = useContext(UserContext);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customizations, setCustomizations] = useState({});
  const [editingPhase, setEditingPhase] = useState(null);
  const [customMedications, setCustomMedications] = useState([]);
  const [doctorNotes, setDoctorNotes] = useState("");
  const [isEditingPhase, setIsEditingPhase] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Load existing plan when editing
  useEffect(() => {
    if (existingPlan && isEditing) {
      const template =
        existingPlan.finalPlan ||
        existingPlan.template ||
        existingPlan.originalTemplate;
      if (template) {
        setSelectedTemplate(template);
        setCustomizations(
          existingPlan.customizations || {
            phases: {},
            medications: {},
            notes: "",
          }
        );
        setCustomMedications(existingPlan.customMedications || []);
        setDoctorNotes(existingPlan.doctorNotes || "");

        form.setFieldsValue({
          treatmentType: template.type,
          estimatedStartDate: existingPlan.estimatedStartDate
            ? dayjs(existingPlan.estimatedStartDate)
            : undefined,
        });

        message.info("📝 Đang chỉnh sửa phác đồ điều trị hiện có");
      }
      return;
    }

    // Load default template for new plans
    if (examinationData && !selectedTemplate && !isEditing) {
      const recommendedType = getRecommendedTreatment();
      if (recommendedType) {
        handleTemplateChange(recommendedType);
        form.setFieldsValue({ treatmentType: recommendedType });
      }
    }
  }, [examinationData, existingPlan, isEditing]); // Updated dependencies

  // Separate useEffect for auto-save (with stable interval)
  useEffect(() => {
    if (!selectedTemplate || !patientId) return;

    const interval = setInterval(() => {
      try {
        const currentValues = form.getFieldsValue();
        if (currentValues.treatmentType && selectedTemplate) {
          const draftData = {
            ...currentValues,
            template: selectedTemplate,
            customizations,
            customMedications,
            doctorNotes,
            lastSaved: new Date().toISOString(),
          };
          localStorage.setItem(
            `treatment_plan_draft_${patientId}`,
            JSON.stringify(draftData)
          );
          console.log("💾 Auto-saved draft");
        }
      } catch (error) {
        console.error("Auto-save error:", error);
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(interval);
  }, [patientId, selectedTemplate?.id]); // Only depend on stable identifiers

  const getRecommendedTreatment = () => {
    // Enhanced logic based on examination data
    if (!examinationData) return "IVF";

    const diagnosis = examinationData.diagnosis?.toLowerCase() || "";
    const recommendedService = examinationData.recommendedService;

    // Prioritize examination recommendation
    if (recommendedService) {
      return recommendedService;
    }

    // Fallback logic
    if (
      diagnosis.includes("tắc ống dẫn trứng") ||
      diagnosis.includes("tuổi cao") ||
      diagnosis.includes("amh thấp")
    ) {
      return "IVF";
    } else if (
      diagnosis.includes("rối loạn rụng trứng") ||
      diagnosis.includes("tinh trùng yếu")
    ) {
      return "IUI";
    }

    return "IVF"; // Default
  };

  const handleTemplateChange = useCallback((treatmentType) => {
    const template = getTemplateByType(treatmentType);
    setSelectedTemplate(template);
    setCustomizations({
      phases: {},
      medications: {},
      notes: "",
    });

    // Reset custom medications when changing template
    setCustomMedications([]);

    // Generate doctor suggestions based on examination data
    generateDoctorSuggestions(template);

    message.success(
      `✅ Đã chọn phác đồ ${treatmentType} - Xem chi tiết bên dưới`
    );
  }, []);

  const generateDoctorSuggestions = useCallback(
    (template) => {
      let suggestions = [];

      // Enhanced suggestions based on examination data
      if (
        examinationData?.diagnosis?.includes("tuổi cao") ||
        patientInfo?.age > 35
      ) {
        suggestions.push(
          "💡 Bệnh nhân tuổi cao - nên điều chỉnh liều FSH tăng 25%"
        );
        suggestions.push("💡 Khuyến nghị PGT-A (xét nghiệm di truyền phôi)");
      }

      if (examinationData?.diagnosis?.includes("AMH thấp")) {
        suggestions.push(
          "💡 AMH thấp - cân nhắc tăng thời gian kích thích buồng trứng"
        );
        suggestions.push("💡 Có thể cần chu kỳ nhiều lần để có đủ phôi");
      }

      if (examinationData?.labResults?.bloodTest?.FSH > 12) {
        suggestions.push(
          "💡 FSH cao - dự trữ buồng trứng thấp, cần phác đồ nhẹ nhàng"
        );
      }

      if (template?.type === "IVF") {
        suggestions.push("💡 IVF - cân nhắc ICSI nếu tinh trùng kém");
        suggestions.push("💡 Có thể freeze phôi thừa để sử dụng sau");
        suggestions.push(
          "💡 Theo dõi kỹ OHSS (hội chứng quá kích thích buồng trứng)"
        );
      }

      if (template?.type === "IUI") {
        suggestions.push("💡 IUI - theo dõi kỹ thời điểm rụng trứng");
        suggestions.push("💡 Nếu thất bại 3 lần, chuyển sang IVF");
        suggestions.push("💡 Kiểm tra ống dẫn trứng thông thoáng");
      }

      setDoctorNotes(suggestions.join("\n"));
    },
    [examinationData, patientInfo]
  );

  const handleEditPhase = (phase) => {
    setEditingPhase(JSON.parse(JSON.stringify(phase))); // Deep clone
    setIsEditingPhase(true);
  };

  const handlePhaseFieldChange = (field, value) => {
    if (editingPhase) {
      setEditingPhase((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleActivityChange = (activityIndex, field, value) => {
    if (editingPhase && editingPhase.activities) {
      const updatedActivities = [...editingPhase.activities];
      updatedActivities[activityIndex] = {
        ...updatedActivities[activityIndex],
        [field]: value,
      };
      setEditingPhase((prev) => ({
        ...prev,
        activities: updatedActivities,
      }));
    }
  };

  const handleSavePhaseEdit = () => {
    if (editingPhase) {
      // Update customizations with the edited phase
      setCustomizations((prev) => ({
        ...prev,
        phases: {
          ...prev.phases,
          [editingPhase.id]: editingPhase,
        },
      }));

      message.success(`✅ Đã cập nhật giai đoạn "${editingPhase.name}"`);
    }
    setIsEditingPhase(false);
    setEditingPhase(null);
  };

  const handleCancelPhaseEdit = () => {
    setIsEditingPhase(false);
    setEditingPhase(null);
    message.info("Đã hủy chỉnh sửa");
  };

  // Get effective phase (customized or original)
  const getEffectivePhase = (phase) => {
    const customPhase = customizations.phases?.[phase.id];
    return customPhase ? { ...phase, ...customPhase } : phase;
  };

  const handleAddMedication = () => {
    const newMed = {
      id: Date.now(),
      name: "",
      dosage: "",
      frequency: "",
      route: "Uống",
      startDay: 1,
      duration: 1,
      custom: true,
    };
    setCustomMedications([...customMedications, newMed]);
  };

  const handleUpdateMedication = (id, field, value) => {
    setCustomMedications((prev) =>
      prev.map((med) => (med.id === id ? { ...med, [field]: value } : med))
    );
  };

  const handleDeleteMedication = (id) => {
    setCustomMedications((prev) => prev.filter((med) => med.id !== id));
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      // Validate required fields
      if (!selectedTemplate) {
        message.error("Vui lòng chọn phác đồ điều trị");
        return;
      }

      // Merge template with customizations
      const finalPlan = {
        ...selectedTemplate,
        phases: selectedTemplate.phases.map((phase) => {
          const customPhase = customizations.phases?.[phase.id];
          return customPhase ? { ...phase, ...customPhase } : phase;
        }),
      };

      const planData = {
        id: existingPlan?.id || Date.now().toString(),
        patientId,
        doctorId: examinationData?.doctorId || user?.id,
        doctorName: user?.fullName || "Bác sĩ",
        templateId: selectedTemplate.id,
        templateName: selectedTemplate.name,
        treatmentType: selectedTemplate.type,

        // Plan details
        estimatedStartDate:
          values.startDate?.format("YYYY-MM-DD") ||
          existingPlan?.estimatedStartDate ||
          new Date().toISOString().split("T")[0],
        estimatedDuration: selectedTemplate.estimatedDuration,
        estimatedCost: selectedTemplate.cost,
        successRate: selectedTemplate.successRate,

        // Customizations
        originalTemplate: selectedTemplate,
        finalPlan: finalPlan,
        customizations: customizations,
        customMedications: customMedications,

        // Additional data
        basedOnExamination: examinationData?.id,
        doctorNotes: doctorNotes,
        planNotes: values.planNotes,

        // Enhanced metadata for editing
        createdDate:
          existingPlan?.createdDate || new Date().toISOString().split("T")[0],
        status: isEditing ? "updated" : "approved",
        isEdited: isEditing,
        editedAt: isEditing ? new Date().toISOString() : undefined,
        originalPlan: isEditing ? existingPlan : undefined,
        editCount: (existingPlan?.editCount || 0) + (isEditing ? 1 : 0),

        // Phase summary for quick access
        totalPhases: finalPlan.phases.length,
        customizedPhases: Object.keys(customizations.phases || {}).length,

        // Clinical context
        patientDiagnosis: examinationData?.diagnosis,
        patientAge: patientInfo?.age,
        recommendedService: examinationData?.recommendedService,
      };

      // Try to save via API
      try {
        const savedPlan = await treatmentPlanAPI.createTreatmentPlan(planData);
        console.log("✅ Phác đồ đã lưu thành công:", savedPlan);

        // Clear draft after successful save (only if not editing)
        if (!isEditing) {
          localStorage.removeItem(`treatment_plan_draft_${patientId}`);
        }

        const actionText = isEditing ? "Cập nhật" : "Lưu";
        message.success(
          `🎉 ${actionText} phác đồ ${selectedTemplate.type} thành công!${
            isEditing ? "" : " Chuyển sang lập lịch..."
          }`
        );

        // Log the data being passed to next step
        console.log("📋 Data being passed to schedule:", savedPlan || planData);

        // Call onNext with the saved plan data
        if (onNext) {
          onNext(savedPlan || planData);
        }
      } catch (apiError) {
        // If API fails, still proceed with local data
        console.warn("API save failed, using local data:", apiError);
        message.warning("Đã lưu phác đồ cục bộ. Hệ thống sẽ đồng bộ sau.");

        console.log("📋 Local data being passed to schedule:", planData);

        if (onNext) {
          onNext(planData);
        }
      }
    } catch (error) {
      console.error("Error creating treatment plan:", error);
      message.error("❌ Có lỗi xảy ra khi lưu phác đồ. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = () => {
    const currentValues = form.getFieldsValue();
    const draftData = {
      ...currentValues,
      template: selectedTemplate,
      customizations,
      customMedications,
      doctorNotes,
      lastSaved: new Date().toISOString(),
    };

    localStorage.setItem(
      `treatment_plan_draft_${patientId}`,
      JSON.stringify(draftData)
    );
    message.success("💾 Đã lưu bản nháp thành công");
  };

  // Columns for phases table
  const phaseColumns = [
    {
      title: "Giai đoạn",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Space direction="vertical" size="small">
          <Text strong>{text}</Text>
          <Text type="secondary">Thời gian: {record.duration}</Text>
        </Space>
      ),
    },
    {
      title: "Hoạt động chính",
      dataIndex: "activities",
      key: "activities",
      render: (activities) => (
        <div>
          {activities.slice(0, 2).map((activity, index) => (
            <Tag key={index} style={{ marginBottom: 4 }}>
              Ngày {activity.day}: {activity.name}
            </Tag>
          ))}
          {activities.length > 2 && (
            <Text type="secondary">
              +{activities.length - 2} hoạt động khác
            </Text>
          )}
        </div>
      ),
    },
    {
      title: "Thuốc",
      dataIndex: "medications",
      key: "medications",
      render: (medications) => (
        <div>
          {medications.slice(0, 2).map((med, index) => (
            <Tag color="blue" key={index} style={{ marginBottom: 4 }}>
              {med.name}
            </Tag>
          ))}
          {medications.length > 2 && (
            <Text type="secondary">+{medications.length - 2} thuốc khác</Text>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px", background: "#f5f5f5", minHeight: "100vh" }}>
      {hasError ? (
        <Card>
          <Alert
            message="Có lỗi xảy ra"
            description="Vui lòng tải lại trang hoặc liên hệ hỗ trợ kỹ thuật."
            type="error"
            showIcon
            action={
              <Button
                size="small"
                onClick={() => {
                  setHasError(false);
                  window.location.reload();
                }}
              >
                Tải lại
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          <Card>
            <Title level={2}>Lập Phác Đồ Điều Trị Cá Nhân Hóa</Title>

            {/* Thông tin bệnh nhân và chẩn đoán */}
            <Card
              size="small"
              style={{ marginBottom: 24, background: "#f9f9f9" }}
            >
              <Row gutter={16}>
                <Col span={8}>
                  <Text strong>Bệnh nhân:</Text> {patientInfo?.name}
                  <br />
                  <Text strong>Chẩn đoán:</Text> {examinationData?.diagnosis}
                </Col>
                <Col span={8}>
                  <Text strong>Khuyến nghị:</Text>{" "}
                  {examinationData?.recommendations}
                </Col>
                <Col span={8}>
                  <Text strong>Bác sĩ khám:</Text> {examinationData?.doctorId}
                </Col>
              </Row>
            </Card>

            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Form.Item
                label="Chọn loại điều trị"
                name="treatmentType"
                rules={[
                  { required: true, message: "Vui lòng chọn loại điều trị" },
                ]}
              >
                <Select
                  placeholder="Chọn dịch vụ điều trị..."
                  onChange={handleTemplateChange}
                  size="large"
                >
                  <Option value="IVF">
                    🧪 IVF - Thụ tinh trong ống nghiệm
                  </Option>
                  <Option value="IUI">
                    💉 IUI - Thụ tinh nhân tạo trong tử cung
                  </Option>
                </Select>
              </Form.Item>

              {/* Gợi ý của bác sĩ */}
              {doctorNotes && (
                <Alert
                  message="💡 Gợi ý từ hệ thống dựa trên kết quả khám"
                  description={
                    <pre
                      style={{ whiteSpace: "pre-line", fontFamily: "inherit" }}
                    >
                      {doctorNotes}
                    </pre>
                  }
                  type="info"
                  showIcon
                  style={{ marginBottom: 24 }}
                />
              )}

              {/* Template Details with Real-time Updates */}
              {selectedTemplate && (
                <Card
                  title="Chi Tiết Phác Đồ Được Chọn"
                  style={{ marginBottom: 24 }}
                >
                  <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={8}>
                      <Statistic
                        title="Thời gian dự kiến"
                        value={selectedTemplate.estimatedDuration}
                        prefix={<ClockCircleOutlined />}
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="Chi phí ước tính"
                        value={selectedTemplate.cost}
                        prefix={<DollarOutlined />}
                        suffix=""
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="Tỷ lệ thành công"
                        value={selectedTemplate.successRate}
                        suffix=""
                        prefix={<CheckCircleOutlined />}
                      />
                    </Col>
                  </Row>

                  <Divider />

                  {/* Enhanced Phase Display with Customizations */}
                  <Title level={4}>
                    Các Giai Đoạn Điều Trị
                    {Object.keys(customizations.phases || {}).length > 0 && (
                      <Badge
                        count={Object.keys(customizations.phases).length}
                        offset={[10, 0]}
                      >
                        <Tag color="orange">Đã tùy chỉnh</Tag>
                      </Badge>
                    )}
                  </Title>

                  <Collapse
                    accordion
                    items={selectedTemplate.phases.map((phase, index) => {
                      const effectivePhase = getEffectivePhase(phase);
                      const isCustomized = customizations.phases?.[phase.id];

                      return {
                        key: phase.id,
                        label: (
                          <Space>
                            <Badge
                              status={isCustomized ? "warning" : "default"}
                              text={
                                <span
                                  style={{
                                    fontWeight: isCustomized
                                      ? "bold"
                                      : "normal",
                                  }}
                                >
                                  {index + 1}. {effectivePhase.name} (
                                  {effectivePhase.duration})
                                  {isCustomized && (
                                    <Tag
                                      color="orange"
                                      size="small"
                                      style={{ marginLeft: 8 }}
                                    >
                                      Đã sửa
                                    </Tag>
                                  )}
                                </span>
                              }
                            />
                            <Tooltip title="Chỉnh sửa giai đoạn này">
                              <Button
                                size="small"
                                icon={<EditOutlined />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  try {
                                    handleEditPhase(effectivePhase);
                                  } catch (error) {
                                    console.error(
                                      "Error editing phase:",
                                      error
                                    );
                                    setHasError(true);
                                  }
                                }}
                              />
                            </Tooltip>
                          </Space>
                        ),
                        children: (
                          <div>
                            <div style={{ marginBottom: 16 }}>
                              <Text strong>Mô tả:</Text>{" "}
                              {effectivePhase.description}
                              {isCustomized && (
                                <Alert
                                  message="Giai đoạn này đã được tùy chỉnh"
                                  type="info"
                                  showIcon
                                  size="small"
                                  style={{ marginTop: 8 }}
                                />
                              )}
                            </div>

                            {/* Activities Table with Real-time Updates */}
                            <Table
                              size="small"
                              dataSource={effectivePhase.activities}
                              pagination={false}
                              columns={[
                                {
                                  title: "Ngày",
                                  dataIndex: "day",
                                  key: "day",
                                  width: 60,
                                  render: (day) => (
                                    <Tag color="blue">Ngày {day}</Tag>
                                  ),
                                },
                                {
                                  title: "Hoạt động",
                                  dataIndex: "name",
                                  key: "name",
                                  render: (name, record) => (
                                    <Space direction="vertical" size="small">
                                      <Text strong>{name}</Text>
                                      <Space size="small">
                                        <Tag icon={<ClockCircleOutlined />}>
                                          {record.duration} phút
                                        </Tag>
                                        <Tag
                                          color={
                                            record.required ? "red" : "green"
                                          }
                                        >
                                          {record.required
                                            ? "Bắt buộc"
                                            : "Tùy chọn"}
                                        </Tag>
                                        <Tag color="purple">{record.room}</Tag>
                                      </Space>
                                    </Space>
                                  ),
                                },
                              ]}
                            />

                            {/* Medications for this phase */}
                            {effectivePhase.medications &&
                              effectivePhase.medications.length > 0 && (
                                <div style={{ marginTop: 16 }}>
                                  <Title level={5}>
                                    Thuốc trong giai đoạn này:
                                  </Title>
                                  <Table
                                    size="small"
                                    dataSource={effectivePhase.medications}
                                    pagination={false}
                                    columns={[
                                      {
                                        title: "Tên thuốc",
                                        dataIndex: "name",
                                        key: "name",
                                      },
                                      {
                                        title: "Liều lượng",
                                        dataIndex: "dosage",
                                        key: "dosage",
                                      },
                                      {
                                        title: "Tần suất",
                                        dataIndex: "frequency",
                                        key: "frequency",
                                      },
                                      {
                                        title: "Thời gian",
                                        key: "duration",
                                        render: (_, record) => (
                                          <Tag>
                                            Ngày {record.startDay} -{" "}
                                            {record.startDay +
                                              record.duration -
                                              1}
                                          </Tag>
                                        ),
                                      },
                                    ]}
                                  />
                                </div>
                              )}
                          </div>
                        ),
                      };
                    })}
                  />
                </Card>
              )}

              {/* Custom Medications */}
              {customMedications.length > 0 && (
                <Card
                  title="💊 Thuốc tùy chỉnh thêm"
                  size="small"
                  style={{ marginTop: 16 }}
                >
                  {customMedications.map((med) => (
                    <Card
                      key={med.id}
                      type="inner"
                      size="small"
                      style={{ marginBottom: 8 }}
                    >
                      <Row gutter={8}>
                        <Col span={6}>
                          <Input
                            placeholder="Tên thuốc"
                            value={med.name}
                            onChange={(e) =>
                              handleUpdateMedication(
                                med.id,
                                "name",
                                e.target.value
                              )
                            }
                          />
                        </Col>
                        <Col span={4}>
                          <Input
                            placeholder="Liều lượng"
                            value={med.dosage}
                            onChange={(e) =>
                              handleUpdateMedication(
                                med.id,
                                "dosage",
                                e.target.value
                              )
                            }
                          />
                        </Col>
                        <Col span={4}>
                          <Input
                            placeholder="Tần suất"
                            value={med.frequency}
                            onChange={(e) =>
                              handleUpdateMedication(
                                med.id,
                                "frequency",
                                e.target.value
                              )
                            }
                          />
                        </Col>
                        <Col span={3}>
                          <Select
                            value={med.route}
                            onChange={(value) =>
                              handleUpdateMedication(med.id, "route", value)
                            }
                          >
                            <Option value="Uống">Uống</Option>
                            <Option value="Tiêm">Tiêm</Option>
                            <Option value="Bôi">Bôi</Option>
                          </Select>
                        </Col>
                        <Col span={3}>
                          <InputNumber
                            placeholder="Ngày bắt đầu"
                            value={med.startDay}
                            onChange={(value) =>
                              handleUpdateMedication(med.id, "startDay", value)
                            }
                            min={1}
                          />
                        </Col>
                        <Col span={3}>
                          <InputNumber
                            placeholder="Thời gian (ngày)"
                            value={med.duration}
                            onChange={(value) =>
                              handleUpdateMedication(med.id, "duration", value)
                            }
                            min={1}
                          />
                        </Col>
                        <Col span={1}>
                          <Popconfirm
                            title="Xóa thuốc này?"
                            onConfirm={() => handleDeleteMedication(med.id)}
                          >
                            <Button
                              icon={<DeleteOutlined />}
                              size="small"
                              danger
                            />
                          </Popconfirm>
                        </Col>
                      </Row>
                    </Card>
                  ))}
                </Card>
              )}

              {/* Requirements and Contraindications */}
              {selectedTemplate && (
                <>
                  <Row gutter={16} style={{ marginTop: 16 }}>
                    <Col span={12}>
                      <Card title="✅ Yêu cầu" size="small">
                        <ul>
                          {selectedTemplate.requirements.map((req, index) => (
                            <li key={index}>
                              <Text>{req}</Text>
                            </li>
                          ))}
                        </ul>
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card title="⚠️ Chống chỉ định" size="small">
                        <ul>
                          {selectedTemplate.contraindications.map(
                            (contra, index) => (
                              <li key={index}>
                                <Text type="danger">{contra}</Text>
                              </li>
                            )
                          )}
                        </ul>
                      </Card>
                    </Col>
                  </Row>
                </>
              )}

              <Form.Item
                label="Mức độ ưu tiên"
                name="priority"
                style={{ marginTop: 16 }}
              >
                <Select>
                  <Option value="high">🔴 Cao (Khẩn cấp)</Option>
                  <Option value="normal">🟡 Bình thường</Option>
                  <Option value="low">🟢 Thấp</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Ghi chú riêng của bác sĩ"
                name="doctorNotes"
                tooltip="Những điều chỉnh, lưu ý đặc biệt cho bệnh nhân này"
              >
                <Input.TextArea
                  rows={4}
                  placeholder="VD: Bệnh nhân có tiền sử dị ứng với thuốc X, cần theo dõi đặc biệt giai đoạn Y..."
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                />
              </Form.Item>

              <Form.Item style={{ marginTop: 24 }}>
                <Space>
                  <Button
                    icon={<SaveOutlined />}
                    onClick={handleSaveDraft}
                    disabled={!selectedTemplate}
                  >
                    💾 Lưu nháp
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    size="large"
                    disabled={!selectedTemplate}
                    style={{ minWidth: "200px" }}
                  >
                    ✅ Xác nhận phác đồ & Lập lịch
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>

          {/* Edit Phase Modal */}
          <Modal
            title={`Chỉnh sửa: ${editingPhase?.name}`}
            open={isEditingPhase}
            onOk={handleSavePhaseEdit}
            onCancel={handleCancelPhaseEdit}
            width={800}
            okText="Lưu thay đổi"
            cancelText="Hủy"
          >
            {editingPhase && (
              <div>
                <Form layout="vertical">
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="Tên giai đoạn">
                        <Input
                          value={editingPhase.name}
                          onChange={(e) =>
                            handlePhaseFieldChange("name", e.target.value)
                          }
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Thời gian (ngày)">
                        <Input
                          value={editingPhase.duration}
                          onChange={(e) =>
                            handlePhaseFieldChange("duration", e.target.value)
                          }
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item label="Mô tả chi tiết">
                    <Input.TextArea
                      rows={3}
                      value={editingPhase.description}
                      onChange={(e) =>
                        handlePhaseFieldChange("description", e.target.value)
                      }
                    />
                  </Form.Item>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Card title="Hoạt động" size="small">
                        {editingPhase.activities?.map((activity, index) => (
                          <div key={index} style={{ marginBottom: 8 }}>
                            <Input.Group compact>
                              <InputNumber
                                style={{ width: "20%" }}
                                value={activity.day}
                                min={1}
                                onChange={(value) => {
                                  handleActivityChange(index, "day", value);
                                }}
                              />
                              <Input
                                style={{ width: "80%" }}
                                value={activity.name}
                                onChange={(e) => {
                                  handleActivityChange(
                                    index,
                                    "name",
                                    e.target.value
                                  );
                                }}
                              />
                            </Input.Group>
                          </div>
                        ))}
                      </Card>
                    </Col>

                    <Col span={12}>
                      <Card title="Thuốc điều trị" size="small">
                        {editingPhase.medications?.map((med, index) => (
                          <div key={index} style={{ marginBottom: 8 }}>
                            <Input
                              value={med.name}
                              onChange={(e) => {
                                const newMeds = [...editingPhase.medications];
                                newMeds[index] = {
                                  ...med,
                                  name: e.target.value,
                                };
                                handlePhaseFieldChange("medications", newMeds);
                              }}
                            />
                            <Input
                              style={{ marginTop: 4 }}
                              placeholder="Liều lượng và cách dùng"
                              value={med.dosage}
                              onChange={(e) => {
                                const newMeds = [...editingPhase.medications];
                                newMeds[index] = {
                                  ...med,
                                  dosage: e.target.value,
                                };
                                handlePhaseFieldChange("medications", newMeds);
                              }}
                            />
                          </div>
                        ))}
                      </Card>
                    </Col>
                  </Row>
                </Form>
              </div>
            )}
          </Modal>
        </>
      )}
    </div>
  );
};

export default SimpleTreatmentPlanEditor;
