import React, { useState, useContext, useEffect } from "react";
import {
  Layout,
  Menu,
  Card,
  Button,
  Typography,
  Space,
  Row,
  Col,
  Tabs,
  Tag,
  Alert,
  Avatar,
  Statistic,
  Badge,
  Divider,
  List,
  Progress,
  Dropdown,
  Steps,
  message,
  Modal,
  Timeline,
} from "antd";
import "./DoctorTheme.css";
import {
  UserOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  FileTextOutlined,
  TeamOutlined,
  SettingOutlined,
  DashboardOutlined,
  BellOutlined,
  LogoutOutlined,
  PlusOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  EditOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  HistoryOutlined,
  StarOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

import TreatmentProcess from "./treatment/TreatmentProcess";
import ExaminationForm from "./treatment/ExaminationForm";
import TreatmentPlanEditor from "./treatment/TreatmentPlanEditor";
import TreatmentScheduleForm from "./treatment/TreatmentScheduleForm";
// Xóa import TreatmentPlansList

import PatientScheduleView from "./treatment/PatientScheduleView";
import DoctorProfile from "./DoctorProfile";
import ThemeDemo from "./ThemeDemo";
import { UserContext } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";

// Import API services for real data
import apiDoctor from "../../api/apiDoctor";
import apiTreatmentManagement from "../../api/apiTreatmentManagement";
import UserProfile from "../pages/Profile/UserProfile";
import { getScheduleSubSteps } from "./constants/treatmentSubSteps";

const { Header, Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const DoctorDashboard = () => {
  const [selectedSection, setSelectedSection] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const { user, logout } = useContext(UserContext);

  // API data states
  const [dashboardData, setDashboardData] = useState({
    patients: [],
    todayAppointments: [],
    statistics: {
      totalPatients: 0,
      todayAppointments: 0,
      inTreatment: 0,
      completed: 0,
      successRate: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState(null);

  // Enhanced treatment flow state with persistence
  const [treatmentFlow, setTreatmentFlow] = useState({
    step: 0, // 0: examination, 1: treatment-plan, 2: schedule, 3: patient-view
    examinationData: null,
    treatmentPlan: null,
    schedule: null,
    currentPatient: null,
    completedSteps: [], // Track which steps are completed
    stepHistory: [], // Track step completion history
    isEditing: false,
    lastSaved: null,
  });

  // Treatment schedule sub-steps based on service
  const [scheduleSubSteps, setScheduleSubSteps] = useState({
    currentSubStep: 0,
    subSteps: [],
    completedSubSteps: [],
  });

  const navigate = useNavigate();

  // Load dashboard data from API
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Sync examination data from TreatmentProcess when selectedPatient changes
  useEffect(() => {
    if (selectedPatient?.id) {
      const completedKey = `examination_completed_${selectedPatient.id}`;
      const savedCompleted = localStorage.getItem(completedKey);
      if (savedCompleted) {
        try {
          const completedData = JSON.parse(savedCompleted);
          console.log(
            "🔍 [DoctorDashboard] Auto-syncing examination data:",
            completedData
          );
          setTreatmentFlow((prev) => ({
            ...prev,
            examinationData: completedData,
            currentPatient: selectedPatient,
          }));
          console.log("✅ [DoctorDashboard] Auto-synced examination data");
        } catch (error) {
          console.error(
            "❌ [DoctorDashboard] Error auto-syncing examination data:",
            error
          );
        }
      }
    }
  }, [selectedPatient]);

  // Load saved treatment flow from localStorage
  useEffect(() => {
    const savedFlow = localStorage.getItem("treatmentFlow");
    if (savedFlow) {
      try {
        const parsedFlow = JSON.parse(savedFlow);
        setTreatmentFlow((prev) => ({ ...prev, ...parsedFlow }));
      } catch (error) {
        console.error("Error loading saved treatment flow:", error);
      }
    }
  }, []);

  useEffect(() => {
    // Trigger window resize khi collapsed thay đổi để các Col/Card tự reflow
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 350); // delay cho animation Sider
  }, [collapsed]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setDataError(null);

      console.log("🔄 [DoctorDashboard] Loading dashboard data...");

      // Load all dashboard data in parallel
      const [patientsResponse, todayAppointments, statistics] =
        await Promise.all([
          apiDoctor.getMyPatients(),
          apiDoctor.getTodayAppointments(),
          apiDoctor.getDashboardStats(),
        ]);

      // Extract patients array from response
      const patients = patientsResponse?.patients || patientsResponse || [];

      // Transform patient data to match UI expectations
      const transformedPatients = patients.map((patient) =>
        apiDoctor.transformPatientData(patient)
      );

      setDashboardData({
        patients: transformedPatients,
        todayAppointments,
        statistics,
      });

      console.log("✅ [DoctorDashboard] Dashboard data loaded:", {
        patients: transformedPatients.length,
        appointments: todayAppointments.length,
        stats: statistics,
      });
    } catch (error) {
      console.error(
        "❌ [DoctorDashboard] Error loading dashboard data:",
        error
      );
      setDataError("Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Refresh dashboard data
  const refreshDashboardData = () => {
    console.log("🔄 [DoctorDashboard] Refreshing dashboard data...");
    loadDashboardData();
  };

  // Save treatment flow to localStorage whenever it changes
  useEffect(() => {
    if (treatmentFlow.currentPatient) {
      localStorage.setItem("treatmentFlow", JSON.stringify(treatmentFlow));
    }
  }, [treatmentFlow]);

  const handleLogout = () => {
    localStorage.removeItem("treatmentFlow");
    logout();
    navigate("/mock-login");
  };

  // Enhanced treatment flow handlers with step tracking
  const handleExaminationComplete = (examinationData) => {
    // console.log("✅ Khám lâm sàng hoàn thành:", examinationData);

    const timestamp = new Date().toISOString();
    const stepHistory = {
      step: 0,
      title: "Khám lâm sàng",
      completedAt: timestamp,
      data: examinationData,
    };

    setTreatmentFlow((prev) => ({
      ...prev,
      step: 1,
      examinationData,
      completedSteps: [...prev.completedSteps, 0],
      stepHistory: [...prev.stepHistory, stepHistory],
      lastSaved: timestamp,
      currentPatient: selectedPatient,
    }));

    setSelectedSection("treatment-plan");
    // message.success("✅ Đã lưu kết quả khám - Chuyển sang lập phác đồ");
  };

  const handleTreatmentPlanComplete = (treatmentPlan) => {
    // console.log("✅ Phác đồ điều trị hoàn thành:", treatmentPlan);

    const timestamp = new Date().toISOString();
    const stepHistory = {
      step: 1,
      title: "Lập phác đồ",
      completedAt: timestamp,
      data: treatmentPlan,
    };

    // Đảm bảo luôn có finalPlan hoặc template với phases
    let completePlan = { ...treatmentPlan };
    // Nếu có finalPlan hoặc template với phases thì giữ nguyên
    if (
      (treatmentPlan.finalPlan &&
        treatmentPlan.finalPlan.phases &&
        treatmentPlan.finalPlan.phases.length > 0) ||
      (treatmentPlan.template &&
        treatmentPlan.template.phases &&
        treatmentPlan.template.phases.length > 0)
    ) {
      // OK
    } else if (treatmentPlan.phases && treatmentPlan.phases.length > 0) {
      // Nếu chỉ có phases, wrap lại thành finalPlan
      completePlan.finalPlan = { phases: treatmentPlan.phases };
    } else if (
      treatmentPlan.treatmentSteps &&
      treatmentPlan.treatmentSteps.length > 0
    ) {
      // Nếu có treatmentSteps, convert sang phases
      completePlan.finalPlan = { phases: treatmentPlan.treatmentSteps };
    }
    // Nếu có template nhưng thiếu phases, thử wrap lại
    if (!completePlan.template && completePlan.finalPlan) {
      completePlan.template = completePlan.finalPlan;
    }
    // Debug log
    console.log(
      "🟢 [DoctorDashboard] treatmentPlan truyền vào ScheduleForm:",
      completePlan
    );

    // Set up schedule sub-steps based on service package
    const patient = treatmentFlow.currentPatient || selectedPatient;
    const subSteps = getScheduleSubSteps(patient?.servicePackage);

    setScheduleSubSteps({
      currentSubStep: 0,
      subSteps,
      completedSubSteps: [],
    });

    setTreatmentFlow((prev) => ({
      ...prev,
      step: 2,
      treatmentPlan: completePlan,
      completedSteps: [...prev.completedSteps, 1],
      stepHistory: [...prev.stepHistory, stepHistory],
      lastSaved: timestamp,
    }));

    setSelectedSection("schedule");
    // message.success("✅ Đã lưu phác đồ - Chuyển sang lập lịch điều trị");
  };

  const handleScheduleComplete = (schedule) => {
    // console.log("✅ Lịch điều trị hoàn thành:", schedule);

    const timestamp = new Date().toISOString();
    const stepHistory = {
      step: 2,
      title: "Lập lịch điều trị",
      completedAt: timestamp,
      data: schedule,
      subSteps: scheduleSubSteps,
    };

    setTreatmentFlow((prev) => ({
      ...prev,
      step: 3,
      schedule,
      completedSteps: [...prev.completedSteps, 2],
      stepHistory: [...prev.stepHistory, stepHistory],
      lastSaved: timestamp,
    }));

    setSelectedSection("patient-view");
    // message.success(
    //   "✅ Đã lập lịch hoàn thành - Chuyển sang theo dõi bệnh nhân"
    // );
  };

  const handleSubStepComplete = (subStepIndex, subStepData) => {
    // console.log(`✅ Hoàn thành giai đoạn phụ ${subStepIndex}:`, subStepData);

    setScheduleSubSteps((prev) => ({
      ...prev,
      completedSubSteps: [...prev.completedSubSteps, subStepIndex],
      currentSubStep: Math.min(subStepIndex + 1, prev.subSteps.length - 1),
    }));

    // message.success(
    //   `✅ Hoàn thành: ${scheduleSubSteps.subSteps[subStepIndex]?.title}`
    // );
  };

  const handleStartNewTreatment = (patient) => {
    Modal.confirm({
      title: "Bắt đầu quy trình điều trị mới",
      content: `Bạn có muốn bắt đầu quy trình điều trị cho bệnh nhân ${patient.name}?`,
      okText: "Bắt đầu",
      cancelText: "Hủy",
      onOk: () => {
        setSelectedPatient(patient);
        setTreatmentFlow({
          step: 0,
          examinationData: null,
          treatmentPlan: null,
          schedule: null,
          currentPatient: patient,
          completedSteps: [],
          stepHistory: [],
          isEditing: false,
          lastSaved: null,
        });
        setScheduleSubSteps({
          currentSubStep: 0,
          subSteps: [],
          completedSubSteps: [],
        });
        setSelectedSection("examination");
        // message.info(`🏥 Bắt đầu quy trình điều trị cho ${patient.name}`);
      },
    });
  };

  const handleEditStep = (stepIndex) => {
    const stepSections = ["examination", "treatment-plan", "schedule"];
    setTreatmentFlow((prev) => ({ ...prev, isEditing: true }));
    setSelectedSection(stepSections[stepIndex]);
    // message.info(`✏️ Chỉnh sửa bước: ${stepIndex + 1}`);
  };

  const handleJumpToStep = (stepIndex) => {
    if (
      treatmentFlow.completedSteps.includes(stepIndex) ||
      stepIndex <= Math.max(...treatmentFlow.completedSteps, -1) + 1
    ) {
      const stepSections = [
        "examination",
        "treatment-plan",
        "schedule",
        "patient-view",
      ];
      setSelectedSection(stepSections[stepIndex]);
    }
  };

  // Handler để chuyển đến trang điều trị của bệnh nhân
  const handleViewTreatment = (patient) => {
    console.log(
      "🏥 [DoctorDashboard] Chuyển đến trang điều trị cho bệnh nhân:",
      patient
    );
    setSelectedPatient(patient);

    // Sync examination data từ TreatmentProcess nếu có
    const completedKey = `examination_completed_${patient.id}`;
    const savedCompleted = localStorage.getItem(completedKey);
    if (savedCompleted) {
      try {
        const completedData = JSON.parse(savedCompleted);
        console.log(
          "🔍 [DoctorDashboard] Found examination data in localStorage:",
          completedData
        );
        setTreatmentFlow((prev) => ({
          ...prev,
          examinationData: completedData,
          currentPatient: patient,
        }));
        console.log(
          "✅ [DoctorDashboard] Synced examination data from TreatmentProcess"
        );
      } catch (error) {
        console.error(
          "❌ [DoctorDashboard] Error parsing localStorage data:",
          error
        );
      }
    }

    setSelectedSection("full-process");
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        Thông tin cá nhân
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />}>
        Cài đặt
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Đăng xuất
      </Menu.Item>
    </Menu>
  );

  // Enhanced treatment sections with step tracking
  const treatmentSections = {
    dashboard: {
      title: "Tổng quan",
      component: (
        <div>
          {/* Loading State */}
          {loading && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div
                className="loading-spinner"
                style={{
                  width: "40px",
                  height: "40px",
                  border: "4px solid #f3f3f3",
                  borderTop: "4px solid var(--primary-color)",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  margin: "0 auto 16px",
                }}
              ></div>
              <Text type="secondary">Đang tải dữ liệu dashboard...</Text>
            </div>
          )}

          {/* Error State */}
          {dataError && (
            <Alert
              message="Thông báo"
              description={dataError}
              type="warning"
              showIcon
              style={{ marginBottom: "24px" }}
              action={
                <Button size="small" onClick={loadDashboardData}>
                  Thử lại
                </Button>
              }
            />
          )}

          <Row gutter={[24, 24]}>
            {/* Dashboard Header with Refresh Button */}
            <Col span={24}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "24px",
                }}
              >
                <Title
                  level={3}
                  style={{ margin: 0, color: "var(--text-dark)" }}
                >
                  📊 Dashboard Tổng Quan
                </Title>
                <Button
                  type="primary"
                  icon={<ReloadOutlined />}
                  onClick={refreshDashboardData}
                  loading={loading}
                  className="doctor-btn-primary"
                >
                  Làm mới
                </Button>
              </div>
            </Col>

            {/* Statistics Cards */}
            <Col span={24}>
              <Row gutter={[20, 20]}>
                <Col xs={24} sm={12} md={6} lg={6}>
                  <Card className="doctor-stat-card doctor-fade-in doctor-bounce-in">
                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          background: "var(--primary-gradient)",
                          width: "60px",
                          height: "60px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto 16px",
                          boxShadow: "0 8px 20px var(--shadow-light)",
                        }}
                      >
                        <TeamOutlined
                          style={{ fontSize: "24px", color: "white" }}
                        />
                      </div>
                      <Statistic
                        title={
                          <Text
                            style={{
                              color: "var(--text-secondary)",
                              fontWeight: 500,
                              fontSize: "14px",
                            }}
                          >
                            Tổng bệnh nhân
                          </Text>
                        }
                        value={dashboardData.statistics.totalPatients}
                        valueStyle={{
                          color: "var(--primary-color)",
                          fontWeight: 700,
                          fontSize: "28px",
                        }}
                      />
                    </div>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6} lg={6}>
                  <Card
                    className="doctor-stat-card doctor-fade-in doctor-bounce-in"
                    style={{ animationDelay: "0.1s" }}
                  >
                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          background: "var(--secondary-gradient)",
                          width: "60px",
                          height: "60px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto 16px",
                          boxShadow: "0 8px 20px rgba(102, 126, 234, 0.3)",
                        }}
                      >
                        <CalendarOutlined
                          style={{ fontSize: "24px", color: "white" }}
                        />
                      </div>
                      <Statistic
                        title={
                          <Text
                            style={{
                              color: "var(--text-secondary)",
                              fontWeight: 500,
                              fontSize: "14px",
                            }}
                          >
                            Lịch hẹn hôm nay
                          </Text>
                        }
                        value={dashboardData.statistics.todayAppointments}
                        valueStyle={{
                          color: "var(--secondary-color)",
                          fontWeight: 700,
                          fontSize: "28px",
                        }}
                      />
                    </div>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6} lg={6}>
                  <Card
                    className="doctor-stat-card doctor-fade-in doctor-bounce-in"
                    style={{ animationDelay: "0.2s" }}
                  >
                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          background: "var(--success-gradient)",
                          width: "60px",
                          height: "60px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto 16px",
                          boxShadow: "0 8px 20px rgba(79, 172, 254, 0.3)",
                        }}
                      >
                        <MedicineBoxOutlined
                          style={{ fontSize: "24px", color: "white" }}
                        />
                      </div>
                      <Statistic
                        title={
                          <Text
                            style={{
                              color: "var(--text-secondary)",
                              fontWeight: 500,
                              fontSize: "14px",
                            }}
                          >
                            Đang điều trị
                          </Text>
                        }
                        value={dashboardData.statistics.inTreatment}
                        valueStyle={{
                          color: "#4facfe",
                          fontWeight: 700,
                          fontSize: "28px",
                        }}
                      />
                    </div>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6} lg={6}>
                  <Card
                    className="doctor-stat-card doctor-fade-in doctor-bounce-in"
                    style={{ animationDelay: "0.3s" }}
                  >
                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          background: "var(--warning-gradient)",
                          width: "60px",
                          height: "60px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto 16px",
                          boxShadow: "0 8px 20px rgba(250, 112, 154, 0.3)",
                        }}
                      >
                        <CheckCircleOutlined
                          style={{ fontSize: "24px", color: "white" }}
                        />
                      </div>
                      <Statistic
                        title={
                          <Text
                            style={{
                              color: "var(--text-secondary)",
                              fontWeight: 500,
                              fontSize: "14px",
                            }}
                          >
                            Tỉ lệ thành công
                          </Text>
                        }
                        value={dashboardData.statistics.successRate}
                        suffix="%"
                        valueStyle={{
                          color: "#fa709a",
                          fontWeight: 700,
                          fontSize: "28px",
                        }}
                      />
                    </div>
                  </Card>
                </Col>
              </Row>
            </Col>

            {/* Today's Schedule */}
            <Col xs={24} md={12} lg={12}>
              <Card
                className="doctor-card doctor-fade-in"
                style={{ animationDelay: "0.5s", height: "100%" }}
                title={
                  <Space>
                    <CalendarOutlined
                      style={{ color: "var(--secondary-color)" }}
                    />
                    <Text strong style={{ color: "var(--secondary-color)" }}>
                      📅 Lịch hẹn hôm nay
                    </Text>
                  </Space>
                }
              >
                <div className="doctor-list">
                  {dashboardData.todayAppointments.length > 0 ? (
                    <List
                      dataSource={dashboardData.todayAppointments}
                      renderItem={(item, index) => (
                        <List.Item
                          style={{
                            border: "none",
                            padding: "16px",
                            borderRadius: "12px",
                            background: "var(--bg-card)",
                            marginBottom: "12px",
                            boxShadow: "0 2px 8px var(--shadow-soft)",
                            transition: "var(--transition-normal)",
                          }}
                          className="doctor-fade-in"
                          actions={[
                            <Button
                              size="small"
                              className="doctor-btn-secondary"
                              icon={<FileTextOutlined />}
                            >
                              Chi tiết
                            </Button>,
                          ]}
                        >
                          <List.Item.Meta
                            avatar={
                              <div
                                style={{
                                  background: "var(--secondary-gradient)",
                                  width: "40px",
                                  height: "40px",
                                  borderRadius: "50%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  boxShadow:
                                    "0 4px 12px rgba(102, 126, 234, 0.3)",
                                }}
                              >
                                <ClockCircleOutlined
                                  style={{ color: "white", fontSize: "16px" }}
                                />
                              </div>
                            }
                            title={
                              <div>
                                <Text
                                  strong
                                  style={{
                                    color: "var(--text-dark)",
                                    fontSize: "15px",
                                  }}
                                >
                                  🕒 {item.time}
                                </Text>
                                <br />
                                <Text
                                  style={{
                                    color: "var(--primary-color)",
                                    fontWeight: 600,
                                  }}
                                >
                                  {item.patientName}
                                </Text>
                              </div>
                            }
                            description={
                              <div>
                                <Tag
                                  className="doctor-tag-secondary"
                                  style={{
                                    marginTop: "4px",
                                    marginBottom: "4px",
                                  }}
                                >
                                  {item.service}
                                </Tag>
                                <br />
                                <Text
                                  type="secondary"
                                  style={{ fontSize: "12px" }}
                                >
                                  {item.notes}
                                </Text>
                              </div>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  ) : (
                    <div style={{ textAlign: "center", padding: "40px 0" }}>
                      <CalendarOutlined
                        style={{ fontSize: "48px", color: "var(--text-muted)" }}
                      />
                      <div style={{ marginTop: "16px" }}>
                        <Text type="secondary">Không có lịch hẹn hôm nay</Text>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </Col>

            {/* Patient List */}
            <Col xs={24} md={12} lg={12}>
              <Card
                className="doctor-card doctor-fade-in"
                style={{ animationDelay: "0.6s", height: "100%" }}
                title={
                  <Space>
                    <TeamOutlined style={{ color: "var(--primary-color)" }} />
                    <Text strong style={{ color: "var(--primary-color)" }}>
                      👥 Bệnh nhân của tôi
                    </Text>
                  </Space>
                }
              >
                <div className="doctor-list">
                  <List
                    dataSource={dashboardData.patients}
                    renderItem={(patient, index) => (
                      <List.Item
                        style={{
                          border: "none",
                          padding: "20px",
                          borderRadius: "12px",
                          background: "var(--bg-card)",
                          marginBottom: "16px",
                          boxShadow: "0 2px 8px var(--shadow-soft)",
                          transition: "var(--transition-normal)",
                        }}
                        className="doctor-fade-in"
                      >
                        <List.Item.Meta
                          avatar={
                            <Avatar
                              size={50}
                              icon={<UserOutlined />}
                              style={{
                                background: "var(--primary-gradient)",
                                boxShadow: "0 4px 12px var(--shadow-light)",
                              }}
                            />
                          }
                          title={
                            <div style={{ marginBottom: "8px" }}>
                              <Text
                                strong
                                style={{
                                  fontSize: "16px",
                                  color: "var(--text-dark)",
                                  whiteSpace: "normal",
                                  wordBreak: "break-word",
                                  overflowWrap: "break-word",
                                  display: "block",
                                  maxWidth: "100%",
                                }}
                              >
                                {patient.fullName || patient.name}
                              </Text>
                              {treatmentFlow.currentPatient?.id ===
                                patient.id && (
                                <Tag
                                  className="doctor-tag-primary"
                                  style={{
                                    marginLeft: "8px",
                                    fontSize: "11px",
                                  }}
                                >
                                  🔄 Đang điều trị
                                </Tag>
                              )}
                            </div>
                          }
                          description={
                            <Space
                              direction="vertical"
                              size="small"
                              style={{ width: "100%" }}
                            >
                              <Text
                                type="secondary"
                                style={{ fontSize: "13px" }}
                              >
                                👤 {patient.age} tuổi
                              </Text>
                              <div>
                                <Text
                                  type="secondary"
                                  style={{
                                    fontSize: "12px",
                                    marginBottom: "4px",
                                    display: "block",
                                  }}
                                >
                                  Tiến độ điều trị:
                                </Text>
                                <Progress
                                  percent={patient.progress}
                                  size="small"
                                  className="doctor-progress"
                                  format={(percent) => (
                                    <Text
                                      style={{
                                        fontSize: "11px",
                                        color: "var(--primary-color)",
                                      }}
                                    >
                                      {percent}%
                                    </Text>
                                  )}
                                />
                              </div>
                            </Space>
                          }
                        />
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                            marginTop: 8,
                          }}
                        >
                          <Button
                            size="small"
                            className="doctor-btn-secondary"
                            onClick={() => {
                              setSelectedPatient(patient);
                              setSelectedSection("patient-view");
                            }}
                            icon={<FileTextOutlined />}
                          >
                            Xem hồ sơ
                          </Button>
                          <Button
                            size="small"
                            type="primary"
                            className="doctor-btn-primary"
                            onClick={() => handleViewTreatment(patient)}
                            icon={<MedicineBoxOutlined />}
                          >
                            Điều trị
                          </Button>
                        </div>
                      </List.Item>
                    )}
                  />
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      ),
    },
    "full-process": {
      title: "Quy trình điều trị",
      component: (
        <TreatmentProcess
          patientId={selectedPatient?.id || "1"}
          mode="doctor"
          patientInfo={selectedPatient}
        />
      ),
    },
    examination: {
      title: "Khám lâm sàng",
      component: (
        <ExaminationForm
          patientId={
            treatmentFlow.currentPatient?.id || selectedPatient?.id || "1"
          }
          patientInfo={
            treatmentFlow.currentPatient ||
            selectedPatient || {
              name: "Nguyễn Thị Mai",
              gender: "female",
              dob: "1992-03-15",
              contact: "0909123456",
            }
          }
          existingData={treatmentFlow.examinationData}
          isEditing={treatmentFlow.isEditing}
          onNext={handleExaminationComplete}
        />
      ),
    },
    "treatment-plan": {
      title: "Lập phác đồ điều trị",
      component: (
        <TreatmentPlanEditor
          patientId={
            treatmentFlow.currentPatient?.id || selectedPatient?.id || "1"
          }
          patientInfo={
            treatmentFlow.currentPatient ||
            selectedPatient || {
              name: "Nguyễn Thị Mai",
              gender: "female",
              dob: "1992-03-15",
            }
          }
          examinationData={
            treatmentFlow.examinationData || {
              diagnosis: "Vô sinh nguyên phát",
              recommendations: "Làm thêm xét nghiệm AMH, HSG",
              doctorId: user?.id || "doctor1",
            }
          }
          existingPlan={treatmentFlow.treatmentPlan}
          isEditing={treatmentFlow.isEditing}
          onNext={handleTreatmentPlanComplete}
        />
      ),
    },
    schedule: {
      title: "Lập lịch điều trị",
      component: (
        <div>
          {/* Sub-steps for treatment scheduling */}
          {scheduleSubSteps.subSteps.length > 0 && (
            <Card style={{ marginBottom: 24 }}>
              <Title level={4}>Các giai đoạn điều trị chi tiết</Title>
              <Steps
                current={scheduleSubSteps.currentSubStep}
                direction="vertical"
                size="small"
                items={scheduleSubSteps.subSteps.map((subStep, index) => ({
                  title: subStep.title,
                  description: `${subStep.description} (${subStep.duration})`,
                  status: scheduleSubSteps.completedSubSteps.includes(index)
                    ? "finish"
                    : index === scheduleSubSteps.currentSubStep
                    ? "process"
                    : "wait",
                  icon: scheduleSubSteps.completedSubSteps.includes(index) ? (
                    <CheckCircleOutlined />
                  ) : index === scheduleSubSteps.currentSubStep ? (
                    <PlayCircleOutlined />
                  ) : (
                    <ClockCircleOutlined />
                  ),
                }))}
              />

              {/* Control buttons for sub-steps */}
              <div style={{ marginTop: 16, textAlign: "center" }}>
                <Space>
                  <Button
                    type="primary"
                    onClick={() =>
                      handleSubStepComplete(scheduleSubSteps.currentSubStep, {
                        timestamp: new Date(),
                      })
                    }
                    disabled={scheduleSubSteps.completedSubSteps.includes(
                      scheduleSubSteps.currentSubStep
                    )}
                  >
                    ✅ Hoàn thành giai đoạn hiện tại
                  </Button>
                  <Button
                    onClick={() => {
                      Modal.info({
                        title: "Chi tiết giai đoạn",
                        content:
                          scheduleSubSteps.subSteps[
                            scheduleSubSteps.currentSubStep
                          ]?.description,
                      });
                    }}
                  >
                    📋 Xem chi tiết
                  </Button>
                </Space>
              </div>
            </Card>
          )}

          <TreatmentScheduleForm
            patientId={
              treatmentFlow.currentPatient?.id || selectedPatient?.id || "1"
            }
            patientInfo={
              treatmentFlow.currentPatient ||
              selectedPatient || {
                name: "Nguyễn Thị Mai",
                gender: "female",
              }
            }
            treatmentPlan={treatmentFlow.treatmentPlan}
            examinationData={treatmentFlow.examinationData}
            existingSchedule={treatmentFlow.schedule}
            isEditing={treatmentFlow.isEditing}
            subStepsData={scheduleSubSteps}
            onNext={handleScheduleComplete}
            onSubStepComplete={handleSubStepComplete}
          />
        </div>
      ),
    },
    "patient-view": {
      title: "Xem lịch bệnh nhân",
      component: (
        <PatientScheduleView
          patientId={
            treatmentFlow.currentPatient?.id || selectedPatient?.id || "1"
          }
          patientInfo={
            treatmentFlow.currentPatient ||
            selectedPatient || {
              name: "Nguyễn Thị Mai",
              gender: "female",
            }
          }
          schedule={treatmentFlow.schedule}
          treatmentFlow={treatmentFlow}
          scheduleSubSteps={scheduleSubSteps}
          isPatientView={false}
        />
      ),
    },

    profile: {
      title: "Hồ sơ cá nhân",
      component: (
        <div className="doctor-profile-wrapper">
          <UserProfile />
        </div>
      ),
    },
    // Xóa mục treatment-plans-list trong treatmentSections
    // Xóa mục menuItems liên quan đến treatment-plans-list
    "theme-demo": {
      title: "Demo Giao Diện Mới",
      component: <ThemeDemo />,
    },
  };

  const menuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Tổng quan",
    },
    {
      type: "divider",
    },
    {
      key: "treatment-group",
      label: "Quản lý điều trị",
      type: "group",
    },
    {
      key: "full-process",
      icon: <SettingOutlined />,
      label: "Quy trình điều trị",
    },
    {
      key: "examination",
      icon: <FileTextOutlined />,
      label: "Khám lâm sàng",
    },
    {
      key: "treatment-plan",
      icon: <MedicineBoxOutlined />,
      label: "Lập phác đồ",
    },
    // Xóa mục treatment-plans-list trong menuItems
    {
      key: "schedule",
      icon: <CalendarOutlined />,
      label: "Lập lịch điều trị",
    },
    {
      key: "patient-view",
      icon: <UserOutlined />,
      label: "Theo dõi BN",
    },

    {
      type: "divider",
    },
    {
      key: "theme-demo",
      icon: <StarOutlined />,
      label: "🎨 Demo Giao Diện Mới",
    },
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Hồ sơ cá nhân",
    },
  ];

  const currentSection = treatmentSections[selectedSection];

  return (
    <div className="doctor-dashboard">
      <Layout style={{ minHeight: "100vh", background: "transparent" }}>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          width={280}
          className="doctor-sidebar"
        >
          <div
            style={{
              padding: "16px",
              borderBottom: "1px solid #f0f0f0",
              textAlign: "center",
            }}
          >
            <Avatar
              size={collapsed ? 32 : 64}
              icon={<UserOutlined />}
              style={{ marginBottom: 8 }}
            />
            {!collapsed && (
              <div>
                <Title
                  level={5}
                  style={{ margin: "8px 0 4px", color: "var(--text-dark)" }}
                >
                  {user?.fullName || "BS. Lê Văn Doctor"}
                </Title>
                <Text type="secondary">Bác sĩ điều trị</Text>
                {dataError && (
                  <div
                    style={{
                      marginTop: "8px",
                      fontSize: "11px",
                      color: "#faad14",
                    }}
                  >
                    ⚠️ Dữ liệu mẫu
                  </div>
                )}
              </div>
            )}
          </div>

          <Menu
            mode="inline"
            selectedKeys={[selectedSection]}
            onClick={({ key }) => setSelectedSection(key)}
            items={menuItems}
            style={{ borderRight: 0 }}
          />
        </Sider>

        <Layout>
          <Header className="doctor-layout-header">
            <Row justify="space-between" align="middle">
              <Col>
                <Space>
                  <Title level={4} style={{ margin: 0 }}>
                    {currentSection?.title}
                  </Title>
                  {selectedPatient && (
                    <Tag color="blue">Bệnh nhân: {selectedPatient.name}</Tag>
                  )}
                  {treatmentFlow.lastSaved && (
                    <Tag color="green">
                      <HistoryOutlined /> Lưu lần cuối:{" "}
                      {new Date(treatmentFlow.lastSaved).toLocaleTimeString(
                        "vi-VN"
                      )}
                    </Tag>
                  )}
                </Space>
              </Col>
              <Col>
                <Space>
                  <Badge count={5}>
                    <Button icon={<BellOutlined />} />
                  </Badge>
                  <Dropdown
                    menu={{
                      items: userMenu.props.children.map((item) => ({
                        key: item.key,
                        icon: item.props.icon,
                        label: item.props.children,
                        onClick: item.props.onClick,
                        type:
                          item.type?.name === "MenuDivider"
                            ? "divider"
                            : undefined,
                      })),
                    }}
                    placement="bottomRight"
                  >
                    <Button type="text" className="doctor-btn-secondary">
                      <Space>
                        <Avatar
                          size="small"
                          icon={<UserOutlined />}
                          className="doctor-avatar"
                        />
                        {user?.fullName || "Bác sĩ"}
                      </Space>
                    </Button>
                  </Dropdown>
                </Space>
              </Col>
            </Row>
          </Header>

          <Content
            style={{
              margin: "24px",
              minHeight: "calc(100vh - 112px)",
              minWidth: 0,
            }}
          >
            {selectedSection === "dashboard" && (
              <div style={{ marginBottom: 24 }}>
                <Card
                  className="doctor-glass-card doctor-fade-in"
                  style={{
                    background: "var(--glass-bg)",
                    border: "1px solid var(--glass-border)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "4px",
                      height: "100%",
                      background: "var(--primary-gradient)",
                    }}
                  />
                  <Row align="middle" gutter={16}>
                    <Col>
                      <div
                        style={{
                          background: "var(--primary-gradient)",
                          width: "48px",
                          height: "48px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 8px 20px var(--shadow-light)",
                        }}
                      >
                        <BellOutlined
                          style={{ color: "white", fontSize: "20px" }}
                        />
                      </div>
                    </Col>
                    <Col flex={1}>
                      <Title
                        level={4}
                        style={{ margin: 0, color: "var(--primary-color)" }}
                      >
                        {(() => {
                          const hour = new Date().getHours();
                          if (hour < 12) return "🌅 Chào buổi sáng bác sĩ!";
                          if (hour < 17) return "☀️ Chào buổi chiều bác sĩ!";
                          return "🌙 Chào buổi tối bác sĩ!";
                        })()}
                      </Title>
                      <Text
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: "15px",
                        }}
                      >
                        Hôm nay bạn có{" "}
                        <Text strong style={{ color: "var(--primary-color)" }}>
                          {dashboardData.statistics.todayAppointments} lịch hẹn
                        </Text>{" "}
                        và{" "}
                        <Text strong style={{ color: "var(--primary-color)" }}>
                          {dashboardData.statistics.inTreatment} bệnh nhân
                        </Text>{" "}
                        đang điều trị.
                      </Text>
                    </Col>
                  </Row>
                </Card>
              </div>
            )}

            <Card
              className="doctor-card"
              style={{
                minHeight: "calc(100vh - 200px)",
                background: "var(--bg-card)",
                border: "1px solid var(--border-light)",
                borderRadius: "var(--radius-lg)",
                overflow: "hidden",
                position: "relative",
              }}
              styles={{
                body: {
                  padding: selectedSection === "dashboard" ? "24px" : "32px",
                  background: "transparent",
                },
              }}
            >
              <div style={{ position: "relative", zIndex: 1 }}>
                {currentSection?.component}
              </div>
            </Card>
          </Content>
        </Layout>
      </Layout>
    </div>
  );
};

export default DoctorDashboard;
