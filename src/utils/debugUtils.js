// Debug utilities for treatment process
export const debugUtils = {
  // Kiểm tra trạng thái thanh tiến độ
  checkProgressStatus: (patientId) => {
    console.log(
      "🔍 [debugUtils] Checking progress status for patient:",
      patientId
    );

    // Kiểm tra localStorage
    const keys = Object.keys(localStorage);
    const patientKeys = keys.filter((key) => key.includes(`_${patientId}`));
    console.log("📦 Patient localStorage keys:", patientKeys);

    patientKeys.forEach((key) => {
      try {
        const data = localStorage.getItem(key);
        const parsed = JSON.parse(data);
        console.log(`📦 ${key}:`, parsed);
      } catch (error) {
        console.log(`📦 ${key}: [Parse error]`, data);
      }
    });

    // Kiểm tra state manager
    const { treatmentStateManager } = require("./treatmentStateManager");
    const state = treatmentStateManager.getCurrentState(patientId);
    console.log("🎯 State manager state:", state);

    return {
      localStorageKeys: patientKeys,
      stateManagerState: state,
    };
  },

  // Force update treatment plan completion
  forceCompleteTreatmentPlan: (patientId, planData = null) => {
    console.log(
      "🔧 [debugUtils] Force completing treatment plan for patient:",
      patientId
    );

    const { treatmentStateManager } = require("./treatmentStateManager");

    // Tạo dữ liệu mẫu nếu không có
    const defaultPlanData = planData || {
      id: `plan_${Date.now()}`,
      patientId: patientId,
      treatmentType: "IUI",
      planName: "Phác đồ điều trị mẫu",
      status: "active",
      startDate: new Date().toISOString(),
      notes: "Phác đồ được tạo tự động",
    };

    // Cập nhật state manager
    treatmentStateManager.updateTreatmentPlan(patientId, defaultPlanData);

    // Phát ra sự kiện
    const event = new CustomEvent("treatmentPlanCompleted", {
      detail: {
        patientId: patientId,
        data: defaultPlanData,
        stepIndex: 1,
        stepName: "Lập phác đồ",
        autoAdvance: true,
      },
    });
    window.dispatchEvent(event);

    console.log("✅ [debugUtils] Treatment plan force completed");
    return defaultPlanData;
  },

  // Reset treatment process
  resetTreatmentProcess: (patientId) => {
    console.log(
      "🔄 [debugUtils] Resetting treatment process for patient:",
      patientId
    );

    const { treatmentStateManager } = require("./treatmentStateManager");

    // Xóa state
    treatmentStateManager.clearPatientState(patientId);

    // Xóa localStorage keys
    const keys = Object.keys(localStorage);
    const patientKeys = keys.filter((key) => key.includes(`_${patientId}`));
    patientKeys.forEach((key) => localStorage.removeItem(key));

    console.log("✅ [debugUtils] Treatment process reset");
    return true;
  },

  // Kiểm tra và sửa lỗi đồng bộ
  fixSyncIssues: (patientId) => {
    console.log("🔧 [debugUtils] Fixing sync issues for patient:", patientId);

    const { treatmentStateManager } = require("./treatmentStateManager");

    // Kiểm tra examination data
    const examKey = `examination_completed_${patientId}`;
    const examData = localStorage.getItem(examKey);

    if (examData) {
      try {
        const parsed = JSON.parse(examData);
        if (
          parsed &&
          !treatmentStateManager
            .getCurrentState(patientId)
            .completedSteps.includes(0)
        ) {
          treatmentStateManager.updateExamination(patientId, parsed);
          console.log("✅ [debugUtils] Fixed examination sync");
        }
      } catch (error) {
        console.warn("⚠️ [debugUtils] Error parsing examination data:", error);
      }
    }

    // Kiểm tra treatment plan data
    const planKey = `treatment_plan_completed_${patientId}`;
    const planData = localStorage.getItem(planKey);

    if (planData) {
      try {
        const parsed = JSON.parse(planData);
        if (
          parsed &&
          !treatmentStateManager
            .getCurrentState(patientId)
            .completedSteps.includes(1)
        ) {
          treatmentStateManager.updateTreatmentPlan(patientId, parsed);
          console.log("✅ [debugUtils] Fixed treatment plan sync");
        }
      } catch (error) {
        console.warn(
          "⚠️ [debugUtils] Error parsing treatment plan data:",
          error
        );
      }
    }

    console.log("✅ [debugUtils] Sync issues fixed");
    return true;
  },

  // Tạo dữ liệu test
  createTestData: (patientId) => {
    console.log("🧪 [debugUtils] Creating test data for patient:", patientId);

    // Tạo examination data
    const examData = {
      patientId: patientId,
      diagnosis: "Vô sinh nguyên phát",
      clinicalSigns: {
        bloodPressure: "120/80",
        temperature: "36.5",
        heartRate: "72",
        weight: "55",
        height: "160",
      },
      labResults: {
        bloodTest: {
          FSH: 8.5,
          LH: 6.2,
          E2: 45,
          AMH: 2.1,
        },
        ultrasound: "Tử cung bình thường, buồng trứng có nang trứng",
      },
      notes: "Bệnh nhân khỏe mạnh, có thể tiến hành điều trị",
      fromStandalonePage: true,
      completedAt: new Date().toISOString(),
    };

    // Tạo treatment plan data
    const planData = {
      id: `plan_${Date.now()}`,
      patientId: patientId,
      treatmentType: "IUI",
      planName: "Phác đồ IUI chuẩn",
      status: "active",
      startDate: new Date().toISOString(),
      notes: "Phác đồ điều trị IUI cho bệnh nhân",
      completedAt: new Date().toISOString(),
    };

    // Lưu vào localStorage
    localStorage.setItem(
      `examination_completed_${patientId}`,
      JSON.stringify(examData)
    );
    localStorage.setItem(
      `treatment_plan_completed_${patientId}`,
      JSON.stringify(planData)
    );

    // Cập nhật state manager
    const { treatmentStateManager } = require("./treatmentStateManager");
    treatmentStateManager.updateExamination(patientId, examData);
    treatmentStateManager.updateTreatmentPlan(patientId, planData);

    console.log("✅ [debugUtils] Test data created");
    return { examData, planData };
  },

  // Clean up examination data for a specific patient
  cleanPatientExaminationData: (patientId) => {
    console.log(
      `🧹 [debugUtils] Cleaning examination data for patient: ${patientId}`
    );
    // Get all examination keys for this patient
    const allKeys = Object.keys(localStorage);
    const patientKeys = allKeys.filter(
      (key) => key.includes("examination") && key.includes(patientId)
    );
    console.log(
      `🔍 [debugUtils] Found ${patientKeys.length} examination keys for patient ${patientId}:`,
      patientKeys
    );
    let validData = null;
    let cleanedCount = 0;
    patientKeys.forEach((key) => {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        // Check if this data has real content
        const hasRealData =
          data.diagnosis ||
          data.recommendations ||
          data.clinicalSigns?.bloodPressure ||
          data.clinicalSigns?.temperature ||
          data.clinicalSigns?.heartRate ||
          data.clinicalSigns?.weight ||
          data.clinicalSigns?.height ||
          data.labResults?.ultrasound ||
          data.notes ||
          (data.symptoms && data.symptoms.length > 0);
        if (hasRealData) {
          if (!validData) {
            validData = data;
            console.log(`✅ [debugUtils] Found valid data in ${key}:`, data);
          } else {
            // Remove duplicate valid data
            localStorage.removeItem(key);
            cleanedCount++;
            console.log(
              `🧹 [debugUtils] Removed duplicate valid data from ${key}`
            );
          }
        } else {
          // Remove empty data
          localStorage.removeItem(key);
          cleanedCount++;
          console.log(`🧹 [debugUtils] Removed empty data from ${key}`);
        }
      } catch (error) {
        console.error(`❌ [debugUtils] Error processing ${key}:`, error);
        localStorage.removeItem(key);
        cleanedCount++;
      }
    });
    // If we found valid data, save it to the standard key
    if (validData) {
      const standardKey = `examination_completed_${patientId}`;
      localStorage.setItem(standardKey, JSON.stringify(validData));
      console.log(
        `💾 [debugUtils] Saved valid data to standard key: ${standardKey}`
      );
    }
    console.log(
      `✅ [debugUtils] Cleaned ${cleanedCount} records for patient ${patientId}`
    );
    return { cleanedCount, hasValidData: !!validData };
  },
};

// Thêm vào window để có thể gọi từ console
if (typeof window !== "undefined") {
  window.debugUtils = debugUtils;
}
