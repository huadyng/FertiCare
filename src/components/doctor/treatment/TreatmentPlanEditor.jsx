import React, { useState, useEffect, useContext, useCallback } from "react";
import "../DoctorTheme.css";
import "./TreatmentPlanEditor.css";
import {
  Card,
  Form,
  Select,
  Button,
  Typography,
  message,
  Row,
  Col,
  Collapse,
  Table,
  Tag,
  Divider,
  Alert,
  Descriptions,
  Space,
  Statistic,
  Modal,
  Input,
  InputNumber,
  Switch,
  Tooltip,
  Popconfirm,
  Badge,
  AutoComplete,
  DatePicker,
  TimePicker,
} from "antd";
import {
  ClockCircleOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  EditOutlined,
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  HeartOutlined,
  MedicineBoxOutlined,
  UserOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  CalendarOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { treatmentPlanAPI } from "../../../api/treatmentPlanAPI";
import apiTreatmentManagement from "../../../api/apiTreatmentManagement";
import { UserContext } from "../../../context/UserContext";
import { treatmentStateManager } from "../../../utils/treatmentStateManager";
import dayjs from "dayjs";
import {
  getTemplateByType,
  generateScheduleFromTemplate,
} from "./data/treatmentTemplates";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Panel } = Collapse;
const { TextArea } = Input;

// Hàm chuyển đổi template từ backend sang định dạng frontend
function chuyenDoiTemplateTuBackendSangFE(templateBE) {
  if (!templateBE) return null;
  return {
    id: templateBE.templateId,
    name: templateBE.name,
    description: templateBE.description,
    type: templateBE.treatmentType,
    planName: templateBE.planName,
    planDescription: templateBE.planDescription,
    estimatedDuration: templateBE.estimatedDurationDays,
    cost: templateBE.estimatedCost,
    phases: (templateBE.treatmentSteps || []).map((buoc) => ({
      id: `phase_${buoc.step}`,
      name: buoc.name,
      duration: buoc.duration,
      description: buoc.description,
      // activitiesDetail là mảng object, FE có thể mở rộng nếu cần
      activities: (buoc.activities || []).map((hoatDong, idx) => ({
        name: hoatDong,
        day: idx + 1,
        type: "procedure",
        notes: "",
      })),
      // Nếu cần, có thể thêm activitiesDetail ở đây
      activitiesDetail: (buoc.activities || []).map((hoatDong, idx) => ({
        name: hoatDong,
        day: idx + 1,
        type: "procedure",
        notes: "",
      })),
      medications: [], // Sẽ được map ở dưới nếu cần
    })),
    medications: (templateBE.medicationPlan || []).map((keHoach) => ({
      phase: keHoach.phase,
      medications: (keHoach.medications || []).map((thuoc) => ({
        name: thuoc.name,
        dosage: thuoc.dosage,
        frequency: thuoc.frequency,
        duration: thuoc.duration,
        route: thuoc.route || "Uống",
      })),
    })),
    monitoring: templateBE.monitoringSchedule || [],
    successRate: templateBE.successProbability,
    riskFactors: templateBE.riskFactors,
    contraindications: templateBE.contraindications,
    treatmentCycle: templateBE.treatmentCycle,
    createdAt: templateBE.createdAt,
    updatedAt: templateBE.updatedAt,
    createdBy: templateBE.createdBy,
    updatedBy: templateBE.updatedBy,
    isActive: templateBE.isActive,
  };
}

