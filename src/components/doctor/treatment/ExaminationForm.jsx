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
  const [originalData, setOriginalData] = useState(null);

  // Debug localStorage on mount in development
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log(
        "🔍 [DEBUG] ExaminationForm mounted for patientId:",
        patientId
      );
      debugLocalStorage();
    }
  }, [patientId]);

  // Load existing data or draft when component initializes
  useEffect(() => {
    const loadExaminationData = async () => {
      try {
        console.log("🔄 Loading examination data for patient:", patientId);

        // 1. Thử lấy từ localStorage trước (nhanh hơn)
        const completedKey = `examination_completed_${patientId}`;
        const savedCompleted = localStorage.getItem(completedKey);

        if (savedCompleted) {
          try {
            const completedData = JSON.parse(savedCompleted);
            console.log("✅ Found data in localStorage:", completedData);

            // Kiểm tra xem dữ liệu có rỗng không
            if (isDataEmpty(completedData)) {
              console.log("⚠️ Found empty data in localStorage, cleaning...");
              localStorage.removeItem(completedKey);
              console.log("🧹 Cleaned empty data");
            } else {
              setIsCompleted(true);
              setSubmittedData(completedData);
              setOriginalData(completedData);
              populateFormWithData(completedData);
            }

            // Vẫn tiếp tục gọi API để đồng bộ dữ liệu mới nhất
            try {
              const apiResults = await clinicalResultsAPI.getExaminationResults(
                patientId
              );
              if (apiResults && apiResults.length > 0) {
                const latestResult = apiResults[apiResults.length - 1];
                console.log("✅ Found newer data from API:", latestResult);
                setIsCompleted(true);
                setSubmittedData(latestResult);
                setOriginalData(latestResult);
                populateFormWithData(latestResult);
                // Cập nhật localStorage với dữ liệu mới nhất từ backend
                localStorage.setItem(
                  completedKey,
                  JSON.stringify(latestResult)
                );
              }
            } catch (apiError) {
              console.warn(
                "⚠️ API call failed, keeping localStorage data:",
                apiError
              );
            }
            return;
          } catch (error) {
            console.error("❌ Error parsing localStorage data:", error);
            localStorage.removeItem(completedKey); // Xóa dữ liệu lỗi
          }
        }

        // 2. Nếu localStorage không có, thử gọi API
        try {
          const apiResults = await clinicalResultsAPI.getExaminationResults(
            patientId
          );
          if (apiResults && apiResults.length > 0) {
            const latestResult = apiResults[apiResults.length - 1];
            console.log("✅ Found data from API:", latestResult);
            setIsCompleted(true);
            setSubmittedData(latestResult);
            setOriginalData(latestResult);
            populateFormWithData(latestResult);
            // Lưu vào localStorage để lần sau load nhanh hơn
            localStorage.setItem(completedKey, JSON.stringify(latestResult));
            return;
          }
        } catch (apiError) {
          console.warn("⚠️ Could not load from API:", apiError);
        }

        // 3. Nếu cả hai đều không có, kiểm tra treatmentStateManager
        const stateManagerData = treatmentStateManager.getStepData(0);
        if (stateManagerData && stateManagerData.examination) {
          console.log(
            "✅ Found data in treatmentStateManager:",
            stateManagerData.examination
          );
          setIsCompleted(true);
          setSubmittedData(stateManagerData.examination);
          setOriginalData(stateManagerData.examination);
          populateFormWithData(stateManagerData.examination);
          // Lưu vào localStorage
          localStorage.setItem(
            completedKey,
            JSON.stringify(stateManagerData.examination)
          );
          return;
        }

        console.log("ℹ️ No existing examination data found");
      } catch (error) {
        console.error("❌ Critical error loading examination data:", error);
      }
    };

    loadExaminationData();
  }, [patientId, form, existingData, isEditing]);

  // Helper function to populate form with data
  const populateFormWithData = (data) => {
    console.log("📝 Populating form with data:", data);
    console.log("📝 Data diagnosis:", data.diagnosis);
    console.log("📝 Data recommendations:", data.recommendations);
    console.log("📝 Data clinicalSigns:", data.clinicalSigns);
    console.log("📝 Data labResults:", data.labResults);

    try {
      // Chỉ populate form nếu có dữ liệu thực sự
      const hasRealData =
        data.diagnosis ||
        data.recommendations ||
        data.clinicalSigns?.bloodPressure ||
        data.clinicalSigns?.temperature ||
        data.clinicalSigns?.heartRate ||
        data.clinicalSigns?.weight ||
        data.clinicalSigns?.height ||
        data.labResults?.ultrasound ||
        data.notes ||
        (data.symptoms && data.symptoms.length > 0) ||
        (data.labResults?.bloodTest &&
          Object.values(data.labResults.bloodTest).some(
            (val) => val !== null && val !== ""
          ));

      if (!hasRealData) {
        console.log("⚠️ No real data to populate, skipping form population");
        return;
      }

      form.setFieldsValue({
        diagnosis: data.diagnosis || "",
        bloodPressure: data.clinicalSigns?.bloodPressure || "",
        temperature: data.clinicalSigns?.temperature || "",
        heartRate: data.clinicalSigns?.heartRate || "",
        weight: data.clinicalSigns?.weight || "",
        height: data.clinicalSigns?.height || "",
        ultrasound: data.labResults?.ultrasound || "",
        notes: data.notes || "",
      });
      setSymptoms(data.symptoms || []);
      setLabResults(data.labResults || {});
      console.log("✅ Form populated successfully with real data");
    } catch (error) {
      console.error("❌ Error populating form:", error);
    }
  };

  // Debug function to check localStorage data
  const debugLocalStorage = () => {
    const completedKey = `examination_completed_${patientId}`;
    const savedData = localStorage.getItem(completedKey);
    console.log("🔍 Debug localStorage for key:", completedKey);
    console.log("🔍 Raw localStorage data:", savedData);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        console.log("🔍 Parsed localStorage data:", parsedData);
      } catch (error) {
        console.error("❌ Error parsing localStorage data:", error);
      }
    }
  };

  // Backup function to save data before clearing
  const backupData = () => {
    const completedKey = `examination_completed_${patientId}`;
    const backupKey = `examination_backup_${patientId}`;
    const savedData = localStorage.getItem(completedKey);
    if (savedData) {
      localStorage.setItem(backupKey, savedData);
      console.log("💾 Data backed up to:", backupKey);
    }
  };

  // Restore function to recover data from backup
  const restoreData = () => {
    const completedKey = `examination_completed_${patientId}`;
    const backupKey = `examination_backup_${patientId}`;
    const backupData = localStorage.getItem(backupKey);
    if (backupData) {
      localStorage.setItem(completedKey, backupData);
      console.log("🔄 Data restored from backup");
      window.location.reload(); // Reload to apply restored data
    } else {
      console.log("⚠️ No backup data found");
    }
  };

  // Function to check if data is empty/null
  const isDataEmpty = (data) => {
    if (!data) return true;

    const hasRealData =
      data.diagnosis ||
      data.clinicalSigns?.bloodPressure ||
      data.clinicalSigns?.temperature ||
      data.clinicalSigns?.heartRate ||
      data.clinicalSigns?.weight ||
      data.clinicalSigns?.height ||
      data.labResults?.ultrasound ||
      data.notes ||
      (data.symptoms && data.symptoms.length > 0) ||
      (data.labResults?.bloodTest &&
        Object.values(data.labResults.bloodTest).some(
          (val) => val !== null && val !== ""
        ));

    return !hasRealData;
  };

  // Function to clean empty data from localStorage
  const cleanEmptyData = () => {
    const completedKey = `examination_completed_${patientId}`;
    const savedData = localStorage.getItem(completedKey);

    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (isDataEmpty(parsedData)) {
          localStorage.removeItem(completedKey);
          console.log("🧹 Cleaned empty data from localStorage");
          return true;
        }
      } catch (error) {
        console.error("❌ Error parsing data for cleaning:", error);
        localStorage.removeItem(completedKey);
        return true;
      }
    }
    return false;
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

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      // Validate required fields
      if (!values.diagnosis) {
        message.error("Vui lòng nhập chẩn đoán");
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
        attachments: attachments.map((file) => file.name),
        notes: values.notes,
        status: "completed",
        // Enhanced metadata
        isEdited: isEditing,
        editedAt: isEditing ? new Date().toISOString() : undefined,
        originalData: isEditing ? existingData : undefined,
        createdAt: existingData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Always set completed and show results regardless of API status
      setIsCompleted(true);
      setSubmittedData(examinationData);
      setOriginalData(examinationData);

      let savedResult = null;

      // Try to save to API, but don't block UI if it fails
      try {
        // Kiểm tra xem có clinical result nào đã tồn tại cho bệnh nhân này không
        const existingResults = await clinicalResultsAPI.getExaminationResults(
          patientId
        );
        let savedResult;

        if (existingResults && existingResults.length > 0) {
          // Nếu có kết quả đã tồn tại, cập nhật kết quả đầu tiên
          const existingResult = existingResults[0];
          savedResult = await clinicalResultsAPI.updateExaminationResult(
            existingResult.id,
            examinationData
          );
        } else {
          // Nếu không có kết quả nào, tạo mới (nhưng backend không có POST endpoint)
          // Vì vậy sẽ chỉ lưu local và hiển thị thông báo
          console.warn(
            "Không có clinical result nào tồn tại để cập nhật. Chỉ lưu local."
          );
          savedResult = examinationData;
        }
        // Lưu vào localStorage để giữ lại khi reload
        const dataToStore = {
          ...savedResult,
          completedAt: new Date().toISOString(),
          fromStandalonePage: true,
          apiSaved: true,
        };
        localStorage.setItem(
          `examination_completed_${patientId}`,
          JSON.stringify(dataToStore)
        );
        console.log("💾 Saved examination data to localStorage:", dataToStore);

        const actionText =
          existingResults && existingResults.length > 0 ? "Cập nhật" : "Lưu";
        message.success(
          `🎉 ${actionText} kết quả khám thành công! ${
            existingResults && existingResults.length > 0
              ? ""
              : "Hiển thị kết quả bên dưới."
          }`
        );

        // Update with saved result if API succeeded
        setSubmittedData(savedResult || examinationData);

        // Store completed examination for TreatmentProcess sync
        const syncDataToStore = {
          ...(savedResult || examinationData),
          completedAt: new Date().toISOString(),
          fromStandalonePage: true,
          apiSaved: true,
        };
        localStorage.setItem(
          `examination_completed_${patientId}`,
          JSON.stringify(syncDataToStore)
        );
        console.log(
          "💾 Synced examination data to localStorage:",
          syncDataToStore
        );

        // Dispatch custom event to notify TreatmentProcess
        const syncEvent = new CustomEvent("examinationCompleted", {
          detail: {
            patientId,
            examinationData: savedResult || examinationData,
          },
        });
        window.dispatchEvent(syncEvent);
        console.log(
          "🔔 Dispatched examinationCompleted event:",
          syncEvent.detail
        );

        // Update treatment state manager
        treatmentStateManager.updateExamination(
          patientId,
          savedResult || examinationData
        );
        console.log("💾 Updated treatment state manager");

        // Dispatch additional event for auto progress
        const progressEvent = new CustomEvent("stepCompleted", {
          detail: {
            patientId,
            stepIndex: 0,
            stepName: "Khám lâm sàng",
            data: savedResult || examinationData,
            autoAdvance: true,
          },
        });
        window.dispatchEvent(progressEvent);
        console.log("🔔 Dispatched stepCompleted event:", progressEvent.detail);

        // Force refresh state manager để đảm bảo cập nhật
        setTimeout(() => {
          treatmentStateManager.forceRefresh();
          console.log("🔄 Forced refresh of treatment state manager");
        }, 500);
      } catch (apiError) {
        console.error("API save failed:", apiError);
        message.error(
          "❌ Không thể lưu kết quả khám. Vui lòng kiểm tra kết nối và thử lại."
        );

        // Still dispatch events even if API fails
        console.log("🔄 Dispatching events despite API failure...");

        // Dispatch custom event to notify TreatmentProcess
        const syncEvent = new CustomEvent("examinationCompleted", {
          detail: {
            patientId,
            examinationData: examinationData, // Use local data
          },
        });
        window.dispatchEvent(syncEvent);
        console.log(
          "🔔 Dispatched examinationCompleted event (API failed):",
          syncEvent.detail
        );

        // Update treatment state manager
        treatmentStateManager.updateExamination(
          patientId,
          examinationData // Use local data
        );
        console.log("💾 Updated treatment state manager (API failed)");

        // Dispatch additional event for auto progress
        const progressEvent = new CustomEvent("stepCompleted", {
          detail: {
            patientId,
            stepIndex: 0,
            stepName: "Khám lâm sàng",
            data: examinationData, // Use local data
            autoAdvance: true,
          },
        });
        window.dispatchEvent(progressEvent);
        console.log(
          "🔔 Dispatched stepCompleted event (API failed):",
          progressEvent.detail
        );
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

                {/* Chuẩn đoán lâm sàng */}
                <Row gutter={24}>
                  <Col span={24}>
                    <Form.Item
                      label="🔍 Chuẩn đoán lâm sàng"
                      name="diagnosis"
                      rules={[
                        { required: true, message: "Vui lòng nhập chuẩn đoán" },
                      ]}
                    >
                      <div
                        style={{
                          marginBottom: 8,
                          display: "flex",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: 8,
                        }}
                      >
                        <Select
                          placeholder="Chọn chẩn đoán nhanh"
                          style={{ width: 200 }}
                          size="small"
                          onChange={(value) =>
                            form.setFieldsValue({ diagnosis: value })
                          }
                          allowClear
                        >
                          <Option
                            value="Vô sinh nguyên phát"
                            label="Vô sinh nguyên phát"
                          >
                            <div
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <span
                                style={{ color: "#ff4d4f", marginRight: 8 }}
                              >
                                🔴
                              </span>
                              Vô sinh nguyên phát
                            </div>
                          </Option>
                          <Option
                            value="Vô sinh thứ phát"
                            label="Vô sinh thứ phát"
                          >
                            <div
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <span
                                style={{ color: "#ff4d4f", marginRight: 8 }}
                              >
                                🔴
                              </span>
                              Vô sinh thứ phát
                            </div>
                          </Option>
                          <Option
                            value="Rối loạn rụng trứng"
                            label="Rối loạn rụng trứng"
                          >
                            <div
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <span
                                style={{ color: "#faad14", marginRight: 8 }}
                              >
                                🟡
                              </span>
                              Rối loạn rụng trứng
                            </div>
                          </Option>
                          <Option
                            value="Tắc ống dẫn trứng"
                            label="Tắc ống dẫn trứng"
                          >
                            <div
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <span
                                style={{ color: "#ff4d4f", marginRight: 8 }}
                              >
                                🔴
                              </span>
                              Tắc ống dẫn trứng
                            </div>
                          </Option>
                          <Option
                            value="Lạc nội mạc tử cung"
                            label="Lạc nội mạc tử cung"
                          >
                            <div
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <span
                                style={{ color: "#ff4d4f", marginRight: 8 }}
                              >
                                🔴
                              </span>
                              Lạc nội mạc tử cung
                            </div>
                          </Option>
                          <Option
                            value="Hội chứng buồng trứng đa nang (PCOS)"
                            label="PCOS"
                          >
                            <div
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <span
                                style={{ color: "#faad14", marginRight: 8 }}
                              >
                                🟡
                              </span>
                              Hội chứng buồng trứng đa nang (PCOS)
                            </div>
                          </Option>
                          <Option
                            value="AMH thấp - Dự trữ buồng trứng kém"
                            label="AMH thấp"
                          >
                            <div
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <span
                                style={{ color: "#ff4d4f", marginRight: 8 }}
                              >
                                🔴
                              </span>
                              AMH thấp - Dự trữ buồng trứng kém
                            </div>
                          </Option>
                          <Option
                            value="Tuổi cao - Dự trữ buồng trứng giảm"
                            label="Tuổi cao"
                          >
                            <div
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <span
                                style={{ color: "#faad14", marginRight: 8 }}
                              >
                                🟡
                              </span>
                              Tuổi cao - Dự trữ buồng trứng giảm
                            </div>
                          </Option>
                          <Option
                            value="Tinh trùng yếu - Nam giới"
                            label="Tinh trùng yếu"
                          >
                            <div
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <span
                                style={{ color: "#1890ff", marginRight: 8 }}
                              >
                                🔵
                              </span>
                              Tinh trùng yếu - Nam giới
                            </div>
                          </Option>
                          <Option
                            value="Vô tinh trùng - Nam giới"
                            label="Vô tinh trùng"
                          >
                            <div
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <span
                                style={{ color: "#ff4d4f", marginRight: 8 }}
                              >
                                🔴
                              </span>
                              Vô tinh trùng - Nam giới
                            </div>
                          </Option>
                          <Option
                            value="Rối loạn nội tiết tố"
                            label="Rối loạn nội tiết"
                          >
                            <div
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <span
                                style={{ color: "#faad14", marginRight: 8 }}
                              >
                                🟡
                              </span>
                              Rối loạn nội tiết tố
                            </div>
                          </Option>
                          <Option value="U xơ tử cung" label="U xơ tử cung">
                            <div
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <span
                                style={{ color: "#faad14", marginRight: 8 }}
                              >
                                🟡
                              </span>
                              U xơ tử cung
                            </div>
                          </Option>
                        </Select>
                        <Button
                          size="small"
                          type="text"
                          style={{
                            border: "1px solid #d9d9d9",
                            borderRadius: 6,
                            fontSize: 11,
                            height: 28,
                          }}
                          onClick={() =>
                            form.setFieldsValue({
                              diagnosis: "Vô sinh nguyên phát",
                            })
                          }
                        >
                          🔴 Vô sinh nguyên phát
                        </Button>
                        <Button
                          size="small"
                          type="text"
                          style={{
                            border: "1px solid #d9d9d9",
                            borderRadius: 6,
                            fontSize: 11,
                            height: 28,
                          }}
                          onClick={() =>
                            form.setFieldsValue({
                              diagnosis: "Rối loạn rụng trứng",
                            })
                          }
                        >
                          🟡 Rối loạn rụng trứng
                        </Button>
                        <Button
                          size="small"
                          type="text"
                          style={{
                            border: "1px solid #d9d9d9",
                            borderRadius: 6,
                            fontSize: 11,
                            height: 28,
                          }}
                          onClick={() =>
                            form.setFieldsValue({
                              diagnosis: "Tắc ống dẫn trứng",
                            })
                          }
                        >
                          🔴 Tắc ống dẫn trứng
                        </Button>
                        <Button
                          size="small"
                          type="text"
                          style={{
                            border: "1px solid #d9d9d9",
                            borderRadius: 6,
                            fontSize: 11,
                            height: 28,
                          }}
                          onClick={() =>
                            form.setFieldsValue({
                              diagnosis: "AMH thấp - Dự trữ buồng trứng kém",
                            })
                          }
                        >
                          🔴 AMH thấp
                        </Button>
                      </div>
                      <TextArea
                        rows={3}
                        placeholder="Nhập chuẩn đoán..."
                        className="examination-textarea"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                {/* Upload file đính kèm */}
                <Form.Item label="📎 File đính kèm">
                  <Upload
                    {...uploadProps}
                    multiple
                    className="examination-upload"
                    showUploadList={false}
                  >
                    <Button icon={<UploadOutlined />} size="small">
                      Chọn file
                    </Button>
                  </Upload>
                  {attachments.length > 0 && (
                    <div
                      style={{ marginTop: 8, fontSize: "12px", color: "#666" }}
                    >
                      Đã chọn {attachments.length} file
                    </div>
                  )}
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
                        form.setFieldsValue({
                          diagnosis: "Vô sinh nguyên phát",
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
                            localStorage.removeItem(
                              `examination_completed_${patientId}`
                            );
                          }}
                        >
                          Chỉnh sửa
                        </Button>
                        <Button
                          icon={<ReloadOutlined />}
                          className="action-btn reset-btn"
                          onClick={() => {
                            backupData();
                            setIsCompleted(false);
                            setSubmittedData(null);
                            setOriginalData(null);
                            localStorage.removeItem(
                              `examination_completed_${patientId}`
                            );
                            localStorage.removeItem(
                              `examination_draft_${patientId}`
                            );
                            form.resetFields();
                            setSymptoms([]);
                            setLabResults({});
                            setAttachments([]);
                          }}
                        >
                          Đặt lại
                        </Button>
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
                            {submittedData.clinicalSigns?.bloodPressure ? (
                              <Tag className="result-clinical-tag">
                                {submittedData.clinicalSigns.bloodPressure}
                              </Tag>
                            ) : (
                              "Chưa đo"
                            )}
                          </Descriptions.Item>
                          <Descriptions.Item label="Nhiệt độ">
                            {submittedData.clinicalSigns?.temperature ? (
                              <Tag className="result-clinical-tag">
                                {submittedData.clinicalSigns.temperature}°C
                              </Tag>
                            ) : (
                              "Chưa đo"
                            )}
                          </Descriptions.Item>
                          <Descriptions.Item label="Nhịp tim">
                            {submittedData.clinicalSigns?.heartRate ? (
                              <Tag className="result-clinical-tag">
                                {submittedData.clinicalSigns.heartRate} lần/phút
                              </Tag>
                            ) : (
                              "Chưa đo"
                            )}
                          </Descriptions.Item>
                          <Descriptions.Item label="Cân nặng">
                            {submittedData.clinicalSigns?.weight ? (
                              <Tag className="result-clinical-tag">
                                {submittedData.clinicalSigns.weight} kg
                              </Tag>
                            ) : (
                              "Chưa đo"
                            )}
                          </Descriptions.Item>
                          <Descriptions.Item label="Chiều cao">
                            {submittedData.clinicalSigns?.height ? (
                              <Tag className="result-clinical-tag">
                                {submittedData.clinicalSigns.height} cm
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
                            {submittedData.symptoms?.length > 0 ? (
                              <Space wrap>
                                {submittedData.symptoms.map(
                                  (symptom, index) => (
                                    <Tag
                                      key={index}
                                      className="result-symptom-tag"
                                    >
                                      {symptom}
                                    </Tag>
                                  )
                                )}
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
                              <Space wrap>
                                {Object.entries(
                                  submittedData.labResults.bloodTest
                                ).map(([test, value], idx) => (
                                  <Tag
                                    key={test}
                                    className="result-bloodtest-tag"
                                  >
                                    <Text strong>{test}:</Text> {value || "N/A"}
                                  </Tag>
                                ))}
                              </Space>
                            ) : (
                              "Chưa có kết quả xét nghiệm"
                            )}
                          </Descriptions.Item>
                          <Descriptions.Item label="Kết quả siêu âm" span={2}>
                            {submittedData.labResults?.ultrasound ? (
                              <Tag className="result-ultrasound-tag">
                                {submittedData.labResults.ultrasound}
                              </Tag>
                            ) : (
                              "Chưa có kết quả siêu âm"
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
