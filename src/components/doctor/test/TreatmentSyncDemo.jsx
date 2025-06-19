import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Space,
  Typography,
  Tag,
  Row,
  Col,
  Progress,
  Timeline,
  Descriptions,
  message,
} from "antd";
import {
  CheckCircleOutlined,
  LoadingOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { treatmentStateManager } from "../../../utils/treatmentStateManager";

const { Title, Text } = Typography;

const TreatmentSyncDemo = () => {
  const [currentState, setCurrentState] = useState(null);
  const [eventLog, setEventLog] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Refresh state from manager
  const refreshState = () => {
    const state = treatmentStateManager.getCurrentState();
    setCurrentState(state);
    console.log("📊 Current state:", state);
  };

  // Listen for events
  useEffect(() => {
    const handleEvent = (event) => {
      const logEntry = {
        timestamp: new Date().toLocaleString("vi-VN"),
        type: event.type,
        data: event.detail,
      };

      setEventLog((prev) => [logEntry, ...prev.slice(0, 19)]); // Keep last 20 events
      refreshState();

      message.success(`🔔 Event: ${event.type}`);
    };

    // Listen for all treatment events
    treatmentStateManager.addEventListener(
      "examination:completed",
      handleEvent
    );
    treatmentStateManager.addEventListener(
      "treatmentplan:completed",
      handleEvent
    );
    treatmentStateManager.addEventListener("schedule:completed", handleEvent);
    treatmentStateManager.addEventListener("step:changed", handleEvent);
    treatmentStateManager.addEventListener("initialized", handleEvent);

    // Initial load
    refreshState();

    return () => {
      treatmentStateManager.removeEventListener(
        "examination:completed",
        handleEvent
      );
      treatmentStateManager.removeEventListener(
        "treatmentplan:completed",
        handleEvent
      );
      treatmentStateManager.removeEventListener(
        "schedule:completed",
        handleEvent
      );
      treatmentStateManager.removeEventListener("step:changed", handleEvent);
      treatmentStateManager.removeEventListener("initialized", handleEvent);
    };
  }, []);

  // Simulate completing examination
  const simulateExamination = () => {
    setIsLoading(true);
    const mockExamination = {
      patientId: "demo-1",
      diagnosis: "Vô sinh nguyên phát",
      recommendations: "Thực hiện IVF",
      symptoms: ["rối loạn kinh nguyệt", "đau bụng dưới"],
      labResults: {
        bloodTest: {
          FSH: "8.5",
          LH: "6.2",
          E2: "45",
        },
      },
      completedAt: new Date().toISOString(),
    };

    setTimeout(() => {
      treatmentStateManager.updateExamination("demo-1", mockExamination);
      setIsLoading(false);
      message.success("✅ Mô phỏng khám lâm sàng hoàn thành");
    }, 1000);
  };

  // Simulate completing treatment plan
  const simulateTreatmentPlan = () => {
    setIsLoading(true);
    const mockPlan = {
      patientId: "demo-1",
      type: "IVF_STANDARD",
      phases: [
        { name: "Chuẩn bị", duration: "7 ngày" },
        { name: "Kích thích buồng trứng", duration: "10-12 ngày" },
        { name: "Lấy trứng", duration: "1 ngày" },
        { name: "Nuôi phôi", duration: "3-5 ngày" },
        { name: "Chuyển phôi", duration: "1 ngày" },
      ],
      estimatedDuration: "4-6 tuần",
      completedAt: new Date().toISOString(),
    };

    setTimeout(() => {
      treatmentStateManager.updateTreatmentPlan("demo-1", mockPlan);
      setIsLoading(false);
      message.success("✅ Mô phỏng lập phác đồ hoàn thành");
    }, 1500);
  };

  // Simulate completing schedule
  const simulateSchedule = () => {
    setIsLoading(true);
    const mockSchedule = {
      patientId: "demo-1",
      sessions: [
        {
          date: "2024-02-01",
          activity: "Khám tổng quát",
          type: "consultation",
        },
        {
          date: "2024-02-05",
          activity: "Bắt đầu kích thích",
          type: "injection",
        },
        { date: "2024-02-15", activity: "Lấy trứng", type: "procedure" },
        { date: "2024-02-18", activity: "Chuyển phôi", type: "procedure" },
      ],
      totalSessions: 4,
      completedAt: new Date().toISOString(),
    };

    setTimeout(() => {
      treatmentStateManager.updateSchedule("demo-1", mockSchedule);
      setIsLoading(false);
      message.success("✅ Mô phỏng lập lịch hoàn thành");
    }, 2000);
  };

  // Initialize demo patient
  const initializeDemo = () => {
    treatmentStateManager.initializePatient("demo-1", {
      name: "Bệnh nhân mẫu",
      age: 32,
      gender: "female",
    });
    message.info("🔄 Khởi tạo bệnh nhân demo");
  };

  // Clear state
  const clearState = () => {
    treatmentStateManager.clearState("demo-1");
    setEventLog([]);
    message.info("🧹 Đã xóa trạng thái");
  };

  const getStepStatus = (stepIndex) => {
    if (!currentState) return "wait";
    return currentState.stepStatus[stepIndex] || "wait";
  };

  const getStepColor = (status) => {
    switch (status) {
      case "finish":
        return "green";
      case "process":
        return "blue";
      case "error":
        return "red";
      default:
        return "default";
    }
  };

  const progress = currentState
    ? treatmentStateManager.getOverallProgress()
    : { percentage: 0, completed: 0, total: 5 };

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>🔄 Treatment Sync Demo</Title>
      <Text type="secondary">
        Demo hệ thống đồng bộ dữ liệu giữa TreatmentProcess và các trang
        standalone
      </Text>

      <Row gutter={16} style={{ marginTop: 24 }}>
        {/* Control Panel */}
        <Col span={12}>
          <Card title="🎮 Điều khiển Demo" size="small">
            <Space direction="vertical" style={{ width: "100%" }}>
              <Button onClick={initializeDemo} type="primary" block>
                🔄 Khởi tạo Demo
              </Button>

              <Button
                onClick={simulateExamination}
                loading={isLoading}
                disabled={!currentState}
                block
              >
                📋 Mô phỏng Khám lâm sàng
              </Button>

              <Button
                onClick={simulateTreatmentPlan}
                loading={isLoading}
                disabled={!currentState}
                block
              >
                💊 Mô phỏng Lập phác đồ
              </Button>

              <Button
                onClick={simulateSchedule}
                loading={isLoading}
                disabled={!currentState}
                block
              >
                📅 Mô phỏng Lập lịch
              </Button>

              <Button onClick={clearState} danger block>
                🧹 Reset Demo
              </Button>
            </Space>
          </Card>

          {/* Progress Overview */}
          <Card
            title="📊 Tiến độ tổng thể"
            size="small"
            style={{ marginTop: 16 }}
          >
            <Progress
              percent={progress.percentage}
              status={progress.percentage === 100 ? "success" : "active"}
            />
            <div style={{ marginTop: 12 }}>
              <Tag color="blue">
                {progress.completed}/{progress.total} bước hoàn thành
              </Tag>
              {currentState?.currentStep !== undefined && (
                <Tag color="green">
                  Bước hiện tại: {currentState.currentStep}
                </Tag>
              )}
            </div>
          </Card>
        </Col>

        {/* State Display */}
        <Col span={12}>
          <Card title="📋 Trạng thái các bước" size="small">
            <Space direction="vertical" style={{ width: "100%" }}>
              {[
                { index: 0, title: "Khám lâm sàng", icon: "🏥" },
                { index: 1, title: "Lập phác đồ", icon: "💊" },
                { index: 2, title: "Lập lịch điều trị", icon: "📅" },
                { index: 3, title: "Theo dõi tiến trình", icon: "📈" },
                { index: 4, title: "Hoàn thành", icon: "✅" },
              ].map((step) => {
                const status = getStepStatus(step.index);
                const isCompleted = currentState?.completedSteps?.includes(
                  step.index
                );
                const isCurrent = currentState?.currentStep === step.index;

                return (
                  <div
                    key={step.index}
                    style={{
                      padding: 8,
                      border: "1px solid #f0f0f0",
                      borderRadius: 4,
                      backgroundColor: isCurrent
                        ? "#f6ffed"
                        : isCompleted
                        ? "#f0f9ff"
                        : "#fafafa",
                    }}
                  >
                    <Space>
                      <span style={{ fontSize: 16 }}>{step.icon}</span>
                      <Text strong>{step.title}</Text>
                      <Tag color={getStepColor(status)}>{status}</Tag>
                      {isCompleted && (
                        <CheckCircleOutlined style={{ color: "green" }} />
                      )}
                      {isCurrent && (
                        <LoadingOutlined style={{ color: "blue" }} />
                      )}
                    </Space>
                  </div>
                );
              })}
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Event Log */}
      <Card title="📝 Event Log" size="small" style={{ marginTop: 16 }}>
        <div style={{ maxHeight: 300, overflowY: "auto" }}>
          {eventLog.length === 0 ? (
            <Text type="secondary">Chưa có event nào...</Text>
          ) : (
            <Timeline size="small">
              {eventLog.map((event, index) => (
                <Timeline.Item
                  key={index}
                  color={event.type.includes("completed") ? "green" : "blue"}
                >
                  <div>
                    <Text strong>{event.type}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {event.timestamp}
                    </Text>
                    {event.data.stepId !== undefined && (
                      <Tag size="small" style={{ marginLeft: 8 }}>
                        Step {event.data.stepId}
                      </Tag>
                    )}
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          )}
        </div>
      </Card>

      {/* Raw State Data */}
      {currentState && (
        <Card title="🔍 Raw State Data" size="small" style={{ marginTop: 16 }}>
          <Descriptions size="small" column={2}>
            <Descriptions.Item label="Patient ID">
              {currentState.patientId}
            </Descriptions.Item>
            <Descriptions.Item label="Current Step">
              {currentState.currentStep}
            </Descriptions.Item>
            <Descriptions.Item label="Completed Steps">
              {currentState.completedSteps.join(", ") || "None"}
            </Descriptions.Item>
            <Descriptions.Item label="Last Updated">
              {currentState.lastUpdated
                ? new Date(currentState.lastUpdated).toLocaleString("vi-VN")
                : "Never"}
            </Descriptions.Item>
          </Descriptions>

          <details style={{ marginTop: 12 }}>
            <summary style={{ cursor: "pointer", color: "#1890ff" }}>
              📄 Xem toàn bộ state object
            </summary>
            <pre
              style={{
                background: "#f5f5f5",
                padding: 12,
                borderRadius: 4,
                fontSize: 12,
                marginTop: 8,
                overflow: "auto",
              }}
            >
              {JSON.stringify(currentState, null, 2)}
            </pre>
          </details>
        </Card>
      )}
    </div>
  );
};

export default TreatmentSyncDemo;
