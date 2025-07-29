import React, { useState, useEffect, useContext } from "react";
import {
  Card,
  Steps,
  Button,
  Row,
  Col,
  Typography,
  Space,
  Divider,
  Badge,
  Tag,
  Progress,
  Alert,
  Modal,
  message,
} from "antd";
import {
  UserOutlined,
  HeartOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
  PlayCircleOutlined,
  EyeOutlined,
  KeyOutlined,
  DeleteOutlined,
  ArrowRightOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import "../DoctorTheme.css";
import "./TreatmentProcess.css";
import ExaminationForm from "./ExaminationForm";
import TreatmentPlanEditor from "./TreatmentPlanEditor";
import TreatmentScheduleForm from "./TreatmentScheduleForm";
import PatientScheduleView from "./PatientScheduleView";
import TreatmentProgressTracker from "./TreatmentProgressTracker";

import { treatmentStateManager } from "../../../utils/treatmentStateManager";
import { UserContext } from "../../../context/UserContext";
import { clinicalResultsAPI } from "../../../api/apiClinicalResults";
import apiDoctor from "../../../api/apiDoctor";
import { treatmentPlanAPI } from "../../../api/treatmentPlanAPI";
import { debugUtils } from "../../../utils/debugUtils";
import { refreshTokenFromContext } from "../../../services/axiosClient.js";

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

const TreatmentProcess = ({ patientId, mode = "doctor", patientInfo }) => {
  const { user } = useContext(UserContext);
  const [currentStep, setCurrentStep] = useState(0);
  const [processData, setProcessData] = useState({
    patient: null,
    examination: null,
    treatmentPlan: null,
    schedule: null,
    progress: null,
  });
  const [loading, setLoading] = useState(true);
  const [autoProgress, setAutoProgress] = useState(true); // Thêm state để kiểm soát auto progress
  const [progressAnimation, setProgressAnimation] = useState(false); // Animation cho progress

  // Load patient info from API or localStorage
  const loadPatientInfo = async () => {
    try {
      console.log("🔄 loadPatientInfo: Starting for patientId:", patientId);
      setLoading(true);

      let patientInfo = null;

      // Priority 1: Try to load from real API first
      try {
        const apiPatientInfo = await apiDoctor.getPatientInfo(patientId);
        if (apiPatientInfo && apiPatientInfo.data) {
          patientInfo = {
            id: patientId,
            name: apiPatientInfo.data.name || `Bệnh nhân ${patientId}`,
            gender: apiPatientInfo.data.gender || "unknown",
            age: apiPatientInfo.data.age || null,
            contact:
              apiPatientInfo.data.phone || apiPatientInfo.data.contact || null,
            email: apiPatientInfo.data.email || null,
            address: apiPatientInfo.data.address || null,
            status: "active",
          };
          console.log("✅ Loaded patient info from API:", patientInfo);
        }
      } catch (apiError) {
        console.warn(
          "⚠️ Could not load from API, trying fallback methods:",
          apiError
        );
      }

      // Priority 2: Try to get from localStorage if API failed
      if (!patientInfo) {
        const storedPatientInfo = localStorage.getItem(
          `patient_info_${patientId}`
        );
        if (storedPatientInfo) {
          try {
            patientInfo = JSON.parse(storedPatientInfo);
            console.log(
              "✅ Loaded patient info from localStorage:",
              patientInfo
            );
          } catch (e) {
            console.warn("⚠️ Invalid patient info in localStorage:", e);
          }
        }
      }

      // Priority 3: Try to get from URL params
      if (!patientInfo) {
        const urlParams = new URLSearchParams(window.location.search);
        const patientName = urlParams.get("patientName");
        const patientGender = urlParams.get("patientGender");
        const patientAge = urlParams.get("patientAge");

        if (patientName) {
          patientInfo = {
            id: patientId,
            name: patientName,
            gender: patientGender || "unknown",
            age: patientAge ? parseInt(patientAge) : null,
            contact: urlParams.get("patientContact") || null,
            email: urlParams.get("patientEmail") || null,
            address: urlParams.get("patientAddress") || null,
            status: "active",
          };
          console.log("✅ Created patient info from URL params:", patientInfo);
        }
      }

      // Priority 4: Fallback to minimal info
      if (!patientInfo) {
        patientInfo = {
          id: patientId,
          name: `Bệnh nhân ${patientId}`,
          gender: "Chưa có",
          age: "Chưa có",
          contact: "Chưa có",
          email: "Chưa có",
          address: "Chưa có",
          status: "active",
        };
        console.log("✅ Using fallback patient info:", patientInfo);
      }

      // Store in localStorage for future use
      localStorage.setItem(
        `patient_info_${patientId}`,
        JSON.stringify(patientInfo)
      );

      console.log(
        "🔄 loadPatientInfo: Setting processData.patient to:",
        patientInfo
      );

      setProcessData((prev) => ({
        ...prev,
        patient: patientInfo,
      }));

      // Initialize treatment state for this patient
      const currentState = treatmentStateManager.getCurrentState();
      if (!currentState.patientId || currentState.patientId !== patientId) {
        treatmentStateManager.initializePatient(patientId, patientInfo);
      }

      console.log("✅ loadPatientInfo: Completed successfully");
    } catch (error) {
      console.warn("⚠️ Error loading patient info:", error);

      // Final fallback
      const fallbackPatientInfo = {
        id: patientId,
        name: `Bệnh nhân ${patientId}`,
        gender: "Chưa có",
        age: "Chưa có",
        contact: "Chưa có",
        email: "Chưa có",
        address: "Chưa có",
        status: "active",
      };

      setProcessData((prev) => ({
        ...prev,
        patient: fallbackPatientInfo,
      }));

      const currentState = treatmentStateManager.getCurrentState();
      if (!currentState.patientId || currentState.patientId !== patientId) {
        treatmentStateManager.initializePatient(patientId, fallbackPatientInfo);
      }
    } finally {
      setLoading(false);
    }
  };

  // Load patient info and sync with treatment state on mount
  useEffect(() => {
    // Chỉ load khi có patientId hợp lệ
    if (!patientId) {
      setLoading(false);
      return;
    }

    console.log(
      "🔄 TreatmentProcess: Loading patient info for patientId:",
      patientId
    );

    const initializeData = async () => {
      // Nếu có patientInfo được truyền từ dashboard, sử dụng luôn
      if (patientInfo) {
        console.log("✅ Using patient info from dashboard:", patientInfo);
        setProcessData((prev) => ({
          ...prev,
          patient: patientInfo,
        }));

        // Initialize treatment state for this patient
        const currentState = treatmentStateManager.getCurrentState();
        if (!currentState.patientId || currentState.patientId !== patientId) {
          treatmentStateManager.initializePatient(patientId, patientInfo);
        }

        setLoading(false);
      } else {
        // Nếu không có, load từ API hoặc localStorage
        await loadPatientInfo();
      }

      syncWithStateManager();
    };

    initializeData();
  }, [patientId, patientInfo]);

  // Cải thiện sync với state manager - thêm auto progress
  const syncWithStateManager = () => {
    // Chỉ sync khi có patientId
    if (!patientId) {
      return;
    }

    const state = treatmentStateManager.getCurrentState(patientId);
    if (state.patientId === patientId) {
      console.log("🔄 Syncing TreatmentProcess with state manager:", state);

      // Update process data
      setProcessData((prev) => ({
        ...prev,
        examination: state.data.examination,
        treatmentPlan: state.data.treatmentPlan,
        schedule: state.data.schedule,
        progress: state.data.progress,
      }));

      // Auto advance to next step if enabled and current step is completed
      if (
        autoProgress &&
        state.completedSteps.includes(currentStep) &&
        currentStep < state.currentStep
      ) {
        console.log(
          `🚀 Auto advancing from step ${currentStep} to ${state.currentStep}`
        );
        setCurrentStep(state.currentStep);

        // Trigger progress animation
        setProgressAnimation(true);
        setTimeout(() => setProgressAnimation(false), 2000);
      } else {
        // Update current step normally
        setCurrentStep(state.currentStep);
      }

      // Show sync message if we have completed data
      if (state.completedSteps.length > 0) {
        console.log(`✅ Synced ${state.completedSteps.length} completed steps`);
      }
    }
  };

  // Thêm useEffect để theo dõi thay đổi trong localStorage và cập nhật real-time
  useEffect(() => {
    // Chỉ check localStorage khi có patientId
    if (!patientId) {
      return;
    }

    const checkLocalStorageUpdates = () => {
      // Kiểm tra examination data
      const examinationKey = `examination_completed_${patientId}`;
      const examinationData = localStorage.getItem(examinationKey);

      if (examinationData) {
        try {
          const parsedData = JSON.parse(examinationData);
          if (parsedData && !isDataEmpty(parsedData)) {
            console.log(
              "🔄 [TreatmentProcess] Found examination data in localStorage:",
              parsedData
            );

            // Cập nhật process data
            setProcessData((prev) => ({
              ...prev,
              examination: parsedData,
            }));

            // Cập nhật state manager nếu chưa có
            const currentState = treatmentStateManager.getCurrentState();
            if (!currentState.completedSteps.includes(0)) {
              treatmentStateManager.updateExamination(patientId, parsedData);
              console.log(
                "✅ [TreatmentProcess] Updated state manager with examination data"
              );
            }

            // Auto advance nếu đang ở step 0
            if (autoProgress && currentStep === 0) {
              console.log(
                "🚀 Auto advancing to treatment plan after localStorage sync"
              );
              setCurrentStep(1);
              setProgressAnimation(true);
              setTimeout(() => setProgressAnimation(false), 2000);
            }
          }
        } catch (error) {
          console.error(
            "❌ [TreatmentProcess] Error parsing examination data:",
            error
          );
        }
      }

      // Kiểm tra treatment plan data
      const treatmentPlanKey = `treatment_plan_completed_${patientId}`;
      const treatmentPlanData = localStorage.getItem(treatmentPlanKey);

      if (treatmentPlanData) {
        try {
          const parsedData = JSON.parse(treatmentPlanData);
          if (parsedData) {
            console.log(
              "🔄 [TreatmentProcess] Found treatment plan data in localStorage:",
              parsedData
            );

            setProcessData((prev) => ({
              ...prev,
              treatmentPlan: parsedData,
            }));

            const currentState = treatmentStateManager.getCurrentState();
            if (!currentState.completedSteps.includes(1)) {
              treatmentStateManager.updateTreatmentPlan(patientId, parsedData);
              console.log(
                "✅ [TreatmentProcess] Updated state manager with treatment plan data"
              );
            }

            if (autoProgress && currentStep === 1) {
              console.log(
                "🚀 Auto advancing to schedule after localStorage sync"
              );
              setCurrentStep(2);
              setProgressAnimation(true);
              setTimeout(() => setProgressAnimation(false), 2000);
            }
          }
        } catch (error) {
          console.error(
            "❌ [TreatmentProcess] Error parsing treatment plan data:",
            error
          );
        }
      }

      // Kiểm tra schedule data
      const scheduleKey = `schedule_completed_${patientId}`;
      const scheduleData = localStorage.getItem(scheduleKey);

      if (scheduleData) {
        try {
          const parsedData = JSON.parse(scheduleData);
          if (parsedData) {
            console.log(
              "🔄 [TreatmentProcess] Found schedule data in localStorage:",
              parsedData
            );

            setProcessData((prev) => ({
              ...prev,
              schedule: parsedData,
            }));

            const currentState = treatmentStateManager.getCurrentState();
            if (!currentState.completedSteps.includes(2)) {
              treatmentStateManager.updateSchedule(patientId, parsedData);
              console.log(
                "✅ [TreatmentProcess] Updated state manager with schedule data"
              );
            }

            if (autoProgress && currentStep === 2) {
              console.log(
                "🚀 Auto advancing to progress tracking after localStorage sync"
              );
              setCurrentStep(3);
              setProgressAnimation(true);
              setTimeout(() => setProgressAnimation(false), 2000);
            }
          }
        } catch (error) {
          console.error(
            "❌ [TreatmentProcess] Error parsing schedule data:",
            error
          );
        }
      }
    };

    // Kiểm tra ngay khi component mount
    checkLocalStorageUpdates();

    // Thiết lập interval để kiểm tra định kỳ (mỗi 2 giây)
    const intervalId = setInterval(checkLocalStorageUpdates, 2000);

    // Cleanup interval khi component unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [patientId, currentStep, autoProgress]);

  // Helper function để kiểm tra dữ liệu rỗng
  const isDataEmpty = (data) => {
    if (!data) return true;

    const hasRealData =
      data.diagnosis ||
      data.clinicalSigns?.bloodPressure ||
      data.clinicalSigns?.temperature ||
      data.clinicalSigns?.heartRate ||
      data.clinicalSigns?.weight ||
      data.clinicalSigns?.height ||
      data.labResults?.ultrasound ||
      data.notes ||
      (data.symptoms && data.symptoms.length > 0) ||
      (data.labResults?.bloodTest &&
        Object.values(data.labResults.bloodTest).some(
          (val) => val !== null && val !== ""
        )) ||
      data.template ||
      data.finalPlan ||
      data.phases ||
      data.sessions ||
      data.startDate;

    return !hasRealData;
  };

  // Cải thiện event listeners - thêm real-time progress updates
  useEffect(() => {
    // Chỉ check khi có patientId
    if (!patientId) {
      return;
    }

    const checkExaminationSync = () => {
      const completedExam = localStorage.getItem(
        `examination_completed_${patientId}`
      );
      if (completedExam) {
        try {
          const examData = JSON.parse(completedExam);
          if (examData.fromStandalonePage) {
            console.log(
              "🔄 Syncing examination data from standalone page:",
              examData
            );

            // Update process data with examination results
            setProcessData((prev) => ({
              ...prev,
              examination: examData,
            }));

            // Auto advance to next step if examination is completed
            if (autoProgress && currentStep === 0) {
              console.log(
                "🚀 Auto advancing to treatment plan after examination completion"
              );
              setCurrentStep(1);
              setProgressAnimation(true);
              setTimeout(() => setProgressAnimation(false), 2000);
            }
          }
        } catch (error) {
          console.error("Error parsing examination data:", error);
        }
      }
    };

    // Check on mount
    checkExaminationSync();

    // Enhanced examination completion handler
    const handleExaminationCompleted = (event) => {
      const { patientId: eventPatientId, examinationData } = event.detail;
      console.log("🎯 TreatmentProcess received examinationCompleted event:", {
        eventPatientId,
        currentPatientId: patientId,
        examinationData,
      });

      if (eventPatientId === patientId) {
        console.log(
          "🔄 Real-time sync: Examination completed",
          examinationData
        );

        setProcessData((prev) => ({
          ...prev,
          examination: examinationData,
        }));

        // Save to localStorage for persistence
        try {
          const localStorageKey = `examination_completed_${patientId}`;
          localStorage.setItem(
            localStorageKey,
            JSON.stringify(examinationData)
          );
          console.log(
            "💾 [TreatmentProcess] Examination data saved to localStorage:",
            localStorageKey
          );

          // Also save to additional keys for better recovery
          localStorage.setItem(
            `examination_data_${patientId}`,
            JSON.stringify(examinationData)
          );
          localStorage.setItem(
            `treatment_examination_${patientId}`,
            JSON.stringify(examinationData)
          );
        } catch (error) {
          console.warn(
            "⚠️ [TreatmentProcess] Failed to save examination data to localStorage:",
            error
          );
        }

        // Auto advance to next step
        if (autoProgress && currentStep === 0) {
          console.log("🚀 Auto advancing to treatment plan");
          setCurrentStep(1);
          setProgressAnimation(true);
          setTimeout(() => setProgressAnimation(false), 2000);
        }
      } else {
        console.log("❌ Patient ID mismatch:", eventPatientId, "!=", patientId);
      }
    };

    // Enhanced treatment plan completion handler
    const handleTreatmentPlanCompleted = (event) => {
      const { patientId: eventPatientId, data } = event.detail;
      if (eventPatientId === patientId) {
        console.log("🔄 Real-time sync: Treatment plan completed", data);

        setProcessData((prev) => ({
          ...prev,
          treatmentPlan: data,
        }));

        // Auto advance to schedule step
        if (autoProgress && currentStep === 1) {
          console.log("🚀 Auto advancing to schedule");
          setCurrentStep(2);
          setProgressAnimation(true);
          setTimeout(() => setProgressAnimation(false), 2000);
        }
      }
    };

    // Enhanced schedule completion handler
    const handleScheduleCompleted = (event) => {
      const { patientId: eventPatientId, data } = event.detail;
      if (eventPatientId === patientId) {
        console.log("🔄 Real-time sync: Schedule completed", data);

        setProcessData((prev) => ({
          ...prev,
          schedule: data,
        }));

        // Auto advance to progress tracking step
        if (autoProgress && currentStep === 2) {
          console.log("🚀 Auto advancing to progress tracking");
          setCurrentStep(3);
          setProgressAnimation(true);
          setTimeout(() => setProgressAnimation(false), 2000);
        }
      }
    };

    // Generic step completion handler
    const handleStepCompleted = (event) => {
      const {
        patientId: eventPatientId,
        stepIndex,
        stepName,
        data,
        autoAdvance,
      } = event.detail;

      console.log("🎯 TreatmentProcess received stepCompleted event:", {
        eventPatientId,
        currentPatientId: patientId,
        stepIndex,
        stepName,
        autoAdvance,
        data,
      });

      if (eventPatientId === patientId) {
        console.log(`🔄 Step completed: ${stepName} (${stepIndex})`, data);

        // Update process data based on step
        setProcessData((prev) => {
          const updates = {};
          switch (stepIndex) {
            case 0: // Examination
              updates.examination = data;
              break;
            case 1: // Treatment Plan
              updates.treatmentPlan = data;
              break;
            case 2: // Schedule
              updates.schedule = data;
              break;
            default:
              break;
          }
          return { ...prev, ...updates };
        });

        // Auto advance if enabled and this is the current step
        if (autoAdvance && autoProgress && currentStep === stepIndex) {
          const nextStep = stepIndex + 1;
          console.log(
            `🚀 Auto advancing from step ${stepIndex} to ${nextStep}`
          );
          setCurrentStep(nextStep);
          setProgressAnimation(true);
          setTimeout(() => setProgressAnimation(false), 2000);
        }
      } else {
        console.log(
          "❌ Patient ID mismatch in stepCompleted:",
          eventPatientId,
          "!=",
          patientId
        );
      }
    };

    // Listen for examination completion events
    const handleExaminationPrinted = (event) => {
      const { patientId: eventPatientId, examinationData } = event.detail;
      if (eventPatientId === patientId) {
        // console.log("📄 Examination printed, syncing data", examinationData);

        setProcessData((prev) => ({
          ...prev,
          examination: examinationData,
        }));

        // Don't auto advance - let user control navigation
        // message.success(
        //   "📄 Đã in kết quả khám! Có thể chuyển sang lập phác đồ."
        // );
      }
    };

    // Listen for real-time state updates
    const handleStateUpdate = (event) => {
      const { patientId: eventPatientId, state } = event.detail;
      if (eventPatientId === patientId) {
        console.log("🔔 Received state update:", event.type, state);
        syncWithStateManager();
      }
    };

    // Add event listeners
    window.addEventListener("examinationCompleted", handleExaminationCompleted);
    window.addEventListener("examinationPrinted", handleExaminationPrinted);
    window.addEventListener(
      "treatmentPlanCompleted",
      handleTreatmentPlanCompleted
    );
    window.addEventListener("scheduleCompleted", handleScheduleCompleted);
    window.addEventListener("stepCompleted", handleStepCompleted);

    // Add state manager event listeners for real-time sync
    treatmentStateManager.addEventListener(
      "examination:completed",
      handleStateUpdate
    );
    treatmentStateManager.addEventListener(
      "treatmentplan:completed",
      handleStateUpdate
    );
    treatmentStateManager.addEventListener(
      "schedule:completed",
      handleStateUpdate
    );
    treatmentStateManager.addEventListener("step:changed", handleStateUpdate);

    // Cleanup
    return () => {
      window.removeEventListener(
        "examinationCompleted",
        handleExaminationCompleted
      );
      window.removeEventListener(
        "examinationPrinted",
        handleExaminationPrinted
      );
      window.removeEventListener(
        "treatmentPlanCompleted",
        handleTreatmentPlanCompleted
      );
      window.removeEventListener("scheduleCompleted", handleScheduleCompleted);
      window.removeEventListener("stepCompleted", handleStepCompleted);

      // Remove state manager listeners
      treatmentStateManager.removeEventListener(
        "examination:completed",
        handleStateUpdate
      );
      treatmentStateManager.removeEventListener(
        "treatmentplan:completed",
        handleStateUpdate
      );
      treatmentStateManager.removeEventListener(
        "schedule:completed",
        handleStateUpdate
      );
      treatmentStateManager.removeEventListener(
        "step:changed",
        handleStateUpdate
      );
    };
  }, [currentStep, patientId, autoProgress]);

  // Load treatment progress data from API
  const loadTreatmentProgress = async () => {
    try {
      const progressData = await apiDoctor.getTreatmentProgress(patientId);
      if (progressData && progressData.data) {
        setProcessData((prev) => ({
          ...prev,
          progress: progressData.data,
        }));
      }
    } catch (error) {
      console.warn("⚠️ Could not load treatment progress from API:", error);
      // Fallback to empty progress data
      setProcessData((prev) => ({
        ...prev,
        progress: {
          totalSessions: 0,
          completedSessions: 0,
          upcomingSessions: 0,
          currentPhase: "Chưa bắt đầu",
          phaseProgress: 0,
          overallProgress: 0,
          lastUpdated: new Date().toLocaleDateString("vi-VN"),
          recentActivities: [],
        },
      }));
    }
  };

  // Load treatment plan from API and sync with state manager
  const loadTreatmentPlanFromAPI = async () => {
    try {
      console.log(
        "🔍 [TreatmentProcess] Loading treatment plan from API for patient:",
        patientId
      );

      // 🔄 Try to refresh token before making request
      refreshTokenFromContext();

      // Import API module
      const { default: apiTreatmentManagement } = await import(
        "../../../api/apiTreatmentManagement"
      );

      const response = await apiTreatmentManagement.getActiveTreatmentPlan(
        patientId
      );

      if (response.success && response.data) {
        console.log(
          "✅ [TreatmentProcess] Found active treatment plan:",
          response.data
        );

        // Transform API data to frontend format
        const frontendPlan = {
          id: response.data.planId,
          patientId: response.data.patientId,
          treatmentType: response.data.treatmentType,
          planName: response.data.planName,
          status: response.data.status,
          startDate: response.data.startDate,
          endDate: response.data.endDate,
          notes: response.data.notes,
          // Add other fields as needed
        };

        // Update process data
        setProcessData((prev) => ({
          ...prev,
          treatmentPlan: frontendPlan,
        }));

        // Update state manager if not already completed
        const currentState = treatmentStateManager.getCurrentState(patientId);
        if (!currentState.completedSteps.includes(1)) {
          treatmentStateManager.updateTreatmentPlan(patientId, frontendPlan);
          console.log(
            "✅ [TreatmentProcess] Updated state manager with API treatment plan"
          );

          // Auto advance if currently on step 1
          if (autoProgress && currentStep === 1) {
            console.log(
              "🚀 Auto advancing to schedule after API treatment plan sync"
            );
            setCurrentStep(2);
            setProgressAnimation(true);
            setTimeout(() => setProgressAnimation(false), 2000);
          }
        }
      } else {
        console.log(
          "ℹ️ [TreatmentProcess] No active treatment plan found in API"
        );
      }
    } catch (error) {
      console.warn(
        "⚠️ [TreatmentProcess] Could not load treatment plan from API:",
        error
      );
    }
  };

  // Clear old test data and mock data from localStorage
  useEffect(() => {
    // Clear any old test data and mock data
    const keysToRemove = [
      `patient_info_${patientId}`,
      `examination_completed_${patientId}`,
      `examination_draft_${patientId}`,
    ];

    keysToRemove.forEach((key) => {
      const storedData = localStorage.getItem(key);
      if (storedData) {
        try {
          const parsed = JSON.parse(storedData);
          // Remove if it contains test data or mock data
          if (
            parsed.name &&
            (parsed.name.includes("Test") ||
              parsed.name.includes("Trần Thị B") ||
              parsed.name.includes("Nguyễn Văn A") ||
              parsed.name.includes("Doctor Son") ||
              parsed.name.includes("BS.") ||
              parsed.name.includes("Dr."))
          ) {
            localStorage.removeItem(key);
            console.log(`🧹 Removed test/mock data from localStorage: ${key}`);
          }
        } catch (e) {
          // If parsing fails, remove anyway
          localStorage.removeItem(key);
        }
      }
    });

    // Also clear any mock user data
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const userData = JSON.parse(user);
        if (userData.fullName && (
          userData.fullName.includes("Doctor Son") ||
          userData.fullName.includes("BS.") ||
          userData.fullName.includes("Dr.") ||
          userData.token?.includes("mock")
        )) {
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          console.log("🧹 Removed mock user data from localStorage");
        }
      } catch (e) {
        console.warn("⚠️ Error parsing user data:", e);
      }
    }
  }, [patientId]);

  // Debug authentication status
  const debugAuthStatus = () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    let userData = null;

    try {
      userData = user ? JSON.parse(user) : null;
    } catch (e) {
      console.error("❌ Error parsing user data:", e);
    }

    console.log("🔍 [TreatmentProcess] Authentication Debug:");
    console.log("  - Token exists:", !!token);
    console.log("  - User exists:", !!user);
    console.log("  - User data:", userData);
    console.log("  - Current user context:", user);

    return { token, user, userData };
  };

  // Load examination data from API
  const loadExaminationData = async () => {
    try {
      console.log(
        "🔍 [TreatmentProcess] Loading examination data for patient:",
        patientId
      );

      // 🔄 Try to refresh token before making request
      refreshTokenFromContext();

      // Debug authentication status
      debugAuthStatus();
      console.log("🔍 [TreatmentProcess] Current user:", user);

      // Priority 1: Try to load from API
      try {
              const examinationData = await clinicalResultsAPI.getClinicalResultsByPatient(
        patientId
      );
        console.log(
          "🔍 [TreatmentProcess] Examination data received from API:",
          examinationData
        );
        console.log(
          "🔍 [TreatmentProcess] Examination data length:",
          examinationData?.length
        );

        if (examinationData && examinationData.length > 0) {
          const latestExam = examinationData[examinationData.length - 1];
          console.log(
            "🔍 [TreatmentProcess] Latest examination from API:",
            latestExam
          );
          setProcessData((prev) => ({
            ...prev,
            examination: {
              ...latestExam,
              fromStandalonePage: false, // Mark as from API
            },
          }));
          console.log(
            "✅ [TreatmentProcess] Examination data loaded successfully from API"
          );
          return; // Exit early if API data is available
        }
      } catch (apiError) {
        console.warn("⚠️ Could not load examination data from API:", apiError);
      }

      // Priority 2: Load from localStorage if API failed or no data
      console.log("🔄 [TreatmentProcess] Trying to load from localStorage...");
      const localStorageKeys = [
        `examination_completed_${patientId}`,
        `examination_data_${patientId}`,
        `treatment_examination_${patientId}`,
        `examination_${patientId}`,
      ];

      let foundData = null;
      for (const key of localStorageKeys) {
        const savedData = localStorage.getItem(key);
        if (savedData) {
          try {
            const parsedData = JSON.parse(savedData);
            console.log(
              `🔍 [TreatmentProcess] Found data in ${key}:`,
              parsedData
            );

            // Check if this is valid examination data
            if (
              parsedData &&
              (parsedData.symptoms ||
                parsedData.clinicalSigns ||
                parsedData.labResults)
            ) {
              foundData = parsedData;
              console.log(
                `✅ [TreatmentProcess] Valid examination data found in ${key}`
              );
              break;
            }
          } catch (error) {
            console.warn(`⚠️ [TreatmentProcess] Error parsing ${key}:`, error);
          }
        }
      }

      if (foundData) {
        console.log(
          "🔍 [TreatmentProcess] Loading examination data from localStorage:",
          foundData
        );
        setProcessData((prev) => ({
          ...prev,
          examination: {
            ...foundData,
            fromStandalonePage: true, // Mark as from localStorage
          },
        }));
        console.log(
          "✅ [TreatmentProcess] Examination data loaded from localStorage"
        );
      } else {
        console.warn(
          "⚠️ [TreatmentProcess] No examination data found in API or localStorage"
        );
      }
    } catch (error) {
      console.error(
        "❌ [TreatmentProcess] Error in loadExaminationData:",
        error
      );
    }
  };

  useEffect(() => {
    // Chỉ load data khi có patientId
    if (!patientId) {
      return;
    }
    
    loadTreatmentProgress();
    loadExaminationData();
    loadTreatmentPlanFromAPI(); // Also load treatment plan from API
  }, [patientId]);

  // Thêm useEffect để force refresh state manager định kỳ
  useEffect(() => {
    // Chỉ force refresh khi có patientId
    if (!patientId) {
      return;
    }

    const forceRefreshState = () => {
      console.log("🔄 [TreatmentProcess] Force refreshing state manager...");
      treatmentStateManager.forceRefresh(patientId);
      syncWithStateManager();
    };

    // Force refresh ngay khi component mount
    forceRefreshState();

    // Thiết lập interval để force refresh mỗi 5 giây
    const refreshInterval = setInterval(forceRefreshState, 5000);

    return () => {
      clearInterval(refreshInterval);
    };
  }, [patientId]);

  // Auto-save examination data to localStorage when it changes
  useEffect(() => {
    // Chỉ auto-save khi có patientId
    if (!patientId) {
      return;
    }

    if (processData.examination && processData.examination.fromStandalonePage) {
      try {
        const localStorageKey = `examination_completed_${patientId}`;
        localStorage.setItem(
          localStorageKey,
          JSON.stringify(processData.examination)
        );
        console.log(
          "💾 [TreatmentProcess] Auto-saved examination data to localStorage:",
          localStorageKey
        );
      } catch (error) {
        console.warn(
          "⚠️ [TreatmentProcess] Failed to auto-save examination data:",
          error
        );
      }
    }
  }, [processData.examination, patientId]);

  const steps = [
    {
      title: "Khám tổng quát",
      description: "Nhập kết quả khám và xét nghiệm",
      icon: <FileTextOutlined />,
      component: ExaminationForm,
      color: "#ff6b9d",
    },
    {
      title: "Lập phác đồ",
      description: "Chọn và cá nhân hóa phác đồ điều trị",
      icon: <MedicineBoxOutlined />,
      component: TreatmentPlanEditor,
      color: "#ff758c",
    },
    {
      title: "Lập lịch điều trị",
      description: "Tạo lịch trình các buổi điều trị",
      icon: <CalendarOutlined />,
      component: TreatmentScheduleForm,
      color: "#ff7eb3",
    },
    {
      title: "Theo dõi tiến trình",
      description: "Cập nhật và theo dõi các buổi điều trị",
      icon: <PlayCircleOutlined />,
      component: TreatmentProgressTracker,
      color: "#ff9cbd",
    },
    {
      title: "Hoàn thành dịch vụ",
      description: "Tổng kết và hoàn tất quy trình",
      icon: <CheckCircleOutlined />,
      component: PatientScheduleView,
      color: "#ffb3cd",
    },
  ];

  if (!processData.patient) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <SyncOutlined spin style={{ fontSize: "24px", color: "#ff6b9d" }} />
          <div className="loading-text">
            <Text>Đang tải thông tin bệnh nhân...</Text>
          </div>
        </div>
      </div>
    );
  }

  // Thêm function để manually advance step
  const handleManualStepAdvance = (targetStep) => {
    console.log(`🎯 Manually advancing to step ${targetStep}`);
    setCurrentStep(targetStep);
    treatmentStateManager.updateCurrentStep(patientId, targetStep);
    setProgressAnimation(true);
    setTimeout(() => setProgressAnimation(false), 2000);
  };

  // Function để xóa phác đồ điều trị
  const handleDeleteTreatmentPlan = async () => {
    console.log("🎯 [DEBUG] handleDeleteTreatmentPlan called!");
    try {
      console.log("🎯 [DEBUG] Showing confirmation dialog...");

      // Hiển thị confirm dialog bằng message.confirm
      const confirmed = window.confirm(
        "Bạn có chắc chắn muốn xóa phác đồ điều trị hiện tại?\n\nHành động này không thể hoàn tác!"
      );

      if (confirmed) {
        console.log("🎯 [DEBUG] User confirmed deletion");
        try {
          // Xóa từ backend nếu có planId
          const currentState = treatmentStateManager.getCurrentState(patientId);
          console.log("🎯 [DEBUG] Current state:", currentState);
          console.log(
            "🎯 [DEBUG] Treatment plan in state:",
            currentState.data.treatmentPlan
          );

          if (currentState.data.treatmentPlan?.planId) {
            console.log(
              "🎯 [DEBUG] Deleting from backend with planId:",
              currentState.data.treatmentPlan.planId
            );
            const result = await treatmentPlanAPI.deleteTreatmentPlan(
              currentState.data.treatmentPlan.planId
            );
            if (!result.success) {
              throw new Error(
                result.message || "Lỗi khi xóa phác đồ từ server"
              );
            }
            console.log("🎯 [DEBUG] Backend deletion successful");
          } else {
            console.log(
              "🎯 [DEBUG] No planId found, skipping backend deletion"
            );
          }

          // Xóa từ state manager và localStorage
          console.log("🎯 [DEBUG] Deleting from state manager...");
          treatmentStateManager.deleteTreatmentPlan(patientId);

          // Cập nhật UI
          setProcessData((prev) => ({
            ...prev,
            treatmentPlan: null,
          }));

          // Reset về step 1
          setCurrentStep(1);

          message.success("Đã xóa phác đồ điều trị thành công");
          console.log("✅ Treatment plan deleted successfully");
        } catch (error) {
          console.error("❌ Error deleting treatment plan:", error);
          message.error(
            error.message || "Có lỗi xảy ra khi xóa phác đồ điều trị"
          );
        }
      } else {
        console.log("🎯 [DEBUG] User cancelled deletion");
      }
    } catch (error) {
      console.error("❌ Error in delete confirmation:", error);
    }
  };

  // Kiểm tra xem có patientId hợp lệ không
  if (!patientId) {
    return (
      <div className="treatment-process-container">
        <div className="treatment-process-content">
          <Card className="examination-main-card">
            <div className="examination-header">
              <Title level={2} className="examination-title">
                <Space>
                  <HeartOutlined className="title-icon" />
                  Quy Trình Điều Trị
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
                🩺
              </div>
              <Title level={3} style={{ color: '#666', marginBottom: '16px' }}>
                Không có quy trình điều trị
              </Title>
              <Text style={{ fontSize: '16px', color: '#888', display: 'block', marginBottom: '24px' }}>
                Vui lòng chọn bệnh nhân để bắt đầu quy trình điều trị
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
      </div>
    );
  }

  return (
    <div className="treatment-process-container">
      <div className="treatment-process-content">
        <Card className="main-card">
          <div className="header-section">
            <Title level={2} className="main-title">
              <Space>
                <HeartOutlined className="title-icon" />
                Quy Trình Điều Trị
              </Space>
            </Title>

            {/* Auto Progress Toggle - Moved to bottom */}
          </div>

          {/* Thông tin bệnh nhân chi tiết */}
          <Card className="patient-info-section" variant="borderless">
            <div className="patient-info-header">
              <div className="patient-avatar-section">
                <div className="patient-avatar">
                  {processData.patient?.name?.charAt(0)?.toUpperCase() || "P"}
                </div>
                <div className="patient-status">
                  <Badge
                    status="processing"
                    text={`Bước ${currentStep + 1}/5`}
                  />
                </div>
              </div>
              <div className="patient-main-info">
                <Title level={3} className="patient-name">
                  {processData.patient?.name || "Chưa có thông tin"}
                </Title>
                <div className="patient-id">
                  <Text type="secondary">
                    <UserOutlined /> ID: {patientId || "N/A"}
                  </Text>
                </div>
              </div>
            </div>

            <Divider style={{ margin: "16px 0" }} />

            <Row gutter={[24, 16]} className="patient-details-grid">
              <Col xs={24} sm={12} md={6}>
                <div className="detail-card">
                  <div className="detail-icon">
                    <UserOutlined />
                  </div>
                  <div className="detail-content">
                    <div className="detail-label">Giới tính</div>
                    <div className="detail-value">
                      {processData.patient?.gender === "male" ? (
                        <Tag color="blue" icon={<UserOutlined />}>
                          Nam
                        </Tag>
                      ) : processData.patient?.gender === "female" ? (
                        <Tag color="pink" icon={<UserOutlined />}>
                          Nữ
                        </Tag>
                      ) : (
                        <Text type="secondary">Chưa có</Text>
                      )}
                    </div>
                  </div>
                </div>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <div className="detail-card">
                  <div className="detail-icon">
                    <CalendarOutlined />
                  </div>
                  <div className="detail-content">
                    <div className="detail-label">Tuổi</div>
                    <div className="detail-value">
                      {processData.patient?.age ? (
                        <Text strong>{processData.patient.age} tuổi</Text>
                      ) : (
                        <Text type="secondary">Chưa có</Text>
                      )}
                    </div>
                  </div>
                </div>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <div className="detail-card">
                  <div className="detail-icon">
                    <PhoneOutlined />
                  </div>
                  <div className="detail-content">
                    <div className="detail-label">Liên hệ</div>
                    <div className="detail-value">
                      {processData.patient?.contact ? (
                        <Text copyable>{processData.patient.contact}</Text>
                      ) : (
                        <Text type="secondary">Chưa có</Text>
                      )}
                    </div>
                  </div>
                </div>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <div className="detail-card">
                  <div className="detail-icon">
                    <MailOutlined />
                  </div>
                  <div className="detail-content">
                    <div className="detail-label">Email</div>
                    <div className="detail-value">
                      {processData.patient?.email ? (
                        <Text copyable>{processData.patient.email}</Text>
                      ) : (
                        <Text type="secondary">Chưa có</Text>
                      )}
                    </div>
                  </div>
                </div>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <div className="detail-card">
                  <div className="detail-icon">
                    <EnvironmentOutlined />
                  </div>
                  <div className="detail-content">
                    <div className="detail-label">Địa chỉ</div>
                    <div className="detail-value">
                      {processData.patient?.address ? (
                        <Text>{processData.patient.address}</Text>
                      ) : (
                        <Text type="secondary">Chưa có</Text>
                      )}
                    </div>
                  </div>
                </div>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <div className="detail-card">
                  <div className="detail-icon">
                    <HeartOutlined />
                  </div>
                  <div className="detail-content">
                    <div className="detail-label">Tình trạng</div>
                    <div className="detail-value">
                      <Tag color="green" icon={<CheckCircleOutlined />}>
                        Khỏe mạnh
                      </Tag>
                    </div>
                  </div>
                </div>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <div className="detail-card">
                  <div className="detail-icon">
                    <ClockCircleOutlined />
                  </div>
                  <div className="detail-content">
                    <div className="detail-label">Lần khám</div>
                    <div className="detail-value">
                      <Text strong>Lần đầu</Text>
                    </div>
                  </div>
                </div>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <div className="detail-card">
                  <div className="detail-icon">
                    <CalendarOutlined />
                  </div>
                  <div className="detail-content">
                    <div className="detail-label">Ngày khám</div>
                    <div className="detail-value">
                      <Text>{new Date().toLocaleDateString("vi-VN")}</Text>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>

          {/* Enhanced Alert when examination data synced */}
          {processData.examination?.fromStandalonePage && (
            <Alert
              message="🔄 Đã đồng bộ kết quả khám lâm sàng"
              description={`Kết quả khám từ trang riêng đã được cập nhật thành công. Chẩn đoán: "${
                processData.examination.diagnosis
              }". ${
                autoProgress
                  ? "Tự động chuyển sang bước lập phác đồ..."
                  : "Bạn có thể tiếp tục với bước lập phác đồ."
              }`}
              type="success"
              showIcon
              closable
              className="sync-alert"
              action={
                <Space>
                  <Button
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => {
                      Modal.info({
                        title: "Chi tiết kết quả khám",
                        content: (
                          <div>
                            <p>
                              <strong>Chẩn đoán:</strong>{" "}
                              {processData.examination.diagnosis}
                            </p>
                            <p>
                              <strong>Khuyến nghị:</strong>{" "}
                              {processData.examination.recommendations}
                            </p>
                            <p>
                              <strong>Thời gian hoàn thành:</strong>{" "}
                              {new Date(
                                processData.examination.completedAt
                              ).toLocaleString("vi-VN")}
                            </p>
                            {processData.examination.symptoms?.length > 0 && (
                              <p>
                                <strong>Triệu chứng:</strong>{" "}
                                {processData.examination.symptoms.join(", ")}
                              </p>
                            )}
                          </div>
                        ),
                        width: 600,
                      });
                    }}
                  >
                    Xem chi tiết
                  </Button>

                  {currentStep === 0 && (
                    <Button
                      type="primary"
                      size="small"
                      icon={<ArrowRightOutlined />}
                      onClick={() => handleManualStepAdvance(1)}
                    >
                      Chuyển sang lập phác đồ
                    </Button>
                  )}
                  {currentStep === 1 && processData.treatmentPlan && (
                    <Button
                      type="primary"
                      size="small"
                      icon={<ArrowRightOutlined />}
                      onClick={() => handleManualStepAdvance(2)}
                    >
                      Chuyển sang lập lịch điều trị
                    </Button>
                  )}
                </Space>
              }
            />
          )}

          {/* Enhanced Steps with animation */}
          <div
            className={`steps-section ${
              progressAnimation ? "progress-animation" : ""
            }`}
          >
            <Steps current={currentStep} className="treatment-steps">
              {steps.map((step, index) => {
                const stepData = treatmentStateManager.getStepData(
                  index,
                  patientId
                );
                let stepStatus = stepData.status;
                let stepDescription = step.description;

                if (stepData.isCompleted) {
                  stepStatus = "finish";
                  stepDescription = `✅ Đã hoàn thành${
                    stepData.completedAt
                      ? ` - ${new Date(stepData.completedAt).toLocaleString(
                          "vi-VN"
                        )}`
                      : ""
                  }`;
                } else if (index === currentStep) {
                  stepStatus = "process";
                } else if (index < currentStep) {
                  stepStatus = "finish";
                } else {
                  stepStatus = "wait";
                }

                return (
                  <Step
                    key={index}
                    title={step.title}
                    description={stepDescription}
                    icon={step.icon}
                    status={stepStatus}
                    className={`step-${index} ${stepStatus} ${
                      progressAnimation && index === currentStep
                        ? "pulse-animation"
                        : ""
                    }`}
                  />
                );
              })}
            </Steps>
          </div>

          {/* Enhanced Progress summary với real-time updates */}
          <Card
            className={`progress-summary-card ${
              progressAnimation ? "glow-animation" : ""
            }`}
          >
            {(() => {
              // Lấy progress từ state manager và cập nhật real-time
              const progress =
                treatmentStateManager.getOverallProgress(patientId);

              // Tính toán thêm thông tin chi tiết
              const completedSteps = progress.state.completedSteps || [];
              const stepNames = [
                "Khám tổng quát",
                "Lập phác đồ",
                "Lập lịch điều trị",
                "Theo dõi tiến trình",
                "Hoàn thành",
              ];

              return (
                <Row gutter={16} align="middle">
                  <Col span={12}>
                    <div className="progress-info">
                      <Text strong>Tiến độ tổng thể: </Text>
                      <Tag className="progress-tag">
                        {progress.completed}/{progress.total} bước
                      </Tag>
                      <Progress
                        percent={progress.percentage}
                        size="small"
                        strokeColor={{
                          "0%": "#ff7eb3",
                          "100%": "#ff6b9d",
                        }}
                        trailColor="rgba(255, 126, 179, 0.1)"
                        className="overall-progress"
                        status={
                          progress.completed >= progress.total
                            ? "success"
                            : "active"
                        }
                      />
                    </div>
                    {/* Hiển thị các bước đã hoàn thành */}
                    {completedSteps.length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          Đã hoàn thành:{" "}
                          {completedSteps
                            .map((stepIndex) => stepNames[stepIndex])
                            .join(", ")}
                        </Text>
                      </div>
                    )}
                  </Col>
                  <Col span={12} style={{ textAlign: "right" }}>
                    <Text type="secondary" className="last-updated">
                      Cập nhật cuối: {new Date().toLocaleString("vi-VN")}
                    </Text>
                    {autoProgress && (
                      <div style={{ marginTop: 8 }}>
                        <Tag color="green" icon={<CheckCircleOutlined />}>
                          Tự động chuyển bước
                        </Tag>
                      </div>
                    )}
                    {/* Control buttons */}
                    <div
                      style={{
                        marginTop: 8,
                        display: "flex",
                        gap: 8,
                        justifyContent: "flex-end",
                      }}
                    >
                      <Button
                        size="small"
                        icon={<ReloadOutlined />}
                        onClick={() => {
                          console.log("🔄 Manual refresh triggered");
                          syncWithStateManager();
                          loadTreatmentPlanFromAPI(); // Also check API for treatment plan
                          setProgressAnimation(true);
                          setTimeout(() => setProgressAnimation(false), 1000);
                        }}
                      >
                        Cập nhật
                      </Button>

                      {/* Nút xóa phác đồ - chỉ hiển thị khi có treatment plan */}
                      {(() => {
                        console.log(
                          "🎯 [DEBUG] Checking treatment plan in progress state:",
                          progress.state.data.treatmentPlan
                        );
                        console.log(
                          "🎯 [DEBUG] Full progress state:",
                          progress.state
                        );
                        return progress.state.data.treatmentPlan ? (
                          <Button
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={handleDeleteTreatmentPlan}
                            title="Xóa phác đồ điều trị"
                          >
                            Xóa phác đồ
                          </Button>
                        ) : (
                          <Text type="secondary" style={{ fontSize: "12px" }}>
                            (Không có phác đồ để xóa)
                          </Text>
                        );
                      })()}
                    </div>
                  </Col>
                </Row>
              );
            })()}
          </Card>

          {/* Optimized Control Panel - Moved to bottom */}
          <Card className="control-panel-card" style={{ marginTop: 16 }}>
            <Row gutter={16} align="middle" justify="space-between">
              <Col>
                <Space>
                  <Text strong>Cài đặt:</Text>
                  <Button
                    type={autoProgress ? "primary" : "default"}
                    size="small"
                    icon={
                      autoProgress ? (
                        <CheckCircleOutlined />
                      ) : (
                        <ClockCircleOutlined />
                      )
                    }
                    onClick={() => setAutoProgress(!autoProgress)}
                  >
                    Tự động chuyển bước: {autoProgress ? "Bật" : "Tắt"}
                  </Button>
                </Space>
              </Col>

              <Col>
                <Space>
                  <Text strong>Thao tác:</Text>
                  <Button
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => {
                      const result =
                        debugUtils.cleanPatientExaminationData(patientId);
                      console.log("🧹 Clean result:", result);
                      setTimeout(() => loadExaminationData(), 1000);
                    }}
                    title="Dọn dẹp dữ liệu trống"
                  >
                    Dọn dẹp dữ liệu
                  </Button>

                  <Button
                    size="small"
                    icon={<SettingOutlined />}
                    onClick={() => {
                      debugUtils.checkProgressStatus(patientId);
                      debugUtils.fixSyncIssues(patientId);
                      setTimeout(() => {
                        syncWithStateManager();
                        setProgressAnimation(true);
                        setTimeout(() => setProgressAnimation(false), 1000);
                      }, 500);
                    }}
                    title="Kiểm tra và sửa lỗi đồng bộ"
                  >
                    Sửa lỗi đồng bộ
                  </Button>

                  <Button
                    size="small"
                    icon={<SyncOutlined />}
                    onClick={() => {
                      debugAuthStatus();
                      loadExaminationData();
                      loadTreatmentPlanFromAPI();
                      treatmentStateManager.debugState(patientId);
                    }}
                    title="Kiểm tra trạng thái"
                  >
                    Kiểm tra
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </Card>
      </div>
    </div>
  );
};

export default TreatmentProcess;
