import React, { useState, useEffect, useContext } from "react";
import {
  Card,
  Table,
  Button,
  Typography,
  Tag,
  Row,
  Col,
  Calendar,
  Badge,
  message,
  Space,
  Modal,
  Form,
  Select,
  Input,
  Spin,
  Empty,
  Tooltip,
} from "antd";
import {
  EditOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  BulbOutlined,
  ThunderboltOutlined,
  TableOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { UserContext } from "../../../context/UserContext";
import apiTreatmentManagement from "../../../api/apiTreatmentManagement";

const { Title, Text } = Typography;
const { Option } = Select;

const PatientScheduleView = ({
  patientId,
  patientInfo,
  schedule,
  treatmentFlow,
  scheduleSubSteps,
  isPatientView = false,
}) => {
  const { user } = useContext(UserContext);
  const [viewMode, setViewMode] = useState("table");
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState([]);
  const [statusModal, setStatusModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusForm] = Form.useForm();
  const [treatmentPlanStatus, setTreatmentPlanStatus] = useState(null);

  // Kiểm tra xem có patientId hợp lệ không
  if (!patientId) {
    return (
      <div style={{ padding: '20px' }}>
        <Card className="examination-main-card">
          <div className="examination-header">
            <Title level={2} className="examination-title">
              <Space>
                <CalendarOutlined className="title-icon" />
                Lịch điều trị
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
              📅
            </div>
            <Title level={3} style={{ color: '#666', marginBottom: '16px' }}>
              Không có lịch điều trị
            </Title>
            <Text style={{ fontSize: '16px', color: '#888', display: 'block', marginBottom: '24px' }}>
              Vui lòng chọn bệnh nhân để xem lịch điều trị
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

  // 🆕 Load treatment schedules từ API
  useEffect(() => {
    if (patientId) {
      loadTreatmentSchedules();
    }
  }, [patientId]);

  const loadTreatmentSchedules = async () => {
    try {
      setLoading(true);
      console.log("🔄 [PatientScheduleView] Loading treatment schedules for patient:", patientId);
      
      const response = await apiTreatmentManagement.getTreatmentScheduleByPatient(patientId);
      
      if (response.success) {
        setSchedules(response.data || []);
        console.log("✅ [PatientScheduleView] Loaded schedules:", response.data);
        
        // 🆕 Lấy treatment plan status nếu có schedules
        if (response.data && response.data.length > 0) {
          try {
            const planResponse = await apiTreatmentManagement.getActiveTreatmentPlan(patientId);
            if (planResponse.success && planResponse.data) {
              setTreatmentPlanStatus(planResponse.data.status);
              console.log("✅ [PatientScheduleView] Treatment plan status:", planResponse.data.status);
              
              // Nếu là plan mới nhất (không phải active), hiển thị thông báo
              if (planResponse.isLatest) {
                console.log("ℹ️ [PatientScheduleView] Using latest treatment plan (not active)");
              }
            } else if (planResponse.notFound) {
              // Không có treatment plan nào - có thể bệnh nhân mới
              console.log("ℹ️ [PatientScheduleView] No treatment plan found at all");
              setTreatmentPlanStatus("none");
            }
          } catch (planError) {
            console.warn("⚠️ [PatientScheduleView] Could not get treatment plan status:", planError);
            // Mặc định là active nếu có lỗi
            setTreatmentPlanStatus("active");
          }
        }
      } else {
        console.warn("⚠️ [PatientScheduleView] Failed to load schedules:", response.message);
        setSchedules([]);
      }
    } catch (error) {
      console.error("❌ [PatientScheduleView] Error loading schedules:", error);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  // 🆕 Convert API data to table format
  const scheduleData = schedules.map((schedule, index) => ({
    key: schedule.scheduleId || index.toString(),
    scheduleId: schedule.scheduleId,
    date: schedule.scheduledDate,
    time: dayjs(schedule.scheduledDate).format("HH:mm"),
    treatment: schedule.stepName || schedule.treatmentType || "Điều trị",
    status: schedule.status || "scheduled",
    doctorId: schedule.doctorId,
    doctor: schedule.doctorName || schedule.doctor?.fullName || schedule.doctor?.name || (schedule.doctorId ? `BS. ${schedule.doctorId.substring(0, 8)}...` : "Chưa phân công"),
    room: schedule.roomId || "Phòng điều trị",
    notes: schedule.notes,
    completedAt: schedule.completedAt,
  }));

  // 🆕 Status mapping với icons
  const getStatusInfo = (status) => {
    const statusMap = {
      scheduled: { 
        color: "blue", 
        text: "Đã lên lịch", 
        icon: <ClockCircleOutlined /> 
      },
      completed: { 
        color: "green", 
        text: "Hoàn thành", 
        icon: <CheckCircleOutlined /> 
      },
      pending: { 
        color: "orange", 
        text: "Chờ xử lý", 
        icon: <ExclamationCircleOutlined /> 
      },
      cancelled: { 
        color: "red", 
        text: "Đã hủy", 
        icon: <CloseCircleOutlined /> 
      },
      "no-show": { 
        color: "red", 
        text: "Không đến", 
        icon: <CloseCircleOutlined /> 
      },
    };
    return statusMap[status] || { color: "default", text: status, icon: <ClockCircleOutlined /> };
  };

  // 🆕 Available status options for doctor
  const getAvailableStatusOptions = (schedule) => {
    const currentStatus = schedule.status;
    const options = [
      { value: "scheduled", label: "Đã lên lịch" },
      { value: "completed", label: "Hoàn thành" },
      { value: "cancelled", label: "Đã hủy" },
      { value: "no-show", label: "Không đến" },
    ];
    
    return options.map(option => ({
      ...option,
      disabled: option.value === currentStatus
    }));
  };

  const handleUpdateStatus = (schedule) => {
    setEditingSchedule(schedule);
    statusForm.setFieldsValue({
      status: schedule.status,
      notes: schedule.notes || "",
    });
    setStatusModal(true);
  };

  const handleSaveStatus = async (values) => {
    if (!editingSchedule) return;
    
    try {
      setUpdatingStatus(true);
      console.log("🔄 [PatientScheduleView] Updating schedule status:", values);
      
      const statusData = {
        status: values.status,
        notes: values.notes,
        completedAt: values.status === "completed" ? new Date().toISOString() : null,
      };
      
      const response = await apiTreatmentManagement.updateScheduleStatus(
        editingSchedule.scheduleId, 
        statusData
      );
      
      if (response.success) {
        message.success("Cập nhật trạng thái thành công!");
        setStatusModal(false);
        loadTreatmentSchedules(); // Reload data
      } else {
        message.error(response.message || "Cập nhật thất bại!");
      }
    } catch (error) {
      console.error("❌ [PatientScheduleView] Error updating status:", error);
      message.error("Có lỗi xảy ra khi cập nhật trạng thái!");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // 🆕 Xử lý hoàn thành treatment plan
  const handleCompleteTreatmentPlan = async () => {
    try {
      // Tìm treatment plan ID từ schedules với nhiều cách khác nhau
      let treatmentPlanId = null;
      
      if (schedules.length > 0) {
        const firstSchedule = schedules[0];
        treatmentPlanId = firstSchedule.treatmentPlanId || 
                         firstSchedule.planId || 
                         firstSchedule.treatmentPlan?.planId ||
                         firstSchedule.treatmentPlan?.id;
        
        console.log("🔍 [PatientScheduleView] Schedule data:", firstSchedule);
        console.log("🔍 [PatientScheduleView] Found treatmentPlanId:", treatmentPlanId);
      }
      
      if (!treatmentPlanId) {
        console.warn("⚠️ [PatientScheduleView] No treatmentPlanId found in schedules:", schedules);
        
        // Thử lấy từ API khác
        try {
          console.log("🔄 [PatientScheduleView] Trying to get treatment plan from API...");
          const planResponse = await apiTreatmentManagement.getActiveTreatmentPlan(patientId);
          
          if (planResponse.success && planResponse.data) {
            treatmentPlanId = planResponse.data.planId || planResponse.data.id;
            console.log("✅ [PatientScheduleView] Found treatmentPlanId from API:", treatmentPlanId);
          } else {
            console.warn("⚠️ [PatientScheduleView] No active treatment plan found");
            message.error("Không tìm thấy kế hoạch điều trị đang hoạt động cho bệnh nhân này!");
            return;
          }
        } catch (apiError) {
          console.error("❌ [PatientScheduleView] Error getting treatment plan:", apiError);
          message.error("Không thể lấy thông tin kế hoạch điều trị! Vui lòng thử lại.");
          return;
        }
      }

      // 🆕 Kiểm tra tất cả phases đã hoàn thành chưa
      try {
        console.log("🔍 [PatientScheduleView] Checking if all phases are completed...");
        const phasesResponse = await apiTreatmentManagement.getTreatmentPlanPhases(treatmentPlanId);
        
        if (phasesResponse.success && phasesResponse.data) {
          const phases = phasesResponse.data;
          const totalPhases = phases.length;
          const completedPhases = phases.filter(phase => phase.status === "Completed").length;
          const pendingPhases = phases.filter(phase => phase.status === "Pending").length;
          const inProgressPhases = phases.filter(phase => phase.status === "In Progress").length;
          
          console.log("📊 [PatientScheduleView] Phase status:", {
            total: totalPhases,
            completed: completedPhases,
            pending: pendingPhases,
            inProgress: inProgressPhases
          }); 
          
          if (pendingPhases > 0 || inProgressPhases > 0) {
            const uncompletedPhases = phases.filter(phase => 
              phase.status === "Pending" || phase.status === "In Progress"
            );
            
            const uncompletedNames = uncompletedPhases.map(phase => 
              phase.phaseName || `Phase ${phase.phaseOrder}`
            ).join(", ");
            
            message.error(`Không thể hoàn thành kế hoạch điều trị! Còn ${pendingPhases + inProgressPhases} giai đoạn chưa hoàn thành: ${uncompletedNames}`);
            return;
          }
          
          console.log("✅ [PatientScheduleView] All phases are completed, proceeding with plan completion");
        } else {
          console.warn("⚠️ [PatientScheduleView] Could not get phases data, proceeding without validation");
        }
      } catch (phasesError) {
        console.warn("⚠️ [PatientScheduleView] Error checking phases, proceeding without validation:", phasesError);
      }

      const notes = "Hoàn thành quy trình điều trị bởi bác sĩ";
      
      console.log("🔄 [PatientScheduleView] Completing treatment plan:", treatmentPlanId);
      
      const response = await apiTreatmentManagement.completeTreatmentPlan(treatmentPlanId, notes);
      
      if (response.success) {
        message.success("Hoàn thành quy trình điều trị thành công!");
        loadTreatmentSchedules(); // Reload data
      } else {
        message.error(response.message || "Hoàn thành quy trình điều trị thất bại!");
      }
    } catch (error) {
      console.error("❌ [PatientScheduleView] Error completing treatment plan:", error);
      message.error("Có lỗi xảy ra khi hoàn thành quy trình điều trị!");
    }
  };

  // 🆕 Xử lý hủy treatment plan
  const handleCancelTreatmentPlan = async () => {
    try {
      // Tìm treatment plan ID từ schedules với nhiều cách khác nhau
      let treatmentPlanId = null;
      
      if (schedules.length > 0) {
        const firstSchedule = schedules[0];
        treatmentPlanId = firstSchedule.treatmentPlanId || 
                         firstSchedule.planId || 
                         firstSchedule.treatmentPlan?.planId ||
                         firstSchedule.treatmentPlan?.id;
        
        console.log("🔍 [PatientScheduleView] Schedule data:", firstSchedule);
        console.log("🔍 [PatientScheduleView] Found treatmentPlanId:", treatmentPlanId);
      }
      
      if (!treatmentPlanId) {
        console.warn("⚠️ [PatientScheduleView] No treatmentPlanId found in schedules:", schedules);
        
        // Thử lấy từ API khác
        try {
          console.log("🔄 [PatientScheduleView] Trying to get treatment plan from API...");
          const planResponse = await apiTreatmentManagement.getActiveTreatmentPlan(patientId);
          
          if (planResponse.success && planResponse.data) {
            treatmentPlanId = planResponse.data.planId || planResponse.data.id;
            console.log("✅ [PatientScheduleView] Found treatmentPlanId from API:", treatmentPlanId);
          } else {
            console.warn("⚠️ [PatientScheduleView] No active treatment plan found");
            message.error("Không tìm thấy kế hoạch điều trị đang hoạt động cho bệnh nhân này!");
            return;
          }
        } catch (apiError) {
          console.error("❌ [PatientScheduleView] Error getting treatment plan:", apiError);
          message.error("Không thể lấy thông tin kế hoạch điều trị! Vui lòng thử lại.");
          return;
        }
      }

      const reason = "Hủy bởi bác sĩ điều trị";
      
      console.log("🔄 [PatientScheduleView] Cancelling treatment plan:", treatmentPlanId);
      
      const response = await apiTreatmentManagement.cancelTreatmentPlan(treatmentPlanId, reason);
      
      if (response.success) {
        message.success("Hủy kế hoạch điều trị thành công!");
        loadTreatmentSchedules(); // Reload data
      } else {
        message.error(response.message || "Hủy kế hoạch điều trị thất bại!");
      }
    } catch (error) {
      console.error("❌ [PatientScheduleView] Error cancelling treatment plan:", error);
      message.error("Có lỗi xảy ra khi hủy kế hoạch điều trị!");
    }
  };

  const columns = [
    {
      title: "Ngày",
      dataIndex: "date",
      key: "date",
      width: 120,
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Giờ",
      dataIndex: "time",
      key: "time",
      width: 80,
    },
    {
      title: "Điều trị",
      dataIndex: "treatment",
      key: "treatment",
      width: 150,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status, record) => {
        const statusInfo = getStatusInfo(status);
        return (
          <Space>
            <Tag color={statusInfo.color} icon={statusInfo.icon}>
              {statusInfo.text}
            </Tag>
            {user?.role === "DOCTOR" && (
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleUpdateStatus(record)}
                style={{ padding: 0 }}
              />
            )}
          </Space>
        );
      },
    },

    {
      title: "Phòng",
      dataIndex: "room",
      key: "room",
      width: 100,
    },
    {
      title: "Ghi chú",
      dataIndex: "notes",
      key: "notes",
      width: 200,
      render: (notes) => {
        if (!notes) return "-";
        
        // Nếu ghi chú dài hơn 50 ký tự, hiển thị tooltip
        if (notes.length > 50) {
          return (
            <Tooltip title={notes} placement="topLeft">
              <Text style={{ cursor: 'pointer' }}>
                {notes.substring(0, 50)}...
              </Text>
            </Tooltip>
          );
        }
        
        return <Text>{notes}</Text>;
      },
    },
  ];

  const getCalendarData = (value) => {
    const dateStr = value.format("YYYY-MM-DD");
    const appointment = scheduleData.find((item) => 
      dayjs(item.date).format("YYYY-MM-DD") === dateStr
    );

    if (appointment) {
      return [
        {
          type:
            appointment.status === "completed"
              ? "success"
              : appointment.status === "cancelled" || appointment.status === "no-show"
              ? "error"
              : "processing",
          content: `${appointment.time} - ${appointment.treatment}`,
        },
      ];
    }
    return [];
  };

  const calendarCellRender = (value) => {
    const listData = getCalendarData(value);
    return (
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {listData.map((item, index) => (
          <li key={index}>
            <Badge
              status={item.type}
              text={item.content}
              style={{ fontSize: "10px" }}
            />
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div style={{ padding: "24px", background: "#fafafa", minHeight: "100vh" }}>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
              <Col>
                <Title level={3} style={{ margin: 0, color: "#333" }}>
                  Theo Dõi Bệnh Nhân
                </Title>
                <div style={{ marginTop: 8 }}>
                  <Text strong style={{ fontSize: "16px", color: "#666" }}>Bệnh nhân: </Text>
                  <Text style={{ fontSize: "16px", color: "#333" }}>
                    {patientInfo?.name || "Không có thông tin"}
                  </Text>
                </div>
              </Col>
              <Col>
                <Space.Compact>
                  <Button
                    type={viewMode === "table" ? "primary" : "default"}
                    onClick={() => setViewMode("table")}
                    icon={<TableOutlined />}
                    size="middle"
                    style={viewMode === "table" ? {
                      background: "#ff6b9d",
                      borderColor: "#ff6b9d",
                      color: "white"
                    } : {
                      borderColor: "#ff6b9d",
                      color: "#ff6b9d"
                    }}
                  >
                    Dạng bảng
                  </Button>
                  <Button
                    type={viewMode === "calendar" ? "primary" : "default"}
                    onClick={() => setViewMode("calendar")}
                    icon={<CalendarOutlined />}
                    size="middle"
                    style={viewMode === "calendar" ? {
                      background: "#ff6b9d",
                      borderColor: "#ff6b9d",
                      color: "white"
                    } : {
                      borderColor: "#ff6b9d",
                      color: "#ff6b9d"
                    }}
                  >
                    Lịch
                  </Button>
                </Space.Compact>
              </Col>
            </Row>

      {loading ? (
        <div style={{ 
          textAlign: "center", 
          padding: "80px 20px",
          background: "linear-gradient(135deg, #fff0f5 0%, #ffe6f0 100%)",
          borderRadius: "12px",
          margin: "20px 0",
          border: "1px solid #ffb3d1"
        }}>
          <Spin size="large" style={{ color: "#ff6b9d" }} />
          <div style={{ 
            marginTop: 16, 
            fontSize: "16px",
            color: "#666",
            fontWeight: "500"
          }}>
            Đang tải lịch hẹn...
          </div>
        </div>
      ) : schedules.length === 0 ? (
        <div style={{ 
          textAlign: "center", 
          padding: "60px 20px",
          background: "linear-gradient(135deg, #fff0f5 0%, #ffe6f0 100%)",
          borderRadius: "12px",
          margin: "20px 0",
          border: "1px solid #ffb3d1"
        }}>
          <Empty
            description="Không có lịch hẹn nào"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ color: "#ff6b9d" }}
          />
        </div>
      ) : viewMode === "table" ? (
        <>
          <Table
            columns={columns}
            dataSource={scheduleData}
            pagination={false}
            size="middle"
            scroll={{ x: 800 }}
            style={{ 
              borderRadius: "8px",
              overflow: "hidden",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
            }}
            rowClassName={(record, index) => 
              index % 2 === 0 ? "table-row-light" : "table-row-dark"
            }
          />
          <div style={{ 
            marginTop: 24, 
            textAlign: "center",
            padding: "16px",
            background: "linear-gradient(135deg, #fff0f5 0%, #ffe6f0 100%)",
            borderRadius: "8px",
            border: "1px solid #ffb3d1"
          }}>
            <Text style={{ 
              color: "#ff6b9d", 
              fontSize: "14px",
              fontWeight: "500"
            }}>
              <BulbOutlined style={{ marginRight: 8 }} /> 
              Tip: Chuyển đổi giữa dạng bảng và lịch để xem thông tin theo cách khác nhau
            </Text>
          </div>
        </>
      ) : (
        <Calendar
          cellRender={calendarCellRender}
          style={{ backgroundColor: "white" }}
        />
      )}

      {/* Modal cập nhật trạng thái */}
      <Modal
        title="Cập nhật trạng thái lịch hẹn"
        open={statusModal}
        onCancel={() => setStatusModal(false)}
        footer={null}
        confirmLoading={updatingStatus}
      >
        <Form
          form={statusForm}
          layout="vertical"
          onFinish={handleSaveStatus}
        >
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
          >
            <Select placeholder="Chọn trạng thái">
              {editingSchedule && getAvailableStatusOptions(editingSchedule).map(option => (
                <Option key={option.value} value={option.value} disabled={option.disabled}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="notes"
            label="Ghi chú"
          >
            <Input.TextArea
              rows={3}
              placeholder="Nhập ghi chú (tùy chọn)"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={() => setStatusModal(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={updatingStatus}>
                Cập nhật
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

          </Card>
        </Col>
      </Row>

      {/* Buttons hoàn thành và hủy treatment plan */}
      {user?.role === "DOCTOR" && schedules.length > 0 && (
        <Row justify="end" style={{ marginTop: 16 }}>
          <Col>
            <Space>
              {/* Debug info */}
              <div style={{ 
                fontSize: "12px", 
                color: "#666", 
                marginRight: "16px",
                padding: "4px 8px",
                background: "#f0f0f0",
                borderRadius: "4px"
              }}>
                Status: {treatmentPlanStatus || "loading..."}
                {treatmentPlanStatus === "completed" && " ✅"}
                {treatmentPlanStatus === "cancelled" && " ❌"}
                {treatmentPlanStatus === "active" && " 🔄"}
                {treatmentPlanStatus === "none" && " ⚠️"}
              </div>
              <Button
                danger
                icon={<CloseCircleOutlined />}
                size="large"
                onClick={() => handleCancelTreatmentPlan()}
                disabled={treatmentPlanStatus === "completed" || treatmentPlanStatus === "cancelled" || treatmentPlanStatus === "none"}
                style={{ 
                  borderColor: "#ff4d4f",
                  color: "#ff4d4f"
                }}
                title={treatmentPlanStatus === "completed" ? 
                  "Không thể hủy kế hoạch đã hoàn thành" : 
                  treatmentPlanStatus === "cancelled" ?
                  "Kế hoạch đã bị hủy" : 
                  treatmentPlanStatus === "none" ?
                  "Không có kế hoạch điều trị" : "Hủy kế hoạch điều trị"}
              >
                Hủy kế hoạch điều trị
              </Button>
              <Button
                type="primary"
                icon={<ThunderboltOutlined />}
                size="large"
                onClick={() => handleCompleteTreatmentPlan()}
                disabled={treatmentPlanStatus === "cancelled" || treatmentPlanStatus === "completed" || treatmentPlanStatus === "none"}
                style={{ 
                  background: "#ff6b9d",
                  borderColor: "#ff6b9d",
                  boxShadow: "0 4px 12px rgba(255, 107, 157, 0.3)"
                }}
                title={treatmentPlanStatus === "cancelled" ? 
                  "Không thể hoàn thành kế hoạch đã hủy" : 
                  treatmentPlanStatus === "completed" ?
                  "Kế hoạch đã hoàn thành" : 
                  treatmentPlanStatus === "none" ?
                  "Không có kế hoạch điều trị" : "Hoàn thành quy trình điều trị"}
              >
                Hoàn thành quy trình điều trị
              </Button>
            </Space>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default PatientScheduleView;
