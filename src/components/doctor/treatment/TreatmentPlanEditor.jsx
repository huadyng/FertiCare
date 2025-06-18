import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Select,
  Table,
  Button,
  Input,
  InputNumber,
  Space,
  Tag,
  Modal,
  Row,
  Col,
  Divider,
  Typography,
  Tabs,
  Collapse,
  Tooltip,
  DatePicker,
  message,
  Badge,
} from "antd";
import {
  EditOutlined,
  PlusOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  ExperimentOutlined,
} from "@ant-design/icons";
import {
  treatmentTemplateAPI,
  treatmentPlanAPI,
} from "../../../services/treatmentAPI";
import dayjs from "dayjs";

const { Option } = Select;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { TextArea } = Input;

const TreatmentPlanEditor = ({
  patientId,
  patientInfo,
  examinationData,
  onNext,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customizedPlan, setCustomizedPlan] = useState(null);
  const [medicationModal, setMedicationModal] = useState(false);
  const [editingMedication, setEditingMedication] = useState(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await treatmentTemplateAPI.getTemplates();
      setTemplates(data);
    } catch (error) {
      console.error("Error loading templates:", error);
      message.error("Không thể tải danh sách phác đồ");
    }
  };

  const handleTemplateSelect = async (templateId) => {
    try {
      const template = await treatmentTemplateAPI.getTemplateById(templateId);
      setSelectedTemplate(template);
      setCustomizedPlan({
        ...template,
        customizations: {
          medications: [],
          additionalTests: [],
          notes: "",
        },
      });
    } catch (error) {
      console.error("Error loading template:", error);
      message.error("Không thể tải chi tiết phác đồ");
    }
  };

  const handleMedicationCustomize = (phaseIndex, medIndex, medication) => {
    setEditingMedication({
      phaseIndex,
      medIndex,
      medication: { ...medication },
      isNew: false,
    });
    setMedicationModal(true);
  };

  const handleAddMedication = (phaseIndex) => {
    setEditingMedication({
      phaseIndex,
      medIndex: -1,
      medication: {
        name: "",
        dosage: "",
        frequency: "",
        route: "",
        duration: 0,
        startDay: 1,
      },
      isNew: true,
    });
    setMedicationModal(true);
  };

  const saveMedicationCustomization = (medicationData) => {
    const { phaseIndex, medIndex, medication, isNew } = medicationData;

    setCustomizedPlan((prev) => {
      const newPlan = { ...prev };

      if (isNew) {
        // Thêm thuốc mới
        if (!newPlan.phases[phaseIndex].customMedications) {
          newPlan.phases[phaseIndex].customMedications = [];
        }
        newPlan.phases[phaseIndex].customMedications.push({
          ...medication,
          id: Date.now().toString(),
        });
      } else {
        // Chỉnh sửa thuốc có sẵn
        const existingCustomization = newPlan.customizations.medications.find(
          (custom) => custom.originalMedicationId === medication.originalId
        );

        if (existingCustomization) {
          Object.assign(existingCustomization, medication);
        } else {
          newPlan.customizations.medications.push({
            originalMedicationId: medication.originalId,
            ...medication,
            note: `Chỉnh sửa từ phác đồ gốc`,
          });
        }
      }

      return newPlan;
    });

    setMedicationModal(false);
    setEditingMedication(null);
  };

  const addAdditionalTest = () => {
    Modal.confirm({
      title: "Thêm xét nghiệm bổ sung",
      content: (
        <Form layout="vertical">
          <Form.Item label="Tên xét nghiệm" name="testName">
            <Input placeholder="Ví dụ: AMH, HSG..." />
          </Form.Item>
          <Form.Item label="Thời gian thực hiện" name="schedule">
            <Input placeholder="Ví dụ: trước khi bắt đầu, ngày 5..." />
          </Form.Item>
          <Form.Item label="Lý do" name="reason">
            <TextArea rows={2} placeholder="Lý do chỉ định..." />
          </Form.Item>
        </Form>
      ),
      onOk: (close) => {
        // Logic thêm xét nghiệm
        close();
      },
    });
  };

  const handleSavePlan = async () => {
    try {
      setLoading(true);

      const planData = {
        patientId,
        templateId: selectedTemplate.id,
        doctorId: examinationData?.doctorId,
        customizations: customizedPlan.customizations,
        estimatedStartDate: form
          .getFieldValue("startDate")
          ?.format("YYYY-MM-DD"),
        notes: form.getFieldValue("planNotes"),
      };

      await treatmentPlanAPI.createTreatmentPlan(planData);
      message.success("Đã lưu phác đồ điều trị thành công");
      onNext && onNext(planData);
    } catch (error) {
      console.error("Error saving plan:", error);
      message.error("Có lỗi xảy ra khi lưu phác đồ");
    } finally {
      setLoading(false);
    }
  };

  // Columns cho bảng thuốc
  const medicationColumns = [
    {
      title: "Thuốc",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Space>
          <MedicineBoxOutlined />
          <Text strong>{text}</Text>
          {record.isCustomized && <Tag color="orange">Đã chỉnh sửa</Tag>}
        </Space>
      ),
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
      title: "Đường dùng",
      dataIndex: "route",
      key: "route",
    },
    {
      title: "Thời gian",
      key: "duration",
      render: (record) =>
        `Ngày ${record.startDay} - ${record.startDay + record.duration - 1}`,
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (record, _, index) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() =>
                handleMedicationCustomize(record.phaseIndex, index, record)
              }
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Columns cho bảng theo dõi
  const monitoringColumns = [
    {
      title: "Loại theo dõi",
      dataIndex: "type",
      key: "type",
      render: (text) => (
        <Space>
          <ExperimentOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: "Lịch trình",
      dataIndex: "schedule",
      key: "schedule",
    },
    {
      title: "Mục đích",
      dataIndex: "purpose",
      key: "purpose",
    },
    {
      title: "Xét nghiệm",
      dataIndex: "tests",
      key: "tests",
      render: (tests) => tests?.join(", ") || "-",
    },
  ];

  return (
    <div style={{ padding: "24px", background: "#f5f5f5", minHeight: "100vh" }}>
      <Card>
        <Title level={2}>Lập Phác Đồ Điều Trị Cá Nhân Hóa</Title>

        {/* Thông tin bệnh nhân và chẩn đoán */}
        <Card size="small" style={{ marginBottom: 24, background: "#f9f9f9" }}>
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

        <Row gutter={24}>
          {/* Cột trái - Chọn template */}
          <Col span={8}>
            <Card title="Chọn Template Phác Đồ" size="small">
              <Select
                style={{ width: "100%", marginBottom: 16 }}
                placeholder="Chọn phác đồ điều trị"
                onChange={handleTemplateSelect}
              >
                {templates.map((template) => (
                  <Option key={template.id} value={template.id}>
                    <div>
                      <Text strong>{template.name}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        {template.description}
                      </Text>
                      <br />
                      <Tag color={template.type === "IVF" ? "blue" : "green"}>
                        {template.type}
                      </Tag>
                    </div>
                  </Option>
                ))}
              </Select>

              {selectedTemplate && (
                <div>
                  <Divider />
                  <Title level={5}>Thông tin template</Title>
                  <Paragraph>
                    <Text strong>Tên:</Text> {selectedTemplate.name}
                    <br />
                    <Text strong>Loại:</Text>
                    <Tag
                      color={selectedTemplate.type === "IVF" ? "blue" : "green"}
                    >
                      {selectedTemplate.type}
                    </Tag>
                    <br />
                    <Text strong>Mô tả:</Text> {selectedTemplate.description}
                  </Paragraph>
                </div>
              )}
            </Card>
          </Col>

          {/* Cột phải - Chi tiết phác đồ */}
          <Col span={16}>
            {customizedPlan ? (
              <Card
                title={
                  <Space>
                    <span>Chi Tiết Phác Đồ: {customizedPlan.name}</span>
                    <Tag
                      color={customizedPlan.type === "IVF" ? "blue" : "green"}
                    >
                      {customizedPlan.type}
                    </Tag>
                  </Space>
                }
                size="small"
              >
                <Collapse defaultActiveKey={["0"]}>
                  {customizedPlan.phases?.map((phase, phaseIndex) => (
                    <Panel
                      key={phaseIndex}
                      header={
                        <Space>
                          <Badge count={phaseIndex + 1} />
                          <span>{phase.name}</span>
                          <Text type="secondary">({phase.duration})</Text>
                        </Space>
                      }
                    >
                      <Tabs defaultActiveKey="medications">
                        <TabPane tab="Thuốc" key="medications">
                          <div style={{ marginBottom: 12 }}>
                            <Button
                              type="dashed"
                              icon={<PlusOutlined />}
                              onClick={() => handleAddMedication(phaseIndex)}
                            >
                              Thêm thuốc
                            </Button>
                          </div>
                          <Table
                            size="small"
                            dataSource={phase.medications?.map(
                              (med, index) => ({
                                ...med,
                                key: index,
                                phaseIndex,
                              })
                            )}
                            columns={medicationColumns}
                            pagination={false}
                          />
                        </TabPane>

                        <TabPane tab="Theo dõi" key="monitoring">
                          <Table
                            size="small"
                            dataSource={phase.monitoring?.map((mon, index) => ({
                              ...mon,
                              key: index,
                            }))}
                            columns={monitoringColumns}
                            pagination={false}
                          />
                        </TabPane>

                        {phase.procedures && (
                          <TabPane tab="Thủ thuật" key="procedures">
                            {phase.procedures.map((proc, index) => (
                              <Card
                                key={index}
                                size="small"
                                style={{ marginBottom: 8 }}
                              >
                                <Text strong>{proc.name}</Text>
                                <br />
                                <Text type="secondary">
                                  {proc.timing || proc.method}
                                </Text>
                              </Card>
                            ))}
                          </TabPane>
                        )}
                      </Tabs>
                    </Panel>
                  ))}
                </Collapse>

                <Divider />

                {/* Cấu hình bổ sung */}
                <Form form={form} layout="vertical">
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="Ngày dự kiến bắt đầu" name="startDate">
                        <DatePicker
                          style={{ width: "100%" }}
                          disabledDate={(current) =>
                            current && current < dayjs().startOf("day")
                          }
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <div style={{ marginBottom: 16 }}>
                        <Text strong>Xét nghiệm bổ sung:</Text>
                        <Button
                          type="link"
                          icon={<PlusOutlined />}
                          onClick={addAdditionalTest}
                        >
                          Thêm
                        </Button>
                      </div>
                    </Col>
                  </Row>

                  <Form.Item label="Ghi chú phác đồ" name="planNotes">
                    <TextArea
                      rows={3}
                      placeholder="Ghi chú cá nhân hóa cho bệnh nhân này..."
                    />
                  </Form.Item>
                </Form>

                <div style={{ textAlign: "right", marginTop: 24 }}>
                  <Space>
                    <Button>Lưu nháp</Button>
                    <Button
                      type="primary"
                      loading={loading}
                      onClick={handleSavePlan}
                      size="large"
                    >
                      Lưu phác đồ & Tiếp tục
                    </Button>
                  </Space>
                </div>
              </Card>
            ) : (
              <Card style={{ textAlign: "center", padding: "50px" }}>
                <InfoCircleOutlined
                  style={{ fontSize: "48px", color: "#d9d9d9" }}
                />
                <Title level={4} type="secondary">
                  Vui lòng chọn template phác đồ điều trị
                </Title>
              </Card>
            )}
          </Col>
        </Row>
      </Card>

      {/* Modal chỉnh sửa thuốc */}
      <Modal
        title={editingMedication?.isNew ? "Thêm thuốc mới" : "Chỉnh sửa thuốc"}
        open={medicationModal}
        onCancel={() => setMedicationModal(false)}
        onOk={() => {
          // Logic save medication
          saveMedicationCustomization(editingMedication);
        }}
        width={600}
      >
        {editingMedication && (
          <Form layout="vertical" initialValues={editingMedication.medication}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Tên thuốc" name="name">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Liều lượng" name="dosage">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Tần suất" name="frequency">
                  <Select>
                    <Option value="1 lần/ngày">1 lần/ngày</Option>
                    <Option value="2 lần/ngày">2 lần/ngày</Option>
                    <Option value="3 lần/ngày">3 lần/ngày</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Đường dùng" name="route">
                  <Select>
                    <Option value="uống">Uống</Option>
                    <Option value="tiêm dưới da">Tiêm dưới da</Option>
                    <Option value="tiêm tĩnh mạch">Tiêm tĩnh mạch</Option>
                    <Option value="đặt âm đạo">Đặt âm đạo</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Ngày bắt đầu" name="startDay">
                  <InputNumber min={1} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Thời gian dùng (ngày)" name="duration">
                  <InputNumber min={1} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item label="Ghi chú" name="notes">
              <TextArea rows={2} />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default TreatmentPlanEditor;
