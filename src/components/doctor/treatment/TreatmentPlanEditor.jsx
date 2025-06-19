import React, { useState, useEffect, useContext, useCallback } from "react";
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
} from "@ant-design/icons";
import {
  treatmentTemplates,
  getTemplateByType,
} from "./data/treatmentTemplates";
import { treatmentPlanAPI } from "../../../api/treatmentPlanAPI";
import { UserContext } from "../../../context/UserContext";
import { treatmentStateManager } from "../../../utils/treatmentStateManager";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Panel } = Collapse;
const { TextArea } = Input;

const TreatmentPlanEditor = ({
  patientId,
  patientInfo,
  examinationData,
  existingPlan,
  isEditing,
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

  // New states for detailed activity editing
  const [editingActivity, setEditingActivity] = useState(null);
  const [isEditingActivity, setIsEditingActivity] = useState(false);
  const [editingActivityIndex, setEditingActivityIndex] = useState(null);

  // Load existing plan when editing
  useEffect(() => {
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

        message.info("📝 Đang chỉnh sửa phác đồ điều trị hiện có");
      }
      return;
    }

    // Load default template for new plans
    if (examinationData && !selectedTemplate && !isEditing) {
      const recommendedType = getRecommendedTreatment();
      if (recommendedType) {
        handleTemplateChange(recommendedType);
        form.setFieldsValue({ treatmentType: recommendedType });
      }
    }
  }, [examinationData, existingPlan, isEditing]); // Updated dependencies

  // Separate useEffect for auto-save (with stable interval)
  useEffect(() => {
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

  const getRecommendedTreatment = () => {
    // Enhanced logic based on examination data
    if (!examinationData) return "IVF";

    const diagnosis = examinationData.diagnosis?.toLowerCase() || "";
    const recommendedService = examinationData.recommendedService;

    // Prioritize examination recommendation
    if (recommendedService) {
      return recommendedService;
    }

    // Fallback logic
    if (
      diagnosis.includes("tắc ống dẫn trứng") ||
      diagnosis.includes("tuổi cao") ||
      diagnosis.includes("amh thấp")
    ) {
      return "IVF";
    } else if (
      diagnosis.includes("rối loạn rụng trứng") ||
      diagnosis.includes("tinh trùng yếu")
    ) {
      return "IUI";
    }

    return "IVF"; // Default
  };

  const handleTemplateChange = useCallback((treatmentType) => {
    const template = getTemplateByType(treatmentType);
    setSelectedTemplate(template);
    setCustomizations({
      phases: {},
      medications: {},
      notes: "",
    });

    // Reset custom medications when changing template
    setCustomMedications([]);

    // Generate doctor suggestions based on examination data
    generateDoctorSuggestions(template);

    message.success(
      `✅ Đã chọn phác đồ ${treatmentType} - Xem chi tiết bên dưới`
    );
  }, []);

  const generateDoctorSuggestions = useCallback(
    (template) => {
      let suggestions = [];

      // Enhanced suggestions based on examination data
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

      setDoctorNotes(suggestions.join("\n"));
    },
    [examinationData, patientInfo]
  );

  const handleEditPhase = (phase) => {
    setEditingPhase(JSON.parse(JSON.stringify(phase))); // Deep clone
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
    if (editingPhase && editingPhase.activities) {
      const updatedActivities = [...editingPhase.activities];
      updatedActivities[activityIndex] = {
        ...updatedActivities[activityIndex],
        [field]: value,
      };
      setEditingPhase((prev) => ({
        ...prev,
        activities: updatedActivities,
      }));
    }
  };

  // New function to add activity
  const handleAddActivity = () => {
    if (editingPhase) {
      const newActivity = {
        day: (editingPhase.activities?.length || 0) + 1,
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
        ...(editingPhase.activities || []),
        newActivity,
      ];
      setEditingPhase((prev) => ({
        ...prev,
        activities: updatedActivities,
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
      const updatedActivities = [...editingPhase.activities];
      updatedActivities[editingActivityIndex] = editingActivity;

      setEditingPhase((prev) => ({
        ...prev,
        activities: updatedActivities,
      }));

      message.success(`✅ Đã cập nhật hoạt động "${editingActivity.name}"`);
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
    message.info("Đã hủy chỉnh sửa hoạt động");
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

      message.success(`✅ Đã cập nhật giai đoạn "${editingPhase.name}"`);
    }
    setIsEditingPhase(false);
    setEditingPhase(null);
  };

  const handleCancelPhaseEdit = () => {
    setIsEditingPhase(false);
    setEditingPhase(null);
    message.info("Đã hủy chỉnh sửa");
  };

  // Get effective phase (customized or original)
  const getEffectivePhase = (phase) => {
    const customPhase = customizations.phases?.[phase.id];
    return customPhase ? { ...phase, ...customPhase } : phase;
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
        message.error("Vui lòng chọn phác đồ điều trị");
        return;
      }

      // Merge template with customizations
      const finalPlan = {
        ...selectedTemplate,
        phases: selectedTemplate.phases.map((phase) => {
          const customPhase = customizations.phases?.[phase.id];
          return customPhase ? { ...phase, ...customPhase } : phase;
        }),
      };

      const planData = {
        id: existingPlan?.id || Date.now().toString(),
        patientId,
        doctorId: examinationData?.doctorId || user?.id,
        doctorName: user?.fullName || "Bác sĩ",
        templateId: selectedTemplate.id,
        templateName: selectedTemplate.name,
        treatmentType: selectedTemplate.type,

        // Plan details
        estimatedStartDate:
          values.startDate?.format("YYYY-MM-DD") ||
          existingPlan?.estimatedStartDate ||
          new Date().toISOString().split("T")[0],
        estimatedDuration: selectedTemplate.estimatedDuration,
        estimatedCost: selectedTemplate.cost,
        successRate: selectedTemplate.successRate,

        // Customizations
        originalTemplate: selectedTemplate,
        finalPlan: finalPlan,
        customizations: customizations,
        customMedications: customMedications,

        // Additional data
        basedOnExamination: examinationData?.id,
        doctorNotes: doctorNotes,
        planNotes: values.planNotes,

        // Enhanced metadata for editing
        createdDate:
          existingPlan?.createdDate || new Date().toISOString().split("T")[0],
        status: isEditing ? "updated" : "approved",
        isEdited: isEditing,
        editedAt: isEditing ? new Date().toISOString() : undefined,
        originalPlan: isEditing ? existingPlan : undefined,
        editCount: (existingPlan?.editCount || 0) + (isEditing ? 1 : 0),

        // Phase summary for quick access
        totalPhases: finalPlan.phases.length,
        customizedPhases: Object.keys(customizations.phases || {}).length,

        // Clinical context
        patientDiagnosis: examinationData?.diagnosis,
        patientAge: patientInfo?.age,
        recommendedService: examinationData?.recommendedService,
      };

      // Try to save via API
      try {
        const savedPlan = await treatmentPlanAPI.createTreatmentPlan(planData);
        console.log("✅ Phác đồ đã lưu thành công:", savedPlan);

        // Clear draft after successful save (only if not editing)
        if (!isEditing) {
          localStorage.removeItem(`treatment_plan_draft_${patientId}`);
        }

        const actionText = isEditing ? "Cập nhật" : "Lưu";
        message.success(
          `🎉 ${actionText} phác đồ ${selectedTemplate.type} thành công!${
            isEditing ? "" : " Chuyển sang lập lịch..."
          }`
        );

        // Log the data being passed to next step
        console.log("📋 Data being passed to schedule:", savedPlan || planData);

        // Update treatment state manager
        treatmentStateManager.updateTreatmentPlan(
          patientId,
          savedPlan || planData
        );

        // Call onNext with the saved plan data
        if (onNext) {
          onNext(savedPlan || planData);
        }
      } catch (apiError) {
        // If API fails, still proceed with local data
        console.warn("API save failed, using local data:", apiError);
        message.warning("Đã lưu phác đồ cục bộ. Hệ thống sẽ đồng bộ sau.");

        console.log("📋 Local data being passed to schedule:", planData);

        // Update treatment state manager (even if API failed)
        treatmentStateManager.updateTreatmentPlan(patientId, planData);

        if (onNext) {
          onNext(planData);
        }
      }
    } catch (error) {
      console.error("Error creating treatment plan:", error);
      message.error("❌ Có lỗi xảy ra khi lưu phác đồ. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = () => {
    const currentValues = form.getFieldsValue();
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
    message.success("💾 Đã lưu bản nháp thành công");
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
      dataIndex: "activities",
      key: "activities",
      render: (activities) => (
        <div>
          {activities.slice(0, 2).map((activity, index) => (
            <Tag key={index} style={{ marginBottom: 4 }}>
              Ngày {activity.day}: {activity.name}
            </Tag>
          ))}
          {activities.length > 2 && (
            <Text type="secondary">
              +{activities.length - 2} hoạt động khác
            </Text>
          )}
        </div>
      ),
    },
    {
      title: "Thuốc",
      dataIndex: "medications",
      key: "medications",
      render: (medications) => (
        <div>
          {medications.slice(0, 2).map((med, index) => (
            <Tag color="blue" key={index} style={{ marginBottom: 4 }}>
              {med.name}
            </Tag>
          ))}
          {medications.length > 2 && (
            <Text type="secondary">+{medications.length - 2} thuốc khác</Text>
          )}
        </div>
      ),
    },
  ];

  // New function to remove activity
  const handleRemoveActivity = (activityIndex) => {
    if (editingPhase && editingPhase.activities) {
      const updatedActivities = editingPhase.activities.filter(
        (_, index) => index !== activityIndex
      );
      setEditingPhase((prev) => ({
        ...prev,
        activities: updatedActivities,
      }));
      message.success("✅ Đã xóa hoạt động");
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

  return (
    <div style={{ padding: "24px", background: "#f5f5f5", minHeight: "100vh" }}>
      {hasError ? (
        <Card>
          <Alert
            message="Có lỗi xảy ra"
            description="Vui lòng tải lại trang hoặc liên hệ hỗ trợ kỹ thuật."
            type="error"
            showIcon
            action={
              <Button
                size="small"
                onClick={() => {
                  setHasError(false);
                  window.location.reload();
                }}
              >
                Tải lại
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          <Card>
            <Title level={2}>Lập Phác Đồ Điều Trị Cá Nhân Hóa</Title>

            {/* Thông tin bệnh nhân và chẩn đoán */}
            <Card
              size="small"
              style={{ marginBottom: 24, background: "#f9f9f9" }}
            >
              <Row gutter={16}>
                <Col span={8}>
                  <Text strong>Bệnh nhân:</Text> {patientInfo?.name}
                  <br />
                  <Text strong>Chẩn đoán:</Text> {examinationData?.diagnosis}
                </Col>
                <Col span={8}>
                  <Text strong>Khuyến nghị:</Text>{" "}
                  {examinationData?.recommendations}
                </Col>
                <Col span={8}>
                  <Text strong>Bác sĩ khám:</Text> {examinationData?.doctorId}
                </Col>
              </Row>
            </Card>

            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Form.Item
                label="Chọn loại điều trị"
                name="treatmentType"
                rules={[
                  { required: true, message: "Vui lòng chọn loại điều trị" },
                ]}
              >
                <Select
                  placeholder="Chọn dịch vụ điều trị..."
                  onChange={handleTemplateChange}
                  size="large"
                >
                  <Option value="IVF">
                    🧪 IVF - Thụ tinh trong ống nghiệm
                  </Option>
                  <Option value="IUI">
                    💉 IUI - Thụ tinh nhân tạo trong tử cung
                  </Option>
                </Select>
              </Form.Item>

              {/* Gợi ý của bác sĩ */}
              {doctorNotes && (
                <Alert
                  message="💡 Gợi ý từ hệ thống dựa trên kết quả khám"
                  description={
                    <pre
                      style={{ whiteSpace: "pre-line", fontFamily: "inherit" }}
                    >
                      {doctorNotes}
                    </pre>
                  }
                  type="info"
                  showIcon
                  style={{ marginBottom: 24 }}
                />
              )}

              {/* Template Details with Real-time Updates */}
              {selectedTemplate && (
                <Card
                  title="Chi Tiết Phác Đồ Được Chọn"
                  style={{ marginBottom: 24 }}
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
                    {Object.keys(customizations.phases || {}).length > 0 && (
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
                    items={selectedTemplate.phases.map((phase, index) => {
                      const effectivePhase = getEffectivePhase(phase);
                      const isCustomized = customizations.phases?.[phase.id];

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
                          <div>
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
                                    <Space direction="vertical" size="small">
                                      <Text strong>{name}</Text>
                                      <Space size="small">
                                        <Tag icon={<ClockCircleOutlined />}>
                                          {record.duration} phút
                                        </Tag>
                                        <Tag
                                          color={
                                            record.required ? "red" : "green"
                                          }
                                        >
                                          {record.required
                                            ? "Bắt buộc"
                                            : "Tùy chọn"}
                                        </Tag>
                                        <Tag color="purple">{record.room}</Tag>
                                      </Space>
                                    </Space>
                                  ),
                                },
                              ]}
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
              {customMedications.length > 0 && (
                <Card
                  title="💊 Thuốc tùy chỉnh thêm"
                  size="small"
                  style={{ marginTop: 16 }}
                >
                  {customMedications.map((med) => (
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
                              handleUpdateMedication(med.id, "startDay", value)
                            }
                            min={1}
                          />
                        </Col>
                        <Col span={3}>
                          <InputNumber
                            placeholder="Thời gian (ngày)"
                            value={med.duration}
                            onChange={(value) =>
                              handleUpdateMedication(med.id, "duration", value)
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

              {/* Requirements and Contraindications */}
              {selectedTemplate && (
                <>
                  <Row gutter={16} style={{ marginTop: 16 }}>
                    <Col span={12}>
                      <Card title="✅ Yêu cầu" size="small">
                        <ul>
                          {selectedTemplate.requirements.map((req, index) => (
                            <li key={index}>
                              <Text>{req}</Text>
                            </li>
                          ))}
                        </ul>
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card title="⚠️ Chống chỉ định" size="small">
                        <ul>
                          {selectedTemplate.contraindications.map(
                            (contra, index) => (
                              <li key={index}>
                                <Text type="danger">{contra}</Text>
                              </li>
                            )
                          )}
                        </ul>
                      </Card>
                    </Col>
                  </Row>
                </>
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

              <Form.Item style={{ marginTop: 24 }}>
                <Space>
                  <Button
                    icon={<SaveOutlined />}
                    onClick={handleSaveDraft}
                    disabled={!selectedTemplate}
                  >
                    💾 Lưu nháp
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    size="large"
                    disabled={!selectedTemplate}
                    style={{ minWidth: "200px" }}
                  >
                    ✅ Xác nhận phác đồ & Lập lịch
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>

          {/* Edit Phase Modal */}
          <Modal
            title={
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor: "#1890ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px",
                  }}
                >
                  ⚙️
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#1890ff",
                    }}
                  >
                    Chỉnh sửa giai đoạn
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#666",
                      fontWeight: "normal",
                    }}
                  >
                    {editingPhase?.name}
                  </div>
                </div>
              </div>
            }
            open={isEditingPhase}
            onOk={handleSavePhaseEdit}
            onCancel={handleCancelPhaseEdit}
            width={1000}
            okText="💾 Lưu thay đổi"
            cancelText="❌ Hủy"
            style={{ top: 20 }}
            styles={{
              body: {
                padding: "24px",
                backgroundColor: "#fafafa",
              },
            }}
            footer={[
              <Button
                key="test"
                type="dashed"
                onClick={() => {
                  if (editingPhase) {
                    // Add sample data for testing
                    const sampleActivity = {
                      day: (editingPhase.activities?.length || 0) + 1,
                      name: "Tiêm FSH theo chỉ định - TEST",
                      type: "medication",
                    };
                    const sampleMedication = {
                      name: "Gonal-F (TEST)",
                      dosage: "150 IU/ngày",
                      frequency: "1 lần/ngày",
                    };

                    setEditingPhase((prev) => ({
                      ...prev,
                      activities: [...(prev.activities || []), sampleActivity],
                      medications: [
                        ...(prev.medications || []),
                        sampleMedication,
                      ],
                    }));

                    message.success("🧪 Đã thêm dữ liệu mẫu cho test");
                  }
                }}
              >
                🧪 Test thêm mẫu
              </Button>,
              <Button key="cancel" onClick={handleCancelPhaseEdit}>
                ❌ Hủy
              </Button>,
              <Button key="save" type="primary" onClick={handleSavePhaseEdit}>
                💾 Lưu thay đổi
              </Button>,
            ]}
          >
            {editingPhase && (
              <div>
                <Form layout="vertical">
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="Tên giai đoạn">
                        <Input
                          value={editingPhase.name}
                          onChange={(e) =>
                            handlePhaseFieldChange("name", e.target.value)
                          }
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Thời gian (ngày)">
                        <Input
                          value={editingPhase.duration}
                          onChange={(e) =>
                            handlePhaseFieldChange("duration", e.target.value)
                          }
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item label="Mô tả chi tiết">
                    <Input.TextArea
                      rows={3}
                      value={editingPhase.description}
                      onChange={(e) =>
                        handlePhaseFieldChange("description", e.target.value)
                      }
                    />
                  </Form.Item>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Card
                        title="Hoạt động"
                        size="small"
                        extra={
                          <Space>
                            <Button
                              type="primary"
                              size="small"
                              icon={<PlusOutlined />}
                              onClick={handleAddActivity}
                            >
                              Thêm
                            </Button>
                            <Select
                              size="small"
                              placeholder="Gợi ý hoạt động"
                              style={{ width: 200 }}
                              showSearch
                              allowClear
                              onSelect={(value) => {
                                const newActivity = {
                                  day:
                                    (editingPhase.activities?.length || 0) + 1,
                                  name: value,
                                  type: "procedure",
                                };
                                const updatedActivities = [
                                  ...(editingPhase.activities || []),
                                  newActivity,
                                ];
                                setEditingPhase((prev) => ({
                                  ...prev,
                                  activities: updatedActivities,
                                }));
                              }}
                            >
                              {getActivitySuggestions(
                                editingPhase?.name || ""
                              ).map((suggestion, index) => (
                                <Option key={index} value={suggestion}>
                                  {suggestion}
                                </Option>
                              ))}
                            </Select>
                          </Space>
                        }
                      >
                        <div
                          style={{
                            maxHeight: "400px",
                            overflowY: "auto",
                            paddingRight: "8px",
                          }}
                        >
                          {editingPhase.activities?.map((activity, index) => (
                            <Card
                              key={`activity-${index}`}
                              size="small"
                              style={{
                                marginBottom: "12px",
                                borderRadius: "12px",
                                border: "1px solid #e8f4fd",
                                backgroundColor: "#fafcff",
                                transition: "all 0.3s ease",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                              }}
                              hoverable
                              styles={{ body: { padding: "16px" } }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "flex-start",
                                  gap: "12px",
                                }}
                              >
                                {/* Day Badge */}
                                <div
                                  style={{
                                    flex: "0 0 auto",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: "56px",
                                    height: "56px",
                                    borderRadius: "50%",
                                    backgroundColor: "#1890ff",
                                    color: "white",
                                    fontWeight: "bold",
                                    fontSize: "11px",
                                    textAlign: "center",
                                    lineHeight: "1.2",
                                  }}
                                >
                                  Ngày
                                  <br />
                                  {activity.day}
                                </div>

                                {/* Activity Content */}
                                <div
                                  style={{
                                    flex: 1,
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "8px",
                                  }}
                                >
                                  {/* Activity Name Input */}
                                  <Input
                                    value={activity.name}
                                    onChange={(e) => {
                                      const updatedActivities = [
                                        ...editingPhase.activities,
                                      ];
                                      updatedActivities[index] = {
                                        ...updatedActivities[index],
                                        name: e.target.value,
                                      };
                                      setEditingPhase((prev) => ({
                                        ...prev,
                                        activities: updatedActivities,
                                      }));
                                    }}
                                    placeholder="Nhập tên hoạt động..."
                                    style={{
                                      fontSize: "14px",
                                      fontWeight: "500",
                                      border: "1px solid #d9d9d9",
                                      borderRadius: "6px",
                                    }}
                                  />

                                  {/* Activity Info Tags */}
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "8px",
                                      flexWrap: "wrap",
                                    }}
                                  >
                                    {/* Activity Type Icon */}
                                    <Tag
                                      color="geekblue"
                                      style={{
                                        margin: 0,
                                        fontSize: "11px",
                                        borderRadius: "4px",
                                      }}
                                    >
                                      {activity.type === "procedure"
                                        ? "🏥"
                                        : activity.type === "medication"
                                        ? "💊"
                                        : activity.type === "test"
                                        ? "🔬"
                                        : activity.type === "consultation"
                                        ? "💬"
                                        : activity.type === "monitoring"
                                        ? "📊"
                                        : "📋"}
                                      {activity.type === "procedure"
                                        ? "Thủ thuật"
                                        : activity.type === "medication"
                                        ? "Thuốc"
                                        : activity.type === "test"
                                        ? "Xét nghiệm"
                                        : activity.type === "consultation"
                                        ? "Tư vấn"
                                        : activity.type === "monitoring"
                                        ? "Theo dõi"
                                        : "Chuẩn bị"}
                                    </Tag>

                                    {/* Time */}
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "4px",
                                        color: "#666",
                                        fontSize: "12px",
                                        backgroundColor: "#f5f5f5",
                                        padding: "2px 6px",
                                        borderRadius: "4px",
                                      }}
                                    >
                                      🕒 {activity.time || "09:00"}
                                      {activity.duration
                                        ? ` (${activity.duration}p)`
                                        : ""}
                                    </div>

                                    {/* Department */}
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "4px",
                                        color: "#666",
                                        fontSize: "12px",
                                        backgroundColor: "#f0f9ff",
                                        padding: "2px 6px",
                                        borderRadius: "4px",
                                      }}
                                    >
                                      📍{" "}
                                      {getDepartmentOptions()
                                        .find(
                                          (d) => d.value === activity.department
                                        )
                                        ?.label?.split(" ")[1] || "Phòng khám"}
                                      {activity.room && ` - ${activity.room}`}
                                    </div>

                                    {/* Staff */}
                                    {activity.staff && (
                                      <div
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: "4px",
                                          color: "#666",
                                          fontSize: "12px",
                                          backgroundColor: "#f6ffed",
                                          padding: "2px 6px",
                                          borderRadius: "4px",
                                        }}
                                      >
                                        👨‍⚕️ {activity.staff}
                                      </div>
                                    )}

                                    {/* Priority Tag */}
                                    {activity.priority &&
                                      activity.priority !== "normal" && (
                                        <Tag
                                          color={
                                            activity.priority === "urgent"
                                              ? "red"
                                              : activity.priority === "high"
                                              ? "orange"
                                              : activity.priority === "low"
                                              ? "green"
                                              : "blue"
                                          }
                                          style={{
                                            margin: 0,
                                            fontSize: "11px",
                                          }}
                                        >
                                          {activity.priority === "urgent"
                                            ? "🔴 Khẩn cấp"
                                            : activity.priority === "high"
                                            ? "🟠 Cao"
                                            : activity.priority === "low"
                                            ? "🟢 Thấp"
                                            : "🟡 Bình thường"}
                                        </Tag>
                                      )}
                                  </div>

                                  {/* Cost Display */}
                                  {activity.cost && (
                                    <div
                                      style={{
                                        fontSize: "12px",
                                        color: "#52c41a",
                                        fontWeight: "500",
                                      }}
                                    >
                                      💰{" "}
                                      {activity.cost?.toLocaleString("vi-VN")}{" "}
                                      VNĐ
                                    </div>
                                  )}
                                </div>

                                {/* Status & Actions */}
                                <div
                                  style={{
                                    flex: "0 0 auto",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "flex-end",
                                    gap: "8px",
                                  }}
                                >
                                  {/* Status Badge */}
                                  <Tag
                                    color={
                                      getStatusOptions().find(
                                        (s) => s.value === activity.status
                                      )?.color || "blue"
                                    }
                                    style={{
                                      borderRadius: "8px",
                                      fontWeight: "500",
                                    }}
                                  >
                                    {getStatusOptions()
                                      .find((s) => s.value === activity.status)
                                      ?.label?.split(" ")[1] || "Kế hoạch"}
                                  </Tag>

                                  {/* Action Buttons */}
                                  <div style={{ display: "flex", gap: "6px" }}>
                                    <Button
                                      type="primary"
                                      icon={<EditOutlined />}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditActivityDetails(
                                          activity,
                                          index
                                        );
                                      }}
                                      size="small"
                                      style={{
                                        borderRadius: "6px",
                                        boxShadow:
                                          "0 2px 4px rgba(24, 144, 255, 0.2)",
                                      }}
                                    >
                                      Chi tiết
                                    </Button>

                                    <Button
                                      danger
                                      icon={<DeleteOutlined />}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveActivity(index);
                                      }}
                                      size="small"
                                      style={{
                                        borderRadius: "6px",
                                        boxShadow:
                                          "0 2px 4px rgba(255, 77, 79, 0.2)",
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>

                        {(!editingPhase.activities ||
                          editingPhase.activities.length === 0) && (
                          <div
                            style={{
                              textAlign: "center",
                              padding: "40px 20px",
                              backgroundColor: "#f9f9f9",
                              borderRadius: "8px",
                              border: "2px dashed #d9d9d9",
                              margin: "16px 0",
                            }}
                          >
                            <div
                              style={{ fontSize: "48px", marginBottom: "16px" }}
                            >
                              📋
                            </div>
                            <Text
                              type="secondary"
                              style={{
                                fontSize: "16px",
                                display: "block",
                                marginBottom: "8px",
                              }}
                            >
                              Chưa có hoạt động nào
                            </Text>
                            <Text type="secondary" style={{ fontSize: "14px" }}>
                              Click <strong>"Thêm"</strong> để thêm hoạt động
                              mới hoặc chọn từ <strong>gợi ý</strong> phía trên.
                            </Text>
                          </div>
                        )}
                      </Card>
                    </Col>

                    <Col span={12}>
                      <Card
                        title="Thuốc điều trị"
                        size="small"
                        extra={
                          <Space>
                            <Button
                              type="primary"
                              size="small"
                              icon={<PlusOutlined />}
                              onClick={handleAddPhaseMedication}
                            >
                              Thêm
                            </Button>
                            <Select
                              size="small"
                              placeholder="Gợi ý thuốc"
                              style={{ width: 200 }}
                              showSearch
                              allowClear
                              onSelect={(value) => {
                                const suggestions = getMedicationSuggestions(
                                  editingPhase?.name || ""
                                );
                                const selectedMed = suggestions.find(
                                  (med) => med.name === value
                                );

                                const newMedication = selectedMed || {
                                  name: value,
                                  dosage: "",
                                  frequency: "1 lần/ngày",
                                };

                                const updatedMedications = [
                                  ...(editingPhase.medications || []),
                                  newMedication,
                                ];
                                setEditingPhase((prev) => ({
                                  ...prev,
                                  medications: updatedMedications,
                                }));
                              }}
                            >
                              {getMedicationSuggestions(
                                editingPhase?.name || ""
                              ).map((suggestion, index) => (
                                <Option key={index} value={suggestion.name}>
                                  <div>
                                    <Text strong>{suggestion.name}</Text>
                                    <br />
                                    <Text
                                      type="secondary"
                                      style={{ fontSize: "12px" }}
                                    >
                                      {suggestion.dosage} -{" "}
                                      {suggestion.frequency}
                                    </Text>
                                  </div>
                                </Option>
                              ))}
                            </Select>
                          </Space>
                        }
                      >
                        <div
                          style={{
                            maxHeight: "400px",
                            overflowY: "auto",
                            paddingRight: "8px",
                          }}
                        >
                          {editingPhase.medications?.map((med, index) => (
                            <Card
                              key={`medication-${index}`}
                              size="small"
                              style={{
                                marginBottom: "12px",
                                borderRadius: "12px",
                                border: "1px solid #e8f0fe",
                                backgroundColor: "#fbfcff",
                                transition: "all 0.3s ease",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                              }}
                              hoverable
                              styles={{ body: { padding: "16px" } }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "flex-start",
                                  gap: "12px",
                                }}
                              >
                                {/* Medicine Icon */}
                                <div
                                  style={{
                                    flex: "0 0 auto",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: "56px",
                                    height: "56px",
                                    borderRadius: "50%",
                                    backgroundColor: "#52c41a",
                                    color: "white",
                                    fontSize: "24px",
                                  }}
                                >
                                  💊
                                </div>

                                {/* Medicine Content */}
                                <div
                                  style={{
                                    flex: 1,
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "8px",
                                  }}
                                >
                                  {/* Medicine Name */}
                                  <Input
                                    value={med.name}
                                    placeholder="Tên thuốc..."
                                    style={{
                                      fontSize: "14px",
                                      fontWeight: "500",
                                      border: "1px solid #d9d9d9",
                                      borderRadius: "6px",
                                    }}
                                    onChange={(e) => {
                                      const newMeds = [
                                        ...editingPhase.medications,
                                      ];
                                      newMeds[index] = {
                                        ...med,
                                        name: e.target.value,
                                      };
                                      handlePhaseFieldChange(
                                        "medications",
                                        newMeds
                                      );
                                    }}
                                  />

                                  {/* Dosage */}
                                  <Input
                                    value={med.dosage}
                                    placeholder="Liều lượng (VD: 150 IU/ngày)"
                                    style={{
                                      fontSize: "13px",
                                      border: "1px solid #d9d9d9",
                                      borderRadius: "6px",
                                    }}
                                    onChange={(e) => {
                                      const newMeds = [
                                        ...editingPhase.medications,
                                      ];
                                      newMeds[index] = {
                                        ...med,
                                        dosage: e.target.value,
                                      };
                                      handlePhaseFieldChange(
                                        "medications",
                                        newMeds
                                      );
                                    }}
                                  />

                                  {/* Frequency */}
                                  <Select
                                    value={med.frequency}
                                    placeholder="Tần suất sử dụng"
                                    style={{
                                      width: "100%",
                                      fontSize: "13px",
                                    }}
                                    onChange={(value) => {
                                      const newMeds = [
                                        ...editingPhase.medications,
                                      ];
                                      newMeds[index] = {
                                        ...med,
                                        frequency: value,
                                      };
                                      handlePhaseFieldChange(
                                        "medications",
                                        newMeds
                                      );
                                    }}
                                  >
                                    <Option value="1 lần/ngày">
                                      🕘 1 lần/ngày
                                    </Option>
                                    <Option value="2 lần/ngày">
                                      🕘 2 lần/ngày
                                    </Option>
                                    <Option value="3 lần/ngày">
                                      🕘 3 lần/ngày
                                    </Option>
                                    <Option value="1 lần/ngày tối">
                                      🌙 1 lần/ngày tối
                                    </Option>
                                    <Option value="1 lần/ngày sáng">
                                      🌅 1 lần/ngày sáng
                                    </Option>
                                    <Option value="khi cần">⚡ Khi cần</Option>
                                    <Option value="theo chu kỳ">
                                      🔄 Theo chu kỳ
                                    </Option>
                                  </Select>

                                  {/* Medicine Info Tags */}
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "6px",
                                      flexWrap: "wrap",
                                      marginTop: "4px",
                                    }}
                                  >
                                    <Tag
                                      color="green"
                                      style={{
                                        margin: 0,
                                        fontSize: "11px",
                                        borderRadius: "4px",
                                      }}
                                    >
                                      💊 Thuốc điều trị
                                    </Tag>

                                    {med.route && (
                                      <Tag
                                        color="blue"
                                        style={{
                                          margin: 0,
                                          fontSize: "11px",
                                          borderRadius: "4px",
                                        }}
                                      >
                                        🎯 {med.route}
                                      </Tag>
                                    )}

                                    {med.duration && (
                                      <Tag
                                        color="orange"
                                        style={{
                                          margin: 0,
                                          fontSize: "11px",
                                          borderRadius: "4px",
                                        }}
                                      >
                                        ⏱️ {med.duration}
                                      </Tag>
                                    )}
                                  </div>
                                </div>

                                {/* Delete Button */}
                                <div
                                  style={{
                                    flex: "0 0 auto",
                                    display: "flex",
                                    alignItems: "flex-start",
                                  }}
                                >
                                  <Button
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() =>
                                      handleRemovePhaseMedication(index)
                                    }
                                    size="small"
                                    style={{
                                      borderRadius: "6px",
                                      boxShadow:
                                        "0 2px 4px rgba(255, 77, 79, 0.2)",
                                    }}
                                  />
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>

                        {(!editingPhase.medications ||
                          editingPhase.medications.length === 0) && (
                          <div
                            style={{
                              textAlign: "center",
                              padding: "40px 20px",
                              backgroundColor: "#f6ffed",
                              borderRadius: "8px",
                              border: "2px dashed #b7eb8f",
                              margin: "16px 0",
                            }}
                          >
                            <div
                              style={{ fontSize: "48px", marginBottom: "16px" }}
                            >
                              💊
                            </div>
                            <Text
                              type="secondary"
                              style={{
                                fontSize: "16px",
                                display: "block",
                                marginBottom: "8px",
                              }}
                            >
                              Chưa có thuốc nào
                            </Text>
                            <Text type="secondary" style={{ fontSize: "14px" }}>
                              Click <strong>"Thêm"</strong> để thêm thuốc mới
                              hoặc chọn từ <strong>gợi ý</strong> phía trên.
                            </Text>
                          </div>
                        )}
                      </Card>
                    </Col>
                  </Row>
                </Form>
              </div>
            )}
          </Modal>

          {/* Detailed Activity Editing Modal */}
          <Modal
            title={
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <EditOutlined style={{ color: "#1890ff" }} />
                <span>Chi tiết hoạt động</span>
              </div>
            }
            open={isEditingActivity}
            onOk={handleSaveActivityDetails}
            onCancel={handleCancelActivityEdit}
            width={800}
            okText="💾 Lưu thay đổi"
            cancelText="❌ Hủy"
            okButtonProps={{
              type: "primary",
              disabled: !editingActivity?.name?.trim(),
            }}
          >
            {editingActivity && (
              <div style={{ padding: "16px 0" }}>
                {/* Basic Information */}
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <div style={{ marginBottom: "8px" }}>
                      <Text strong>
                        Tên hoạt động <span style={{ color: "red" }}>*</span>
                      </Text>
                    </div>
                    <Input
                      value={editingActivity.name}
                      onChange={(e) =>
                        handleActivityFieldChange("name", e.target.value)
                      }
                      placeholder="Nhập tên hoạt động..."
                      size="large"
                    />
                  </Col>

                  <Col span={6}>
                    <div style={{ marginBottom: "8px" }}>
                      <Text strong>Ngày trong giai đoạn</Text>
                    </div>
                    <InputNumber
                      value={editingActivity.day}
                      onChange={(value) =>
                        handleActivityFieldChange("day", value)
                      }
                      min={1}
                      max={30}
                      size="large"
                      style={{ width: "100%" }}
                    />
                  </Col>

                  <Col span={6}>
                    <div style={{ marginBottom: "8px" }}>
                      <Text strong>Loại hoạt động</Text>
                    </div>
                    <Select
                      value={editingActivity.type}
                      onChange={(value) =>
                        handleActivityFieldChange("type", value)
                      }
                      size="large"
                      style={{ width: "100%" }}
                    >
                      <Option value="procedure">🏥 Thủ thuật</Option>
                      <Option value="medication">💊 Dùng thuốc</Option>
                      <Option value="test">🔬 Xét nghiệm</Option>
                      <Option value="consultation">💬 Tư vấn</Option>
                      <Option value="monitoring">📊 Theo dõi</Option>
                      <Option value="preparation">📋 Chuẩn bị</Option>
                    </Select>
                  </Col>
                </Row>

                {/* Schedule Information */}
                <Divider orientation="left">📅 Thông tin lịch hẹn</Divider>
                <Row gutter={[16, 16]}>
                  <Col span={8}>
                    <div style={{ marginBottom: "8px" }}>
                      <Text strong>Ngày cụ thể</Text>
                    </div>
                    <DatePicker
                      value={
                        editingActivity.specificDate
                          ? dayjs(editingActivity.specificDate)
                          : null
                      }
                      onChange={(date) =>
                        handleActivityFieldChange(
                          "specificDate",
                          date ? date.toISOString() : null
                        )
                      }
                      format="DD/MM/YYYY"
                      placeholder="Chọn ngày"
                      size="large"
                      style={{ width: "100%" }}
                    />
                  </Col>

                  <Col span={8}>
                    <div style={{ marginBottom: "8px" }}>
                      <Text strong>Giờ thực hiện</Text>
                    </div>
                    <TimePicker
                      value={
                        editingActivity.time
                          ? dayjs(editingActivity.time, "HH:mm")
                          : null
                      }
                      onChange={(time) =>
                        handleActivityFieldChange(
                          "time",
                          time ? time.format("HH:mm") : "09:00"
                        )
                      }
                      format="HH:mm"
                      placeholder="Chọn giờ"
                      size="large"
                      style={{ width: "100%" }}
                    />
                  </Col>

                  <Col span={8}>
                    <div style={{ marginBottom: "8px" }}>
                      <Text strong>Thời gian (phút)</Text>
                    </div>
                    <InputNumber
                      value={editingActivity.duration}
                      onChange={(value) =>
                        handleActivityFieldChange("duration", value)
                      }
                      min={5}
                      max={480}
                      step={15}
                      size="large"
                      style={{ width: "100%" }}
                      addonAfter="phút"
                    />
                  </Col>
                </Row>

                {/* Location & Staff */}
                <Divider orientation="left">🏥 Địa điểm & Nhân sự</Divider>
                <Row gutter={[16, 16]}>
                  <Col span={8}>
                    <div style={{ marginBottom: "8px" }}>
                      <Text strong>Phòng ban</Text>
                    </div>
                    <Select
                      value={editingActivity.department}
                      onChange={(value) => {
                        handleActivityFieldChange("department", value);
                        handleActivityFieldChange("room", ""); // Reset room when department changes
                      }}
                      size="large"
                      style={{ width: "100%" }}
                      options={getDepartmentOptions()}
                    />
                  </Col>

                  <Col span={8}>
                    <div style={{ marginBottom: "8px" }}>
                      <Text strong>Phòng</Text>
                    </div>
                    <Select
                      value={editingActivity.room}
                      onChange={(value) =>
                        handleActivityFieldChange("room", value)
                      }
                      size="large"
                      style={{ width: "100%" }}
                      placeholder="Chọn phòng"
                      allowClear
                    >
                      {getRoomOptions(editingActivity.department).map(
                        (room) => (
                          <Option key={room} value={room}>
                            {room}
                          </Option>
                        )
                      )}
                    </Select>
                  </Col>

                  <Col span={8}>
                    <div style={{ marginBottom: "8px" }}>
                      <Text strong>Nhân viên phụ trách</Text>
                    </div>
                    <Input
                      value={editingActivity.staff}
                      onChange={(e) =>
                        handleActivityFieldChange("staff", e.target.value)
                      }
                      placeholder="Tên bác sĩ/nhân viên"
                      size="large"
                    />
                  </Col>
                </Row>

                {/* Status & Priority */}
                <Divider orientation="left">📊 Trạng thái & Ưu tiên</Divider>
                <Row gutter={[16, 16]}>
                  <Col span={8}>
                    <div style={{ marginBottom: "8px" }}>
                      <Text strong>Trạng thái</Text>
                    </div>
                    <Select
                      value={editingActivity.status}
                      onChange={(value) =>
                        handleActivityFieldChange("status", value)
                      }
                      size="large"
                      style={{ width: "100%" }}
                      options={getStatusOptions()}
                    />
                  </Col>

                  <Col span={8}>
                    <div style={{ marginBottom: "8px" }}>
                      <Text strong>Mức độ ưu tiên</Text>
                    </div>
                    <Select
                      value={editingActivity.priority}
                      onChange={(value) =>
                        handleActivityFieldChange("priority", value)
                      }
                      size="large"
                      style={{ width: "100%" }}
                    >
                      <Option value="low">🟢 Thấp</Option>
                      <Option value="normal">🟡 Bình thường</Option>
                      <Option value="high">🟠 Cao</Option>
                      <Option value="urgent">🔴 Khẩn cấp</Option>
                    </Select>
                  </Col>

                  <Col span={8}>
                    <div style={{ marginBottom: "8px" }}>
                      <Text strong>Chi phí (VNĐ)</Text>
                    </div>
                    <InputNumber
                      value={editingActivity.cost}
                      onChange={(value) =>
                        handleActivityFieldChange("cost", value)
                      }
                      min={0}
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                      size="large"
                      style={{ width: "100%" }}
                      placeholder="0"
                    />
                  </Col>
                </Row>

                {/* Additional Information */}
                <Divider orientation="left">📝 Thông tin bổ sung</Divider>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <div style={{ marginBottom: "8px" }}>
                      <Text strong>Chuẩn bị trước</Text>
                    </div>
                    <TextArea
                      value={editingActivity.preparation}
                      onChange={(e) =>
                        handleActivityFieldChange("preparation", e.target.value)
                      }
                      placeholder="Hướng dẫn chuẩn bị trước khi thực hiện..."
                      rows={3}
                      showCount
                      maxLength={500}
                    />
                  </Col>

                  <Col span={12}>
                    <div style={{ marginBottom: "8px" }}>
                      <Text strong>Theo dõi sau</Text>
                    </div>
                    <TextArea
                      value={editingActivity.followUp}
                      onChange={(e) =>
                        handleActivityFieldChange("followUp", e.target.value)
                      }
                      placeholder="Hướng dẫn theo dõi sau khi hoàn thành..."
                      rows={3}
                      showCount
                      maxLength={500}
                    />
                  </Col>

                  <Col span={24}>
                    <div style={{ marginBottom: "8px" }}>
                      <Text strong>Ghi chú</Text>
                    </div>
                    <TextArea
                      value={editingActivity.notes}
                      onChange={(e) =>
                        handleActivityFieldChange("notes", e.target.value)
                      }
                      placeholder="Ghi chú thêm về hoạt động này..."
                      rows={2}
                      showCount
                      maxLength={1000}
                    />
                  </Col>
                </Row>

                {/* Requirements Tags */}
                <Divider orientation="left">✅ Yêu cầu đặc biệt</Divider>
                <div style={{ marginBottom: "16px" }}>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    Nhấp để thêm/bỏ các yêu cầu đặc biệt
                  </Text>
                  <div
                    style={{
                      marginTop: "8px",
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "4px",
                    }}
                  >
                    {[
                      "Nhịn ăn 8h",
                      "Uống nước đầy bàng quang",
                      "Mang theo thuốc",
                      "Có người nhà đi cùng",
                      "Không lái xe",
                      "Nghỉ việc 1 ngày",
                      "Kiểm tra tiền sử dị ứng",
                      "Chuẩn bị tâm lý",
                      "Đọc hướng dẫn chi tiết",
                    ].map((req) => (
                      <Tag.CheckableTag
                        key={req}
                        checked={editingActivity.requirements?.includes(req)}
                        onChange={(checked) => {
                          const currentReqs =
                            editingActivity.requirements || [];
                          const newReqs = checked
                            ? [...currentReqs, req]
                            : currentReqs.filter((r) => r !== req);
                          handleActivityFieldChange("requirements", newReqs);
                        }}
                      >
                        {req}
                      </Tag.CheckableTag>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Modal>
        </>
      )}
    </div>
  );
};

export default TreatmentPlanEditor;
