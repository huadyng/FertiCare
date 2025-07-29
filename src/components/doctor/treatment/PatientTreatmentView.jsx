import React, { useState, useEffect, useContext } from "react";
import {
  Card,
  Steps,
  Button,
  Row,
  Col,
  Typography,
  Space,
  Divider,
  Badge,
  Tag,
  Progress,
  Timeline,
  Avatar,
  Descriptions,
  Alert,
  message,
  Statistic,
  Tooltip,
  Spin,
  Empty,
} from "antd";
import {
  UserOutlined,
  HeartOutlined,
  FileTextOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  EditOutlined,
  ArrowLeftOutlined,
  MedicineBoxOutlined,
  PlayCircleOutlined,
  HistoryOutlined,
  CheckCircleOutlined as SuccessOutlined,
} from "@ant-design/icons";
import "../DoctorTheme.css";
import "./TreatmentProcess.css";
import "./PatientTreatmentView.css";
import { UserContext } from "../../../context/UserContext";
import apiDoctor from "../../../api/apiDoctor";

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

const PatientTreatmentView = ({ patient, onBack }) => {
  const { user } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [treatmentData, setTreatmentData] = useState({
    phases: [],
    history: [],
    clinicalResults: [],
  });
  const [error, setError] = useState(null);

  // Kiểm tra xem có patient hợp lệ không
  if (!patient || !patient.id) {
    return (
      <div style={{ padding: '20px' }}>
        <Card className="examination-main-card">
          <div className="examination-header">
            <Title level={2} className="examination-title">
              <Space>
                <UserOutlined className="title-icon" />
                Thông tin điều trị
              </Space>
            </Title>
          </div>
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            borderRadius: '12px',
            margin: '20px 0'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px', opacity: 0.6 }}>
              👨‍⚕️
            </div>
            <Title level={3} style={{ color: '#666', marginBottom: '16px' }}>
              Không có bệnh nhân được chọn
            </Title>
            <Text style={{ fontSize: '16px', color: '#888', display: 'block', marginBottom: '24px' }}>
              Vui lòng chọn bệnh nhân để xem thông tin điều trị
            </Text>
            <Button
              type="primary"
              size="large"
              icon={<UserOutlined />}
              style={{
                background: 'linear-gradient(135deg, #ff6b9d 0%, #ff758c 100%)',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                height: 'auto'
              }}
            >
              Chọn bệnh nhân
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    if (patient?.id) {
      loadTreatmentData();
    }
  }, [patient]);

  const loadTreatmentData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(
        "🏥 [PatientTreatmentView] Loading treatment data for patient:",
        patient.id
      );

      // Load all treatment data in parallel
      const [phasesResponse, historyResponse, clinicalResponse] =
        await Promise.allSettled([
          apiDoctor.getPatientTreatmentPhases(patient.id),
          apiDoctor.getPatientTreatmentHistory(patient.id),
          apiDoctor.getPatientClinicalResults(patient.id),
        ]);

      const treatmentData = {
        phases:
          phasesResponse.status === "fulfilled" ? phasesResponse.value : [],
        history:
          historyResponse.status === "fulfilled" ? historyResponse.value : [],
        clinicalResults:
          clinicalResponse.status === "fulfilled" ? clinicalResponse.value : [],
      };

      setTreatmentData(treatmentData);

      console.log(
        "✅ [PatientTreatmentView] Treatment data loaded:",
        treatmentData
      );
    } catch (error) {
      console.error(
        "❌ [PatientTreatmentView] Error loading treatment data:",
        error
      );
      setError("Không thể tải thông tin điều trị. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const getPhaseStatus = (phase) => {
    switch (phase.status?.toLowerCase()) {
      case "completed":
        return "finish";
      case "in progress":
        return "process";
      case "pending":
        return "wait";
      default:
        return "wait";
    }
  };

  const getPhaseIcon = (phase) => {
    switch (phase.status?.toLowerCase()) {
      case "completed":
        return <SuccessOutlined style={{ color: "#52c41a" }} />;
      case "in progress":
        return <PlayCircleOutlined style={{ color: "#1890ff" }} />;
      case "pending":
        return <ClockCircleOutlined style={{ color: "#faad14" }} />;
      default:
        return <ClockCircleOutlined style={{ color: "#d9d9d9" }} />;
    }
  };

  const renderPatientInfo = () => (
    <Card className="doctor-card" style={{ marginBottom: 24 }}>
      <Row gutter={[24, 16]} align="middle">
        <Col>
          <Avatar
            size={64}
            icon={<UserOutlined />}
            style={{
              background: "var(--primary-gradient)",
              boxShadow: "0 4px 12px var(--shadow-light)",
            }}
          />
        </Col>
        <Col flex="1">
          <Title level={4} style={{ margin: 0, color: "var(--text-dark)" }}>
            {patient.fullName || patient.name}
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            <UserOutlined style={{ marginRight: 4 }} />
            {patient.age} tuổi •
            <MedicineBoxOutlined style={{ margin: "0 4px" }} />
            {patient.treatmentType || "IVF"} •
            <CalendarOutlined style={{ margin: "0 4px" }} />
            {patient.phone || patient.contact}
          </Text>
          <div style={{ marginTop: 8 }}>
            <Progress
              percent={patient.progress || 0}
              size="small"
              className="doctor-progress"
              format={(percent) => (
                <Text style={{ fontSize: 12, color: "var(--primary-color)" }}>
                  <SuccessOutlined style={{ marginRight: 4 }} />
                  Tiến độ: {percent}%
                </Text>
              )}
            />
          </div>
        </Col>
        <Col>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={onBack}
            className="doctor-btn-secondary"
          >
            Quay lại
          </Button>
        </Col>
      </Row>
    </Card>
  );

  const renderTreatmentPhases = () => {
    if (!treatmentData.phases || treatmentData.phases.length === 0) {
      return (
        <Card className="doctor-card">
          <Empty
            description="Chưa có thông tin điều trị"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      );
    }

    return (
      <Card
        className="doctor-card"
        title={
          <Space>
            <MedicineBoxOutlined style={{ color: "var(--primary-color)" }} />
            <Text strong>Quy trình điều trị hiện tại</Text>
          </Space>
        }
      >
        <Steps
          direction="vertical"
          current={treatmentData.phases.findIndex(
            (phase) => phase.status === "In Progress"
          )}
          size="small"
        >
          {treatmentData.phases.map((phase, index) => (
            <Step
              key={phase.phaseId || index}
              title={
                <Space>
                  <Text strong>
                    {phase.phaseName || `Giai đoạn ${index + 1}`}
                  </Text>
                  {getPhaseIcon(phase)}
                </Space>
              }
              description={
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {phase.description || "Mô tả giai đoạn điều trị"}
                  </Text>
                  {phase.startDate && (
                    <div style={{ marginTop: 4 }}>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        <CalendarOutlined style={{ marginRight: 4 }} />
                        Bắt đầu:{" "}
                        {new Date(phase.startDate).toLocaleDateString("vi-VN")}
                      </Text>
                    </div>
                  )}
                  {phase.endDate && (
                    <div>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        <SuccessOutlined style={{ marginRight: 4 }} />
                        Hoàn thành:{" "}
                        {new Date(phase.endDate).toLocaleDateString("vi-VN")}
                      </Text>
                    </div>
                  )}
                </div>
              }
              status={getPhaseStatus(phase)}
            />
          ))}
        </Steps>
      </Card>
    );
  };

  const renderTreatmentHistory = () => {
    if (!treatmentData.history || treatmentData.history.length === 0) {
      return null;
    }

    return (
      <Card
        className="doctor-card"
        title={
          <Space>
            <HistoryOutlined style={{ color: "var(--secondary-color)" }} />
            <Text strong>Lịch sử điều trị</Text>
          </Space>
        }
      >
        <Timeline>
          {treatmentData.history.slice(0, 5).map((treatment, index) => (
            <Timeline.Item
              key={index}
              dot={<SuccessOutlined style={{ color: "#52c41a" }} />}
            >
              <div>
                <Text strong>
                  {treatment.treatmentName || `Điều trị ${index + 1}`}
                </Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {treatment.startDate &&
                    `Từ: ${new Date(treatment.startDate).toLocaleDateString(
                      "vi-VN"
                    )}`}
                  {treatment.endDate && (
                    <>
                      <SuccessOutlined style={{ margin: "0 4px" }} />
                      Đến:{" "}
                      {new Date(treatment.endDate).toLocaleDateString("vi-VN")}
                    </>
                  )}
                </Text>
                {treatment.result && (
                  <div style={{ marginTop: 4 }}>
                    <Tag color="green" icon={<SuccessOutlined />}>
                      Kết quả: {treatment.result}
                    </Tag>
                  </div>
                )}
              </div>
            </Timeline.Item>
          ))}
        </Timeline>
      </Card>
    );
  };

  const renderClinicalResults = () => {
    if (
      !treatmentData.clinicalResults ||
      treatmentData.clinicalResults.length === 0
    ) {
      return null;
    }

    return (
      <Card
        className="doctor-card"
        title={
          <Space>
            <SuccessOutlined style={{ color: "var(--success-color)" }} />
            <Text strong>Kết quả khám lâm sàng</Text>
          </Space>
        }
      >
        <Row gutter={[16, 16]}>
          {treatmentData.clinicalResults.slice(0, 3).map((result, index) => (
            <Col xs={24} sm={12} md={8} key={index}>
              <Card size="small" className="doctor-card">
                <Statistic
                  title={
                    <Space>
                      <SuccessOutlined
                        style={{ color: "var(--success-color)" }}
                      />
                      {result.testName || `Xét nghiệm ${index + 1}`}
                    </Space>
                  }
                  value={result.result || "N/A"}
                  valueStyle={{ fontSize: 16, color: "var(--text-dark)" }}
                />
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {result.date && (
                    <>
                      <SuccessOutlined style={{ marginRight: 4 }} />
                      {new Date(result.date).toLocaleDateString("vi-VN")}
                    </>
                  )}
                </Text>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text type="secondary">Đang tải thông tin điều trị...</Text>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Lỗi"
        description={error}
        type="error"
        showIcon
        action={
          <Button size="small" onClick={loadTreatmentData}>
            Thử lại
          </Button>
        }
      />
    );
  }

  return (
    <div className="patient-treatment-view">
      {renderPatientInfo()}

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          {renderTreatmentPhases()}
        </Col>
        <Col xs={24} lg={8}>
          <Space direction="vertical" style={{ width: "100%" }} size="large">
            {renderTreatmentHistory()}
            {renderClinicalResults()}
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default PatientTreatmentView;
