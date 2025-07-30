import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  Card,
  Form,
  DatePicker,
  TimePicker,
  Button,
  Typography,
  message,
  Row,
  Col,
  Select,
  Table,
  Tag,
  Alert,
  Descriptions,
  Space,
  Timeline,
  Divider,
  Statistic,
  Modal,
  Input,
  InputNumber,
  Steps,
  Badge,
  Tooltip,
  Popconfirm,
  Switch,
  Progress,
  Spin,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  MedicineBoxOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
  UserOutlined,
  SettingOutlined,
  DollarOutlined,
  ReloadOutlined,
  SaveOutlined,
  PlusOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { generateScheduleFromTemplate } from "./data/treatmentTemplates";
import { treatmentStateManager } from "../../../utils/treatmentStateManager";
import apiTreatmentManagement from "../../../api/apiTreatmentManagement";
import { UserContext } from "../../../context/UserContext";
import axiosClient from "../../../services/axiosClient";
import "./TreatmentScheduleForm.css";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Step } = Steps;

/**
 * BACKEND FIX: API `/api/treatment-workflow/doctor/{doctorId}/treatment-phases`
 * đã được cập nhật để trả về đúng structure:
 * - `phaseId`: UUID của phase (để load activities)
 * - `phaseName`: Tên thật từ database (để hiển thị)
 * - `description`: Mô tả chi tiết
 * - `phaseOrder`: Thứ tự phase
 *
 * Nếu phaseName không có, sẽ fallback sang `generateMeaningfulPhaseName()`
 */
