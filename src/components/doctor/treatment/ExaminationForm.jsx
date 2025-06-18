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
} from "antd";
import {
  UploadOutlined,
  PlusOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { examinationAPI } from "../../../services/treatmentAPI";
import { UserContext } from "../../../context/UserContext";

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

  // Load existing data or draft when component initializes
  useEffect(() => {
    // Priority: existing data (when editing) > draft
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
      message.info("📝 Đang chỉnh sửa kết quả khám hiện có");
      return;
    }

    const draftKey = `examination_draft_${patientId}`;
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        form.setFieldsValue(draft);
        setSymptoms(draft.symptoms || []);
        setLabResults(draft.labResults || {});
        message.info(`Đã tải bản nháp lưu lúc: ${draft.savedAt}`);
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
        message.error("Vui lòng nhập đầy đủ chẩn đoán và khuyến nghị");
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

      // Save to API
      const savedResult = await examinationAPI.createExaminationResult(
        examinationData
      );

      // Clear draft after successful save (only if not editing)
      if (!isEditing) {
        localStorage.removeItem(`examination_draft_${patientId}`);
      }

      const actionText = isEditing ? "Cập nhật" : "Lưu";
      message.success(
        `🎉 ${actionText} kết quả khám thành công!${
          isEditing ? "" : " Chuyển sang lập phác đồ..."
        }`
      );

      // Call onNext with the saved examination data
      if (onNext) {
        onNext(savedResult || examinationData);
      }
    } catch (error) {
      console.error("Error saving examination:", error);
      message.error("❌ Có lỗi xảy ra khi lưu kết quả khám. Vui lòng thử lại!");
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
    <div style={{ padding: "24px", background: "#f5f5f5", minHeight: "100vh" }}>
      <Card>
        <Title level={2}>Khám Lâm Sàng & Nhập Kết Quả</Title>

        {/* Thông tin bệnh nhân */}
        <Card size="small" style={{ marginBottom: 24, background: "#f9f9f9" }}>
          <Title level={4}>Thông tin bệnh nhân</Title>
          <Row gutter={16}>
            <Col span={6}>
              <Text strong>Họ tên:</Text> {patientInfo?.name || "N/A"}
            </Col>
            <Col span={6}>
              <Text strong>Giới tính:</Text>{" "}
              {patientInfo?.gender === "male" ? "Nam" : "Nữ"}
            </Col>
            <Col span={6}>
              <Text strong>Ngày sinh:</Text> {patientInfo?.dob || "N/A"}
            </Col>
            <Col span={6}>
              <Text strong>Liên hệ:</Text> {patientInfo?.contact || "N/A"}
            </Col>
          </Row>
        </Card>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            temperature: "36.5",
            bloodPressure: "120/80",
            heartRate: "72",
          }}
        >
          <Row gutter={24}>
            {/* Cột trái - Triệu chứng và dấu hiệu */}
            <Col span={12}>
              {/* Triệu chứng */}
              <Card
                title="Triệu chứng"
                size="small"
                style={{ marginBottom: 16 }}
              >
                <Space wrap style={{ marginBottom: 12 }}>
                  {commonSymptoms.map((symptom) => (
                    <Tag
                      key={symptom}
                      color={symptoms.includes(symptom) ? "blue" : "default"}
                      style={{ cursor: "pointer" }}
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
                  onPressEnter={(e) => {
                    if (e.target.value.trim()) {
                      handleSymptomAdd(e.target.value.trim());
                      e.target.value = "";
                    }
                  }}
                />
                <div style={{ marginTop: 8 }}>
                  <Text strong>Triệu chứng đã chọn:</Text>
                  <div style={{ marginTop: 4 }}>
                    {symptoms.map((symptom) => (
                      <Tag
                        key={symptom}
                        closable
                        color="blue"
                        onClose={() => handleSymptomRemove(symptom)}
                      >
                        {symptom}
                      </Tag>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Dấu hiệu lâm sàng */}
              <Card title="Dấu hiệu lâm sàng" size="small">
                <Row gutter={12}>
                  <Col span={12}>
                    <Form.Item label="Huyết áp" name="bloodPressure">
                      <Input placeholder="120/80" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Nhiệt độ (°C)" name="temperature">
                      <InputNumber
                        min={35}
                        max={42}
                        step={0.1}
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Nhịp tim (lần/phút)" name="heartRate">
                      <InputNumber
                        min={40}
                        max={200}
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Cân nặng (kg)" name="weight">
                      <InputNumber
                        min={30}
                        max={200}
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Chiều cao (cm)" name="height">
                      <InputNumber
                        min={140}
                        max={220}
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
              <Card
                title="Xét nghiệm máu"
                size="small"
                style={{ marginBottom: 16 }}
              >
                <Row gutter={8}>
                  {bloodTestConfig.map((test) => (
                    <Col span={12} key={test.key} style={{ marginBottom: 8 }}>
                      <Text>{test.label}</Text>
                      <InputNumber
                        size="small"
                        placeholder={test.normalRange}
                        style={{ width: "100%", marginTop: 4 }}
                        onChange={(value) =>
                          handleLabResultChange(test.key, value)
                        }
                      />
                      <Text type="secondary" style={{ fontSize: "11px" }}>
                        Bình thường: {test.normalRange}
                      </Text>
                    </Col>
                  ))}
                </Row>
              </Card>

              {/* Siêu âm */}
              <Card title="Kết quả siêu âm" size="small">
                <Form.Item name="ultrasound">
                  <TextArea rows={4} placeholder="Mô tả kết quả siêu âm..." />
                </Form.Item>
              </Card>
            </Col>
          </Row>

          <Divider />

          {/* Chuẩn đoán và khuyến nghị */}
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="Chuẩn đoán lâm sàng"
                name="diagnosis"
                rules={[
                  { required: true, message: "Vui lòng nhập chuẩn đoán" },
                ]}
              >
                <TextArea rows={3} placeholder="Nhập chuẩn đoán..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Khuyến nghị điều trị" name="recommendations">
                <TextArea rows={3} placeholder="Nhập khuyến nghị..." />
              </Form.Item>
            </Col>
          </Row>

          {/* Upload file đính kèm */}
          <Form.Item label="File đính kèm (ảnh siêu âm, kết quả xét nghiệm...)">
            <Upload {...uploadProps} multiple>
              <Button icon={<UploadOutlined />}>Chọn file</Button>
            </Upload>
          </Form.Item>

          {/* Ghi chú */}
          <Form.Item label="Ghi chú" name="notes">
            <TextArea rows={2} placeholder="Ghi chú thêm..." />
          </Form.Item>

          {/* Bác sĩ khám - Hiển thị thông tin bác sĩ đã đăng nhập */}
          <Card
            size="small"
            style={{ background: "#f0f8ff", marginBottom: 16 }}
          >
            <Row align="middle" gutter={16}>
              <Col>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "#1890ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  {user?.fullName?.charAt(0) || "BS"}
                </div>
              </Col>
              <Col flex={1}>
                <div>
                  <Text strong style={{ fontSize: "16px" }}>
                    Bác sĩ phụ trách: {user?.fullName || "Bác sĩ chuyên khoa"}
                  </Text>
                  <br />
                  <Text type="secondary">
                    Chuyên khoa:{" "}
                    {user?.specialty || "Sản phụ khoa & Hỗ trợ sinh sản"}
                  </Text>
                  <br />
                  <Text type="secondary">
                    ID: {user?.id || "BS001"} | Đã đăng nhập
                  </Text>
                </div>
              </Col>
            </Row>
          </Card>

          <div style={{ textAlign: "right", marginTop: 24 }}>
            <Space>
              <Button
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
                  message.success("Đã lưu bản nháp");
                }}
              >
                💾 Lưu nháp
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                style={{ minWidth: "200px" }}
              >
                ✅ Hoàn thành khám & Lập phác đồ
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default ExaminationForm;
