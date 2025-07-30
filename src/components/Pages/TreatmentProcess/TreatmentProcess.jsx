import React, { useEffect, useState, useContext } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Steps,
  Tag,
  Space,
  Spin,
  Alert,
  Empty,
  Timeline,
  Button,
  Divider,
  Statistic,
  Progress,
  Descriptions,
  Avatar,
  Badge,
  Skeleton,
  Input,
  Select,
  Tooltip,
  Collapse,
  Tabs,
  message,
  notification,
} from "antd";
import {
  CalendarOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  MedicineBoxOutlined,
  FileTextOutlined,
  TrophyOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  InfoCircleOutlined,
  StarOutlined,
  FireOutlined,
  HeartOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import apiTreatmentManagement from "../../../api/apiTreatmentManagement";
import { UserContext } from "../../../context/UserContext";

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { Search } = Input;
const { Option } = Select;
const { Panel } = Collapse;
const { TabPane } = Tabs;

const TreatmentProcess = () => {
  const { user } = useContext(UserContext);
  const [treatmentPhases, setTreatmentPhases] = useState([]);
  const [currentPhase, setCurrentPhase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("steps"); // "steps" or "timeline"
  const [retryCount, setRetryCount] = useState(0);

  const fetchTreatmentData = async () => {
    setLoading(true);
    setError(null);
    try {
      const patientId = user?.id;
      console.log("[TreatmentProcess] patientId:", patientId);
      console.log("[TreatmentProcess] user data:", user);
      console.log("[TreatmentProcess] user role:", user?.role);

      if (!patientId) {
        setError("Không tìm thấy thông tin bệnh nhân. Vui lòng đăng nhập lại.");
        setLoading(false);
        return;
      }

      // Lấy tất cả treatment phases
      console.log(
        "[TreatmentProcess] Đang gọi API getPatientTreatmentPhases..."
      );
      const phasesResult =
        await apiTreatmentManagement.getPatientTreatmentPhases(patientId);

      console.log("[TreatmentProcess] Kết quả phasesResult:", phasesResult);

      if (phasesResult.success) {
        console.log("[TreatmentProcess] Phases data:", phasesResult.data);

        // Backend trả về Map với key "tablePhases" chứa array
        let phasesArray = [];
        if (phasesResult.data && typeof phasesResult.data === "object") {
          if (
            phasesResult.data.tablePhases &&
            Array.isArray(phasesResult.data.tablePhases)
          ) {
            phasesArray = phasesResult.data.tablePhases;
          } else if (Array.isArray(phasesResult.data)) {
            phasesArray = phasesResult.data;
          }
        }

        console.log("[TreatmentProcess] Processed phases array:", phasesArray);
        setTreatmentPhases(phasesArray);

        // Tìm treatment plan ID từ phases để lấy current phase
        if (phasesArray.length > 0) {
          const firstPhase = phasesArray[0];
          console.log("[TreatmentProcess] First phase:", firstPhase);

          // Backend không trả về treatmentPlanId trong phase, cần lấy từ active treatment plan
          // Hoặc có thể lấy từ URL parameter hoặc context
          let treatmentPlanId = firstPhase.treatmentPlanId || firstPhase.planId;

          // Nếu không có treatmentPlanId, thử lấy từ active treatment plan
          if (!treatmentPlanId) {
            try {
              console.log(
                "[TreatmentProcess] Không có treatmentPlanId trong phase, thử lấy active treatment plan..."
              );
              const activePlanResult =
                await apiTreatmentManagement.getActiveTreatmentPlan(patientId);
              if (activePlanResult.success && activePlanResult.data) {
                treatmentPlanId =
                  activePlanResult.data.planId || activePlanResult.data.id;
                console.log(
                  "[TreatmentProcess] Lấy được treatmentPlanId từ active plan:",
                  treatmentPlanId
                );
              }
            } catch (activePlanError) {
              console.warn(
                "[TreatmentProcess] Không thể lấy active treatment plan:",
                activePlanError
              );
            }
          }

          console.log("[TreatmentProcess] Treatment plan ID:", treatmentPlanId);

          if (treatmentPlanId) {
            // Lấy current phase
            console.log("[TreatmentProcess] Đang gọi API getCurrentPhase...");
            const currentPhaseResult =
              await apiTreatmentManagement.getCurrentPhase(treatmentPlanId);

            console.log(
              "[TreatmentProcess] Current phase result:",
              currentPhaseResult
            );

            if (currentPhaseResult.success) {
              setCurrentPhase(currentPhaseResult.data);
            } else {
              console.warn(
                "[TreatmentProcess] Không thể lấy current phase:",
                currentPhaseResult.message
              );
            }
          } else {
            console.warn("[TreatmentProcess] Không tìm thấy treatment plan ID");
          }
        } else {
          console.log("[TreatmentProcess] Không có phases nào được trả về");
          // Thử lấy active treatment plan để hiển thị thông tin cơ bản
          try {
            console.log(
              "[TreatmentProcess] Thử lấy active treatment plan để hiển thị..."
            );
            const activePlanResult =
              await apiTreatmentManagement.getActiveTreatmentPlan(patientId);
            if (activePlanResult.success && activePlanResult.data) {
              console.log(
                "[TreatmentProcess] Có active treatment plan:",
                activePlanResult.data
              );
              // Có thể hiển thị thông tin treatment plan thay vì phases
            } else {
              console.log("[TreatmentProcess] Không có active treatment plan");
            }
          } catch (activePlanError) {
            console.warn(
              "[TreatmentProcess] Không thể lấy active treatment plan:",
              activePlanError
            );
          }
        }
      } else {
        console.error(
          "[TreatmentProcess] Lỗi khi lấy phases:",
          phasesResult.message
        );
        setError(
          `Không thể lấy thông tin giai đoạn điều trị: ${phasesResult.message}`
        );
      }
    } catch (err) {
      console.error("[TreatmentProcess] Lỗi khi lấy dữ liệu điều trị:", err);
      setError(
        "Lỗi khi lấy thông tin quy trình điều trị. Vui lòng thử lại sau."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTreatmentData();
  }, [user]);

  const getStepStatus = (phase) => {
    switch ((phase.status || "").toLowerCase()) {
      case "completed":
        return "finish";
      case "in progress":
        return "process";
      case "pending":
        return "wait";
      case "cancelled":
        return "error";
      default:
        return "wait";
    }
  };

  const getStatusColor = (status) => {
    switch ((status || "").toLowerCase()) {
      case "completed":
        return "success";
      case "in progress":
        return "processing";
      case "pending":
        return "warning";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch ((status || "").toLowerCase()) {
      case "completed":
        return "Hoàn thành";
      case "in progress":
        return "Đang thực hiện";
      case "pending":
        return "Chờ thực hiện";
      case "cancelled":
        return "Đã hủy";
      default:
        return "Chưa xác định";
    }
  };

  const getStatusIcon = (status) => {
    switch ((status || "").toLowerCase()) {
      case "completed":
        return <CheckCircleOutlined style={{ color: "#52c41a" }} />;
      case "in progress":
        return <PlayCircleOutlined style={{ color: "#1890ff" }} />;
      case "pending":
        return <ClockCircleOutlined style={{ color: "#faad14" }} />;
      case "cancelled":
        return <StopOutlined style={{ color: "#ff4d4f" }} />;
      default:
        return <InfoCircleOutlined style={{ color: "#d9d9d9" }} />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const calculateProgress = () => {
    if (treatmentPhases.length === 0) return 0;
    const completedPhases = treatmentPhases.filter(
      (phase) => (phase.status || "").toLowerCase() === "completed"
    );
    return Math.round((completedPhases.length / treatmentPhases.length) * 100);
  };

  const getFilteredPhases = () => {
    let filtered = treatmentPhases;

    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(
        (phase) =>
          (phase.phaseName || "")
            .toLowerCase()
            .includes(searchText.toLowerCase()) ||
          (phase.description || "")
            .toLowerCase()
            .includes(searchText.toLowerCase()) ||
          (phase.doctor || "").toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (phase) => (phase.status || "").toLowerCase() === statusFilter
      );
    }

    return filtered;
  };

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
    fetchTreatmentData();
    notification.success({
      message: "Đang thử lại",
      description: "Đang tải lại dữ liệu quy trình điều trị...",
    });
  };

  const renderCurrentPhaseCard = () => {
    if (!currentPhase) return null;

    const statusColor = getStatusColor(currentPhase.status);
    const progressValue = calculateProgress();

    return (
      <Card
        style={{
          marginBottom: "24px",
          border: "2px solid #1890ff",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(24, 144, 255, 0.15)",
          background: "linear-gradient(135deg, #f0f8ff 0%, #e6f7ff 100%)",
        }}
        title={
          <Space>
            <FireOutlined style={{ color: "#1890ff", fontSize: "20px" }} />
            <Text strong style={{ fontSize: "18px" }}>
              Giai đoạn hiện tại
            </Text>
            <Badge
              status={statusColor}
              text={getStatusText(currentPhase.status)}
            />
          </Space>
        }
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={8}>
            <Statistic
              title="Giai đoạn"
              value={currentPhase.phaseName || "Không xác định"}
              prefix={<MedicineBoxOutlined style={{ color: "#1890ff" }} />}
              valueStyle={{ fontSize: "16px", fontWeight: "bold" }}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Statistic
              title="Ngày bắt đầu"
              value={formatDate(currentPhase.startDate)}
              prefix={<CalendarOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ fontSize: "16px" }}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Statistic
              title="Tiến độ tổng thể"
              value={progressValue}
              suffix="%"
              prefix={<TrophyOutlined style={{ color: "#faad14" }} />}
              valueStyle={{
                color:
                  progressValue >= 80
                    ? "#52c41a"
                    : progressValue >= 50
                    ? "#faad14"
                    : "#1890ff",
                fontSize: "18px",
                fontWeight: "bold",
              }}
            />
          </Col>
        </Row>

        <Divider />

        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Progress
              percent={progressValue}
              status={progressValue === 100 ? "success" : "active"}
              strokeColor={{
                "0%": "#1890ff",
                "100%": "#52c41a",
              }}
              showInfo={false}
            />
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {progressValue}% hoàn thành (
              {
                treatmentPhases.filter(
                  (p) => (p.status || "").toLowerCase() === "completed"
                ).length
              }
              /{treatmentPhases.length} giai đoạn)
            </Text>
          </Col>
        </Row>

        {currentPhase.description && (
          <div style={{ marginTop: "16px" }}>
            <Text strong>Mô tả: </Text>
            <Text>{currentPhase.description}</Text>
          </div>
        )}

        {currentPhase.doctorName && (
          <div style={{ marginTop: "12px" }}>
            <Space>
              <Avatar icon={<UserOutlined />} size="small" />
              <Text type="secondary">Bác sĩ: {currentPhase.doctorName}</Text>
            </Space>
          </div>
        )}
      </Card>
    );
  };

  const renderStepsView = () => (
    <Card title="Các giai đoạn điều trị">
      <Steps direction="vertical" size="large">
        {getFilteredPhases().map((phase, index) => (
          <Step
            key={phase.phaseId || index}
            status={getStepStatus(phase)}
            icon={getStatusIcon(phase.status)}
            title={
              <Space>
                <Text strong style={{ fontSize: "16px" }}>
                  {phase.phaseName || `Giai đoạn ${index + 1}`}
                </Text>
                <Tag
                  color={getStatusColor(phase.status)}
                  style={{ fontSize: "12px" }}
                >
                  {getStatusText(phase.status)}
                </Tag>
              </Space>
            }
            description={
              <div style={{ marginTop: "12px" }}>
                <Paragraph style={{ marginBottom: "8px" }}>
                  <Text type="secondary">
                    {phase.description || "Không có mô tả"}
                  </Text>
                </Paragraph>
                <Space wrap>
                  <Text type="secondary">
                    <CalendarOutlined /> {formatDate(phase.startDate)}
                  </Text>
                  {phase.endDate && (
                    <Text type="secondary">- {formatDate(phase.endDate)}</Text>
                  )}
                </Space>
                {phase.doctor && (
                  <div style={{ marginTop: "8px" }}>
                    <Space>
                      <Avatar icon={<UserOutlined />} size="small" />
                      <Text type="secondary">Bác sĩ: {phase.doctor}</Text>
                    </Space>
                  </div>
                )}
                {phase.expectedDuration && (
                  <div style={{ marginTop: "4px" }}>
                    <Text type="secondary">
                      <ClockCircleOutlined /> Thời gian dự kiến:{" "}
                      {phase.expectedDuration} ngày
                    </Text>
                  </div>
                )}
              </div>
            }
          />
        ))}
      </Steps>
    </Card>
  );

  const renderTimelineView = () => (
    <Card title="Timeline điều trị">
      <Timeline mode="left">
        {getFilteredPhases().map((phase, index) => (
          <Timeline.Item
            key={phase.phaseId || index}
            color={
              getStatusColor(phase.status) === "success"
                ? "green"
                : getStatusColor(phase.status) === "processing"
                ? "blue"
                : getStatusColor(phase.status) === "warning"
                ? "orange"
                : getStatusColor(phase.status) === "error"
                ? "red"
                : "gray"
            }
            dot={getStatusIcon(phase.status)}
          >
            <Card
              size="small"
              style={{
                marginBottom: "16px",
                border: "1px solid #f0f0f0",
                borderRadius: "8px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ flex: 1 }}>
                  <Text strong style={{ fontSize: "16px" }}>
                    {phase.phaseName || `Giai đoạn ${index + 1}`}
                  </Text>
                  <Tag
                    color={getStatusColor(phase.status)}
                    style={{ marginLeft: "8px" }}
                  >
                    {getStatusText(phase.status)}
                  </Tag>
                </div>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  {formatDate(phase.startDate)}
                </Text>
              </div>

              {phase.description && (
                <Paragraph style={{ marginTop: "8px", marginBottom: "8px" }}>
                  <Text type="secondary">{phase.description}</Text>
                </Paragraph>
              )}

              <Space wrap style={{ fontSize: "12px" }}>
                {phase.doctor && (
                  <Text type="secondary">
                    <UserOutlined /> {phase.doctor}
                  </Text>
                )}
                {phase.expectedDuration && (
                  <Text type="secondary">
                    <ClockCircleOutlined /> {phase.expectedDuration} ngày
                  </Text>
                )}
              </Space>
            </Card>
          </Timeline.Item>
        ))}
      </Timeline>
    </Card>
  );

  if (loading) {
    return (
      <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
        <Card>
          <div style={{ textAlign: "center", padding: "50px" }}>
            <Spin size="large" />
            <div style={{ marginTop: "16px" }}>
              <Text>Đang tải thông tin quy trình điều trị...</Text>
            </div>
          </div>

          <Skeleton active paragraph={{ rows: 4 }} />
          <Skeleton active paragraph={{ rows: 3 }} />
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
        <Alert
          message="Lỗi khi tải dữ liệu"
          description={
            <div>
              <Text>{error}</Text>
              <br />
              <Text type="secondary">Số lần thử lại: {retryCount}</Text>
            </div>
          }
          type="error"
          showIcon
          action={
            <Space>
              <Button size="small" danger onClick={handleRetry}>
                Thử lại
              </Button>
              <Button size="small" onClick={() => window.location.reload()}>
                Tải lại trang
              </Button>
            </Space>
          }
          style={{ marginBottom: "24px" }}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
                flexWrap: "wrap",
                gap: "16px",
              }}
            >
              <Title level={2} style={{ margin: 0 }}>
                <MedicineBoxOutlined
                  style={{ marginRight: "8px", color: "#1890ff" }}
                />
                Quy trình điều trị
              </Title>
              <Space wrap>
                <Button
                  type="primary"
                  icon={<ReloadOutlined />}
                  onClick={fetchTreatmentData}
                >
                  Làm mới
                </Button>
              </Space>
            </div>

            {/* Filters and Search */}
            <Card
              size="small"
              style={{ marginBottom: "24px", background: "#fafafa" }}
            >
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={12} md={8}>
                  <Search
                    placeholder="Tìm kiếm giai đoạn..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    prefix={<SearchOutlined />}
                    allowClear
                  />
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Select
                    placeholder="Lọc theo trạng thái"
                    value={statusFilter}
                    onChange={setStatusFilter}
                    style={{ width: "100%" }}
                    prefix={<FilterOutlined />}
                  >
                    <Option value="all">Tất cả</Option>
                    <Option value="pending">Chờ thực hiện</Option>
                    <Option value="in progress">Đang thực hiện</Option>
                    <Option value="completed">Hoàn thành</Option>
                    <Option value="cancelled">Đã hủy</Option>
                  </Select>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Select
                    placeholder="Chế độ xem"
                    value={viewMode}
                    onChange={setViewMode}
                    style={{ width: "100%" }}
                    prefix={<EyeOutlined />}
                  >
                    <Option value="steps">Steps</Option>
                    <Option value="timeline">Timeline</Option>
                  </Select>
                </Col>
                <Col xs={24} sm={12} md={4}>
                  <Text type="secondary">
                    {getFilteredPhases().length} / {treatmentPhases.length} giai
                    đoạn
                  </Text>
                </Col>
              </Row>
            </Card>

            {/* Current Phase Card */}
            {renderCurrentPhaseCard()}

            {/* Treatment Phases */}
            {treatmentPhases.length > 0 ? (
              viewMode === "steps" ? (
                renderStepsView()
              ) : (
                renderTimelineView()
              )
            ) : (
              <Empty
                description="Chưa có giai đoạn điều trị nào"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TreatmentProcess;
