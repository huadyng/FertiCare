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

import TreatmentScheduleForm from "./TreatmentScheduleForm";
import PatientScheduleView from "./PatientScheduleView";

const { Step } = Steps;
const { Title, Text } = Typography;
const { TextArea } = Input;

const TreatmentProcess = ({ patientId, mode = "doctor" }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [processData, setProcessData] = useState({
    patient: null,
    schedule: null,
    progress: null,
  });

  // States for progress tracking
  const [sessionUpdateModal, setSessionUpdateModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [progressForm] = Form.useForm();

  // Mock patient data với examination results đã có sẵn
  const mockPatientInfo = {
    id: patientId || "1",
    name: "Nguyễn Thị Mai",
    gender: "female",
    dob: "1992-03-15",
    contact: "0909123456",
    address: "123 Đường ABC, Quận 1, TP.HCM",
    age: 32,
    // Kết quả khám đã có từ trang khám lâm sàng
    examination: {
      diagnosis: "Vô sinh nguyên phát",
      symptoms: ["Rối loạn kinh nguyệt", "Khó thụ thai"],
      labResults: {
        hormone: "Thiếu hụt estrogen",
        ultrasound: "Buồng trứng có nang nhỏ",
      },
      recommendations: ["IVF", "Hỗ trợ hormone"],
      completedDate: "2024-01-15",
      doctorNotes: "Bệnh nhân cần theo dõi sát trong quá trình điều trị",
    },
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

  useEffect(() => {
    setProcessData((prev) => ({
      ...prev,
      patient: mockPatientInfo,
      progress: mockProgressData,
    }));
  }, [patientId]);

  const steps = [
    {
      title: "Tạo lịch trình",
      description: "Lập lịch các buổi điều trị",
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
      title: "Hoàn thành",
      description: "Xem tổng quan và kết quả",
      icon: <CheckCircleOutlined />,
      component: PatientScheduleView,
    },
  ];

  const handleNext = (stepData) => {
    const stepKeys = ["schedule", "progress"];
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
        {/* Thông tin từ các trang khác đã có */}
        <Card
          title={
            <Space>
              <FileTextOutlined />
              Thông tin chuẩn bị
              <Tag color="green">Đã hoàn thành</Tag>
            </Space>
          }
          style={{ marginBottom: 24 }}
        >
          <Row gutter={16}>
            <Col span={8}>
              <Text strong>📋 Khám lâm sàng:</Text>
              <ul style={{ marginTop: 8 }}>
                <li>Chẩn đoán: {processData.patient.examination.diagnosis}</li>
                <li>
                  Ngày khám: {processData.patient.examination.completedDate}
                </li>
                <li>
                  Khuyến nghị:{" "}
                  {processData.patient.examination.recommendations.join(", ")}
                </li>
              </ul>
            </Col>
            <Col span={8}>
              <Text strong>🔬 Kết quả xét nghiệm:</Text>
              <ul style={{ marginTop: 8 }}>
                <li>
                  Hormone: {processData.patient.examination.labResults.hormone}
                </li>
                <li>
                  Siêu âm:{" "}
                  {processData.patient.examination.labResults.ultrasound}
                </li>
              </ul>
            </Col>
            <Col span={8}>
              <Text strong>💊 Phác đồ điều trị:</Text>
              <ul style={{ marginTop: 8 }}>
                <li>Loại: IVF (đã lập ở trang riêng)</li>
                <li>Trạng thái: ✅ Đã phê duyệt</li>
                <li>Giai đoạn: 7 giai đoạn chi tiết</li>
              </ul>
            </Col>
          </Row>
        </Card>

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
      case 0:
        return (
          <StepComponent
            {...commonProps}
            examinationData={processData.patient?.examination}
            treatmentPlan={null} // Sẽ được load từ trang lập phác đồ riêng
          />
        );
      case 2:
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
              <Text strong>Khám lâm sàng:</Text>
              <Tag color="green" style={{ marginLeft: 8 }}>
                ✓ Hoàn thành {processData.patient.examination.completedDate}
              </Tag>
              <br />
              <Text strong>Phác đồ:</Text>
              <Tag color="blue" style={{ marginLeft: 8 }}>
                ✓ Đã lập riêng
              </Tag>
            </Col>
          </Row>
        </Card>

        {/* Alert về examination và phác đồ đã hoàn thành */}
        <Alert
          message="Khám lâm sàng và phác đồ đã hoàn thành"
          description={`Chẩn đoán: ${processData.patient.examination.diagnosis}. Phác đồ điều trị đã được lập ở trang riêng. Bây giờ tiến hành quy trình điều trị.`}
          type="success"
          icon={<CheckCircleOutlined />}
          style={{ marginBottom: 24 }}
          showIcon
        />

        {/* Steps - quy trình theo thứ tự */}
        <Steps current={currentStep} style={{ marginBottom: 32 }}>
          {steps.map((step, index) => (
            <Step
              key={index}
              title={step.title}
              description={step.description}
              icon={step.icon}
            />
          ))}
        </Steps>

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
