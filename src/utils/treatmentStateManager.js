// Đơn giản hóa treatment state management cho đồng bộ dữ liệu

export class TreatmentStateManager {
  constructor() {
    this.EVENT_PREFIX = "treatment:";
  }

  // Tạo storage key riêng cho từng bệnh nhân
  getStorageKey(patientId) {
    return `treatmentProcessData_${patientId}`;
  }

  // Lấy trạng thái hiện tại từ localStorage cho bệnh nhân cụ thể
  getCurrentState(patientId = null) {
    try {
      if (!patientId) {
        // Fallback: tìm patientId từ localStorage
        const keys = Object.keys(localStorage);
        const treatmentKeys = keys.filter((key) =>
          key.startsWith("treatmentProcessData_")
        );
        if (treatmentKeys.length > 0) {
          patientId = treatmentKeys[0].replace("treatmentProcessData_", "");
        }
      }

      if (!patientId) {
        return this.getInitialState();
      }

      const storageKey = this.getStorageKey(patientId);
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : this.getInitialState(patientId);
    } catch (error) {
      console.error("Error loading treatment state:", error);
      return this.getInitialState(patientId);
    }
  }

  // Trạng thái ban đầu
  getInitialState(patientId = null) {
    return {
      patientId,
      currentStep: 0,
      completedSteps: [],
      data: {
        examination: null,
        treatmentPlan: null,
        schedule: null,
        progress: null,
      },
      stepStatus: {
        0: "wait", // examination
        1: "wait", // treatment plan
        2: "wait", // schedule
        3: "wait", // progress
        4: "wait", // completion
      },
      lastUpdated: null,
      metadata: {},
    };
  }

