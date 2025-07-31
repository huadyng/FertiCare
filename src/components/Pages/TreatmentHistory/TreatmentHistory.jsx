import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../../context/UserContext";
import apiTreatmentManagement from "../../../api/apiTreatmentManagement";
import {
  Card,
  Row,
  Col,
  Typography,
  Spin,
  Alert,
  Button,
  Tag,
  Space,
  Descriptions,
  Select,
  Empty,
  Statistic,
  Timeline,
  Badge,
  Divider,
  Tooltip,
  Progress,
  Avatar,
  List,
  Tabs,
  Collapse,
  Skeleton,
  Result,
  notification,
  theme,
  Modal,
  Steps,
  Drawer,
} from "antd";
import {
  HistoryOutlined,
  TrophyOutlined,
  CalendarOutlined,
  DollarOutlined,
  PercentageOutlined,
  MedicineBoxOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
  EyeOutlined,
  FileTextOutlined,
  UserOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
  StarOutlined,
  ClockCircleOutlined as ClockIcon,
  RightOutlined,
  CheckCircleFilled,
  ClockCircleFilled,
  ExclamationCircleFilled,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Panel } = Collapse;
const { TabPane } = Tabs;
const { Step } = Steps;

const TreatmentHistory = () => {
  const { user } = useContext(UserContext);
  const [activeTreatmentPlan, setActiveTreatmentPlan] = useState(null);
  const [treatmentHistory, setTreatmentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [phaseModalVisible, setPhaseModalVisible] = useState(false);
  const [phaseDrawerVisible, setPhaseDrawerVisible] = useState(false);
  const [phaseDetails, setPhaseDetails] = useState(null);
  const [loadingPhases, setLoadingPhases] = useState(false);
  const { token } = theme.useToken();

  useEffect(() => {
    if (user?.id) {
      fetchTreatmentData();
    }
  }, [user?.id]);

  const fetchTreatmentData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Lấy active treatment plan
      try {
        const activePlanResponse =
          await apiTreatmentManagement.getActiveTreatmentPlan(user.id);
        if (activePlanResponse.success) {
          setActiveTreatmentPlan(activePlanResponse.data);
        }
      } catch (activePlanError) {
        console.warn(
          "⚠️ [TreatmentHistory] Could not load active treatment plan:",
          activePlanError.message
        );
        // Không set error vì treatment history vẫn có thể load được
      }

      // Lấy treatment history
      const historyResponse =
        await apiTreatmentManagement.getPatientTreatmentHistory(user.id);
      if (historyResponse.success) {
        console.log(
          "📋 [TreatmentHistory] Raw API response:",
          historyResponse.data
        );

        // Xử lý dữ liệu từ API response
        let historyData = [];

        if (
          Array.isArray(historyResponse.data) &&
          historyResponse.data.length > 0
        ) {
          const firstItem = historyResponse.data[0];
          console.log("📋 [TreatmentHistory] First item:", firstItem);

          // Ưu tiên sử dụng tableHistory nếu có
          if (firstItem.tableHistory && Array.isArray(firstItem.tableHistory)) {
            console.log(
              "📋 [TreatmentHistory] Using tableHistory, length:",
              firstItem.tableHistory.length
            );
            historyData = firstItem.tableHistory;
          } else if (firstItem.history && Array.isArray(firstItem.history)) {
            console.log(
              "📋 [TreatmentHistory] Using history, length:",
              firstItem.history.length
            );
            historyData = firstItem.history;
          } else {
            console.log("📋 [TreatmentHistory] Using direct data");
            historyData = historyResponse.data;
          }
        } else if (
          historyResponse.data &&
          typeof historyResponse.data === "object"
        ) {
          // Handle trường hợp response là object thay vì array
          console.log(
            "📋 [TreatmentHistory] Response is object, checking for tablePhases"
          );

          if (
            historyResponse.data.tablePhases &&
            Array.isArray(historyResponse.data.tablePhases)
          ) {
            console.log(
              "📋 [TreatmentHistory] Using tablePhases, length:",
              historyResponse.data.tablePhases.length
            );
            historyData = historyResponse.data.tablePhases;
          } else if (
            historyResponse.data.tableHistory &&
            Array.isArray(historyResponse.data.tableHistory)
          ) {
            console.log(
              "📋 [TreatmentHistory] Using tableHistory from object, length:",
              historyResponse.data.tableHistory.length
            );
            historyData = historyResponse.data.tableHistory;
          } else if (
            historyResponse.data.history &&
            Array.isArray(historyResponse.data.history)
          ) {
            console.log(
              "📋 [TreatmentHistory] Using history from object, length:",
              historyResponse.data.history.length
            );
            historyData = historyResponse.data.history;
          } else {
            console.log(
              "📋 [TreatmentHistory] No valid array found in object response"
            );
            historyData = [];
          }
        } else {
          console.log("📋 [TreatmentHistory] Empty or invalid response data");
          historyData = [];
        }

        console.log("📋 [TreatmentHistory] Final processed data:", historyData);
        setTreatmentHistory(historyData);
      }
    } catch (err) {
      console.error("Error fetching treatment data:", err);
      setError("Có lỗi xảy ra khi tải dữ liệu điều trị");
    } finally {
      setLoading(false);
    }
  };

  const fetchPhaseDetails = async (treatmentId) => {
    try {
      setLoadingPhases(true);

      // Validation: Kiểm tra treatmentId có hợp lệ không
      if (
        !treatmentId ||
        treatmentId === "undefined" ||
        treatmentId === "null"
      ) {
        console.warn("⚠️ [TreatmentHistory] Invalid treatmentId:", treatmentId);
        notification.warning({
          message: "ID phác đồ không hợp lệ",
          description: "Không thể xác định phác đồ điều trị",
          placement: "topRight",
        });
        return;
      }

      console.log(
        "🔍 [TreatmentHistory] Fetching phase details for treatment:",
        treatmentId
      );

      // Gọi API để lấy chi tiết giai đoạn điều trị
      const phaseResponse = await apiTreatmentManagement.getTreatmentPlanPhases(
        treatmentId
      );

      if (phaseResponse.success) {
        console.log("📋 [TreatmentHistory] Phase details:", phaseResponse.data);
        setPhaseDetails(phaseResponse.data);
        setPhaseDrawerVisible(true);
      } else {
        // Thử lấy từ treatment phases nếu không có
        try {
          const user = localStorage.getItem("user");
          if (user) {
            const userData = JSON.parse(user);
            const patientId = userData.id || userData.userId;

            const phasesResponse =
              await apiTreatmentManagement.getPatientTreatmentPhases(patientId);
            if (phasesResponse.success && phasesResponse.data) {
              // Lọc phases theo treatmentId
              const filteredPhases = phasesResponse.data.filter(
                (phase) =>
                  phase.treatmentPlanId === treatmentId ||
                  phase.planId === treatmentId ||
                  phase.treatmentId === treatmentId
              );

              if (filteredPhases.length > 0) {
                console.log(
                  "📋 [TreatmentHistory] Found phases from patient API:",
                  filteredPhases
                );
                setPhaseDetails(filteredPhases);
                setPhaseDrawerVisible(true);
                return;
              }
            }
          }
        } catch (fallbackError) {
          console.warn(
            "⚠️ [TreatmentHistory] Fallback API also failed:",
            fallbackError
          );
        }

        notification.warning({
          message: "Không có dữ liệu giai đoạn",
          description: "Không tìm thấy thông tin giai đoạn cho phác đồ này",
          placement: "topRight",
        });
      }
    } catch (err) {
      console.error("Error fetching phase details:", err);
      notification.error({
        message: "Lỗi tải dữ liệu giai đoạn",
        description: "Không thể tải thông tin giai đoạn điều trị",
        placement: "topRight",
      });
    } finally {
      setLoadingPhases(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      console.log("🔄 [TreatmentHistory] Manual refresh triggered");
      await fetchTreatmentData();
      notification.success({
        message: "Cập nhật thành công",
        description: "Dữ liệu đã được làm mới",
        placement: "topRight",
      });
    } catch (err) {
      console.error("Error refreshing data:", err);
      notification.error({
        message: "Lỗi cập nhật",
        description: "Không thể làm mới dữ liệu",
        placement: "topRight",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      active: { color: "green", text: "Đang điều trị", icon: "🟢" },
      completed: { color: "blue", text: "Hoàn thành", icon: "✅" },
      cancelled: { color: "red", text: "Đã hủy", icon: "❌" },
      pending: { color: "orange", text: "Chờ xử lý", icon: "⏳" },
      inactive: { color: "gray", text: "Không hoạt động", icon: "⚪" },
    };

    const config = statusConfig[status?.toLowerCase()] || {
      color: "default",
      text: status || "Không xác định",
      icon: "❓",
    };

    return (
      <Tag
        color={config.color}
        style={{ borderRadius: "6px", fontWeight: "500" }}
      >
        <span style={{ marginRight: "4px" }}>{config.icon}</span>
        {config.text}
      </Tag>
    );
  };

  const getStatusIcon = (status) => {
    const statusIcons = {
      active: <PlayCircleOutlined style={{ color: "#52c41a" }} />,
      completed: <CheckCircleOutlined style={{ color: "#1890ff" }} />,
      cancelled: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
      pending: <PauseCircleOutlined style={{ color: "#faad14" }} />,
      inactive: <PauseCircleOutlined style={{ color: "#d9d9d9" }} />,
    };
    return statusIcons[status?.toLowerCase()] || <PauseCircleOutlined />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getProgressColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "#52c41a";
      case "completed":
        return "#1890ff";
      case "cancelled":
        return "#ff4d4f";
      case "pending":
        return "#faad14";
      default:
        return "#d9d9d9";
    }
  };

  const getPhaseStatusIcon = (phaseStatus) => {
    switch (phaseStatus?.toLowerCase()) {
      case "completed":
        return <CheckCircleFilled style={{ color: "#52c41a" }} />;
      case "active":
        return <ClockCircleFilled style={{ color: "#1890ff" }} />;
      case "pending":
        return <ExclamationCircleFilled style={{ color: "#faad14" }} />;
      case "cancelled":
        return <CloseCircleOutlined style={{ color: "#ff4d4f" }} />;
      default:
        return <PauseCircleOutlined style={{ color: "#d9d9d9" }} />;
    }
  };

  const getPhaseStatusColor = (phaseStatus) => {
    switch (phaseStatus?.toLowerCase()) {
      case "completed":
        return "success";
      case "active":
        return "processing";
      case "pending":
        return "warning";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const filteredHistory = Array.isArray(treatmentHistory)
    ? treatmentHistory.filter((item) => {
        if (selectedStatus === "all") return true;
        return item.status?.toLowerCase() === selectedStatus.toLowerCase();
      })
    : [];

  const renderLoadingState = () => (
    <div style={{ padding: "50px", textAlign: "center" }}>
      <Skeleton active paragraph={{ rows: 8 }} />
      <div style={{ marginTop: "24px" }}>
        <Spin size="large" />
        <div style={{ marginTop: "16px" }}>
          <Text type="secondary">Đang tải lịch sử điều trị...</Text>
        </div>
      </div>
    </div>
  );

  const renderErrorState = () => (
    <div style={{ padding: "24px" }}>
      <Result
        status="error"
        title="Không thể tải dữ liệu"
        subTitle={error}
        extra={[
          <Button type="primary" key="retry" onClick={fetchTreatmentData}>
            Thử lại
          </Button>,
        ]}
      />
    </div>
  );

  const renderActiveTreatmentPlan = () => {
    if (!activeTreatmentPlan) return null;

    return (
      <Card
        style={{
          marginBottom: "24px",
          background: `linear-gradient(135deg, ${token.colorPrimaryBg} 0%, ${token.colorBgContainer} 100%)`,
          border: `1px solid ${token.colorBorderSecondary}`,
          borderRadius: "12px",
        }}
        bodyStyle={{ padding: "24px" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <Avatar
            size={48}
            icon={<TrophyOutlined />}
            style={{ backgroundColor: token.colorPrimary, marginRight: "16px" }}
          />
          <div>
            <Title
              level={3}
              style={{ margin: 0, color: token.colorTextHeading }}
            >
              Phác Đồ Điều Trị Hiện Tại
            </Title>
            <Text type="secondary">Phác đồ đang được thực hiện</Text>
          </div>
        </div>

        <Row gutter={[24, 16]}>
          <Col xs={24} lg={16}>
            <Title
              level={4}
              style={{ marginBottom: "16px", color: token.colorTextHeading }}
            >
              {activeTreatmentPlan.planName || "Phác đồ điều trị"}
            </Title>
            <Descriptions column={{ xs: 1, sm: 2 }} size="small">
              <Descriptions.Item
                label={
                  <Space>
                    <MedicineBoxOutlined />
                    <Text strong>Loại điều trị</Text>
                  </Space>
                }
              >
                <Text>{activeTreatmentPlan.treatmentType || "N/A"}</Text>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <Space>
                    <CalendarOutlined />
                    <Text strong>Ngày bắt đầu</Text>
                  </Space>
                }
              >
                <Text>{formatDate(activeTreatmentPlan.startDate)}</Text>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <Space>
                    <ClockCircleOutlined />
                    <Text strong>Ngày kết thúc dự kiến</Text>
                  </Space>
                }
              >
                <Text>{formatDate(activeTreatmentPlan.endDate)}</Text>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <Space>
                    <PercentageOutlined />
                    <Text strong>Tỷ lệ thành công</Text>
                  </Space>
                }
              >
                <Text strong style={{ color: "#52c41a" }}>
                  {activeTreatmentPlan.successProbability || "N/A"}%
                </Text>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <Space>
                    <DollarOutlined />
                    <Text strong>Chi phí ước tính</Text>
                  </Space>
                }
              >
                <Text strong style={{ color: "#1890ff" }}>
                  {formatCurrency(activeTreatmentPlan.estimatedCost)}
                </Text>
              </Descriptions.Item>
            </Descriptions>
          </Col>
          <Col xs={24} lg={8}>
            <div style={{ textAlign: "center" }}>
              {getStatusTag(activeTreatmentPlan.status)}
              {activeTreatmentPlan.successProbability && (
                <div style={{ marginTop: "16px" }}>
                  <Progress
                    type="circle"
                    percent={activeTreatmentPlan.successProbability}
                    size={80}
                    strokeColor={getProgressColor(activeTreatmentPlan.status)}
                    format={(percent) => `${percent}%`}
                  />
                  <div style={{ marginTop: "8px" }}>
                    <Text type="secondary">Tỷ lệ thành công</Text>
                  </div>
                </div>
              )}
            </div>
          </Col>
        </Row>
      </Card>
    );
  };

  const renderStatistics = () => (
    <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
      <Col xs={12} sm={6}>
        <Card size="small" hoverable>
          <Statistic
            title="Tổng số phác đồ"
            value={filteredHistory.length}
            prefix={<HistoryOutlined />}
            valueStyle={{ color: token.colorPrimary }}
          />
        </Card>
      </Col>
      <Col xs={12} sm={6}>
        <Card size="small" hoverable>
          <Statistic
            title="Đang điều trị"
            value={filteredHistory.filter((t) => t.status === "active").length}
            valueStyle={{ color: "#52c41a" }}
            prefix={<MedicineBoxOutlined />}
          />
        </Card>
      </Col>
      <Col xs={12} sm={6}>
        <Card size="small" hoverable>
          <Statistic
            title="Hoàn thành"
            value={
              filteredHistory.filter((t) => t.status === "completed").length
            }
            valueStyle={{ color: "#1890ff" }}
            prefix={<TrophyOutlined />}
          />
        </Card>
      </Col>
      <Col xs={12} sm={6}>
        <Card size="small" hoverable>
          <Statistic
            title="Đã hủy"
            value={
              filteredHistory.filter((t) => t.status === "cancelled").length
            }
            valueStyle={{ color: "#ff4d4f" }}
            prefix={<CloseCircleOutlined />}
          />
        </Card>
      </Col>
    </Row>
  );

  const renderTimelineView = () => (
    <Card
      title={
        <Space>
          <ClockIcon />
          <Text strong>Timeline Điều Trị</Text>
        </Space>
      }
      size="small"
      style={{ marginBottom: "24px" }}
    >
      <Timeline
        items={filteredHistory.map((treatment, index) => ({
          color: getProgressColor(treatment.status),
          children: (
            <Card
              size="small"
              style={{
                marginBottom: "8px",
                borderLeft: `4px solid ${getProgressColor(treatment.status)}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <Title level={5} style={{ margin: 0 }}>
                  {treatment.planName || `Phác đồ ${index + 1}`}
                </Title>
                {getStatusTag(treatment.status)}
              </div>
              <Space
                direction="vertical"
                size="small"
                style={{ width: "100%" }}
              >
                <div>
                  <Text type="secondary">Loại điều trị: </Text>
                  <Text strong>{treatment.treatmentType || "N/A"}</Text>
                </div>
                <div>
                  <Text type="secondary">Thời gian: </Text>
                  <Text>
                    {formatDate(treatment.startDate)} -{" "}
                    {formatDate(treatment.endDate)}
                  </Text>
                </div>
                {treatment.successProbability && (
                  <div>
                    <Text type="secondary">Tỷ lệ thành công: </Text>
                    <Text strong style={{ color: "#52c41a" }}>
                      {treatment.successProbability}%
                    </Text>
                  </div>
                )}
                {treatment.estimatedCost && (
                  <div>
                    <Text type="secondary">Chi phí ước tính: </Text>
                    <Text strong style={{ color: "#1890ff" }}>
                      {formatCurrency(treatment.estimatedCost)}
                    </Text>
                  </div>
                )}
              </Space>
            </Card>
          ),
        }))}
      />
    </Card>
  );

  const renderPhaseDetails = () => {
    if (!phaseDetails) return null;

    return (
      <div>
        <Title level={4} style={{ marginBottom: "16px" }}>
          Chi Tiết Giai Đoạn Điều Trị
        </Title>

        {Array.isArray(phaseDetails) && phaseDetails.length > 0 ? (
          <Steps
            direction="vertical"
            current={phaseDetails.findIndex(
              (phase) =>
                phase.status === "active" ||
                phase.status === "IN_PROGRESS" ||
                phase.status === "in_progress"
            )}
            style={{ marginBottom: "24px" }}
          >
            {phaseDetails.map((phase, index) => (
              <Step
                key={phase.id || phase.phaseId || index}
                status={getPhaseStatusColor(phase.status)}
                title={
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    {getPhaseStatusIcon(phase.status)}
                    <Text strong>
                      {phase.phaseName ||
                        phase.name ||
                        `Giai đoạn ${index + 1}`}
                    </Text>
                  </div>
                }
                description={
                  <div style={{ marginTop: "8px" }}>
                    <div>
                      <Text type="secondary">Trạng thái: </Text>
                      <Tag color={getProgressColor(phase.status)}>
                        {phase.status === "active" ||
                        phase.status === "IN_PROGRESS"
                          ? "Đang thực hiện"
                          : phase.status === "completed" ||
                            phase.status === "COMPLETED"
                          ? "Hoàn thành"
                          : phase.status === "pending" ||
                            phase.status === "PENDING"
                          ? "Chờ thực hiện"
                          : phase.status === "cancelled" ||
                            phase.status === "CANCELLED"
                          ? "Đã hủy"
                          : phase.status || "Không xác định"}
                      </Tag>
                    </div>
                    {phase.startDate && (
                      <div>
                        <Text type="secondary">Ngày bắt đầu: </Text>
                        <Text>{formatDate(phase.startDate)}</Text>
                      </div>
                    )}
                    {phase.endDate && (
                      <div>
                        <Text type="secondary">Ngày kết thúc: </Text>
                        <Text>{formatDate(phase.endDate)}</Text>
                      </div>
                    )}
                    {phase.description && (
                      <div>
                        <Text type="secondary">Mô tả: </Text>
                        <Text>{phase.description}</Text>
                      </div>
                    )}
                    {phase.duration && (
                      <div>
                        <Text type="secondary">Thời gian: </Text>
                        <Text>{phase.duration} ngày</Text>
                      </div>
                    )}
                    {phase.order && (
                      <div>
                        <Text type="secondary">Thứ tự: </Text>
                        <Text>{phase.order}</Text>
                      </div>
                    )}
                    {phase.progress && (
                      <div style={{ marginTop: "8px" }}>
                        <Text type="secondary">Tiến độ: </Text>
                        <Progress
                          percent={phase.progress}
                          size="small"
                          strokeColor={getProgressColor(phase.status)}
                          showInfo={false}
                        />
                        <Text
                          strong
                          style={{ color: "#52c41a", fontSize: "12px" }}
                        >
                          {phase.progress}%
                        </Text>
                      </div>
                    )}
                    {phase.activities &&
                      Array.isArray(phase.activities) &&
                      phase.activities.length > 0 && (
                        <div style={{ marginTop: "8px" }}>
                          <Text type="secondary">Hoạt động: </Text>
                          <div style={{ marginTop: "4px" }}>
                            {phase.activities.map((activity, actIndex) => (
                              <Tag
                                key={actIndex}
                                size="small"
                                style={{ marginBottom: "4px" }}
                              >
                                {activity.name || activity}
                              </Tag>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                }
              />
            ))}
          </Steps>
        ) : (
          <Empty
            description="Không có thông tin giai đoạn"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </div>
    );
  };

  const renderTreatmentCards = () => (
    <div>
      <Title level={3} style={{ marginBottom: "16px" }}>
        <FileTextOutlined /> Chi Tiết Phác Đồ Điều Trị
      </Title>
      <Row gutter={[16, 16]}>
        {filteredHistory.map((treatment, index) => (
          <Col xs={24} sm={12} lg={8} xl={6} key={treatment.planId || index}>
            <Card
              hoverable
              size="small"
              style={{
                borderLeft: `4px solid ${getProgressColor(treatment.status)}`,
                borderRadius: "8px",
                transition: "all 0.3s ease",
              }}
              actions={[
                treatment.status !== "cancelled" && (
                  <Tooltip title="👁️ Xem chi tiết giai đoạn điều trị">
                    <EyeOutlined
                      key="phases"
                      onClick={() => {
                        const treatmentId =
                          treatment.planId ||
                          treatment.id ||
                          treatment.treatmentPlanId;
                        if (treatmentId) {
                          fetchPhaseDetails(treatmentId);
                        } else {
                          console.warn(
                            "⚠️ [TreatmentHistory] No valid treatment ID found:",
                            treatment
                          );
                          notification.warning({
                            message: "Không tìm thấy ID phác đồ",
                            description:
                              "Không thể xác định phác đồ điều trị này",
                            placement: "topRight",
                          });
                        }
                      }}
                      style={{
                        color: token.colorPrimary,
                        fontSize: "16px",
                        cursor: "pointer",
                      }}
                    />
                  </Tooltip>
                ),
              ].filter(Boolean)}
              title={
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text strong style={{ fontSize: "14px" }}>
                    {treatment.planName || `Phác đồ ${index + 1}`}
                  </Text>
                  {getStatusTag(treatment.status)}
                </div>
              }
            >
              <Space
                direction="vertical"
                style={{ width: "100%" }}
                size="small"
              >
                <div>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    Loại điều trị:
                  </Text>
                  <br />
                  <Text strong>{treatment.treatmentType || "N/A"}</Text>
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    Ngày bắt đầu:
                  </Text>
                  <br />
                  <Text>{formatDate(treatment.startDate)}</Text>
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    Ngày kết thúc:
                  </Text>
                  <br />
                  <Text>{formatDate(treatment.endDate)}</Text>
                </div>
                {treatment.successProbability && (
                  <div>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      Tỷ lệ thành công:
                    </Text>
                    <br />
                    <Progress
                      percent={treatment.successProbability}
                      size="small"
                      strokeColor={getProgressColor(treatment.status)}
                      showInfo={false}
                    />
                    <Text strong style={{ color: "#52c41a", fontSize: "12px" }}>
                      {treatment.successProbability}%
                    </Text>
                  </div>
                )}
                {treatment.estimatedCost && (
                  <div>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      Chi phí ước tính:
                    </Text>
                    <br />
                    <Text strong style={{ color: "#1890ff" }}>
                      {formatCurrency(treatment.estimatedCost)}
                    </Text>
                  </div>
                )}
                {treatment.phaseName && (
                  <div>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      Giai đoạn hiện tại:
                    </Text>
                    <br />
                    <Text>{treatment.phaseName}</Text>
                  </div>
                )}
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );

  const renderEmptyState = () => (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={
        <div>
          <Title level={4}>Chưa có lịch sử điều trị</Title>
          <Text type="secondary">
            Bạn chưa có phác đồ điều trị nào trong hệ thống.
          </Text>
        </div>
      }
    />
  );

  if (loading) {
    return renderLoadingState();
  }

  if (error) {
    return renderErrorState();
  }

  return (
    <div
      style={{
        padding: "24px",
        background: token.colorBgLayout,
        minHeight: "100vh",
      }}
    >
      {/* Header Section */}
      <div style={{ marginBottom: "24px" }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title
              level={2}
              style={{ margin: 0, color: token.colorTextHeading }}
            >
              <HistoryOutlined /> Lịch Sử Điều Trị
            </Title>
            <Text type="secondary">
              Theo dõi tất cả các phác đồ điều trị của bạn
            </Text>
          </Col>
          <Col>
            <Space>
              <Text>Lọc theo trạng thái:</Text>
              <Select
                value={selectedStatus}
                onChange={setSelectedStatus}
                style={{ width: 150 }}
                placeholder="Chọn trạng thái"
              >
                <Option value="all">Tất cả</Option>
                <Option value="active">Đang điều trị</Option>
                <Option value="completed">Hoàn thành</Option>
                <Option value="cancelled">Đã hủy</Option>
                <Option value="pending">Chờ xử lý</Option>
              </Select>
              <Tooltip title="Làm mới dữ liệu">
                <Button
                  type="primary"
                  icon={<ReloadOutlined spin={refreshing} />}
                  onClick={handleRefresh}
                  loading={refreshing}
                >
                  Làm mới
                </Button>
              </Tooltip>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Active Treatment Plan */}
      {renderActiveTreatmentPlan()}

      {/* Main Content */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: "overview",
            label: (
              <Space>
                <EyeOutlined />
                Tổng quan
              </Space>
            ),
            children: (
              <div>
                {renderStatistics()}
                {filteredHistory.length > 0 ? (
                  <>
                    {renderTimelineView()}
                    {renderTreatmentCards()}
                  </>
                ) : (
                  renderEmptyState()
                )}
              </div>
            ),
          },
          {
            key: "timeline",
            label: (
              <Space>
                <ClockIcon />
                Timeline
              </Space>
            ),
            children: renderTimelineView(),
          },
          {
            key: "details",
            label: (
              <Space>
                <FileTextOutlined />
                Chi tiết
              </Space>
            ),
            children:
              filteredHistory.length > 0
                ? renderTreatmentCards()
                : renderEmptyState(),
          },
        ]}
      />

      {/* Phase Details Drawer */}
      <Drawer
        title={
          <Space>
            <MedicineBoxOutlined />
            <Text strong>Chi Tiết Giai Đoạn Điều Trị</Text>
          </Space>
        }
        placement="right"
        width={600}
        onClose={() => {
          setPhaseDrawerVisible(false);
          setPhaseDetails(null);
        }}
        open={phaseDrawerVisible}
        extra={
          <Button
            type="primary"
            icon={<ReloadOutlined spin={loadingPhases} />}
            onClick={() => {
              // Lấy treatmentId từ phaseDetails hoặc từ state
              const treatmentId =
                phaseDetails?.treatmentId ||
                phaseDetails?.treatmentPlanId ||
                phaseDetails?.planId;
              if (treatmentId) {
                fetchPhaseDetails(treatmentId);
              } else {
                console.warn(
                  "⚠️ [TreatmentHistory] No treatment ID found for refresh"
                );
                notification.warning({
                  message: "Không thể làm mới",
                  description: "Không tìm thấy ID phác đồ để làm mới",
                  placement: "topRight",
                });
              }
            }}
            loading={loadingPhases}
            size="small"
          >
            Làm mới
          </Button>
        }
      >
        {loadingPhases ? (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <Spin size="large" />
            <div style={{ marginTop: "16px" }}>
              <Text type="secondary">Đang tải thông tin giai đoạn...</Text>
            </div>
          </div>
        ) : (
          renderPhaseDetails()
        )}
      </Drawer>
    </div>
  );
};

export default TreatmentHistory;