const TreatmentScheduleForm = ({
  patientId,
  patientInfo,
  treatmentPlan,
  examinationData,
  existingSchedule,
  isEditing,
  subStepsData,
  onNext,
  onSubStepComplete,
}) => {
  const [form] = Form.useForm();
  const [sessionForm] = Form.useForm();
  const [phaseForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [generatedSchedule, setGeneratedSchedule] = useState([]);
  const [template, setTemplate] = useState(null);
  const [editingSession, setEditingSession] = useState(null);
  const [sessionModal, setSessionModal] = useState(false);
  const { user } = useContext(UserContext);

  // Kiểm tra xem có patientId hợp lệ không
  if (!patientId) {
    return (
      <div style={{ padding: '20px' }}>
        <Card className="examination-main-card">
          <div className="examination-header">
            <Title level={2} className="examination-title">
              <Space>
                <CalendarOutlined className="title-icon" />
                Lập lịch điều trị
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
              Vui lòng chọn bệnh nhân để lập lịch điều trị
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

  // Doctor customization states
  const [doctorNotes, setDoctorNotes] = useState("");
  const [customSessions, setCustomSessions] = useState([]);
  const [scheduleAdjustments, setScheduleAdjustments] = useState({});

  // Enhanced states for real API integration
  const [apiPhases, setApiPhases] = useState([]);
  const [loadingPhases, setLoadingPhases] = useState(false);
  const [editingPhase, setEditingPhase] = useState(null);
  const [phaseModal, setPhaseModal] = useState(false);
  
  // Available times states
  const [availableTimes, setAvailableTimes] = useState([]);
  const [loadingAvailableTimes, setLoadingAvailableTimes] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentTreatmentPlan, setCurrentTreatmentPlan] = useState(null);
  const [autoImporting, setAutoImporting] = useState(false);
  const [scheduleData, setScheduleData] = useState(null);
  const [savingSchedule, setSavingSchedule] = useState(false);

  // NEW: States for detailed activity management
  const [phaseActivities, setPhaseActivities] = useState({});
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [selectedActivities, setSelectedActivities] = useState(new Set());
  const [activityModal, setActivityModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [activityStatuses, setActivityStatuses] = useState({});

  // 🆕 Function để tạo initial values với ngày hiện tại
  const getInitialFormValues = () => ({
    startDate: dayjs().add(3, "days"),
    preferredTime: null,
    planName: ""
  });

  // 🆕 State để quản lý initial values
  const [initialFormValues] = useState(getInitialFormValues());

  // 🆕 State để theo dõi validation của form
  const [formValues, setFormValues] = useState({
    startDate: dayjs().add(3, "days"),
    preferredTime: null,
    planName: ""
  });

  // State để theo dõi việc đã tải dữ liệu lần đầu
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  // NEW: States for phase status management
  const [phaseStatusModal, setPhaseStatusModal] = useState(false);
  const [editingPhaseStatus, setEditingPhaseStatus] = useState(null);
  const [phaseStatusForm] = Form.useForm();
  const [updatingPhaseStatus, setUpdatingPhaseStatus] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(null);
  const [loadingCurrentPhase, setLoadingCurrentPhase] = useState(false);

  // BACKEND SYNC: Validate treatment plan data structure
  const validateTreatmentPlanData = (planData) => {
    const errors = [];

    // Validate required fields
    if (!planData.planName || planData.planName.trim() === "") {
      errors.push("Tên phác đồ là bắt buộc");
    }
    if (planData.planName && planData.planName.length > 255) {
      errors.push("Tên phác đồ không được vượt quá 255 ký tự");
    }

    if (!planData.treatmentType) {
      errors.push("Loại điều trị là bắt buộc");
    }
    if (
      planData.treatmentType &&
      !["IUI", "IVF", "ICSI"].includes(planData.treatmentType)
    ) {
      errors.push("Loại điều trị phải là IUI, IVF hoặc ICSI");
    }

    if (!planData.patientId) {
      errors.push("ID bệnh nhân là bắt buộc");
    }

    // Validate data types
    if (
      planData.estimatedDurationDays &&
      typeof planData.estimatedDurationDays !== "number"
    ) {
      errors.push("Thời gian ước tính phải là số");
    }

    if (planData.estimatedCost && typeof planData.estimatedCost !== "number") {
      errors.push("Chi phí ước tính phải là số");
    }

    if (
      planData.treatmentCycle &&
      typeof planData.treatmentCycle !== "number"
    ) {
      errors.push("Số chu kỳ điều trị phải là số");
    }

    if (
      planData.successProbability &&
      (typeof planData.successProbability !== "number" ||
        planData.successProbability < 0 ||
        planData.successProbability > 100)
    ) {
      errors.push("Tỷ lệ thành công phải là số từ 0 đến 100");
    }

    // Validate status
    if (
      planData.status &&
      !["draft", "active", "completed", "cancelled"].includes(planData.status)
    ) {
      errors.push("Trạng thái phải là draft, active, completed hoặc cancelled");
    }

    // Validate treatmentSteps structure
    if (planData.treatmentSteps && Array.isArray(planData.treatmentSteps)) {
      planData.treatmentSteps.forEach((step, index) => {
        if (!step.name || step.name.trim() === "") {
          errors.push(`Bước ${index + 1}: Tên bước là bắt buộc`);
        }
        if (step.step && typeof step.step !== "number") {
          errors.push(`Bước ${index + 1}: Số thứ tự phải là số`);
        }
        if (step.activities && !Array.isArray(step.activities)) {
          errors.push(`Bước ${index + 1}: Hoạt động phải là mảng`);
        }
      });
    }

    // Validate medicationPlan structure
    if (planData.medicationPlan && Array.isArray(planData.medicationPlan)) {
      planData.medicationPlan.forEach((plan, index) => {
        if (!plan.phase || plan.phase.trim() === "") {
          errors.push(`Kế hoạch thuốc ${index + 1}: Giai đoạn là bắt buộc`);
        }
        if (plan.medications && Array.isArray(plan.medications)) {
          plan.medications.forEach((med, medIndex) => {
            if (!med.name || med.name.trim() === "") {
              errors.push(
                `Kế hoạch thuốc ${index + 1}, thuốc ${
                  medIndex + 1
                }: Tên thuốc là bắt buộc`
              );
            }
          });
        }
      });
    }

    // Validate monitoringSchedule structure
    if (
      planData.monitoringSchedule &&
      Array.isArray(planData.monitoringSchedule)
    ) {
      planData.monitoringSchedule.forEach((schedule, index) => {
        if (schedule.day && typeof schedule.day !== "number") {
          errors.push(`Lịch theo dõi ${index + 1}: Ngày phải là số`);
        }
        if (!schedule.activity || schedule.activity.trim() === "") {
          errors.push(`Lịch theo dõi ${index + 1}: Hoạt động là bắt buộc`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
    };
  };

  // BACKEND SYNC: Format data for API submission
  const formatDataForBackend = (formData) => {
    // Chỉ giữ lại các trường bắt buộc và các trường có giá trị thực sự
    const backendData = {
      patientId: patientId,
      treatmentType: formData.treatmentType || "IUI",
    };

    // Các trường không bắt buộc, chỉ thêm nếu có giá trị thực
    if (formData.planName) backendData.planName = formData.planName;
    if (formData.planDescription)
      backendData.planDescription = formData.planDescription;
    if (formData.treatmentCycle)
      backendData.treatmentCycle = parseInt(formData.treatmentCycle);
    if (formData.estimatedDurationDays)
      backendData.estimatedDurationDays = parseInt(
        formData.estimatedDurationDays
      );
    if (formData.estimatedCost)
      backendData.estimatedCost = parseFloat(formData.estimatedCost);
    if (
      formData.treatmentSteps &&
      Array.isArray(formData.treatmentSteps) &&
      formData.treatmentSteps.length > 0
    )
      backendData.treatmentSteps = formData.treatmentSteps.map((step) => ({
        step: step.step || 0,
        name: step.name || "",
        duration: step.duration || "",
        description: step.description || "",
        activities: Array.isArray(step.activities) ? step.activities : [],
      }));
    if (
      formData.medicationPlan &&
      Array.isArray(formData.medicationPlan) &&
      formData.medicationPlan.length > 0
    )
      backendData.medicationPlan = formData.medicationPlan.map((plan) => ({
        phase: plan.phase || "",
        medications: Array.isArray(plan.medications)
          ? plan.medications.map((med) => ({
              name: med.name || "",
              dosage: med.dosage || "",
              frequency: med.frequency || "",
              duration: med.duration || "",
            }))
          : [],
      }));
    if (
      formData.monitoringSchedule &&
      Array.isArray(formData.monitoringSchedule) &&
      formData.monitoringSchedule.length > 0
    )
      backendData.monitoringSchedule = formData.monitoringSchedule.map(
        (schedule) => ({
          day: schedule.day || 0,
          activity: schedule.activity || "",
          type: schedule.type || "",
        })
      );
    if (formData.successProbability)
      backendData.successProbability = parseFloat(formData.successProbability);
    if (formData.riskFactors) backendData.riskFactors = formData.riskFactors;
    if (formData.contraindications)
      backendData.contraindications = formData.contraindications;
    if (formData.startDate)
      backendData.startDate = dayjs(formData.startDate).format(
        "YYYY-MM-DDTHH:mm:ss"
      );
    if (formData.endDate)
      backendData.endDate = dayjs(formData.endDate).format(
        "YYYY-MM-DDTHH:mm:ss"
      );
    if (formData.status) backendData.status = formData.status;
    if (formData.notes) backendData.notes = formData.notes;
    if (formData.templateId) backendData.templateId = formData.templateId;
    return backendData;
  };

  // NEW: Load current phase
  const loadCurrentPhase = useCallback(async () => {
    if (!currentTreatmentPlan?.planId) return;

    try {
      setLoadingCurrentPhase(true);
      console.log(
        "🔄 Loading current phase for treatment plan:",
        currentTreatmentPlan.planId
      );

      const result = await apiTreatmentManagement.getCurrentPhase(
        currentTreatmentPlan.planId
      );
      if (result.success && result.data) {
        setCurrentPhase(result.data);
        console.log("✅ Current phase loaded:", result.data);
      } else {
        setCurrentPhase(null);
        console.log("ℹ️ No current phase found");
      }
    } catch (error) {
      console.error("❌ Error loading current phase:", error);
      setCurrentPhase(null);
    } finally {
      setLoadingCurrentPhase(false);
    }
  }, [currentTreatmentPlan?.planId]);

  // NEW: Load treatment plan phases with detailed info
  const loadTreatmentPlanPhases = useCallback(async () => {
    if (!currentTreatmentPlan?.planId) return;

    try {
      console.log(
        "🔄 Loading treatment plan phases:",
        currentTreatmentPlan.planId
      );

      // Nếu user là bác sĩ, lấy phases qua API mới
      if (user?.role === "DOCTOR" || user?.role?.toUpperCase() === "DOCTOR") {
        const result = await apiTreatmentManagement.getDoctorTreatmentPhases(
          user.id
        );
        if (result.success && result.data) {
          // Lọc phases theo planId của bệnh nhân hiện tại
          const filteredPhases = Array.isArray(result.data)
            ? result.data.filter(
                (phase) => phase.planId === currentTreatmentPlan.planId
              )
            : [];
          setApiPhases(filteredPhases);
          console.log("✅ Doctor phases loaded:", filteredPhases);
        } else {
          setApiPhases([]);
          message.warning("Không có giai đoạn điều trị nào cho bác sĩ.");
        }
        return;
      }

      // Nếu không phải bác sĩ, dùng API cũ
      const result = await apiTreatmentManagement.getTreatmentPlanPhases(
        currentTreatmentPlan.planId
      );
      if (result.success && result.data) {
        setApiPhases(result.data);
        console.log("✅ Treatment plan phases loaded:", result.data);
      } else {
        console.warn("⚠️ No phases found for treatment plan");
        setApiPhases([]);
      }
    } catch (error) {
      console.error("❌ Error loading treatment plan phases:", error);
      setApiPhases([]);
    }
  }, [currentTreatmentPlan?.planId, user]);

  // Load available times for selected date
  const loadAvailableTimes = async (date) => {
    if (!date) return;
    
    // Sử dụng doctorId từ user context hoặc cố định
    const doctorId = user?.userId || user?.id;
    
    if (!doctorId) {
      console.error("❌ No doctor ID available");
      return { success: false, message: "Không tìm thấy thông tin bác sĩ" };
    }
    
    setLoadingAvailableTimes(true);
    try {
      console.log("🔍 Loading available times for doctor:", doctorId, "date:", date.format("YYYY-MM-DD"));
      console.log("🔍 User context:", { user: !!user, userId: user?.userId, role: user?.role });
      
      const result = await getDoctorAvailableTimes(doctorId, date);
      if (result.success) {
        setAvailableTimes(result.data);
        console.log("✅ Loaded available times:", result.data);
      } else {
        message.error("❌ Không thể lấy thời gian rảnh: " + result.message);
        setAvailableTimes([]);
      }
    } catch (error) {
      console.error("❌ Error loading available times:", error);
      setAvailableTimes([]);
    } finally {
      setLoadingAvailableTimes(false);
    }
  };

  // BACKEND SYNC: Load treatment data with proper error handling
  const loadTreatmentData = useCallback(async () => {
    if (loadingPhases) {
      console.log("🔄 [TreatmentScheduleForm] Already loading, skipping...");
      return;
    }

    try {
      setLoadingPhases(true);
      console.log(
        `🔄 [TreatmentScheduleForm] Loading treatment data for patient: ${patientId}`
      );

      // Debug user authentication state
      console.log("🔍 [TreatmentScheduleForm] Current authentication state:", {
        hasUser: !!user,
        userRole: user?.role,
        userId: user?.id,
        userEmail: user?.email,
        localStorage_user: !!localStorage.getItem("user"),
        localStorage_token: !!localStorage.getItem("token"),
      });

      // Check doctor-patient access first (for doctors)
      if (user?.role === "doctor" || user?.role?.toUpperCase() === "DOCTOR") {
        console.log("🔍 [TreatmentScheduleForm] Doctor access check...");
        const accessResult =
          await apiTreatmentManagement.checkDoctorPatientAccess(
            user.id,
            patientId
          );
        if (!accessResult.success) {
          console.error("❌ Doctor access denied:", accessResult.message);
          message.error("Bạn không có quyền truy cập thông tin bệnh nhân này");
          return;
        }
        console.log("✅ Doctor access granted");
      }

      // Load treatment plan
      let treatmentPlanData = null;
      if (treatmentPlan && treatmentPlan.planId) {
        console.log(
          "🔄 [TreatmentScheduleForm] Loading treatment plan from prop..."
        );
        treatmentPlanData = treatmentPlan;
      } else {
        console.log(
          "🔄 [TreatmentScheduleForm] Loading treatment plan from API..."
        );
        // Nếu user là bác sĩ, không gọi getTreatmentPlansByPatient nữa
        if (user?.role === "DOCTOR" || user?.role?.toUpperCase() === "DOCTOR") {
          // Không có API lấy treatment plan theo doctorId, nên bỏ qua bước này
          // hoặc có thể lấy từ props hoặc context khác nếu cần
        } else {
          const planResult =
            await apiTreatmentManagement.getTreatmentPlansByPatient(patientId);
          if (
            planResult.success &&
            planResult.data &&
            planResult.data.length > 0
          ) {
            // Get the most recent active plan
            const activePlans = planResult.data.filter(
              (plan) => plan.status === "active"
            );
            treatmentPlanData =
              activePlans.length > 0 ? activePlans[0] : planResult.data[0];
          }
        }
      }

      if (treatmentPlanData) {
        setCurrentTreatmentPlan(treatmentPlanData);
        console.log("✅ Treatment plan loaded:", treatmentPlanData);
      } else {
        console.log("⚠️ No treatment plan found for patient");
      }

      // Load phases using API phù hợp cho DOCTOR
      if (user?.role === "DOCTOR" || user?.role?.toUpperCase() === "DOCTOR") {
        const phasesResult =
          await apiTreatmentManagement.getDoctorTreatmentPhases(user.id);
        if (phasesResult.success && phasesResult.data) {
          // Lọc phases theo planId của bệnh nhân hiện tại (nếu có)
          const filteredPhases = Array.isArray(phasesResult.data)
            ? phasesResult.data.filter((phase) => phase.patientId === patientId)
            : [];
          setApiPhases(filteredPhases);
          console.log("✅ Doctor phases loaded:", filteredPhases);
        } else {
          setApiPhases([]);
          setPhaseActivities({});
          message.warning("Không có hoạt động nào được tải từ API");
        }
      } else {
        // Sử dụng API cũ cho bệnh nhân
        const phasesResult =
          await apiTreatmentManagement.getActiveTreatmentPlan(patientId);

        console.log("🔍 [TreatmentScheduleForm] Phases result:", phasesResult);

        if (phasesResult.success && phasesResult.data) {
          // Handle different response formats
          let phasesData = [];
          if (Array.isArray(phasesResult.data)) {
            phasesData = phasesResult.data;
          } else if (phasesResult.data.tablePhases) {
            phasesData = phasesResult.data.tablePhases;
          } else if (phasesResult.data.phases) {
            phasesData = phasesResult.data.phases;
          }

          if (phasesData && phasesData.length > 0) {
            setApiPhases(phasesData);
            console.log("✅ Treatment phases loaded:", phasesData);

            // Load activities for each phase
            setLoadingActivities(true);
            const activitiesPromises = phasesData.map(async (phase) => {
              const phaseId = phase.phaseId || phase.planId || phase.id;
              try {
                const activitiesResult =
                  await apiTreatmentManagement.getPhaseActivities(phaseId);
                if (activitiesResult.success && activitiesResult.data) {
                  return {
                    phaseId: phaseId,
                    activities: activitiesResult.data,
                  };
                }
              } catch (error) {
                console.warn(
                  `⚠️ Could not load activities for phase ${phaseId}:`,
                  error
                );
              }
              return { phaseId: phaseId, activities: [] };
            });

            const activitiesResults = await Promise.all(activitiesPromises);
            const newPhaseActivities = {};
            activitiesResults.forEach(({ phaseId, activities }) => {
              newPhaseActivities[phaseId] = activities;
            });

            setPhaseActivities(newPhaseActivities);
            setLoadingActivities(false);

            console.log("✅ Phase activities loaded:", newPhaseActivities);
          } else {
            message.warning("⚠️ Không có hoạt động nào được tải từ API");
          }
        } else {
          console.error("Failed to load phases:", phasesResult.message);
          message.error("Không thể tải thông tin giai đoạn điều trị");
          setApiPhases([]);
          setPhaseActivities({});
        }
      }

      setInitialDataLoaded(true);
    } catch (error) {
      console.error("Error loading treatment data:", error);
      message.error("Lỗi khi tải thông tin điều trị");
    } finally {
      setLoadingPhases(false);
    }
  }, [patientId, user, treatmentPlan, initialDataLoaded]);

  // Load detailed phases and current phase when treatment plan is available
  useEffect(() => {
    if (currentTreatmentPlan?.planId) {
      console.log(
        "🔄 Loading detailed phases for treatment plan:",
        currentTreatmentPlan.planId
      );
      Promise.all([loadTreatmentPlanPhases(), loadCurrentPhase()]).catch(
        (error) => {
          console.error("❌ Error loading detailed phase data:", error);
        }
      );
    }
  }, [currentTreatmentPlan?.planId, loadTreatmentPlanPhases, loadCurrentPhase]);

  // Load phases and treatment plan when component mounts or key props change
  useEffect(() => {
    console.log(
      `🔄 [TreatmentScheduleForm] Component mounted/updated for patient: ${patientId}`
    );
    console.log(`🔍 [TreatmentScheduleForm] Props state:`, {
      hasPatientId: !!patientId,
      hasPatientInfo: !!patientInfo,
      hasTreatmentPlan: !!treatmentPlan,
      hasExaminationData: !!examinationData,
      isEditing: !!isEditing,
      initialDataLoaded: initialDataLoaded,
      loadingPhases: loadingPhases,
    });

    // Tự động tải dữ liệu ngay khi có patientId và chưa tải lần đầu
    if (patientId && !initialDataLoaded && !loadingPhases) {
      console.log(
        "🚀 [TreatmentScheduleForm] Auto-loading treatment data for first time..."
      );
      // Sử dụng setTimeout để tránh race condition
      setTimeout(() => {
        if (!initialDataLoaded && !loadingPhases) {
          loadTreatmentData();
        }
      }, 100);
    }
  }, [patientId, initialDataLoaded, loadingPhases, loadTreatmentData]);

  // Auto-import phases from treatment plan when available
  useEffect(() => {
    const autoImportPhases = async () => {
      if (
        treatmentPlan?.finalPlan?.phases &&
        apiPhases.length === 0 &&
        !loadingPhases &&
        currentTreatmentPlan &&
        !autoImporting
      ) {
        try {
          setAutoImporting(true);
          console.log(
            "🔄 [TreatmentScheduleForm] Auto-importing phases from treatment plan..."
          );

          const templatePhases = treatmentPlan.finalPlan.phases;
          let importedCount = 0;

          const treatmentType =
            currentTreatmentPlan?.treatmentType ||
            treatmentPlan?.treatmentType ||
            "IUI";

          const meaningfulPhaseNames = getMeaningfulPhaseNames(treatmentType);

          for (let i = 0; i < templatePhases.length; i++) {
            const phase = templatePhases[i];

            const phaseData = {
              planId: currentTreatmentPlan.planId,
              patientId: patientId,
              phaseName:
                meaningfulPhaseNames[i + 1] ||
                phase.name ||
                `Giai đoạn ${treatmentType} ${i + 1}`,
              description:
                phase.description ||
                `Giai đoạn ${i + 1}: ${
                  meaningfulPhaseNames[i + 1] || phase.name
                }`,
              phaseOrder: i + 1,
              expectedDuration: phase.duration || "5-7 ngày",
              status: "Pending",
              startDate: null,
              endDate: null,
            };

            const result = await createTreatmentPhase(phaseData);
            if (result.success) {
              importedCount++;
            }
          }

          if (importedCount > 0) {
            message.success(
              `✅ Đã import ${importedCount} giai đoạn từ phác đồ điều trị`
            );
            // Reload phases to get the newly created ones
            await loadTreatmentData();
          }
        } catch (error) {
          console.error("Error auto-importing phases:", error);
          message.error("❌ Không thể tự động import giai đoạn từ phác đồ");
        } finally {
          setAutoImporting(false);
        }
      }
    };

    autoImportPhases();
  }, [
    treatmentPlan,
    apiPhases,
    currentTreatmentPlan,
    autoImporting,
    patientId,
    loadTreatmentData,
  ]);

  // Enhanced function to load existing schedule - FIX: Remove problematic dependencies
  const loadExistingSchedule = useCallback(async () => {
    try {
      if (existingSchedule && isEditing) {
        setGeneratedSchedule(existingSchedule.sessions || []);
        setTemplate(existingSchedule.template);
        setDoctorNotes(existingSchedule.doctorNotes || "");
        setCustomSessions(existingSchedule.customSessions || []);
        setScheduleAdjustments(existingSchedule.adjustments || {});
        setScheduleData(existingSchedule);

        form.setFieldsValue({
          startDate: dayjs(existingSchedule.startDate),
          preferredTime: existingSchedule.preferredTime ? dayjs(existingSchedule.preferredTime, "HH:mm") : null,
        });

        console.log("✅ Existing schedule loaded for editing");
        return;
      }

      // Load template and generate schedule from treatment plan
      let templateData = null;

      // Priority 1: Use currentTreatmentPlan from API
      if (currentTreatmentPlan && apiPhases && apiPhases.length > 0) {
        console.log(
          "🔄 [TreatmentScheduleForm] Creating template from currentTreatmentPlan and apiPhases"
        );

        // BACKEND SYNC: Create template with proper structure
        templateData = {
          name: currentTreatmentPlan.planName || "Phác đồ điều trị",
          type: currentTreatmentPlan.treatmentType || "IUI",
          estimatedDuration:
            currentTreatmentPlan.estimatedDurationDays || "N/A",
          cost: currentTreatmentPlan.estimatedCost || 0,
          successRate: currentTreatmentPlan.successProbability || "N/A",
          phases: apiPhases.map((phase, idx) => {
            // BACKEND FIX: Bây giờ phaseId là UUID, phaseName là tên thật
            const phaseId = phase.phaseId || phase.planId || phase.id;
            const phaseActivities_current = phaseActivities[phaseId] || [];

            console.log(
              `🔍 Phase UUID ${phaseId} activities:`,
              phaseActivities_current
            );

            // Thông báo nếu không có activities
            if (phaseActivities_current.length === 0) {
              console.warn(`⚠️ Phase UUID ${phaseId} không có hoạt động nào`);
            }

            // Sử dụng tên thật từ API hoặc tạo tên có nghĩa
            const displayName =
              phase.phaseName ||
              generateMeaningfulPhaseName(
                phase,
                idx,
                currentTreatmentPlan?.treatmentType || "IUI"
              );

            return {
              ...phase,
              activities: phaseActivities_current,
              phaseName: displayName, // Tên thật từ API hoặc tên có nghĩa
              phaseId: phaseId, // UUID để tìm activities
              expectedDuration: phase.expectedDuration || "",
            };
          }),
        };
      }
      // Priority 2: Use treatmentPlan prop if available
      else if (
        treatmentPlan?.treatmentSteps &&
        treatmentPlan.treatmentSteps.length > 0
      ) {
        console.log(
          "🔄 [TreatmentScheduleForm] Creating template from treatmentPlan prop"
        );

        // BACKEND SYNC: Map treatmentSteps properly
        templateData = {
          name: treatmentPlan.planName || "Phác đồ từ backend",
          type: treatmentPlan.treatmentType || "IUI",
          estimatedDuration: treatmentPlan.estimatedDurationDays || "N/A",
          cost: treatmentPlan.estimatedCost || 0,
          successRate: treatmentPlan.successProbability || "N/A",
          phases: treatmentPlan.treatmentSteps.map((step, idx) => ({
            phaseName: `phase_${idx + 1}`,
            phaseName: step.name || `Giai đoạn ${idx + 1}`,
            expectedDuration: step.duration || "",
            description: step.description || "",
            phaseOrder: step.step || idx + 1,
            activities: Array.isArray(step.activities)
              ? step.activities.map((act, actIdx) =>
                  typeof act === "string"
                    ? {
                        name: act,
                        day: actIdx + 1,
                        type: "consultation",
                        duration: 30,
                        room: "Phòng khám",
                        required: true,
                      }
                    : act
                )
              : [],
          })),
        };
      } else if (treatmentPlan?.finalPlan?.phases) {
        console.log(
          "🔄 [TreatmentScheduleForm] Creating template from treatmentPlan.finalPlan"
        );
        templateData = treatmentPlan.finalPlan;
      } else {
        // Fallback: map from apiPhases only
        console.log(
          "🔄 [TreatmentScheduleForm] Creating template from apiPhases only"
        );
        templateData = {
          name: "Phác đồ điều trị",
          type: currentTreatmentPlan?.treatmentType || "IUI",
          phases: apiPhases.map((phase, idx) => {
            // BACKEND FIX: Bây giờ phaseId là UUID, phaseName là tên thật
            const phaseId = phase.phaseId || phase.planId || phase.id;
            const phaseActivities_current = phaseActivities[phaseId] || [];

            console.log(
              `🔍 Fallback phase UUID ${phaseId} activities:`,
              phaseActivities_current
            );

            // Thông báo nếu không có activities
            if (phaseActivities_current.length === 0) {
              console.warn(
                `⚠️ Fallback phase UUID ${phaseId} không có hoạt động nào`
              );
            }

            // Sử dụng tên thật từ API hoặc tạo tên có nghĩa
            const displayName =
              phase.phaseName ||
              generateMeaningfulPhaseName(
                phase,
                idx,
                currentTreatmentPlan?.treatmentType || "IUI"
              );

            return {
              ...phase,
              activities: phaseActivities_current,
              phaseName: displayName, // Tên thật từ API hoặc tên có nghĩa
              phaseId: phaseId, // UUID để tìm activities
              expectedDuration: phase.expectedDuration || "",
            };
          }),
        };
      }

      if (templateData) {
        setTemplate(templateData);
        const defaultStartDate =
          currentTreatmentPlan?.startDate ||
          treatmentPlan?.estimatedStartDate ||
          treatmentPlan?.startDate ||
          dayjs().add(3, "days").format("YYYY-MM-DD");

        // KHÔNG gọi generateScheduleFromTemplate ở đây nữa
        // setGeneratedSchedule(schedule); // BỎ

        form.setFieldsValue({
          startDate: dayjs(defaultStartDate),
          preferredTime: null, // Để user chọn từ available times
        });

        console.log("✅ Template loaded, chờ bác sĩ chủ động sinh lịch");
      }
    } catch (error) {
      console.error("Error loading existing schedule:", error);
      message.error("Lỗi khi tải lịch điều trị");
    }
  }, [
    existingSchedule,
    isEditing,
    currentTreatmentPlan,
    apiPhases,
    phaseActivities,
    treatmentPlan,
    form,
  ]);

  // FIX: Load existing schedule when component mounts - Remove problematic dependencies
  useEffect(() => {
    if (initialDataLoaded && (currentTreatmentPlan || template)) {
      loadExistingSchedule();
    }
  }, [
    initialDataLoaded,
    currentTreatmentPlan?.planId,
    template?.name,
    loadExistingSchedule,
  ]);

  // BACKEND SYNC: Save schedule to API with proper validation
  const saveScheduleToAPI = async (scheduleData) => {
    try {
      setSavingSchedule(true);
      console.log("🔄 Saving schedule to API:", scheduleData);

      // Validate schedule data before sending to API
      const validation = validateTreatmentPlanData(scheduleData);
      if (!validation.isValid) {
        throw new Error(
          `Dữ liệu lịch điều trị không hợp lệ: ${validation.errors.join(", ")}`
        );
      }

      // Format data for backend
      const formattedData = formatDataForBackend(scheduleData);
      console.log("🔄 Formatted data for backend:", formattedData);

      let result;
      if (isEditing && scheduleData.id) {
        // Update existing schedule
        result = await apiTreatmentManagement.updateTreatmentSchedule(
          scheduleData.id,
          formattedData
        );
      } else {
        // Create new schedule
        result = await apiTreatmentManagement.saveTreatmentSchedule(
          formattedData
        );
      }

      if (result.success) {
        // Also update treatment state manager for local caching
        treatmentStateManager.updateSchedule(patientId, result.data);
        console.log("✅ Schedule saved successfully to API and local cache");
        return result;
      } else {
        throw new Error(result.message || "Không thể lưu lịch điều trị");
      }
    } catch (error) {
      console.error("❌ Error saving schedule:", error);
      return { success: false, message: error.message };
    } finally {
      setSavingSchedule(false);
    }
  };

  // Get meaningful phase names based on treatment type
  const getMeaningfulPhaseNames = (treatmentType) => {
    const phaseNames = {
      IUI: {
        1: "Chuẩn bị chu kỳ",
        2: "Kích thích buồng trứng",
        3: "Theo dõi phát triển nang",
        4: "Gây phóng trứng",
        5: "Thụ tinh nhân tạo",
        6: "Theo dõi sau IUI",
      },
      IVF: {
        1: "Chuẩn bị chu kỳ",
        2: "Kích thích buồng trứng",
        3: "Theo dõi phát triển nang",
        4: "Gây phóng trứng",
        5: "Chọc hút trứng",
        6: "Thụ tinh trong ống nghiệm",
        7: "Nuôi cấy phôi",
        8: "Chuyển phôi",
        9: "Theo dõi sau chuyển phôi",
      },
      ICSI: {
        1: "Chuẩn bị chu kỳ",
        2: "Kích thích buồng trứng",
        3: "Theo dõi phát triển nang",
        4: "Gây phóng trứng",
        5: "Chọc hút trứng",
        6: "Tiêm tinh trùng vào trứng",
        7: "Nuôi cấy phôi",
        8: "Chuyển phôi",
        9: "Theo dõi sau chuyển phôi",
      },
    };
    return phaseNames[treatmentType] || {};
  };

  // Generate meaningful phase name (fallback khi API không có phaseName)
  const generateMeaningfulPhaseName = (phase, index, treatmentType) => {
    const meaningfulNames = getMeaningfulPhaseNames(treatmentType);

    // BACKEND FIX: Bây giờ phase.phaseName là tên thật từ DB
    // Chỉ cần fallback khi không có phaseName
    if (phase.phaseName && phase.phaseName.trim() !== "") {
      return phase.phaseName;
    }

    // Nếu có description, sử dụng nó
    if (phase.description && phase.description.trim() !== "") {
      return phase.description;
    }

    // Tạo tên có nghĩa dựa trên treatmentType và index
    const meaningfulName = meaningfulNames[index + 1];
    if (meaningfulName) {
      return meaningfulName;
    }

    // Fallback cuối cùng
    return `Giai đoạn ${index + 1}`;
  };

  // BACKEND SYNC: Create treatment phase with proper structure
  const createTreatmentPhase = async (phaseData) => {
    try {
      const result = await apiTreatmentManagement.createTreatmentPhase(
        phaseData
      );
      if (result.success) {
        console.log("✅ Treatment phase created:", result.data);
        return result;
      } else {
        console.error("❌ Failed to create treatment phase:", result.message);
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error("❌ Error creating treatment phase:", error);
      return { success: false, message: error.message };
    }
  };

  // Get available times for doctor
  const getDoctorAvailableTimes = async (doctorId, date) => {
    try {

      
      console.log("🔍 Calling API with:", { doctorId, date: date?.format("YYYY-MM-DD") });
      const response = await axiosClient.get(`/api/service-request/doctor-available-times/${doctorId}`, {
        params: { date: date?.format("YYYY-MM-DD") }
      });
      console.log("✅ Available times for doctor:", response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("❌ Failed to get available times:", error);
      console.error("❌ Error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      return { 
        success: false, 
        message: error.response?.data?.message || error.message || "Không thể lấy thời gian rảnh"
      };
    }
  };

  // Create appointment for current phase
  const createPhaseAppointment = async (phase, scheduleData) => {
    try {
      // Lấy doctorId từ user context
      const doctorId = user?.userId || user?.id;
      
      if (!doctorId) {
        console.error("❌ No doctor ID available");
        return { success: false, message: "Không tìm thấy thông tin bác sĩ" };
      }

      // Lấy available times trước
      const availableDate = selectedDate || scheduleData.startDate;
      const selectedDateStr = dayjs(availableDate).format("YYYY-MM-DD");
      console.log("🔍 [createPhaseAppointment] Getting available times for:", selectedDateStr);
      
      const availableTimesResult = await getDoctorAvailableTimes(doctorId, dayjs(selectedDateStr));
      
      if (!availableTimesResult.success) {
        return { 
          success: false, 
          message: availableTimesResult.message || "Không thể lấy thời gian khả dụng" 
        };
      }
      
      const availableTimes = availableTimesResult.data;
      
      if (!availableTimes || availableTimes.length === 0) {
        return { 
          success: false, 
          message: "Không có thời gian khả dụng cho bác sĩ vào ngày này" 
        };
      }

      // Chọn thời gian đầu tiên có sẵn
      const firstAvailableTime = availableTimes[0];
      const scheduledDateTime = firstAvailableTime.dateTime || `${selectedDateStr}T${firstAvailableTime.time}`;
      const roomId = firstAvailableTime.room || "Phòng khám";
      
      console.log("🔍 [createPhaseAppointment] Selected time:", {
        firstAvailableTime,
        scheduledDateTime,
        roomId
      });

      // Lấy planId từ các nguồn khác nhau
      console.log("🔍 [createPhaseAppointment] Debug plan ID sources:", {
        currentTreatmentPlanPlanId: currentTreatmentPlan?.planId,
        scheduleDataPlanId: scheduleData.planId,
        treatmentPlanPlanId: treatmentPlan?.planId,
        phasePlanId: phase?.planId,
        currentTreatmentPlan: currentTreatmentPlan,
        scheduleData: scheduleData,
        treatmentPlan: treatmentPlan,
        phase: phase
      });
      
      let planId = currentTreatmentPlan?.planId || scheduleData.planId || treatmentPlan?.planId || phase?.planId;
      
      // Fallback: Sử dụng phase.phaseId nếu không có plan ID
      if (!planId && phase?.phaseId) {
        console.log("🔄 Using phase.phaseId as fallback plan ID:", phase.phaseId);
        planId = phase.phaseId;
      }
      
      if (!planId) {
        console.error("❌ No plan ID available");
        console.error("❌ Debug info:", {
          currentTreatmentPlan: currentTreatmentPlan,
          scheduleData: scheduleData,
          treatmentPlan: treatmentPlan,
          phase: phase,
          apiPhases: apiPhases
        });
        return { success: false, message: "Không tìm thấy thông tin phác đồ điều trị" };
      }
      
      console.log("🔍 Creating appointment with:", {
        planId,
        doctorId,
        user: user,
        currentTreatmentPlan: currentTreatmentPlan
      });
      
      const appointmentData = {
        planId: planId,
        phaseId: phase.phaseId,
        stepNumber: phase.phaseOrder || 1,
        stepName: phase.phaseName || "Giai đoạn điều trị",
        doctorId: doctorId,
        patientId: patientId,
        scheduledDate: scheduledDateTime,
        roomId: roomId,
        notes: scheduleData.notes || `Lịch hẹn cho ${phase.phaseName}`,
        treatmentType: currentTreatmentPlan?.treatmentType || "IUI",
        deadline: dayjs(scheduledDateTime).add(1, 'day').format("YYYY-MM-DDTHH:mm:ss"),
        gracePeriodDays: 0
      };

      console.log("🔄 Creating phase appointment:", appointmentData);

      // Gọi API tạo lịch hẹn
      try {
        const scheduleRequest = {
          planId: appointmentData.planId,
          phaseId: appointmentData.phaseId,
          stepNumber: appointmentData.stepNumber,
          stepName: appointmentData.stepName,
          doctorId: appointmentData.doctorId,
          patientId: appointmentData.patientId,
          scheduledDate: appointmentData.scheduledDate,
          roomId: appointmentData.roomId,
          notes: appointmentData.notes,
          treatmentType: appointmentData.treatmentType,
          deadline: appointmentData.deadline,
          gracePeriodDays: appointmentData.gracePeriodDays
        };

        console.log("🔄 Sending treatment schedule request:", scheduleRequest);
        const response = await axiosClient.post('/api/treatment-schedule', scheduleRequest);
        console.log("✅ Phase appointment created:", response.data);
        return { success: true, data: response.data };
      } catch (error) {
        console.error("❌ Failed to create phase appointment:", error);
        
        let errorMessage = "Không thể tạo lịch hẹn";
        
        if (error.response?.status === 400) {
          const responseData = error.response.data;
          if (typeof responseData === 'string') {
            errorMessage = responseData;
          } else if (responseData?.message) {
            errorMessage = responseData.message;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        return { 
          success: false, 
          message: errorMessage
        };
      }
    } catch (error) {
      console.error("❌ Error creating phase appointment:", error);
      return { success: false, message: error.message };
    }
  };

  // BACKEND SYNC: Handle form submission with proper validation
  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      // BACKEND SYNC: Prepare data in backend format
      const scheduleData = {
        // Basic required fields
        patientId: patientId,
        planName: values.planName || template?.name || "Lịch điều trị",
        treatmentType: currentTreatmentPlan?.treatmentType || "IUI",
        planId: currentTreatmentPlan?.planId || treatmentPlan?.planId, // Thêm planId vào scheduleData

        // Schedule
        startDate: values.startDate?.format("YYYY-MM-DDTHH:mm:ss"),
        endDate: values.endDate?.format("YYYY-MM-DDTHH:mm:ss"),

        // Status
        status: isEditing ? "active" : "draft",

        // Treatment steps - map from generated schedule
        treatmentSteps: generatedSchedule.map((session, index) => ({
          step: index + 1,
          name: session.activity || session.phaseName || `Bước ${index + 1}`,
          duration: session.duration ? `${session.duration} phút` : "30 phút",
          description: session.notes || "",
          activities: session.activities || [
            session.activity || "Hoạt động chính",
          ],
        })),

        // Medication plan - from form or template
        medicationPlan: values.medicationPlan || template?.medicationPlan || [],

        // Monitoring schedule - from form or template
        monitoringSchedule:
          values.monitoringSchedule || template?.monitoringSchedule || [],

        notes: doctorNotes,
        templateId: template?.id || currentTreatmentPlan?.templateId,

        // Metadata
        sessions: generatedSchedule,
        totalSessions: generatedSchedule.length,
        template: template,
        doctorNotes: doctorNotes,
        customSessions: customSessions,
        adjustments: scheduleAdjustments,
        preferredTime: values.preferredTime?.format("HH:mm"),
        subStepsData: subStepsData,
        createdAt: isEditing
          ? existingSchedule?.createdAt
          : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        modificationCount:
          (existingSchedule?.modificationCount || 0) + (isEditing ? 1 : 0),
      };

      console.log("✅ Submitting schedule data:", scheduleData);

      // Validate required fields
      if (!scheduleData.sessions || scheduleData.sessions.length === 0) {
        // Nếu không có sessions, tạo session từ current phase
        if (apiPhases && apiPhases.length > 0) {
          const currentPhase = apiPhases.find(p => p.status === "In Progress") || apiPhases[0];
          if (currentPhase) {
            const defaultSession = {
              id: `session_${Date.now()}`,
              phaseId: currentPhase.phaseId,
              phaseName: currentPhase.phaseName || "Giai đoạn điều trị",
              activity: currentPhase.phaseName || "Khám điều trị",
              date: values.startDate?.format("YYYY-MM-DD") || dayjs().format("YYYY-MM-DD"),
              time: values.preferredTime?.format("HH:mm") || "10:00", // Fallback time nếu không có preferred time
              duration: 60,
              room: "Phòng khám",
              notes: `Lịch hẹn cho ${currentPhase.phaseName}`,
              status: "scheduled",
              required: true,
              activities: [currentPhase.phaseName || "Khám điều trị"]
            };
            scheduleData.sessions = [defaultSession];
            scheduleData.totalSessions = 1;
            console.log("✅ Created default session from current phase:", defaultSession);
          } else {
            throw new Error("Không tìm thấy giai đoạn điều trị để tạo lịch");
          }
        } else {
          throw new Error("Lịch điều trị không được để trống");
        }
      }

      // Save to API
      const saveResult = await saveScheduleToAPI(scheduleData);

      if (saveResult.success) {
        message.success("✅ Lưu lịch điều trị thành công!");

        // Tạo appointment cho current phase nếu có
        if (apiPhases && apiPhases.length > 0) {
          const currentPhase = apiPhases.find(p => p.status === "In Progress") || apiPhases[0];
          if (currentPhase) {
            const appointmentResult = await createPhaseAppointment(currentPhase, scheduleData);
            if (appointmentResult.success) {
              message.success("✅ Đã tạo lịch hẹn cho giai đoạn hiện tại!");
            } else {
              message.warning("⚠️ Lưu lịch thành công nhưng không thể tạo lịch hẹn: " + appointmentResult.message);
            }
          }
        }

        // Update local state
        setScheduleData(saveResult.data);

        // Call onNext callback if provided
        if (onNext) {
          onNext(saveResult.data);
        }

        console.log("✅ Schedule submission completed successfully");
      } else {
        throw new Error(saveResult.message || "Không thể lưu lịch điều trị");
      }
    } catch (error) {
      console.error("❌ Error submitting schedule:", error);
      message.error(`❌ Lỗi khi lưu lịch điều trị: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Get status display name
  const getStatusDisplayName = (status) => {
    const statusMap = {
      Pending: "Chờ thực hiện",
      "In Progress": "Đang thực hiện",
      Completed: "Hoàn thành",
      Cancelled: "Đã hủy",
      "On Hold": "Tạm dừng",
      draft: "Nháp",
      active: "Đang hoạt động",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
    };
    return statusMap[status] || status;
  };

  // Get status color
  const getStatusColor = (status) => {
    const colorMap = {
      Pending: "orange",
      "In Progress": "blue",
      Completed: "green",
      Cancelled: "red",
      "On Hold": "yellow",
      draft: "gray",
      active: "blue",
      completed: "green",
      cancelled: "red",
    };
    return colorMap[status] || "default";
  };

  // Get status icon
  const getStatusIcon = (status) => {
    const iconMap = {
      Pending: <ClockCircleOutlined />,
      "In Progress": <PlayCircleOutlined />,
      Completed: <CheckCircleOutlined />,
      Cancelled: <ExclamationCircleOutlined />,
      "On Hold": <PauseCircleOutlined />,
      draft: <EditOutlined />,
      active: <PlayCircleOutlined />,
      completed: <CheckCircleOutlined />,
      cancelled: <ExclamationCircleOutlined />,
    };
    return iconMap[status] || <ClockCircleOutlined />;
  };

  // 🆕 Function để kiểm tra form validation
  const isFormValid = () => {
    return formValues.startDate && 
           formValues.preferredTime && 
           formValues.scheduleName && 
           formValues.scheduleName.trim() !== "";
  };

  // 🆕 Kiểm tra xem treatment plan có bị disable không
  const isTreatmentPlanDisabled = () => {
    return currentTreatmentPlan && (
      currentTreatmentPlan.status === "completed" || 
      currentTreatmentPlan.status === "cancelled"
    );
  };

  // 🆕 Kiểm tra xem có thể tạo lịch điều trị không
  const canCreateSchedule = () => {
    return isFormValid() && !isTreatmentPlanDisabled();
  };

  // 🆕 Function để cập nhật form values
  const updateFormValues = (field, value) => {
    setFormValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 🆕 Function để reset form về trạng thái ban đầu
  const handleResetForm = () => {
    // Reset form về initial values
    form.resetFields();
    
    // 🆕 Set lại form fields về giá trị ban đầu
    form.setFieldsValue(initialFormValues);
    
    // Reset formValues về trạng thái ban đầu
    setFormValues(initialFormValues);
    
    // Reset các state liên quan đến form
    setSelectedDate(initialFormValues.startDate);
    setAvailableTimes([]);
    setDoctorNotes("");
    setCustomSessions([]);
    setScheduleAdjustments({});
    setGeneratedSchedule([]);
  };

  const handleStartDateChange = (date) => {
    setSelectedDate(date);
    updateFormValues('startDate', date);
    if (date) {
      loadAvailableTimes(date);
    } else {
      setAvailableTimes([]);
    }
  };

  // Doctor customization functions
  const handleEditSession = (session) => {
    setEditingSession(session);
    sessionForm.setFieldsValue({
      activity: session.activity,
      date: dayjs(session.date),
      duration: session.duration,
      room: session.room,
      type: session.type,
      required: session.required,
    });
    setSessionModal(true);
  };

  const handleSaveSession = async (values) => {
    try {
      const updatedSession = {
        ...editingSession,
        activity: values.activity,
        date: values.date.format("YYYY-MM-DD"),
        duration: values.duration,
        room: values.room,
        type: values.type,
        required: values.required,
        modified: true,
      };

      setGeneratedSchedule((prev) =>
        prev.map((session) =>
          session.id === editingSession.id ? updatedSession : session
        )
      );

      setScheduleAdjustments((prev) => ({
        ...prev,
        [editingSession.id]: {
          originalActivity: editingSession.activity,
          newActivity: values.activity,
          reason: values.reason || "Điều chỉnh của bác sĩ",
          modifiedAt: new Date().toISOString(),
        },
      }));

      message.success("Đã cập nhật buổi điều trị");
      setSessionModal(false);
      setEditingSession(null);
    } catch (error) {
      message.error("Có lỗi khi cập nhật buổi điều trị");
    }
  };

  const handleAddCustomSession = () => {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substr(2, 9);
    const uniqueId = `custom_${timestamp}_${randomSuffix}`;
    const newSession = {
      id: uniqueId,
      phaseName: "custom",
      phaseName: "Tùy chỉnh bác sĩ",
      date: dayjs().add(1, "day").format("YYYY-MM-DD"),
      activity: "",
      type: "consultation",
      duration: 30,
      room: "Phòng khám",
      required: true,
      completed: false,
      phaseOrder: 999,
      custom: true,
    };

    setEditingSession(newSession);
    sessionForm.setFieldsValue({
      activity: "",
      date: dayjs().add(1, "day"),
      duration: 30,
      room: "Phòng khám",
      type: "consultation",
      required: true,
    });
    setSessionModal(true);
  };

  // Activity management functions
  const handleSaveActivity = async (values) => {
    try {
      const activityData = {
        ...editingActivity,
        ...values,
        phaseName: editingActivity.phaseName,
        scheduledDate: values.scheduledDate?.format("YYYY-MM-DDTHH:mm:ss"),
      };

      // Update local state
      setPhaseActivities((prev) => ({
        ...prev,
        [editingActivity.phaseName]: prev[editingActivity.phaseName]?.map(
          (act) => (act.id === editingActivity.id ? activityData : act)
        ) || [activityData],
      }));

      message.success("Đã cập nhật hoạt động");
      setActivityModal(false);
      setEditingActivity(null);
    } catch (error) {
      console.error("Error saving activity:", error);
      message.error("Có lỗi khi lưu hoạt động");
    }
  };

  // NEW: Update phase status
  const updatePhaseStatus = async (phaseId, statusData) => {
    console.log("🔍 [updatePhaseStatus] Debug info:", {
      currentTreatmentPlan,
      planId: currentTreatmentPlan?.planId,
      treatmentPlan,
      treatmentPlanPlanId: treatmentPlan?.planId,
      apiPhases,
      phaseId,
      statusData
    });

    // Tìm planId từ nhiều nguồn khác nhau
    let planId = currentTreatmentPlan?.planId || treatmentPlan?.planId;
    
    // Nếu không có planId, tìm từ phase trong apiPhases
    if (!planId && apiPhases && apiPhases.length > 0) {
      const phase = apiPhases.find(p => p.phaseId === phaseId);
      if (phase && phase.planId) {
        planId = phase.planId;
        console.log("✅ [updatePhaseStatus] Found planId from phase:", planId);
      }
    }
    
    if (!planId) {
      console.error("❌ [updatePhaseStatus] No plan ID found from any source");
      message.error("Không tìm thấy kế hoạch điều trị");
      return { success: false, message: "Không tìm thấy kế hoạch điều trị" };
    }

    console.log("✅ [updatePhaseStatus] Using planId:", planId);

    try {
      setUpdatingPhaseStatus(true);
      console.log("🔄 Updating phase status:", phaseId, statusData);

      const result = await apiTreatmentManagement.updatePhaseStatus(
        planId,
        phaseId,
        statusData
      );

      // Kiểm tra result có tồn tại không
      if (!result) {
        throw new Error("Không nhận được phản hồi từ server");
      }

      if (result.success) {
        message.success("✅ Cập nhật trạng thái phase thành công");

        // Reload phases and current phase
        if (currentTreatmentPlan?.planId) {
          await Promise.all([loadTreatmentPlanPhases(), loadCurrentPhase()]);
        }

        return result;
      } else {
        throw new Error(
          result.message || "Không thể cập nhật trạng thái phase"
        );
      }
    } catch (error) {
      console.error("❌ Error updating phase status:", error);
      message.error(`❌ Lỗi: ${error.message}`);
      return { success: false, message: error.message };
    } finally {
      setUpdatingPhaseStatus(false);
    }
  };

  // NEW: Handle phase status update
  const handlePhaseStatusUpdate = (phase) => {
    setEditingPhaseStatus(phase);
    phaseStatusForm.setFieldsValue({
      status: phase.status,
      notes: phase.notes || "",
    });
    setPhaseStatusModal(true);
  };

  // NEW: Save phase status
  const handleSavePhaseStatus = async (values) => {
    if (!editingPhaseStatus) return;

    const statusData = {
      status: values.status,
      notes: values.notes || "",
    };

    const result = await updatePhaseStatus(
      editingPhaseStatus.phaseId,
      statusData
    );

    // Kiểm tra result có tồn tại và có success property không
    if (result && result.success) {
      setPhaseStatusModal(false);
      setEditingPhaseStatus(null);
      phaseStatusForm.resetFields();
    } else {
      // Hiển thị lỗi nếu có
      const errorMessage = result?.message || "Không thể cập nhật trạng thái phase";
      message.error(`❌ ${errorMessage}`);
    }
  };

  // Render loading state
  if (loadingPhases || loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
        <p style={{ marginTop: "16px" }}>Đang tải dữ liệu điều trị...</p>
      </div>
    );
  }

  return (
    <div className="treatment-schedule-form">
      <Card
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <CalendarOutlined />
            <span>
              {isEditing ? "Chỉnh sửa lịch điều trị" : "Tạo lịch điều trị"}
            </span>
          </div>
        }
        extra={
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadTreatmentData}
              loading={loadingPhases}
              className="action-btn reload-btn"
            >
              Tải lại
            </Button>
            {currentTreatmentPlan && (
              <Tag color="blue">
                {currentTreatmentPlan.treatmentType} - Chu kỳ{" "}
                {currentTreatmentPlan.treatmentCycle || 1}
              </Tag>
            )}
          </Space>
        }
      >
        {/* 🆕 Alert khi treatment plan đã completed hoặc cancelled */}
        {isTreatmentPlanDisabled() && (
          <div style={{ 
            marginBottom: 16, 
            padding: 12, 
            backgroundColor: currentTreatmentPlan?.status === "completed" ? "#f6ffed" : "#fff2e8",
            border: `1px solid ${currentTreatmentPlan?.status === "completed" ? "#b7eb8f" : "#ffbb96"}`,
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            gap: 8
          }}>
            <InfoCircleOutlined style={{ 
              color: currentTreatmentPlan?.status === "completed" ? "#52c41a" : "#fa8c16",
              fontSize: 16
            }} />
            <span style={{ 
              color: currentTreatmentPlan?.status === "completed" ? "#52c41a" : "#fa8c16",
              fontWeight: 500
            }}>
              Phác đồ điều trị đã {currentTreatmentPlan?.status === "completed" ? "hoàn thành" : "hủy"}. 
              Không thể tạo lịch điều trị cho phác đồ ở trạng thái này.
            </span>
          </div>
        )}

        {/* Current Phase Card */}
        {currentPhase && (
          <Card
            size="small"
            title={
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <PlayCircleOutlined style={{ color: "#1890ff" }} />
                <span>Giai đoạn hiện tại</span>
              </div>
            }
            style={{ marginBottom: 16 }}
            extra={
              <Space>
                <Button
                  type="primary"
                  size="small"
                  className="action-btn submit-btn"
                  onClick={async () => {
                    const currentPhase = apiPhases.find(p => p.status === "In Progress") || apiPhases[0];
                    if (currentPhase) {
                      const scheduleData = {
                        startDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
                        notes: `Lịch hẹn cho ${currentPhase.phaseName}`
                      };
                      const result = await createPhaseAppointment(currentPhase, scheduleData);
                      if (result.success) {
                        message.success("✅ Đã tạo lịch hẹn cho giai đoạn hiện tại!");
                      } else {
                        message.error("❌ Không thể tạo lịch hẹn: " + result.message);
                      }
                    }
                  }}
                >
                  Tạo lịch hẹn
                </Button>
                <Button
                  size="small"
                  className="action-btn secondary-btn"
                  onClick={() => handlePhaseStatusUpdate(currentPhase)}
                  loading={updatingPhaseStatus}
                >
                  Cập nhật trạng thái
                </Button>
              </Space>
            }
          >
            <Descriptions column={2} size="small">
              <Descriptions.Item label="Tên giai đoạn">
                {currentPhase.phaseName || "Không xác định"}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={getStatusColor(currentPhase.status)}>
                  {getStatusIcon(currentPhase.status)}
                  {getStatusDisplayName(currentPhase.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả">
                {currentPhase.description || "Không có mô tả"}
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian dự kiến">
                {currentPhase.expectedDuration || "Không xác định"}
              </Descriptions.Item>
              {currentPhase.startDate && (
                <Descriptions.Item label="Ngày bắt đầu">
                  {dayjs(currentPhase.startDate).format("DD/MM/YYYY HH:mm")}
                </Descriptions.Item>
              )}
              {currentPhase.endDate && (
                <Descriptions.Item label="Ngày kết thúc">
                  {dayjs(currentPhase.endDate).format("DD/MM/YYYY HH:mm")}
                </Descriptions.Item>
              )}
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

        {/* Treatment Plan Phases with Status Management */}
        {apiPhases && apiPhases.length > 0 && (
          <Card
            size="small"
            style={{ marginBottom: 16 }}
            extra={null}
          >
            <Table
              dataSource={[...apiPhases].sort(
                (a, b) => (a.phaseOrder || 0) - (b.phaseOrder || 0)
              )}
              rowKey={(record) => record.phaseId || record.id}
              pagination={false}
              size="small"
              // Thêm rowClassName để làm mờ các phase chưa đến lượt
              rowClassName={(record, index) => {
                // Đảm bảo apiPhases đã được sort đúng thứ tự
                const sortedPhases = [...apiPhases].sort(
                  (a, b) => (a.phaseOrder || 0) - (b.phaseOrder || 0)
                );
                // Tìm index phase đang "In Progress"
                const currentIdx = sortedPhases.findIndex(
                  (p) => p.status === "In Progress"
                );
                if (currentIdx !== -1) {
                  // Chỉ phase "In Progress" và các phase trước nó không mờ
                  if (index > currentIdx && record.status === "Pending") {
                    return "phase-greyed-out";
                  }
                  if (index <= currentIdx) {
                    return "";
                  }
                } else {
                  // Nếu không có phase "In Progress", chỉ phase đầu tiên "Pending" không mờ
                  const firstPendingIdx = sortedPhases.findIndex(
                    (p) => p.status === "Pending"
                  );
                  if (firstPendingIdx !== -1) {
                    if (
                      index > firstPendingIdx &&
                      record.status === "Pending"
                    ) {
                      return "phase-greyed-out";
                    }
                    if (
                      index !== firstPendingIdx &&
                      record.status === "Pending"
                    ) {
                      return "phase-greyed-out";
                    }
                  }
                }
                // Các phase "Completed" không mờ
                return "";
              }}
              columns={[
                {
                  title: "STT",
                  dataIndex: "phaseOrder",
                  key: "phaseOrder",
                  width: 60,
                  render: (value, record, index) => value || index + 1,
                },
                {
                  title: "Tên giai đoạn",
                  dataIndex: "phaseName",
                  key: "phaseName",
                  render: (text, record) => (
                    <div>
                      <Text strong>
                        {text ||
                          generateMeaningfulPhaseName(
                            record,
                            record.phaseOrder - 1,
                            currentTreatmentPlan?.treatmentType || "IUI"
                          )}
                      </Text>
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
                  render: (status) => (
                    <Tag color={getStatusColor(status)}>
                      {getStatusIcon(status)}
                      {getStatusDisplayName(status)}
                    </Tag>
                  ),
                },
                {
                  title: "Thời gian dự kiến",
                  dataIndex: "expectedDuration",
                  key: "expectedDuration",
                  width: 120,
                  render: (text, record) => (
                    <Tooltip title="Thời gian dự kiến hoàn thành giai đoạn này">
                      <span>
                        <ClockCircleOutlined
                          style={{ color: "#faad14", marginRight: 4 }}
                        />
                        {text
                          ? typeof text === "number"
                            ? `${text} ngày`
                            : /\d/.test(text)
                            ? text
                            : `${text} ngày`
                          : "Không xác định"}
                      </span>
                    </Tooltip>
                  ),
                },
                {
                  title: "Ngày bắt đầu",
                  dataIndex: "startDate",
                  key: "startDate",
                  width: 120,
                  render: (date) =>
                    date ? dayjs(date).format("DD/MM/YYYY") : "-",
                },
                {
                  title: "Ngày kết thúc",
                  dataIndex: "endDate",
                  key: "endDate",
                  width: 120,
                  render: (date) =>
                    date ? dayjs(date).format("DD/MM/YYYY") : "-",
                },
                {
                  title: "Thao tác",
                  key: "actions",
                  width: 100,
                  render: (_, record) => (
                    <Button
                      type="link"
                      size="small"
                      onClick={() => handlePhaseStatusUpdate(record)}
                      loading={updatingPhaseStatus}
                      title="Cập nhật trạng thái"
                    >
                      Cập nhật
                    </Button>
                  ),
                },
              ]}
            />
          </Card>
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={initialFormValues}
          onValuesChange={(changedValues, allValues) => {
            // 🆕 Cập nhật formValues khi form thay đổi
            Object.keys(changedValues).forEach(key => {
              updateFormValues(key, changedValues[key]);
            });
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Ngày bắt đầu điều trị"
                name="startDate"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày bắt đầu" },
                ]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  onChange={handleStartDateChange}
                  disabledDate={(current) =>
                    current && current < dayjs().startOf("day")
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Giờ ưu tiên"
                name="preferredTime"
                rules={[
                  { required: true, message: "Vui lòng chọn giờ ưu tiên" },
                ]}
              >
                <TimePicker
                  style={{ width: "100%" }}
                  format="HH:mm"
                  minuteStep={15}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Available Times Display */}
          {selectedDate && (
            <Row style={{ marginBottom: 16 }}>
              <Col span={24}>
                <Card
                  size="small"
                  title={
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <ClockCircleOutlined style={{ color: "#ff7eb3" }} />
                      <span>Giờ rảnh của bác sĩ ngày {selectedDate.format("DD/MM/YYYY")}</span>
                    </div>
                  }
                  extra={
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {loadingAvailableTimes ? (
                        <span>Đang tải...</span>
                      ) : (
                        <span>{availableTimes.length} giờ rảnh</span>
                      )}
                      <Button
                        size="small"
                        onClick={() => loadAvailableTimes(selectedDate)}
                        disabled={loadingAvailableTimes}
                        style={{ fontSize: "10px", padding: "0 4px" }}
                      >
                        🔄
                      </Button>
                    </div>
                  }
                >
                  {loadingAvailableTimes ? (
                    <div style={{ textAlign: "center", padding: "20px" }}>
                      <Spin size="small" />
                      <p style={{ marginTop: "8px", fontSize: "12px" }}>Đang tải giờ rảnh...</p>
                    </div>
                  ) : availableTimes.length > 0 ? (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {availableTimes.map((slot, index) => (
                        <Tag
                          key={index}
                          color="green"
                          style={{ 
                            cursor: "pointer",
                            padding: "4px 8px",
                            fontSize: "12px"
                          }}
                          onClick={() => {
                            const time = dayjs(slot.dateTime);
                            form.setFieldsValue({ preferredTime: time });
                            updateFormValues('preferredTime', time);
                          }}
                        >
                          {slot.time} - {slot.room}
                        </Tag>
                      ))}
                    </div>
                  ) : (
                    <Alert
                      message="Không có giờ rảnh"
                      description="Bác sĩ không có lịch làm việc hoặc đã hết slot vào ngày này"
                      type="warning"
                      showIcon
                      size="small"
                    />
                  )}
                </Card>
              </Col>
            </Row>
          )}

          <Form.Item
            label="Tên lịch điều trị"
            name="planName"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập tên lịch điều trị",
              },
              { max: 255, message: "Tên không được vượt quá 255 ký tự" },
            ]}
          >
            <Input placeholder="Nhập tên lịch điều trị" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading || savingSchedule}
                size="large"
                icon={<SaveOutlined />}
                className="action-btn submit-btn"
                disabled={!canCreateSchedule()}
                title={
                  !isFormValid() 
                    ? "Vui lòng nhập đầy đủ: Ngày điều trị, Giờ ưu tiên, Tên lịch điều trị"
                    : isTreatmentPlanDisabled()
                    ? `Không thể tạo lịch điều trị cho phác đồ đã ${currentTreatmentPlan?.status === "completed" ? "hoàn thành" : "hủy"}`
                    : ""
                }
              >
                {isEditing ? "Cập nhật lịch điều trị" : "Tạo lịch điều trị"}
              </Button>
              <Button
                onClick={handleResetForm}
                disabled={loading}
                size="large"
                className="action-btn reset-btn"
              >
                Đặt lại
              </Button>
            </Space>
          </Form.Item>
        </Form>

        {/* Session Edit Modal */}
        <Modal
          title={
            editingSession?.custom
              ? "Thêm buổi điều trị tùy chỉnh"
              : "Chỉnh sửa buổi điều trị"
          }
          open={sessionModal}
          onCancel={() => {
            setSessionModal(false);
            setEditingSession(null);
          }}
          footer={[
            <Button key="cancel" onClick={() => setSessionModal(false)}>
              Hủy
            </Button>,
            <Button
              key="save"
              type="primary"
              form="sessionForm"
              htmlType="submit"
            >
              Lưu
            </Button>,
          ]}
        >
          <Form
            id="sessionForm"
            form={sessionForm}
            layout="vertical"
            onFinish={
              editingSession?.custom
                ? (values) => {
                    const newSession = {
                      ...editingSession,
                      activity: values.activity,
                      date: values.date.format("YYYY-MM-DD"),
                      duration: values.duration,
                      room: values.room,
                      type: values.type,
                      required: values.required,
                    };

                    setGeneratedSchedule((prev) => [...prev, newSession]);
                    message.success("Đã thêm buổi điều trị tùy chỉnh");
                    setSessionModal(false);
                    setEditingSession(null);
                  }
                : handleSaveSession
            }
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Tên hoạt động"
                  name="activity"
                  rules={[
                    { required: true, message: "Vui lòng nhập tên hoạt động" },
                  ]}
                >
                  <Input placeholder="VD: Siêu âm kiểm tra đặc biệt" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Ngày thực hiện"
                  name="date"
                  rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
                >
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  label="Thời gian (phút)"
                  name="duration"
                  rules={[
                    { required: true, message: "Vui lòng nhập thời gian" },
                  ]}
                >
                  <InputNumber min={5} max={480} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Phòng"
                  name="room"
                  rules={[{ required: true, message: "Vui lòng chọn phòng" }]}
                >
                  <Select>
                    <Option value="Phòng khám">Phòng khám</Option>
                    <Option value="Phòng siêu âm">Phòng siêu âm</Option>
                    <Option value="Phòng xét nghiệm">Phòng xét nghiệm</Option>
                    <Option value="Phòng thủ thuật">Phòng thủ thuật</Option>
                    <Option value="Phòng lab">Phòng lab</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Loại hoạt động"
                  name="type"
                  rules={[{ required: true, message: "Vui lòng chọn loại" }]}
                >
                  <Select>
                    <Option value="consultation">Tư vấn</Option>
                    <Option value="test">Xét nghiệm</Option>
                    <Option value="ultrasound">Siêu âm</Option>
                    <Option value="injection">Tiêm thuốc</Option>
                    <Option value="procedure">Thủ thuật</Option>
                    <Option value="laboratory">Lab</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Mức độ quan trọng" name="required">
                  <Select>
                    <Option value={true}>Bắt buộc</Option>
                    <Option value={false}>Tùy chọn</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Lý do thay đổi" name="reason">
                  <Input placeholder="VD: Điều chỉnh theo tình trạng bệnh nhân" />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>

        {/* Phase Management Modal */}
        <Modal
          title="Thêm giai đoạn điều trị"
          open={phaseModal}
          onCancel={() => {
            setPhaseModal(false);
            setEditingPhase(null);
          }}
          footer={[
            <Button key="cancel" onClick={() => setPhaseModal(false)}>
              Hủy
            </Button>,
            <Button
              key="save"
              type="primary"
              form="phaseForm"
              htmlType="submit"
            >
              Lưu
            </Button>,
          ]}
        >
          <Form
            id="phaseForm"
            form={phaseForm}
            layout="vertical"
            onFinish={async (values) => {
              try {
                // Lấy phaseOrder lớn nhất hiện có
                const maxOrder = apiPhases.reduce(
                  (max, p) => Math.max(max, p.phaseOrder || 0),
                  0
                );
                const phaseData = {
                  planId: currentTreatmentPlan.planId,
                  patientId: patientId,
                  phaseName: values.phaseName,
                  description: values.description,
                  phaseOrder: maxOrder + 1, // Đảm bảo không trùng
                  expectedDuration: values.expectedDuration,
                  status: "Pending",
                  startDate: values.startDate?.format("YYYY-MM-DDTHH:mm:ss"),
                  endDate: values.endDate?.format("YYYY-MM-DDTHH:mm:ss"),
                };
                const result = await createTreatmentPhase(phaseData);
                if (result.success) {
                  message.success("Đã tạo giai đoạn điều trị");
                  setPhaseModal(false);
                  phaseForm.resetFields();
                  await loadTreatmentData();
                } else {
                  message.error(result.message || "Không thể tạo giai đoạn");
                }
              } catch (error) {
                message.error("Có lỗi khi tạo giai đoạn");
              }
            }}
          >
            <Form.Item
              label="Tên giai đoạn"
              name="phaseName"
              rules={[
                { required: true, message: "Vui lòng nhập tên giai đoạn" },
              ]}
            >
              <Input placeholder="VD: Chuẩn bị chu kỳ" />
            </Form.Item>

            <Form.Item label="Mô tả" name="description">
              <Input.TextArea
                rows={3}
                placeholder="Mô tả chi tiết về giai đoạn điều trị này..."
                maxLength={500}
                showCount
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Thời gian dự kiến"
                  name="expectedDuration"
                  rules={[
                    { required: true, message: "Vui lòng nhập thời gian" },
                  ]}
                >
                  <Input placeholder="VD: 5-7 ngày" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Ngày bắt đầu" name="startDate">
                  <DatePicker
                    style={{ width: "100%" }}
                    placeholder="Chọn ngày bắt đầu"
                    disabledDate={(current) =>
                      current && current < dayjs().startOf("day")
                    }
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="Ngày kết thúc" name="endDate">
              <DatePicker
                style={{ width: "100%" }}
                placeholder="Chọn ngày kết thúc"
                disabledDate={(current) =>
                  current && current < dayjs().startOf("day")
                }
              />
            </Form.Item>
          </Form>
        </Modal>

        {/* Activity Management Modal */}
        <Modal
          title="Chỉnh sửa hoạt động"
          open={activityModal}
          onCancel={() => {
            setActivityModal(false);
            setEditingActivity(null);
          }}
          footer={[
            <Button key="cancel" onClick={() => setActivityModal(false)}>
              Hủy
            </Button>,
            <Button
              key="save"
              type="primary"
              form="activityForm"
              htmlType="submit"
            >
              Lưu
            </Button>,
          ]}
        >
          {editingActivity && (
            <Form
              id="activityForm"
              layout="vertical"
              initialValues={editingActivity}
              onFinish={handleSaveActivity}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Tên hoạt động"
                    name="name"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập tên hoạt động",
                      },
                    ]}
                  >
                    <Input placeholder="Nhập tên hoạt động" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Loại hoạt động"
                    name="type"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn loại hoạt động",
                      },
                    ]}
                  >
                    <Select>
                      <Option value="examination">Khám</Option>
                      <Option value="consultation">Tư vấn</Option>
                      <Option value="test">Xét nghiệm</Option>
                      <Option value="ultrasound">Siêu âm</Option>
                      <Option value="injection">Tiêm thuốc</Option>
                      <Option value="procedure">Thủ thuật</Option>
                      <Option value="laboratory">Lab</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    label="Thời gian dự kiến (phút)"
                    name="estimatedDuration"
                    rules={[
                      { required: true, message: "Vui lòng nhập thời gian" },
                    ]}
                  >
                    <InputNumber
                      min={5}
                      max={480}
                      placeholder="60"
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Phòng thực hiện" name="room">
                    <Input placeholder="Phòng khám 1" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Nhân viên phụ trách" name="assignedStaff">
                    <Input placeholder="Tên nhân viên" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Ngày thực hiện" name="scheduledDate">
                    <DatePicker
                      style={{ width: "100%" }}
                      showTime
                      format="DD/MM/YYYY HH:mm"
                      placeholder="Chọn ngày và giờ"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Chi phí (VNĐ)" name="cost">
                    <InputNumber
                      min={0}
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                      style={{ width: "100%" }}
                      placeholder="0"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Bắt buộc"
                    name="isRequired"
                    valuePropName="checked"
                  >
                    <Switch checkedChildren="Có" unCheckedChildren="Không" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Thứ tự"
                    name="order"
                    rules={[
                      { required: true, message: "Vui lòng nhập thứ tự" },
                    ]}
                  >
                    <InputNumber
                      min={1}
                      style={{ width: "100%" }}
                      placeholder="1"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="Yêu cầu chuẩn bị" name="requirements">
                <Input.TextArea
                  rows={3}
                  placeholder="Các yêu cầu chuẩn bị trước khi thực hiện hoạt động..."
                />
              </Form.Item>

              <Form.Item label="Ghi chú" name="notes">
                <Input.TextArea
                  rows={3}
                  placeholder="Ghi chú thêm về hoạt động..."
                />
              </Form.Item>
            </Form>
          )}
        </Modal>

        {/* Phase Status Update Modal */}
        <Modal
          title="Cập nhật trạng thái giai đoạn"
          open={phaseStatusModal}
          onCancel={() => {
            setPhaseStatusModal(false);
            setEditingPhaseStatus(null);
            phaseStatusForm.resetFields();
          }}
          footer={[
            <Button key="cancel" onClick={() => setPhaseStatusModal(false)}>
              Hủy
            </Button>,
            <Button
              key="save"
              type="primary"
              form="phaseStatusForm"
              htmlType="submit"
              loading={updatingPhaseStatus}
            >
              Cập nhật
            </Button>,
          ]}
        >
          {/* Hiển thị thông tin phase để tham khảo */}
          {editingPhaseStatus && (
            <Descriptions
              column={1}
              size="small"
              bordered
              style={{ marginBottom: 16 }}
            >
              <Descriptions.Item label="Giai đoạn">
                {editingPhaseStatus.phaseName || "Không xác định"}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái hiện tại">
                <Tag color={getStatusColor(editingPhaseStatus.status)}>
                  {getStatusIcon(editingPhaseStatus.status)}
                  {getStatusDisplayName(editingPhaseStatus.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian dự kiến">
                <span>
                  <ClockCircleOutlined
                    style={{ color: "#faad14", marginRight: 4 }}
                  />
                  {(() => {
                    const text = editingPhaseStatus.expectedDuration;
                    const start = editingPhaseStatus.startDate
                      ? dayjs(editingPhaseStatus.startDate)
                      : null;
                    const duration =
                      typeof text === "number"
                        ? text
                        : typeof text === "string" && /^\d+$/.test(text)
                        ? parseInt(text, 10)
                        : null;
                    const endEstimate =
                      start && duration
                        ? start.add(duration, "day").format("DD/MM/YYYY")
                        : null;
                    return (
                      <>
                        {text
                          ? typeof text === "number"
                            ? `${text} ngày`
                            : /\d/.test(text)
                            ? text
                            : `${text} ngày`
                          : "Không xác định"}
                        {endEstimate && (
                          <span style={{ color: "#888", marginLeft: 4 }}>
                            (~{endEstimate})
                          </span>
                        )}
                      </>
                    );
                  })()}
                </span>
              </Descriptions.Item>
            </Descriptions>
          )}
          <Form
            id="phaseStatusForm"
            form={phaseStatusForm}
            layout="vertical"
            onFinish={handleSavePhaseStatus}
          >
            <Form.Item
              label="Trạng thái mới"
              name="status"
              rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
            >
              <Select placeholder="Chọn trạng thái">
                {editingPhaseStatus && (() => {
                  const currentStatus = editingPhaseStatus.status;
                  
                  // 🆕 Logic hiển thị options dựa trên trạng thái hiện tại
                  switch (currentStatus) {
                    case "Pending":
                      return (
                        <>
                          <Option value="Pending">
                            <ClockCircleOutlined /> Chờ thực hiện
                          </Option>
                          <Option value="In Progress">
                            <PlayCircleOutlined /> Đang thực hiện
                          </Option>
                          <Option value="Cancelled">
                            <ExclamationCircleOutlined /> Đã hủy
                          </Option>
                        </>
                      );
                    case "In Progress":
                      return (
                        <>
                          <Option value="In Progress">
                            <PlayCircleOutlined /> Đang thực hiện
                          </Option>
                          <Option value="Completed">
                            <CheckCircleOutlined /> Hoàn thành
                          </Option>
                          <Option value="Cancelled">
                            <ExclamationCircleOutlined /> Đã hủy
                          </Option>
                        </>
                      );
                    case "Completed":
                      return (
                        <Option value="Completed" disabled>
                          <CheckCircleOutlined /> Hoàn thành
                        </Option>
                      );
                    case "Cancelled":
                      return (
                        <Option value="Cancelled" disabled>
                          <ExclamationCircleOutlined /> Đã hủy
                        </Option>
                      );
                    default:
                      return (
                        <>
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
                        </>
                      );
                  }
                })()}
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


      </Card>
      <style>{`
.phase-greyed-out {
  opacity: 0.5;
  pointer-events: none;
  background: #f5f5f5 !important;
}
`}</style>
    </div>
  );
};

export default TreatmentScheduleForm;
