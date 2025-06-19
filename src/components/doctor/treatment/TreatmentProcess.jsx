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
} from "@ant-design/icons";

import ExaminationForm from "./ExaminationForm";
import TreatmentPlanEditor from "./TreatmentPlanEditor";
import TreatmentScheduleForm from "./TreatmentScheduleForm";
import PatientScheduleView from "./PatientScheduleView";
import { treatmentStateManager } from "../../../utils/treatmentStateManager";

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
      console.log("🔄 Syncing TreatmentProcess with state manager:", state);

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
        message.success(
          `🔄 Đã đồng bộ ${state.completedSteps.length} bước hoàn thành từ các trang riêng lẻ`
        );
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
            console.log(
              "🔄 Syncing examination data from standalone page:",
              examData
            );

            // Update process data with examination results
            setProcessData((prev) => ({
              ...prev,
              examination: examData,
            }));

            // Don't auto advance - let user control navigation
            message.success(
              "✅ Đã đồng bộ kết quả khám lâm sàng! Sẵn sàng chuyển sang bước lập phác đồ."
            );
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
        console.log(
          "🔄 Real-time sync: Examination completed",
          examinationData
        );

        setProcessData((prev) => ({
          ...prev,
          examination: examinationData,
        }));

        // Don't auto advance - let user control navigation
        message.success(
          "✅ Khám lâm sàng đã hoàn thành! Có thể chuyển sang lập phác đồ."
        );
      }
    };

    // Listen for print events
    const handleExaminationPrinted = (event) => {
      const { patientId: eventPatientId, examinationData } = event.detail;
      if (eventPatientId === (patientId || "1")) {
        console.log("📄 Examination printed, syncing data", examinationData);

        setProcessData((prev) => ({
          ...prev,
          examination: examinationData,
        }));

        // Don't auto advance - let user control navigation
        message.success(
          "📄 Đã in kết quả khám! Có thể chuyển sang lập phác đồ."
        );
      }
    };

    // Listen for real-time state updates
    const handleStateUpdate = (event) => {
      const { patientId: eventPatientId, state } = event.detail;
      if (eventPatientId === (patientId || "1")) {
        console.log("🔔 Received state update:", event.type, state);
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
    },
    {
      title: "Lập phác đồ",
      description: "Chọn và cá nhân hóa phác đồ điều trị",
      icon: <MedicineBoxOutlined />,
      component: TreatmentPlanEditor,
    },
    {
      title: "Lập lịch điều trị",
      description: "Tạo lịch trình các buổi điều trị",
      icon: <CalendarOutlined />,
      component: TreatmentScheduleForm,
    },
    {
      title: "Theo dõi tiến trình",
      description: "Cập nhật và theo dõi các buổi điều trị",
      icon: <PlayCircleOutlined />,
      component: "TreatmentProgress",
    },
    {
      title: "Hoàn thành dịch vụ",
      description: "Tổng kết và hoàn tất quy trình",
      icon: <CheckCircleOutlined />,
      component: PatientScheduleView,
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
      message.success(`Đã hoàn thành bước ${currentStep + 1}`);
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
      message.success("Đã cập nhật tiến trình điều trị");
    } catch (error) {
      console.error("Update session error:", error);
      message.error("Lỗi khi cập nhật tiến trình");
    }
  };

  const renderTreatmentProgress = () => {
    const { progress } = processData;

    const columns = [
      {
        title: "Ngày",
        dataIndex: "date",
        key: "date",
        render: (date) => new Date(date).toLocaleDateString("vi-VN"),
      },
      {
        title: "Hoạt động",
        dataIndex: "activity",
        key: "activity",
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        render: (status) => {
          const statusConfig = {
            completed: { color: "green", text: "Hoàn thành" },
            in_progress: { color: "blue", text: "Đang thực hiện" },
            pending: { color: "orange", text: "Chờ thực hiện" },
            cancelled: { color: "red", text: "Đã hủy" },
          };
          const config = statusConfig[status] || statusConfig.pending;
          return <Tag color={config.color}>{config.text}</Tag>;
        },
      },
      {
        title: "Đánh giá",
        dataIndex: "rating",
        key: "rating",
        render: (rating) => (rating ? <Rate disabled value={rating} /> : "-"),
      },
      {
        title: "Thao tác",
        key: "actions",
        render: (_, record) => (
          <Button
            type="link"
            onClick={() => handleUpdateSession(record)}
            disabled={mode === "patient"}
          >
            Cập nhật
          </Button>
        ),
      },
    ];

    return (
      <div>
        {/* Tổng quan tiến trình */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tổng số buổi"
                value={progress.totalSessions}
                prefix={<CalendarOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Đã hoàn thành"
                value={progress.completedSessions}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: "#3f8600" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Sắp tới"
                value={progress.upcomingSessions}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tiến độ"
                value={progress.overallProgress}
                suffix="%"
                prefix={<TrophyOutlined />}
                valueStyle={{ color: "#cf1322" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Giai đoạn hiện tại */}
        <Card title="Giai đoạn điều trị hiện tại" style={{ marginBottom: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <Text strong>Giai đoạn: </Text>
            <Badge status="processing" text={progress.currentPhase} />
            <Text type="secondary" style={{ marginLeft: 16 }}>
              Cập nhật lần cuối: {progress.lastUpdated}
            </Text>
          </div>
          <Progress
            percent={progress.phaseProgress}
            status="active"
            strokeColor={{
              "0%": "#108ee9",
              "100%": "#87d068",
            }}
          />
        </Card>

        {/* Lịch sử hoạt động */}
        <Card title="Lịch sử điều trị">
          <Table
            columns={columns}
            dataSource={progress.recentActivities}
            rowKey="date"
            pagination={false}
            size="small"
          />
        </Card>

        {/* Modal cập nhật session */}
        <Modal
          title="Cập nhật tiến trình điều trị"
          open={sessionUpdateModal}
          onOk={handleSubmitSessionUpdate}
          onCancel={() => setSessionUpdateModal(false)}
          width={600}
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
        <div style={{ marginTop: 24, textAlign: "center" }}>
          <Space>
            <Button onClick={handlePrevious}>Quay lại</Button>
            <Button
              type="primary"
              onClick={() => handleNext(progress)}
              disabled={
                progress.completedSessions < progress.totalSessions * 0.8
              }
            >
              Hoàn thành quy trình
            </Button>
          </Space>
          {progress.completedSessions < progress.totalSessions * 0.8 && (
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">
                Cần hoàn thành ít nhất 80% các buổi điều trị để kết thúc quy
                trình
              </Text>
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
      <div style={{ padding: "50px", textAlign: "center" }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text>Đang tải thông tin bệnh nhân...</Text>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", background: "#f5f5f5", minHeight: "100vh" }}>
      <Card>
        <Title level={2}>
          <Space>
            <HeartOutlined style={{ color: "#ff4d4f" }} />
            Quy Trình Điều Trị IVF
          </Space>
        </Title>

        {/* Thông tin bệnh nhân với examination status */}
        <Card size="small" style={{ marginBottom: 24, background: "#f9f9f9" }}>
          <Row gutter={16}>
            <Col span={5}>
              <Text strong>Bệnh nhân:</Text> {processData.patient.name}
            </Col>
            <Col span={4}>
              <Text strong>Giới tính:</Text>{" "}
              {processData.patient.gender === "male" ? "Nam" : "Nữ"}
            </Col>
            <Col span={4}>
              <Text strong>Tuổi:</Text> {processData.patient.age}
            </Col>
            <Col span={5}>
              <Text strong>Liên hệ:</Text> {processData.patient.contact}
            </Col>
            <Col span={6}>
              <Text strong>Quy trình:</Text>
              <Tag color="blue" style={{ marginLeft: 8 }}>
                Bước {currentStep + 1}/5
              </Tag>
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
            style={{ marginBottom: 24 }}
            action={
              <Space>
                <Button
                  size="small"
                  onClick={() => {
                    // Option to view full examination details
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

                {/* Manual navigation button */}
                {currentStep === 0 && (
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => {
                      setCurrentStep(1);
                      message.success("➡️ Đã chuyển sang bước lập phác đồ!");
                    }}
                  >
                    ➡️ Chuyển sang lập phác đồ
                  </Button>
                )}
              </Space>
            }
          />
        )}

        {/* Steps - quy trình theo thứ tự với trạng thái từ state manager */}
        <Steps current={currentStep} style={{ marginBottom: 32 }}>
          {steps.map((step, index) => {
            // Get step data from state manager
            const stepData = treatmentStateManager.getStepData(index);
            let stepStatus = stepData.status;
            let stepDescription = step.description;

            // Show completion info if step is completed
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
              />
            );
          })}
        </Steps>

        {/* Progress summary từ state manager */}
        {(() => {
          const progress = treatmentStateManager.getOverallProgress();
          return (
            <Card size="small" style={{ marginBottom: 16 }}>
              <Row gutter={16} align="middle">
                <Col span={12}>
                  <Text strong>Tiến độ tổng thể: </Text>
                  <Tag color="blue">
                    {progress.completed}/{progress.total} bước
                  </Tag>
                  <Progress
                    percent={progress.percentage}
                    size="small"
                    style={{ marginLeft: 8, width: 200 }}
                    status={
                      progress.current >= progress.total ? "success" : "active"
                    }
                  />
                </Col>
                <Col span={12} style={{ textAlign: "right" }}>
                  {progress.state.lastUpdated && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Cập nhật cuối:{" "}
                      {new Date(progress.state.lastUpdated).toLocaleString(
                        "vi-VN"
                      )}
                    </Text>
                  )}
                </Col>
              </Row>
            </Card>
          );
        })()}

        {/* Navigation buttons */}
        {currentStep < steps.length - 1 && (
          <div style={{ marginBottom: 24, textAlign: "center" }}>
            <Space>
              <Button onClick={handlePrevious} disabled={currentStep === 0}>
                Quay lại
              </Button>
              <Text type="secondary">
                Bước {currentStep + 1} / {steps.length}:{" "}
                {steps[currentStep].title}
              </Text>

              {/* Show manual next button when examination is completed */}
              {currentStep === 0 && processData.examination && (
                <Button
                  type="primary"
                  onClick={() => {
                    setCurrentStep(1);
                    message.success("➡️ Tiếp tục với bước lập phác đồ!");
                  }}
                >
                  ➡️ Tiếp theo: Lập phác đồ
                </Button>
              )}
            </Space>
          </div>
        )}

        {/* Step content */}
        <div>{renderStepContent()}</div>

        {/* Completion message */}
        {currentStep === steps.length - 1 && processData.schedule && (
          <Result
            status="success"
            title="Hoàn thành quy trình điều trị!"
            subTitle="Quy trình điều trị IVF đã hoàn tất thành công. Bệnh nhân có thể theo dõi kết quả và nhận hướng dẫn chăm sóc sau điều trị."
            extra={[
              <Button type="primary" key="view">
                Xem báo cáo tổng kết
              </Button>,
              <Button key="schedule">Đặt lịch tái khám</Button>,
              <Button key="print">In kết quả</Button>,
            ]}
          />
        )}
      </Card>
    </div>
  );
};

export default TreatmentProcess;
