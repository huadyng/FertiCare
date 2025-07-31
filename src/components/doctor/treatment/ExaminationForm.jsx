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
  UserOutlined,
  HeartOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
  ExperimentOutlined,
  EyeOutlined,
  ReloadOutlined,
  CalendarOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { clinicalResultsAPI } from "../../../api/apiClinicalResults";
import { UserContext } from "../../../context/UserContext";
import { treatmentStateManager } from "../../../utils/treatmentStateManager";
import { debugUtils } from "../../../utils/debugUtils";
import moment from "moment";

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

// XÓA flattenNested và normalizeDates, thay bằng chuẩn hóa phẳng:
function normalizeInitialValues(data) {
  return {
    ...data,
    examinationDate: data.examinationDate ? moment(data.examinationDate) : null,
    completionDate: data.completionDate ? moment(data.completionDate) : null,
    nextAppointmentDate: data.nextAppointmentDate
      ? moment(data.nextAppointmentDate)
      : null,
    symptoms: Array.isArray(data.symptoms) ? data.symptoms : [],
    symptomsDetail: data.symptomsDetail ?? data.symptom_detail ?? "",
    bmi: data.bmi || null,
    appointmentId: data.appointmentId || null,
    attachedFileUrl: data.attachedFileUrl || null,
    isCompleted: data.isCompleted !== undefined ? data.isCompleted : false,
  };
}