  // Lưu trạng thái vào localStorage cho bệnh nhân cụ thể
  saveState(state) {
    try {
      if (!state.patientId) {
        console.warn("Cannot save state without patientId");
        return;
      }

      const storageKey = this.getStorageKey(state.patientId);
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          ...state,
          lastUpdated: new Date().toISOString(),
        })
      );
      console.log(
        `💾 Treatment state saved for patient ${state.patientId}:`,
        state
      );
    } catch (error) {
      console.error("Error saving treatment state:", error);
    }
  }

  // Khởi tạo trạng thái cho bệnh nhân
  initializePatient(patientId, patientInfo = {}) {
    const state = {
      ...this.getInitialState(patientId),
      patientId,
      metadata: {
        patientInfo,
        startedAt: new Date().toISOString(),
      },
    };

    this.saveState(state);
    this.dispatchEvent("initialized", { patientId, state });
    return state;
  }

  // Cập nhật dữ liệu examination
  updateExamination(patientId, examinationData) {
    const currentState = this.getCurrentState(patientId);

    const newState = {
      ...currentState,
      patientId,
      currentStep: Math.max(currentState.currentStep, 1),
      completedSteps: [...new Set([...currentState.completedSteps, 0])],
      data: {
        ...currentState.data,
        examination: {
          ...examinationData,
          completedAt: new Date().toISOString(),
          stepId: 0,
        },
      },
      stepStatus: {
        ...currentState.stepStatus,
        0: "finish",
      },
    };

    this.saveState(newState);
    this.dispatchEvent("examination:completed", {
      patientId,
      data: examinationData,
      stepId: 0,
      state: newState,
    });

    return newState;
  }

  // Cập nhật dữ liệu treatment plan
  updateTreatmentPlan(patientId, treatmentPlanData) {
    const currentState = this.getCurrentState(patientId);

    const newState = {
      ...currentState,
      patientId,
      currentStep: Math.max(currentState.currentStep, 2),
      completedSteps: [...new Set([...currentState.completedSteps, 1])],
      data: {
        ...currentState.data,
        treatmentPlan: {
          ...treatmentPlanData,
          completedAt: new Date().toISOString(),
          stepId: 1,
        },
      },
      stepStatus: {
        ...currentState.stepStatus,
        1: "finish",
      },
    };

    this.saveState(newState);
    this.dispatchEvent("treatmentplan:completed", {
      patientId,
      data: treatmentPlanData,
      stepId: 1,
      state: newState,
    });

    return newState;
  }

  // Cập nhật dữ liệu schedule
  updateSchedule(patientId, scheduleData) {
    const currentState = this.getCurrentState(patientId);

    const newState = {
      ...currentState,
      patientId,
      currentStep: Math.max(currentState.currentStep, 3),
      completedSteps: [...new Set([...currentState.completedSteps, 1, 2])],
      data: {
        ...currentState.data,
        schedule: {
          ...scheduleData,
          completedAt: new Date().toISOString(),
          stepId: 2,
        },
      },
      stepStatus: {
        ...currentState.stepStatus,
        2: "finish",
      },
    };

    this.saveState(newState);
    this.dispatchEvent("schedule:completed", {
      patientId,
      data: scheduleData,
      stepId: 2,
      state: newState,
    });

    return newState;
  }

  // Cập nhật step hiện tại
  updateCurrentStep(patientId, stepIndex) {
    const currentState = this.getCurrentState(patientId);

    const newState = {
      ...currentState,
      patientId,
      currentStep: stepIndex,
    };

    this.saveState(newState);
    this.dispatchEvent("step:changed", {
      patientId,
      stepIndex,
      state: newState,
    });

    return newState;
  }

  // Lấy trạng thái step cụ thể
  getStepData(stepIndex, patientId = null) {
    const state = this.getCurrentState(patientId);
    const stepData = state.data[this.getStepKey(stepIndex)];

    return {
      status: state.stepStatus[stepIndex] || "wait",
      isCompleted: state.completedSteps.includes(stepIndex),
      completedAt: stepData?.completedAt,
      data: stepData,
    };
  }

  // Lấy key cho step data
  getStepKey(stepIndex) {
    const stepKeys = ["examination", "treatmentPlan", "schedule", "progress"];
    return stepKeys[stepIndex] || null;
  }

  // Lấy tổng quan tiến độ
  getOverallProgress(patientId = null) {
    const state = this.getCurrentState(patientId);
    const totalSteps = 5;
    const completedSteps = state.completedSteps.length;
    const percentage = Math.round((completedSteps / totalSteps) * 100);

    return {
      completed: completedSteps,
      total: totalSteps,
      percentage,
      state,
    };
  }

  // Force refresh state từ localStorage
  forceRefresh(patientId = null) {
    try {
      if (!patientId) {
        // Tìm patientId từ localStorage
        const keys = Object.keys(localStorage);
        const treatmentKeys = keys.filter((key) =>
          key.startsWith("treatmentProcessData_")
        );
        if (treatmentKeys.length > 0) {
          patientId = treatmentKeys[0].replace("treatmentProcessData_", "");
        }
      }

      if (patientId) {
        const state = this.getCurrentState(patientId);
        console.log(
          `🔄 Force refreshed state for patient ${patientId}:`,
          state
        );
        return state;
      }
    } catch (error) {
      console.error("Error in forceRefresh:", error);
    }
    return null;
  }

  // Kiểm tra và cập nhật từ localStorage
  checkAndUpdateFromStorage(patientId) {
    try {
      const storageKey = this.getStorageKey(patientId);
      const stored = localStorage.getItem(storageKey);

      if (stored) {
        const state = JSON.parse(stored);
        console.log(
          `📥 Loaded state from storage for patient ${patientId}:`,
          state
        );
        return state;
      }
    } catch (error) {
      console.error("Error checking storage:", error);
    }
    return null;
  }

  // Xóa phác đồ điều trị và reset state
  deleteTreatmentPlan(patientId) {
    try {
      console.log(`🗑️ Deleting treatment plan for patient ${patientId}`);

      // Xóa dữ liệu treatment plan khỏi state
      const currentState = this.getCurrentState(patientId);
      const newState = {
        ...currentState,
        data: {
          ...currentState.data,
          treatmentPlan: null,
        },
        completedSteps: currentState.completedSteps.filter(
          (step) => step !== 1
        ),
        stepStatus: {
          ...currentState.stepStatus,
          1: "wait",
        },
        currentStep: Math.min(currentState.currentStep, 1), // Quay lại step 1 hoặc 0
      };

      this.saveState(newState);

      // Xóa các localStorage keys liên quan đến treatment plan
      const keysToRemove = [
        `treatment_plan_completed_${patientId}`,
        `treatment_plan_draft_${patientId}`,
        `treatment_plan_${patientId}`,
      ];

      keysToRemove.forEach((key) => {
        localStorage.removeItem(key);
        console.log(`🗑️ Removed localStorage key: ${key}`);
      });

      this.dispatchEvent("treatmentplan:deleted", {
        patientId,
        state: newState,
      });

      console.log(`✅ Treatment plan deleted for patient ${patientId}`);
      return newState;
    } catch (error) {
      console.error("Error deleting treatment plan:", error);
      throw error;
    }
  }

  // Xóa toàn bộ state của bệnh nhân
  clearPatientState(patientId) {
    try {
      const storageKey = this.getStorageKey(patientId);
      localStorage.removeItem(storageKey);

      // Xóa tất cả localStorage keys liên quan
      const keys = Object.keys(localStorage);
      const patientKeys = keys.filter((key) => key.includes(`_${patientId}`));

      patientKeys.forEach((key) => {
        localStorage.removeItem(key);
        console.log(`🗑️ Removed localStorage key: ${key}`);
      });

      this.dispatchEvent("patient:cleared", { patientId });
      console.log(`✅ Cleared all state for patient ${patientId}`);
    } catch (error) {
      console.error("Error clearing patient state:", error);
    }
  }

  // Dispatch event
  dispatchEvent(eventType, data) {
    const event = new CustomEvent(`${this.EVENT_PREFIX}${eventType}`, {
      detail: data,
    });
    window.dispatchEvent(event);
  }

  // Add event listener
  addEventListener(eventType, callback) {
    window.addEventListener(`${this.EVENT_PREFIX}${eventType}`, callback);
  }

  // Remove event listener
  removeEventListener(eventType, callback) {
    window.removeEventListener(`${this.EVENT_PREFIX}${eventType}`, callback);
  }

  // Xóa state (backward compatibility)
  clearState(patientId = null) {
    if (patientId) {
      this.clearPatientState(patientId);
    } else {
      // Xóa tất cả treatment state
      const keys = Object.keys(localStorage);
      const treatmentKeys = keys.filter((key) =>
        key.startsWith("treatmentProcessData_")
      );
      treatmentKeys.forEach((key) => localStorage.removeItem(key));
    }
  }

  // Kiểm tra có dữ liệu hoàn thành không
  hasCompletedData(patientId = null) {
    const state = this.getCurrentState(patientId);
    return state.completedSteps.length > 0;
  }

  // Lấy step tiếp theo
  getNextStep(patientId = null) {
    const state = this.getCurrentState(patientId);
    const completedSteps = state.completedSteps;

    for (let i = 0; i < 5; i++) {
      if (!completedSteps.includes(i)) {
        return i;
      }
    }
    return 4; // Tất cả đã hoàn thành
  }

  // Debug state
  debugState(patientId = null) {
    const state = this.getCurrentState(patientId);
    console.log("🔍 Treatment State Debug:", {
      patientId: state.patientId,
      currentStep: state.currentStep,
      completedSteps: state.completedSteps,
      stepStatus: state.stepStatus,
      hasData: {
        examination: !!state.data.examination,
        treatmentPlan: !!state.data.treatmentPlan,
        schedule: !!state.data.schedule,
        progress: !!state.data.progress,
      },
      lastUpdated: state.lastUpdated,
    });
    return state;
  }
}

// Export singleton instance
export const treatmentStateManager = new TreatmentStateManager();
