import React, { useState, useEffect, useContext } from "react";
import {
  Card,
  Steps,
  Button,
  Row,
  Col,
  Typography,
  Space,
  Badge,
  Tag,
  Progress,
  Timeline,
  Avatar,
  Descriptions,
  Alert,
  message,
  Statistic,
  Spin,
  Empty,
  Divider,
  Tooltip,
} from "antd";
import {
  UserOutlined,
  HeartOutlined,
  FileTextOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  MedicineBoxOutlined,
  PlayCircleOutlined,
  HistoryOutlined,
  BellOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { UserContext } from "../../../context/UserContext";
import apiTreatmentManagement from "../../../api/apiTreatmentManagement";
import "./PatientPages.css";

const { Title, Text, Paragraph } = Typography;

const TreatmentProcess = () => {
  console.log("🔍 [TreatmentProcess] Component rendering...");

  const { user } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [treatmentData, setTreatmentData] = useState({
    phases: [],
    currentPhase: null,
    overallProgress: 0,
    totalPhases: 0,
    completedPhases: 0,
  });
  const [clinicalResults, setClinicalResults] = useState([]);
  const [treatmentHistory, setTreatmentHistory] = useState([]);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  console.log("🔍 [TreatmentProcess] User context:", user);

  useEffect(() => {
    console.log("🔍 [TreatmentProcess] useEffect triggered, user:", user);
    if (user?.id) {
      loadTreatmentData();
    } else {
      console.log("⚠️ [TreatmentProcess] No user ID found");
      setLoading(false);
    }
  }, [user]);

  const loadTreatmentData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(
        "🏥 [PatientTreatmentProcess] Loading treatment data for patient:",
        user.id
      );

      // Load all treatment data in parallel
      const [phasesResponse, clinicalResponse, historyResponse] =
        await Promise.allSettled([
          apiTreatmentManagement.getPatientTreatmentPhases(user.id),
          apiTreatmentManagement.getPatientClinicalResults(user.id),
          apiTreatmentManagement.getPatientTreatmentHistory(user.id),
        ]);

      console.log("🔍 [TreatmentProcess] API responses:", {
        phases: phasesResponse,
        clinical: clinicalResponse,
        history: historyResponse,
      });

      // Process treatment phases
      let phases = [];
      let currentPhase = null;
      let overallProgress = 0;
      let totalPhases = 0;
      let completedPhases = 0;

      if (
        phasesResponse.status === "fulfilled" &&
        phasesResponse.value?.success
      ) {
        phases = phasesResponse.value.data || [];
        totalPhases = phases.length;
        completedPhases = phases.filter(
          (phase) => phase.status === "Completed"
        ).length;
        currentPhase = phases.find((phase) => phase.status === "In Progress");
        overallProgress =
          totalPhases > 0
            ? Math.round((completedPhases / totalPhases) * 100)
            : 0;
      }

      // Process clinical results
      const clinicalData =
        clinicalResponse.status === "fulfilled" &&
        clinicalResponse.value?.success
          ? clinicalResponse.value.data || []
          : [];

      // Process treatment history
      const historyData =
        historyResponse.status === "fulfilled" && historyResponse.value?.success
          ? historyResponse.value.data || []
          : [];

      setTreatmentData({
        phases,
        currentPhase,
        overallProgress,
        totalPhases,
        completedPhases,
      });
      setClinicalResults(clinicalData);
      setTreatmentHistory(historyData);

      console.log("✅ [PatientTreatmentProcess] Treatment data loaded:", {
        phases: phases.length,
        clinicalResults: clinicalData.length,
        history: historyData.length,
        progress: overallProgress,
      });
    } catch (error) {
      console.error(
        "❌ [PatientTreatmentProcess] Error loading treatment data:",
        error
      );
      setError("Không thể tải thông tin điều trị. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadTreatmentData();
    setRefreshing(false);
    message.success("Đã cập nhật thông tin điều trị");
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
        return <CheckCircleOutlined style={{ color: "#52c41a" }} />;
      case "in progress":
        return <PlayCircleOutlined style={{ color: "#1890ff" }} />;
      case "pending":
        return <ClockCircleOutlined style={{ color: "#faad14" }} />;
      default:
        return <ClockCircleOutlined style={{ color: "#d9d9d9" }} />;
    }
  };

  const getPhaseColor = (phase) => {
    switch (phase.status?.toLowerCase()) {
      case "completed":
        return "green";
      case "in progress":
        return "blue";
      case "pending":
        return "orange";
      default:
        return "default";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa có thông tin";
    try {
      return new Date(dateString).toLocaleDateString("vi-VN");
    } catch (error) {
      return "Ngày không hợp lệ";
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "Chưa có thông tin";
    try {
      return new Date(dateTimeString).toLocaleString("vi-VN");
    } catch (error) {
      return "Thời gian không hợp lệ";
    }
  };

  console.log("🔍 [TreatmentProcess] Render state:", {
    loading,
    error,
    treatmentData,
  });

  if (loading) {
    return (
      <div className="patient-page-loading">
        <Spin size="large" />
        <Text>Đang tải thông tin điều trị...</Text>
      </div>
    );
  }

  if (error) {
    return (
      <div className="patient-page-error">
        <Alert
          message="Lỗi tải dữ liệu"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" danger onClick={loadTreatmentData}>
              Thử lại
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="patient-treatment-process">
      {/* Header với thông tin tổng quan */}
      <div className="page-header">
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0 }}>
              <MedicineBoxOutlined style={{ marginRight: 8, color: "white" }} />
              Tiến trình điều trị
            </Title>
            <Text
              type="secondary"
              style={{ color: "rgba(255, 255, 255, 0.8)" }}
            >
              Theo dõi quá trình điều trị của bạn
            </Text>
          </Col>
          <Col>
            <Button
              type="primary"
              ghost
              icon={<ReloadOutlined />}
              onClick={refreshData}
              loading={refreshing}
            >
              Làm mới
            </Button>
          </Col>
        </Row>
      </div>

      {/* Thống kê tổng quan */}
      <Row gutter={[16, 16]} className="mt-16">
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card" bodyStyle={{ padding: "20px" }}>
            <Statistic
              title="Tiến trình tổng thể"
              value={treatmentData.overallProgress}
              suffix="%"
              prefix={<HeartOutlined style={{ color: "#ff4d4f" }} />}
              valueStyle={{ color: "#ff4d4f", fontSize: "24px" }}
            />
            <Progress
              percent={treatmentData.overallProgress}
              strokeColor="#ff4d4f"
              size="small"
              showInfo={false}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card" bodyStyle={{ padding: "20px" }}>
            <Statistic
              title="Giai đoạn hiện tại"
              value={treatmentData.currentPhase?.phaseName || "Chưa bắt đầu"}
              prefix={<PlayCircleOutlined style={{ color: "#1890ff" }} />}
              valueStyle={{ color: "#1890ff", fontSize: "16px" }}
            />
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {treatmentData.currentPhase?.status || "Chưa có thông tin"}
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card" bodyStyle={{ padding: "20px" }}>
            <Statistic
              title="Giai đoạn hoàn thành"
              value={treatmentData.completedPhases}
              suffix={`/ ${treatmentData.totalPhases}`}
              prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#52c41a", fontSize: "20px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card" bodyStyle={{ padding: "20px" }}>
            <Statistic
              title="Kết quả khám"
              value={clinicalResults.length}
              prefix={<FileTextOutlined style={{ color: "#722ed1" }} />}
              valueStyle={{ color: "#722ed1", fontSize: "20px" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Nội dung chính */}
      <Row gutter={[24, 24]} className="mt-24">
        {/* Các giai đoạn điều trị */}
        <Col xs={24} lg={16}>
          <Card
            title={
              <Space>
                <MedicineBoxOutlined style={{ color: "#1890ff" }} />
                <span>Các giai đoạn điều trị</span>
                <Badge
                  count={treatmentData.totalPhases}
                  showZero
                  style={{ backgroundColor: "#1890ff" }}
                />
              </Space>
            }
            className="phases-card"
            extra={
              <Tooltip title="Xem chi tiết từng giai đoạn">
                <InfoCircleOutlined style={{ color: "#8c8c8c" }} />
              </Tooltip>
            }
          >
            {treatmentData.phases.length > 0 ? (
              <Steps
                direction="vertical"
                current={treatmentData.phases.findIndex(
                  (phase) => phase.status === "In Progress"
                )}
                items={treatmentData.phases.map((phase, index) => ({
                  title: (
                    <Space>
                      <Text strong style={{ fontSize: "16px" }}>
                        {phase.phaseName}
                      </Text>
                      <Tag
                        color={getPhaseColor(phase)}
                        style={{ fontWeight: "500" }}
                      >
                        {phase.status === "Completed" && "Hoàn thành"}
                        {phase.status === "In Progress" && "Đang thực hiện"}
                        {phase.status === "Pending" && "Chờ thực hiện"}
                      </Tag>
                    </Space>
                  ),
                  description: (
                    <div style={{ marginTop: 8 }}>
                      <Paragraph style={{ marginBottom: 4, color: "#595959" }}>
                        {phase.description}
                      </Paragraph>
                      <Space size="large">
                        {phase.startDate && (
                          <Text type="secondary" style={{ fontSize: "12px" }}>
                            <CalendarOutlined style={{ marginRight: 4 }} />
                            Bắt đầu: {formatDate(phase.startDate)}
                          </Text>
                        )}
                        {phase.endDate && (
                          <Text type="secondary" style={{ fontSize: "12px" }}>
                            <CheckCircleOutlined style={{ marginRight: 4 }} />
                            Kết thúc: {formatDate(phase.endDate)}
                          </Text>
                        )}
                      </Space>
                    </div>
                  ),
                  status: getPhaseStatus(phase),
                  icon: getPhaseIcon(phase),
                }))}
              />
            ) : (
              <Empty
                description="Chưa có thông tin giai đoạn điều trị"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </Col>

        {/* Thông tin nhanh */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            {/* Giai đoạn hiện tại */}
            {treatmentData.currentPhase && (
              <Card
                title={
                  <Space>
                    <PlayCircleOutlined style={{ color: "#1890ff" }} />
                    <span>Giai đoạn hiện tại</span>
                  </Space>
                }
                className="info-card"
                size="small"
              >
                <div>
                  <Text strong style={{ fontSize: "16px", color: "#1890ff" }}>
                    {treatmentData.currentPhase.phaseName}
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    Bắt đầu: {formatDate(treatmentData.currentPhase.startDate)}
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    Bác sĩ:{" "}
                    {treatmentData.currentPhase.doctorName || "Chưa phân công"}
                  </Text>
                </div>
              </Card>
            )}

            {/* Lịch khám tiếp theo */}
            <Card
              title={
                <Space>
                  <CalendarOutlined style={{ color: "#52c41a" }} />
                  <span>Lịch khám tiếp theo</span>
                </Space>
              }
              className="info-card"
              size="small"
            >
              <div>
                <Text strong style={{ fontSize: "16px" }}>
                  {treatmentData.currentPhase?.nextAppointment
                    ? formatDateTime(treatmentData.currentPhase.nextAppointment)
                    : "Chưa có lịch hẹn"}
                </Text>
                <br />
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  Phòng: {treatmentData.currentPhase?.room || "Chưa phân công"}
                </Text>
              </div>
            </Card>

            {/* Thông báo quan trọng */}
            <Card
              title={
                <Space>
                  <BellOutlined style={{ color: "#fa8c16" }} />
                  <span>Thông báo quan trọng</span>
                </Space>
              }
              className="info-card"
              size="small"
            >
              <div>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  • Vui lòng đến đúng giờ hẹn
                </Text>
                <br />
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  • Mang theo các giấy tờ cần thiết
                </Text>
                <br />
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  • Liên hệ bác sĩ nếu có thắc mắc
                </Text>
              </div>
            </Card>
          </Space>
        </Col>
      </Row>

      {/* Kết quả khám lâm sàng */}
      <Row gutter={[24, 24]} className="mt-24">
        <Col span={24}>
          <Card
            title={
              <Space>
                <FileTextOutlined style={{ color: "#722ed1" }} />
                <span>Kết quả khám lâm sàng</span>
                <Badge
                  count={clinicalResults.length}
                  showZero
                  style={{ backgroundColor: "#722ed1" }}
                />
              </Space>
            }
            className="clinical-results-card"
          >
            {clinicalResults.length > 0 ? (
              <Row gutter={[16, 16]}>
                {clinicalResults.map((result, index) => (
                  <Col xs={24} md={12} lg={8} key={index}>
                    <Card
                      size="small"
                      className="result-item"
                      hoverable
                      title={
                        <Space>
                          <CalendarOutlined />
                          <span>{formatDate(result.examinationDate)}</span>
                        </Space>
                      }
                      extra={
                        <Tag color={result.isCompleted ? "green" : "orange"}>
                          {result.isCompleted ? "Hoàn thành" : "Đang xử lý"}
                        </Tag>
                      }
                    >
                      <Descriptions column={1} size="small">
                        <Descriptions.Item label="Chẩn đoán">
                          <Text strong>{result.diagnosis || "Chưa có"}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Bác sĩ">
                          {result.doctorName || "Chưa phân công"}
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <Empty
                description="Chưa có kết quả khám lâm sàng"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Lịch sử điều trị */}
      <Row gutter={[24, 24]} className="mt-24">
        <Col span={24}>
          <Card
            title={
              <Space>
                <HistoryOutlined style={{ color: "#13c2c2" }} />
                <span>Lịch sử điều trị</span>
                <Badge
                  count={treatmentHistory.length}
                  showZero
                  style={{ backgroundColor: "#13c2c2" }}
                />
              </Space>
            }
            className="history-card"
          >
            {treatmentHistory.length > 0 ? (
              <Timeline>
                {treatmentHistory.map((item, index) => (
                  <Timeline.Item
                    key={index}
                    dot={getPhaseIcon(item)}
                    color={getPhaseColor(item)}
                  >
                    <div>
                      <Text strong style={{ fontSize: "16px" }}>
                        {item.phaseName || "Giai đoạn điều trị"}
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        {formatDate(item.startDate)} -{" "}
                        {formatDate(item.endDate) || "Đang thực hiện"}
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        {item.notes || "Không có ghi chú"}
                      </Text>
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            ) : (
              <Empty
                description="Chưa có lịch sử điều trị"
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
