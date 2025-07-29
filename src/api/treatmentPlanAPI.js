import axiosClient, { refreshTokenFromContext } from "../services/axiosClient.js";

export const treatmentPlanAPI = {
  // Lưu phác đồ điều trị mới từ clinical result
  async createTreatmentPlanFromClinicalResult(resultId, planData) {
    try {
      // 🔄 Try to refresh token before making request
      refreshTokenFromContext();
      
      const response = await axiosClient.post(
        `/api/treatment-workflow/treatment-plan/from-clinical-result/${resultId}`,
        planData
      );
      return {
        success: true,
        data: response.data,
        message: "Phác đồ điều trị đã được lưu thành công",
      };
    } catch (error) {
      console.error("Error saving treatment plan from clinical result:", error);
      return {
        success: false,
        error: error.message,
        message: "Có lỗi xảy ra khi lưu phác đồ điều trị",
      };
    }
  },

  // Cập nhật phác đồ điều trị
  async updateTreatmentPlan(planId, planData) {
    try {
      const response = await axiosClient.put(
        `/api/treatment-workflow/treatment-plan/${planId}/modify`,
        planData
      );
      return {
        success: true,
        data: response.data,
        message: "Phác đồ điều trị đã được cập nhật thành công",
      };
    } catch (error) {
      console.error("Error updating treatment plan:", error);
      return {
        success: false,
        error: error.message,
        message: "Có lỗi xảy ra khi cập nhật phác đồ điều trị",
      };
    }
  },

  // Lấy phác đồ điều trị theo ID
  async getTreatmentPlan(planId) {
    try {
      const response = await axiosClient.get(
        `/api/treatment-workflow/treatment-plan/${planId}`
      );
      return {
        success: true,
        data: response.data,
        message: "Lấy phác đồ điều trị thành công",
      };
    } catch (error) {
      console.error("Error fetching treatment plan:", error);
      return {
        success: false,
        error: error.message,
        message: "Có lỗi xảy ra khi lấy phác đồ điều trị",
      };
    }
  },

  // Lấy danh sách phác đồ điều trị theo bệnh nhân
  async getTreatmentPlansByPatient(patientId) {
    try {
      const response = await axiosClient.get(
        `/api/treatment-workflow/patient/${patientId}/treatment-history`
      );
      return {
        success: true,
        data: response.data,
        message: "Lấy danh sách phác đồ điều trị thành công",
      };
    } catch (error) {
      console.error("Error fetching treatment plans by patient:", error);
      return {
        success: false,
        error: error.message,
        message: "Có lỗi xảy ra khi lấy danh sách phác đồ điều trị",
      };
    }
  },

  // Lấy danh sách phác đồ điều trị theo bác sĩ
  async getTreatmentPlansByDoctor(doctorId) {
    try {
      const response = await axiosClient.get(
        `/api/treatment-workflow/doctor/${doctorId}/treatment-phases`
      );
      return {
        success: true,
        data: response.data,
        message: "Lấy danh sách phác đồ điều trị thành công",
      };
    } catch (error) {
      console.error("Error fetching treatment plans by doctor:", error);
      return {
        success: false,
        error: error.message,
        message: "Có lỗi xảy ra khi lấy danh sách phác đồ điều trị",
      };
    }
  },

  // Xóa phác đồ điều trị
  async deleteTreatmentPlan(planId) {
    try {
      await axiosClient.delete(`/treatmentPlans/${planId}`);
      return {
        success: true,
        message: "Phác đồ điều trị đã được xóa thành công",
      };
    } catch (error) {
      console.error("Error deleting treatment plan:", error);
      return {
        success: false,
        error: error.message,
        message: "Có lỗi xảy ra khi xóa phác đồ điều trị",
      };
    }
  },

  // Lưu draft phác đồ điều trị
  async saveDraft(patientId, draftData) {
    try {
      const response = await axiosClient.post("/treatmentPlans/draft", {
        patientId,
        draftData,
        savedAt: new Date().toISOString(),
      });
      return {
        success: true,
        data: response.data,
        message: "Draft đã được lưu thành công",
      };
    } catch (error) {
      console.error("Error saving draft:", error);
      return {
        success: false,
        error: error.message,
        message: "Có lỗi xảy ra khi lưu draft",
      };
    }
  },

  // Lấy draft phác đồ điều trị
  async getDraft(patientId) {
    try {
      const response = await axiosClient.get(
        `/treatmentPlans/draft/${patientId}`
      );
      return {
        success: true,
        data: response.data,
        message: "Lấy draft thành công",
      };
    } catch (error) {
      console.error("Error fetching draft:", error);
      return {
        success: false,
        error: error.message,
        message: "Có lỗi xảy ra khi lấy draft",
      };
    }
  },

  // Xóa draft phác đồ điều trị
  async deleteDraft(patientId) {
    try {
      await axiosClient.delete(`/treatmentPlans/draft/${patientId}`);
      return {
        success: true,
        message: "Draft đã được xóa thành công",
      };
    } catch (error) {
      console.error("Error deleting draft:", error);
      return {
        success: false,
        error: error.message,
        message: "Có lỗi xảy ra khi xóa draft",
      };
    }
  },

  // Lấy template phác đồ điều trị
  async getTemplates() {
    try {
      // 🔄 Try to refresh token before making request
      refreshTokenFromContext();
      
      const response = await axiosClient.get("/treatmentTemplates");
      return {
        success: true,
        data: response.data,
        message: "Lấy danh sách template thành công",
      };
    } catch (error) {
      console.error("Error fetching templates:", error);
      return {
        success: false,
        error: error.message,
        message: "Có lỗi xảy ra khi lấy danh sách template",
      };
    }
  },

  // Lấy template theo loại điều trị
  async getTemplateByType(treatmentType) {
    try {
      // 🔄 Try to refresh token before making request
      refreshTokenFromContext();
      
      const response = await axiosClient.get(
        `/treatmentTemplates?type=${treatmentType}`
      );
      return {
        success: true,
        data: response.data[0], // Lấy template đầu tiên
        message: "Lấy template thành công",
      };
    } catch (error) {
      console.error("Error fetching template by type:", error);
      return {
        success: false,
        error: error.message,
        message: "Có lỗi xảy ra khi lấy template",
      };
    }
  },

  // Validate phác đồ điều trị
  validateTreatmentPlan(planData) {
    const errors = [];

    if (!planData.patientId) {
      errors.push("Thiếu thông tin bệnh nhân");
    }

    if (!planData.doctorId) {
      errors.push("Thiếu thông tin bác sĩ");
    }

    if (!planData.treatmentType) {
      errors.push("Thiếu loại điều trị");
    }

    if (!planData.template || !planData.template.phases) {
      errors.push("Thiếu thông tin template điều trị");
    }

    if (!planData.estimatedStartDate) {
      errors.push("Thiếu ngày bắt đầu dự kiến");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Lấy phác đồ điều trị hiện tại (active) của bệnh nhân
  async getActiveTreatmentPlan(patientId) {
    try {
      // 🔄 Try to refresh token before making request
      refreshTokenFromContext();
      
      const response = await axiosClient.get(
        `/api/treatment-workflow/patient/${patientId}/active-treatment-plan`
      );
      return {
        success: true,
        data: response.data,
        message: "Lấy phác đồ điều trị hiện tại thành công",
      };
    } catch (error) {
      console.error("Error fetching active treatment plan:", error);
      return {
        success: false,
        error: error.message,
        message: "Có lỗi xảy ra khi lấy phác đồ điều trị hiện tại",
      };
    }
  },
};

export default treatmentPlanAPI;
