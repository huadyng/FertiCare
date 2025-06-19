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
  ExperimentOutlined,
} from "@ant-design/icons";

import TreatmentProcess from "./treatment/TreatmentProcess";
import ExaminationForm from "./treatment/ExaminationForm";
import TreatmentPlanEditor from "./treatment/TreatmentPlanEditor";
import TreatmentScheduleForm from "./treatment/TreatmentScheduleForm";
import TreatmentSyncDemo from "./test/TreatmentSyncDemo";
import PatientScheduleView from "./treatment/PatientScheduleView";
import DoctorProfile from "./DoctorProfile";
import { UserContext } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import {
  mockPatients,
  todayAppointments,
  statistics,
} from "./constants/mockData";
import { getScheduleSubSteps } from "./constants/treatmentSubSteps";

const { Header, Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const DoctorDashboard = () => {
  const [selectedSection, setSelectedSection] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const { user, logout } = useContext(UserContext);

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
    console.log("✅ Khám lâm sàng hoàn thành:", examinationData);

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
    message.success("✅ Đã lưu kết quả khám - Chuyển sang lập phác đồ");
  };

  const handleTreatmentPlanComplete = (treatmentPlan) => {
    console.log("✅ Phác đồ điều trị hoàn thành:", treatmentPlan);

    const timestamp = new Date().toISOString();
    const stepHistory = {
      step: 1,
      title: "Lập phác đồ",
      completedAt: timestamp,
      data: treatmentPlan,
    };

    // Ensure we have complete treatment plan data
    const completePlan = {
      ...treatmentPlan,
      template:
        treatmentPlan.finalPlan ||
        treatmentPlan.originalTemplate ||
        treatmentPlan.template,
    };

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
    message.success("✅ Đã lưu phác đồ - Chuyển sang lập lịch điều trị");
  };

  const handleScheduleComplete = (schedule) => {
    console.log("✅ Lịch điều trị hoàn thành:", schedule);

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
    message.success(
      "✅ Đã lập lịch hoàn thành - Chuyển sang theo dõi bệnh nhân"
    );
  };

  const handleSubStepComplete = (subStepIndex, subStepData) => {
    console.log(`✅ Hoàn thành giai đoạn phụ ${subStepIndex}:`, subStepData);

    setScheduleSubSteps((prev) => ({
      ...prev,
      completedSubSteps: [...prev.completedSubSteps, subStepIndex],
      currentSubStep: Math.min(subStepIndex + 1, prev.subSteps.length - 1),
    }));

    message.success(
      `✅ Hoàn thành: ${scheduleSubSteps.subSteps[subStepIndex]?.title}`
    );
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
        message.info(`🏥 Bắt đầu quy trình điều trị cho ${patient.name}`);
      },
    });
  };

  const handleEditStep = (stepIndex) => {
    const stepSections = ["examination", "treatment-plan", "schedule"];
    setTreatmentFlow((prev) => ({ ...prev, isEditing: true }));
    setSelectedSection(stepSections[stepIndex]);
    message.info(`✏️ Chỉnh sửa bước: ${stepIndex + 1}`);
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
          <Row gutter={[24, 24]}>
            {/* Statistics Cards */}
            <Col span={24}>
              <Row gutter={16}>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="Tổng bệnh nhân"
                      value={statistics.totalPatients}
                      prefix={<TeamOutlined />}
                      valueStyle={{ color: "#1890ff" }}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="Lịch hẹn hôm nay"
                      value={statistics.todayAppointments}
                      prefix={<CalendarOutlined />}
                      valueStyle={{ color: "#52c41a" }}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="Đang điều trị"
                      value={statistics.inTreatment}
                      prefix={<MedicineBoxOutlined />}
                      valueStyle={{ color: "#faad14" }}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="Tỉ lệ thành công"
                      value={statistics.successRate}
                      suffix="%"
                      prefix={<CheckCircleOutlined />}
                      valueStyle={{ color: "#722ed1" }}
                    />
                  </Card>
                </Col>
              </Row>
            </Col>

            {/* Treatment Progress Overview */}
            {treatmentFlow.currentPatient && (
              <Col span={24}>
                <Card
                  title={
                    <Space>
                      <PlayCircleOutlined />
                      Quy trình điều trị đang thực hiện
                    </Space>
                  }
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Card type="inner" title="Thông tin bệnh nhân">
                        <p>
                          <Text strong>Tên:</Text>{" "}
                          {treatmentFlow.currentPatient.name}
                        </p>
                        <p>
                          <Text strong>Tuổi:</Text>{" "}
                          {treatmentFlow.currentPatient.age}
                        </p>
                        <p>
                          <Text strong>Dịch vụ:</Text>{" "}
                          {treatmentFlow.currentPatient.servicePackage}
                        </p>
                        <p>
                          <Text strong>Tiến độ:</Text>
                          <Progress
                            percent={(
                              (treatmentFlow.completedSteps.length / 4) *
                              100
                            ).toFixed(0)}
                            status="active"
                            style={{ marginLeft: 8 }}
                          />
                        </p>
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card type="inner" title="Lịch sử hoàn thành">
                        <Timeline size="small">
                          {treatmentFlow.stepHistory.map((step, index) => (
                            <Timeline.Item
                              key={index}
                              color="green"
                              dot={
                                <CheckCircleOutlined
                                  style={{ color: "green" }}
                                />
                              }
                            >
                              <Text strong>{step.title}</Text>
                              <br />
                              <Text type="secondary">
                                {new Date(step.completedAt).toLocaleString(
                                  "vi-VN"
                                )}
                              </Text>
                            </Timeline.Item>
                          ))}
                        </Timeline>
                      </Card>
                    </Col>
                  </Row>
                </Card>
              </Col>
            )}

            {/* Today's Schedule */}
            <Col span={12}>
              <Card
                title="Lịch hẹn hôm nay"
                extra={
                  <Button type="primary" icon={<PlusOutlined />}>
                    Thêm lịch hẹn
                  </Button>
                }
              >
                <List
                  dataSource={todayAppointments}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={<ClockCircleOutlined />} />}
                        title={`${item.time} - ${item.patient}`}
                        description={item.type}
                      />
                      <Button size="small">Chi tiết</Button>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>

            {/* Patient List */}
            <Col span={12}>
              <Card
                title="Bệnh nhân của tôi"
                extra={
                  <Button type="primary" icon={<PlusOutlined />}>
                    Thêm bệnh nhân
                  </Button>
                }
              >
                <List
                  dataSource={mockPatients}
                  renderItem={(patient) => (
                    <List.Item
                      actions={[
                        <Button
                          size="small"
                          onClick={() => handleStartNewTreatment(patient)}
                          type="primary"
                          disabled={
                            treatmentFlow.currentPatient?.id === patient.id
                          }
                        >
                          🏥 Bắt đầu điều trị
                        </Button>,
                        <Button
                          size="small"
                          onClick={() => {
                            setSelectedPatient(patient);
                            setSelectedSection("patient-view");
                          }}
                        >
                          📋 Xem hồ sơ
                        </Button>,
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<Avatar icon={<UserOutlined />} />}
                        title={patient.name}
                        description={
                          <Space direction="vertical" size="small">
                            <Text type="secondary">
                              {patient.age} tuổi - {patient.treatmentType}
                            </Text>
                            <Progress percent={patient.progress} size="small" />
                            <Tag
                              color={
                                patient.status === "completed"
                                  ? "green"
                                  : patient.status === "in-treatment"
                                  ? "blue"
                                  : "orange"
                              }
                            >
                              {patient.status === "completed"
                                ? "Hoàn thành"
                                : patient.status === "in-treatment"
                                ? "Đang điều trị"
                                : "Tư vấn"}
                            </Tag>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
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
      title: "Thông tin cá nhân",
      component: <DoctorProfile />,
    },
    "sync-demo": {
      title: "🔄 Treatment Sync Demo",
      component: <TreatmentSyncDemo />,
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
      key: "profile",
      icon: <UserOutlined />,
      label: "Thông tin cá nhân",
    },
    {
      type: "divider",
    },
    {
      key: "sync-demo",
      icon: <ExperimentOutlined />,
      label: "🔄 Sync Demo",
    },
  ];

  const currentSection = treatmentSections[selectedSection];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={280}
        style={{ background: "#fff" }}
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
              <Title level={5} style={{ margin: "8px 0 4px" }}>
                {user?.fullName || "BS. Lê Văn Doctor"}
              </Title>
              <Text type="secondary">Bác sĩ điều trị</Text>
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

        {!collapsed && (
          <div style={{ padding: "16px" }}>
            <Card size="small">
              <Title level={5}>Thông báo</Title>
              <List
                size="small"
                dataSource={[
                  { text: "3 lịch hẹn mới hôm nay", type: "info" },
                  { text: "2 kết quả xét nghiệm cần xem", type: "warning" },
                  { text: "1 báo cáo đã hoàn thành", type: "success" },
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <Text style={{ fontSize: 12 }}>
                      <Badge
                        color={
                          item.type === "info"
                            ? "blue"
                            : item.type === "warning"
                            ? "orange"
                            : "green"
                        }
                      />
                      {item.text}
                    </Text>
                  </List.Item>
                )}
              />
            </Card>
          </div>
        )}
      </Sider>

      <Layout>
        <Header
          style={{
            background: "#fff",
            padding: "0 24px",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
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
                  <Button type="text">
                    <Space>
                      <Avatar size="small" icon={<UserOutlined />} />
                      {user?.fullName || "Bác sĩ"}
                    </Space>
                  </Button>
                </Dropdown>
              </Space>
            </Col>
          </Row>
        </Header>

        <Content style={{ margin: "24px", minHeight: "calc(100vh - 112px)" }}>
          {selectedSection === "dashboard" && (
            <Alert
              message="Chào mừng bác sĩ quay trở lại!"
              description="Hôm nay bạn có 8 lịch hẹn và 3 bệnh nhân cần theo dõi đặc biệt."
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />
          )}

          {/* Enhanced Treatment Flow Progress */}
          {treatmentFlow.currentPatient &&
            (selectedSection === "examination" ||
              selectedSection === "treatment-plan" ||
              selectedSection === "schedule" ||
              selectedSection === "patient-view") && (
              <Card style={{ marginBottom: 24, background: "#f8f9fa" }}>
                <Row align="middle" gutter={16}>
                  <Col span={6}>
                    <div>
                      <Text strong style={{ fontSize: "16px" }}>
                        🏥 Điều trị cho: {treatmentFlow.currentPatient.name}
                      </Text>
                      <br />
                      <Text type="secondary">
                        {treatmentFlow.currentPatient.age} tuổi | ID:{" "}
                        {treatmentFlow.currentPatient.id}
                      </Text>
                      <br />
                      <Text type="secondary">
                        Gói dịch vụ:{" "}
                        {treatmentFlow.currentPatient.servicePackage}
                      </Text>
                    </div>
                  </Col>
                  <Col span={16}>
                    <Steps
                      current={treatmentFlow.step}
                      size="small"
                      onChange={handleJumpToStep}
                      items={[
                        {
                          title: "Khám lâm sàng",
                          description: "Nhập kết quả khám",
                          icon: treatmentFlow.completedSteps.includes(0) ? (
                            <CheckCircleOutlined />
                          ) : (
                            <FileTextOutlined />
                          ),
                          status: treatmentFlow.completedSteps.includes(0)
                            ? "finish"
                            : undefined,
                        },
                        {
                          title: "Lập phác đồ",
                          description: "Tùy chỉnh điều trị",
                          icon: treatmentFlow.completedSteps.includes(1) ? (
                            <CheckCircleOutlined />
                          ) : (
                            <MedicineBoxOutlined />
                          ),
                          status: treatmentFlow.completedSteps.includes(1)
                            ? "finish"
                            : undefined,
                        },
                        {
                          title: "Lập lịch",
                          description: "Sắp xếp thời gian",
                          icon: treatmentFlow.completedSteps.includes(2) ? (
                            <CheckCircleOutlined />
                          ) : (
                            <CalendarOutlined />
                          ),
                          status: treatmentFlow.completedSteps.includes(2)
                            ? "finish"
                            : undefined,
                        },
                        {
                          title: "Theo dõi",
                          description: "Quản lý tiến trình",
                          icon: treatmentFlow.completedSteps.includes(3) ? (
                            <CheckCircleOutlined />
                          ) : (
                            <PlayCircleOutlined />
                          ),
                          status: treatmentFlow.completedSteps.includes(3)
                            ? "finish"
                            : undefined,
                        },
                      ]}
                    />
                  </Col>
                  <Col span={2}>
                    <Space direction="vertical">
                      <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() =>
                          setTreatmentFlow((prev) => ({
                            ...prev,
                            isEditing: !prev.isEditing,
                          }))
                        }
                      >
                        {treatmentFlow.isEditing ? "Hoàn tất" : "Chỉnh sửa"}
                      </Button>
                    </Space>
                  </Col>
                </Row>
              </Card>
            )}

          <Card style={{ minHeight: "calc(100vh - 200px)" }}>
            {currentSection?.component}
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default DoctorDashboard;
