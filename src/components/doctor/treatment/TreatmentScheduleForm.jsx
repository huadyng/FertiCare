import React, { useState, useEffect, useContext } from "react";
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
  PlusOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
  UserOutlined,
  SettingOutlined,
  DollarOutlined,
  ReloadOutlined,
  MinusOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { generateScheduleFromTemplate } from "./data/treatmentTemplates";
import { treatmentStateManager } from "../../../utils/treatmentStateManager";
import apiTreatmentManagement from "../../../api/apiTreatmentManagement";
import { UserContext } from "../../../context/UserContext";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Step } = Steps;

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

  // Doctor customization states
  const [doctorNotes, setDoctorNotes] = useState("");
  const [customSessions, setCustomSessions] = useState([]);
  const [scheduleAdjustments, setScheduleAdjustments] = useState({});

  // Enhanced states for real API integration
  const [apiPhases, setApiPhases] = useState([]);
  const [loadingPhases, setLoadingPhases] = useState(false);
  const [editingPhase, setEditingPhase] = useState(null);
  const [phaseModal, setPhaseModal] = useState(false);
  const [currentTreatmentPlan, setCurrentTreatmentPlan] = useState(null);
  const [autoImporting, setAutoImporting] = useState(false);
  const [scheduleData, setScheduleData] = useState(null);
  const [savingSchedule, setSavingSchedule] = useState(false);

  // NEW: States for detailed activity management
  const [phaseActivities, setPhaseActivities] = useState({});
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [expandedPhases, setExpandedPhases] = useState(new Set());
  const [selectedActivities, setSelectedActivities] = useState(new Set());
  const [activityModal, setActivityModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [activityStatuses, setActivityStatuses] = useState({});

  // State để theo dõi việc đã tải dữ liệu lần đầu
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

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
  }, [patientId, initialDataLoaded, loadingPhases]); // Thêm loadingPhases vào dependency

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
            console.log(
              `✅ [TreatmentScheduleForm] Auto-imported ${importedCount} phases from treatment plan`
            );
            message.success(
              `✅ Đã tự động tạo ${importedCount} giai đoạn từ phác đồ điều trị`
            );
            await loadPhasesFromAPI(currentTreatmentPlan?.planId);
          }
        } catch (error) {
          console.error(
            "❌ [TreatmentScheduleForm] Auto-import failed:",
            error
          );
          message.warning(
            "⚠️ Không thể tự động tạo giai đoạn từ phác đồ. Vui lòng tạo thủ công."
          );
        } finally {
          setAutoImporting(false);
        }
      }
    };

    autoImportPhases();
  }, [
    treatmentPlan,
    apiPhases.length,
    loadingPhases,
    currentTreatmentPlan,
    patientId,
    user?.id,
    autoImporting,
  ]);

  // Reset trạng thái khi patientId thay đổi
  useEffect(() => {
    if (patientId) {
      console.log(
        `🔄 [TreatmentScheduleForm] PatientId changed to: ${patientId}, resetting state`
      );
      setInitialDataLoaded(false);
      setCurrentTreatmentPlan(null);
      setApiPhases([]);
      setPhaseActivities({});
      setGeneratedSchedule([]);
      setTemplate(null);
    }
  }, [patientId]);

  // Tự động generate schedule khi có đủ dữ liệu
  useEffect(() => {
    // Kiểm tra xem đã load xong activities chưa (có thể một số phases không có activities)
    const activitiesLoadingComplete =
      apiPhases.length > 0 &&
      Object.keys(phaseActivities).length >= apiPhases.length;

    // Hoặc nếu đã có ít nhất một phase có activities
    const hasAnyPhaseActivities =
      apiPhases.length > 0 && Object.keys(phaseActivities).length > 0;

    if (
      initialDataLoaded &&
      currentTreatmentPlan &&
      apiPhases.length > 0 &&
      (activitiesLoadingComplete || hasAnyPhaseActivities) &&
      !template &&
      !generatedSchedule.length
    ) {
      console.log(
        "🔄 [TreatmentScheduleForm] Auto-generating schedule from loaded data..."
      );
      console.log("📊 Current state:", {
        initialDataLoaded,
        currentTreatmentPlan: !!currentTreatmentPlan,
        apiPhasesCount: apiPhases.length,
        phaseActivitiesKeysCount: Object.keys(phaseActivities).length,
        activitiesLoadingComplete,
        hasAnyPhaseActivities,
        templateExists: !!template,
        generatedScheduleLength: generatedSchedule.length,
      });
      loadExistingSchedule();
    }
  }, [
    initialDataLoaded,
    currentTreatmentPlan,
    apiPhases.length,
    phaseActivities,
    template,
    generatedSchedule.length,
  ]);

  // Enhanced function to get meaningful phase names based on treatment type
  const getMeaningfulPhaseNames = (treatmentType) => {
    if (treatmentType === "IVF") {
      return {
        1: "Chuẩn bị và đánh giá ban đầu",
        2: "Kích thích buồng trứng",
        3: "Theo dõi và điều chỉnh liều",
        4: "Lấy trứng và thụ tinh",
        5: "Chuyển phôi và theo dõi",
      };
    } else if (treatmentType === "IUI") {
      return {
        1: "Khám sàng lọc và tư vấn",
        2: "Chuẩn bị và kích thích nhẹ",
        3: "Theo dõi phát triển noãn",
        4: "Thụ tinh nhân tạo IUI",
        5: "Theo dõi sau thủ thuật",
      };
    } else {
      return {
        1: "Giai đoạn chuẩn bị",
        2: "Giai đoạn điều trị chính",
        3: "Giai đoạn theo dõi",
        4: "Giai đoạn hoàn thiện",
        5: "Giai đoạn kết thúc",
      };
    }
  };

  // Enhanced function to load all treatment data
  const loadTreatmentData = async () => {
    // Tránh tải dữ liệu nhiều lần cùng lúc
    if (loadingPhases) {
      console.log("🔄 [TreatmentScheduleForm] Already loading, skipping...");
      return;
    }

    try {
      setLoadingPhases(true);
      console.log(
        `🔄 [TreatmentScheduleForm] Loading treatment data for patient: ${patientId}`
      );
      console.log(`🔍 [TreatmentScheduleForm] Current data state:`, {
        hasPatientInfo: !!patientInfo,
        hasTreatmentPlan: !!treatmentPlan,
        hasExaminationData: !!examinationData,
        apiPhasesCount: apiPhases.length,
        hasCurrentTreatmentPlan: !!currentTreatmentPlan,
        isLoadingPhases: loadingPhases,
      });

      // Load active treatment plan
      const planResult = await apiTreatmentManagement.getActiveTreatmentPlan(
        patientId
      );

      if (planResult.success && planResult.data) {
        setCurrentTreatmentPlan(planResult.data);
        console.log("✅ Treatment plan loaded:", planResult.data);

        // Load phases for this treatment plan
        if (planResult.data.planId) {
          await loadPhasesFromAPI(planResult.data.planId);
        } else if (planResult.data.phases) {
          // Use phases from plan data if available
          const fixedPhases = fixPhaseNames(planResult.data.phases);
          setApiPhases(fixedPhases);
          console.log("✅ Phases loaded from plan data:", fixedPhases);
        }
      } else {
        console.warn("⚠️ No active treatment plan found");
        // Try to load phases directly by patient
        await loadPhasesFromAPI();
      }

      // Đánh dấu đã tải dữ liệu lần đầu thành công
      setInitialDataLoaded(true);
      console.log("✅ [TreatmentScheduleForm] Initial data loading completed");

      // Load existing schedule AFTER marking as loaded (will be handled by useEffect)
      // await loadExistingSchedule();

      // Force re-render để đảm bảo UI cập nhật
      setTimeout(() => {
        console.log(
          "🔄 [TreatmentScheduleForm] Forcing UI update after data load"
        );
      }, 200);
    } catch (error) {
      console.error("❌ Error loading treatment data:", error);
      message.error("Không thể tải thông tin điều trị từ hệ thống");
    } finally {
      setLoadingPhases(false);
    }
  };

  // Load phases from API
  const loadPhasesFromAPI = async (treatmentPlanId = null) => {
    try {
      setLoadingPhases(true);
      console.log(
        `🔄 [TreatmentScheduleForm] Loading phases for patient: ${patientId}, planId: ${treatmentPlanId}`
      );

      let planId = treatmentPlanId || currentTreatmentPlan?.planId;

      if (!planId && treatmentPlan?.planId) {
        planId = treatmentPlan.planId;
      }

      if (!planId) {
        console.warn(
          "⚠️ [TreatmentScheduleForm] No treatment plan ID available"
        );
        return;
      }

      const response = await apiTreatmentManagement.getTreatmentPlanPhases(
        planId
      );

      if (response.success && response.data) {
        console.log("✅ Phases loaded successfully:", response.data);

        // Backend returns List<PhaseStatusResponse> directly
        const phases = response.data;

        // Transform PhaseStatusResponse to frontend format
        const transformedPhases = phases.map((phase) => ({
          statusId: phase.statusId,
          phaseId: phase.phaseId,
          phaseName:
            phase.phaseName || `Giai đoạn ${phase.phaseOrder || "N/A"}`,
          phaseOrder: phase.phaseOrder || 0,
          status: phase.status || "Pending",
          startDate: phase.startDate,
          endDate: phase.endDate,
          description: phase.description || "",
          expectedDuration: phase.expectedDuration,
          notes: phase.notes || "",
          treatmentPlanId: phase.treatmentPlanId || planId,
          // Add additional frontend-specific fields
          activities: [], // Will be loaded separately
          progress:
            phase.status === "Completed"
              ? 100
              : phase.status === "In Progress"
              ? 50
              : 0,
        }));

        setApiPhases(transformedPhases);

        // Load activities for all phases
        await loadAllPhaseActivities(transformedPhases, planId);
      } else {
        console.error("Failed to load phases:", response.message);
        message.error("Không thể tải thông tin giai đoạn điều trị");
      }
    } catch (error) {
      console.error("Error loading phases:", error);
      message.error("Lỗi khi tải thông tin giai đoạn điều trị");
    } finally {
      setLoadingPhases(false);
    }
  };

  // Enhanced function to load existing schedule
  const loadExistingSchedule = async () => {
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
          preferredTime: dayjs(
            existingSchedule.preferredTime || "09:00",
            "HH:mm"
          ),
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
        console.log(
          "🔍 [TreatmentScheduleForm] Phase activities state:",
          phaseActivities
        );

        templateData = {
          name: currentTreatmentPlan.planName || "Phác đồ điều trị",
          type: currentTreatmentPlan.treatmentType || "N/A",
          estimatedDuration:
            currentTreatmentPlan.estimatedDurationDays || "N/A",
          cost: currentTreatmentPlan.estimatedCost || 0,
          successRate: currentTreatmentPlan.successProbability || "N/A",
          phases: apiPhases.map((phase, idx) => ({
            ...phase,
            activities: phaseActivities[phase.phaseId] || [
              // Fallback activities nếu không load được từ API
              {
                id: `fallback_activity_${idx}_1`,
                name: "Khám sàng lọc",
                type: "examination",
                estimatedDuration: 30,
                isRequired: true,
                status: "pending",
                order: 1,
                room: "Phòng khám",
                cost: 200000,
              },
              {
                id: `fallback_activity_${idx}_2`,
                name: "Theo dõi tiến trình",
                type: "consultation",
                estimatedDuration: 20,
                isRequired: true,
                status: "pending",
                order: 2,
                room: "Phòng tư vấn",
                cost: 150000,
              },
            ],
            phaseName: phase.phaseName || `Giai đoạn ${idx + 1}`,
            phaseId: phase.phaseId || `phase_${idx + 1}`,
            expectedDuration: phase.expectedDuration || "",
          })),
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
        templateData = {
          name: treatmentPlan.planName || "Phác đồ từ backend",
          type: treatmentPlan.treatmentType || "N/A",
          estimatedDuration: treatmentPlan.estimatedDurationDays || "N/A",
          cost: treatmentPlan.estimatedCost || 0,
          successRate: treatmentPlan.successProbability || "N/A",
          phases: treatmentPlan.treatmentSteps.map((step, idx) => ({
            phaseId: `phase_${idx + 1}`,
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
      } else if (apiPhases && apiPhases.length > 0) {
        // Fallback: map from apiPhases only
        console.log(
          "🔄 [TreatmentScheduleForm] Creating template from apiPhases only"
        );
        templateData = {
          name: "Phác đồ điều trị",
          type: currentTreatmentPlan?.treatmentType || "N/A",
          phases: apiPhases.map((phase, idx) => ({
            ...phase,
            activities: phaseActivities[phase.phaseId] || [
              // Fallback activities cho apiPhases
              {
                id: `fallback_activity_${idx}_1`,
                name: "Hoạt động chính",
                type: "examination",
                estimatedDuration: 30,
                isRequired: true,
                status: "pending",
                order: 1,
                room: "Phòng điều trị",
                cost: 200000,
              },
            ],
            phaseName: phase.phaseName || `Giai đoạn ${idx + 1}`,
            phaseId: phase.phaseId || `phase_${idx + 1}`,
            expectedDuration: phase.expectedDuration || "",
          })),
        };
      }

      if (templateData) {
        setTemplate(templateData);
        const defaultStartDate =
          currentTreatmentPlan?.startDate ||
          treatmentPlan?.estimatedStartDate ||
          treatmentPlan?.startDate ||
          dayjs().add(3, "days").format("YYYY-MM-DD");

        const schedule = generateScheduleFromTemplate(
          templateData,
          defaultStartDate
        );
        setGeneratedSchedule(schedule);

        form.setFieldsValue({
          startDate: dayjs(defaultStartDate),
          preferredTime: dayjs("09:00", "HH:mm"),
        });

        console.log("✅ Template and schedule generated successfully");
        console.log("📋 Generated schedule:", schedule);
        console.log("🎯 Template data:", templateData);
      } else {
        console.warn("⚠️ No template data available to generate schedule");
      }
    } catch (error) {
      console.error("❌ Error loading existing schedule:", error);
    }
  };

  // Helper function to fix UUID phaseNames and map to correct API response structure
  const fixPhaseNames = (phases) => {
    if (!Array.isArray(phases)) return phases;

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    return phases.map((phase, idx) => {
      let safePhaseName = phase.phaseName;

      if (typeof safePhaseName === "string" && uuidRegex.test(safePhaseName)) {
        if (phase.description && !uuidRegex.test(phase.description)) {
          safePhaseName = phase.description.split(":")[0].trim();
        } else {
          const treatmentType = currentTreatmentPlan?.treatmentType || "IUI";
          const order = phase.phaseOrder || idx + 1;
          const meaningfulPhaseNames = getMeaningfulPhaseNames(treatmentType);
          safePhaseName = meaningfulPhaseNames[order] || `Giai đoạn ${order}`;
        }
      }

      // Map to correct API response structure
      return {
        statusId: phase.statusId,
        treatmentPlanId: phase.treatmentPlanId,
        phaseId: phase.phaseId,
        phaseName: safePhaseName,
        phaseOrder: phase.phaseOrder || idx + 1,
        status: phase.status,
        startDate: phase.startDate,
        endDate: phase.endDate,
        notes: phase.notes,
        description: phase.description,
        expectedDuration: phase.expectedDuration,
      };
    });
  };

  // Enhanced API functions for phase management
  const createTreatmentPhase = async (phaseData) => {
    try {
      console.log("🔄 Creating treatment phase:", phaseData);

      // Validate phase data before sending to API
      const validation =
        apiTreatmentManagement.validateTreatmentPhase(phaseData);
      if (!validation.isValid) {
        throw new Error(
          `Dữ liệu không hợp lệ: ${validation.errors.join(", ")}`
        );
      }

      // Format data for API
      const formattedData =
        apiTreatmentManagement.formatPhaseDataForAPI(phaseData);

      // Call the actual API
      const result = await apiTreatmentManagement.createTreatmentPhase(
        formattedData
      );

      if (result.success) {
        // Add to local state immediately for UI responsiveness
        setApiPhases((prev) => [...prev, result.data]);
        message.success("✅ Đã tạo giai đoạn mới thành công");
      } else {
        throw new Error(result.message || "Không thể tạo giai đoạn mới");
      }

      return result;
    } catch (error) {
      console.error("❌ Error creating phase:", error);
      message.error(error.message || "Không thể tạo giai đoạn mới");
      return { success: false, message: error.message };
    }
  };

  // Update phase status using real API
  const handleUpdatePhaseStatus = async (phaseId, newStatus) => {
    try {
      setLoading(true);
      console.log(`🔄 Updating phase ${phaseId} status to: ${newStatus}`);

      if (!currentTreatmentPlan?.planId) {
        message.error("❌ Không tìm thấy treatment plan ID");
        return;
      }

      const result = await apiTreatmentManagement.updatePhaseStatus(
        currentTreatmentPlan.planId,
        phaseId,
        {
          status: newStatus,
          notes: `Cập nhật bởi bác sĩ lúc ${new Date().toLocaleString()}`,
        }
      );

      if (result.success) {
        // Update local state with actual API response structure
        setApiPhases((prev) =>
          prev.map((phase) =>
            phase.phaseId === phaseId
              ? {
                  ...result.data, // Use the actual API response data
                }
              : phase
          )
        );

        message.success(
          `✅ Đã cập nhật trạng thái giai đoạn thành: ${getStatusDisplayName(
            newStatus
          )}`
        );

        // Refresh phases data
        await loadPhasesFromAPI(currentTreatmentPlan.planId);
      } else {
        // Handle specific 409 conflict errors with clear explanations
        if (result.error?.response?.status === 409) {
          const errorMessage =
            result.error.response.data?.message || result.message;
          if (errorMessage.includes("Cannot change status from Completed")) {
            message.error(
              "❌ Không thể thay đổi giai đoạn đã hoàn thành. Giai đoạn đã hoàn thành không thể quay lại trạng thái khác."
            );
          } else if (
            errorMessage.includes("Cannot change status from Cancelled")
          ) {
            message.error(
              "❌ Không thể thay đổi giai đoạn đã hủy. Giai đoạn đã hủy không thể chuyển sang trạng thái khác."
            );
          } else if (errorMessage.includes("Cannot start phase")) {
            message.error(
              "❌ Không thể bắt đầu giai đoạn này. Vui lòng hoàn thành giai đoạn trước đó trước."
            );
          } else {
            message.error(`❌ Xung đột business logic: ${errorMessage}`);
          }
        } else {
          message.error(
            result.message || "❌ Không thể cập nhật trạng thái giai đoạn"
          );
        }
      }
    } catch (error) {
      console.error("❌ Error updating phase status:", error);
      message.error("Có lỗi khi cập nhật trạng thái giai đoạn");
    } finally {
      setLoading(false);
    }
  };

  // Create new phase
  const handleCreatePhase = async (values) => {
    try {
      setLoading(true);
      console.log("🔄 Creating new phase:", values);

      const phaseData = {
        planId: currentTreatmentPlan?.planId,
        patientId: patientId,
        phaseName: values.phaseName,
        description: values.description,
        phaseOrder: values.phaseOrder || apiPhases.length + 1,
        expectedDuration: values.expectedDuration,
        status: "Pending",
        startDate: values.startDate?.format("YYYY-MM-DD"),
        endDate: values.endDate?.format("YYYY-MM-DD"),
      };

      const result = await createTreatmentPhase(phaseData);

      if (result.success) {
        message.success("✅ Đã tạo giai đoạn mới thành công");
        setPhaseModal(false);
        phaseForm.resetFields();
        await loadPhasesFromAPI(currentTreatmentPlan?.planId);
      } else {
        message.error("❌ Không thể tạo giai đoạn mới");
      }
    } catch (error) {
      console.error("❌ Error creating phase:", error);
      message.error("Có lỗi khi tạo giai đoạn mới");
    } finally {
      setLoading(false);
    }
  };

  // Update existing phase
  const handleUpdatePhase = async (values) => {
    try {
      setLoading(true);
      console.log("🔄 Updating phase:", editingPhase.phaseId, values);

      const updateData = {
        phaseName: values.phaseName,
        description: values.description,
        phaseOrder: values.phaseOrder,
        expectedDuration: values.expectedDuration,
        startDate: values.startDate?.format("YYYY-MM-DD"),
        endDate: values.endDate?.format("YYYY-MM-DD"),
      };

      // Validate update data
      const fullPhaseData = { ...editingPhase, ...updateData };
      const validation =
        apiTreatmentManagement.validateTreatmentPhase(fullPhaseData);
      if (!validation.isValid) {
        throw new Error(
          `Dữ liệu không hợp lệ: ${validation.errors.join(", ")}`
        );
      }

      // Call API to update phase
      const result = await apiTreatmentManagement.updateTreatmentPhase(
        editingPhase.phaseId,
        updateData
      );

      if (result.success) {
        // Update local state with actual API response
        setApiPhases((prev) =>
          prev.map((phase) =>
            phase.phaseId === editingPhase.phaseId ? { ...result.data } : phase
          )
        );

        message.success("✅ Đã cập nhật giai đoạn thành công");
        setPhaseModal(false);
        setEditingPhase(null);
        phaseForm.resetFields();
      } else {
        throw new Error(result.message || "Không thể cập nhật giai đoạn");
      }
    } catch (error) {
      console.error("❌ Error updating phase:", error);
      message.error(error.message || "Có lỗi khi cập nhật giai đoạn");
    } finally {
      setLoading(false);
    }
  };

  // Delete phase
  const handleDeletePhase = async (phaseId) => {
    try {
      setLoading(true);
      console.log("🔄 Deleting phase:", phaseId);

      // Call API to delete phase
      const result = await apiTreatmentManagement.deleteTreatmentPhase(phaseId);

      if (result.success) {
        // Update local state
        setApiPhases((prev) =>
          prev.filter((phase) => phase.phaseId !== phaseId)
        );

        message.success("✅ Đã xóa giai đoạn thành công");
      } else {
        throw new Error(result.message || "Không thể xóa giai đoạn");
      }
    } catch (error) {
      console.error("❌ Error deleting phase:", error);
      message.error(error.message || "Có lỗi khi xóa giai đoạn");
    } finally {
      setLoading(false);
    }
  };

  // Edit phase
  const handleEditPhase = (phase) => {
    setEditingPhase(phase);
    phaseForm.setFieldsValue({
      phaseName: phase.phaseName,
      description: phase.description,
      phaseOrder: phase.phaseOrder,
      expectedDuration: phase.expectedDuration,
      startDate: phase.startDate ? dayjs(phase.startDate) : undefined,
      endDate: phase.endDate ? dayjs(phase.endDate) : undefined,
    });
    setPhaseModal(true);
  };

  // Enhanced schedule saving with API integration
  const saveScheduleToAPI = async (scheduleData) => {
    try {
      setSavingSchedule(true);
      console.log("🔄 Saving schedule to API:", scheduleData);

      // Validate schedule data before sending to API
      const validation =
        apiTreatmentManagement.validateTreatmentSchedule(scheduleData);
      if (!validation.isValid) {
        throw new Error(
          `Dữ liệu lịch điều trị không hợp lệ: ${validation.errors.join(", ")}`
        );
      }

      // Format data for API
      const formattedData =
        apiTreatmentManagement.formatScheduleDataForAPI(scheduleData);

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

  // Get status display name
  const getStatusDisplayName = (status) => {
    const statusMap = {
      Pending: "Chờ thực hiện",
      "In Progress": "Đang thực hiện",
      Completed: "Hoàn thành",
      Cancelled: "Đã hủy",
      "On Hold": "Tạm dừng",
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
    };
    return iconMap[status] || <ClockCircleOutlined />;
  };

  const handleStartDateChange = (date) => {
    if (date && template) {
      const schedule = generateScheduleFromTemplate(
        template,
        date.format("YYYY-MM-DD")
      );
      setGeneratedSchedule(schedule);
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
    const newSession = {
      id: `custom_${Date.now()}`,
      phaseId: "custom",
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

  const handleDeleteSession = (sessionId) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc muốn xóa buổi điều trị này?",
      onOk: () => {
        setGeneratedSchedule((prev) =>
          prev.filter((session) => session.id !== sessionId)
        );
        message.success("Đã xóa buổi điều trị");
      },
    });
  };

  const generateDoctorSuggestions = () => {
    let suggestions = [];

    if (examinationData?.diagnosis?.includes("tuổi cao")) {
      suggestions.push(
        "💡 Bệnh nhân tuổi cao - cân nhắc tăng tần suất theo dõi"
      );
    }

    if (examinationData?.diagnosis?.includes("AMH thấp")) {
      suggestions.push("💡 AMH thấp - theo dõi sát phản ứng buồng trứng");
    }

    if (template?.type === "IVF") {
      suggestions.push("💡 IVF - có thể cần điều chỉnh thời gian lấy trứng");
    }

    return suggestions.join("\n");
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      const scheduleData = {
        ...values,
        patientId,
        treatmentPlanId: currentTreatmentPlan?.planId,
        templateId: template?.id,
        sessions: generatedSchedule,
        totalSessions: generatedSchedule.length,
        estimatedDuration: template?.estimatedDuration,
        status: isEditing ? "updated" : "active",
        template: template,
        doctorNotes: doctorNotes,
        customSessions: customSessions,
        adjustments: scheduleAdjustments,
        startDate: values.startDate?.format("YYYY-MM-DD"),
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
        throw new Error("Lịch điều trị không được để trống");
      }

      // Save to API
      const saveResult = await saveScheduleToAPI(scheduleData);

      if (saveResult.success) {
        const actionText = isEditing ? "Cập nhật" : "Tạo";
        message.success(
          `✅ ${actionText} lịch điều trị thành công - ${scheduleData.totalSessions} buổi điều trị`
        );

        // Auto-complete first sub-step if exists
        if (subStepsData?.subSteps?.length > 0 && !isEditing) {
          setTimeout(() => {
            onSubStepComplete &&
              onSubStepComplete(0, {
                title: "Lập lịch điều trị hoàn thành",
                completedAt: new Date().toISOString(),
              });
          }, 1000);
        }

        onNext && onNext(scheduleData);
      } else {
        throw new Error(saveResult.message || "Không thể lưu lịch điều trị");
      }
    } catch (error) {
      console.error("❌ Lỗi lưu lịch điều trị:", error);
      message.error(error.message || "Có lỗi xảy ra khi lưu lịch điều trị");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSubStep = (subStepIndex) => {
    Modal.confirm({
      title: "Hoàn thành giai đoạn",
      content: `Xác nhận hoàn thành giai đoạn: ${subStepsData?.subSteps[subStepIndex]?.title}?`,
      okText: "Hoàn thành",
      cancelText: "Hủy",
      onOk: () => {
        onSubStepComplete &&
          onSubStepComplete(subStepIndex, {
            title: subStepsData.subSteps[subStepIndex].title,
            completedAt: new Date().toISOString(),
            notes: `Hoàn thành bởi bác sĩ`,
          });
      },
    });
  };

  // Enhanced refresh function
  const handleRefreshData = async () => {
    try {
      setLoadingPhases(true);
      message.info("🔄 Đang làm mới dữ liệu...");

      // Reset trạng thái để có thể tải lại dữ liệu
      setInitialDataLoaded(false);
      setCurrentTreatmentPlan(null);
      setApiPhases([]);
      setPhaseActivities({});

      await loadTreatmentData();
      message.success("✅ Đã làm mới dữ liệu thành công");
    } catch (error) {
      console.error("❌ Error refreshing data:", error);
      message.error("Có lỗi khi làm mới dữ liệu");
    }
  };

  // Columns for schedule table
  const scheduleColumns = [
    {
      title: "Ngày",
      dataIndex: "date",
      key: "date",
      render: (date) => (
        <Space direction="vertical" size="small">
          <Text strong>{dayjs(date).format("DD/MM/YYYY")}</Text>
          <Text type="secondary">{dayjs(date).format("dddd")}</Text>
        </Space>
      ),
      width: 120,
    },
    {
      title: "Giai đoạn",
      dataIndex: "phaseName",
      key: "phaseName",
      render: (text, record) => (
        <Space>
          <Tag key="main" color={record.custom ? "orange" : "blue"}>
            {record.order}. {text}
          </Tag>
          {record.modified && (
            <Tag key="modified" color="green" size="small">
              Đã sửa
            </Tag>
          )}
          {record.custom && (
            <Tag key="custom" color="purple" size="small">
              Tùy chỉnh
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: "Hoạt động",
      dataIndex: "activity",
      key: "activity",
      render: (text, record) => (
        <Space direction="vertical" size="small">
          <Text key="activity-text">{text}</Text>
          <Space>
            <Tag key="duration" icon={<ClockCircleOutlined />}>
              {record.duration} phút
            </Tag>
            <Tag key="required" color={record.required ? "red" : "green"}>
              {record.required ? "Bắt buộc" : "Tùy chọn"}
            </Tag>
          </Space>
          {scheduleAdjustments[record.id] && (
            <Text key="adjustment" type="secondary" style={{ fontSize: 12 }}>
              Sửa từ: {scheduleAdjustments[record.id].originalActivity}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      render: (type) => {
        const typeMap = {
          consultation: { color: "blue", text: "Tư vấn" },
          test: { color: "orange", text: "Xét nghiệm" },
          ultrasound: { color: "purple", text: "Siêu âm" },
          injection: { color: "red", text: "Tiêm thuốc" },
          procedure: { color: "green", text: "Thủ thuật" },
          laboratory: { color: "cyan", text: "Xét nghiệm lab" },
        };
        const config = typeMap[type] || { color: "default", text: type };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "Phòng",
      dataIndex: "room",
      key: "room",
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button
            key="edit"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditSession(record)}
            type="link"
            title="Chỉnh sửa buổi điều trị"
          />
          <Button
            key="delete"
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteSession(record.id)}
            type="link"
            danger
            title="Xóa buổi điều trị"
          />
        </Space>
      ),
    },
  ];

  // NEW: Function to fetch detailed activities for a specific phase
  const loadPhaseActivities = async (phaseId, treatmentPlanId) => {
    try {
      console.log(
        `🔄 [TreatmentScheduleForm] Loading activities for phase: ${phaseId}`
      );
      setLoadingActivities(true);

      // Call the backend API to get detailed activities
      const activitiesResponse =
        await apiTreatmentManagement.getPhaseActivities(
          phaseId,
          treatmentPlanId
        );

      if (activitiesResponse.success && activitiesResponse.data) {
        // API trả về data trực tiếp là array activities, không phải object với key activities
        const activities = Array.isArray(activitiesResponse.data)
          ? activitiesResponse.data
          : activitiesResponse.data.activities || [];

        console.log(
          `✅ [TreatmentScheduleForm] Loaded ${activities.length} activities for phase ${phaseId}`
        );

        return {
          phaseId: phaseId,
          activities: activities,
        };
      } else {
        console.warn(
          `⚠️ [TreatmentScheduleForm] No activities found for phase: ${phaseId}`
        );
        return {
          phaseId: phaseId,
          activities: [],
        };
      }
    } catch (error) {
      console.error(
        `❌ [TreatmentScheduleForm] Error loading activities for phase ${phaseId}:`,
        error
      );
      return {
        phaseId: phaseId,
        activities: [],
      };
    } finally {
      setLoadingActivities(false);
    }
  };

  // NEW: Function to load activities for all phases
  const loadAllPhaseActivities = async (phases, treatmentPlanId) => {
    console.log(
      `🔄 [TreatmentScheduleForm] Loading activities for all ${phases.length} phases`
    );

    try {
      // Load activities for each phase in parallel
      const activityPromises = phases.map((phase) =>
        loadPhaseActivities(phase.phaseId, treatmentPlanId)
      );

      const activityResults = await Promise.all(activityPromises);

      // Update phases with their activities
      const updatedPhases = phases.map((phase, index) => {
        const activityResult = activityResults[index];
        return {
          ...phase,
          activities: activityResult.activities || [],
        };
      });

      setPhaseActivities((prev) => {
        const newActivities = { ...prev };
        updatedPhases.forEach((phase) => {
          newActivities[phase.phaseId] = phase.activities;
        });
        return newActivities;
      });

      console.log(`✅ [TreatmentScheduleForm] All phase activities loaded`);
    } catch (error) {
      console.error(
        `❌ [TreatmentScheduleForm] Error loading all phase activities:`,
        error
      );
    }
  };

  // NEW: Function to toggle phase expansion
  const togglePhaseExpansion = async (phaseId, treatmentPlanId) => {
    const newExpandedPhases = new Set(expandedPhases);

    if (newExpandedPhases.has(phaseId)) {
      newExpandedPhases.delete(phaseId);
    } else {
      newExpandedPhases.add(phaseId);

      // Load activities if not already loaded
      if (!phaseActivities[phaseId]) {
        await loadPhaseActivities(phaseId, treatmentPlanId);
      }
    }

    setExpandedPhases(newExpandedPhases);
  };

  // NEW: Function to update activity status
  const updateActivityStatus = async (
    phaseId,
    activityId,
    newStatus,
    additionalData = {}
  ) => {
    try {
      console.log(
        `🔄 [TreatmentScheduleForm] Updating activity status: ${activityId} -> ${newStatus}`
      );

      // Update local state immediately for better UX
      setPhaseActivities((prev) => ({
        ...prev,
        [phaseId]:
          prev[phaseId]?.map((activity) =>
            activity.id === activityId
              ? { ...activity, status: newStatus, ...additionalData }
              : activity
          ) || [],
      }));

      // Call API to update status
      const response = await apiTreatmentManagement.updateActivityStatus(
        activityId,
        {
          status: newStatus,
          ...additionalData,
          phaseId,
          updatedAt: new Date().toISOString(),
        }
      );

      if (response.success) {
        message.success("Cập nhật trạng thái hoạt động thành công");
        console.log(
          `✅ [TreatmentScheduleForm] Activity status updated: ${activityId}`
        );
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error(
        `❌ [TreatmentScheduleForm] Error updating activity status:`,
        error
      );
      message.error("Không thể cập nhật trạng thái hoạt động");

      // Revert local state change
      setPhaseActivities((prev) => ({
        ...prev,
        [phaseId]:
          prev[phaseId]?.map((activity) =>
            activity.id === activityId
              ? { ...activity, status: activity.status } // Keep original status
              : activity
          ) || [],
      }));
    }
  };

  // NEW: Function to handle activity editing
  const handleEditActivity = (phaseId, activity) => {
    setEditingActivity({
      ...activity,
      phaseId,
    });
    setActivityModal(true);
  };

  // NEW: Function to save activity changes
  const handleSaveActivity = async (values) => {
    try {
      const { phaseId, ...activityData } = editingActivity;

      setPhaseActivities((prev) => ({
        ...prev,
        [phaseId]:
          prev[phaseId]?.map((activity) =>
            activity.id === editingActivity.id
              ? { ...activity, ...values }
              : activity
          ) || [],
      }));

      setActivityModal(false);
      setEditingActivity(null);
      message.success("Cập nhật hoạt động thành công");
    } catch (error) {
      console.error("❌ [TreatmentScheduleForm] Error saving activity:", error);
      message.error("Không thể lưu thông tin hoạt động");
    }
  };

  // Debug log trước khi render
  console.log("🎨 [TreatmentScheduleForm] Rendering with state:", {
    initialDataLoaded,
    loadingPhases,
    currentTreatmentPlan: !!currentTreatmentPlan,
    apiPhasesCount: apiPhases.length,
    templateExists: !!template,
    generatedScheduleLength: generatedSchedule.length,
    phaseActivitiesKeys: Object.keys(phaseActivities),
  });

  return (
    <div>
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Title level={3}>Lập Lịch Điều Trị Theo Phác Đồ</Title>
          <Button
            icon={<ReloadOutlined spin={loadingPhases} />}
            onClick={handleRefreshData}
            disabled={loadingPhases}
            title="Làm mới dữ liệu"
          >
            Làm mới
          </Button>
        </div>

        {loadingPhases && (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Spin size="large" />
            <div style={{ marginTop: "16px" }}>
              <Text>Đang tải thông tin điều trị...</Text>
            </div>
          </div>
        )}

        {!loadingPhases && !template ? (
          <Alert
            message="Chưa có phác đồ điều trị"
            description="Vui lòng hoàn thành bước lập phác đồ điều trị trước khi lập lịch"
            type="warning"
            showIcon
            action={
              <Button
                type="primary"
                onClick={() => {
                  console.log("Current treatment plan:", treatmentPlan);
                  message.info("Vui lòng quay lại bước lập phác đồ");
                }}
              >
                Quay lại lập phác đồ
              </Button>
            }
          />
        ) : (
          !loadingPhases && (
            <>
              <Alert
                message="Lịch trình được tự động tạo dựa trên phác đồ điều trị đã chọn"
                description={
                  <div>
                    <Text strong>Phác đồ:</Text>{" "}
                    {treatmentPlan?.templateName ||
                      template?.name ||
                      "Chưa có phác đồ"}
                    <br />
                    <Text strong>Tổng thời gian:</Text>{" "}
                    {template?.estimatedDuration || "N/A"}
                    {treatmentPlan?.customizedPhases > 0 && (
                      <>
                        <br />
                        <Text strong style={{ color: "#ff7a00" }}>
                          ⚙️ Đã tùy chỉnh {treatmentPlan.customizedPhases} giai
                          đoạn
                        </Text>
                      </>
                    )}
                  </div>
                }
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />

              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={8}>
                  <Text strong>Bệnh nhân: </Text>
                  <Text>{patientInfo?.name || "Không có thông tin"}</Text>
                </Col>
                <Col span={8}>
                  <Text strong>Loại điều trị: </Text>
                  <Tag color={template?.type === "IVF" ? "blue" : "green"}>
                    {template?.type || "N/A"}
                  </Tag>
                  {treatmentPlan?.treatmentType &&
                    treatmentPlan.treatmentType !== template?.type && (
                      <Tag color="orange">
                        Đã cập nhật: {treatmentPlan.treatmentType}
                      </Tag>
                    )}
                </Col>
                <Col span={8}>
                  <Text strong>Tỷ lệ thành công: </Text>
                  <Text>
                    {template?.successRate ||
                      treatmentPlan?.successRate ||
                      "N/A"}
                    %
                  </Text>
                </Col>
              </Row>

              {template && (
                <>
                  <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={4}>
                      <Statistic
                        title="Tổng giai đoạn"
                        value={
                          apiPhases.length > 0
                            ? apiPhases.length
                            : template.phases?.length || 0
                        }
                        suffix="giai đoạn"
                        prefix={<CalendarOutlined />}
                      />
                    </Col>
                    <Col span={4}>
                      <Statistic
                        title="Đang thực hiện"
                        value={
                          apiPhases.filter((p) => p.status === "In Progress")
                            .length
                        }
                        suffix="giai đoạn"
                        prefix={<PlayCircleOutlined />}
                        valueStyle={{ color: "#1890ff" }}
                      />
                    </Col>
                    <Col span={4}>
                      <Statistic
                        title="Hoàn thành"
                        value={
                          apiPhases.filter((p) => p.status === "Completed")
                            .length
                        }
                        suffix="giai đoạn"
                        prefix={<CheckCircleOutlined />}
                        valueStyle={{ color: "#52c41a" }}
                      />
                    </Col>
                    <Col span={4}>
                      <Statistic
                        title="Tổng hoạt động"
                        value={generatedSchedule.length}
                        suffix="hoạt động"
                        prefix={<MedicineBoxOutlined />}
                      />
                    </Col>
                    <Col span={4}>
                      <Statistic
                        title="Thời gian dự kiến"
                        value={template.estimatedDuration}
                        prefix={<ClockCircleOutlined />}
                      />
                    </Col>
                    <Col span={4}>
                      <Statistic
                        title="Chi phí dự kiến"
                        value={template.cost}
                        prefix={<DollarOutlined />}
                      />
                    </Col>
                  </Row>

                  {/* API Phase Management Section */}
                  <Card
                    title={
                      <Space>
                        <SettingOutlined />
                        <Text strong>Quản Lý Giai Đoạn Điều Trị</Text>
                        <Button
                          size="small"
                          icon={<SyncOutlined spin={loadingPhases} />}
                          onClick={() =>
                            loadPhasesFromAPI(currentTreatmentPlan?.planId)
                          }
                          type="link"
                          title="Làm mới dữ liệu giai đoạn"
                        />
                      </Space>
                    }
                    style={{ marginBottom: 16 }}
                    extra={
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                          setEditingPhase(null);
                          phaseForm.resetFields();
                          setPhaseModal(true);
                        }}
                        disabled={!currentTreatmentPlan}
                      >
                        Thêm Giai Đoạn
                      </Button>
                    }
                  >
                    {loadingPhases || autoImporting ? (
                      <div style={{ textAlign: "center", padding: "20px" }}>
                        <SyncOutlined
                          spin
                          style={{ fontSize: "24px", color: "#1890ff" }}
                        />
                        <div style={{ marginTop: "8px" }}>
                          {autoImporting
                            ? "Đang tự động tạo giai đoạn từ phác đồ..."
                            : "Đang tải thông tin giai đoạn..."}
                        </div>
                      </div>
                    ) : apiPhases.length > 0 ? (
                      <div>
                        {/* Phase Status Overview */}
                        <Row gutter={16} style={{ marginBottom: 16 }}>
                          <Col span={24}>
                            <Steps
                              current={apiPhases.findIndex(
                                (phase) => phase.status === "In Progress"
                              )}
                              items={apiPhases.map((phase, index) => ({
                                key: `phase-step-${phase.phaseId || index}`,
                                title: (
                                  <Space direction="vertical" size="small">
                                    <Text strong>{phase.phaseName}</Text>
                                    <Tag
                                      color={getStatusColor(phase.status)}
                                      icon={getStatusIcon(phase.status)}
                                    >
                                      {getStatusDisplayName(phase.status)}
                                    </Tag>
                                  </Space>
                                ),
                                description: (
                                  <div style={{ fontSize: "12px" }}>
                                    <div>{phase.description}</div>
                                    {phase.startDate && (
                                      <div>
                                        Bắt đầu:{" "}
                                        {dayjs(phase.startDate).format(
                                          "DD/MM/YYYY"
                                        )}
                                      </div>
                                    )}
                                    {phase.endDate && (
                                      <div>
                                        Kết thúc:{" "}
                                        {dayjs(phase.endDate).format(
                                          "DD/MM/YYYY"
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ),
                                status:
                                  phase.status === "Completed"
                                    ? "finish"
                                    : phase.status === "In Progress"
                                    ? "process"
                                    : phase.status === "Cancelled"
                                    ? "error"
                                    : "wait",
                              }))}
                            />
                          </Col>
                        </Row>

                        {/* Phase Management Table */}
                        <Table
                          dataSource={apiPhases}
                          pagination={false}
                          loading={loadingPhases}
                          rowKey={(record) =>
                            record.statusId ||
                            record.phaseId ||
                            `phase-${record.phaseName || "unknown"}-${
                              record.phaseOrder || Math.random()
                            }`
                          }
                          expandable={{
                            expandedRowKeys: Array.from(expandedPhases),
                            onExpand: (expanded, record) => {
                              if (expanded) {
                                togglePhaseExpansion(
                                  record.phaseId,
                                  currentTreatmentPlan?.planId ||
                                    treatmentPlan?.planId
                                );
                              } else {
                                setExpandedPhases((prev) => {
                                  const newSet = new Set(prev);
                                  newSet.delete(record.phaseId);
                                  return newSet;
                                });
                              }
                            },
                            expandedRowRender: (record) => {
                              const activities =
                                phaseActivities[record.phaseId] || [];

                              if (loadingActivities) {
                                return (
                                  <div
                                    style={{
                                      textAlign: "center",
                                      padding: "20px",
                                    }}
                                  >
                                    <Spin tip="Đang tải hoạt động..." />
                                  </div>
                                );
                              }

                              if (activities.length === 0) {
                                return (
                                  <div
                                    style={{
                                      padding: "16px",
                                      textAlign: "center",
                                      color: "#999",
                                    }}
                                  >
                                    <Text type="secondary">
                                      Chưa có hoạt động nào trong giai đoạn này
                                    </Text>
                                  </div>
                                );
                              }

                              const activityColumns = [
                                {
                                  title: "STT",
                                  dataIndex: "order",
                                  key: "order",
                                  width: 60,
                                  render: (order) => (
                                    <Text strong>#{order}</Text>
                                  ),
                                },
                                {
                                  title: "Hoạt động",
                                  dataIndex: "name",
                                  key: "name",
                                  render: (name, activity) => (
                                    <Space direction="vertical" size="small">
                                      <Text key="name" strong>
                                        {name}
                                      </Text>
                                      <Space size="small">
                                        <Tag key="type" color="blue">
                                          {activity.type || "examination"}
                                        </Tag>
                                        {activity.isRequired && (
                                          <Tag key="required" color="red">
                                            Bắt buộc
                                          </Tag>
                                        )}
                                      </Space>
                                    </Space>
                                  ),
                                },
                                {
                                  title: "Trạng thái",
                                  dataIndex: "status",
                                  key: "status",
                                  width: 120,
                                  render: (status, activity) => {
                                    const statusConfig = {
                                      pending: {
                                        color: "default",
                                        text: "Chờ thực hiện",
                                      },
                                      "in-progress": {
                                        color: "processing",
                                        text: "Đang thực hiện",
                                      },
                                      completed: {
                                        color: "success",
                                        text: "Hoàn thành",
                                      },
                                      cancelled: {
                                        color: "error",
                                        text: "Đã hủy",
                                      },
                                      delayed: {
                                        color: "warning",
                                        text: "Trì hoãn",
                                      },
                                    };

                                    const config =
                                      statusConfig[status] ||
                                      statusConfig.pending;
                                    return (
                                      <Select
                                        value={status}
                                        style={{ width: "100%" }}
                                        size="small"
                                        onChange={(newStatus) =>
                                          updateActivityStatus(
                                            record.phaseId,
                                            activity.id,
                                            newStatus
                                          )
                                        }
                                      >
                                        <Option value="pending">
                                          <Badge
                                            status={statusConfig.pending.color}
                                            text={statusConfig.pending.text}
                                          />
                                        </Option>
                                        <Option value="in-progress">
                                          <Badge
                                            status={
                                              statusConfig["in-progress"].color
                                            }
                                            text={
                                              statusConfig["in-progress"].text
                                            }
                                          />
                                        </Option>
                                        <Option value="completed">
                                          <Badge
                                            status={
                                              statusConfig.completed.color
                                            }
                                            text={statusConfig.completed.text}
                                          />
                                        </Option>
                                        <Option value="cancelled">
                                          <Badge
                                            status={
                                              statusConfig.cancelled.color
                                            }
                                            text={statusConfig.cancelled.text}
                                          />
                                        </Option>
                                        <Option value="delayed">
                                          <Badge
                                            status={statusConfig.delayed.color}
                                            text={statusConfig.delayed.text}
                                          />
                                        </Option>
                                      </Select>
                                    );
                                  },
                                },
                                {
                                  title: "Thời gian",
                                  key: "timing",
                                  width: 150,
                                  render: (_, activity) => (
                                    <Space direction="vertical" size="small">
                                      <Text key="duration" type="secondary">
                                        <ClockCircleOutlined />{" "}
                                        {activity.estimatedDuration || 60} phút
                                      </Text>
                                      {activity.scheduledDate && (
                                        <Text key="scheduled" type="secondary">
                                          <CalendarOutlined />{" "}
                                          {dayjs(activity.scheduledDate).format(
                                            "DD/MM/YYYY HH:mm"
                                          )}
                                        </Text>
                                      )}
                                    </Space>
                                  ),
                                },
                                {
                                  title: "Địa điểm",
                                  key: "location",
                                  width: 120,
                                  render: (_, activity) => (
                                    <Space direction="vertical" size="small">
                                      <Text key="room" type="secondary">
                                        {activity.room || "TBD"}
                                      </Text>
                                      <Text
                                        key="staff"
                                        type="secondary"
                                        style={{ fontSize: "12px" }}
                                      >
                                        {activity.assignedStaff ||
                                          "Chưa phân công"}
                                      </Text>
                                    </Space>
                                  ),
                                },
                                {
                                  title: "Chi phí",
                                  dataIndex: "cost",
                                  key: "cost",
                                  width: 100,
                                  render: (cost) => (
                                    <Text strong>
                                      {cost
                                        ? `${cost.toLocaleString("vi-VN")} VNĐ`
                                        : "Miễn phí"}
                                    </Text>
                                  ),
                                },
                                {
                                  title: "Thao tác",
                                  key: "actions",
                                  width: 100,
                                  render: (_, activity) => (
                                    <Space size="small">
                                      <Tooltip title="Chỉnh sửa hoạt động">
                                        <Button
                                          type="text"
                                          icon={<EditOutlined />}
                                          size="small"
                                          onClick={() =>
                                            handleEditActivity(
                                              record.phaseId,
                                              activity
                                            )
                                          }
                                        />
                                      </Tooltip>
                                      {activity.status === "pending" && (
                                        <Tooltip title="Bắt đầu thực hiện">
                                          <Button
                                            type="text"
                                            icon={<PlayCircleOutlined />}
                                            size="small"
                                            onClick={() =>
                                              updateActivityStatus(
                                                record.phaseId,
                                                activity.id,
                                                "in-progress"
                                              )
                                            }
                                          />
                                        </Tooltip>
                                      )}
                                      {activity.status === "in-progress" && (
                                        <Tooltip title="Hoàn thành">
                                          <Button
                                            type="text"
                                            icon={<CheckCircleOutlined />}
                                            size="small"
                                            style={{ color: "#52c41a" }}
                                            onClick={() =>
                                              updateActivityStatus(
                                                record.phaseId,
                                                activity.id,
                                                "completed"
                                              )
                                            }
                                          />
                                        </Tooltip>
                                      )}
                                    </Space>
                                  ),
                                },
                              ];

                              return (
                                <div style={{ margin: "16px 0" }}>
                                  <Space
                                    direction="vertical"
                                    style={{ width: "100%" }}
                                  >
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                      }}
                                    >
                                      <Title level={5} style={{ margin: 0 }}>
                                        Chi tiết hoạt động - {record.phaseName}
                                      </Title>
                                      <Space>
                                        <Text type="secondary">
                                          Tổng: {activities.length} hoạt động
                                        </Text>
                                        <Text type="secondary">
                                          Hoàn thành:{" "}
                                          {
                                            activities.filter(
                                              (a) => a.status === "completed"
                                            ).length
                                          }
                                        </Text>
                                      </Space>
                                    </div>

                                    <Table
                                      dataSource={activities}
                                      columns={activityColumns}
                                      pagination={false}
                                      size="small"
                                      rowKey={(record) =>
                                        record.id ||
                                        `activity-${
                                          record.name || "unknown"
                                        }-${Math.random()
                                          .toString(36)
                                          .substr(2, 9)}`
                                      }
                                      bordered
                                      style={{ backgroundColor: "#fafafa" }}
                                    />
                                  </Space>
                                </div>
                              );
                            },
                            expandIcon: ({ expanded, onExpand, record }) => (
                              <Button
                                type="text"
                                icon={
                                  expanded ? (
                                    <MinusOutlined />
                                  ) : (
                                    <PlusOutlined />
                                  )
                                }
                                onClick={(e) => onExpand(record, e)}
                                title={
                                  expanded
                                    ? "Thu gọn"
                                    : "Xem chi tiết hoạt động"
                                }
                              />
                            ),
                          }}
                          columns={[
                            {
                              title: "Giai đoạn",
                              dataIndex: "phaseName",
                              key: "phaseName",
                              render: (text, record) => (
                                <Space direction="vertical" size="small">
                                  <Text
                                    key="name"
                                    strong
                                    style={{ fontSize: "16px" }}
                                  >
                                    {text}
                                  </Text>
                                  <Text key="order" type="secondary">
                                    Thứ tự: {record.phaseOrder}
                                  </Text>
                                  {record.expectedDuration && (
                                    <Tag
                                      key="duration"
                                      icon={<ClockCircleOutlined />}
                                      color="blue"
                                    >
                                      {record.expectedDuration}
                                    </Tag>
                                  )}
                                </Space>
                              ),
                            },
                            {
                              title: "Thời gian",
                              key: "dates",
                              width: 200,
                              render: (_, record) => (
                                <Space direction="vertical" size="small">
                                  {record.startDate && (
                                    <Text
                                      key="start"
                                      style={{ fontSize: "12px" }}
                                    >
                                      <CalendarOutlined /> Bắt đầu:{" "}
                                      {dayjs(record.startDate).format(
                                        "DD/MM/YYYY"
                                      )}
                                    </Text>
                                  )}
                                  {record.endDate && (
                                    <Text
                                      key="end"
                                      style={{ fontSize: "12px" }}
                                    >
                                      <CheckCircleOutlined /> Kết thúc:{" "}
                                      {dayjs(record.endDate).format(
                                        "DD/MM/YYYY"
                                      )}
                                    </Text>
                                  )}
                                </Space>
                              ),
                            },
                            {
                              title: "Thao tác",
                              key: "actions",
                              width: 120,
                              render: (_, record) => (
                                <Space size="small">
                                  <Tooltip
                                    key="edit-tooltip"
                                    title="Chỉnh sửa giai đoạn"
                                  >
                                    <Button
                                      size="small"
                                      icon={<EditOutlined />}
                                      onClick={() => handleEditPhase(record)}
                                      type="link"
                                      disabled={loading}
                                    />
                                  </Tooltip>
                                  <Popconfirm
                                    key="delete-confirm"
                                    title="Xóa giai đoạn này?"
                                    description="Hành động này không thể hoàn tác."
                                    onConfirm={() =>
                                      handleDeletePhase(record.phaseId)
                                    }
                                    okText="Xóa"
                                    cancelText="Hủy"
                                    disabled={loading}
                                  >
                                    <Tooltip title="Xóa giai đoạn">
                                      <Button
                                        size="small"
                                        icon={<DeleteOutlined />}
                                        type="link"
                                        danger
                                        disabled={loading}
                                      />
                                    </Tooltip>
                                  </Popconfirm>
                                </Space>
                              ),
                            },
                          ]}
                        />
                      </div>
                    ) : (
                      <Alert
                        message="Chưa có giai đoạn điều trị"
                        description={
                          treatmentPlan?.finalPlan?.phases
                            ? "Đang tự động tạo giai đoạn từ phác đồ điều trị..."
                            : "Chưa có giai đoạn điều trị nào được tạo. Hãy tạo giai đoạn đầu tiên hoặc hoàn thành phác đồ điều trị."
                        }
                        type="info"
                        showIcon
                        action={
                          <Space>
                            <Button
                              size="small"
                              onClick={() => {
                                setEditingPhase(null);
                                phaseForm.resetFields();
                                setPhaseModal(true);
                              }}
                              disabled={!currentTreatmentPlan}
                            >
                              Tạo Giai Đoạn
                            </Button>
                            {treatmentPlan?.finalPlan?.phases && (
                              <Button
                                size="small"
                                icon={<SyncOutlined spin={loading} />}
                                onClick={async () => {
                                  try {
                                    setLoading(true);
                                    const templatePhases =
                                      treatmentPlan.finalPlan.phases;
                                    let importedCount = 0;

                                    const treatmentType =
                                      currentTreatmentPlan?.treatmentType ||
                                      treatmentPlan?.treatmentType ||
                                      "IUI";
                                    const meaningfulPhaseNames =
                                      getMeaningfulPhaseNames(treatmentType);

                                    for (
                                      let i = 0;
                                      i < templatePhases.length;
                                      i++
                                    ) {
                                      const phase = templatePhases[i];
                                      const result = await createTreatmentPhase(
                                        {
                                          planId: currentTreatmentPlan?.planId,
                                          patientId: patientId,
                                          phaseName:
                                            meaningfulPhaseNames[i + 1] ||
                                            phase.name ||
                                            `Giai đoạn ${i + 1}`,
                                          description:
                                            phase.description ||
                                            `Giai đoạn ${i + 1}: ${
                                              meaningfulPhaseNames[i + 1] ||
                                              phase.name
                                            }`,
                                          phaseOrder: i + 1,
                                          expectedDuration:
                                            phase.duration || "5-7 ngày",
                                          status: "Pending",
                                        }
                                      );
                                      if (result.success) importedCount++;
                                    }

                                    if (importedCount > 0) {
                                      message.success(
                                        `✅ Đã tạo ${importedCount} giai đoạn từ phác đồ`
                                      );
                                      await loadPhasesFromAPI(
                                        currentTreatmentPlan?.planId
                                      );
                                    }
                                  } catch (error) {
                                    message.error(
                                      "❌ Không thể tạo giai đoạn từ phác đồ"
                                    );
                                  } finally {
                                    setLoading(false);
                                  }
                                }}
                                disabled={!currentTreatmentPlan || loading}
                              >
                                Import Từ Phác Đồ
                              </Button>
                            )}
                          </Space>
                        }
                      />
                    )}
                  </Card>

                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                      startDate: dayjs().add(3, "days"),
                      preferredTime: dayjs("09:00", "HH:mm"),
                    }}
                  >
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          label="Ngày bắt đầu điều trị"
                          name="startDate"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng chọn ngày bắt đầu",
                            },
                          ]}
                        >
                          <DatePicker
                            style={{ width: "100%" }}
                            placeholder="Chọn ngày bắt đầu điều trị"
                            onChange={handleStartDateChange}
                            disabledDate={(current) =>
                              current && current < dayjs().startOf("day")
                            }
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="Giờ hẹn ưu tiên"
                          name="preferredTime"
                          tooltip="Giờ mặc định cho các buổi hẹn, có thể điều chỉnh từng buổi riêng"
                        >
                          <TimePicker
                            style={{ width: "100%" }}
                            format="HH:mm"
                            placeholder="Chọn giờ hẹn ưu tiên"
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item label="Ghi chú đặc biệt" name="notes">
                      <Select
                        mode="multiple"
                        placeholder="Chọn ghi chú đặc biệt"
                        allowClear
                      >
                        <Option value="morning_preferred">
                          Ưu tiên buổi sáng
                        </Option>
                        <Option value="afternoon_preferred">
                          Ưu tiên buổi chiều
                        </Option>
                        <Option value="weekend_available">
                          Có thể cuối tuần
                        </Option>
                        <Option value="flexible_time">
                          Thời gian linh hoạt
                        </Option>
                        <Option value="urgent">Khẩn cấp</Option>
                      </Select>
                    </Form.Item>

                    <Divider>Lịch Trình Chi Tiết</Divider>

                    {/* Doctor Controls */}
                    <Card
                      title="🔧 Điều chỉnh bác sĩ"
                      size="small"
                      style={{ marginBottom: 16 }}
                    >
                      <Space>
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={handleAddCustomSession}
                        >
                          Thêm buổi tùy chỉnh
                        </Button>
                        <Button
                          icon={<CalendarOutlined />}
                          onClick={() => {
                            const suggestions = generateDoctorSuggestions();
                            if (suggestions) {
                              setDoctorNotes(suggestions);
                            }
                          }}
                        >
                          Gợi ý điều chỉnh
                        </Button>
                        <Text type="secondary">
                          {Object.keys(scheduleAdjustments).length > 0 &&
                            `Đã điều chỉnh ${
                              Object.keys(scheduleAdjustments).length
                            } buổi điều trị`}
                        </Text>
                      </Space>
                    </Card>

                    {/* Doctor Suggestions */}
                    {(doctorNotes || generateDoctorSuggestions()) && (
                      <Alert
                        message="💡 Gợi ý điều chỉnh cho bác sĩ"
                        description={
                          <div>
                            {generateDoctorSuggestions() && (
                              <pre
                                style={{
                                  whiteSpace: "pre-line",
                                  fontFamily: "inherit",
                                }}
                              >
                                {generateDoctorSuggestions()}
                              </pre>
                            )}
                            <Input.TextArea
                              placeholder="Thêm ghi chú của bác sĩ..."
                              value={doctorNotes}
                              onChange={(e) => setDoctorNotes(e.target.value)}
                              rows={3}
                              style={{ marginTop: 8 }}
                            />
                          </div>
                        }
                        type="info"
                        showIcon
                        style={{ marginBottom: 16 }}
                      />
                    )}

                    {/* Sub-steps progress integration */}
                    {subStepsData?.subSteps?.length > 0 && (
                      <Card
                        title={
                          <Space>
                            <CalendarOutlined />
                            Tiến trình giai đoạn điều trị
                            <Tag color="blue">
                              {subStepsData.completedSubSteps.length}/
                              {subStepsData.subSteps.length} hoàn thành
                            </Tag>
                          </Space>
                        }
                        style={{ marginBottom: 16 }}
                        size="small"
                      >
                        <Row gutter={16}>
                          <Col span={16}>
                            <Timeline
                              size="small"
                              items={subStepsData.subSteps.map(
                                (subStep, index) => ({
                                  key: `substep-timeline-${index}`,
                                  color:
                                    subStepsData.completedSubSteps.includes(
                                      index
                                    )
                                      ? "green"
                                      : index === subStepsData.currentSubStep
                                      ? "blue"
                                      : "gray",
                                  dot: subStepsData.completedSubSteps.includes(
                                    index
                                  ) ? (
                                    <CheckCircleOutlined
                                      style={{ color: "green" }}
                                    />
                                  ) : index === subStepsData.currentSubStep ? (
                                    <PlayCircleOutlined
                                      style={{ color: "blue" }}
                                    />
                                  ) : (
                                    <ClockCircleOutlined
                                      style={{ color: "gray" }}
                                    />
                                  ),
                                  children: (
                                    <div>
                                      <Space>
                                        <Text
                                          strong={
                                            index ===
                                            subStepsData.currentSubStep
                                          }
                                          type={
                                            subStepsData.completedSubSteps.includes(
                                              index
                                            )
                                              ? "success"
                                              : undefined
                                          }
                                        >
                                          {subStep.title}
                                        </Text>
                                        {subStepsData.completedSubSteps.includes(
                                          index
                                        ) && (
                                          <Tag color="green" size="small">
                                            Hoàn thành
                                          </Tag>
                                        )}
                                        {index ===
                                          subStepsData.currentSubStep && (
                                          <Tag color="blue" size="small">
                                            Hiện tại
                                          </Tag>
                                        )}
                                      </Space>
                                      <br />
                                      <Text
                                        type="secondary"
                                        style={{ fontSize: "12px" }}
                                      >
                                        {subStep.description} •{" "}
                                        {subStep.duration}
                                      </Text>
                                    </div>
                                  ),
                                })
                              )}
                            />
                          </Col>
                          <Col span={8}>
                            <Space
                              direction="vertical"
                              style={{ width: "100%" }}
                            >
                              <Statistic
                                title="Giai đoạn hiện tại"
                                value={
                                  subStepsData.subSteps[
                                    subStepsData.currentSubStep
                                  ]?.title
                                }
                                prefix={<PlayCircleOutlined />}
                              />
                              <Button
                                type="primary"
                                onClick={() =>
                                  handleCompleteSubStep(
                                    subStepsData.currentSubStep
                                  )
                                }
                                disabled={subStepsData.completedSubSteps.includes(
                                  subStepsData.currentSubStep
                                )}
                                style={{ width: "100%" }}
                              >
                                ✅ Hoàn thành giai đoạn này
                              </Button>
                              <Text
                                type="secondary"
                                style={{
                                  fontSize: "12px",
                                  textAlign: "center",
                                  display: "block",
                                }}
                              >
                                Hoàn thành giai đoạn để tiếp tục quy trình
                              </Text>
                            </Space>
                          </Col>
                        </Row>
                      </Card>
                    )}

                    {/* Schedule Details */}
                    <Card title="📋 Lịch trình chi tiết" size="small">
                      <Table
                        columns={scheduleColumns}
                        dataSource={generatedSchedule}
                        pagination={false}
                        size="small"
                        rowKey={(record) =>
                          record.id ||
                          `schedule-${record.phaseName || "unknown"}-${
                            record.activity || "activity"
                          }-${
                            record.date || new Date().getTime()
                          }-${Math.random().toString(36).substr(2, 9)}`
                        }
                        scroll={{ y: 400 }}
                        loading={savingSchedule}
                      />
                    </Card>

                    <Form.Item style={{ marginTop: 24 }}>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading || savingSchedule}
                        size="large"
                        style={{ marginRight: 8 }}
                      >
                        {loading || savingSchedule
                          ? "Đang lưu..."
                          : "Xác Nhận Lịch Điều Trị"}
                      </Button>
                      <Button size="large" disabled={loading || savingSchedule}>
                        Hủy
                      </Button>
                    </Form.Item>
                  </Form>
                </>
              )}
            </>
          )
        )}

        {/* Session Edit Modal */}
        <Modal
          title={
            editingSession?.custom
              ? "Thêm buổi tùy chỉnh"
              : "Chỉnh sửa buổi điều trị"
          }
          open={sessionModal}
          onOk={() => sessionForm.submit()}
          onCancel={() => {
            setSessionModal(false);
            setEditingSession(null);
          }}
          width={800}
          okText="Lưu thay đổi"
          cancelText="Hủy"
          confirmLoading={loading}
        >
          <Form
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
          title={
            <Space>
              <SettingOutlined />
              <Text strong>
                {editingPhase ? "Chỉnh Sửa Giai Đoạn" : "Tạo Giai Đoạn Mới"}
              </Text>
            </Space>
          }
          open={phaseModal}
          onOk={() => phaseForm.submit()}
          onCancel={() => {
            setPhaseModal(false);
            setEditingPhase(null);
            phaseForm.resetFields();
          }}
          width={800}
          okText={editingPhase ? "Cập Nhật" : "Tạo Mới"}
          cancelText="Hủy"
          confirmLoading={loading}
        >
          <Form
            form={phaseForm}
            layout="vertical"
            onFinish={editingPhase ? handleUpdatePhase : handleCreatePhase}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Tên giai đoạn"
                  name="phaseName"
                  rules={[
                    { required: true, message: "Vui lòng nhập tên giai đoạn" },
                  ]}
                >
                  <Input placeholder="VD: Kích thích buồng trứng" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Thứ tự"
                  name="phaseOrder"
                  rules={[{ required: true, message: "Vui lòng nhập thứ tự" }]}
                >
                  <InputNumber
                    min={1}
                    max={20}
                    style={{ width: "100%" }}
                    placeholder="1"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Mô tả"
              name="description"
              rules={[
                { required: true, message: "Vui lòng nhập mô tả giai đoạn" },
              ]}
            >
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

            {editingPhase && (
              <Alert
                message="Thông tin giai đoạn"
                description={
                  <div>
                    <Text>ID: {editingPhase.phaseId}</Text>
                    <br />
                    <Text>Trạng thái hiện tại: </Text>
                    <Tag
                      color={getStatusColor(editingPhase.status)}
                      icon={getStatusIcon(editingPhase.status)}
                    >
                      {getStatusDisplayName(editingPhase.status)}
                    </Tag>
                    <br />
                    <Text>
                      Tạo lúc:{" "}
                      {editingPhase.createdDate
                        ? dayjs(editingPhase.createdDate).format(
                            "DD/MM/YYYY HH:mm"
                          )
                        : "N/A"}
                    </Text>
                  </div>
                }
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}
          </Form>
        </Modal>
      </Card>

      {/* Activity Detail Modal */}
      <Modal
        title="Chi tiết hoạt động"
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
            Lưu thay đổi
          </Button>,
        ]}
        width={800}
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
                    { required: true, message: "Vui lòng nhập tên hoạt động" },
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
                    { required: true, message: "Vui lòng chọn loại hoạt động" },
                  ]}
                >
                  <Select placeholder="Chọn loại hoạt động">
                    <Option value="examination">Khám lâm sàng</Option>
                    <Option value="test">Xét nghiệm</Option>
                    <Option value="procedure">Thủ thuật</Option>
                    <Option value="surgery">Phẫu thuật</Option>
                    <Option value="medication">Dùng thuốc</Option>
                    <Option value="consultation">Tư vấn</Option>
                    <Option value="monitoring">Theo dõi</Option>
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
                  rules={[{ required: true, message: "Vui lòng nhập thứ tự" }]}
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

      {/* Phase Management Modal */}
      <Modal
        title={editingPhase ? "Chỉnh sửa giai đoạn" : "Thêm giai đoạn mới"}
        open={phaseModal}
        onCancel={() => {
          setPhaseModal(false);
          setEditingPhase(null);
          phaseForm.resetFields();
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
            loading={loading}
          >
            {editingPhase ? "Cập nhật" : "Thêm giai đoạn"}
          </Button>,
        ]}
        width={600}
      >
        <Form
          form={phaseForm}
          layout="vertical"
          onFinish={editingPhase ? handleUpdatePhase : handleCreatePhase}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Tên giai đoạn"
                name="phaseName"
                rules={[
                  { required: true, message: "Vui lòng nhập tên giai đoạn" },
                ]}
              >
                <Input placeholder="VD: Kích thích buồng trứng" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Thứ tự"
                name="phaseOrder"
                rules={[{ required: true, message: "Vui lòng nhập thứ tự" }]}
              >
                <InputNumber
                  min={1}
                  max={20}
                  style={{ width: "100%" }}
                  placeholder="1"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Mô tả"
            name="description"
            rules={[
              { required: true, message: "Vui lòng nhập mô tả giai đoạn" },
            ]}
          >
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
                rules={[{ required: true, message: "Vui lòng nhập thời gian" }]}
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

          {editingPhase && (
            <Alert
              message="Thông tin giai đoạn"
              description={
                <div>
                  <Text>ID: {editingPhase.phaseId}</Text>
                  <br />
                  <Text>Trạng thái hiện tại: </Text>
                  <Tag
                    color={getStatusColor(editingPhase.status)}
                    icon={getStatusIcon(editingPhase.status)}
                  >
                    {getStatusDisplayName(editingPhase.status)}
                  </Tag>
                  <br />
                  <Text>
                    Tạo lúc:{" "}
                    {editingPhase.createdDate
                      ? dayjs(editingPhase.createdDate).format(
                          "DD/MM/YYYY HH:mm"
                        )
                      : "N/A"}
                  </Text>
                </div>
              }
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default TreatmentScheduleForm;