const TreatmentPlanEditor = ({
  patientId,
  patientInfo,
  examinationData,
  existingPlan: initialExistingPlan,
  isEditing: initialIsEditing,
  onNext,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { user } = useContext(UserContext);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customizations, setCustomizations] = useState({});
  const [editingPhase, setEditingPhase] = useState(null);
  const [customMedications, setCustomMedications] = useState([]);
  const [doctorNotes, setDoctorNotes] = useState("");
  const [isEditingPhase, setIsEditingPhase] = useState(false);
  const [hasError, setHasError] = useState(false);

  // State để quản lý existing plan và edit mode
  const [existingPlan, setExistingPlan] = useState(initialExistingPlan);
  const [isEditing, setIsEditing] = useState(initialIsEditing);

  // New states for detailed activity editing
  const [editingActivity, setEditingActivity] = useState(null);
  const [isEditingActivity, setIsEditingActivity] = useState(false);
  const [editingActivityIndex, setEditingActivityIndex] = useState(null);

  const [doctorSpecialty, setDoctorSpecialty] = useState(null);

  const [isCompleted, setIsCompleted] = useState(false);
  const [submittedPlan, setSubmittedPlan] = useState(null);

  // State để kiểm soát read-only khi đã có phác đồ
  const [isReadOnly, setIsReadOnly] = useState(false);

  // State để track xem template đã được load từ API chưa
  const [templateLoadedFromAPI, setTemplateLoadedFromAPI] = useState(false);

  // State để track loading status
  const [templateLoading, setTemplateLoading] = useState(true);

  // Role-based access control check
  useEffect(() => {
    const checkUserRole = () => {
      const userRole = user?.role?.toUpperCase();
      console.log(`🔍 [TreatmentPlanEditor] Current user role: ${userRole}`);

      // Show warning if user is not a doctor but trying to access doctor features
      if (userRole && userRole !== "DOCTOR") {
        console.warn(
          `⚠️ [TreatmentPlanEditor] User with role ${userRole} is accessing doctor features`
        );
        message.warning(
          "Bạn đang truy cập tính năng dành cho bác sĩ. Một số chức năng có thể bị hạn chế."
        );
      }
    };

    checkUserRole();
  }, [user]);

  // Load existing plan when editing
  useEffect(() => {
    console.log("🔄 [TreatmentPlanEditor] useEffect for existing plan:", {
      hasExistingPlan: !!existingPlan,
      isEditing,
      existingPlanData: existingPlan,
    });

    if (existingPlan && isEditing) {
      const template =
        existingPlan.finalPlan ||
        existingPlan.template ||
        existingPlan.originalTemplate;
      if (template) {
        setSelectedTemplate(template);
        setCustomizations(
          existingPlan.customizations || {
            phases: {},
            medications: {},
            notes: "",
          }
        );
        setCustomMedications(existingPlan.customMedications || []);
        setDoctorNotes(existingPlan.doctorNotes || "");

        form.setFieldsValue({
          treatmentType: template.type,
          estimatedStartDate: existingPlan.estimatedStartDate
            ? dayjs(existingPlan.estimatedStartDate)
            : undefined,
        });
      }
      return;
    }

    // Load default template for new plans based on patient's registered service
    if (!selectedTemplate && !isEditing) {
      const recommendedType = getRecommendedTreatment();
      if (recommendedType) {
        (async () => {
          await handleTemplateChange(recommendedType);
          form.setFieldsValue({ treatmentType: recommendedType });
        })();
      }
    }
  }, [examinationData, existingPlan, isEditing, patientInfo]); // Added patientInfo dependency

  // Ensure template is loaded immediately when component mounts
  useEffect(() => {
    console.log(
      "🔄 [TreatmentPlanEditor] useEffect for auto-loading template:",
      {
        hasSelectedTemplate: !!selectedTemplate,
        isEditing,
        hasExistingPlan: !!existingPlan,
        patientInfo: !!patientInfo,
        examinationData: !!examinationData,
        doctorSpecialty,
      }
    );

    // Nếu chưa có template và có existing plan, load template từ existing plan
    if (!selectedTemplate && existingPlan?.treatmentType) {
      console.log(
        "🔄 Loading template from existing plan:",
        existingPlan.treatmentType
      );
      (async () => {
        await handleTemplateChange(existingPlan.treatmentType);
        form.setFieldsValue({ treatmentType: existingPlan.treatmentType });
      })();
      return;
    }

    // Nếu chưa có template và không có existing plan, load template mặc định
    if (!selectedTemplate && !existingPlan) {
      const recommendedType = getRecommendedTreatment();
      if (recommendedType) {
        console.log("🔄 Auto-loading template for service:", recommendedType);
        (async () => {
          await handleTemplateChange(recommendedType);
          form.setFieldsValue({ treatmentType: recommendedType });
        })();
      }
    }
  }, [patientInfo, examinationData, doctorSpecialty, existingPlan]); // Added existingPlan dependency

  // Ensure template is loaded when existing plan changes
  useEffect(() => {
    console.log(
      "🔄 [TreatmentPlanEditor] useEffect for existing plan template loading:",
      {
        hasExistingPlan: !!existingPlan,
        hasSelectedTemplate: !!selectedTemplate,
        treatmentType: existingPlan?.treatmentType,
      }
    );

    if (existingPlan?.treatmentType && !selectedTemplate) {
      console.log(
        "🔄 Loading template for existing plan:",
        existingPlan.treatmentType
      );

      // Load template từ API thay vì dùng local template
      const loadTemplateFromAPI = async () => {
        try {
          const templateResponse =
            await apiTreatmentManagement.getTemplateByType(
              existingPlan.treatmentType
            );

          if (templateResponse.success && templateResponse.data) {
            // Sử dụng hàm chuyển đổi template từ backend sang FE
            const template = chuyenDoiTemplateTuBackendSangFE(
              templateResponse.data
            );
            console.log(
              "✅ Template loaded from API (đã chuyển đổi):",
              template
            );
            setSelectedTemplate(template);
            setTemplateLoadedFromAPI(true);

            // Set form values
            form.setFieldsValue({
              treatmentType: existingPlan.treatmentType,
              estimatedStartDate: existingPlan.startDate
                ? dayjs(existingPlan.startDate)
                : undefined,
              doctorNotes: existingPlan.doctorNotes || "",
            });

            // Set other states
            setCustomizations(existingPlan.customizations || {});
            setCustomMedications(existingPlan.customMedications || []);
            setDoctorNotes(existingPlan.doctorNotes || "");
          } else {
            console.warn(
              "⚠️ Failed to load template from API, using local template"
            );
            handleTemplateChange(existingPlan.treatmentType);
          }
        } catch (error) {
          console.error("❌ Error loading template from API:", error);
          // Fallback to local template
          handleTemplateChange(existingPlan.treatmentType);
        }
      };

      loadTemplateFromAPI();
    }
  }, [existingPlan, selectedTemplate]);

  // Separate useEffect for auto-save (with stable interval)
  useEffect(() => {
    console.log("🔄 [TreatmentPlanEditor] useEffect for auto-save:", {
      hasSelectedTemplate: !!selectedTemplate,
      hasPatientId: !!patientId,
    });

    if (!selectedTemplate || !patientId) return;

    const interval = setInterval(() => {
      try {
        const currentValues = form.getFieldsValue();
        if (currentValues.treatmentType && selectedTemplate) {
          const draftData = {
            ...currentValues,
            template: selectedTemplate,
            customizations,
            customMedications,
            doctorNotes,
            lastSaved: new Date().toISOString(),
          };
          localStorage.setItem(
            `treatment_plan_draft_${patientId}`,
            JSON.stringify(draftData)
          );
          console.log("💾 Auto-saved draft");
        }
      } catch (error) {
        console.error("Auto-save error:", error);
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(interval);
  }, [patientId, selectedTemplate?.id]); // Only depend on stable identifiers

  // Load doctor's specialty when component mounts
  useEffect(() => {
    console.log(
      "🔄 [TreatmentPlanEditor] useEffect for loading doctor specialty"
    );

    const loadDoctorSpecialty = async () => {
      try {
        const user = localStorage.getItem("user");
        if (user) {
          const userData = JSON.parse(user);
          const doctorId = userData.id || userData.userId;

          if (doctorId) {
            console.log(
              "🔍 [TreatmentPlanEditor] Loading doctor specialty for ID:",
              doctorId
            );

            // Use the new helper function from apiDoctor
            const { default: apiDoctor } = await import(
              "../../../api/apiDoctor"
            );
            const profileResponse =
              await apiDoctor.getDoctorProfileWithFallback(doctorId);

            if (profileResponse.success && profileResponse.data) {
              console.log(
                "✅ [TreatmentPlanEditor] Doctor profile loaded:",
                profileResponse.data
              );
              setDoctorSpecialty(
                profileResponse.data.specialty?.toUpperCase() ||
                  profileResponse.data.role?.toUpperCase() ||
                  "IUI"
              );
            } else {
              console.warn(
                "⚠️ [TreatmentPlanEditor] Could not load doctor profile:",
                profileResponse.message
              );

              // Check if user has DOCTOR role in localStorage
              const userRole = userData.role?.toUpperCase();
              if (userRole === "DOCTOR") {
                console.log(
                  "ℹ️ [TreatmentPlanEditor] User has DOCTOR role, using default specialty"
                );
                setDoctorSpecialty("IUI"); // Default fallback for doctors
              } else {
                console.log(
                  "ℹ️ [TreatmentPlanEditor] User is not a doctor, using IUI specialty"
                );
                setDoctorSpecialty("IUI"); // Default fallback
              }
            }
          } else {
            console.warn(
              "⚠️ [TreatmentPlanEditor] No doctor ID found in user data"
            );
            setDoctorSpecialty("IUI"); // Default fallback
          }
        } else {
          console.warn(
            "⚠️ [TreatmentPlanEditor] No user data found in localStorage"
          );
          setDoctorSpecialty("IUI"); // Default fallback
        }
      } catch (error) {
        console.warn(
          "⚠️ [TreatmentPlanEditor] Error loading doctor specialty:",
          error
        );
        // Fallback to IUI since that's what's available
        setDoctorSpecialty("IUI");
      }
    };

    loadDoctorSpecialty();
  }, []);

  // Load active treatment plan từ API khi vào trang hoặc khi patientId thay đổi
  useEffect(() => {
    const loadActivePlan = async () => {
      if (!patientId) return;
      setLoading(true);
      try {
        const response = await apiTreatmentManagement.getActiveTreatmentPlan(
          patientId
        );
        if (response.success && response.data) {
          // Nếu đã có phác đồ active, set vào state và chuyển sang chế độ xem/chỉnh sửa
          const frontendPlan = transformApiPlanToFrontend(response.data);
          setExistingPlan(frontendPlan);
          setIsEditing(false);
          setIsReadOnly(true);
        } else {
          // Nếu chưa có phác đồ, cho phép tạo mới
          setExistingPlan(null);
          setIsEditing(false);
          setIsReadOnly(false);
        }
      } catch (error) {
        setExistingPlan(null);
        setIsEditing(false);
        setIsReadOnly(false);
      } finally {
        setLoading(false);
      }
    };
    loadActivePlan();
  }, [patientId]);

  // Function to get current doctor's specialty
  const getCurrentDoctorSpecialty = useCallback(async () => {
    try {
      const user = localStorage.getItem("user");
      if (user) {
        const userData = JSON.parse(user);
        const doctorId = userData.id || userData.userId;

        if (doctorId) {
          console.log(
            "🔍 [TreatmentPlanEditor] Getting doctor specialty for ID:",
            doctorId
          );

          // Use the correct endpoint for doctor profile
          try {
            const response = await fetch(`/api/profiles/doctor/me`, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json",
              },
            });

            if (response.ok) {
              const doctorProfile = await response.json();
              console.log(
                "✅ [TreatmentPlanEditor] Doctor profile:",
                doctorProfile
              );
              return (
                doctorProfile.specialty?.toUpperCase() ||
                doctorProfile.role?.toUpperCase() ||
                "IUI"
              );
            } else {
              console.warn(
                "⚠️ [TreatmentPlanEditor] Failed to load doctor profile:",
                response.status
              );
            }
          } catch (error) {
            console.warn(
              "⚠️ [TreatmentPlanEditor] Error loading doctor profile:",
              error
            );
          }
        }
      }
    } catch (error) {
      console.warn(
        "⚠️ [TreatmentPlanEditor] Error getting doctor specialty:",
        error
      );
    }
    return "IUI"; // Default fallback
  }, []);

  const getRecommendedTreatment = () => {
    // Enhanced logic based on doctor's specialty and patient data
    if (!examinationData && !patientInfo) {
      console.log(
        "🔍 [TreatmentPlanEditor] No examination data or patient info, using default IUI"
      );
      return "IUI"; // Default to IUI since that's what's available
    }

    console.log("🔍 [TreatmentPlanEditor] Full patientInfo:", patientInfo);
    console.log(
      "🔍 [TreatmentPlanEditor] Full examinationData:",
      examinationData
    );
    console.log(
      "🔍 [TreatmentPlanEditor] Current doctor specialty:",
      doctorSpecialty
    );

    // Priority 1: Check doctor's specialty from loaded state
    if (doctorSpecialty) {
      console.log(
        "🔍 [TreatmentPlanEditor] Using doctor specialty:",
        doctorSpecialty
      );

      if (doctorSpecialty === "IUI") return "IUI";
      if (doctorSpecialty === "IVF") return "IVF";
      if (doctorSpecialty === "ICSI") return "ICSI";
    }

    // Priority 2: Check examination data
    if (examinationData?.recommendedService) {
      console.log(
        "🔍 [TreatmentPlanEditor] Using examination recommended service:",
        examinationData.recommendedService
      );
      return examinationData.recommendedService.toUpperCase();
    }

    // Priority 3: Check patient info
    if (patientInfo?.registeredService) {
      console.log(
        "🔍 [TreatmentPlanEditor] Using patient registered service:",
        patientInfo.registeredService
      );
      return patientInfo.registeredService.toUpperCase();
    }

    // Priority 4: Check patient info for treatmentType
    if (patientInfo?.treatmentType) {
      console.log(
        "🔍 [TreatmentPlanEditor] Using patient treatmentType:",
        patientInfo.treatmentType
      );
      return patientInfo.treatmentType.toUpperCase();
    }

    // Priority 5: Check patient info for servicePackage
    if (patientInfo?.servicePackage) {
      console.log(
        "🔍 [TreatmentPlanEditor] Using patient servicePackage:",
        patientInfo.servicePackage
      );
      return patientInfo.servicePackage.toUpperCase();
    }

    // Default fallback
    console.log("🔍 [TreatmentPlanEditor] Using default IUI");
    return "IUI";
  };

  // Transform API treatment plan data to frontend format
  const transformApiPlanToFrontend = (apiPlan) => {
    if (!apiPlan) return null;

    console.log("🔍 [TreatmentPlanEditor] Transforming API plan:", apiPlan);

    // Handle different API response formats
    let planData = apiPlan;

    // If API returns a wrapper object with phases, extract the plan
    if (apiPlan.phases && Array.isArray(apiPlan.phases) && apiPlan.planId) {
      console.log(
        "🔍 [TreatmentPlanEditor] API plan has phases array, extracting plan data"
      );
      planData = {
        planId: apiPlan.planId,
        patientId: apiPlan.patientId,
        doctorId: apiPlan.doctorId,
        treatmentType: apiPlan.treatmentType,
        planName: apiPlan.planName,
        status: apiPlan.status,
        startDate: apiPlan.startDate,
        endDate: apiPlan.endDate,
        // Extract treatment steps from phases if available
        treatmentSteps: apiPlan.phases.map((phase, index) => ({
          step: index + 1,
          // Nếu phaseName là UUID (dài 36 ký tự, có dấu -), thì đặt tên mặc định
          name:
            phase.phaseName && /^[0-9a-fA-F-]{36}$/.test(phase.phaseName)
              ? `Giai đoạn ${index + 1}`
              : phase.phaseName || `Giai đoạn ${index + 1}`,
          duration: phase.estimatedDuration || "5-7 ngày",
          description: phase.description || "",
          activities: Array.isArray(phase.activities) ? phase.activities : [], // Đảm bảo luôn là mảng
        })),
        notes: apiPlan.notes || "",
      };
      console.log("🔍 [TreatmentPlanEditor] Extracted plan data:", planData);
    } else {
      console.log("🔍 [TreatmentPlanEditor] API plan format:", {
        hasPhases: !!apiPlan.phases,
        isPhasesArray: Array.isArray(apiPlan.phases),
        hasPlanId: !!apiPlan.planId,
        planKeys: Object.keys(apiPlan),
      });
    }

    const transformedPlan = {
      id: planData.planId,
      patientId: planData.patientId,
      doctorId: planData.doctorId,
      templateId: planData.templateId,
      treatmentType: planData.treatmentType || "IUI", // Default to IUI if not provided
      planName: planData.planName || `Plan ${planData.planId}`,
      planDescription: planData.planDescription || "Phác đồ điều trị",
      estimatedDuration: planData.estimatedDurationDays || 21,
      estimatedCost: planData.estimatedCost || 0,
      successRate: planData.successProbability || 0.7,
      startDate: planData.startDate,
      endDate: planData.endDate,
      status: planData.status || "active",
      notes: planData.notes || "",

      // Transform treatment steps to phases format
      finalPlan: {
        phases:
          planData.treatmentSteps && planData.treatmentSteps.length > 0
            ? planData.treatmentSteps.map((step, index) => ({
                id: `phase_${index}`,
                name: step.name,
                duration: step.duration,
                description: step.description,
                activities: Array.isArray(step.activities)
                  ? step.activities
                  : [], // Đảm bảo luôn là mảng
                activitiesDetail:
                  step.activities?.map((activity, actIndex) => ({
                    id: `activity_${index}_${actIndex}`,
                    name: activity,
                    day: actIndex + 1,
                    type: "procedure",
                    department: "Khoa Sản",
                    room: "Phòng khám 1",
                    status: "pending",
                    time: "09:00",
                    duration: 60,
                    priority: "normal",
                    cost: 0,
                    staff: "",
                    preparation: "",
                    followUp: "",
                    notes: "",
                    requirements: [],
                  })) || [],
                medications: [],
              }))
            : [
                {
                  id: "phase_0",
                  name: "Giai đoạn điều trị",
                  duration: "21 ngày",
                  description: "Giai đoạn điều trị chính",
                  activities: [],
                  activitiesDetail: [],
                  medications: [],
                },
              ],

        medications: planData.medicationPlan || [],
        monitoring: planData.monitoringSchedule || [],
      },

      // Customizations
      customizations: {
        phases: {},
        medications: {},
        notes: planData.notes || "",
      },

      customMedications: planData.medicationPlan || [],
      doctorNotes: planData.notes || "",

      // Metadata
      createdDate: planData.createdDate,
      updatedDate: planData.updatedDate,
      isEdited: false,
    };

    // Đảm bảo mỗi phase luôn có activities là mảng
    if (
      transformedPlan.finalPlan &&
      Array.isArray(transformedPlan.finalPlan.phases)
    ) {
      transformedPlan.finalPlan.phases = transformedPlan.finalPlan.phases.map(
        (phase) => ({
          ...phase,
          activities: Array.isArray(phase.activities) ? phase.activities : [],
        })
      );
    }

    console.log("✅ [TreatmentPlanEditor] Transformed plan:", transformedPlan);
    return transformedPlan;
  };

  const handleTemplateChange = useCallback(
    async (treatmentType) => {
      console.log(
        "🔄 [TreatmentPlanEditor] handleTemplateChange called with:",
        treatmentType
      );

      try {
        // Thử load template từ API trước
        const templateResponse = await apiTreatmentManagement.getTemplateByType(
          treatmentType
        );

        if (templateResponse.success && templateResponse.data) {
          // Sử dụng hàm chuyển đổi template từ backend sang FE
          const template = chuyenDoiTemplateTuBackendSangFE(
            templateResponse.data
          );
          console.log(
            "✅ [TreatmentPlanEditor] Template loaded from API (đã chuyển đổi):",
            template.name
          );
          setSelectedTemplate(template);
          setTemplateLoadedFromAPI(true);
          setTemplateLoading(false);
          generateDoctorSuggestions(template);
        } else {
          console.warn(
            `⚠️ [TreatmentPlanEditor] API template not found for type: ${treatmentType}, falling back to local template`
          );

          // Fallback to local template
          const localTemplate = getTemplateByType(treatmentType);
          if (localTemplate) {
            setSelectedTemplate(localTemplate);
            generateDoctorSuggestions(localTemplate);
          } else {
            console.warn(
              `⚠️ [TreatmentPlanEditor] Local template not found for type: ${treatmentType}, falling back to IUI`
            );
            const fallbackTemplate = getTemplateByType("IUI");
            if (fallbackTemplate) {
              setSelectedTemplate(fallbackTemplate);
              generateDoctorSuggestions(fallbackTemplate);
            } else {
              console.error(
                "❌ [TreatmentPlanEditor] No fallback template available!"
              );
              // Create a minimal template to prevent errors
              const minimalTemplate = {
                id: "fallback",
                name: "Template mặc định",
                type: "IUI",
                description: "Template mặc định cho điều trị",
                phases: [],
                requirements: [],
                contraindications: [],
                medications: [],
                monitoring: [],
              };
              setSelectedTemplate(minimalTemplate);
              generateDoctorSuggestions(minimalTemplate);
            }
          }
        }
      } catch (error) {
        console.error(
          "❌ [TreatmentPlanEditor] Error loading template from API:",
          error
        );

        // Fallback to local template on error
        const localTemplate = getTemplateByType(treatmentType);
        if (localTemplate) {
          setSelectedTemplate(localTemplate);
          generateDoctorSuggestions(localTemplate);
        } else {
          const fallbackTemplate = getTemplateByType("IUI");
          if (fallbackTemplate) {
            setSelectedTemplate(fallbackTemplate);
            generateDoctorSuggestions(fallbackTemplate);
          }
        }
      }

      setCustomizations({
        phases: {},
        medications: {},
        notes: "",
      });

      // Reset custom medications when changing template
      setCustomMedications([]);
    },
    [examinationData, patientInfo]
  ); // Add dependencies for generateDoctorSuggestions

  const generateDoctorSuggestions = useCallback(
    (template) => {
      console.log(
        "🔄 [TreatmentPlanEditor] generateDoctorSuggestions called with template:",
        template?.type
      );

      let suggestions = [];

      // Enhanced suggestions based on examination data and patient service
      if (
        examinationData?.diagnosis?.includes("tuổi cao") ||
        patientInfo?.age > 35
      ) {
        suggestions.push(
          "💡 Bệnh nhân tuổi cao - nên điều chỉnh liều FSH tăng 25%"
        );
        suggestions.push("💡 Khuyến nghị PGT-A (xét nghiệm di truyền phôi)");
      }

      if (examinationData?.diagnosis?.includes("AMH thấp")) {
        suggestions.push(
          "💡 AMH thấp - cân nhắc tăng thời gian kích thích buồng trứng"
        );
        suggestions.push("💡 Có thể cần chu kỳ nhiều lần để có đủ phôi");
      }

      if (examinationData?.labResults?.bloodTest?.FSH > 12) {
        suggestions.push(
          "💡 FSH cao - dự trữ buồng trứng thấp, cần phác đồ nhẹ nhàng"
        );
      }

      // Service-specific suggestions based on patient's registered service
      const patientService =
        patientInfo?.treatmentType || patientInfo?.servicePackage;
      if (patientService) {
        const serviceUpper = patientService.toUpperCase();
        if (serviceUpper.includes("IVF")) {
          suggestions.push("💡 IVF - cân nhắc ICSI nếu tinh trùng kém");
          suggestions.push("💡 Có thể freeze phôi thừa để sử dụng sau");
          suggestions.push(
            "💡 Theo dõi kỹ OHSS (hội chứng quá kích thích buồng trứng)"
          );
        } else if (serviceUpper.includes("ICSI")) {
          suggestions.push("💡 ICSI - phù hợp cho trường hợp tinh trùng yếu");
          suggestions.push("💡 Theo dõi kỹ chất lượng phôi sau ICSI");
          suggestions.push("💡 Có thể cần PGT-M nếu có bệnh di truyền");
        } else if (serviceUpper.includes("IUI")) {
          suggestions.push("💡 IUI - theo dõi kỹ thời điểm rụng trứng");
          suggestions.push("💡 Nếu thất bại 3 lần, chuyển sang IVF");
          suggestions.push("💡 Kiểm tra ống dẫn trứng thông thoáng");
        }
      }

      // Template-specific suggestions
      if (template?.type === "IVF") {
        suggestions.push("💡 IVF - cân nhắc ICSI nếu tinh trùng kém");
        suggestions.push("💡 Có thể freeze phôi thừa để sử dụng sau");
        suggestions.push(
          "💡 Theo dõi kỹ OHSS (hội chứng quá kích thích buồng trứng)"
        );
      }

      if (template?.type === "IUI") {
        suggestions.push("💡 IUI - theo dõi kỹ thời điểm rụng trứng");
        suggestions.push("💡 Nếu thất bại 3 lần, chuyển sang IVF");
        suggestions.push("💡 Kiểm tra ống dẫn trứng thông thoáng");
      }

      console.log(
        "✅ [TreatmentPlanEditor] Generated suggestions:",
        suggestions.length
      );

      // Only set doctor notes if we have suggestions
      if (suggestions.length > 0) {
        setDoctorNotes(suggestions.join("\n"));
      } else {
        setDoctorNotes("");
      }
    },
    [examinationData, patientInfo]
  );

  const handleEditPhase = (phase) => {
    // Đảm bảo phase có activitiesDetail và medications là mảng
    const phaseWithActivitiesDetail = {
      ...phase,
      activitiesDetail: phase.activitiesDetail || phase.activities || [],
      medications: Array.isArray(phase.medications) ? phase.medications : [],
    };
    // Nếu chưa có thuốc nào, tự động thêm một dòng trống để nhập
    if (phaseWithActivitiesDetail.medications.length === 0) {
      phaseWithActivitiesDetail.medications = [
        {
          name: "",
          dosage: "",
          frequency: "1 lần/ngày",
          route: "Uống",
          duration: "theo giai đoạn",
        },
      ];
    }
    setEditingPhase(JSON.parse(JSON.stringify(phaseWithActivitiesDetail))); // Deep clone
    setIsEditingPhase(true);
  };

  const handlePhaseFieldChange = (field, value) => {
    if (editingPhase) {
      setEditingPhase((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleActivityChange = (activityIndex, field, value) => {
    if (editingPhase && editingPhase.activitiesDetail) {
      const updatedActivities = [...editingPhase.activitiesDetail];
      updatedActivities[activityIndex] = {
        ...updatedActivities[activityIndex],
        [field]: value,
      };
      setEditingPhase((prev) => ({
        ...prev,
        activitiesDetail: updatedActivities,
      }));
    }
  };

  // New function to add activity
  const handleAddActivity = () => {
    if (editingPhase) {
      const currentActivities =
        editingPhase.activitiesDetail || editingPhase.activities || [];
      const newActivity = {
        day: currentActivities.length + 1,
        name: "",
        type: "procedure", // procedure, medication, test, consultation
        notes: "",
        // Extended fields for detailed editing
        specificDate: null,
        time: "09:00",
        duration: 30, // minutes
        status: "planned", // planned, in_progress, completed, cancelled
        department: "fertility_clinic",
        room: "",
        staff: "",
        priority: "normal", // low, normal, high, urgent
        preparation: "",
        followUp: "",
        cost: null,
        requirements: [],
      };

      const updatedActivities = [
        ...(editingPhase.activitiesDetail || []),
        newActivity,
      ];
      setEditingPhase((prev) => ({
        ...prev,
        activitiesDetail: updatedActivities,
      }));
    }
  };

  // New function to edit activity details
  const handleEditActivityDetails = (activity, index) => {
    setEditingActivity(JSON.parse(JSON.stringify(activity))); // Deep clone
    setEditingActivityIndex(index);
    setIsEditingActivity(true);
  };

  // New function to save activity details
  const handleSaveActivityDetails = () => {
    if (editingActivity && editingActivityIndex !== null && editingPhase) {
      const updatedActivities = [...editingPhase.activitiesDetail];
      updatedActivities[editingActivityIndex] = editingActivity;

      setEditingPhase((prev) => ({
        ...prev,
        activitiesDetail: updatedActivities,
      }));
      setIsEditingActivity(false);
      setEditingActivity(null);
      setEditingActivityIndex(null);
    }
  };

  // New function to cancel activity editing
  const handleCancelActivityEdit = () => {
    setIsEditingActivity(false);
    setEditingActivity(null);
    setEditingActivityIndex(null);
    // message.info("Đã hủy chỉnh sửa hoạt động");
  };

  // Function to update activity field
  const handleActivityFieldChange = (field, value) => {
    if (editingActivity) {
      setEditingActivity((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  // Department and room options
  const getDepartmentOptions = () => [
    { value: "fertility_clinic", label: "🏥 Phòng khám IVF" },
    { value: "laboratory", label: "🔬 Phòng thí nghiệm" },
    { value: "ultrasound", label: "📡 Phòng siêu âm" },
    { value: "surgery", label: "🏥 Phòng phẫu thuật" },
    { value: "consultation", label: "💬 Phòng tư vấn" },
    { value: "pharmacy", label: "💊 Khoa dược" },
    { value: "recovery", label: "🛏️ Phòng hồi phục" },
    { value: "waiting", label: "⏳ Phòng chờ" },
  ];

  const getRoomOptions = (department) => {
    const rooms = {
      fertility_clinic: ["IVF-01", "IVF-02", "IVF-03"],
      laboratory: ["LAB-A", "LAB-B", "LAB-C"],
      ultrasound: ["US-01", "US-02"],
      surgery: ["OR-01", "OR-02", "OR-03"],
      consultation: ["CONS-01", "CONS-02", "CONS-03"],
      pharmacy: ["PHARM-01"],
      recovery: ["REC-01", "REC-02"],
      waiting: ["WAIT-01", "WAIT-02"],
    };
    return rooms[department] || [];
  };

  const getStatusOptions = () => [
    { value: "planned", label: "📋 Đã lên kế hoạch", color: "blue" },
    { value: "scheduled", label: "📅 Đã đặt lịch", color: "cyan" },
    { value: "in_progress", label: "⏳ Đang thực hiện", color: "orange" },
    { value: "completed", label: "✅ Hoàn thành", color: "green" },
    { value: "cancelled", label: "❌ Đã hủy", color: "red" },
    { value: "postponed", label: "⏸️ Hoãn lại", color: "yellow" },
    { value: "waiting", label: "⌛ Chờ xử lý", color: "purple" },
  ];

  const handleSavePhaseEdit = () => {
    if (editingPhase) {
      // Update customizations with the edited phase
      setCustomizations((prev) => ({
        ...prev,
        phases: {
          ...prev.phases,
          [editingPhase.id]: editingPhase,
        },
      }));

      // message.success(`✅ Đã cập nhật giai đoạn "${editingPhase.name}"`);
    }
    setIsEditingPhase(false);
    setEditingPhase(null);
  };

  const handleCancelPhaseEdit = () => {
    setIsEditingPhase(false);
    setEditingPhase(null);
    // message.info("Đã hủy chỉnh sửa");
  };

  // Get effective phase (customized or original)
  const getEffectivePhase = (phase) => {
    const customPhase = customizations.phases?.[phase.id];
    const effectivePhase = customPhase ? { ...phase, ...customPhase } : phase;

    // Đảm bảo có activitiesDetail
    return {
      ...effectivePhase,
      activitiesDetail:
        effectivePhase.activitiesDetail || effectivePhase.activities || [],
    };
  };

  const handleAddMedication = () => {
    const newMed = {
      id: Date.now(),
      name: "",
      dosage: "",
      frequency: "",
      route: "Uống",
      startDay: 1,
      duration: 1,
      custom: true,
    };
    setCustomMedications([...customMedications, newMed]);
  };

  const handleUpdateMedication = (id, field, value) => {
    setCustomMedications((prev) =>
      prev.map((med) => (med.id === id ? { ...med, [field]: value } : med))
    );
  };

  const handleDeleteMedication = (id) => {
    setCustomMedications((prev) => prev.filter((med) => med.id !== id));
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      // Validate required fields
      if (!selectedTemplate) {
        message.error("❌ Vui lòng chọn phác đồ điều trị");
        return;
      }
      // Build medicationPlan từ các phase
      const medicationPlan = selectedTemplate?.phases?.reduce((acc, phase) => {
        if (Array.isArray(phase.medications) && phase.medications.length > 0) {
          acc.push({
            phase: phase.name,
            medications: phase.medications.map((med) => ({
              name: med.name,
              dosage: med.dosage,
              frequency: med.frequency,
              route: med.route,
              duration: med.duration,
            })),
          });
        }
        return acc;
      }, []);
      // Build planData với các trường bắt buộc
      const planData = {
        patientId: patientId,
        treatmentType: selectedTemplate?.type,
        templateId: selectedTemplate?.id,
        treatmentCycle: 1,
        planName: selectedTemplate?.name,
        planDescription:
          selectedTemplate?.description ||
          `Phác đồ ${selectedTemplate?.type} cho bệnh nhân`,
        estimatedDurationDays:
          parseInt(selectedTemplate?.estimatedDuration) || 21,
        estimatedCost: parseFloat(selectedTemplate?.cost) || 0.0,
        treatmentSteps: selectedTemplate?.phases?.map((phase, idx) => ({
          step: idx + 1,
          name: phase.name,
          description: phase.description,
          duration: phase.duration,
          activities: (phase.activities || []).map((act) =>
            typeof act === "string" ? act : act.name
          ),
        })),
        medicationPlan: medicationPlan,
        monitoringSchedule: [],
        successProbability: parseFloat(selectedTemplate?.successRate) || 0.7,
        riskFactors: examinationData?.diagnosis || "Cần theo dõi",
        contraindications: "",
        startDate:
          values.startDate?.format("YYYY-MM-DDTHH:mm:ss") ||
          new Date().toISOString().slice(0, 19),
        endDate: null,
        status: "draft",
        notes: doctorNotes || values.planNotes || "",
      };
      // Validate các trường bắt buộc
      if (
        !planData.patientId ||
        !planData.treatmentType ||
        !planData.templateId
      ) {
        message.error(
          "❌ Thiếu thông tin bắt buộc (patientId, treatmentType, templateId)"
        );
        setLoading(false);
        return;
      }
      // Xóa các trường undefined/null (nếu có)
      Object.keys(planData).forEach((key) => {
        if (planData[key] === undefined) {
          delete planData[key];
        }
      });
      console.log(
        "🔍 [TreatmentPlanEditor] planData gửi backend:",
        JSON.stringify(planData, null, 2)
      );
      try {
        let result;
        if (isEditing && existingPlan?.id) {
          // Nếu đang chỉnh sửa, luôn gọi API update
          console.log(
            "🔄 [TreatmentPlanEditor] Updating existing plan:",
            existingPlan.id
          );
          result = await apiTreatmentManagement.modifyTreatmentPlan(
            existingPlan.id,
            planData
          );
        } else if (isEditing && existingPlan?.planId) {
          // Fallback cho trường hợp sử dụng planId
          console.log(
            "🔄 [TreatmentPlanEditor] Updating existing plan with planId:",
            existingPlan.planId
          );
          result = await apiTreatmentManagement.modifyTreatmentPlan(
            existingPlan.planId,
            planData
          );
        } else {
          // Nếu chưa có plan, mới gọi API tạo mới
          console.log("🆕 [TreatmentPlanEditor] Creating new treatment plan");
          let resultId = null;
          if (examinationData && examinationData.id) {
            resultId = examinationData.id;
          } else {
            const clinicalResults =
              await apiTreatmentManagement.getClinicalResultsByPatient(
                patientId
              );
            if (clinicalResults.success && clinicalResults.data.length > 0) {
              resultId = clinicalResults.data[0].id;
            }
          }
          if (resultId) {
            result =
              await apiTreatmentManagement.createTreatmentPlanFromClinicalResult(
                resultId,
                planData
              );
          } else {
            result = await treatmentPlanAPI.saveTreatmentPlan(planData);
          }
        }
        const savedPlan = result.success ? result.data : null;
        if (!isEditing) {
          localStorage.removeItem(`treatment_plan_draft_${patientId}`);
        }
        const actionText = isEditing ? "Cập nhật" : "Lưu";
        message.success(`✅ ${actionText} phác đồ điều trị thành công!`);

        // Cập nhật existing plan với dữ liệu mới
        if (isEditing && savedPlan) {
          const updatedPlan = transformApiPlanToFrontend(savedPlan);
          setExistingPlan(updatedPlan);
          setIsEditing(false);
          setIsReadOnly(true);
        }

        // Phát ra sự kiện hoàn thành treatment plan để cập nhật thanh tiến độ
        const treatmentPlanCompletedEvent = new CustomEvent(
          "treatmentPlanCompleted",
          {
            detail: {
              patientId: patientId,
              data: savedPlan || planData,
              stepIndex: 1,
              stepName: "Lập phác đồ",
              autoAdvance: !isEditing, // Chỉ auto advance khi tạo mới
            },
          }
        );
        window.dispatchEvent(treatmentPlanCompletedEvent);

        // Phát ra sự kiện stepCompleted để đồng bộ với state manager
        const stepCompletedEvent = new CustomEvent("stepCompleted", {
          detail: {
            patientId: patientId,
            stepIndex: 1,
            stepName: "Lập phác đồ",
            data: savedPlan || planData,
            autoAdvance: !isEditing, // Chỉ auto advance khi tạo mới
          },
        });
        window.dispatchEvent(stepCompletedEvent);

        // Cập nhật state manager
        treatmentStateManager.updateTreatmentPlan(
          patientId,
          savedPlan || planData
        );

        // Sau khi lưu thành công, chuyển sang trạng thái đã lưu (chỉ khi tạo mới)
        if (!isEditing) {
          // Gọi lại API lấy phác đồ active để reload giao diện
          await apiTreatmentManagement
            .getActiveTreatmentPlan(patientId)
            .then((response) => {
              if (response.success && response.data) {
                const frontendPlan = transformApiPlanToFrontend(response.data);
                setExistingPlan(frontendPlan);
                setIsEditing(false);
                setIsReadOnly(true);
              }
            });
          setIsCompleted(true);
          setSubmittedPlan(savedPlan || planData);
        }
      } catch (apiError) {
        console.error("❌ API Error:", apiError);
        // Nếu có message chi tiết từ backend, show ra cho user
        const backendMsg = apiError?.response?.data?.message;
        if (backendMsg) {
          message.error(`❌ ${backendMsg}`);
        } else {
          message.error("❌ Có lỗi xảy ra khi lưu phác đồ. Vui lòng thử lại!");
        }
      }
    } catch (error) {
      console.error("Error creating treatment plan:", error);
      message.error("❌ Có lỗi xảy ra khi lưu phác đồ. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  // Khi muốn chỉnh sửa lại, cho phép quay lại form
  const handleEdit = () => {
    setIsCompleted(false);
    setSubmittedPlan(null);
  };

  // Thêm function để bật chế độ chỉnh sửa
  const handleEnableEdit = () => {
    setIsReadOnly(false);
    setIsEditing(true);
    if (existingPlan) {
      // Luôn lấy template chuẩn từ API khi chỉnh sửa
      (async () => {
        try {
          const templateResponse =
            await apiTreatmentManagement.getTemplateByType(
              existingPlan.treatmentType
            );
          let mergedTemplate;
          if (templateResponse.success && templateResponse.data) {
            // Sử dụng hàm chuyển đổi template từ backend sang FE
            const template = chuyenDoiTemplateTuBackendSangFE(
              templateResponse.data
            );
            // Merge sâu customizations vào từng phase của template
            mergedTemplate = { ...template };
            if (
              existingPlan.customizations &&
              existingPlan.customizations.phases
            ) {
              mergedTemplate.phases = mergedTemplate.phases.map(
                (phase, idx) => {
                  const customPhase =
                    existingPlan.customizations.phases[phase.id];
                  if (customPhase) {
                    // Merge sâu từng trường của phase
                    return {
                      ...phase,
                      ...customPhase,
                      // Nếu customPhase có activitiesDetail thì dùng, không thì lấy từ template
                      activitiesDetail:
                        customPhase.activitiesDetail ||
                        phase.activitiesDetail ||
                        phase.activities ||
                        [],
                      // Nếu customPhase có activities thì dùng, không thì lấy từ template
                      activities:
                        customPhase.activities || phase.activities || [],
                      // Nếu customPhase có medications thì dùng, không thì lấy từ template
                      medications:
                        customPhase.medications || phase.medications || [],
                      // Nếu customPhase có description/duration thì dùng, không thì lấy từ template
                      description: customPhase.description || phase.description,
                      duration: customPhase.duration || phase.duration,
                    };
                  }
                  return phase;
                }
              );
            }
          } else {
            // Fallback: dùng finalPlan nếu không lấy được template
            mergedTemplate = existingPlan.finalPlan || existingPlan.template;
          }
          setSelectedTemplate(mergedTemplate);
          setCustomizations(existingPlan.customizations || {});
          setCustomMedications(existingPlan.customMedications || []);
          setDoctorNotes(existingPlan.doctorNotes || "");
          form.setFieldsValue({
            treatmentType: existingPlan.treatmentType,
            estimatedStartDate: existingPlan.startDate
              ? dayjs(existingPlan.startDate)
              : undefined,
            doctorNotes: existingPlan.doctorNotes || "",
          });
          console.log("[handleEnableEdit] existingPlan:", existingPlan);
          setTimeout(() => {
            console.log(
              "[handleEnableEdit] selectedTemplate after edit:",
              mergedTemplate
            );
          }, 100);
        } catch (error) {
          console.error("[handleEnableEdit] Error loading template:", error);
        }
      })();
    }
    message.info("🔄 Đã chuyển sang chế độ chỉnh sửa");
  };

  // Thêm function để hủy chỉnh sửa
  const handleCancelEdit = () => {
    setIsReadOnly(true);
    setIsEditing(false);
    // Reload lại dữ liệu gốc
    if (existingPlan) {
      const template = existingPlan.finalPlan || existingPlan.template;
      if (template) {
        setSelectedTemplate(template);
        setCustomizations(existingPlan.customizations || {});
        setCustomMedications(existingPlan.customMedications || []);
        setDoctorNotes(existingPlan.doctorNotes || "");

        form.setFieldsValue({
          treatmentType: existingPlan.treatmentType,
          estimatedStartDate: existingPlan.startDate
            ? dayjs(existingPlan.startDate)
            : undefined,
        });
      }
    }
    message.info("❌ Đã hủy chỉnh sửa");
  };

  // Columns for phases table
  const phaseColumns = [
    {
      title: "Giai đoạn",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Space direction="vertical" size="small">
          <Text strong>{text}</Text>
          <Text type="secondary">Thời gian: {record.duration}</Text>
        </Space>
      ),
    },
    {
      title: "Hoạt động chính",
      dataIndex: "activitiesDetail",
      key: "activitiesDetail",
      render: (activitiesDetail, record) => {
        // Sử dụng activitiesDetail nếu có, nếu không thì parse từ activities string
        const activities =
          activitiesDetail ||
          (record.activities || []).map((act) => {
            if (typeof act === "string") {
              // Parse string thành object đơn giản
              return { name: act, day: 1, type: "activity" };
            }
            return act;
          });

        return (
          <div>
            {activities?.slice(0, 2).map((activity, index) => (
              <Tag key={index} style={{ marginBottom: 4 }}>
                {activity.day ? `Ngày ${activity.day}: ` : ""}
                {activity.name}
                {activity.time && ` (${activity.time})`}
                {activity.department && ` - ${activity.department}`}
              </Tag>
            ))}
            {activities?.length > 2 && (
              <Text type="secondary">
                +{activities.length - 2} hoạt động khác
              </Text>
            )}
          </div>
        );
      },
    },
    {
      title: "Thuốc",
      dataIndex: "medications",
      key: "medications",
      render: (medications) => (
        <div>
          {medications?.slice(0, 2).map((med, index) => (
            <Tag color="blue" key={index} style={{ marginBottom: 4 }}>
              {med.name}
            </Tag>
          ))}
          {medications?.length > 2 && (
            <Text type="secondary">+{medications.length - 2} thuốc khác</Text>
          )}
        </div>
      ),
    },
  ];

  // New function to remove activity
  const handleRemoveActivity = (activityIndex) => {
    if (editingPhase && editingPhase.activitiesDetail) {
      const updatedActivities = editingPhase.activitiesDetail.filter(
        (_, index) => index !== activityIndex
      );
      setEditingPhase((prev) => ({
        ...prev,
        activitiesDetail: updatedActivities,
      }));
      // message.success("✅ Đã xóa hoạt động");
    }
  };

  // New function to add medication
  const handleAddPhaseMedication = () => {
    if (editingPhase) {
      const newMedication = {
        name: "",
        dosage: "",
        frequency: "1 lần/ngày",
        route: "Uống",
        duration: "theo giai đoạn",
      };

      const updatedMedications = [
        ...(editingPhase.medications || []),
        newMedication,
      ];
      setEditingPhase((prev) => ({
        ...prev,
        medications: updatedMedications,
      }));
    }
  };

  // New function to remove medication
  const handleRemovePhaseMedication = (medIndex) => {
    if (editingPhase && editingPhase.medications) {
      const updatedMedications = editingPhase.medications.filter(
        (_, index) => index !== medIndex
      );
      setEditingPhase((prev) => ({
        ...prev,
        medications: updatedMedications,
      }));
    }
  };

  // Intelligent suggestions based on phase and patient data
  const getActivitySuggestions = (phaseName) => {
    const phase = phaseName.toLowerCase();
    const suggestions = [];

    if (phase.includes("chuẩn bị") || phase.includes("preparation")) {
      suggestions.push(
        "Khám sức khỏe tổng quát",
        "Xét nghiệm máu cơ bản",
        "Siêu âm đánh giá tử cung buồng trứng",
        "Tư vấn dinh dưỡng",
        "Hướng dẫn chế độ sinh hoạt",
        "Tiêm vắc xin Rubella (nếu chưa có)",
        "Xét nghiệm STD"
      );
    } else if (phase.includes("kích thích") || phase.includes("stimulation")) {
      suggestions.push(
        "Tiêm FSH (Follitropin)",
        "Tiêm LH",
        "Siêu âm theo dõi nang trứng",
        "Xét nghiệm E2",
        "Điều chỉnh liều kích thích",
        "Theo dõi phản ứng buồng trứng",
        "Tiêm GnRH antagonist"
      );
    } else if (phase.includes("lấy trứng") || phase.includes("retrieval")) {
      suggestions.push(
        "Tiêm HCG trigger",
        "Thủ thuật lấy trứng",
        "Gây tê tại chỗ",
        "Theo dõi sau thủ thuật",
        "Kháng sinh dự phòng",
        "Giảm đau",
        "Hướng dẫn chăm sóc tại nhà"
      );
    } else if (phase.includes("nuôi phôi") || phase.includes("culture")) {
      suggestions.push(
        "Thụ tinh IVF/ICSI",
        "Nuôi cấy phôi 3 ngày",
        "Nuôi cấy phôi 5 ngày (blastocyst)",
        "Đánh giá chất lượng phôi",
        "Xét nghiệm di truyền phôi (PGT)",
        "Đông lạnh phôi thừa",
        "Chuẩn bị nội mạc tử cung"
      );
    } else if (phase.includes("chuyển phôi") || phase.includes("transfer")) {
      suggestions.push(
        "Chuẩn bị nội mạc tử cung",
        "Thủ thuật chuyển phôi",
        "Tiêm progesterone hỗ trợ",
        "Nghỉ ngơi 30 phút sau chuyển",
        "Hướng dẫn chế độ sinh hoạt",
        "Theo dõi triệu chứng",
        "Tái khám sau 3 ngày"
      );
    } else if (phase.includes("theo dõi") || phase.includes("monitoring")) {
      suggestions.push(
        "Xét nghiệm beta-HCG",
        "Siêu âm xác nhận túi thai",
        "Theo dõi triệu chứng mang thai",
        "Điều chỉnh thuốc hỗ trợ",
        "Tư vấn chế độ ăn cho bà bầu",
        "Khám sản khoa định kỳ",
        "Siêu âm tim thai"
      );
    }

    // Add patient-specific suggestions
    if (patientInfo?.age > 35) {
      suggestions.push("Theo dõi đặc biệt do tuổi cao");
    }

    if (examinationData?.diagnosis?.includes("AMH thấp")) {
      suggestions.push("Theo dõi kỹ phản ứng buồng trứng");
    }

    // Nếu không có gợi ý nào, trả về gợi ý mặc định
    if (suggestions.length === 0) {
      return [
        "Khám sức khỏe tổng quát",
        "Tư vấn dinh dưỡng",
        "Theo dõi sức khỏe",
        "Xét nghiệm cơ bản",
      ];
    }
    return suggestions;
  };

  const getMedicationSuggestions = (phaseName) => {
    const phase = phaseName.toLowerCase();
    const suggestions = [];

    if (phase.includes("chuẩn bị")) {
      suggestions.push(
        { name: "Acid folic", dosage: "5mg/ngày", frequency: "1 lần/ngày" },
        { name: "Vitamin D3", dosage: "1000 IU/ngày", frequency: "1 lần/ngày" },
        { name: "Coenzyme Q10", dosage: "200mg/ngày", frequency: "2 lần/ngày" },
        {
          name: "Thuốc tránh thai",
          dosage: "theo chỉ định",
          frequency: "1 lần/ngày",
        }
      );
    } else if (phase.includes("kích thích")) {
      suggestions.push(
        {
          name: "Gonal-F (FSH)",
          dosage: "150-300 IU/ngày",
          frequency: "1 lần/ngày tối",
        },
        {
          name: "Menopur (FSH+LH)",
          dosage: "150-225 IU/ngày",
          frequency: "1 lần/ngày",
        },
        {
          name: "Cetrotide (GnRH antagonist)",
          dosage: "0.25mg/ngày",
          frequency: "1 lần/ngày sáng",
        },
        { name: "Metformin", dosage: "500mg x2/ngày", frequency: "2 lần/ngày" }
      );
    } else if (phase.includes("lấy trứng")) {
      suggestions.push(
        {
          name: "Pregnyl (HCG)",
          dosage: "10000 IU",
          frequency: "1 lần duy nhất",
        },
        { name: "Paracetamol", dosage: "500mg", frequency: "khi đau" },
        { name: "Augmentin", dosage: "625mg x2/ngày", frequency: "3 ngày" }
      );
    } else if (phase.includes("chuyển phôi")) {
      suggestions.push(
        {
          name: "Duphaston (Progesterone)",
          dosage: "10mg x2/ngày",
          frequency: "2 lần/ngày",
        },
        {
          name: "Utrogestan",
          dosage: "200mg x2/ngày",
          frequency: "đặt âm đạo",
        },
        { name: "Estrofem", dosage: "2mg x2/ngày", frequency: "2 lần/ngày" },
        { name: "Aspirin", dosage: "81mg/ngày", frequency: "1 lần/ngày" }
      );
    } else if (phase.includes("theo dõi")) {
      suggestions.push(
        { name: "Progesterone", dosage: "theo hỗ trợ", frequency: "tiếp tục" },
        { name: "Acid folic", dosage: "5mg/ngày", frequency: "1 lần/ngày" },
        {
          name: "Vitamin tổng hợp bà bầu",
          dosage: "1 viên/ngày",
          frequency: "1 lần/ngày",
        }
      );
    }

    return suggestions;
  };

  // Debug function to check API status
  const debugAPIStatus = useCallback(async () => {
    console.log("🔍 [TreatmentPlanEditor] === DEBUG API STATUS ===");
    console.log("Patient ID:", patientId);
    console.log("User:", user);
    console.log("Patient Info:", patientInfo);
    console.log("Examination Data:", examinationData);
    console.log("Doctor Specialty:", doctorSpecialty);

    try {
      // Test getActiveTreatmentPlan
      console.log("🔍 Testing getActiveTreatmentPlan...");
      const planResponse = await apiTreatmentManagement.getActiveTreatmentPlan(
        patientId
      );
      console.log("Plan Response:", planResponse);

      // Test getTemplateByType
      console.log("🔍 Testing getTemplateByType...");
      const templateResponse = await apiTreatmentManagement.getTemplateByType(
        "IUI"
      );
      console.log("Template Response:", templateResponse);

      // Test getCurrentUserRole
      console.log("🔍 Testing getCurrentUserRole...");
      const userRole = apiTreatmentManagement.getCurrentUserRole();
      console.log("User Role:", userRole);

      // Test getRoleAppropriateEndpoint
      console.log("🔍 Testing getRoleAppropriateEndpoint...");
      const endpoint = apiTreatmentManagement.getRoleAppropriateEndpoint(
        patientId,
        "treatment-phases"
      );
      console.log("Endpoint:", endpoint);
    } catch (error) {
      console.error("❌ Debug API Error:", error);
    }

    console.log("🔍 [TreatmentPlanEditor] === END DEBUG ===");
  }, [patientId, user, patientInfo, examinationData, doctorSpecialty]);

  // Debug function để kiểm tra trạng thái
  const debugComponentState = () => {
    console.log("🔍 [TreatmentPlanEditor] Current State:", {
      isReadOnly,
      isEditing,
      isCompleted,
      hasExistingPlan: !!existingPlan,
      selectedTemplate: !!selectedTemplate,
      loading,
      patientId,
      userRole: user?.role,
    });

    if (existingPlan) {
      console.log("📋 [TreatmentPlanEditor] Existing Plan Details:", {
        id: existingPlan.id,
        planId: existingPlan.planId,
        treatmentType: existingPlan.treatmentType,
        status: existingPlan.status,
        finalPlan: !!existingPlan.finalPlan,
        template: !!existingPlan.template,
      });
    }
  };

  // Debug function để kiểm tra template loading
  const debugTemplateLoading = async () => {
    console.log("🔍 [debugTemplateLoading] Starting template debug...");

    if (existingPlan?.treatmentType) {
      console.log(
        "🔍 [debugTemplateLoading] Loading template for type:",
        existingPlan.treatmentType
      );

      try {
        const templateResponse = await apiTreatmentManagement.getTemplateByType(
          existingPlan.treatmentType
        );
        console.log(
          "📡 [debugTemplateLoading] Template API Response:",
          templateResponse
        );

        if (templateResponse.success && templateResponse.data) {
          const template = apiTreatmentManagement.transformTemplateData(
            templateResponse.data
          );
          console.log(
            "✅ [debugTemplateLoading] Transformed template:",
            template
          );
          setSelectedTemplate(template);
          message.success("✅ Template loaded successfully!");
        } else {
          console.error(
            "❌ [debugTemplateLoading] Failed to load template:",
            templateResponse.message
          );
          message.error(
            `❌ Failed to load template: ${templateResponse.message}`
          );
        }
      } catch (error) {
        console.error(
          "❌ [debugTemplateLoading] Error loading template:",
          error
        );
        message.error("❌ Error loading template");
      }
    } else {
      console.warn(
        "⚠️ [debugTemplateLoading] No treatment type found in existing plan"
      );
      message.warning("⚠️ No treatment type found");
    }
  };

  // Debug function để force reload template từ existing plan
  const forceReloadTemplate = async () => {
    console.log("🔄 [forceReloadTemplate] Force reloading template...");

    if (!existingPlan?.treatmentType) {
      message.error("❌ No treatment type found in existing plan");
      return;
    }

    try {
      // Load template từ API
      const templateResponse = await apiTreatmentManagement.getTemplateByType(
        existingPlan.treatmentType
      );

      if (templateResponse.success && templateResponse.data) {
        // Sử dụng hàm chuyển đổi template từ backend sang FE
        const template = chuyenDoiTemplateTuBackendSangFE(
          templateResponse.data
        );
        setSelectedTemplate(template);

        // Set form values
        form.setFieldsValue({
          treatmentType: existingPlan.treatmentType,
          estimatedStartDate: existingPlan.startDate
            ? dayjs(existingPlan.startDate)
            : undefined,
          doctorNotes: existingPlan.doctorNotes || "",
        });

        // Set other states
        setCustomizations(existingPlan.customizations || {});
        setCustomMedications(existingPlan.customMedications || []);
        setDoctorNotes(existingPlan.doctorNotes || "");

        console.log(
          "✅ [forceReloadTemplate] Template reloaded successfully:",
          template
        );
        message.success("✅ Template reloaded successfully!");
      } else {
        console.error(
          "❌ [forceReloadTemplate] Failed to load template:",
          templateResponse.message
        );
        message.error(
          `❌ Failed to load template: ${templateResponse.message}`
        );
      }
    } catch (error) {
      console.error("❌ [forceReloadTemplate] Error:", error);
      message.error("❌ Error reloading template");
    }
  };

  // Add debug button to UI (temporary)
  useEffect(() => {
    // Add debug function to window for testing
    window.debugTreatmentPlanEditor = debugAPIStatus;
    console.log(
      "🔍 [TreatmentPlanEditor] Debug function added to window.debugTreatmentPlanEditor"
    );
  }, [debugAPIStatus]);

  // Thêm log chi tiết về dữ liệu phases trước khi render bảng
  console.log("selectedTemplate.phases", selectedTemplate?.phases);
  if (selectedTemplate?.phases) {
    selectedTemplate.phases.forEach((phase, idx) => {
      console.log(`Phase ${idx}:`, phase);
    });
  }

  // Banner trạng thái phác đồ
  const renderPlanStatusBanner = () => {
    if (!existingPlan) return null;
    let color = "#1890ff";
    let text = "Phác đồ nháp";
    if (existingPlan.status === "active") {
      color = "#52c41a";
      text = "Phác đồ đang điều trị";
    } else if (existingPlan.status === "completed") {
      color = "#faad14";
      text = "Phác đồ đã hoàn thành";
    } else if (existingPlan.status === "cancelled") {
      color = "#ff4d4f";
      text = "Phác đồ đã hủy";
    }
    return (
      <div
        className={`plan-banner plan-banner--${existingPlan.status || "draft"}`}
      >
        <span>{text}</span>
        <span>Mã phác đồ: {existingPlan.id || existingPlan.planId}</span>
      </div>
    );
  };

  // Sticky nút chỉnh sửa/lưu
  const renderStickyActionBar = () => {
    if (!existingPlan) return null;
    return (
      <div className="sticky-action-bar">
        {!isEditing ? (
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={handleEnableEdit}
            size="large"
          >
            Chỉnh sửa phác đồ
          </Button>
        ) : (
          <Button
            type="primary"
            icon={<SaveOutlined />}
            htmlType="submit"
            size="large"
            loading={loading}
            style={{ minWidth: 120 }}
          >
            Lưu/Cập nhật
          </Button>
        )}
      </div>
    );
  };

  // Tổng quan phác đồ
  const renderPlanOverview = () => {
    if (!existingPlan) return null;
    return (
      <Descriptions
        bordered
        size="small"
        column={2}
        style={{ marginBottom: 16 }}
        labelStyle={{ fontWeight: 600 }}
      >
        <Descriptions.Item label="Tên phác đồ">
          {existingPlan.planName}
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          {existingPlan.status}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày bắt đầu">
          {existingPlan.startDate
            ? dayjs(existingPlan.startDate).format("DD/MM/YYYY")
            : "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Bác sĩ phụ trách">
          {doctorSpecialty || "-"}
        </Descriptions.Item>
      </Descriptions>
    );
  };

  // Cảnh báo khi có thay đổi chưa lưu
  useEffect(() => {
    if (!isEditing) return;
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "Bạn có thay đổi chưa lưu. Rời trang sẽ mất dữ liệu.";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isEditing]);

  return (
    <div className="treatment-plan-container">
      {existingPlan && isReadOnly ? (
        <Card className="treatment-plan-main-card">
          <div className="treatment-plan-header">
            <Title level={2} className="treatment-plan-title">
              <Space>
                <MedicineBoxOutlined className="title-icon" />
                Phác Đồ Điều Trị Đã Tạo
              </Space>
            </Title>
          </div>
          <div className="treatment-plan-body">
            <Descriptions
              title="Thông tin phác đồ"
              bordered
              column={1}
              size="middle"
              style={{ marginBottom: 24 }}
            >
              <Descriptions.Item label="Tên phác đồ">
                {existingPlan.planName}
              </Descriptions.Item>
              <Descriptions.Item label="Loại điều trị">
                {existingPlan.treatmentType}
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian dự kiến">
                {existingPlan.estimatedDurationDays ||
                  existingPlan.estimatedDuration}{" "}
                ngày
              </Descriptions.Item>
              <Descriptions.Item label="Chi phí dự kiến">
                {existingPlan.estimatedCost?.toLocaleString("vi-VN")} VNĐ
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú">
                {existingPlan.notes || existingPlan.doctorNotes || "-"}
              </Descriptions.Item>
            </Descriptions>

            {/* Nút chỉnh sửa phác đồ */}
            <div className="view-mode-actions">
              <Space size="large">
                <Button
                  type="primary"
                  size="large"
                  icon={<EditOutlined />}
                  onClick={handleEnableEdit}
                  className="action-btn edit-action-btn"
                >
                  ✏️ Chỉnh Sửa Phác Đồ
                </Button>
                <Button
                  type="default"
                  size="large"
                  icon={<FileTextOutlined />}
                  onClick={() => {
                    // Có thể thêm logic để xem chi tiết phác đồ
                    message.info("📋 Xem chi tiết phác đồ điều trị");
                  }}
                  className="action-btn secondary-btn"
                >
                  📋 Xem Chi Tiết
                </Button>
              </Space>
            </div>

            {/* Hiển thị các bước điều trị nếu có */}
            {existingPlan.finalPlan?.phases &&
              existingPlan.finalPlan.phases.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <Title level={4}>Các Giai Đoạn Điều Trị</Title>
                  <Collapse
                    accordion
                    items={existingPlan.finalPlan.phases.map(
                      (phase, index) => ({
                        key: phase.id || index,
                        label: `${index + 1}. ${phase.name} (${
                          phase.duration
                        })`,
                        children: (
                          <div>
                            <p>
                              <strong>Mô tả:</strong> {phase.description}
                            </p>
                            {phase.activities &&
                              phase.activities.length > 0 && (
                                <div>
                                  <p>
                                    <strong>Hoạt động:</strong>
                                  </p>
                                  <ul>
                                    {phase.activities.map(
                                      (activity, actIndex) => (
                                        <li key={actIndex}>{activity}</li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              )}
                          </div>
                        ),
                      })
                    )}
                  />
                </div>
              )}
          </div>
        </Card>
      ) : (
        <>
          {console.log("🔍 [Render] Rendering edit mode:", {
            isEditing,
            hasExistingPlan: !!existingPlan,
            hasSelectedTemplate: !!selectedTemplate,
            isReadOnly,
          })}
          <Card className="treatment-plan-main-card">
            <div className="treatment-plan-header">
              <Title
                level={2}
                className={`treatment-plan-title ${
                  isEditing && existingPlan ? "edit-mode-title" : ""
                }`}
              >
                <Space>
                  <MedicineBoxOutlined className="title-icon" />
                  {isEditing && existingPlan
                    ? "Chỉnh Sửa Phác Đồ Điều Trị"
                    : "Lập Phác Đồ Điều Trị Cá Nhân Hóa"}
                  {isEditing && existingPlan && (
                    <Tag
                      color="orange"
                      icon={<EditOutlined />}
                      className="edit-mode-indicator"
                    >
                      Đang chỉnh sửa
                    </Tag>
                  )}
                </Space>
              </Title>
            </div>
            <div className="treatment-plan-body">
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                className="treatment-form"
                disabled={isReadOnly}
              >
                {/* Hidden treatment type field - automatically set based on patient's service */}
                <Form.Item
                  name="treatmentType"
                  hidden={true}
                  initialValue={getRecommendedTreatment()}
                >
                  <Input disabled={!isEditing} />
                </Form.Item>

                {/* Template Details with Real-time Updates */}
                {console.log("🔍 [Render] Checking selectedTemplate:", {
                  hasSelectedTemplate: !!selectedTemplate,
                  templateName: selectedTemplate?.name,
                  templateType: selectedTemplate?.type,
                  hasPhases: !!selectedTemplate?.phases,
                  phasesLength: selectedTemplate?.phases?.length,
                  isReadOnly,
                  isEditing,
                })}
                {templateLoadedFromAPI &&
                  selectedTemplate &&
                  selectedTemplate.name &&
                  selectedTemplate.type &&
                  selectedTemplate.phases && (
                    <div className="template-details-card">
                      <strong>🔍 DEBUG: Template should be visible here</strong>
                      <p>Template Name: {selectedTemplate.name}</p>
                      <p>Template Type: {selectedTemplate.type}</p>
                      <p>
                        Phases Count: {selectedTemplate.phases?.length || 0}
                      </p>
                    </div>
                  )}
                {templateLoadedFromAPI &&
                  selectedTemplate &&
                  selectedTemplate.name &&
                  selectedTemplate.type &&
                  selectedTemplate.phases && (
                    <Card
                      className="template-details-card"
                      title={
                        <div className="section-title">
                          <SettingOutlined className="section-icon" />
                          <span>Chi Tiết Phác Đồ Được Chọn</span>
                        </div>
                      }
                    >
                      <Row gutter={16} style={{ marginBottom: 16 }}>
                        <Col span={8}>
                          <Statistic
                            title="Thời gian dự kiến"
                            value={selectedTemplate.estimatedDuration}
                            prefix={<ClockCircleOutlined />}
                          />
                        </Col>
                        <Col span={8}>
                          <Statistic
                            title="Chi phí ước tính"
                            value={selectedTemplate.cost}
                            prefix={<DollarOutlined />}
                            suffix=""
                          />
                        </Col>
                        <Col span={8}>
                          <Statistic
                            title="Tỷ lệ thành công"
                            value={selectedTemplate.successRate}
                            suffix=""
                            prefix={<CheckCircleOutlined />}
                          />
                        </Col>
                      </Row>

                      <Divider />

                      {/* Enhanced Phase Display with Customizations */}
                      <Title level={4}>
                        Các Giai Đoạn Điều Trị
                        {Object.keys(customizations.phases || {}).length >
                          0 && (
                          <Badge
                            count={Object.keys(customizations.phases).length}
                            offset={[10, 0]}
                          >
                            <Tag color="orange">Đã tùy chỉnh</Tag>
                          </Badge>
                        )}
                      </Title>

                      <Collapse
                        accordion
                        items={selectedTemplate?.phases?.map((phase, index) => {
                          const effectivePhase = getEffectivePhase(phase);
                          const isCustomized =
                            customizations.phases?.[phase.id];

                          return {
                            key: phase.id,
                            label: (
                              <Space>
                                <Badge
                                  status={isCustomized ? "warning" : "default"}
                                  text={
                                    <span
                                      style={{
                                        fontWeight: isCustomized
                                          ? "bold"
                                          : "normal",
                                      }}
                                    >
                                      {index + 1}. {effectivePhase.name} (
                                      {effectivePhase.duration})
                                      {isCustomized && (
                                        <Tag
                                          color="orange"
                                          size="small"
                                          style={{ marginLeft: 8 }}
                                        >
                                          Đã sửa
                                        </Tag>
                                      )}
                                    </span>
                                  }
                                />
                                <Tooltip title="Chỉnh sửa giai đoạn này">
                                  <Button
                                    size="small"
                                    icon={<EditOutlined />}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      try {
                                        handleEditPhase(effectivePhase);
                                      } catch (error) {
                                        console.error(
                                          "Error editing phase:",
                                          error
                                        );
                                        setHasError(true);
                                      }
                                    }}
                                  />
                                </Tooltip>
                              </Space>
                            ),
                            children: (
                              <div className="phase-section">
                                <div style={{ marginBottom: 16 }}>
                                  <Text strong>Mô tả:</Text>{" "}
                                  {effectivePhase.description}
                                  {isCustomized && (
                                    <Alert
                                      message="Giai đoạn này đã được tùy chỉnh"
                                      type="info"
                                      showIcon
                                      size="small"
                                      style={{ marginTop: 8 }}
                                    />
                                  )}
                                </div>

                                {/* Activities Table with Real-time Updates */}
                                <Table
                                  size="small"
                                  dataSource={effectivePhase.activities}
                                  pagination={false}
                                  rowKey={(record) =>
                                    `activity-${record.name}-${record.day}`
                                  }
                                  columns={[
                                    {
                                      title: "Ngày",
                                      dataIndex: "day",
                                      key: "day",
                                      width: 60,
                                      render: (day) => (
                                        <Tag color="blue">Ngày {day}</Tag>
                                      ),
                                    },
                                    {
                                      title: "Hoạt động",
                                      dataIndex: "name",
                                      key: "name",
                                      render: (name, record) => (
                                        <Space
                                          direction="vertical"
                                          size="small"
                                        >
                                          <Text strong>{name}</Text>
                                          <Space size="small">
                                            <Tag icon={<ClockCircleOutlined />}>
                                              {record.duration} phút
                                            </Tag>
                                            <Tag
                                              color={
                                                record.required
                                                  ? "red"
                                                  : "green"
                                              }
                                            >
                                              {record.required
                                                ? "Bắt buộc"
                                                : "Tùy chọn"}
                                            </Tag>
                                            <Tag color="purple">
                                              {record.room}
                                            </Tag>
                                          </Space>
                                        </Space>
                                      ),
                                    },
                                  ]}
                                  style={{ marginBottom: 0 }}
                                />

                                {/* Medications for this phase */}
                                {effectivePhase.medications &&
                                  effectivePhase.medications.length > 0 && (
                                    <div style={{ marginTop: 16 }}>
                                      <Title level={5}>
                                        Thuốc trong giai đoạn này:
                                      </Title>
                                      <Table
                                        size="small"
                                        dataSource={effectivePhase.medications}
                                        pagination={false}
                                        rowKey={(record) =>
                                          `medication-${record.name}-${record.startDay}`
                                        }
                                        columns={[
                                          {
                                            title: "Tên thuốc",
                                            dataIndex: "name",
                                            key: "name",
                                          },
                                          {
                                            title: "Liều lượng",
                                            dataIndex: "dosage",
                                            key: "dosage",
                                          },
                                          {
                                            title: "Tần suất",
                                            dataIndex: "frequency",
                                            key: "frequency",
                                          },
                                          {
                                            title: "Thời gian",
                                            key: "duration",
                                            render: (_, record) => (
                                              <Tag>
                                                Ngày {record.startDay} -{" "}
                                                {record.startDay +
                                                  record.duration -
                                                  1}
                                              </Tag>
                                            ),
                                          },
                                        ]}
                                        style={{ marginBottom: 0 }}
                                      />
                                    </div>
                                  )}
                              </div>
                            ),
                          };
                        })}
                      />
                    </Card>
                  )}

                {/* Custom Medications */}
                {customMedications?.length > 0 && (
                  <Card
                    className="custom-medications-card"
                    title={
                      <div className="section-title">
                        <MedicineBoxOutlined className="section-icon" />
                        <span>Thuốc tùy chỉnh thêm</span>
                      </div>
                    }
                    size="small"
                  >
                    {customMedications?.map((med) => (
                      <Card
                        key={med.id}
                        type="inner"
                        size="small"
                        style={{ marginBottom: 8 }}
                      >
                        <Row gutter={8}>
                          <Col span={6}>
                            <Input
                              placeholder="Tên thuốc"
                              value={med.name}
                              onChange={(e) =>
                                handleUpdateMedication(
                                  med.id,
                                  "name",
                                  e.target.value
                                )
                              }
                            />
                          </Col>
                          <Col span={4}>
                            <Input
                              placeholder="Liều lượng"
                              value={med.dosage}
                              onChange={(e) =>
                                handleUpdateMedication(
                                  med.id,
                                  "dosage",
                                  e.target.value
                                )
                              }
                            />
                          </Col>
                          <Col span={4}>
                            <Input
                              placeholder="Tần suất"
                              value={med.frequency}
                              onChange={(e) =>
                                handleUpdateMedication(
                                  med.id,
                                  "frequency",
                                  e.target.value
                                )
                              }
                            />
                          </Col>
                          <Col span={3}>
                            <Select
                              value={med.route}
                              onChange={(value) =>
                                handleUpdateMedication(med.id, "route", value)
                              }
                            >
                              <Option value="Uống">Uống</Option>
                              <Option value="Tiêm">Tiêm</Option>
                              <Option value="Bôi">Bôi</Option>
                            </Select>
                          </Col>
                          <Col span={3}>
                            <InputNumber
                              placeholder="Ngày bắt đầu"
                              value={med.startDay}
                              onChange={(value) =>
                                handleUpdateMedication(
                                  med.id,
                                  "startDay",
                                  value
                                )
                              }
                              min={1}
                            />
                          </Col>
                          <Col span={3}>
                            <InputNumber
                              placeholder="Thời gian (ngày)"
                              value={med.duration}
                              onChange={(value) =>
                                handleUpdateMedication(
                                  med.id,
                                  "duration",
                                  value
                                )
                              }
                              min={1}
                            />
                          </Col>
                          <Col span={1}>
                            <Popconfirm
                              title="Xóa thuốc này?"
                              onConfirm={() => handleDeleteMedication(med.id)}
                            >
                              <Button
                                icon={<DeleteOutlined />}
                                size="small"
                                danger
                              />
                            </Popconfirm>
                          </Col>
                        </Row>
                      </Card>
                    ))}
                  </Card>
                )}

                <Form.Item
                  label="Mức độ ưu tiên"
                  name="priority"
                  style={{ marginTop: 16 }}
                >
                  <Select>
                    <Option value="high">🔴 Cao (Khẩn cấp)</Option>
                    <Option value="normal">🟡 Bình thường</Option>
                    <Option value="low">🟢 Thấp</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Ghi chú riêng của bác sĩ"
                  name="doctorNotes"
                  tooltip="Những điều chỉnh, lưu ý đặc biệt cho bệnh nhân này"
                >
                  <Input.TextArea
                    rows={4}
                    placeholder="VD: Bệnh nhân có tiền sử dị ứng với thuốc X, cần theo dõi đặc biệt giai đoạn Y..."
                    value={doctorNotes}
                    onChange={(e) => setDoctorNotes(e.target.value)}
                  />
                </Form.Item>

                <Form.Item className="form-actions">
                  <Space>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      size="large"
                      disabled={
                        isReadOnly ||
                        !selectedTemplate ||
                        (!isEditing && existingPlan)
                      }
                      className="action-btn primary-btn"
                      icon={<CheckCircleOutlined />}
                    >
                      {isEditing
                        ? "Cập nhật phác đồ"
                        : "Xác nhận phác đồ & Lập lịch"}
                    </Button>

                    {/* Nút hủy chỉnh sửa khi đang trong chế độ chỉnh sửa */}
                    {isEditing && existingPlan && (
                      <Button
                        type="default"
                        size="large"
                        onClick={handleCancelEdit}
                        icon={<ExclamationCircleOutlined />}
                        className="action-btn cancel-edit-btn"
                      >
                        ❌ Hủy Chỉnh Sửa
                      </Button>
                    )}
                  </Space>
                </Form.Item>
              </Form>
            </div>
          </Card>
        </>
      )}
      {isEditingPhase && editingPhase && (
        <Modal
          className="treatment-plan-modal phase-edit-modal-custom"
          open={isEditingPhase}
          title={
            <div
              style={{
                background:
                  "linear-gradient(135deg, #ff7eb3 0%, #ff758c 50%, #ff6b9d 100%)",
                color: "#fff",
                padding: "18px 32px",
                borderRadius: "8px",
                fontWeight: 700,
                fontSize: 22,
                letterSpacing: 1,
                display: "flex",
                alignItems: "center",
                minHeight: 56,
                margin: "-24px -24px 16px -24px",
              }}
            >
              <span style={{ color: "#fff", textShadow: "0 2px 8px #0002" }}>
                Chỉnh sửa giai đoạn:{" "}
                <span style={{ fontWeight: 900 }}>{editingPhase.name}</span>
              </span>
            </div>
          }
          onCancel={handleCancelPhaseEdit}
          onOk={handleSavePhaseEdit}
          okText="Lưu"
          cancelText="Hủy"
          width={1200}
        >
          <div className="phase-edit-section">
            <Form layout="vertical">
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  marginBottom: 24,
                  flexWrap: "wrap",
                }}
              >
                <Form.Item
                  label="Tên giai đoạn"
                  style={{ flex: 2, minWidth: 180 }}
                >
                  <Input
                    value={editingPhase.name}
                    onChange={(e) =>
                      handlePhaseFieldChange("name", e.target.value)
                    }
                  />
                </Form.Item>
                <Form.Item label="Mô tả" style={{ flex: 3, minWidth: 220 }}>
                  <Input
                    value={editingPhase.description}
                    onChange={(e) =>
                      handlePhaseFieldChange("description", e.target.value)
                    }
                  />
                </Form.Item>
                <Form.Item label="Thời gian" style={{ flex: 1, minWidth: 120 }}>
                  <Input
                    value={editingPhase.duration}
                    onChange={(e) =>
                      handlePhaseFieldChange("duration", e.target.value)
                    }
                  />
                </Form.Item>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 40,
                  marginBottom: 8,
                  flexWrap: "wrap",
                  alignItems: "flex-start",
                }}
              >
                {/* Hoạt động */}
                <div
                  style={{
                    flex: 1,
                    minWidth: 500,
                    background: "#fafbfc",
                    padding: 28,
                    borderRadius: 12,
                    boxShadow: "0 1px 8px #e0e0e0",
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}
                  >
                    Hoạt động
                  </div>
                  <Form.Item style={{ marginBottom: 8 }}>
                    <Table
                      size="small"
                      dataSource={editingPhase.activitiesDetail || []}
                      pagination={false}
                      rowKey={(record, idx) => `activity-${idx}`}
                      columns={[
                        {
                          title: "Tên hoạt động",
                          dataIndex: "name",
                          key: "name",
                          render: (text, record, idx) => (
                            <Input
                              value={text}
                              placeholder={`Tên hoạt động #${idx + 1}`}
                              onChange={(e) =>
                                handleActivityChange(
                                  idx,
                                  "name",
                                  e.target.value
                                )
                              }
                            />
                          ),
                        },
                        {
                          title: "Ngày",
                          dataIndex: "day",
                          key: "day",
                          width: 80,
                          render: (text, record, idx) => (
                            <Input
                              value={text}
                              placeholder="Ngày"
                              style={{ width: 60 }}
                              onChange={(e) =>
                                handleActivityChange(idx, "day", e.target.value)
                              }
                            />
                          ),
                        },
                        {
                          title: "Loại",
                          dataIndex: "type",
                          key: "type",
                          width: 120,
                          render: (text, record, idx) => (
                            <Select
                              value={text || "procedure"}
                              style={{ width: 110 }}
                              onChange={(value) =>
                                handleActivityChange(idx, "type", value)
                              }
                            >
                              <Option value="procedure">Thủ thuật</Option>
                              <Option value="test">Xét nghiệm</Option>
                              <Option value="consultation">Tư vấn</Option>
                              <Option value="medication">Dùng thuốc</Option>
                            </Select>
                          ),
                        },
                        {
                          title: "Ghi chú",
                          dataIndex: "notes",
                          key: "notes",
                          render: (text, record, idx) => (
                            <Input
                              value={text}
                              placeholder="Ghi chú"
                              onChange={(e) =>
                                handleActivityChange(
                                  idx,
                                  "notes",
                                  e.target.value
                                )
                              }
                            />
                          ),
                        },
                        {
                          title: "",
                          key: "action",
                          width: 40,
                          render: (_, __, idx) => (
                            <Button
                              icon={<DeleteOutlined />}
                              size="small"
                              danger
                              onClick={() => handleRemoveActivity(idx)}
                            />
                          ),
                        },
                      ]}
                      style={{ marginBottom: 8 }}
                    />
                    <Button
                      type="dashed"
                      onClick={handleAddActivity}
                      icon={<PlusOutlined />}
                      style={{ marginTop: 8, marginBottom: 8 }}
                    >
                      Thêm hoạt động
                    </Button>
                    {/* Gợi ý hoạt động */}
                    <div className="mt-8">
                      <div
                        style={{
                          fontWeight: 700,
                          color: "#ff4081",
                          marginBottom: 8,
                          fontSize: 16,
                        }}
                      >
                        Gợi ý hoạt động:
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 10,
                          marginBottom: 8,
                        }}
                      >
                        {(getActivitySuggestions(editingPhase.name) || []).map(
                          (suggestion, i) => (
                            <Button
                              key={i}
                              type="primary"
                              shape="round"
                              size="middle"
                              icon={<PlusOutlined />}
                              style={{
                                marginBottom: 8,
                                marginRight: 8,
                                background:
                                  "linear-gradient(90deg, #ff7eb3 0%, #ff758c 100%)",
                                border: "none",
                                fontWeight: 600,
                                boxShadow: "0 2px 8px #ffb6d580",
                              }}
                              onClick={() => {
                                const newActivity = {
                                  name: suggestion,
                                  day:
                                    (editingPhase.activitiesDetail?.length ||
                                      0) + 1,
                                  type: "procedure",
                                  notes: "",
                                };
                                setEditingPhase((prev) => ({
                                  ...prev,
                                  activitiesDetail: [
                                    ...(prev.activitiesDetail || []),
                                    newActivity,
                                  ],
                                }));
                              }}
                            >
                              {suggestion}
                            </Button>
                          )
                        )}
                      </div>
                    </div>
                  </Form.Item>
                </div>
                {/* Thuốc */}
                <div
                  style={{
                    flex: 1,
                    minWidth: 500,
                    background: "#fafbfc",
                    padding: 28,
                    borderRadius: 12,
                    boxShadow: "0 1px 8px #e0e0e0",
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}
                  >
                    Thuốc
                  </div>
                  <Form.Item style={{ marginBottom: 8 }}>
                    <Table
                      size="small"
                      dataSource={editingPhase.medications || []}
                      pagination={false}
                      rowKey={(record, idx) => `medication-${idx}`}
                      columns={[
                        {
                          title: "Tên thuốc",
                          dataIndex: "name",
                          key: "name",
                          render: (text, record, idx) => (
                            <Input
                              value={text}
                              placeholder={`Tên thuốc #${idx + 1}`}
                              onChange={(e) => {
                                const newMeds = [...editingPhase.medications];
                                newMeds[idx] = {
                                  ...newMeds[idx],
                                  name: e.target.value,
                                };
                                handlePhaseFieldChange("medications", newMeds);
                              }}
                            />
                          ),
                        },
                        {
                          title: "Liều lượng",
                          dataIndex: "dosage",
                          key: "dosage",
                          render: (text, record, idx) => (
                            <Input
                              value={text}
                              placeholder="Liều lượng"
                              onChange={(e) => {
                                const newMeds = [...editingPhase.medications];
                                newMeds[idx] = {
                                  ...newMeds[idx],
                                  dosage: e.target.value,
                                };
                                handlePhaseFieldChange("medications", newMeds);
                              }}
                            />
                          ),
                        },
                        {
                          title: "Tần suất",
                          dataIndex: "frequency",
                          key: "frequency",
                          render: (text, record, idx) => (
                            <Input
                              value={text}
                              placeholder="Tần suất"
                              onChange={(e) => {
                                const newMeds = [...editingPhase.medications];
                                newMeds[idx] = {
                                  ...newMeds[idx],
                                  frequency: e.target.value,
                                };
                                handlePhaseFieldChange("medications", newMeds);
                              }}
                            />
                          ),
                        },
                        {
                          title: "Đường dùng",
                          dataIndex: "route",
                          key: "route",
                          render: (text, record, idx) => (
                            <Select
                              value={text || "Uống"}
                              style={{ width: 90 }}
                              onChange={(value) => {
                                const newMeds = [...editingPhase.medications];
                                newMeds[idx] = {
                                  ...newMeds[idx],
                                  route: value,
                                };
                                handlePhaseFieldChange("medications", newMeds);
                              }}
                            >
                              <Option value="Uống">Uống</Option>
                              <Option value="Tiêm">Tiêm</Option>
                              <Option value="Bôi">Bôi</Option>
                            </Select>
                          ),
                        },
                        {
                          title: "Thời gian",
                          dataIndex: "duration",
                          key: "duration",
                          render: (text, record, idx) => (
                            <Input
                              value={text}
                              placeholder="Thời gian"
                              onChange={(e) => {
                                const newMeds = [...editingPhase.medications];
                                newMeds[idx] = {
                                  ...newMeds[idx],
                                  duration: e.target.value,
                                };
                                handlePhaseFieldChange("medications", newMeds);
                              }}
                            />
                          ),
                        },
                        {
                          title: "",
                          key: "action",
                          width: 40,
                          render: (_, __, idx) => (
                            <Button
                              icon={<DeleteOutlined />}
                              size="small"
                              danger
                              onClick={() => handleRemovePhaseMedication(idx)}
                            />
                          ),
                        },
                      ]}
                      style={{ marginBottom: 8 }}
                    />
                    <Button
                      type="dashed"
                      onClick={handleAddPhaseMedication}
                      icon={<PlusOutlined />}
                      style={{ marginTop: 8, marginBottom: 8 }}
                    >
                      Thêm thuốc
                    </Button>
                    {/* Gợi ý thuốc */}
                    <div className="mt-8">
                      <div
                        style={{
                          fontWeight: 700,
                          color: "#ff4081",
                          marginBottom: 8,
                          fontSize: 16,
                        }}
                      >
                        Gợi ý thuốc:
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 10,
                          marginBottom: 8,
                        }}
                      >
                        {(
                          getMedicationSuggestions(editingPhase.name) || []
                        ).map((med, i) => (
                          <Button
                            key={i}
                            type="primary"
                            shape="round"
                            size="middle"
                            icon={<PlusOutlined />}
                            style={{
                              marginBottom: 8,
                              marginRight: 8,
                              background:
                                "linear-gradient(90deg, #ff7eb3 0%, #ff758c 100%)",
                              border: "none",
                              fontWeight: 600,
                              boxShadow: "0 2px 8px #ffb6d580",
                            }}
                            onClick={() => {
                              const newMed = {
                                name: med.name,
                                dosage: med.dosage,
                                frequency: med.frequency,
                                route: med.route || "Uống",
                                duration: med.duration || "theo giai đoạn",
                              };
                              setEditingPhase((prev) => ({
                                ...prev,
                                medications: [
                                  ...(prev.medications || []),
                                  newMed,
                                ],
                              }));
                            }}
                          >
                            {med.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </Form.Item>
                </div>
              </div>
            </Form>
          </div>
        </Modal>
      )}
      {existingPlan && renderPlanStatusBanner()}
      {existingPlan && renderPlanOverview()}
      {/* Sticky action bar chỉ khi đã có plan */}
      {existingPlan && renderStickyActionBar()}
    </div>
  );
};

export default TreatmentPlanEditor;
