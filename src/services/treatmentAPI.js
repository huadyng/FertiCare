import axios from "axios";

const API_BASE_URL = "http://localhost:3001";

// API cho kết quả khám lâm sàng
export const examinationAPI = {
  // Lấy kết quả khám của bệnh nhân
  getExaminationResults: async (patientId) => {
    const response = await axios.get(`${API_BASE_URL}/examinationResults`, {
      params: { patientId },
    });
    return response.data;
  },

  // Tạo kết quả khám mới
  createExaminationResult: async (examinationData) => {
    const response = await axios.post(`${API_BASE_URL}/examinationResults`, {
      id: Date.now().toString(),
      ...examinationData,
      examinationDate: new Date().toISOString().split("T")[0],
      status: "completed",
    });
    return response.data;
  },

  // Cập nhật kết quả khám
  updateExaminationResult: async (id, examinationData) => {
    const response = await axios.put(
      `${API_BASE_URL}/examinationResults/${id}`,
      examinationData
    );
    return response.data;
  },
};

// API cho template phác đồ điều trị
export const treatmentTemplateAPI = {
  // Lấy tất cả template
  getTemplates: async () => {
    const response = await axios.get(`${API_BASE_URL}/treatmentTemplates`);
    return response.data;
  },

  // Lấy template theo loại
  getTemplatesByType: async (type) => {
    const response = await axios.get(`${API_BASE_URL}/treatmentTemplates`, {
      params: { type },
    });
    return response.data;
  },

  // Lấy template theo ID
  getTemplateById: async (id) => {
    const response = await axios.get(
      `${API_BASE_URL}/treatmentTemplates/${id}`
    );
    return response.data;
  },
};

// API cho phác đồ điều trị cá nhân hóa
export const treatmentPlanAPI = {
  // Lấy phác đồ của bệnh nhân
  getPatientPlans: async (patientId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/treatmentPlans`, {
        params: { patientId },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching patient plans:", error);
      throw error;
    }
  },

  // Tạo phác đồ điều trị mới
  createTreatmentPlan: async (planData) => {
    try {
      const planWithDefaults = {
        id: Date.now().toString(),
        ...planData,
        createdDate: new Date().toISOString().split("T")[0],
        status: planData.status || "approved",
        lastModified: new Date().toISOString(),
      };

      const response = await axios.post(
        `${API_BASE_URL}/treatmentPlans`,
        planWithDefaults
      );

      // Log successful creation
      console.log("✅ Treatment plan created successfully:", response.data);

      return response.data;
    } catch (error) {
      console.error("❌ Error creating treatment plan:", error);

      // If API is down, return the plan data for local use
      if (error.code === "ECONNREFUSED" || error.response?.status >= 500) {
        console.warn("API unavailable, returning local data");
        return {
          id: Date.now().toString(),
          ...planData,
          createdDate: new Date().toISOString().split("T")[0],
          status: planData.status || "approved",
          lastModified: new Date().toISOString(),
          _isLocal: true,
        };
      }

      throw error;
    }
  },

  // Cập nhật phác đồ điều trị
  updateTreatmentPlan: async (id, planData) => {
    try {
      const updatedData = {
        ...planData,
        lastModified: new Date().toISOString(),
      };

      const response = await axios.put(
        `${API_BASE_URL}/treatmentPlans/${id}`,
        updatedData
      );

      console.log("✅ Treatment plan updated successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error updating treatment plan:", error);
      throw error;
    }
  },

  // Phê duyệt phác đồ điều trị
  approveTreatmentPlan: async (id) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/treatmentPlans/${id}`,
        {
          status: "approved",
          approvedDate: new Date().toISOString().split("T")[0],
        }
      );

      console.log("✅ Treatment plan approved:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error approving treatment plan:", error);
      throw error;
    }
  },

  // Lấy phác đồ theo ID
  getTreatmentPlanById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/treatmentPlans/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching treatment plan:", error);
      throw error;
    }
  },

  // Xóa phác đồ điều trị
  deleteTreatmentPlan: async (id) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/treatmentPlans/${id}`
      );
      console.log("✅ Treatment plan deleted:", id);
      return response.data;
    } catch (error) {
      console.error("❌ Error deleting treatment plan:", error);
      throw error;
    }
  },
};

// API cho lịch trình điều trị
export const treatmentScheduleAPI = {
  // Lấy lịch trình của bệnh nhân
  getPatientSchedule: async (patientId) => {
    const response = await axios.get(`${API_BASE_URL}/treatmentSchedules`, {
      params: { patientId },
    });
    return response.data;
  },

  // Tạo lịch trình điều trị
  createTreatmentSchedule: async (scheduleData) => {
    const response = await axios.post(`${API_BASE_URL}/treatmentSchedules`, {
      id: Date.now().toString(),
      ...scheduleData,
    });
    return response.data;
  },

  // Cập nhật lịch trình
  updateTreatmentSchedule: async (id, scheduleData) => {
    const response = await axios.put(
      `${API_BASE_URL}/treatmentSchedules/${id}`,
      scheduleData
    );
    return response.data;
  },

  // Cập nhật trạng thái buổi điều trị
  updateSessionStatus: async (scheduleId, sessionId, status) => {
    const schedule = await axios.get(
      `${API_BASE_URL}/treatmentSchedules/${scheduleId}`
    );
    const updatedSchedule = { ...schedule.data };

    updatedSchedule.sessions = updatedSchedule.sessions.map((session) =>
      session.id === sessionId ? { ...session, status } : session
    );

    const response = await axios.put(
      `${API_BASE_URL}/treatmentSchedules/${scheduleId}`,
      updatedSchedule
    );
    return response.data;
  },
};

// API cho phòng ban và nhân viên
export const resourceAPI = {
  // Lấy danh sách phòng
  getRooms: async () => {
    const response = await axios.get(`${API_BASE_URL}/rooms`);
    return response.data;
  },

  // Lấy danh sách nhân viên
  getStaff: async () => {
    const response = await axios.get(`${API_BASE_URL}/staff`);
    return response.data;
  },

  // Lấy danh sách bác sĩ
  getDoctors: async () => {
    const response = await axios.get(`${API_BASE_URL}/doctors`);
    return response.data;
  },
};

// API tổng hợp cho quy trình điều trị
export const treatmentProcessAPI = {
  // Lấy toàn bộ thông tin quy trình của bệnh nhân
  getPatientTreatmentProcess: async (patientId) => {
    const [examinations, plans, schedules] = await Promise.all([
      examinationAPI.getExaminationResults(patientId),
      treatmentPlanAPI.getPatientPlans(patientId),
      treatmentScheduleAPI.getPatientSchedule(patientId),
    ]);

    return {
      examinations,
      plans,
      schedules,
    };
  },

  // Chuyển sang bước tiếp theo trong quy trình
  progressToNextStep: async (patientId, currentStep, data) => {
    switch (currentStep) {
      case "examination":
        return await examinationAPI.createExaminationResult(data);
      case "treatment-plan":
        return await treatmentPlanAPI.createTreatmentPlan(data);
      case "schedule":
        return await treatmentScheduleAPI.createTreatmentSchedule(data);
      default:
        throw new Error("Invalid step");
    }
  },
};
