import React, { useState, useEffect } from "react";
import {
  Card,
  Steps,
  Button,
  Space,
  Typography,
  Row,
  Col,
  message,
  Spin,
  Result,
  Progress,
  Tag,
  Timeline,
  Badge,
  Alert,
  Statistic,
  Table,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Rate,
} from "antd";
import {
  UserOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  HeartOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  EyeOutlined,
  PrinterOutlined,
  StarOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";

import ExaminationForm from "./ExaminationForm";
import TreatmentPlanEditor from "./TreatmentPlanEditor";
import TreatmentScheduleForm from "./TreatmentScheduleForm";
import PatientScheduleView from "./PatientScheduleView";
import { treatmentStateManager } from "../../../utils/treatmentStateManager";
import "./TreatmentProcess.css";

const { Step } = Steps;
const { Title, Text } = Typography;
const { TextArea } = Input;

const TreatmentProcess = ({ patientId, mode = "doctor" }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [processData, setProcessData] = useState({
    patient: null,
    examination: null,
    treatmentPlan: null,
    schedule: null,
    progress: null,
  });

  // States for progress tracking
  const [sessionUpdateModal, setSessionUpdateModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [progressForm] = Form.useForm();

  // Mock patient data - sẽ được cập nhật trong quá trình
  const mockPatientInfo = {
    id: patientId || "1",
    name: "Nguyễn Thị Mai",
    gender: "female",
    dob: "1992-03-15",
    contact: "0909123456",
    address: "123 Đường ABC, Quận 1, TP.HCM",
    age: 32,
  };

  // Mock treatment progress data
  const mockProgressData = {
    totalSessions: 12,
    completedSessions: 5,
    upcomingSessions: 7,
    currentPhase: "Chuẩn bị trứng",
    phaseProgress: 60,
    overallProgress: 42,
    lastUpdated: "2024-01-20",
    recentActivities: [
      {
        date: "2024-01-20",
        activity: "Tiêm hormone kích thích buồng trứng",
        status: "completed",
        notes: "Phản ứng tốt, theo dõi tiếp",
        rating: 4,
      },
      {
        date: "2024-01-18",
        activity: "Siêu âm theo dõi nang trứng",
        status: "completed",
        notes: "Nang trứng phát triển tốt",
        rating: 5,
      },
      {
        date: "2024-01-15",
        activity: "Bắt đầu chu kỳ điều trị",
        status: "completed",
        notes: "Bệnh nhân hiểu rõ quy trình",
        rating: 4,
      },
    ],
  };

  // Load patient info and sync with treatment state on mount
  useEffect(() => {
    setProcessData((prev) => ({
      ...prev,
      patient: mockPatientInfo,
    }));

    // Initialize treatment state for this patient
    const currentState = treatmentStateManager.getCurrentState();
    if (
      !currentState.patientId ||
      currentState.patientId !== (patientId || "1")
    ) {
      treatmentStateManager.initializePatient(
        patientId || "1",
        mockPatientInfo
      );
    }

    // Load existing data from state manager
    syncWithStateManager();
  }, [patientId]);

  // Sync with state manager
  const syncWithStateManager = () => {
    const state = treatmentStateManager.getCurrentState();
    if (state.patientId === (patientId || "1")) {
      // console.log("🔄 Syncing TreatmentProcess with state manager:", state);

      // Update process data
      setProcessData((prev) => ({
        ...prev,
        examination: state.data.examination,
        treatmentPlan: state.data.treatmentPlan,
        schedule: state.data.schedule,
        progress: state.data.progress,
      }));

      // Update current step
      setCurrentStep(state.currentStep);

      // Show sync message if we have completed data
      if (state.completedSteps.length > 0) {
        // message.success(
        //   `🔄 Đã đồng bộ ${state.completedSteps.length} bước hoàn thành từ các trang riêng lẻ`
        // );
      }
    }
  };

  // Check for completed examination data from standalone page on mount
  useEffect(() => {
    const checkExaminationSync = () => {
      const completedExam = localStorage.getItem(
        `examination_completed_${patientId || "1"}`
      );
      if (completedExam) {
        try {
          const examData = JSON.parse(completedExam);
          if (examData.fromStandalonePage) {
            // console.log(
            //   "🔄 Syncing examination data from standalone page:",
            //   examData
            // );

            // Update process data with examination results
            setProcessData((prev) => ({
              ...prev,
              examination: examData,
            }));

            // Don't auto advance - let user control navigation
            // message.success(
            //   "✅ Đã đồng bộ kết quả khám lâm sàng! Sẵn sàng chuyển sang bước lập phác đồ."
            // );
          }
        } catch (error) {
          console.error("Error parsing examination data:", error);
        }
      }
    };

    // Check on mount
    checkExaminationSync();

    // Listen for examination completion events
    const handleExaminationCompleted = (event) => {
      const { patientId: eventPatientId, examinationData } = event.detail;
      if (eventPatientId === (patientId || "1")) {
        // console.log(
        //   "🔄 Real-time sync: Examination completed",
        //   examinationData
        // );

        setProcessData((prev) => ({
          ...prev,
          examination: examinationData,
        }));

        // Don't auto advance - let user control navigation
        // message.success(
        //   "✅ Khám lâm sàng đã hoàn thành! Có thể chuyển sang lập phác đồ."
        // );
      }
    };

    // Listen for print events
    const handleExaminationPrinted = (event) => {
      const { patientId: eventPatientId, examinationData } = event.detail;
      if (eventPatientId === (patientId || "1")) {
        // console.log("📄 Examination printed, syncing data", examinationData);

        setProcessData((prev) => ({
          ...prev,
          examination: examinationData,
        }));

        // Don't auto advance - let user control navigation
        // message.success(
        //   "📄 Đã in kết quả khám! Có thể chuyển sang lập phác đồ."
        // );
      }
    };

    // Listen for real-time state updates
    const handleStateUpdate = (event) => {
      const { patientId: eventPatientId, state } = event.detail;
      if (eventPatientId === (patientId || "1")) {
        // console.log("🔔 Received state update:", event.type, state);
        syncWithStateManager();
      }
    };

    // Add event listeners
    window.addEventListener("examinationCompleted", handleExaminationCompleted);
    window.addEventListener("examinationPrinted", handleExaminationPrinted);

    // Add state manager event listeners for real-time sync
    treatmentStateManager.addEventListener(
      "examination:completed",
      handleStateUpdate
    );
    treatmentStateManager.addEventListener(
      "treatmentplan:completed",
      handleStateUpdate
    );
    treatmentStateManager.addEventListener(
      "schedule:completed",
      handleStateUpdate
    );
    treatmentStateManager.addEventListener("step:changed", handleStateUpdate);

    // Cleanup
    return () => {
      window.removeEventListener(
        "examinationCompleted",
        handleExaminationCompleted
      );
      window.removeEventListener(
        "examinationPrinted",
        handleExaminationPrinted
      );

      // Remove state manager listeners
      treatmentStateManager.removeEventListener(
        "examination:completed",
        handleStateUpdate
      );
      treatmentStateManager.removeEventListener(
        "treatmentplan:completed",
        handleStateUpdate
      );
      treatmentStateManager.removeEventListener(
        "schedule:completed",
        handleStateUpdate
      );
      treatmentStateManager.removeEventListener(
        "step:changed",
        handleStateUpdate
      );
    };
  }, [currentStep, patientId]);

  useEffect(() => {
    setProcessData((prev) => ({
      ...prev,
      progress: mockProgressData,
    }));
  }, [patientId]);

  const steps = [
    {
      title: "Khám tổng quát",
      description: "Nhập kết quả khám và xét nghiệm",
      icon: <FileTextOutlined />,
      component: ExaminationForm,
      color: "#ff6b9d",
    },
    {
      title: "Lập phác đồ",
      description: "Chọn và cá nhân hóa phác đồ điều trị",
      icon: <MedicineBoxOutlined />,
      component: TreatmentPlanEditor,
      color: "#ff758c",
    },
    {
      title: "Lập lịch điều trị",
      description: "Tạo lịch trình các buổi điều trị",
      icon: <CalendarOutlined />,
      component: TreatmentScheduleForm,
      color: "#ff7eb3",
    },
    {
      title: "Theo dõi tiến trình",
      description: "Cập nhật và theo dõi các buổi điều trị",
      icon: <PlayCircleOutlined />,
      component: "TreatmentProgress",
      color: "#ff9cbd",
    },
    {
      title: "Hoàn thành dịch vụ",
      description: "Tổng kết và hoàn tất quy trình",
      icon: <CheckCircleOutlined />,
      component: PatientScheduleView,
      color: "#ffb3cd",
    },
  ];

  const handleNext = (stepData) => {
    const stepKeys = ["examination", "treatmentPlan", "schedule", "progress"];
    const currentStepKey = stepKeys[currentStep];

    setProcessData((prev) => ({
      ...prev,
      [currentStepKey]: stepData,
    }));

    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
      // message.success(`Đã hoàn thành bước ${currentStep + 1}`);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleUpdateSession = (session) => {
    setSelectedSession(session);
    progressForm.setFieldsValue({
      status: session.status,
      notes: session.notes || "",
      rating: session.rating || 3,
    });
    setSessionUpdateModal(true);
  };

  const handleSubmitSessionUpdate = async () => {
    try {
      const values = await progressForm.validateFields();

      // Cập nhật session trong progress data
      const updatedActivities = processData.progress.recentActivities.map(
        (activity) =>
          activity.date === selectedSession.date
            ? { ...activity, ...values, lastUpdated: new Date().toISOString() }
            : activity
      );

      setProcessData((prev) => ({
        ...prev,
        progress: {
          ...prev.progress,
          recentActivities: updatedActivities,
          lastUpdated: new Date().toLocaleDateString("vi-VN"),
        },
      }));

      setSessionUpdateModal(false);
      // message.success("Đã cập nhật tiến trình điều trị");
    } catch (error) {
      console.error("Update session error:", error);
      // message.error("Lỗi khi cập nhật tiến trình");
    }
  };

  const renderTreatmentProgress = () => {
    const { progress } = processData;

    const columns = [
      {
        title: "Ngày",
        dataIndex: "date",
        key: "date",
        render: (date) => (
          <div className="treatment-date">
            <CalendarOutlined />
            <span>{new Date(date).toLocaleDateString("vi-VN")}</span>
          </div>
        ),
      },
      {
        title: "Hoạt động",
        dataIndex: "activity",
        key: "activity",
        render: (activity) => (
          <div className="treatment-activity">
            <MedicineBoxOutlined />
            <span>{activity}</span>
          </div>
        ),
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        render: (status) => {
          const statusConfig = {
            completed: {
              color: "success",
              text: "Hoàn thành",
              icon: <CheckCircleOutlined />,
            },
            in_progress: {
              color: "processing",
              text: "Đang thực hiện",
              icon: <PlayCircleOutlined />,
            },
            pending: {
              color: "warning",
              text: "Chờ thực hiện",
              icon: <ClockCircleOutlined />,
            },
            cancelled: {
              color: "error",
              text: "Đã hủy",
              icon: <PauseCircleOutlined />,
            },
          };
          const config = statusConfig[status] || statusConfig.pending;
          return (
            <Tag color={config.color} className="status-tag">
              {config.icon}
              {config.text}
            </Tag>
          );
        },
      },
      {
        title: "Đánh giá",
        dataIndex: "rating",
        key: "rating",
        render: (rating) => (
          <div className="treatment-rating">
            {rating ? (
              <Rate disabled value={rating} style={{ fontSize: 14 }} />
            ) : (
              <Text type="secondary">Chưa đánh giá</Text>
            )}
          </div>
        ),
      },
      {
        title: "Thao tác",
        key: "actions",
        render: (_, record) => (
          <Button
            type="primary"
            size="small"
            onClick={() => handleUpdateSession(record)}
            disabled={mode === "patient"}
            className="update-btn"
            icon={<EyeOutlined />}
          >
            Cập nhật
          </Button>
        ),
      },
    ];

    return (
      <div className="treatment-progress-container">
        {/* Tổng quan tiến trình */}
        <Row gutter={[24, 24]} className="progress-stats">
          <Col span={6}>
            <Card className="stat-card total-sessions">
              <div className="stat-icon">
                <CalendarOutlined />
              </div>
              <Statistic
                title="Tổng số buổi"
                value={progress.totalSessions}
                valueStyle={{ color: "#ff6b9d", fontWeight: "bold" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className="stat-card completed-sessions">
              <div className="stat-icon">
                <CheckCircleOutlined />
              </div>
              <Statistic
                title="Đã hoàn thành"
                value={progress.completedSessions}
                valueStyle={{ color: "#52c41a", fontWeight: "bold" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className="stat-card upcoming-sessions">
              <div className="stat-icon">
                <ClockCircleOutlined />
              </div>
              <Statistic
                title="Sắp tới"
                value={progress.upcomingSessions}
                valueStyle={{ color: "#1890ff", fontWeight: "bold" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className="stat-card progress-percentage">
              <div className="stat-icon">
                <TrophyOutlined />
              </div>
              <Statistic
                title="Tiến độ"
                value={progress.overallProgress}
                suffix="%"
                valueStyle={{ color: "#ff758c", fontWeight: "bold" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Giai đoạn hiện tại */}
        <Card
          className="current-phase-card"
          title={
            <div className="phase-title">
              <ThunderboltOutlined />
              <span>Giai đoạn điều trị hiện tại</span>
            </div>
          }
        >
          <div className="phase-info">
            <div className="phase-details">
              <Text strong>Giai đoạn: </Text>
              <Badge status="processing" text={progress.currentPhase} />
              <Text type="secondary" style={{ marginLeft: 16 }}>
                Cập nhật lần cuối: {progress.lastUpdated}
              </Text>
            </div>
            <div className="phase-progress">
              <Progress
                percent={progress.phaseProgress}
                status="active"
                strokeColor={{
                  "0%": "#ff7eb3",
                  "100%": "#ff6b9d",
                }}
                trailColor="rgba(255, 126, 179, 0.1)"
                strokeWidth={12}
              />
            </div>
          </div>
        </Card>

        {/* Lịch sử hoạt động */}
        <Card
          className="activity-history-card"
          title={
            <div className="activity-title">
              <StarOutlined />
              <span>Lịch sử điều trị</span>
            </div>
          }
        >
          <Table
            columns={columns}
            dataSource={progress.recentActivities}
            rowKey="date"
            pagination={false}
            size="small"
            className="treatment-table"
          />
        </Card>

        {/* Modal cập nhật session */}
        <Modal
          title={
            <div className="modal-title">
              <MedicineBoxOutlined />
              <span>Cập nhật tiến trình điều trị</span>
            </div>
          }
          open={sessionUpdateModal}
          onOk={handleSubmitSessionUpdate}
          onCancel={() => setSessionUpdateModal(false)}
          width={600}
          className="update-session-modal"
        >
          <Form form={progressForm} layout="vertical">
            <Form.Item label="Hoạt động">
              <Input value={selectedSession?.activity} disabled />
            </Form.Item>

            <Form.Item
              name="status"
              label="Trạng thái"
              rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
            >
              <Select>
                <Select.Option value="completed">Hoàn thành</Select.Option>
                <Select.Option value="in_progress">
                  Đang thực hiện
                </Select.Option>
                <Select.Option value="pending">Chờ thực hiện</Select.Option>
                <Select.Option value="cancelled">Đã hủy</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name="rating" label="Đánh giá hiệu quả (1-5 sao)">
              <Rate />
            </Form.Item>

            <Form.Item name="notes" label="Ghi chú">
              <TextArea
                rows={4}
                placeholder="Nhập ghi chú về buổi điều trị..."
              />
            </Form.Item>
          </Form>
        </Modal>

        {/* Navigation buttons cho bước này */}
        <div className="step-navigation">
          <Space size="large">
            <Button
              onClick={handlePrevious}
              className="nav-btn prev-btn"
              icon={<ArrowLeftOutlined />}
            >
              Quay lại
            </Button>
            <Button
              type="primary"
              onClick={() => handleNext(progress)}
              disabled={
                progress.completedSessions < progress.totalSessions * 0.8
              }
              className="nav-btn next-btn"
              icon={<ArrowRightOutlined />}
            >
              Hoàn thành quy trình
            </Button>
          </Space>
          {progress.completedSessions < progress.totalSessions * 0.8 && (
            <div className="completion-requirement">
              <Alert
                message="Yêu cầu hoàn thành"
                description="Cần hoàn thành ít nhất 80% các buổi điều trị để kết thúc quy trình"
                type="info"
                showIcon
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    const StepComponent = steps[currentStep].component;

    // Nếu là component string (như TreatmentProgress), render custom
    if (typeof StepComponent === "string") {
      switch (StepComponent) {
        case "TreatmentProgress":
          return renderTreatmentProgress();
        default:
          return null;
      }
    }

    const commonProps = {
      patientId: processData.patient?.id,
      patientInfo: processData.patient,
      onNext: handleNext,
    };

    switch (currentStep) {
      case 0: // Khám tổng quát
        return <StepComponent {...commonProps} />;
      case 1: // Lập phác đồ
        return (
          <StepComponent
            {...commonProps}
            examinationData={processData.examination}
          />
        );
      case 2: // Lập lịch điều trị
        return (
          <StepComponent
            {...commonProps}
            treatmentPlan={processData.treatmentPlan}
            examinationData={processData.examination}
          />
        );
      case 3: // Theo dõi tiến trình
        return renderTreatmentProgress();
      case 4: // Hoàn thành dịch vụ
        return (
          <StepComponent {...commonProps} isPatientView={mode === "patient"} />
        );
      default:
        return null;
    }
  };

  if (!processData.patient) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <Spin size="large" />
          <div className="loading-text">
            <Text>Đang tải thông tin bệnh nhân...</Text>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="treatment-process-container">
      <div className="treatment-process-content">
        <Card className="main-card">
          <div className="header-section">
            <Title level={2} className="main-title">
              <Space>
                <HeartOutlined className="title-icon" />
                Quy Trình Điều Trị IVF
              </Space>
            </Title>
          </div>

          {/* Thông tin bệnh nhân với examination status */}
          <Card className="patient-info-card">
            <Row gutter={16} align="middle">
              <Col span={5}>
                <div className="info-item">
                  <UserOutlined className="info-icon" />
                  <div>
                    <Text type="secondary">Bệnh nhân</Text>
                    <div className="info-value">{processData.patient.name}</div>
                  </div>
                </div>
              </Col>
              <Col span={4}>
                <div className="info-item">
                  <div>
                    <Text type="secondary">Giới tính</Text>
                    <div className="info-value">
                      {processData.patient.gender === "male" ? "Nam" : "Nữ"}
                    </div>
                  </div>
                </div>
              </Col>
              <Col span={4}>
                <div className="info-item">
                  <div>
                    <Text type="secondary">Tuổi</Text>
                    <div className="info-value">{processData.patient.age}</div>
                  </div>
                </div>
              </Col>
              <Col span={5}>
                <div className="info-item">
                  <div>
                    <Text type="secondary">Liên hệ</Text>
                    <div className="info-value">
                      {processData.patient.contact}
                    </div>
                  </div>
                </div>
              </Col>
              <Col span={6}>
                <div className="info-item process-status">
                  <div>
                    <Text type="secondary">Quy trình</Text>
                    <div className="info-value">
                      <Tag className="step-tag">Bước {currentStep + 1}/5</Tag>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>

          {/* Alert when examination data synced from standalone page */}
          {processData.examination?.fromStandalonePage && (
            <Alert
              message="🔄 Đã đồng bộ kết quả khám lâm sàng"
              description={`Kết quả khám từ trang riêng đã được cập nhật thành công. Chẩn đoán: "${processData.examination.diagnosis}". Bạn có thể tiếp tục với bước lập phác đồ.`}
              type="success"
              showIcon
              closable
              className="sync-alert"
              action={
                <Space>
                  <Button
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => {
                      Modal.info({
                        title: "Chi tiết kết quả khám",
                        content: (
                          <div>
                            <p>
                              <strong>Chẩn đoán:</strong>{" "}
                              {processData.examination.diagnosis}
                            </p>
                            <p>
                              <strong>Khuyến nghị:</strong>{" "}
                              {processData.examination.recommendations}
                            </p>
                            <p>
                              <strong>Thời gian hoàn thành:</strong>{" "}
                              {new Date(
                                processData.examination.completedAt
                              ).toLocaleString("vi-VN")}
                            </p>
                            {processData.examination.symptoms?.length > 0 && (
                              <p>
                                <strong>Triệu chứng:</strong>{" "}
                                {processData.examination.symptoms.join(", ")}
                              </p>
                            )}
                          </div>
                        ),
                        width: 600,
                      });
                    }}
                  >
                    Xem chi tiết
                  </Button>

                  {currentStep === 0 && (
                    <Button
                      type="primary"
                      size="small"
                      icon={<ArrowRightOutlined />}
                      onClick={() => {
                        setCurrentStep(1);
                      }}
                    >
                      Chuyển sang lập phác đồ
                    </Button>
                  )}
                </Space>
              }
            />
          )}

          {/* Steps - quy trình theo thứ tự với trạng thái từ state manager */}
          <div className="steps-section">
            <Steps current={currentStep} className="treatment-steps">
              {steps.map((step, index) => {
                const stepData = treatmentStateManager.getStepData(index);
                let stepStatus = stepData.status;
                let stepDescription = step.description;

                if (stepData.isCompleted) {
                  stepStatus = "finish";
                  stepDescription = `✅ Đã hoàn thành${
                    stepData.completedAt
                      ? ` - ${new Date(stepData.completedAt).toLocaleString(
                          "vi-VN"
                        )}`
                      : ""
                  }`;
                } else if (index === currentStep) {
                  stepStatus = "process";
                } else if (index < currentStep) {
                  stepStatus = "finish";
                } else {
                  stepStatus = "wait";
                }

                return (
                  <Step
                    key={index}
                    title={step.title}
                    description={stepDescription}
                    icon={step.icon}
                    status={stepStatus}
                    className={`step-${index} ${stepStatus}`}
                  />
                );
              })}
            </Steps>
          </div>

          {/* Progress summary từ state manager */}
          <Card className="progress-summary-card">
            {(() => {
              const progress = treatmentStateManager.getOverallProgress();
              return (
                <Row gutter={16} align="middle">
                  <Col span={14}>
                    <div className="progress-info">
                      <Text strong>Tiến độ tổng thể: </Text>
                      <Tag className="progress-tag">
                        {progress.completed}/{progress.total} bước
                      </Tag>
                      <Progress
                        percent={progress.percentage}
                        size="small"
                        strokeColor={{
                          "0%": "#ff7eb3",
                          "100%": "#ff6b9d",
                        }}
                        trailColor="rgba(255, 126, 179, 0.1)"
                        className="overall-progress"
                        status={
                          progress.current >= progress.total
                            ? "success"
                            : "active"
                        }
                      />
                    </div>
                  </Col>
                  <Col span={10} style={{ textAlign: "right" }}>
                    {progress.state.lastUpdated && (
                      <Text type="secondary" className="last-updated">
                        Cập nhật cuối:{" "}
                        {new Date(progress.state.lastUpdated).toLocaleString(
                          "vi-VN"
                        )}
                      </Text>
                    )}
                  </Col>
                </Row>
              );
            })()}
          </Card>

          {/* Navigation buttons */}
          {currentStep < steps.length - 1 && (
            <div className="main-navigation">
              <Space size="large">
                <Button
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="nav-btn prev-btn"
                  icon={<ArrowLeftOutlined />}
                >
                  Quay lại
                </Button>
                <div className="step-indicator">
                  <Text type="secondary">
                    Bước {currentStep + 1} / {steps.length}:{" "}
                    <span className="current-step-name">
                      {steps[currentStep].title}
                    </span>
                  </Text>
                </div>

                {currentStep === 0 && processData.examination && (
                  <Button
                    type="primary"
                    onClick={() => {
                      setCurrentStep(1);
                    }}
                    className="nav-btn next-btn"
                    icon={<ArrowRightOutlined />}
                  >
                    Tiếp theo: Lập phác đồ
                  </Button>
                )}
              </Space>
            </div>
          )}

          {/* Step content */}
          <div className="step-content-wrapper">{renderStepContent()}</div>

          {/* Completion message */}
          {currentStep === steps.length - 1 && processData.schedule && (
            <Result
              status="success"
              title="Hoàn thành quy trình điều trị!"
              subTitle="Quy trình điều trị IVF đã hoàn tất thành công. Bệnh nhân có thể theo dõi kết quả và nhận hướng dẫn chăm sóc sau điều trị."
              className="completion-result"
              extra={[
                <Button type="primary" key="view" className="result-btn">
                  <EyeOutlined />
                  Xem báo cáo tổng kết
                </Button>,
                <Button key="schedule" className="result-btn">
                  <CalendarOutlined />
                  Đặt lịch tái khám
                </Button>,
                <Button key="print" className="result-btn">
                  <PrinterOutlined />
                  In kết quả
                </Button>,
              ]}
            />
          )}
        </Card>
      </div>
    </div>
  );
};

export default TreatmentProcess;
