import React, { useState, useEffect, useContext } from "react";
import {
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Upload,
  Button,
  Row,
  Col,
  Divider,
  Tag,
  Space,
  message,
  Table,
  Typography,
  Alert,
  Descriptions,
  Badge,
} from "antd";
import "../DoctorTheme.css";
import "./ExaminationForm.css";
import {
  UploadOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  CheckCircleOutlined,
  PrinterOutlined,
  UserOutlined,
  HeartOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
  ExperimentOutlined,
  EyeOutlined,
  SaveOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { examinationAPI } from "../../../services/treatmentAPI";
import { UserContext } from "../../../context/UserContext";
import { treatmentStateManager } from "../../../utils/treatmentStateManager";

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const ExaminationForm = ({
  patientId,
  onNext,
  patientInfo,
  existingData,
  isEditing,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { user } = useContext(UserContext);
  const [symptoms, setSymptoms] = useState([]);
  const [labResults, setLabResults] = useState({});
  const [attachments, setAttachments] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  // Load existing data or draft when component initializes
  useEffect(() => {
    // Priority: completed result > existing data (when editing) > draft

    // 1. Check for saved completed examination result
    const completedKey = `examination_completed_${patientId}`;
    const savedCompleted = localStorage.getItem(completedKey);
    if (savedCompleted) {
      try {
        const completedData = JSON.parse(savedCompleted);
        // Restore completed state
        setIsCompleted(true);
        setSubmittedData(completedData);

        // Also populate form for potential editing
        form.setFieldsValue({
          diagnosis: completedData.diagnosis,
          recommendations: completedData.recommendations,
          bloodPressure: completedData.clinicalSigns?.bloodPressure,
          temperature: completedData.clinicalSigns?.temperature,
          heartRate: completedData.clinicalSigns?.heartRate,
          weight: completedData.clinicalSigns?.weight,
          height: completedData.clinicalSigns?.height,
          ultrasound: completedData.labResults?.ultrasound,
          notes: completedData.notes,
        });
        setSymptoms(completedData.symptoms || []);
        setLabResults(completedData.labResults || {});

        // message.success("📋 Đã khôi phục kết quả khám đã hoàn thành");
        return;
      } catch (error) {
        console.error("Error loading completed examination:", error);
      }
    }

    // 2. Fall back to editing existing data
    if (existingData && isEditing) {
      form.setFieldsValue({
        diagnosis: existingData.diagnosis,
        recommendations: existingData.recommendations,
        bloodPressure: existingData.clinicalSigns?.bloodPressure,
        temperature: existingData.clinicalSigns?.temperature,
        heartRate: existingData.clinicalSigns?.heartRate,
        weight: existingData.clinicalSigns?.weight,
        height: existingData.clinicalSigns?.height,
        ultrasound: existingData.labResults?.ultrasound,
        notes: existingData.notes,
      });
      setSymptoms(existingData.symptoms || []);
      setLabResults(existingData.labResults || {});
      // message.info("📝 Đang chỉnh sửa kết quả khám hiện có");
      return;
    }

    // 3. Fall back to draft
    const draftKey = `examination_draft_${patientId}`;
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        form.setFieldsValue(draft);
        setSymptoms(draft.symptoms || []);
        setLabResults(draft.labResults || {});
        // message.info(`Đã tải bản nháp lưu lúc: ${draft.savedAt}`);
      } catch (error) {
        console.error("Error loading draft:", error);
      }
    }
  }, [patientId, form, existingData, isEditing]);

  // Danh sách triệu chứng thường gặp
  const commonSymptoms = [
    "đau bụng dưới",
    "rối loạn kinh nguyệt",
    "ra máu bất thường",
    "đau khi quan hệ",
    "vô kinh",
    "kinh nguyệt không đều",
    "đau lưng",
    "buồn nôn",
    "căng tức vú",
    "mệt mỏi",
  ];

  // Cấu hình xét nghiệm máu
  const bloodTestConfig = [
    { key: "FSH", label: "FSH (mIU/mL)", normalRange: "3.5-12.5" },
    { key: "LH", label: "LH (mIU/mL)", normalRange: "2.4-12.6" },
    { key: "E2", label: "Estradiol (pg/mL)", normalRange: "12.5-166.0" },
    {
      key: "testosterone",
      label: "Testosterone (ng/mL)",
      normalRange: "0.1-0.8",
    },
    { key: "AMH", label: "AMH (ng/mL)", normalRange: "1.0-4.0" },
    { key: "prolactin", label: "Prolactin (ng/mL)", normalRange: "4.8-23.3" },
  ];

  const handleSymptomAdd = (symptom) => {
    if (!symptoms.includes(symptom)) {
      setSymptoms([...symptoms, symptom]);
    }
  };

  const handleSymptomRemove = (symptom) => {
    setSymptoms(symptoms.filter((s) => s !== symptom));
  };

  const handleLabResultChange = (test, value) => {
    setLabResults((prev) => ({
      ...prev,
      bloodTest: {
        ...prev.bloodTest,
        [test]: value,
      },
    }));
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      // Validate required fields
      if (!values.diagnosis || !values.recommendations) {
        // message.error("Vui lòng nhập đầy đủ chẩn đoán và khuyến nghị");
        return;
      }

      const examinationData = {
        id: existingData?.id || Date.now().toString(),
        patientId,
        doctorId: user?.id || "defaultDoctor",
        doctorName: user?.fullName || "Bác sĩ",
        examinationDate:
          existingData?.examinationDate ||
          new Date().toISOString().split("T")[0],
        symptoms,
        clinicalSigns: {
          bloodPressure: values.bloodPressure,
          temperature: values.temperature,
          heartRate: values.heartRate,
          weight: values.weight,
          height: values.height,
        },
        labResults: {
          ...labResults,
          ultrasound: values.ultrasound,
        },
        diagnosis: values.diagnosis,
        recommendations: values.recommendations,
        attachments: attachments.map((file) => file.name),
        notes: values.notes,
        status: "completed",
        // Enhanced metadata
        recommendedService: getRecommendedService(values.diagnosis),
        isEdited: isEditing,
        editedAt: isEditing ? new Date().toISOString() : undefined,
        originalData: isEditing ? existingData : undefined,
        createdAt: existingData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Always set completed and show results regardless of API status
      setIsCompleted(true);
      setSubmittedData(examinationData);

      let savedResult = null;

      // Try to save to API, but don't block UI if it fails
      try {
        savedResult = await examinationAPI.createExaminationResult(
          examinationData
        );

        // Clear draft after successful save (only if not editing)
        // But keep the completed examination state for persistence
        if (!isEditing) {
          localStorage.removeItem(`examination_draft_${patientId}`);
        }

        const actionText = isEditing ? "Cập nhật" : "Lưu";
        // message.success(
        //   `🎉 ${actionText} kết quả khám thành công! ${
        //     isEditing ? "" : "Hiển thị kết quả bên dưới."
        //   }`
        // );

        // Update with saved result if API succeeded
        setSubmittedData(savedResult || examinationData);

        // Store completed examination for TreatmentProcess sync
        localStorage.setItem(
          `examination_completed_${patientId}`,
          JSON.stringify({
            ...(savedResult || examinationData),
            completedAt: new Date().toISOString(),
            fromStandalonePage: true,
            apiSaved: true,
          })
        );

        // Dispatch custom event to notify TreatmentProcess
        const syncEvent = new CustomEvent("examinationCompleted", {
          detail: {
            patientId,
            examinationData: savedResult || examinationData,
          },
        });
        window.dispatchEvent(syncEvent);

        // Update treatment state manager
        treatmentStateManager.updateExamination(
          patientId,
          savedResult || examinationData
        );
      } catch (apiError) {
        console.warn("API save failed, but showing results locally:", apiError);
        // message.warning(
        //   "⚠️ Không thể kết nối server nhưng kết quả đã được hiển thị. Dữ liệu sẽ được lưu tạm thời."
        // );

        // Store in localStorage as backup
        localStorage.setItem(
          `examination_backup_${patientId}`,
          JSON.stringify({
            ...examinationData,
            savedAt: new Date().toISOString(),
            status: "offline_backup",
          })
        );

        // Also store as completed examination for TreatmentProcess sync
        localStorage.setItem(
          `examination_completed_${patientId}`,
          JSON.stringify({
            ...examinationData,
            completedAt: new Date().toISOString(),
            fromStandalonePage: true,
          })
        );

        // Dispatch custom event to notify TreatmentProcess
        const syncEvent = new CustomEvent("examinationCompleted", {
          detail: {
            patientId,
            examinationData: examinationData,
          },
        });
        window.dispatchEvent(syncEvent);

        // Update treatment state manager (even if API failed)
        treatmentStateManager.updateExamination(patientId, examinationData);
      }

      // Automatically notify TreatmentProcess that examination is completed
      if (onNext) {
        onNext(savedResult || examinationData);
      }
    } catch (error) {
      console.error("Critical error in examination form:", error);
      // message.error("❌ Có lỗi nghiêm trọng. Vui lòng tải lại trang!");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to recommend service based on diagnosis
  const getRecommendedService = (diagnosis) => {
    const diagnosisLower = diagnosis.toLowerCase();

    if (
      diagnosisLower.includes("tắc ống dẫn trứng") ||
      diagnosisLower.includes("tuổi cao") ||
      diagnosisLower.includes("amh thấp") ||
      diagnosisLower.includes("phôi kém")
    ) {
      return "IVF";
    } else if (
      diagnosisLower.includes("rối loạn rụng trứng") ||
      diagnosisLower.includes("tinh trùng yếu") ||
      diagnosisLower.includes("vô sinh nguyên phát nhẹ")
    ) {
      return "IUI";
    }

    return "IVF"; // Default recommendation
  };

  const uploadProps = {
    beforeUpload: (file) => {
      setAttachments((prev) => [...prev, file]);
      return false; // Prevent auto upload
    },
    onRemove: (file) => {
      setAttachments((prev) => prev.filter((f) => f.uid !== file.uid));
    },
    fileList: attachments,
  };

  return (
    <div className="examination-form-container">
      <div className="examination-form-content">
        <Card className="examination-main-card">
          <div className="examination-header">
            <Title level={2} className="examination-title">
              <Space>
                <HeartOutlined className="title-icon" />
                Khám Lâm Sàng & Nhập Kết Quả
              </Space>
            </Title>
          </div>

          <div className="examination-body">
            {/* Thông tin bệnh nhân */}
            <Card className="patient-info-section">
              <div className="section-title">
                <UserOutlined className="section-icon" />
                <span>Thông tin bệnh nhân</span>
              </div>
              <Row gutter={16} className="patient-info-grid">
                <Col span={6}>
                  <div className="info-item">
                    <Text type="secondary">Họ tên</Text>
                    <div className="info-value">
                      {patientInfo?.name || "N/A"}
                    </div>
                  </div>
                </Col>
                <Col span={6}>
                  <div className="info-item">
                    <Text type="secondary">Giới tính</Text>
                    <div className="info-value">
                      {patientInfo?.gender === "male" ? "Nam" : "Nữ"}
                    </div>
                  </div>
                </Col>
                <Col span={6}>
                  <div className="info-item">
                    <Text type="secondary">Tuổi</Text>
                    <div className="info-value">
                      {patientInfo?.age || "N/A"}
                    </div>
                  </div>
                </Col>
                <Col span={6}>
                  <div className="info-item">
                    <Text type="secondary">Liên hệ</Text>
                    <div className="info-value">
                      {patientInfo?.contact || "N/A"}
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Chỉ hiển thị form khi chưa hoàn thành */}
            {!isCompleted && (
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                className="examination-form"
              >
                <Row gutter={24}>
                  {/* Cột trái - Triệu chứng và dấu hiệu */}
                  <Col span={12}>
                    {/* Triệu chứng */}
                    <Card className="examination-section-card">
                      <div className="section-title">
                        <FileTextOutlined className="section-icon" />
                        <span>Triệu chứng</span>
                      </div>
                      <div className="symptoms-selection">
                        <Space wrap className="common-symptoms">
                          {commonSymptoms.map((symptom) => (
                            <Tag
                              key={symptom}
                              className={
                                symptoms.includes(symptom)
                                  ? "symptom-tag active"
                                  : "symptom-tag"
                              }
                              onClick={() =>
                                symptoms.includes(symptom)
                                  ? handleSymptomRemove(symptom)
                                  : handleSymptomAdd(symptom)
                              }
                            >
                              {symptom}
                            </Tag>
                          ))}
                        </Space>
                        <Input
                          placeholder="Nhập triệu chứng khác..."
                          className="custom-symptom-input"
                          onPressEnter={(e) => {
                            if (e.target.value.trim()) {
                              handleSymptomAdd(e.target.value.trim());
                              e.target.value = "";
                            }
                          }}
                        />
                        <div className="selected-symptoms">
                          <Text strong>Triệu chứng đã chọn:</Text>
                          <div className="selected-symptoms-list">
                            {symptoms.map((symptom) => (
                              <Tag
                                key={symptom}
                                closable
                                className="selected-symptom-tag"
                                onClose={() => handleSymptomRemove(symptom)}
                              >
                                {symptom}
                              </Tag>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* Dấu hiệu lâm sàng */}
                    <Card className="examination-section-card">
                      <div className="section-title">
                        <MedicineBoxOutlined className="section-icon" />
                        <span>Dấu hiệu lâm sàng</span>
                      </div>
                      <Row gutter={[12, 12]}>
                        <Col span={12}>
                          <Form.Item label="Huyết áp" name="bloodPressure">
                            <Input
                              placeholder="120/80"
                              className="examination-input"
                            />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item label="Nhiệt độ (°C)" name="temperature">
                            <InputNumber
                              min={35}
                              max={42}
                              step={0.1}
                              className="examination-input-number"
                              style={{ width: "100%" }}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            label="Nhịp tim (lần/phút)"
                            name="heartRate"
                          >
                            <InputNumber
                              min={40}
                              max={200}
                              className="examination-input-number"
                              style={{ width: "100%" }}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item label="Cân nặng (kg)" name="weight">
                            <InputNumber
                              min={30}
                              max={200}
                              className="examination-input-number"
                              style={{ width: "100%" }}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item label="Chiều cao (cm)" name="height">
                            <InputNumber
                              min={140}
                              max={220}
                              className="examination-input-number"
                              style={{ width: "100%" }}
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Card>
                  </Col>

                  {/* Cột phải - Xét nghiệm */}
                  <Col span={12}>
                    {/* Xét nghiệm máu */}
                    <Card className="examination-section-card">
                      <div className="section-title">
                        <ExperimentOutlined className="section-icon" />
                        <span>Xét nghiệm máu</span>
                      </div>
                      <Row gutter={[8, 8]}>
                        {bloodTestConfig.map((test) => (
                          <Col
                            span={12}
                            key={test.key}
                            className="blood-test-item"
                          >
                            <div className="test-label">{test.label}</div>
                            <InputNumber
                              placeholder={test.normalRange}
                              className="blood-test-input"
                              style={{ width: "100%" }}
                              onChange={(value) =>
                                handleLabResultChange(test.key, value)
                              }
                            />
                            <div className="normal-range">
                              Bình thường: {test.normalRange}
                            </div>
                          </Col>
                        ))}
                      </Row>
                    </Card>

                    {/* Siêu âm */}
                    <Card className="examination-section-card">
                      <div className="section-title">
                        <EyeOutlined className="section-icon" />
                        <span>Kết quả siêu âm</span>
                      </div>
                      <Form.Item name="ultrasound">
                        <TextArea
                          rows={4}
                          placeholder="Mô tả kết quả siêu âm..."
                          className="examination-textarea"
                        />
                      </Form.Item>
                    </Card>
                  </Col>
                </Row>

                <Divider className="section-divider" />

                {/* Chuẩn đoán và khuyến nghị */}
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item
                      label="🔍 Chuẩn đoán lâm sàng"
                      name="diagnosis"
                      rules={[
                        { required: true, message: "Vui lòng nhập chuẩn đoán" },
                      ]}
                    >
                      <TextArea
                        rows={3}
                        placeholder="Nhập chuẩn đoán..."
                        className="examination-textarea"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="💊 Khuyến nghị điều trị"
                      name="recommendations"
                    >
                      <TextArea
                        rows={3}
                        placeholder="Nhập khuyến nghị..."
                        className="examination-textarea"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                {/* Upload file đính kèm */}
                <Form.Item label="📎 File đính kèm (ảnh siêu âm, kết quả xét nghiệm...)">
                  <Upload
                    {...uploadProps}
                    multiple
                    className="examination-upload"
                  >
                    <Button icon={<UploadOutlined />} className="upload-btn">
                      Chọn file
                    </Button>
                  </Upload>
                </Form.Item>

                {/* Ghi chú */}
                <Form.Item label="📝 Ghi chú" name="notes">
                  <TextArea
                    rows={2}
                    placeholder="Ghi chú thêm..."
                    className="examination-textarea"
                  />
                </Form.Item>

                {/* Bác sĩ khám */}
                <Card className="doctor-info-section">
                  <Row align="middle" gutter={16}>
                    <Col>
                      <div className="doctor-avatar">
                        {user?.fullName?.charAt(0) || "BS"}
                      </div>
                    </Col>
                    <Col flex={1}>
                      <div className="doctor-details">
                        <div className="doctor-name">
                          👨‍⚕️ Bác sĩ phụ trách:{" "}
                          {user?.fullName || "Bác sĩ chuyên khoa"}
                        </div>
                        <div className="doctor-specialty">
                          🏥 Chuyên khoa:{" "}
                          {user?.specialty || "Sản phụ khoa & Hỗ trợ sinh sản"}
                        </div>
                        <div className="doctor-id">
                          🆔 ID: {user?.id || "BS001"} | ✅ Đã đăng nhập
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Card>

                <div className="form-actions">
                  <Space size="large">
                    <Button
                      className="action-btn draft-btn"
                      icon={<SaveOutlined />}
                      onClick={() => {
                        const draftData = form.getFieldsValue();
                        localStorage.setItem(
                          `examination_draft_${patientId}`,
                          JSON.stringify({
                            ...draftData,
                            symptoms,
                            labResults,
                            savedAt: new Date().toLocaleString(),
                          })
                        );
                        // message.success("Đã lưu bản nháp");
                      }}
                    >
                      Lưu nháp
                    </Button>

                    <Button
                      type="dashed"
                      className="action-btn test-btn"
                      icon={<ReloadOutlined />}
                      onClick={() => {
                        form.setFieldsValue({
                          diagnosis: "Vô sinh nguyên phát",
                          recommendations: "Điều trị IVF",
                          bloodPressure: "120/80",
                          temperature: 36.5,
                          heartRate: 72,
                          weight: 55,
                          height: 160,
                          ultrasound:
                            "Buồng trứng bình thường, nội mạc tử cung dày 8mm",
                          notes:
                            "Bệnh nhân cần theo dõi trong quá trình điều trị",
                        });
                        setSymptoms(["rối loạn kinh nguyệt", "khó thụ thai"]);
                        setLabResults({
                          bloodTest: {
                            FSH: "8.5",
                            LH: "6.2",
                            E2: "45.0",
                            AMH: "2.1",
                          },
                        });
                        // message.info("Đã điền dữ liệu mẫu");
                      }}
                    >
                      Điền mẫu test
                    </Button>

                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      size="large"
                      className="action-btn submit-btn"
                      icon={<CheckCircleOutlined />}
                    >
                      Hoàn thành khám & Lập phác đồ
                    </Button>
                  </Space>
                </div>
              </Form>
            )}

            {/* Results Section */}
            {isCompleted && submittedData && (
              <div className="examination-results">
                <Alert
                  message="✅ Kết quả khám đã được lưu thành công"
                  description="Thông tin đã được cập nhật và sẵn sàng cho bước tiếp theo. Bạn có thể xem lại hoặc chỉnh sửa thông tin bên dưới."
                  type="success"
                  showIcon
                  className="success-alert"
                />

                {/* Thông tin khám đã hoàn thành */}
                <Card
                  className="results-card"
                  title={
                    <Space>
                      <CheckCircleOutlined className="results-icon" />
                      <span>Kết Quả Khám Lâm Sàng</span>
                      <Badge status="success" text="Đã hoàn thành" />
                    </Space>
                  }
                  extra={
                    <Space>
                      <Button
                        icon={<EditOutlined />}
                        className="action-btn edit-btn"
                        onClick={() => {
                          setIsCompleted(false);
                          setSubmittedData(null);
                          localStorage.removeItem(
                            `examination_completed_${patientId}`
                          );
                        }}
                      >
                        Chỉnh sửa
                      </Button>
                      <Button
                        icon={<PrinterOutlined />}
                        className="action-btn print-btn"
                        onClick={() => {
                          window.print();
                          if (submittedData) {
                            const syncEvent = new CustomEvent(
                              "examinationPrinted",
                              {
                                detail: {
                                  patientId,
                                  examinationData: submittedData,
                                  action: "printed",
                                },
                              }
                            );
                            window.dispatchEvent(syncEvent);
                          }
                        }}
                      >
                        In kết quả
                      </Button>

                      <Button
                        danger
                        className="action-btn reset-btn"
                        onClick={() => {
                          setIsCompleted(false);
                          setSubmittedData(null);
                          localStorage.removeItem(
                            `examination_completed_${patientId}`
                          );
                          localStorage.removeItem(
                            `examination_draft_${patientId}`
                          );
                          localStorage.removeItem(
                            `examination_backup_${patientId}`
                          );

                          form.resetFields();
                          setSymptoms([]);
                          setLabResults({});
                          setAttachments([]);
                        }}
                      >
                        Bắt đầu lại
                      </Button>
                    </Space>
                  }
                >
                  <Row gutter={24}>
                    <Col span={12}>
                      <Descriptions
                        title="ℹ️ Thông tin cơ bản"
                        bordered
                        column={1}
                        size="small"
                        className="results-descriptions"
                      >
                        <Descriptions.Item label="Bệnh nhân">
                          {patientInfo?.name}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày khám">
                          {submittedData.examinationDate}
                        </Descriptions.Item>
                        <Descriptions.Item label="Bác sĩ khám">
                          {submittedData.doctorName}
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                          <Badge status="success" text="Hoàn thành" />
                        </Descriptions.Item>
                      </Descriptions>
                    </Col>

                    <Col span={12}>
                      <Descriptions
                        title="🩺 Dấu hiệu lâm sàng"
                        bordered
                        column={1}
                        size="small"
                        className="results-descriptions"
                      >
                        <Descriptions.Item label="Huyết áp">
                          {submittedData.clinicalSigns?.bloodPressure ||
                            "Chưa đo"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Nhiệt độ">
                          {submittedData.clinicalSigns?.temperature
                            ? `${submittedData.clinicalSigns.temperature}°C`
                            : "Chưa đo"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Nhịp tim">
                          {submittedData.clinicalSigns?.heartRate
                            ? `${submittedData.clinicalSigns.heartRate} lần/phút`
                            : "Chưa đo"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Cân nặng">
                          {submittedData.clinicalSigns?.weight
                            ? `${submittedData.clinicalSigns.weight} kg`
                            : "Chưa đo"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Chiều cao">
                          {submittedData.clinicalSigns?.height
                            ? `${submittedData.clinicalSigns.height} cm`
                            : "Chưa đo"}
                        </Descriptions.Item>
                      </Descriptions>
                    </Col>
                  </Row>

                  <Divider />

                  <Row gutter={24}>
                    <Col span={24}>
                      <Descriptions
                        title="🔬 Triệu chứng và xét nghiệm"
                        bordered
                        column={2}
                        size="small"
                        className="results-descriptions"
                      >
                        <Descriptions.Item label="Triệu chứng" span={2}>
                          {submittedData.symptoms?.length > 0 ? (
                            <Space wrap>
                              {submittedData.symptoms.map((symptom, index) => (
                                <Tag key={index} className="result-symptom-tag">
                                  {symptom}
                                </Tag>
                              ))}
                            </Space>
                          ) : (
                            "Không có triệu chứng ghi nhận"
                          )}
                        </Descriptions.Item>
                        <Descriptions.Item
                          label="Kết quả xét nghiệm máu"
                          span={2}
                        >
                          {submittedData.labResults?.bloodTest ? (
                            <div>
                              {Object.entries(
                                submittedData.labResults.bloodTest
                              ).map(([test, value]) => (
                                <div key={test} className="lab-result-item">
                                  <Text strong>{test}:</Text> {value || "N/A"}
                                </div>
                              ))}
                            </div>
                          ) : (
                            "Chưa có kết quả xét nghiệm"
                          )}
                        </Descriptions.Item>
                        <Descriptions.Item label="Kết quả siêu âm" span={2}>
                          {submittedData.labResults?.ultrasound ||
                            "Chưa có kết quả siêu âm"}
                        </Descriptions.Item>
                      </Descriptions>
                    </Col>
                  </Row>

                  <Divider />

                  <Row gutter={24}>
                    <Col span={24}>
                      <Descriptions
                        title="📋 Kết luận và khuyến nghị"
                        bordered
                        column={1}
                        size="small"
                        className="results-descriptions"
                      >
                        <Descriptions.Item label="Chẩn đoán lâm sàng">
                          <Text strong className="diagnosis-text">
                            {submittedData.diagnosis}
                          </Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Khuyến nghị điều trị">
                          <Text className="recommendation-text">
                            {submittedData.recommendations}
                          </Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Dịch vụ được khuyến nghị">
                          <Tag className="service-tag">
                            {submittedData.recommendedService}
                          </Tag>
                        </Descriptions.Item>
                        {submittedData.notes && (
                          <Descriptions.Item label="Ghi chú">
                            {submittedData.notes}
                          </Descriptions.Item>
                        )}
                      </Descriptions>
                    </Col>
                  </Row>

                  <div className="completion-message">
                    <Space>
                      <Text className="completion-text">
                        ✅ Khám lâm sàng đã hoàn thành! Tự động chuyển sang bước
                        lập phác đồ...
                      </Text>
                    </Space>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ExaminationForm;
