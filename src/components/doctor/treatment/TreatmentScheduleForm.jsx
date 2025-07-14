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

  // Load phases and treatment plan when component mounts
  useEffect(() => {
    console.log(
      `🔄 [TreatmentScheduleForm] Component mounted for patient: ${patientId}`
    );
    if (patientId) {
      loadTreatmentData();
    }
  }, [patientId]);

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
              planId: currentTreatmentPlan.planId || currentTreatmentPlan.id,
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
              order: i + 1,
              estimatedDuration: phase.duration || "5-7 ngày",
              status: "Pending",
              startDate: null,
              endDate: null,
              createdBy: user?.id,
              createdAt: new Date().toISOString(),
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
    try {
      setLoadingPhases(true);
      console.log(
        `🔄 [TreatmentScheduleForm] Loading treatment data for patient: ${patientId}`
      );

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

      // Load existing schedule if any
      await loadExistingSchedule();
    } catch (error) {
      console.error("❌ Error loading treatment data:", error);
      message.error("Không thể tải thông tin điều trị từ hệ thống");
    } finally {
      setLoadingPhases(false);
    }
  };

  // Enhanced function to load phases from API
  const loadPhasesFromAPI = async (treatmentPlanId = null) => {
    try {
      console.log(
        `🔄 [TreatmentScheduleForm] Loading phases for patient: ${patientId}, planId: ${treatmentPlanId}`
      );

      let phasesResult;

      if (treatmentPlanId) {
        // Load phases for specific treatment plan
        phasesResult = await apiTreatmentManagement.getTreatmentPlanPhases(
          treatmentPlanId
        );
      } else {
        // Load phases by patient
        phasesResult = await apiTreatmentManagement.getPatientTreatmentPhases(
          patientId
        );
      }

      if (phasesResult.success && phasesResult.data) {
        const fixedPhases = fixPhaseNames(phasesResult.data);
        setApiPhases(fixedPhases);
        console.log("✅ Phases loaded successfully:", fixedPhases);
      } else {
        console.warn("⚠️ No phases found:", phasesResult.message);
        setApiPhases([]);
      }
    } catch (error) {
      console.error("❌ Error loading phases:", error);
      message.error("Không thể tải thông tin giai đoạn điều trị");
      setApiPhases([]);
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
      if (
        treatmentPlan?.treatmentSteps &&
        treatmentPlan.treatmentSteps.length > 0
      ) {
        // Map from treatmentSteps (standard backend format)
        templateData = {
          name: treatmentPlan.planName || "Phác đồ từ backend",
          type: treatmentPlan.treatmentType || "N/A",
          estimatedDuration: treatmentPlan.estimatedDurationDays || "N/A",
          cost: treatmentPlan.estimatedCost || 0,
          successRate: treatmentPlan.successProbability || "N/A",
          phases: treatmentPlan.treatmentSteps.map((step, idx) => ({
            id: `phase_${idx + 1}`,
            name: step.name || `Giai đoạn ${idx + 1}`,
            duration: step.duration || "",
            description: step.description || "",
            order: step.step || idx + 1,
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
        templateData = treatmentPlan.finalPlan;
      } else if (apiPhases && apiPhases.length > 0) {
        // Fallback: map from apiPhases
        templateData = {
          phases: apiPhases.map((phase, idx) => ({
            ...phase,
            activities: Array.isArray(phase.activities) ? phase.activities : [],
            name: phase.phaseName || phase.name || `Giai đoạn ${idx + 1}`,
            id: phase.id || phase.phaseId || `phase_${idx + 1}`,
            duration: phase.estimatedDuration || phase.duration || "",
          })),
        };
      }

      if (templateData) {
        setTemplate(templateData);
        const defaultStartDate =
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
      }
    } catch (error) {
      console.error("❌ Error loading existing schedule:", error);
    }
  };

  // Helper function to fix UUID phaseNames
  const fixPhaseNames = (phases) => {
    if (!Array.isArray(phases)) return phases;

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    return phases.map((phase, idx) => {
      let safePhaseName = phase.phaseName || phase.name;

      if (typeof safePhaseName === "string" && uuidRegex.test(safePhaseName)) {
        if (phase.description && !uuidRegex.test(phase.description)) {
          safePhaseName = phase.description.split(":")[0].trim();
        } else {
          const treatmentType =
            phase.treatmentType || currentTreatmentPlan?.treatmentType || "IUI";
          const order = phase.order || phase.phaseOrder || idx + 1;
          const meaningfulPhaseNames = getMeaningfulPhaseNames(treatmentType);
          safePhaseName = meaningfulPhaseNames[order] || `Giai đoạn ${order}`;
        }
      }

      return {
        ...phase,
        phaseName: safePhaseName,
        originalPhaseName: phase.phaseName,
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
          updatedBy: user?.id,
          updatedAt: new Date().toISOString(),
        }
      );

      if (result.success) {
        // Update local state
        setApiPhases((prev) =>
          prev.map((phase) =>
            phase.id === phaseId || phase.phaseId === phaseId
              ? {
                  ...phase,
                  status: newStatus,
                  updatedAt: new Date().toISOString(),
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
        message.error(
          result.message || "❌ Không thể cập nhật trạng thái giai đoạn"
        );
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
        planId: currentTreatmentPlan?.planId || currentTreatmentPlan?.id,
        patientId: patientId,
        phaseName: values.phaseName,
        description: values.description,
        order: values.order || apiPhases.length + 1,
        estimatedDuration: values.estimatedDuration,
        status: "Pending",
        startDate: values.startDate?.format("YYYY-MM-DD"),
        endDate: values.endDate?.format("YYYY-MM-DD"),
        createdBy: user?.id,
        createdAt: new Date().toISOString(),
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
      console.log("🔄 Updating phase:", editingPhase.id, values);

      const updateData = {
        phaseName: values.phaseName,
        description: values.description,
        order: values.order,
        estimatedDuration: values.estimatedDuration,
        startDate: values.startDate?.format("YYYY-MM-DD"),
        endDate: values.endDate?.format("YYYY-MM-DD"),
        updatedBy: user?.id,
        updatedAt: new Date().toISOString(),
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
        editingPhase.id || editingPhase.phaseId,
        updateData
      );

      if (result.success) {
        // Update local state
        setApiPhases((prev) =>
          prev.map((phase) =>
            phase.id === editingPhase.id ||
            phase.phaseId === editingPhase.phaseId
              ? { ...phase, ...updateData }
              : phase
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
          prev.filter(
            (phase) => phase.id !== phaseId && phase.phaseId !== phaseId
          )
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
      order: phase.order,
      estimatedDuration: phase.estimatedDuration,
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
      order: 999,
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
        treatmentPlanId:
          currentTreatmentPlan?.planId || currentTreatmentPlan?.id,
        templateId: template?.id,
        sessions: generatedSchedule,
        totalSessions: generatedSchedule.length,
        estimatedDuration: template?.estimatedDuration,
        createdBy: user?.id,
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
          <Tag color={record.custom ? "orange" : "blue"}>
            {record.order}. {text}
          </Tag>
          {record.modified && (
            <Tag color="green" size="small">
              Đã sửa
            </Tag>
          )}
          {record.custom && (
            <Tag color="purple" size="small">
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
          <Text>{text}</Text>
          <Space>
            <Tag icon={<ClockCircleOutlined />}>{record.duration} phút</Tag>
            <Tag color={record.required ? "red" : "green"}>
              {record.required ? "Bắt buộc" : "Tùy chọn"}
            </Tag>
          </Space>
          {scheduleAdjustments[record.id] && (
            <Text type="secondary" style={{ fontSize: 12 }}>
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
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditSession(record)}
            type="link"
            title="Chỉnh sửa buổi điều trị"
          />
          <Button
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
                                key: `phase-step-${
                                  phase.id || phase.phaseId || index
                                }`,
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
                          size="small"
                          rowKey={(record) =>
                            record.id || record.phaseId || record.phaseName
                          }
                          columns={[
                            {
                              title: "Thứ tự",
                              dataIndex: "order",
                              key: "order",
                              width: 80,
                              render: (order) => (
                                <Tag color="blue">{order}</Tag>
                              ),
                            },
                            {
                              title: "Tên giai đoạn",
                              dataIndex: "phaseName",
                              key: "phaseName",
                              render: (name, record) => (
                                <Space direction="vertical" size="small">
                                  <Text strong>{name}</Text>
                                  <Text
                                    type="secondary"
                                    style={{ fontSize: "12px" }}
                                  >
                                    {record.description}
                                  </Text>
                                </Space>
                              ),
                            },
                            {
                              title: "Thời gian",
                              dataIndex: "estimatedDuration",
                              key: "estimatedDuration",
                              width: 120,
                              render: (duration) => (
                                <Tag icon={<ClockCircleOutlined />}>
                                  {duration}
                                </Tag>
                              ),
                            },
                            {
                              title: "Trạng thái",
                              dataIndex: "status",
                              key: "status",
                              width: 150,
                              render: (status, record) => (
                                <Select
                                  value={status}
                                  onChange={(newStatus) =>
                                    handleUpdatePhaseStatus(
                                      record.id || record.phaseId,
                                      newStatus
                                    )
                                  }
                                  style={{ width: "100%" }}
                                  size="small"
                                  disabled={loading}
                                >
                                  <Option value="Pending">
                                    ⏳ Chờ thực hiện
                                  </Option>
                                  <Option value="In Progress">
                                    ▶️ Đang thực hiện
                                  </Option>
                                  <Option value="Completed">
                                    ✅ Hoàn thành
                                  </Option>
                                  <Option value="On Hold">⏸️ Tạm dừng</Option>
                                  <Option value="Cancelled">❌ Đã hủy</Option>
                                </Select>
                              ),
                            },
                            {
                              title: "Thời gian",
                              key: "dates",
                              width: 200,
                              render: (_, record) => (
                                <Space direction="vertical" size="small">
                                  {record.startDate && (
                                    <Text style={{ fontSize: "12px" }}>
                                      <CalendarOutlined /> Bắt đầu:{" "}
                                      {dayjs(record.startDate).format(
                                        "DD/MM/YYYY"
                                      )}
                                    </Text>
                                  )}
                                  {record.endDate && (
                                    <Text style={{ fontSize: "12px" }}>
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
                                  <Tooltip title="Chỉnh sửa giai đoạn">
                                    <Button
                                      size="small"
                                      icon={<EditOutlined />}
                                      onClick={() => handleEditPhase(record)}
                                      type="link"
                                      disabled={loading}
                                    />
                                  </Tooltip>
                                  <Popconfirm
                                    title="Xóa giai đoạn này?"
                                    description="Hành động này không thể hoàn tác."
                                    onConfirm={() =>
                                      handleDeletePhase(
                                        record.id || record.phaseId
                                      )
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
                                          planId:
                                            currentTreatmentPlan?.planId ||
                                            currentTreatmentPlan?.id,
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
                                          order: i + 1,
                                          estimatedDuration:
                                            phase.duration || "5-7 ngày",
                                          status: "Pending",
                                          createdBy: user?.id,
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
                          `schedule-${record.phaseName || "unknown"}_${
                            record.activity || "activity"
                          }_${record.date || new Date().getTime()}`
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
                  name="order"
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
                  name="estimatedDuration"
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
                    <Text>ID: {editingPhase.id}</Text>
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
                      {dayjs(editingPhase.createdAt).format("DD/MM/YYYY HH:mm")}
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
    </div>
  );
};

export default TreatmentScheduleForm;
