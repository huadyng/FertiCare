import React, { useState, useEffect, useContext } from "react";
import {
  Card,
  Table,
  Tag,
  Button,
  Progress,
  Typography,
  Row,
  Col,
  Statistic,
  Timeline,
  Modal,
  Form,
  Select,
  Input,
  message,
  Alert,
  Descriptions,
  Space,
  Tooltip,
  Badge,
  Divider,
  Spin,
} from "antd";
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  EditOutlined,
  HistoryOutlined,
  ReloadOutlined,
  CalendarOutlined,
  FileTextOutlined,
  UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { UserContext } from "../../../context/UserContext";
import apiTreatmentManagement from "../../../api/apiTreatmentManagement";
import "./TreatmentProgressTracker.css";

const { Title, Text } = Typography;
const { Option } = Select;

const TreatmentProgressTracker = ({
  patientId,
  treatmentPlanId,
  patientInfo,
  onPhaseStatusChange,
}) => {
  const { user } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [phases, setPhases] = useState([]);
  const [currentPhase, setCurrentPhase] = useState(null);
  const [progress, setProgress] = useState(null);
  const [statusModal, setStatusModal] = useState(false);
  const [editingPhase, setEditingPhase] = useState(null);
  const [statusForm] = Form.useForm();
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [historyModal, setHistoryModal] = useState(false);
  const [statusHistory, setStatusHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Load all treatment data
  useEffect(() => {
    if (treatmentPlanId) {
      loadTreatmentData();
    }
  }, [treatmentPlanId]);

  const loadTreatmentData = async () => {
    setLoading(true);
    try {
      console.log("🔄 Loading treatment progress data...");

      // Load phases, current phase, and progress in parallel
      const [phasesResult, currentPhaseResult, progressResult] =
        await Promise.allSettled([
          apiTreatmentManagement.getTreatmentPlanPhases(treatmentPlanId),
          apiTreatmentManagement.getCurrentPhase(treatmentPlanId),
          apiTreatmentManagement.getTreatmentProgress(treatmentPlanId),
        ]);

      // Handle phases
      if (phasesResult.status === "fulfilled" && phasesResult.value.success) {
        setPhases(phasesResult.value.data);
        console.log("✅ Phases loaded:", phasesResult.value.data);
      } else {
        console.warn("⚠️ Failed to load phases");
        setPhases([]);
      }

      // Handle current phase
      if (
        currentPhaseResult.status === "fulfilled" &&
        currentPhaseResult.value.success
      ) {
        setCurrentPhase(currentPhaseResult.value.data);
        console.log("✅ Current phase loaded:", currentPhaseResult.value.data);
      } else {
        console.warn("⚠️ No current phase found");
        setCurrentPhase(null);
      }

      // Handle progress
      if (
        progressResult.status === "fulfilled" &&
        progressResult.value.success
      ) {
        setProgress(progressResult.value.data);
        console.log("✅ Progress loaded:", progressResult.value.data);
      } else {
        console.warn("⚠️ Failed to load progress");
        setProgress(null);
      }
    } catch (error) {
      console.error("❌ Error loading treatment data:", error);
      message.error("Không thể tải dữ liệu điều trị");
    } finally {
      setLoading(false);
    }
  };

  // Update phase status
  const updatePhaseStatus = async (phaseId, statusData) => {
    setUpdatingStatus(true);
    try {
      const result = await apiTreatmentManagement.updatePhaseStatus(
        treatmentPlanId,
        phaseId,
        statusData
      );

      if (result.success) {
        message.success("✅ Cập nhật trạng thái thành công");

        // Reload data
        await loadTreatmentData();

        // Notify parent component
        if (onPhaseStatusChange) {
          onPhaseStatusChange(phaseId, statusData.status);
        }

        return result;
      } else {
        throw new Error(result.message || "Không thể cập nhật trạng thái");
      }
    } catch (error) {
      console.error("❌ Error updating phase status:", error);
      message.error(`❌ Lỗi: ${error.message}`);
      return { success: false, message: error.message };
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Handle status update
  const handleStatusUpdate = (phase) => {
    setEditingPhase(phase);
    statusForm.setFieldsValue({
      status: phase.status,
      notes: phase.notes || "",
    });
    setStatusModal(true);
  };

  // Save status update
  const handleSaveStatus = async (values) => {
    if (!editingPhase) return;

    const statusData = {
      status: values.status,
      notes: values.notes || "",
    };

    const result = await updatePhaseStatus(editingPhase.phaseId, statusData);

    if (result.success) {
      setStatusModal(false);
      setEditingPhase(null);
      statusForm.resetFields();
    }
  };

  // Load status history
  const loadStatusHistory = async (phaseId) => {
    setLoadingHistory(true);
    try {
      const result = await apiTreatmentManagement.getPhaseStatusHistory(
        phaseId
      );
      if (result.success) {
        setStatusHistory(result.data);
      } else {
        setStatusHistory([]);
      }
    } catch (error) {
      console.error("❌ Error loading status history:", error);
      setStatusHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Show status history
  const showStatusHistory = (phase) => {
    loadStatusHistory(phase.phaseId);
    setHistoryModal(true);
  };

  // Get status display info
  const getStatusInfo = (status) => {
    const statusMap = {
      Pending: {
        color: "orange",
        icon: <ClockCircleOutlined />,
        text: "Chờ thực hiện",
      },
      "In Progress": {
        color: "blue",
        icon: <PlayCircleOutlined />,
        text: "Đang thực hiện",
      },
      Completed: {
        color: "green",
        icon: <CheckCircleOutlined />,
        text: "Hoàn thành",
      },
      Cancelled: {
        color: "red",
        icon: <ExclamationCircleOutlined />,
        text: "Đã hủy",
      },
      "On Hold": {
        color: "yellow",
        icon: <PauseCircleOutlined />,
        text: "Tạm dừng",
      },
    };
    return (
      statusMap[status] || {
        color: "default",
        icon: <ClockCircleOutlined />,
        text: status,
      }
    );
  };

  // Table columns
  const columns = [
    {
      title: "STT",
      dataIndex: "phaseOrder",
      key: "phaseOrder",
      width: 60,
      render: (value, record, index) => value || index + 1,
    },
    {
      title: "Giai đoạn",
      dataIndex: "phaseName",
      key: "phaseName",
      render: (text, record) => (
        <div>
          <Text strong>{text || "Không xác định"}</Text>
          {record.description && (
            <div>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                {record.description}
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status) => {
        const statusInfo = getStatusInfo(status);
        return (
          <Tag color={statusInfo.color} icon={statusInfo.icon}>
            {statusInfo.text}
          </Tag>
        );
      },
    },
    {
      title: "Thời gian dự kiến",
      dataIndex: "expectedDuration",
      key: "expectedDuration",
      width: 120,
      render: (text) => text || "Không xác định",
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
      width: 120,
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "-"),
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "endDate",
      key: "endDate",
      width: 120,
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "-"),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            onClick={() => handleStatusUpdate(record)}
            loading={updatingStatus}
          >
            Cập nhật
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => showStatusHistory(record)}
            icon={<HistoryOutlined />}
          >
            Lịch sử
          </Button>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
        <p style={{ marginTop: "16px" }}>Đang tải dữ liệu tiến độ...</p>
      </div>
    );
  }

  return (
    <div className="treatment-progress-tracker">
      {/* Header */}
      <Card
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <PlayCircleOutlined />
            <span>Theo dõi tiến độ điều trị</span>
          </div>
        }
        extra={
          <Button
            icon={<ReloadOutlined />}
            onClick={loadTreatmentData}
            loading={loading}
          >
            Tải lại
          </Button>
        }
        style={{ marginBottom: 16 }}
      >
        {/* Patient Info */}
        <Descriptions column={3} size="small">
          <Descriptions.Item label="Bệnh nhân">
            <UserOutlined /> {patientInfo?.name || `ID: ${patientId}`}
          </Descriptions.Item>
          <Descriptions.Item label="Kế hoạch điều trị">
            <FileTextOutlined /> {treatmentPlanId}
          </Descriptions.Item>
          <Descriptions.Item label="Cập nhật lần cuối">
            <CalendarOutlined />{" "}
            {progress?.lastUpdated
              ? dayjs(progress.lastUpdated).format("DD/MM/YYYY HH:mm")
              : "Chưa có"}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Progress Overview */}
      {progress && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tổng số giai đoạn"
                value={progress.totalPhases}
                prefix={<FileTextOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Đã hoàn thành"
                value={progress.completedPhases}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Đang thực hiện"
                value={progress.inProgressPhases}
                prefix={<PlayCircleOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Chờ thực hiện"
                value={progress.pendingPhases}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: "#faad14" }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Progress Bar */}
      {progress && (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 16 }}>
            <Text strong>
              Tiến độ tổng thể: {progress.completionPercentage}%
            </Text>
          </div>
          <Progress
            percent={progress.completionPercentage}
            strokeColor={{
              "0%": "#ff7eb3",
              "100%": "#ff6b9d",
            }}
            trailColor="rgba(255, 126, 179, 0.1)"
            status={
              progress.completionPercentage === 100 ? "success" : "active"
            }
          />
          <div style={{ marginTop: 8 }}>
            <Text type="secondary">
              Giai đoạn hiện tại: {progress.currentPhase}
            </Text>
          </div>
        </Card>
      )}

      {/* Current Phase Card */}
      {currentPhase && (
        <Card
          title={
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <PlayCircleOutlined style={{ color: "#1890ff" }} />
              <span>Giai đoạn hiện tại</span>
            </div>
          }
          style={{ marginBottom: 16 }}
          extra={
            <Button
              type="primary"
              onClick={() => handleStatusUpdate(currentPhase)}
              loading={updatingStatus}
            >
              Cập nhật trạng thái
            </Button>
          }
        >
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Tên giai đoạn">
              {currentPhase.phaseName || "Không xác định"}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={getStatusInfo(currentPhase.status).color}>
                {getStatusInfo(currentPhase.status).icon}
                {getStatusInfo(currentPhase.status).text}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian dự kiến">
              {currentPhase.expectedDuration || "Không xác định"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày bắt đầu">
              {currentPhase.startDate
                ? dayjs(currentPhase.startDate).format("DD/MM/YYYY HH:mm")
                : "Chưa bắt đầu"}
            </Descriptions.Item>
          </Descriptions>
          {currentPhase.notes && (
            <Alert
              message="Ghi chú"
              description={currentPhase.notes}
              type="info"
              showIcon
              style={{ marginTop: 12 }}
            />
          )}
        </Card>
      )}

      {/* Phases Table */}
      <Card
        title={`Danh sách giai đoạn (${phases.length})`}
        style={{ marginBottom: 16 }}
      >
        <Table
          dataSource={phases}
          columns={columns}
          rowKey="phaseId"
          pagination={false}
          size="small"
        />
      </Card>

      {/* Status Update Modal */}
      <Modal
        title="Cập nhật trạng thái giai đoạn"
        open={statusModal}
        onCancel={() => {
          setStatusModal(false);
          setEditingPhase(null);
          statusForm.resetFields();
        }}
        footer={[
          <Button key="cancel" onClick={() => setStatusModal(false)}>
            Hủy
          </Button>,
          <Button
            key="save"
            type="primary"
            form="statusForm"
            htmlType="submit"
            loading={updatingStatus}
          >
            Cập nhật
          </Button>,
        ]}
      >
        <Form
          id="statusForm"
          form={statusForm}
          layout="vertical"
          onFinish={handleSaveStatus}
        >
          {editingPhase && (
            <Alert
              message={`Cập nhật trạng thái cho: ${
                editingPhase.phaseName || "Giai đoạn"
              }`}
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          <Form.Item
            label="Trạng thái"
            name="status"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
          >
            <Select placeholder="Chọn trạng thái">
              <Option value="Pending">
                <ClockCircleOutlined /> Chờ thực hiện
              </Option>
              <Option value="In Progress">
                <PlayCircleOutlined /> Đang thực hiện
              </Option>
              <Option value="Completed">
                <CheckCircleOutlined /> Hoàn thành
              </Option>
              <Option value="Cancelled">
                <ExclamationCircleOutlined /> Đã hủy
              </Option>
              <Option value="On Hold">
                <PauseCircleOutlined /> Tạm dừng
              </Option>
            </Select>
          </Form.Item>

          <Form.Item label="Ghi chú" name="notes">
            <Input.TextArea
              rows={4}
              placeholder="Nhập ghi chú về việc cập nhật trạng thái..."
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Status History Modal */}
      <Modal
        title="Lịch sử trạng thái"
        open={historyModal}
        onCancel={() => setHistoryModal(false)}
        footer={[
          <Button key="close" onClick={() => setHistoryModal(false)}>
            Đóng
          </Button>,
        ]}
        width={600}
      >
        {loadingHistory ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <Spin />
          </div>
        ) : (
          <Timeline>
            {statusHistory.map((item, index) => (
              <Timeline.Item
                key={item.id}
                color={getStatusInfo(item.status).color}
                dot={getStatusInfo(item.status).icon}
              >
                <div>
                  <Text strong>{getStatusInfo(item.status).text}</Text>
                  <div style={{ marginTop: 4 }}>
                    <Text type="secondary">
                      {dayjs(item.updatedAt).format("DD/MM/YYYY HH:mm")} -{" "}
                      {item.updatedBy}
                    </Text>
                  </div>
                  {item.notes && (
                    <div style={{ marginTop: 4 }}>
                      <Text>{item.notes}</Text>
                    </div>
                  )}
                </div>
              </Timeline.Item>
            ))}
          </Timeline>
        )}
      </Modal>
    </div>
  );
};

export default TreatmentProgressTracker;
