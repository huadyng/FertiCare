// Đơn giản hóa treatment state management cho đồng bộ dữ liệu

export class TreatmentStateManager {
  constructor() {
    this.STORAGE_KEY = "treatmentProcessData";
    this.EVENT_PREFIX = "treatment:";
  }

  // Lấy trạng thái hiện tại từ localStorage
  getCurrentState() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : this.getInitialState();
    } catch (error) {
      console.error("Error loading treatment state:", error);
      return this.getInitialState();
    }
  }

  // Trạng thái ban đầu
  getInitialState() {
    return {
      patientId: null,
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

  // Lưu trạng thái vào localStorage
  saveState(state) {
    try {
      localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify({
          ...state,
          lastUpdated: new Date().toISOString(),
        })
      );
      console.log("💾 Treatment state saved:", state);
    } catch (error) {
      console.error("Error saving treatment state:", error);
    }
  }

  // Khởi tạo trạng thái cho bệnh nhân
  initializePatient(patientId, patientInfo = {}) {
    const state = {
      ...this.getInitialState(),
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
    const currentState = this.getCurrentState();

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
    const currentState = this.getCurrentState();

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
    const currentState = this.getCurrentState();

    const newState = {
      ...currentState,
      patientId,
      currentStep: Math.max(currentState.currentStep, 3),
      completedSteps: [...new Set([...currentState.completedSteps, 2])],
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
    const currentState = this.getCurrentState();

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
  getStepData(stepIndex) {
    const state = this.getCurrentState();
    const stepKeys = ["examination", "treatmentPlan", "schedule", "progress"];
    const stepKey = stepKeys[stepIndex];

    return {
      status: state.stepStatus[stepIndex] || "wait",
      data: state.data[stepKey] || null,
      isCompleted: state.completedSteps.includes(stepIndex),
      completedAt: state.data[stepKey]?.completedAt || null,
    };
  }

  // Lấy progress tổng thể
  getOverallProgress() {
    const state = this.getCurrentState();
    const totalSteps = 5;
    const completedSteps = state.completedSteps.length;

    return {
      current: state.currentStep,
      completed: completedSteps,
      total: totalSteps,
      percentage: Math.round((completedSteps / totalSteps) * 100),
      state,
    };
  }

  // Dispatch custom event
  dispatchEvent(eventType, data) {
    const event = new CustomEvent(`${this.EVENT_PREFIX}${eventType}`, {
      detail: data,
    });
    window.dispatchEvent(event);
    console.log(`🔔 Event dispatched: ${eventType}`, data);
  }

  // Listen for events
  addEventListener(eventType, callback) {
    window.addEventListener(`${this.EVENT_PREFIX}${eventType}`, callback);
  }

  // Remove event listener
  removeEventListener(eventType, callback) {
    window.removeEventListener(`${this.EVENT_PREFIX}${eventType}`, callback);
  }

  // Clear tất cả dữ liệu
  clearState(patientId = null) {
    if (patientId) {
      const currentState = this.getCurrentState();
      if (currentState.patientId === patientId) {
        localStorage.removeItem(this.STORAGE_KEY);
      }
    } else {
      localStorage.removeItem(this.STORAGE_KEY);
    }

    this.dispatchEvent("state:cleared", { patientId });
  }

  // Kiểm tra xem có dữ liệu nào đã hoàn thành chưa
  hasCompletedData() {
    const state = this.getCurrentState();
    return state.completedSteps.length > 0;
  }

  // Lấy thông tin bước tiếp theo
  getNextStep() {
    const state = this.getCurrentState();
    const stepNames = [
      "Khám lâm sàng",
      "Lập phác đồ điều trị",
      "Lập lịch điều trị",
      "Theo dõi tiến trình",
      "Hoàn thành",
    ];

    const nextStepIndex = state.currentStep;
    return {
      index: nextStepIndex,
      name: stepNames[nextStepIndex] || "Hoàn thành",
      isComplete: nextStepIndex >= stepNames.length,
    };
  }
}

// Export singleton instance
export const treatmentStateManager = new TreatmentStateManager();
export default treatmentStateManager;