// Thay đổi prop: nhận resultId thay vì chỉ patientId
const ExaminationForm = ({
  resultId,
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
  const [originalData, setOriginalData] = useState(null);

  // Khi mount, chỉ GET clinical result theo resultId
  useEffect(() => {
    const loadClinicalResult = async () => {
      if (!resultId) {
        setOriginalData(null);
        return;
      }
      try {
        const data = await clinicalResultsAPI.getClinicalResultById(resultId);
        setOriginalData(data);
        setSubmittedData(data);
        setIsCompleted(!!data.isCompleted);
      } catch (error) {
        setOriginalData(null);
        setSubmittedData(null);
        setIsCompleted(false);
      }
    };
    loadClinicalResult();
  }, [resultId]);

  // Khi originalData thay đổi, cập nhật lại form values
  useEffect(() => {
    if (originalData) {
      form.setFieldsValue(normalizeInitialValues(originalData));
    }
  }, [originalData, form]);

  // Hàm convert các trường ngày sang dayjs object (an toàn hơn)
  const toDayjs = (val) => {
    if (!val) return null;
    if (moment.isMoment(val)) return val;
    const d = moment(val);
    return d.isValid() ? d : null;
  };

  // Sau khi cập nhật thành công, reload lại dữ liệu từ BE
  const reloadClinicalResult = async () => {
    if (resultId) {
      try {
        const updated = await clinicalResultsAPI.getClinicalResultById(
          resultId
        );
        setOriginalData(updated);
        setSubmittedData(updated);
        // form.setFieldsValue(updated); // Không cần setFieldsValue nữa vì form đã đồng bộ với originalData
      } catch (e) {
        // fallback: không reload được thì giữ nguyên
      }
    }
  };

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

  // Function để điền dữ liệu mẫu test từ database
  const fillTestData = () => {
    try {
      // Dữ liệu mẫu từ database
      const testData = {
        symptoms: ["Sốt", "ho nhẹ"],
        symptomsDetail: "Bệnh nhân có triệu chứng sốt nhẹ 37.8°C, ho khan.",
        bloodPressureSystolic: 120,
        bloodPressureDiastolic: 80,
        temperature: 37.8,
        heartRate: 78,
        weight: 60.5,
        height: 170.0,
        bmi: 20.93,
        bloodType: "O",
        appointmentId: "apt-001",
        fshLevel: 6.2,
        lhLevel: 4.1,
        estradiolLevel: 45.0,
        testosteroneLevel: 0.5,
        amhLevel: 2.1,
        prolactinLevel: 12.0,
        glucose: 5.1,
        hemoglobin: 13.5,
        creatinine: 0.9,
        endometrialThickness: 7.5,
        ovarySizeLeft: 3.2,
        ovarySizeRight: 3.1,
        follicleCountLeft: 5,
        follicleCountRight: 6,
        plateletCount: 250,
        whiteBloodCell: 7.2,
        ultrasoundFindings: "Bình thường",
        diagnosis: "Viêm họng nhẹ",
        diagnosisCode: "J02",
        severityLevel: "Nhẹ",
        infertilityDurationMonths: null,
        previousTreatments: "",
        recommendations: "Uống nhiều nước, nghỉ ngơi",
        treatmentPriority: "Thấp",
        notes: "Theo dõi thêm tại nhà.",
        examinationDate: moment(),
        completionDate: moment(),
        nextAppointmentDate: moment().add(7, "day"),
        attachedFileUrl: "https://example.com/file.pdf",
        isCompleted: true,
      };

      // Set form values
      form.setFieldsValue(testData);

      // Update lab results state
      setLabResults({
        bloodTest: {
          fshLevel: testData.fshLevel,
          lhLevel: testData.lhLevel,
          estradiolLevel: testData.estradiolLevel,
          testosteroneLevel: testData.testosteroneLevel,
          amhLevel: testData.amhLevel,
          prolactinLevel: testData.prolactinLevel,
          glucose: testData.glucose,
          hemoglobin: testData.hemoglobin,
          creatinine: testData.creatinine,
        },
        ultrasound: {
          endometrialThickness: testData.endometrialThickness,
          ovarySizeLeft: testData.ovarySizeLeft,
          ovarySizeRight: testData.ovarySizeRight,
          follicleCountLeft: testData.follicleCountLeft,
          follicleCountRight: testData.follicleCountRight,
          ultrasoundFindings: testData.ultrasoundFindings,
        },
        otherTests: {
          plateletCount: testData.plateletCount,
          whiteBloodCell: testData.whiteBloodCell,
        },
      });

      message.success("Đã điền dữ liệu mẫu test!");
      console.log("✅ [ExaminationForm] Test data filled successfully");
    } catch (error) {
      message.error("Có lỗi khi điền dữ liệu mẫu!");
      console.error("❌ [ExaminationForm] Error filling test data:", error);
    }
  };

  // Khi submit, chỉ PUT theo resultId
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const payload = {
        ...values,
        patientId,
        examinationDate: values.examinationDate?.toISOString(),
        completionDate: values.completionDate?.toISOString(),
        nextAppointmentDate: values.nextAppointmentDate?.toISOString(),
        symptoms: JSON.stringify(
          Array.isArray(values.symptoms)
            ? values.symptoms
            : values.symptoms
            ? [values.symptoms]
            : []
        ),
      };
      if (resultId) {
        await clinicalResultsAPI.updateExaminationResult(resultId, payload);
        message.success("Cập nhật thành công!");
        setIsCompleted(true);
        // Reload lại clinical result sau khi cập nhật
        const updated = await clinicalResultsAPI.getClinicalResultById(
          resultId
        );
        setOriginalData(updated);
        setSubmittedData(updated);
      } else {
        message.error(
          "Không tìm thấy clinical result, vui lòng liên hệ quản trị viên!"
        );
      }
    } catch (err) {
      message.error("Có lỗi khi lưu!");
      console.error(err);
    } finally {
      setLoading(false);
    }
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

  // Kiểm tra xem có patientId hợp lệ không
  if (!patientId) {
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

            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                borderRadius: "12px",
                margin: "20px 0",
              }}
            >
              <div
                style={{ fontSize: "64px", marginBottom: "20px", opacity: 0.6 }}
              >
                🩺
              </div>
              <Title level={3} style={{ color: "#666", marginBottom: "16px" }}>
                Không có kết quả khám lâm sàng
              </Title>
              <Text
                style={{
                  fontSize: "16px",
                  color: "#888",
                  display: "block",
                  marginBottom: "24px",
                }}
              >
                Vui lòng chọn bệnh nhân để bắt đầu khám lâm sàng
              </Text>
              <Button
                type="primary"
                size="large"
                icon={<UserOutlined />}
                style={{
                  background:
                    "linear-gradient(135deg, #ff6b9d 0%, #ff758c 100%)",
                  border: "none",
                  borderRadius: "8px",
                  padding: "12px 24px",
                  height: "auto",
                }}
              >
                Chọn bệnh nhân
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Render loading nếu chưa có originalData
  console.log("[DEBUG] resultId:", resultId);
  console.log("[DEBUG] originalData:", originalData);
  if (
    !originalData ||
    (!originalData.id && !originalData.resultId && !originalData.patientId)
  ) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <span>Đang tải dữ liệu khám lâm sàng...</span>
      </div>
    );
  }

  // Thêm log kiểm tra initialValues ngay trước return
  console.log("initialValues", normalizeInitialValues(originalData));

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
            {/* Chỉ hiển thị form khi chưa hoàn thành */}
            {!isCompleted && originalData && (
              <Form
                key={originalData.id || resultId || "new"}
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                className="examination-form"
              >
                {/* Triệu chứng & Chi tiết triệu chứng */}
                <Card
                  className="examination-section-card"
                  style={{ marginBottom: 16 }}
                >
                  <div className="section-title">
                    <MedicineBoxOutlined className="section-icon" /> Triệu chứng
                  </div>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="symptoms"
                        label="Triệu chứng (có thể chọn nhiều)"
                      >
                        <Select
                          mode="multiple"
                          allowClear
                          placeholder="Chọn triệu chứng..."
                        >
                          {commonSymptoms.map((sym, idx) => (
                            <Option key={idx} value={sym}>
                              {sym}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="symptomsDetail"
                        label="Chi tiết triệu chứng"
                      >
                        <TextArea
                          rows={2}
                          placeholder="Mô tả chi tiết triệu chứng..."
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>

                {/* Dấu hiệu lâm sàng */}
                <Card
                  className="examination-section-card"
                  style={{ marginBottom: 16 }}
                >
                  <div className="section-title">
                    <UserOutlined className="section-icon" /> Dấu hiệu lâm sàng
                  </div>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item
                        name="bloodPressureSystolic"
                        label="Huyết áp tâm thu"
                        rules={[
                          {
                            type: "number",
                            min: 0,
                            max: 300,
                            message: "0-300 mmHg",
                          },
                        ]}
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          min={0}
                          max={300}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name="bloodPressureDiastolic"
                        label="Huyết áp tâm trương"
                        rules={[
                          {
                            type: "number",
                            min: 0,
                            max: 200,
                            message: "0-200 mmHg",
                          },
                        ]}
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          min={0}
                          max={200}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name="temperature"
                        label="Nhiệt độ (°C)"
                        rules={[
                          {
                            type: "number",
                            min: 30,
                            max: 45,
                            message: "30-45°C",
                          },
                        ]}
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          min={30}
                          max={45}
                          step={0.1}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item
                        name="heartRate"
                        label="Nhịp tim"
                        rules={[
                          {
                            type: "number",
                            min: 0,
                            max: 200,
                            message: "0-200 lần/phút",
                          },
                        ]}
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          min={0}
                          max={200}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name="weight"
                        label="Cân nặng (kg)"
                        rules={[
                          {
                            type: "number",
                            min: 0,
                            max: 300,
                            message: "0-300 kg",
                          },
                        ]}
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          min={0}
                          max={300}
                          step={0.1}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name="height"
                        label="Chiều cao (cm)"
                        rules={[
                          {
                            type: "number",
                            min: 0,
                            max: 250,
                            message: "0-250 cm",
                          },
                        ]}
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          min={0}
                          max={250}
                          step={0.1}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item name="bloodType" label="Nhóm máu">
                        <Select>
                          <Option value="A">A</Option>
                          <Option value="B">B</Option>
                          <Option value="AB">AB</Option>
                          <Option value="O">O</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name="bmi"
                        label="BMI"
                        rules={[
                          {
                            type: "number",
                            min: 0,
                            max: 100,
                            message: "0-100",
                          },
                        ]}
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          step={0.1}
                          min={0}
                          max={100}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="appointmentId" label="ID lịch hẹn">
                        <Input disabled />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>

                {/* Chỉ số hormone & sinh học */}
                <Card
                  className="examination-section-card"
                  style={{ marginBottom: 16 }}
                >
                  <div className="section-title">
                    <ExperimentOutlined className="section-icon" /> Chỉ số
                    hormone & sinh học
                  </div>
                  <Row gutter={16}>
                    <Col span={6}>
                      <Form.Item
                        name="fshLevel"
                        label="FSH"
                        rules={[
                          {
                            type: "number",
                            min: 0,
                            max: 100,
                            message: "0-100",
                          },
                        ]}
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          step={0.1}
                          min={0}
                          max={100}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item
                        name="lhLevel"
                        label="LH"
                        rules={[
                          {
                            type: "number",
                            min: 0,
                            max: 100,
                            message: "0-100",
                          },
                        ]}
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          step={0.1}
                          min={0}
                          max={100}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item
                        name="estradiolLevel"
                        label="Estradiol"
                        rules={[
                          {
                            type: "number",
                            min: 0,
                            max: 1000,
                            message: "0-1000",
                          },
                        ]}
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          step={0.1}
                          min={0}
                          max={1000}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item
                        name="testosteroneLevel"
                        label="Testosterone"
                        rules={[
                          { type: "number", min: 0, max: 10, message: "0-10" },
                        ]}
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          step={0.1}
                          min={0}
                          max={10}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={6}>
                      <Form.Item
                        name="amhLevel"
                        label="AMH"
                        rules={[
                          { type: "number", min: 0, max: 20, message: "0-20" },
                        ]}
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          step={0.1}
                          min={0}
                          max={20}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item
                        name="prolactinLevel"
                        label="Prolactin"
                        rules={[
                          {
                            type: "number",
                            min: 0,
                            max: 100,
                            message: "0-100",
                          },
                        ]}
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          step={0.1}
                          min={0}
                          max={100}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item
                        name="glucose"
                        label="Glucose"
                        rules={[
                          { type: "number", min: 0, max: 20, message: "0-20" },
                        ]}
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          step={0.1}
                          min={0}
                          max={20}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item
                        name="hemoglobin"
                        label="Hemoglobin"
                        rules={[
                          { type: "number", min: 0, max: 30, message: "0-30" },
                        ]}
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          step={0.1}
                          min={0}
                          max={30}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={6}>
                      <Form.Item
                        name="creatinine"
                        label="Creatinine"
                        rules={[
                          { type: "number", min: 0, max: 5, message: "0-5" },
                        ]}
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          step={0.1}
                          min={0}
                          max={5}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item
                        name="plateletCount"
                        label="Tiểu cầu"
                        rules={[
                          {
                            type: "number",
                            min: 0,
                            max: 1000,
                            message: "0-1000",
                          },
                        ]}
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          min={0}
                          max={1000}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item
                        name="whiteBloodCell"
                        label="Bạch cầu"
                        rules={[
                          {
                            type: "number",
                            min: 0,
                            max: 100,
                            message: "0-100",
                          },
                        ]}
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          step={0.1}
                          min={0}
                          max={100}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>

                {/* Siêu âm & sinh sản */}
                <Card
                  className="examination-section-card"
                  style={{ marginBottom: 16 }}
                >
                  <div className="section-title">
                    <EyeOutlined className="section-icon" /> Siêu âm & sinh sản
                  </div>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item
                        name="endometrialThickness"
                        label="Độ dày nội mạc tử cung"
                        rules={[
                          {
                            type: "number",
                            min: 0,
                            max: 30,
                            message: "0-30 mm",
                          },
                        ]}
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          step={0.1}
                          min={0}
                          max={30}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name="ovarySizeLeft"
                        label="Kích thước buồng trứng trái"
                        rules={[
                          {
                            type: "number",
                            min: 0,
                            max: 10,
                            message: "0-10 cm",
                          },
                        ]}
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          step={0.1}
                          min={0}
                          max={10}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name="ovarySizeRight"
                        label="Kích thước buồng trứng phải"
                        rules={[
                          {
                            type: "number",
                            min: 0,
                            max: 10,
                            message: "0-10 cm",
                          },
                        ]}
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          step={0.1}
                          min={0}
                          max={10}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item
                        name="follicleCountLeft"
                        label="Số nang noãn trái"
                        rules={[
                          { type: "number", min: 0, max: 50, message: "0-50" },
                        ]}
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          min={0}
                          max={50}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name="follicleCountRight"
                        label="Số nang noãn phải"
                        rules={[
                          { type: "number", min: 0, max: 50, message: "0-50" },
                        ]}
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          min={0}
                          max={50}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name="ultrasoundFindings"
                        label="Kết quả siêu âm"
                      >
                        <TextArea
                          rows={2}
                          placeholder="Mô tả kết quả siêu âm..."
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>

                {/* Chẩn đoán & điều trị */}
                <Card
                  className="examination-section-card"
                  style={{ marginBottom: 16 }}
                >
                  <div className="section-title">
                    <FileTextOutlined className="section-icon" /> Chẩn đoán &
                    điều trị
                  </div>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item name="diagnosis" label="Chẩn đoán">
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="diagnosisCode" label="Mã chẩn đoán">
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="severityLevel" label="Mức độ nặng">
                        <Select>
                          <Option value="Nhẹ">Nhẹ</Option>
                          <Option value="Vừa">Vừa</Option>
                          <Option value="Nặng">Nặng</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item
                        name="infertilityDurationMonths"
                        label="Thời gian vô sinh (tháng)"
                      >
                        <InputNumber style={{ width: "100%" }} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name="previousTreatments"
                        label="Điều trị trước đó"
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="recommendations" label="Khuyến nghị">
                        <Input />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item
                        name="treatmentPriority"
                        label="Mức ưu tiên điều trị"
                      >
                        <Select>
                          <Option value="Cao">Cao</Option>
                          <Option value="Trung bình">Trung bình</Option>
                          <Option value="Thấp">Thấp</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="completionDate" label="Ngày hoàn thành">
                        <DatePicker
                          style={{ width: "100%" }}
                          format="DD/MM/YYYY"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name="nextAppointmentDate"
                        label="Lịch hẹn tiếp theo"
                      >
                        <DatePicker
                          style={{ width: "100%" }}
                          format="DD/MM/YYYY"
                          showTime
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item name="attachedFileUrl" label="File đính kèm">
                        <Input placeholder="URL file đính kèm..." />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name="isCompleted"
                        label="Trạng thái hoàn thành"
                        valuePropName="checked"
                      >
                        <Select>
                          <Option value={true}>Hoàn thành</Option>
                          <Option value={false}>Chưa hoàn thành</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>

                {/* Ghi chú */}
                <Form.Item name="notes" label="Ghi chú">
                  <TextArea rows={2} placeholder="Ghi chú thêm..." />
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
                    {originalData && (
                      <Button
                        icon={<ReloadOutlined />}
                        className="action-btn back-btn"
                        onClick={() => {
                          setIsCompleted(true);
                          setSubmittedData(originalData);
                        }}
                      >
                        Quay lại
                      </Button>
                    )}

                    <Button
                      type="dashed"
                      className="action-btn test-btn"
                      icon={<ReloadOutlined />}
                      onClick={() => {
                        fillTestData();
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
              <>
                <div className="examination-results">
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
                          className="action-btn print-btn"
                          onClick={() => {
                            setIsCompleted(false);
                            // localStorage.removeItem( // This line is no longer needed
                            //   `examination_completed_${patientId}`
                            // );
                          }}
                        >
                          Chỉnh sửa
                        </Button>
                        {/* Đã xóa nút Đặt lại */}
                      </Space>
                    }
                  >
                    <Row gutter={24}>
                      {/* <Col span={12}>
                        <Descriptions
                          title="ℹ️ Thông tin cơ bản"
                          variant="bordered"
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
                      </Col> */}

                      <Col span={12}>
                        <Descriptions
                          title="🩺 Dấu hiệu lâm sàng"
                          variant="bordered"
                          column={1}
                          size="small"
                          className="results-descriptions"
                        >
                          <Descriptions.Item label="Huyết áp">
                            {submittedData.bloodPressureSystolic &&
                            submittedData.bloodPressureDiastolic ? (
                              <Tag className="result-clinical-tag">
                                {submittedData.bloodPressureSystolic}/
                                {submittedData.bloodPressureDiastolic} mmHg
                              </Tag>
                            ) : (
                              "Chưa đo"
                            )}
                          </Descriptions.Item>
                          <Descriptions.Item label="Nhiệt độ">
                            {submittedData.temperature ? (
                              <Tag className="result-clinical-tag">
                                {submittedData.temperature}°C
                              </Tag>
                            ) : (
                              "Chưa đo"
                            )}
                          </Descriptions.Item>
                          <Descriptions.Item label="Nhịp tim">
                            {submittedData.heartRate ? (
                              <Tag className="result-clinical-tag">
                                {submittedData.heartRate} lần/phút
                              </Tag>
                            ) : (
                              "Chưa đo"
                            )}
                          </Descriptions.Item>
                          <Descriptions.Item label="Cân nặng">
                            {submittedData.weight ? (
                              <Tag className="result-clinical-tag">
                                {submittedData.weight} kg
                              </Tag>
                            ) : (
                              "Chưa đo"
                            )}
                          </Descriptions.Item>
                          <Descriptions.Item label="Chiều cao">
                            {submittedData.height ? (
                              <Tag className="result-clinical-tag">
                                {submittedData.height} cm
                              </Tag>
                            ) : (
                              "Chưa đo"
                            )}
                          </Descriptions.Item>
                        </Descriptions>
                      </Col>
                    </Row>

                    <Divider />

                    <Row gutter={24}>
                      <Col span={24}>
                        <Descriptions
                          title="🔬 Triệu chứng và xét nghiệm"
                          variant="bordered"
                          column={2}
                          size="small"
                          className="results-descriptions"
                        >
                          <Descriptions.Item label="Triệu chứng" span={2}>
                            {(() => {
                              let parsedSymptoms = Array.isArray(
                                submittedData.symptoms
                              )
                                ? submittedData.symptoms
                                : typeof submittedData.symptoms === "string"
                                ? JSON.parse(submittedData.symptoms)
                                : [];
                              return parsedSymptoms.length > 0 ? (
                                <Space wrap>
                                  {parsedSymptoms.map((symptom, index) => (
                                    <Tag
                                      key={index}
                                      className="result-symptom-tag"
                                    >
                                      {symptom}
                                    </Tag>
                                  ))}
                                </Space>
                              ) : (
                                "Không có triệu chứng ghi nhận"
                              );
                            })()}
                          </Descriptions.Item>
                          <Descriptions.Item
                            label="Chi tiết triệu chứng"
                            span={2}
                          >
                            {submittedData.symptomsDetail ? (
                              <Tag className="result-symptom-tag">
                                {submittedData.symptomsDetail}
                              </Tag>
                            ) : (
                              "Không có"
                            )}
                          </Descriptions.Item>
                        </Descriptions>
                      </Col>
                    </Row>

                    <Divider />

                    <Row gutter={24}>
                      <Col span={24}>
                        <Descriptions
                          title="📋 Kết luận"
                          variant="bordered"
                          column={1}
                          size="small"
                          className="results-descriptions"
                        >
                          <Descriptions.Item label="Chẩn đoán lâm sàng">
                            {submittedData.diagnosis ? (
                              <Tag className="result-conclusion-tag">
                                {submittedData.diagnosis}
                              </Tag>
                            ) : (
                              "Chưa có"
                            )}
                          </Descriptions.Item>
                        </Descriptions>
                      </Col>
                    </Row>

                    {/* Đã xóa dòng thông báo hoàn thành khám lâm sàng */}
                  </Card>
                </div>
                {/* Nút chuyển bước nằm cuối form */}
                <div style={{ textAlign: "right", marginTop: 32 }}>
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    className="action-btn next-btn"
                    size="large"
                    onClick={() => onNext(submittedData)}
                  >
                    Chuyển sang bước tiếp theo
                  </Button>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ExaminationForm;
