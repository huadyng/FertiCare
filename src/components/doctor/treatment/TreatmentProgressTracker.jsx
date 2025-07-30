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
  key, // 🆕 Thêm key prop để force re-mount
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

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [componentMounted, setComponentMounted] = useState(false);

  // Kiểm tra xem có patientId hợp lệ không
  if (!patientId) {
    return (
      <div style={{ padding: '20px' }}>
        <Card className="examination-main-card">
          <div className="examination-header">
            <Title level={2} className="examination-title">
              <Space>
                <UserOutlined className="title-icon" />
                Theo dõi tiến trình
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
              📊
            </div>
            <Title level={3} style={{ color: '#666', marginBottom: '16px' }}>
              Không có bệnh nhân theo dõi
            </Title>
            <Text style={{ fontSize: '16px', color: '#888', display: 'block', marginBottom: '24px' }}>
              Vui lòng chọn bệnh nhân để theo dõi tiến độ điều trị
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

  // Load all treatment data
  useEffect(() => {
    if (treatmentPlanId) {
      loadTreatmentData();
    }
  }, [treatmentPlanId, refreshTrigger]);

  // 🆕 Force load data khi component mount
  useEffect(() => {
    setComponentMounted(true);
    if (treatmentPlanId) {
      loadTreatmentData();
    }
  }, []); // Empty dependency array = only run on mount

  // 🆕 Reload data khi component mounted và có treatmentPlanId
  useEffect(() => {
    if (componentMounted && treatmentPlanId) {
      loadTreatmentData();
    }
  }, [componentMounted, treatmentPlanId]);

  const loadTreatmentData = async () => {
    setLoading(true);
    try {
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
      } else {
        setPhases([]);
      }

      // Handle current phase
      if (
        currentPhaseResult.status === "fulfilled" &&
        currentPhaseResult.value.success
      ) {
        setCurrentPhase(currentPhaseResult.value.data);
      } else {
        setCurrentPhase(null);
      }

      // Handle progress
      if (
        progressResult.status === "fulfilled" &&
        progressResult.value.success
      ) {
        setProgress(progressResult.value.data);
      } else {
        setProgress(null);
      }
    } catch (error) {
      console.error("❌ [TreatmentProgressTracker] Error loading treatment data:", error);
      
      // 🆕 Xử lý lỗi authentication
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.warn("⚠️ [TreatmentProgressTracker] Authentication error, but continuing with empty data");
        // Không logout, chỉ hiển thị dữ liệu trống
        setPhases([]);
        setCurrentPhase(null);
        setProgress(null);
      } else {
        // Lỗi khác - vẫn hiển thị dữ liệu trống
        setPhases([]);
        setCurrentPhase(null);
        setProgress(null);
        message.error("Không thể tải dữ liệu điều trị");
      }
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
        message.success("✅ Cập nhật trạng thái phase thành công");

        // 🆕 Cập nhật state ngay lập tức thay vì chỉ reload
        setPhases(prevPhases => 
          prevPhases.map(phase => 
            phase.phaseId === phaseId 
              ? { ...phase, ...statusData }
              : phase
          )
        );

        // 🆕 Cập nhật current phase nếu cần
        setCurrentPhase(prevCurrent => {
          if (prevCurrent && prevCurrent.phaseId === phaseId) {
            return { ...prevCurrent, ...statusData };
          }
          return prevCurrent;
        });

        // 🆕 Reload progress data để cập nhật thống kê
        try {
          const progressResult = await apiTreatmentManagement.getTreatmentProgress(treatmentPlanId);
          if (progressResult.success) {
            setProgress(progressResult.data);
          }
        } catch (progressError) {
          // Silent fail for progress reload
        }

        // Notify parent component
        if (onPhaseStatusChange) {
          onPhaseStatusChange(result.data);
        }

        // 🆕 Force re-render để đảm bảo UI được cập nhật
        setRefreshTrigger(prev => prev + 1);

        // 🆕 Force re-render sau 1 giây để đảm bảo UI được cập nhật
        setTimeout(() => {
          setRefreshTrigger(prev => prev + 1);
        }, 1000);

        return result;
      } else {
        throw new Error(result.message || "Không thể cập nhật trạng thái");
      }
    } catch (error) {
      // Handle specific backend errors
      if (error.response?.data?.message) {
        message.error(`❌ ${error.response.data.message}`);
      } else {
        message.error(`❌ Lỗi: ${error.message}`);
      }
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

    // Validate business rules
    if (values.status === "In Progress" && editingPhase.status === "Pending") {
      // Check if previous phase is completed
      const currentPhaseOrder = editingPhase.phaseOrder;
      if (currentPhaseOrder > 1) {
        const previousPhase = phases.find(p => p.phaseOrder === currentPhaseOrder - 1);
        if (previousPhase && previousPhase.status !== "Completed") {
          message.error(`❌ Không thể bắt đầu giai đoạn ${currentPhaseOrder} vì giai đoạn ${currentPhaseOrder - 1} chưa hoàn thành`);
          return;
        }
      }
    }

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



  // Get status display info
  const getStatusInfo = (status) => {
    const statusMap = {
      Pending: {
        color: "warning",
        icon: <ClockCircleOutlined />,
        text: "Chờ thực hiện",
      },
      "In Progress": {
        color: "processing",
        icon: <PlayCircleOutlined />,
        text: "Đang thực hiện",
      },
      Completed: {
        color: "success",
        icon: <CheckCircleOutlined />,
        text: "Hoàn thành",
      },
      Cancelled: {
        color: "error",
        icon: <ExclamationCircleOutlined />,
        text: "Đã hủy",
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

  // Check if phase can be updated
  const canUpdatePhase = (phase) => {
    // Cannot update Completed or Cancelled phases
    if (phase.status === "Completed" || phase.status === "Cancelled") {
      return false;
    }
    return true;
  };

  // Get available status options for a phase
  const getAvailableStatusOptions = (phase) => {
    const currentStatus = phase.status;
    const options = [];

    switch (currentStatus) {
      case "Pending":
        options.push(
          { value: "Pending", label: "Chờ thực hiện", disabled: false },
          { value: "In Progress", label: "Đang thực hiện", disabled: false },
          { value: "Cancelled", label: "Đã hủy", disabled: false }
        );
        break;
      case "In Progress":
        options.push(
          { value: "In Progress", label: "Đang thực hiện", disabled: false },
          { value: "Completed", label: "Hoàn thành", disabled: false },
          { value: "Cancelled", label: "Đã hủy", disabled: false }
          // 🆕 Không có option "Pending" - không thể quay lại trạng thái chờ
        );
        break;
      case "Completed":
        options.push(
          { value: "Completed", label: "Hoàn thành", disabled: true }
        );
        break;
      case "Cancelled":
        options.push(
          { value: "Cancelled", label: "Đã hủy", disabled: true }
        );
        break;
      default:
        options.push(
          { value: "Pending", label: "Chờ thực hiện", disabled: false },
          { value: "In Progress", label: "Đang thực hiện", disabled: false },
          { value: "Completed", label: "Hoàn thành", disabled: false },
          { value: "Cancelled", label: "Đã hủy", disabled: false }
        );
    }

    return options;
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
      width: 100,
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          onClick={() => handleStatusUpdate(record)}
          loading={updatingStatus}
          disabled={!canUpdatePhase(record)}
          title={!canUpdatePhase(record) ? "Không thể cập nhật phase đã hoàn thành/hủy" : "Cập nhật trạng thái"}
        >
          Cập nhật
        </Button>
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
        extra={null}
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
              {editingPhase && getAvailableStatusOptions(editingPhase).map(option => (
                <Option 
                  key={option.value} 
                  value={option.value}
                  disabled={option.disabled}
                >
                  {getStatusInfo(option.value).icon} {option.label}
                </Option>
              ))}
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


    </div>
  );
};

export default TreatmentProgressTracker;
