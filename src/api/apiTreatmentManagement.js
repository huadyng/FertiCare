import axiosClient from "../services/axiosClient";

const apiTreatmentManagement = {
  // Helper function to get current user role
  getCurrentUserRole: () => {
    try {
      const user = localStorage.getItem("user");
      if (user) {
        const userData = JSON.parse(user);
        return userData.role?.toUpperCase();
      }
    } catch (error) {
      console.error("Error getting user role:", error);
    }
    return null;
  },

  // Helper function to check if user has required role
  hasRequiredRole: (requiredRole) => {
    const currentRole = apiTreatmentManagement.getCurrentUserRole();
    return currentRole === requiredRole;
  },

  // Helper function to get appropriate API endpoint based on user role
  getRoleAppropriateEndpoint: (patientId, endpointType) => {
    const userRole = apiTreatmentManagement.getCurrentUserRole();
    const user = localStorage.getItem("user");
    let doctorId = null;
    if (user) {
      const userData = JSON.parse(user);
      doctorId = userData.id || userData.userId;
    }

    // Kiểm tra quyền và doctorId trước khi trả về endpoint cho bác sĩ
    if (
      endpointType === "treatment-phases" ||
      endpointType === "treatment-history"
    ) {
      if (userRole === "DOCTOR") {
        if (!doctorId) {
          // Không tìm thấy doctorId, trả về null để báo lỗi
          return null;
        }
        return `/api/treatment-workflow/doctor/${doctorId}/treatment-phases`;
      } else if (userRole === "CUSTOMER" || userRole === "PATIENT") {
        return `/api/treatment-workflow/patient/${patientId}/treatment-phases`;
      }
    }

    switch (endpointType) {
      case "treatment-phases":
        if (userRole === "DOCTOR") {
          // DOCTOR lấy phases tổng hợp và sẽ lọc theo patientId ở frontend
          return `/api/treatment-workflow/doctor/${doctorId}/treatment-phases`;
        } else if (userRole === "CUSTOMER" || userRole === "PATIENT") {
          return `/api/treatment-workflow/patient/${patientId}/treatment-phases`;
        }
        break;
      case "treatment-history":
        if (userRole === "DOCTOR") {
          // DOCTOR không có API riêng, sẽ lấy từ treatment-phases và lọc
          return `/api/treatment-workflow/doctor/${doctorId}/treatment-phases`;
        } else if (userRole === "CUSTOMER" || userRole === "PATIENT") {
          return `/api/treatment-workflow/patient/${patientId}/treatment-history`;
        }
        break;
      case "clinical-results":
        if (userRole === "DOCTOR") {
          // DOCTOR có thể lấy clinical results của bệnh nhân
          return `/api/clinical-results/patient/${patientId}`;
        } else if (userRole === "CUSTOMER" || userRole === "PATIENT") {
          return `/api/treatment-workflow/patient/${patientId}/clinical-results`;
        }
        break;
    }
    return null;
  },

  // ========== TREATMENT PLAN TEMPLATES ==========

  // Lấy tất cả templates theo specialty của bác sĩ
  getTreatmentPlanTemplates: async () => {
    try {
      const response = await axiosClient.get("/api/treatment-plan-templates");
      return {
        success: true,
        data: response.data,
        message: "Lấy danh sách templates thành công",
      };
    } catch (error) {
      console.error("Error fetching treatment plan templates:", error);
      return {
        success: false,
        data: [],
        message:
          error.response?.data?.message || "Không thể lấy danh sách templates",
      };
    }
  },

  // Lấy template theo treatment type
  getTemplateByType: async (treatmentType) => {
    try {
      console.log(
        `🔍 [apiTreatmentManagement] Fetching template for type: ${treatmentType}`
      );

      const response = await axiosClient.get(
        `/api/treatment-plan-templates/type/${treatmentType}`
      );
      return {
        success: true,
        data: response.data,
        message: "Lấy template thành công",
      };
    } catch (error) {
      console.warn(
        `⚠️ [apiTreatmentManagement] Failed to get template by type ${treatmentType}:`,
        error.message
      );

      // Fallback: Try to get all templates and filter by type
      try {
        console.log(
          `🔄 [apiTreatmentManagement] Trying fallback: get all templates and filter by ${treatmentType}`
        );
        const allTemplatesResponse = await axiosClient.get(
          "/api/treatment-plan-templates"
        );

        if (
          allTemplatesResponse.data &&
          Array.isArray(allTemplatesResponse.data)
        ) {
          const filteredTemplate = allTemplatesResponse.data.find(
            (template) =>
              template.treatmentType?.toUpperCase() ===
              treatmentType.toUpperCase()
          );

          if (filteredTemplate) {
            console.log(
              `✅ [apiTreatmentManagement] Found template using fallback method:`,
              filteredTemplate.name
            );
            return {
              success: true,
              data: filteredTemplate,
              message: "Lấy template thành công (fallback)",
            };
          }
        }
      } catch (fallbackError) {
        console.error(
          "❌ [apiTreatmentManagement] Fallback also failed:",
          fallbackError
        );
      }

      return {
        success: false,
        data: null,
        message:
          error.response?.data?.message ||
          `Không thể lấy template cho ${treatmentType}`,
      };
    }
  },

  // Preview template
  previewTemplate: async (treatmentType) => {
    try {
      const response = await axiosClient.get(
        `/api/treatment-plan-templates/preview/${treatmentType}`
      );
      return {
        success: true,
        data: response.data,
        message: "Preview template thành công",
      };
    } catch (error) {
      console.error("Error previewing template:", error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || "Không thể preview template",
      };
    }
  },

  // ========== TREATMENT WORKFLOW ==========

  // Tạo phác đồ điều trị từ kết quả khám lâm sàng
  createTreatmentPlanFromClinicalResult: async (
    resultId,
    treatmentPlanRequest
  ) => {
    try {
      const response = await axiosClient.post(
        `/api/treatment-workflow/treatment-plan/from-clinical-result/${resultId}`,
        treatmentPlanRequest
      );
      return {
        success: true,
        data: response.data,
        message: "Tạo phác đồ điều trị thành công",
      };
    } catch (error) {
      console.error(
        "Error creating treatment plan from clinical result:",
        error
      );
      return {
        success: false,
        data: null,
        message:
          error.response?.data?.message || "Không thể tạo phác đồ điều trị",
      };
    }
  },

  // Chỉnh sửa phác đồ điều trị
  modifyTreatmentPlan: async (treatmentPlanId, modifications) => {
    try {
      const response = await axiosClient.put(
        `/api/treatment-workflow/treatment-plan/${treatmentPlanId}/modify`,
        modifications
      );
      return {
        success: true,
        data: response.data,
        message: "Cập nhật phác đồ điều trị thành công",
      };
    } catch (error) {
      console.error("Error modifying treatment plan:", error);
      return {
        success: false,
        data: null,
        message:
          error.response?.data?.message ||
          "Không thể cập nhật phác đồ điều trị",
      };
    }
  },

  // Hoàn thành điều trị
  completeTreatmentPlan: async (treatmentPlanId, notes) => {
    try {
      const response = await axiosClient.post(
        `/api/treatment-workflow/treatment-plan/${treatmentPlanId}/complete`,
        null,
        {
          params: { notes },
        }
      );
      return {
        success: true,
        data: response.data,
        message: "Hoàn thành điều trị thành công",
      };
    } catch (error) {
      console.error("Error completing treatment plan:", error);
      return {
        success: false,
        data: null,
        message:
          error.response?.data?.message || "Không thể hoàn thành điều trị",
      };
    }
  },

  // Hủy kế hoạch điều trị
  cancelTreatmentPlan: async (treatmentPlanId, reason) => {
    try {
      const response = await axiosClient.post(
        `/api/treatment-workflow/treatment-plan/${treatmentPlanId}/cancel`,
        null,
        {
          params: { reason },
        }
      );
      return {
        success: true,
        data: response.data,
        message: "Hủy kế hoạch điều trị thành công",
      };
    } catch (error) {
      console.error("Error cancelling treatment plan:", error);
      return {
        success: false,
        data: null,
        message:
          error.response?.data?.message || "Không thể hủy kế hoạch điều trị",
      };
    }
  },

  // Cập nhật trạng thái phase
  updatePhaseStatus: async (treatmentPlanId, phaseId, statusRequest) => {
    try {
      const response = await axiosClient.put(
        `/api/treatment-workflow/treatment-plan/${treatmentPlanId}/phase/${phaseId}/status`,
        statusRequest
      );
      return {
        success: true,
        data: response.data,
        message: "Cập nhật trạng thái phase thành công",
      };
    } catch (error) {
      console.error("Error updating phase status:", error);
      return {
        success: false,
        data: null,
        message:
          error.response?.data?.message ||
          "Không thể cập nhật trạng thái phase",
      };
    }
  },

  // Lấy danh sách phases của treatment plan
  getTreatmentPlanPhases: async (treatmentPlanId) => {
    try {
      const response = await axiosClient.get(
        `/api/treatment-workflow/treatment-plan/${treatmentPlanId}/phases`
      );
      return {
        success: true,
        data: response.data,
        message: "Lấy danh sách phases thành công",
      };
    } catch (error) {
      console.error("Error fetching treatment plan phases:", error);
      return {
        success: false,
        data: [],
        message:
          error.response?.data?.message || "Không thể lấy danh sách phases",
      };
    }
  },

  // Lấy phase hiện tại
  getCurrentPhase: async (treatmentPlanId) => {
    try {
      const response = await axiosClient.get(
        `/api/treatment-workflow/treatment-plan/${treatmentPlanId}/current-phase`
      );
      return {
        success: true,
        data: response.data,
        message: "Lấy phase hiện tại thành công",
      };
    } catch (error) {
      console.error("Error fetching current phase:", error);
      return {
        success: false,
        data: null,
        message:
          error.response?.data?.message || "Không thể lấy phase hiện tại",
      };
    }
  },

  // Bác sĩ xem phases điều trị tổng hợp
  getDoctorTreatmentPhases: async (doctorId) => {
    try {
      const response = await axiosClient.get(
        `/api/treatment-workflow/doctor/${doctorId}/treatment-phases`
      );
      return {
        success: true,
        data: response.data,
        message: "Lấy danh sách phases tổng hợp thành công",
      };
    } catch (error) {
      console.error("Error fetching doctor treatment phases:", error);
      return {
        success: false,
        data: [],
        message:
          error.response?.data?.message ||
          "Không thể lấy danh sách phases tổng hợp",
      };
    }
  },

  // Cập nhật trạng thái phase
  updatePhaseStatus: async (treatmentPlanId, phaseId, statusData) => {
    try {
      const response = await axiosClient.put(
        `/api/treatment-workflow/treatment-plan/${treatmentPlanId}/phase/${phaseId}/status`,
        statusData
      );
      return {
        success: true,
        data: response.data,
        message: "Cập nhật trạng thái phase thành công",
      };
    } catch (error) {
      console.error("Error updating phase status:", error);
      return {
        success: false,
        data: null,
        message:
          error.response?.data?.message ||
          "Không thể cập nhật trạng thái phase",
      };
    }
  },

  // Tạo treatment plan từ clinical result
  createTreatmentPlanFromClinicalResult: async (resultId, planData) => {
    try {
      const response = await axiosClient.post(
        `/api/treatment-workflow/treatment-plan/from-clinical-result/${resultId}`,
        planData
      );
      return {
        success: true,
        data: response.data,
        message: "Tạo phác đồ điều trị thành công",
      };
    } catch (error) {
      console.error("Error creating treatment plan:", error);
      return {
        success: false,
        data: null,
        message:
          error.response?.data?.message || "Không thể tạo phác đồ điều trị",
      };
    }
  },

  // Chỉnh sửa treatment plan
  modifyTreatmentPlan: async (treatmentPlanId, modifications) => {
    try {
      const response = await axiosClient.put(
        `/api/treatment-workflow/treatment-plan/${treatmentPlanId}/modify`,
        modifications
      );
      return {
        success: true,
        data: response.data,
        message: "Chỉnh sửa phác đồ điều trị thành công",
      };
    } catch (error) {
      console.error("Error modifying treatment plan:", error);
      return {
        success: false,
        data: null,
        message:
          error.response?.data?.message ||
          "Không thể chỉnh sửa phác đồ điều trị",
      };
    }
  },

  // Hoàn thành treatment plan
  completeTreatmentPlan: async (treatmentPlanId, notes) => {
    try {
      const response = await axiosClient.post(
        `/api/treatment-workflow/treatment-plan/${treatmentPlanId}/complete`,
        null,
        {
          params: { notes },
        }
      );
      return {
        success: true,
        data: response.data,
        message: "Hoàn thành phác đồ điều trị thành công",
      };
    } catch (error) {
      console.error("Error completing treatment plan:", error);
      return {
        success: false,
        data: null,
        message:
          error.response?.data?.message ||
          "Không thể hoàn thành phác đồ điều trị",
      };
    }
  },

  // Hủy treatment plan
  cancelTreatmentPlan: async (treatmentPlanId, reason) => {
    try {
      const response = await axiosClient.post(
        `/api/treatment-workflow/treatment-plan/${treatmentPlanId}/cancel`,
        null,
        {
          params: { reason },
        }
      );
      return {
        success: true,
        data: response.data,
        message: "Hủy phác đồ điều trị thành công",
      };
    } catch (error) {
      console.error("Error canceling treatment plan:", error);
      return {
        success: false,
        data: null,
        message:
          error.response?.data?.message || "Không thể hủy phác đồ điều trị",
      };
    }
  },

  // ========== CLINICAL RESULTS ==========

  // Lấy kết quả khám theo ID
  getClinicalResultById: async (resultId) => {
    try {
      const response = await axiosClient.get(
        `/api/clinical-results/${resultId}`
      );
      return {
        success: true,
        data: response.data,
        message: "Lấy kết quả khám thành công",
      };
    } catch (error) {
      console.error("Error fetching clinical result:", error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || "Không thể lấy kết quả khám",
      };
    }
  },

  // Cập nhật kết quả khám
  updateClinicalResult: async (resultId, clinicalResultRequest) => {
    try {
      const response = await axiosClient.put(
        `/api/clinical-results/${resultId}`,
        clinicalResultRequest
      );
      return {
        success: true,
        data: response.data,
        message: "Cập nhật kết quả khám thành công",
      };
    } catch (error) {
      console.error("Error updating clinical result:", error);
      return {
        success: false,
        data: null,
        message:
          error.response?.data?.message || "Không thể cập nhật kết quả khám",
      };
    }
  },

  // Lấy kết quả khám theo bệnh nhân
  getClinicalResultsByPatient: async (patientId) => {
    try {
      const response = await axiosClient.get(
        `/api/clinical-results/patient/${patientId}`
      );
      return {
        success: true,
        data: response.data,
        message: "Lấy danh sách kết quả khám thành công",
      };
    } catch (error) {
      console.error("Error fetching clinical results by patient:", error);
      return {
        success: false,
        data: [],
        message:
          error.response?.data?.message ||
          "Không thể lấy danh sách kết quả khám",
      };
    }
  },

  // Lấy clinical results theo patient ID
  getPatientClinicalResults: async (patientId) => {
    try {
      console.log(
        `📋 [apiTreatmentManagement] Lấy clinical results cho patient ${patientId}...`
      );

      const userRole = apiTreatmentManagement.getCurrentUserRole();

      if (userRole === "DOCTOR") {
        // DOCTOR: Sử dụng API clinical-results/patient/{patientId}
        const response = await axiosClient.get(
          `/api/clinical-results/patient/${patientId}`
        );
        console.log(
          "✅ [apiTreatmentManagement] Clinical results từ clinical-results API:",
          response.data
        );
        return {
          success: true,
          data: response.data,
          message: "Lấy kết quả khám lâm sàng thành công",
        };
      } else {
        // CUSTOMER/PATIENT: Sử dụng API treatment-workflow
        const response = await axiosClient.get(
          `/api/treatment-workflow/patient/${patientId}/clinical-results`
        );
        console.log(
          "✅ [apiTreatmentManagement] Clinical results từ treatment-workflow API:",
          response.data
        );
        return {
          success: true,
          data: response.data,
          message: "Lấy kết quả khám lâm sàng thành công",
        };
      }
    } catch (error) {
      console.error(
        "❌ [apiTreatmentManagement] Lỗi lấy clinical results:",
        error
      );
      return {
        success: false,
        data: [],
        message:
          error.response?.data?.message ||
          "Không thể lấy kết quả khám lâm sàng",
      };
    }
  },

  // Lấy treatment phases theo patient ID
  getPatientTreatmentPhases: async (patientId) => {
    try {
      console.log(
        `📋 [apiTreatmentManagement] Lấy treatment phases cho patient ${patientId}...`
      );

      const userRole = apiTreatmentManagement.getCurrentUserRole();

      if (userRole === "DOCTOR") {
        // DOCTOR: Lấy từ phases tổng hợp và lọc theo patientId
        const user = localStorage.getItem("user");
        let doctorId = null;
        if (user) {
          const userData = JSON.parse(user);
          doctorId = userData.id || userData.userId;
        }

        const response = await axiosClient.get(
          `/api/treatment-workflow/doctor/${doctorId}/treatment-phases`
        );

        if (response.data && Array.isArray(response.data)) {
          // Lọc phases theo patientId
          const patientPhases = response.data.filter(
            (phase) =>
              phase.patientId === patientId || phase.patient?.id === patientId
          );

          console.log(
            "✅ [apiTreatmentManagement] Treatment phases từ doctor API:",
            patientPhases
          );
          return {
            success: true,
            data: patientPhases,
            message: "Lấy phases điều trị từ doctor API thành công",
          };
        }
      } else {
        // CUSTOMER/PATIENT: Sử dụng API riêng
        const response = await axiosClient.get(
          `/api/treatment-workflow/patient/${patientId}/treatment-phases`
        );
        console.log(
          "✅ [apiTreatmentManagement] Treatment phases từ patient API:",
          response.data
        );
        return {
          success: true,
          data: response.data,
          message: "Lấy phases điều trị thành công",
        };
      }

      return {
        success: false,
        data: [],
        message: "Không tìm thấy phases điều trị",
      };
    } catch (error) {
      console.error(
        "❌ [apiTreatmentManagement] Lỗi lấy treatment phases:",
        error
      );
      return {
        success: false,
        data: [],
        message:
          error.response?.data?.message || "Không thể lấy phases điều trị",
      };
    }
  },

  // Lấy treatment history theo patient ID
  getPatientTreatmentHistory: async (patientId) => {
    try {
      console.log(
        `📋 [apiTreatmentManagement] Lấy treatment history cho patient ${patientId}...`
      );

      const userRole = apiTreatmentManagement.getCurrentUserRole();

      if (userRole === "DOCTOR") {
        // DOCTOR: Lấy từ phases tổng hợp và lọc theo patientId
        const user = localStorage.getItem("user");
        let doctorId = null;
        if (user) {
          const userData = JSON.parse(user);
          doctorId = userData.id || userData.userId;
        }

        const response = await axiosClient.get(
          `/api/treatment-workflow/doctor/${doctorId}/treatment-phases`
        );

        if (response.data && Array.isArray(response.data)) {
          // Lọc phases theo patientId
          const patientPhases = response.data.filter(
            (phase) =>
              phase.patientId === patientId || phase.patient?.id === patientId
          );

          // Chuyển đổi phases thành treatment history format
          const treatmentHistory = patientPhases.map((phase) => ({
            planId: phase.treatmentPlan?.planId || phase.planId,
            planName: phase.treatmentPlan?.planName || phase.planName,
            treatmentType:
              phase.treatmentPlan?.treatmentType || phase.treatmentType,
            startDate: phase.treatmentPlan?.startDate || phase.startDate,
            endDate: phase.treatmentPlan?.endDate || phase.endDate,
            status: phase.status || phase.treatmentPlan?.status,
            doctorId: phase.treatmentPlan?.doctorId || phase.doctorId,
            successProbability: phase.treatmentPlan?.successProbability,
            estimatedCost: phase.treatmentPlan?.estimatedCost,
            phaseName: phase.phaseName,
            phaseStatus: phase.status,
          }));

          console.log(
            "✅ [apiTreatmentManagement] Treatment history từ doctor phases:",
            treatmentHistory
          );
          return {
            success: true,
            data: treatmentHistory,
            message: "Lấy lịch sử điều trị từ phases của bác sĩ thành công",
          };
        }
      } else {
        // CUSTOMER/PATIENT: Sử dụng API riêng
        const historyEndpoint =
          apiTreatmentManagement.getRoleAppropriateEndpoint(
            patientId,
            "treatment-history"
          );

        if (historyEndpoint) {
          const response = await axiosClient.get(historyEndpoint);
          console.log(
            "✅ [apiTreatmentManagement] Treatment history từ patient API:",
            response.data
          );
          return {
            success: true,
            data: response.data,
            message: "Lấy lịch sử điều trị thành công",
          };
        }
      }

      return {
        success: false,
        data: [],
        message: "Không tìm thấy lịch sử điều trị",
      };
    } catch (error) {
      console.error(
        "❌ [apiTreatmentManagement] Lỗi lấy treatment history:",
        error
      );
      return {
        success: false,
        data: [],
        message:
          error.response?.data?.message || "Không thể lấy lịch sử điều trị",
      };
    }
  },

  // ========== TREATMENT PLAN QUERY ==========

  // Lấy tất cả treatment plans theo patient ID
  getTreatmentPlansByPatient: async (patientId) => {
    try {
      console.log(
        `🔍 [apiTreatmentManagement] Fetching treatment plans for patient: ${patientId}`
      );

      const userRole = apiTreatmentManagement.getCurrentUserRole();

      if (userRole === "DOCTOR") {
        // DOCTOR: Sử dụng cùng endpoint với getActiveTreatmentPlan để tránh gọi API trùng lặp
        const phasesEndpoint =
          apiTreatmentManagement.getRoleAppropriateEndpoint(
            patientId,
            "treatment-phases"
          );

        if (!phasesEndpoint) {
          return {
            success: false,
            data: [],
            message: "Không có quyền truy cập phác đồ điều trị",
          };
        }

        const response = await axiosClient.get(phasesEndpoint);

        if (response.data && Array.isArray(response.data)) {
          // Lọc phases theo patientId
          const patientPhases = response.data.filter(
            (phase) =>
              phase.patientId === patientId || phase.patient?.id === patientId
          );

          console.log(
            "✅ [apiTreatmentManagement] Found phases for patient:",
            patientPhases.length
          );
          return {
            success: true,
            data: patientPhases,
            message: "Lấy danh sách phases điều trị thành công",
          };
        }
      } else {
        // CUSTOMER/PATIENT: Sử dụng treatment-history endpoint
        const historyEndpoint =
          apiTreatmentManagement.getRoleAppropriateEndpoint(
            patientId,
            "treatment-history"
          );

        if (!historyEndpoint) {
          return {
            success: false,
            data: [],
            message: "Không có quyền truy cập phác đồ điều trị",
          };
        }

        const response = await axiosClient.get(historyEndpoint);

        if (
          response.data &&
          Array.isArray(response.data) &&
          response.data.length > 0
        ) {
          const historyData = response.data[0]; // Lấy wrapper object
          return {
            success: true,
            data: historyData.history || [],
            message: "Lấy danh sách phác đồ điều trị thành công",
          };
        }
      }

      return {
        success: true,
        data: [],
        message: "Không có phác đồ điều trị nào",
      };
    } catch (error) {
      console.error("Error fetching treatment plans by patient:", error);
      return {
        success: false,
        data: [],
        message:
          error.response?.data?.message ||
          "Không thể lấy danh sách phác đồ điều trị",
      };
    }
  },

  // Lấy active treatment plan của patient (tối ưu nhất)
  getActiveTreatmentPlan: async (patientId) => {
    try {
      console.log(
        `🔍 [apiTreatmentManagement] Fetching active treatment plan for patient: ${patientId}`
      );

      const userRole = apiTreatmentManagement.getCurrentUserRole();
      console.log(`🔍 [apiTreatmentManagement] Current user role: ${userRole}`);

      // Get role-appropriate endpoint for treatment phases
      const phasesEndpoint = apiTreatmentManagement.getRoleAppropriateEndpoint(
        patientId,
        "treatment-phases"
      );

      if (!phasesEndpoint) {
        // Thông báo lỗi rõ ràng cho người dùng
        return {
          success: false,
          data: null,
          message:
            "Bạn không có quyền truy cập hoặc thiếu thông tin bác sĩ. Vui lòng đăng nhập lại!",
          permissionDenied: true,
        };
      }

      // Thử lấy từ patient treatment phases trước (có active plan)
      console.log(
        `🔍 [apiTreatmentManagement] Calling phases endpoint: ${phasesEndpoint}`
      );
      const phasesResponse = await axiosClient.get(phasesEndpoint);
      console.log(
        `✅ [apiTreatmentManagement] Phases response received:`,
        phasesResponse.data
      );

      // Log response structure để debug
      console.log(`🔍 [apiTreatmentManagement] Response structure:`, {
        isArray: Array.isArray(phasesResponse.data),
        hasActiveTreatmentPlan: phasesResponse.data?.activeTreatmentPlan
          ? true
          : false,
        dataLength: Array.isArray(phasesResponse.data)
          ? phasesResponse.data.length
          : "N/A",
        dataType: typeof phasesResponse.data,
      });

      // Kiểm tra nếu response có activeTreatmentPlan (object format)
      if (phasesResponse.data && phasesResponse.data.activeTreatmentPlan) {
        console.log(
          "✅ [apiTreatmentManagement] Found active plan from phases API"
        );
        return {
          success: true,
          data: phasesResponse.data.activeTreatmentPlan,
          message: "Lấy phác đồ điều trị active thành công",
        };
      }

      // Kiểm tra nếu response là array (phases format)
      if (phasesResponse.data && Array.isArray(phasesResponse.data)) {
        console.log(
          "🔄 [apiTreatmentManagement] Response is array format, processing phases..."
        );

        // Lọc phases theo patientId
        const patientPhases = phasesResponse.data.filter(
          (phase) =>
            phase.patientId === patientId || phase.patient?.id === patientId
        );

        console.log(
          `🔍 [apiTreatmentManagement] Found ${patientPhases.length} phases for patient ${patientId}`
        );

        if (patientPhases.length > 0) {
          // Log tất cả phases để debug
          console.log(
            "🔍 [apiTreatmentManagement] All phases for patient:",
            patientPhases.map((p) => ({
              phaseName: p.phaseName,
              status: p.status,
              planId: p.planId,
              hasTreatmentPlan: !!p.treatmentPlan,
            }))
          );

          // Tìm phase active hoặc mới nhất
          const activePhase =
            patientPhases.find(
              (phase) =>
                phase.status === "active" ||
                phase.status === "In Progress" ||
                phase.status === "draft"
            ) || patientPhases[0];

          console.log(
            "🔍 [apiTreatmentManagement] Selected active phase:",
            activePhase
              ? {
                  phaseName: activePhase.phaseName,
                  status: activePhase.status,
                  planId: activePhase.planId,
                  hasTreatmentPlan: !!activePhase.treatmentPlan,
                }
              : "No active phase found"
          );

          // Nếu phase có treatmentPlan, trả về
          if (activePhase && activePhase.treatmentPlan) {
            console.log(
              "✅ [apiTreatmentManagement] Found plan from phases array:",
              activePhase.treatmentPlan.planId
            );
            return {
              success: true,
              data: activePhase.treatmentPlan,
              message: "Lấy phác đồ điều trị từ phases thành công",
            };
          }

          // Nếu phase không có treatmentPlan nhưng có planId, tạo object giả
          if (activePhase && activePhase.planId) {
            console.log(
              "✅ [apiTreatmentManagement] Found plan from phase planId:",
              activePhase.planId
            );
            return {
              success: true,
              data: {
                planId: activePhase.planId,
                planName: activePhase.planName || `Plan ${activePhase.planId}`,
                treatmentType: activePhase.treatmentType || "IUI",
                startDate: activePhase.startDate,
                endDate: activePhase.endDate,
                status: activePhase.status || "active",
                doctorId: activePhase.doctorId,
                patientId: activePhase.patientId,
                phases: patientPhases,
              },
              message: "Lấy phác đồ điều trị từ phase planId thành công",
            };
          }
        }
      }

      // Fallback: Thử lấy từ clinical results để tìm treatment plan
      console.log(
        "🔄 [apiTreatmentManagement] Trying fallback: get clinical results"
      );
      const clinicalResultsEndpoint =
        apiTreatmentManagement.getRoleAppropriateEndpoint(
          patientId,
          "clinical-results"
        );

      if (clinicalResultsEndpoint) {
        const clinicalResultsResponse = await axiosClient.get(
          clinicalResultsEndpoint
        );

        if (
          clinicalResultsResponse.data &&
          Array.isArray(clinicalResultsResponse.data)
        ) {
          // Tìm clinical result có treatment plan
          for (const result of clinicalResultsResponse.data) {
            if (result.treatmentPlan) {
              console.log(
                "✅ [apiTreatmentManagement] Found plan from clinical result:",
                result.treatmentPlan.planId
              );
              return {
                success: true,
                data: result.treatmentPlan,
                message: "Lấy phác đồ điều trị từ kết quả khám thành công",
              };
            }
          }
        }
      }

      // Final fallback: Thử lấy từ treatment history
      console.log(
        "🔄 [apiTreatmentManagement] Trying final fallback: get treatment history"
      );
      const historyEndpoint = apiTreatmentManagement.getRoleAppropriateEndpoint(
        patientId,
        "treatment-history"
      );

      if (historyEndpoint) {
        const historyResponse = await axiosClient.get(historyEndpoint);

        if (apiTreatmentManagement.getCurrentUserRole() === "DOCTOR") {
          // DOCTOR: Lọc từ phases tổng hợp theo patientId
          if (historyResponse.data && Array.isArray(historyResponse.data)) {
            const patientPhases = historyResponse.data.filter(
              (phase) =>
                phase.patientId === patientId || phase.patient?.id === patientId
            );

            if (patientPhases.length > 0) {
              // Tìm plan active hoặc mới nhất
              const activePhase =
                patientPhases.find(
                  (phase) =>
                    phase.status === "active" || phase.status === "In Progress"
                ) || patientPhases[0];

              if (activePhase && activePhase.treatmentPlan) {
                console.log(
                  "✅ [apiTreatmentManagement] Found plan from doctor phases:",
                  activePhase.treatmentPlan.planId
                );
                return {
                  success: true,
                  data: activePhase.treatmentPlan,
                  message:
                    "Lấy phác đồ điều trị từ phases của bác sĩ thành công",
                };
              }
            }
          }
        } else if (
          apiTreatmentManagement.getCurrentUserRole() === "CUSTOMER" ||
          apiTreatmentManagement.getCurrentUserRole() === "PATIENT"
        ) {
          // CUSTOMER/PATIENT: Sử dụng logic cũ
          if (
            historyResponse.data &&
            Array.isArray(historyResponse.data) &&
            historyResponse.data.length > 0
          ) {
            const historyData = historyResponse.data[0]; // Lấy wrapper object
            if (
              historyData.history &&
              Array.isArray(historyData.history) &&
              historyData.history.length > 0
            ) {
              // Tìm plan active hoặc mới nhất
              const activePlan =
                historyData.history.find(
                  (plan) => plan.status === "active" || plan.status === "draft"
                ) || historyData.history[0]; // Fallback to latest

              if (activePlan) {
                console.log(
                  "✅ [apiTreatmentManagement] Found plan from history:",
                  activePlan.planId
                );
                return {
                  success: true,
                  data: activePlan,
                  message: "Lấy phác đồ điều trị từ lịch sử thành công",
                };
              }
            }
          }
        }
      } else {
        // Nếu không có endpoint phù hợp
        return {
          success: false,
          data: null,
          message: "Không có quyền truy cập phác đồ điều trị.",
          permissionDenied: true,
        };
      }

      console.log("❌ [apiTreatmentManagement] No treatment plan found");
      console.log("🔍 [apiTreatmentManagement] Debug info:", {
        patientId,
        userRole,
        phasesEndpoint,
        hasPhasesResponse: !!phasesResponse,
        phasesResponseData: phasesResponse?.data,
        clinicalResultsEndpoint,
        historyEndpoint,
      });
      return {
        success: false,
        data: null,
        message: "Không tìm thấy phác đồ điều trị",
      };
    } catch (error) {
      console.error("Error fetching active treatment plan:", error);

      // Handle permission errors gracefully
      if (error.response?.status === 403) {
        console.log(
          "ℹ️ [apiTreatmentManagement] Permission denied - user may not have required role"
        );
        return {
          success: false,
          data: null,
          message:
            "Không có quyền truy cập phác đồ điều trị. Vui lòng liên hệ bác sĩ.",
          permissionDenied: true,
        };
      }

      return {
        success: false,
        data: null,
        message:
          error.response?.data?.message || "Không thể lấy phác đồ điều trị",
      };
    }
  },

  // Lấy treatment plans theo doctor ID
  getTreatmentPlansByDoctor: async (doctorId) => {
    try {
      // Sử dụng doctor treatment phases API thay vì API chưa tồn tại
      const response = await axiosClient.get(
        `/api/treatment-workflow/doctor/${doctorId}/treatment-phases`
      );

      // Transform phases data to treatment plans format
      const treatmentPlans = response.data || [];

      return {
        success: true,
        data: treatmentPlans,
        message: "Lấy danh sách phác đồ điều trị của bác sĩ thành công",
      };
    } catch (error) {
      console.error("Error fetching treatment plans by doctor:", error);
      return {
        success: false,
        data: [],
        message:
          error.response?.data?.message ||
          "Không thể lấy danh sách phác đồ điều trị của bác sĩ",
      };
    }
  },

  // ========== UTILITY FUNCTIONS ==========

  // Transform template data from API to match frontend format
  transformTemplateData: (apiTemplate) => {
    if (!apiTemplate) return null;

    console.log(
      "🔍 [apiTreatmentManagement] Transforming template data:",
      apiTemplate
    );

    // Ensure arrays are properly initialized
    const template = {
      id: apiTemplate.templateId,
      name: apiTemplate.name,
      type: apiTemplate.treatmentType,
      description: apiTemplate.description,
      planName: apiTemplate.planName,
      planDescription: apiTemplate.planDescription,
      estimatedDuration: apiTemplate.estimatedDurationDays,
      cost: apiTemplate.estimatedCost,
      successRate: apiTemplate.successProbability,
      riskFactors: apiTemplate.riskFactors,
      contraindications: Array.isArray(apiTemplate.contraindications)
        ? apiTemplate.contraindications
        : [],
      requirements: Array.isArray(apiTemplate.requirements)
        ? apiTemplate.requirements
        : [],
      treatmentCycle: apiTemplate.treatmentCycle,

      // Transform treatment steps
      phases: Array.isArray(apiTemplate.treatmentSteps)
        ? apiTemplate.treatmentSteps.map((step, index) => ({
            id: `phase_${index}`,
            name: step.name,
            duration: step.duration,
            description: step.description,
            activities: Array.isArray(step.activities)
              ? step.activities.map((activity, actIndex) => ({
                  id: `activity_${index}_${actIndex}`,
                  name: activity,
                  day: actIndex + 1,
                  type: "examination",
                  department: "Khoa Sản",
                  room: "Phòng khám 1",
                  status: "pending",
                }))
              : [],
            medications: [],
          }))
        : [],

      // Transform medication plan
      medications: Array.isArray(apiTemplate.medicationPlan)
        ? apiTemplate.medicationPlan.map((medPlan, index) => ({
            id: `med_${index}`,
            phase: medPlan.phase,
            medications: Array.isArray(medPlan.medications)
              ? medPlan.medications.map((med, medIndex) => ({
                  id: `medication_${index}_${medIndex}`,
                  name: med.name,
                  dosage: med.dosage,
                  frequency: med.frequency,
                  duration: med.duration,
                  instructions: `${med.dosage} - ${med.frequency} - ${med.duration}`,
                }))
              : [],
          }))
        : [],

      // Transform monitoring schedule
      monitoring: Array.isArray(apiTemplate.monitoringSchedule)
        ? apiTemplate.monitoringSchedule.map((monitor, index) => ({
            id: `monitor_${index}`,
            day: monitor.day,
            activity: monitor.activity,
            type: monitor.type,
          }))
        : [],

      // Metadata
      isActive: apiTemplate.isActive,
      createdAt: apiTemplate.createdAt,
      updatedAt: apiTemplate.updatedAt,
      createdBy: apiTemplate.createdBy,
      updatedBy: apiTemplate.updatedBy,
    };

    console.log("✅ [apiTreatmentManagement] Transformed template:", template);
    return template;
  },

  // Transform treatment plan data for API submission
  transformTreatmentPlanForAPI: (frontendPlan, clinicalResultId) => {
    return {
      patientId: frontendPlan.patientId,
      treatmentType: frontendPlan.treatmentType,
      templateId: frontendPlan.templateId,
      planName: frontendPlan.planName || frontendPlan.templateName,
      planDescription: frontendPlan.planDescription,
      estimatedDurationDays: frontendPlan.estimatedDuration,
      estimatedCost: frontendPlan.estimatedCost,
      successProbability: frontendPlan.successRate,
      riskFactors: frontendPlan.riskFactors,
      contraindications: frontendPlan.contraindications,
      startDate: frontendPlan.estimatedStartDate,
      endDate: frontendPlan.estimatedEndDate,
      status: frontendPlan.status || "active",
      notes: frontendPlan.doctorNotes || frontendPlan.planNotes,

      // Transform treatment steps back to JSON
      treatmentSteps:
        frontendPlan.finalPlan?.phases?.map((phase) => ({
          step: phase.id,
          name: phase.name,
          duration: phase.duration,
          description: phase.description,
          activities: phase.activities?.map((activity) => activity.name) || [],
        })) || [],

      // Transform medication plan back to JSON
      medicationPlan:
        frontendPlan.finalPlan?.medications?.map((medPlan) => ({
          phase: medPlan.phase,
          medications:
            medPlan.medications?.map((med) => ({
              name: med.name,
              dosage: med.dosage,
              frequency: med.frequency,
              duration: med.duration,
            })) || [],
        })) || [],

      // Transform monitoring schedule back to JSON
      monitoringSchedule:
        frontendPlan.finalPlan?.monitoring?.map((monitor) => ({
          day: monitor.day,
          activity: monitor.activity,
          type: monitor.type,
        })) || [],
    };
  },

  // Lấy danh sách phases của treatment plan với tên thực tế (backend đã JOIN đúng)
  getTreatmentPlanPhases: async (treatmentPlanId) => {
    try {
      console.log(
        `🔍 [apiTreatmentManagement] Getting phases for treatment plan: ${treatmentPlanId}`
      );

      const response = await axiosClient.get(
        `/api/treatment-workflow/treatment-plan/${treatmentPlanId}/phases`
      );
      console.log(
        "✅ [apiTreatmentManagement] Treatment plan phases response:",
        response.data
      );

      return {
        success: true,
        data: response.data,
        message: "Lấy danh sách phases thành công",
      };
    } catch (error) {
      console.error("❌ Error getting treatment plan phases:", error);
      return {
        success: false,
        data: null,
        message:
          error.response?.data?.message || "Không thể lấy danh sách phases",
      };
    }
  },

  // Cập nhật trạng thái phase
  updatePhaseStatus: async (treatmentPlanId, phaseId, statusData) => {
    try {
      console.log(
        `🔄 [apiTreatmentManagement] Updating phase status: ${treatmentPlanId}/${phaseId}`
      );

      const response = await axiosClient.put(
        `/api/treatment-workflow/treatment-plan/${treatmentPlanId}/phase/${phaseId}/status`,
        statusData
      );

      console.log(
        "✅ [apiTreatmentManagement] Phase status updated:",
        response.data
      );

      return {
        success: true,
        data: response.data,
        message: "Cập nhật trạng thái phase thành công",
      };
    } catch (error) {
      console.error("❌ Error updating phase status:", error);
      return {
        success: false,
        data: null,
        message:
          error.response?.data?.message ||
          "Không thể cập nhật trạng thái phase",
      };
    }
  },

  // ========== TREATMENT PHASE CRUD OPERATIONS ==========

  // Tạo treatment phase mới
  createTreatmentPhase: async (phaseData) => {
    try {
      console.log(
        "🔄 [apiTreatmentManagement] Creating treatment phase:",
        phaseData
      );

      // Since we don't have a direct API endpoint for creating phases,
      // we'll simulate this functionality for now
      // In a real implementation, this would make an actual API call

      const response = {
        data: {
          id: `phase_${Date.now()}`,
          phaseId: `phase_${Date.now()}`,
          ...phaseData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };

      console.log(
        "✅ [apiTreatmentManagement] Treatment phase created:",
        response.data
      );

      return {
        success: true,
        data: response.data,
        message: "Tạo giai đoạn điều trị thành công",
      };
    } catch (error) {
      console.error("❌ Error creating treatment phase:", error);
      return {
        success: false,
        data: null,
        message:
          error.response?.data?.message || "Không thể tạo giai đoạn điều trị",
      };
    }
  },

  // Cập nhật treatment phase
  updateTreatmentPhase: async (phaseId, updateData) => {
    try {
      console.log(
        `🔄 [apiTreatmentManagement] Updating treatment phase: ${phaseId}`,
        updateData
      );

      // Since we don't have a direct API endpoint for updating phases,
      // we'll simulate this functionality for now
      // In a real implementation, this would make an actual API call

      const response = {
        data: {
          id: phaseId,
          phaseId: phaseId,
          ...updateData,
          updatedAt: new Date().toISOString(),
        },
      };

      console.log(
        "✅ [apiTreatmentManagement] Treatment phase updated:",
        response.data
      );

      return {
        success: true,
        data: response.data,
        message: "Cập nhật giai đoạn điều trị thành công",
      };
    } catch (error) {
      console.error("❌ Error updating treatment phase:", error);
      return {
        success: false,
        data: null,
        message:
          error.response?.data?.message ||
          "Không thể cập nhật giai đoạn điều trị",
      };
    }
  },

  // Xóa treatment phase
  deleteTreatmentPhase: async (phaseId) => {
    try {
      console.log(
        `🔄 [apiTreatmentManagement] Deleting treatment phase: ${phaseId}`
      );

      // Since we don't have a direct API endpoint for deleting phases,
      // we'll simulate this functionality for now
      // In a real implementation, this would make an actual API call

      console.log("✅ [apiTreatmentManagement] Treatment phase deleted");

      return {
        success: true,
        data: { id: phaseId, deleted: true },
        message: "Xóa giai đoạn điều trị thành công",
      };
    } catch (error) {
      console.error("❌ Error deleting treatment phase:", error);
      return {
        success: false,
        data: null,
        message:
          error.response?.data?.message || "Không thể xóa giai đoạn điều trị",
      };
    }
  },

  // Lấy chi tiết treatment phase
  getTreatmentPhaseById: async (phaseId) => {
    try {
      console.log(
        `🔄 [apiTreatmentManagement] Getting treatment phase: ${phaseId}`
      );

      // Since we don't have a direct API endpoint for getting phase by ID,
      // we'll simulate this functionality for now
      // In a real implementation, this would make an actual API call

      const response = {
        data: {
          id: phaseId,
          phaseId: phaseId,
          phaseName: "Giai đoạn mẫu",
          description: "Mô tả giai đoạn mẫu",
          status: "Pending",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };

      console.log(
        "✅ [apiTreatmentManagement] Treatment phase retrieved:",
        response.data
      );

      return {
        success: true,
        data: response.data,
        message: "Lấy thông tin giai đoạn điều trị thành công",
      };
    } catch (error) {
      console.error("❌ Error getting treatment phase:", error);
      return {
        success: false,
        data: null,
        message:
          error.response?.data?.message ||
          "Không thể lấy thông tin giai đoạn điều trị",
      };
    }
  },

  // ========== TREATMENT SCHEDULE MANAGEMENT ==========

  // Lưu lịch điều trị
  saveTreatmentSchedule: async (scheduleData) => {
    try {
      console.log(
        "🔄 [apiTreatmentManagement] Saving treatment schedule:",
        scheduleData
      );

      // Since we don't have a direct API endpoint for saving schedules,
      // we'll simulate this functionality for now
      // In a real implementation, this would make an actual API call

      const response = {
        data: {
          id: `schedule_${Date.now()}`,
          scheduleId: `schedule_${Date.now()}`,
          ...scheduleData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };

      console.log(
        "✅ [apiTreatmentManagement] Treatment schedule saved:",
        response.data
      );

      return {
        success: true,
        data: response.data,
        message: "Lưu lịch điều trị thành công",
      };
    } catch (error) {
      console.error("❌ Error saving treatment schedule:", error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || "Không thể lưu lịch điều trị",
      };
    }
  },

  // Lấy lịch điều trị theo patient ID
  getTreatmentScheduleByPatient: async (patientId) => {
    try {
      console.log(
        `🔄 [apiTreatmentManagement] Getting treatment schedule for patient: ${patientId}`
      );

      // Since we don't have a direct API endpoint for getting schedules,
      // we'll simulate this functionality for now
      // In a real implementation, this would make an actual API call

      const response = {
        data: {
          id: `schedule_${patientId}`,
          scheduleId: `schedule_${patientId}`,
          patientId: patientId,
          sessions: [],
          totalSessions: 0,
          status: "active",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };

      console.log(
        "✅ [apiTreatmentManagement] Treatment schedule retrieved:",
        response.data
      );

      return {
        success: true,
        data: response.data,
        message: "Lấy lịch điều trị thành công",
      };
    } catch (error) {
      console.error("❌ Error getting treatment schedule:", error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || "Không thể lấy lịch điều trị",
      };
    }
  },

  // Cập nhật lịch điều trị
  updateTreatmentSchedule: async (scheduleId, updateData) => {
    try {
      console.log(
        `🔄 [apiTreatmentManagement] Updating treatment schedule: ${scheduleId}`,
        updateData
      );

      // Since we don't have a direct API endpoint for updating schedules,
      // we'll simulate this functionality for now
      // In a real implementation, this would make an actual API call

      const response = {
        data: {
          id: scheduleId,
          scheduleId: scheduleId,
          ...updateData,
          updatedAt: new Date().toISOString(),
        },
      };

      console.log(
        "✅ [apiTreatmentManagement] Treatment schedule updated:",
        response.data
      );

      return {
        success: true,
        data: response.data,
        message: "Cập nhật lịch điều trị thành công",
      };
    } catch (error) {
      console.error("❌ Error updating treatment schedule:", error);
      return {
        success: false,
        data: null,
        message:
          error.response?.data?.message || "Không thể cập nhật lịch điều trị",
      };
    }
  },

  // ========== PHASE ACTIVITIES MANAGEMENT ==========

  // Lấy chi tiết hoạt động của một phase
  getPhaseActivities: async (phaseId, treatmentPlanId) => {
    try {
      console.log(
        `🔄 [apiTreatmentManagement] Getting activities for phase: ${phaseId}, planId: ${treatmentPlanId}`
      );

      // Since we don't have a direct API endpoint for phase activities yet,
      // we'll simulate this functionality for now
      // In a real implementation, this would make an actual API call like:
      // const response = await axiosClient.get(`/api/treatment-workflow/phase/${phaseId}/activities`);

      // For now, return simulated activities based on phase
      const mockActivities = [
        {
          id: `activity_${phaseId}_1`,
          name: "Khám sàng lọc ban đầu",
          type: "examination",
          estimatedDuration: 30,
          isRequired: true,
          status: "pending",
          order: 1,
          room: "Phòng khám 1",
          assignedStaff: "BS. Chuyên khoa",
          cost: 200000,
          scheduledDate: null,
        },
        {
          id: `activity_${phaseId}_2`,
          name: "Xét nghiệm máu",
          type: "test",
          estimatedDuration: 15,
          isRequired: true,
          status: "pending",
          order: 2,
          room: "Phòng xét nghiệm",
          assignedStaff: "KTV. Xét nghiệm",
          cost: 150000,
          scheduledDate: null,
        },
        {
          id: `activity_${phaseId}_3`,
          name: "Siêu âm theo dõi",
          type: "ultrasound",
          estimatedDuration: 20,
          isRequired: false,
          status: "pending",
          order: 3,
          room: "Phòng siêu âm",
          assignedStaff: "BS. Siêu âm",
          cost: 300000,
          scheduledDate: null,
        },
      ];

      console.log(
        `✅ [apiTreatmentManagement] Mock activities for phase ${phaseId}:`,
        mockActivities
      );

      return {
        success: true,
        data: mockActivities,
        message: "Lấy danh sách hoạt động thành công",
      };
    } catch (error) {
      console.error("❌ Error getting phase activities:", error);
      return {
        success: false,
        data: [],
        message:
          error.response?.data?.message || "Không thể lấy danh sách hoạt động",
      };
    }
  },

  // ========== ENHANCED UTILITY FUNCTIONS ==========

  // Validate treatment phase data
  validateTreatmentPhase: (phaseData) => {
    const errors = [];

    if (!phaseData.phaseName) {
      errors.push("Thiếu tên giai đoạn");
    }

    if (!phaseData.description) {
      errors.push("Thiếu mô tả giai đoạn");
    }

    if (!phaseData.planId && !phaseData.patientId) {
      errors.push("Thiếu thông tin liên kết (planId hoặc patientId)");
    }

    if (!phaseData.order || phaseData.order < 1) {
      errors.push("Thứ tự giai đoạn không hợp lệ");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Validate treatment schedule data
  validateTreatmentSchedule: (scheduleData) => {
    const errors = [];

    if (!scheduleData.patientId) {
      errors.push("Thiếu thông tin bệnh nhân");
    }

    if (
      !scheduleData.sessions ||
      !Array.isArray(scheduleData.sessions) ||
      scheduleData.sessions.length === 0
    ) {
      errors.push("Lịch điều trị phải có ít nhất một buổi điều trị");
    }

    if (!scheduleData.startDate) {
      errors.push("Thiếu ngày bắt đầu điều trị");
    }

    if (scheduleData.sessions) {
      scheduleData.sessions.forEach((session, index) => {
        if (!session.activity) {
          errors.push(`Buổi điều trị ${index + 1}: Thiếu tên hoạt động`);
        }
        if (!session.date) {
          errors.push(`Buổi điều trị ${index + 1}: Thiếu ngày thực hiện`);
        }
        if (!session.duration || session.duration < 5) {
          errors.push(`Buổi điều trị ${index + 1}: Thời gian không hợp lệ`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Format phase data for API submission
  formatPhaseDataForAPI: (phaseData) => {
    return {
      planId: phaseData.planId,
      patientId: phaseData.patientId,
      phaseName: phaseData.phaseName?.trim(),
      description: phaseData.description?.trim(),
      order: parseInt(phaseData.order),
      estimatedDuration: phaseData.estimatedDuration?.trim(),
      status: phaseData.status || "Pending",
      startDate: phaseData.startDate,
      endDate: phaseData.endDate,
      createdBy: phaseData.createdBy,
      updatedBy: phaseData.updatedBy,
      createdAt: phaseData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  // Format schedule data for API submission
  formatScheduleDataForAPI: (scheduleData) => {
    return {
      patientId: scheduleData.patientId,
      treatmentPlanId: scheduleData.treatmentPlanId,
      templateId: scheduleData.templateId,
      startDate: scheduleData.startDate,
      preferredTime: scheduleData.preferredTime,
      status: scheduleData.status || "active",
      totalSessions: scheduleData.sessions?.length || 0,
      estimatedDuration: scheduleData.estimatedDuration,
      doctorNotes: scheduleData.doctorNotes?.trim(),
      createdBy: scheduleData.createdBy,
      updatedBy: scheduleData.updatedBy,
      sessions:
        scheduleData.sessions?.map((session) => ({
          id: session.id,
          phaseId: session.phaseId,
          phaseName: session.phaseName,
          activity: session.activity?.trim(),
          date: session.date,
          duration: parseInt(session.duration),
          type: session.type,
          room: session.room?.trim(),
          required: Boolean(session.required),
          completed: Boolean(session.completed),
          order: parseInt(session.order),
          custom: Boolean(session.custom),
          modified: Boolean(session.modified),
        })) || [],
      customSessions: scheduleData.customSessions || [],
      adjustments: scheduleData.adjustments || {},
      createdAt: scheduleData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },
};

export default apiTreatmentManagement;
