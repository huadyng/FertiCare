import axiosClient from "./axiosClient";

const apiDoctor = {
  // =================== DOCTOR PROFILE ===================
  getMyProfile: async () => {
    try {
      console.log("🔍 [apiDoctor] Lấy profile bác sĩ...");
      const response = await axiosClient.get("/api/profiles/doctor/me");
      console.log("✅ [apiDoctor] Profile bác sĩ:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ [apiDoctor] Lỗi lấy profile:", error);
      throw error;
    }
  },

  updateMyProfile: async (profileData) => {
    try {
      console.log("🔄 [apiDoctor] Cập nhật profile bác sĩ...", profileData);
      const response = await axiosClient.put(
        "/api/profiles/doctor/me",
        profileData
      );
      console.log("✅ [apiDoctor] Cập nhật thành công:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ [apiDoctor] Lỗi cập nhật profile:", error);
      throw error;
    }
  },

  // =================== DASHBOARD STATISTICS ===================
  getDashboardStats: async () => {
    try {
      console.log("📊 [apiDoctor] Lấy thống kê dashboard...");

      // Lấy danh sách bệnh nhân trước để có dữ liệu cơ bản
      const patientsResponse = await apiDoctor.getMyPatients();
      const patients = patientsResponse || [];

      // Lấy doctorId từ localStorage
      const user = localStorage.getItem("user");
      let doctorId = null;

      if (user) {
        try {
          const userData = JSON.parse(user);
          doctorId = userData.id;
        } catch (e) {
          console.error("❌ [apiDoctor] Lỗi parse user data:", e);
        }
      }

      // Tính toán thống kê cơ bản từ danh sách bệnh nhân
      const totalPatients = patients.length;

      // Thử lấy thêm dữ liệu từ treatment phases nếu có
      let treatmentPhases = [];
      if (doctorId) {
        try {
          const phasesResponse = await axiosClient.get(
            `/api/treatment-workflow/doctor/${doctorId}/treatment-phases`
          );
          treatmentPhases = phasesResponse.data || [];
          console.log(
            "✅ [apiDoctor] Treatment phases loaded:",
            treatmentPhases.length
          );
        } catch (error) {
          console.warn(
            "⚠️ [apiDoctor] Không thể lấy treatment phases:",
            error.message
          );
        }
      }

      // Tính toán thống kê chi tiết
      const today = new Date().toDateString();

      // Lịch hẹn hôm nay (từ treatment phases hoặc appointments)
      const todayAppointments = treatmentPhases.filter(
        (phase) =>
          phase.startDate && new Date(phase.startDate).toDateString() === today
      ).length;

      // Bệnh nhân đang điều trị (có treatment plan active)
      const inTreatment = treatmentPhases.filter(
        (phase) => phase.status === "In Progress"
      ).length;

      // Bệnh nhân đã hoàn thành điều trị
      const completed = treatmentPhases.filter(
        (phase) => phase.status === "Completed"
      ).length;

      // Tính tỉ lệ thành công
      const totalPhases = treatmentPhases.length;
      const successRate =
        totalPhases > 0 ? Math.round((completed / totalPhases) * 100) : 0;

      // Nếu không có treatment phases, tính toán từ profile status của patients
      let fallbackInTreatment = 0;
      let fallbackCompleted = 0;

      if (totalPhases === 0 && patients.length > 0) {
        patients.forEach((patient) => {
          if (
            patient.status === "active" ||
            patient.profileStatus === "active"
          ) {
            fallbackInTreatment++;
          } else if (
            patient.status === "completed" ||
            patient.profileStatus === "completed"
          ) {
            fallbackCompleted++;
          }
        });
      }

      const stats = {
        totalPatients: totalPatients,
        todayAppointments: todayAppointments,
        inTreatment: totalPhases > 0 ? inTreatment : fallbackInTreatment,
        completed: totalPhases > 0 ? completed : fallbackCompleted,
        successRate:
          totalPhases > 0
            ? successRate
            : totalPatients > 0
            ? Math.round((fallbackCompleted / totalPatients) * 100)
            : 0,
      };

      console.log("✅ [apiDoctor] Thống kê dashboard:", stats);
      return stats;
    } catch (error) {
      console.warn(
        "⚠️ [apiDoctor] Không thể lấy thống kê, sử dụng dữ liệu mặc định:",
        error.message
      );

      // Trả về thống kê mặc định thay vì throw error
      const defaultStats = {
        totalPatients: 0,
        todayAppointments: 0,
        inTreatment: 0,
        completed: 0,
        successRate: 0,
      };

      console.log("✅ [apiDoctor] Sử dụng thống kê mặc định:", defaultStats);
      return defaultStats;
    }
  },

  // =================== PATIENT MANAGEMENT ===================
  getMyPatients: async () => {
    try {
      console.log("👥 [apiDoctor] Lấy danh sách bệnh nhân...");
      const response = await axiosClient.get(
        "/api/doctor/schedule/my-patients"
      );
      console.log("✅ [apiDoctor] Danh sách bệnh nhân:", response.data);

      // Transform data từ API response thành format mong muốn
      const patients = response.data.patients.map((patient) => ({
        id: patient.patientId,
        fullName: patient.fullName,
        age: patient.dateOfBirth
          ? new Date().getFullYear() -
            new Date(patient.dateOfBirth).getFullYear()
          : null,
        gender: patient.gender,
        dateOfBirth: patient.dateOfBirth,
        phone: patient.phone,
        email: patient.email,
        status: patient.profileStatus || "active",
        treatmentType: "IVF", // Có thể lấy từ treatment plan sau
        nextAppointment: patient.latestAppointment,
        progress: apiDoctor.calculateProgressFromPhase(patient.profileStatus),
        servicePackage: "IVF_PREMIUM", // Có thể lấy từ treatment plan sau
        createdAt: patient.latestAppointment,
        appointmentCount: patient.appointmentCount,
        latestAppointmentStatus: patient.latestAppointmentStatus,
        maritalStatus: patient.maritalStatus,
        healthBackground: patient.healthBackground,
        notes: patient.notes,
        avatarUrl: patient.avatarUrl,
        address: patient.address,
      }));

      return patients;
    } catch (error) {
      console.error("❌ [apiDoctor] Lỗi lấy danh sách bệnh nhân:", error);
      throw error;
    }
  },

  getPatientDetails: async (patientId) => {
    try {
      console.log(`👤 [apiDoctor] Lấy chi tiết bệnh nhân ${patientId}...`);
      const response = await axiosClient.get(`/api/patients/${patientId}`);
      console.log("✅ [apiDoctor] Chi tiết bệnh nhân:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ [apiDoctor] Lỗi lấy chi tiết bệnh nhân:", error);
      throw error;
    }
  },

  // =================== APPOINTMENTS ===================
  getTodayAppointments: async () => {
    try {
      console.log("📅 [apiDoctor] Lấy lịch hẹn hôm nay...");

      // Lấy doctorId từ localStorage
      const user = localStorage.getItem("user");
      let doctorId = null;

      if (user) {
        try {
          const userData = JSON.parse(user);
          doctorId = userData.id || userData.userId;
          console.log("🔍 [apiDoctor] User data:", userData);
          console.log("🔍 [apiDoctor] DoctorId:", doctorId);
        } catch (e) {
          console.error("❌ [apiDoctor] Lỗi parse user data:", e);
        }
      }

      // Thử lấy appointments từ treatment phases trước
      let todayAppointments = [];
      if (doctorId) {
        try {
          const response = await axiosClient.get(
            `/api/treatment-workflow/doctor/${doctorId}/treatment-phases`
          );
          const phases = response.data || [];
          console.log("✅ [apiDoctor] Treatment phases loaded:", phases.length);

          // Lọc phases hôm nay
          const today = new Date().toDateString();
          const todayPhases = phases.filter(
            (phase) =>
              phase.startDate &&
              new Date(phase.startDate).toDateString() === today
          );

          // Transform thành format lịch hẹn
          todayAppointments = todayPhases.map((phase) => ({
            id: phase.phaseId || `phase-${Date.now()}`,
            time: phase.startDate
              ? new Date(phase.startDate).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "09:00",
            patientName: `Bệnh nhân ${phase.patientId}`,
            service: phase.phaseName || "Khám lâm sàng",
            status: phase.status || "Scheduled",
            type: "Treatment",
            notes: phase.description || "",
          }));
        } catch (error) {
          console.warn(
            "⚠️ [apiDoctor] Không thể lấy treatment phases:",
            error.message
          );
        }
      }

      // Nếu không có appointments từ treatment phases, tạo dữ liệu mẫu từ patients
      if (todayAppointments.length === 0) {
        try {
          const patientsResponse = await apiDoctor.getMyPatients();
          const patients = patientsResponse || [];

          // Tạo lịch hẹn mẫu cho 2-3 bệnh nhân đầu tiên
          const sampleTimes = ["09:00", "10:30", "14:00"];
          todayAppointments = patients.slice(0, 3).map((patient, index) => ({
            id: `appointment-${patient.id}-${Date.now()}`,
            time: sampleTimes[index] || "09:00",
            patientName: patient.fullName || `Bệnh nhân ${patient.id}`,
            service: "Khám lâm sàng",
            status: "Scheduled",
            type: "Consultation",
            notes: "Lịch hẹn khám định kỳ",
          }));
        } catch (error) {
          console.warn(
            "⚠️ [apiDoctor] Không thể tạo appointments mẫu:",
            error.message
          );
        }
      }

      console.log("✅ [apiDoctor] Lịch hẹn hôm nay:", todayAppointments.length);
      return todayAppointments;
    } catch (error) {
      console.warn(
        "⚠️ [apiDoctor] Không thể lấy lịch hẹn, sử dụng dữ liệu mặc định:",
        error.message
      );

      // Trả về lịch hẹn mẫu thay vì throw error
      const defaultAppointments = [
        {
          id: "default-1",
          time: "09:00",
          patientName: "Bệnh nhân mẫu 1",
          service: "Khám lâm sàng",
          status: "Scheduled",
          type: "Consultation",
          notes: "Lịch hẹn khám định kỳ",
        },
        {
          id: "default-2",
          time: "10:30",
          patientName: "Bệnh nhân mẫu 2",
          service: "Tư vấn điều trị",
          status: "Scheduled",
          type: "Consultation",
          notes: "Tư vấn phác đồ điều trị",
        },
      ];

      console.log(
        "✅ [apiDoctor] Sử dụng lịch hẹn mặc định:",
        defaultAppointments.length
      );
      return defaultAppointments;
    }
  },

  getMySchedule: async () => {
    try {
      console.log("📋 [apiDoctor] Lấy lịch trình bác sĩ...");
      const response = await axiosClient.get("/api/doctor/schedule");
      console.log("✅ [apiDoctor] Lịch trình:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ [apiDoctor] Lỗi lấy lịch trình:", error);
      throw error;
    }
  },

  // =================== TREATMENT MANAGEMENT ===================
  createTreatmentPlan: async (treatmentData) => {
    try {
      console.log("📝 [apiDoctor] Tạo phác đồ điều trị...", treatmentData);
      const response = await axiosClient.post(
        "/api/treatment-plans",
        treatmentData
      );
      console.log("✅ [apiDoctor] Tạo phác đồ thành công:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ [apiDoctor] Lỗi tạo phác đồ:", error);
      throw error;
    }
  },

  updateTreatmentProgress: async (patientId, progressData) => {
    try {
      console.log(
        `🔄 [apiDoctor] Cập nhật tiến độ điều trị cho bệnh nhân ${patientId}...`
      );
      const response = await axiosClient.put(
        `/api/treatment-plans/${patientId}/progress`,
        progressData
      );
      console.log("✅ [apiDoctor] Cập nhật tiến độ thành công:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ [apiDoctor] Lỗi cập nhật tiến độ:", error);
      throw error;
    }
  },

  // Lấy tiến độ điều trị của bệnh nhân
  getTreatmentProgress: async (patientId) => {
    try {
      console.log(
        `📊 [apiDoctor] Lấy tiến độ điều trị của bệnh nhân ${patientId}...`
      );

      // Lấy doctorId từ localStorage
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      const doctorId = user?.id || user?.userId;

      console.log("🔍 [apiDoctor] User data:", user);
      console.log("🔍 [apiDoctor] DoctorId:", doctorId);

      if (!doctorId) {
        console.warn(
          "⚠️ [apiDoctor] Không tìm thấy doctorId, sử dụng dữ liệu mặc định"
        );
        // Trả về dữ liệu mặc định thay vì throw error
        const defaultProgress = {
          data: {
            totalSessions: 12,
            completedSessions: 0,
            upcomingSessions: 12,
            currentPhase: "Chưa bắt đầu",
            phaseProgress: 0,
            overallProgress: 0,
            lastUpdated: new Date().toLocaleDateString("vi-VN"),
            recentActivities: [],
          },
        };
        return defaultProgress;
      }

      // Gọi API cho bác sĩ để lấy tất cả treatment phases
      let response;
      try {
        response = await axiosClient.get(
          `/api/treatment-workflow/doctor/${doctorId}/treatment-phases`
        );
        console.log("✅ [apiDoctor] Tất cả treatment phases:", response.data);
      } catch (apiError) {
        console.warn(
          "⚠️ [apiDoctor] Không thể lấy treatment phases từ API:",
          apiError.message
        );
        // Trả về dữ liệu mặc định thay vì throw error
        const defaultProgress = {
          data: {
            totalSessions: 12,
            completedSessions: 0,
            upcomingSessions: 12,
            currentPhase: "Chưa bắt đầu",
            phaseProgress: 0,
            overallProgress: 0,
            lastUpdated: new Date().toLocaleDateString("vi-VN"),
            recentActivities: [],
          },
        };
        return defaultProgress;
      }

      // Lọc phases cho patientId cụ thể
      const allPhases = response.data || [];
      const patientPhases = allPhases.filter(
        (phase) => phase.patientId === patientId
      );

      console.log("✅ [apiDoctor] Phases cho bệnh nhân:", patientPhases);

      // Xử lý dữ liệu từ backend để tạo progress object
      const totalPhases = patientPhases.length;
      const completedPhases = patientPhases.filter(
        (phase) => phase.status === "Completed"
      ).length;
      const inProgressPhases = patientPhases.filter(
        (phase) => phase.status === "In Progress"
      );
      const currentPhase =
        inProgressPhases.length > 0
          ? inProgressPhases[0].phaseName
          : completedPhases === totalPhases
          ? "Hoàn thành"
          : "Chưa bắt đầu";

      const overallProgress =
        totalPhases > 0 ? Math.round((completedPhases / totalPhases) * 100) : 0;

      const progressData = {
        data: {
          totalSessions: totalPhases,
          completedSessions: completedPhases,
          upcomingSessions: totalPhases - completedPhases,
          currentPhase: currentPhase,
          phaseProgress: inProgressPhases.length > 0 ? 50 : 0, // Giả sử phase đang thực hiện ở 50%
          overallProgress: overallProgress,
          lastUpdated: new Date().toLocaleDateString("vi-VN"),
          recentActivities: patientPhases.map((phase) => ({
            phase: phase.phaseName,
            status: phase.status,
            date:
              phase.startDate ||
              phase.endDate ||
              new Date().toLocaleDateString("vi-VN"),
          })),
          phases: patientPhases, // Thêm thông tin chi tiết về các phases
        },
      };

      return progressData;
    } catch (error) {
      console.warn(
        "⚠️ [apiDoctor] Không thể lấy tiến độ từ API, sử dụng dữ liệu mặc định:",
        error.message
      );

      // Trả về dữ liệu mặc định thay vì throw error
      const defaultProgress = {
        data: {
          totalSessions: 12,
          completedSessions: 0,
          upcomingSessions: 12,
          currentPhase: "Chưa bắt đầu",
          phaseProgress: 0,
          overallProgress: 0,
          lastUpdated: new Date().toLocaleDateString("vi-VN"),
          recentActivities: [],
        },
      };

      console.log("✅ [apiDoctor] Sử dụng tiến độ mặc định:", defaultProgress);
      return defaultProgress;
    }
  },

  // Lấy thông tin bệnh nhân
  getPatientInfo: async (patientId) => {
    try {
      console.log(`👤 [apiDoctor] Lấy thông tin bệnh nhân ${patientId}...`);

      // Thử API users trước (vì backend có /api/users)
      try {
        const response = await axiosClient.get(`/api/users/${patientId}`);
        console.log(
          "✅ [apiDoctor] Thông tin bệnh nhân từ /api/users:",
          response.data
        );
        return response.data;
      } catch (usersError) {
        console.warn(
          "⚠️ [apiDoctor] Không thể lấy từ /api/users, thử /api/users/role/CUSTOMER:",
          usersError.message
        );

        // Thử lấy danh sách users và tìm theo ID
        try {
          const allUsersResponse = await axiosClient.get(
            "/api/users/role/CUSTOMER"
          );
          const user = allUsersResponse.data.find(
            (u) => u.id === patientId || u.userId === patientId
          );
          if (user) {
            console.log("✅ [apiDoctor] Tìm thấy user trong danh sách:", user);
            return { data: user };
          }
        } catch (listError) {
          console.warn(
            "⚠️ [apiDoctor] Không thể lấy danh sách users:",
            listError.message
          );
        }

        throw usersError; // Re-throw để fallback
      }
    } catch (error) {
      console.warn(
        "⚠️ [apiDoctor] Không thể lấy thông tin bệnh nhân từ API:",
        error.message
      );

      // Trả về dữ liệu mặc định thay vì throw error
      const defaultPatientInfo = {
        data: {
          id: patientId,
          name: `Bệnh nhân ${patientId}`,
          gender: "unknown",
          age: null,
          contact: null,
          email: null,
          address: null,
          status: "active",
        },
      };

      console.log(
        "✅ [apiDoctor] Sử dụng thông tin bệnh nhân mặc định:",
        defaultPatientInfo
      );
      return defaultPatientInfo;
    }
  },

  // Lấy thông tin điều trị của bệnh nhân
  getPatientTreatmentPhases: async (patientId) => {
    try {
      console.log(
        `🏥 [apiDoctor] Lấy thông tin điều trị của bệnh nhân ${patientId}...`
      );
      const response = await axiosClient.get(
        `/api/treatment-workflow/patient/${patientId}/treatment-phases`
      );
      console.log("✅ [apiDoctor] Thông tin điều trị:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ [apiDoctor] Lỗi lấy thông tin điều trị:", error);
      throw error;
    }
  },

  // Lấy lịch sử điều trị của bệnh nhân
  getPatientTreatmentHistory: async (patientId) => {
    try {
      console.log(
        `📋 [apiDoctor] Lấy lịch sử điều trị của bệnh nhân ${patientId}...`
      );
      const response = await axiosClient.get(
        `/api/treatment-workflow/patient/${patientId}/treatment-history`
      );
      console.log("✅ [apiDoctor] Lịch sử điều trị:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ [apiDoctor] Lỗi lấy lịch sử điều trị:", error);
      throw error;
    }
  },

  // Lấy kết quả khám lâm sàng của bệnh nhân
  getPatientClinicalResults: async (patientId) => {
    try {
      console.log(
        `🏥 [apiDoctor] Lấy kết quả khám lâm sàng của bệnh nhân ${patientId}...`
      );
      const response = await axiosClient.get(
        `/api/clinical-results/patient/${patientId}`
      );
      console.log("✅ [apiDoctor] Kết quả khám lâm sàng:", response.data);
      return response.data;
    } catch (error) {
      console.warn(
        "⚠️ [apiDoctor] Không thể lấy kết quả khám từ API:",
        error.message
      );

      // Trả về dữ liệu mặc định thay vì throw error
      const defaultResults = [];
      console.log(
        "✅ [apiDoctor] Sử dụng kết quả khám mặc định:",
        defaultResults
      );
      return defaultResults;
    }
  },

  // Lấy kết quả khám lâm sàng của bệnh nhân
  getPatientClinicalResults: async (patientId) => {
    try {
      console.log(
        `🔬 [apiDoctor] Lấy kết quả khám lâm sàng của bệnh nhân ${patientId}...`
      );
      const response = await axiosClient.get(
        `/api/treatment-workflow/patient/${patientId}/clinical-results`
      );
      console.log("✅ [apiDoctor] Kết quả khám lâm sàng:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ [apiDoctor] Lỗi lấy kết quả khám lâm sàng:", error);
      throw error;
    }
  },

  // =================== UTILITY FUNCTIONS ===================
  transformPatientData: (rawPatient) => {
    // Transform API response to match UI expectations
    const transformed = {
      id: rawPatient.id || rawPatient.patientId,
      name:
        rawPatient.fullName ||
        rawPatient.name ||
        `Bệnh nhân ${rawPatient.id || rawPatient.patientId}`,
      fullName:
        rawPatient.fullName ||
        rawPatient.name ||
        `Bệnh nhân ${rawPatient.id || rawPatient.patientId}`,
      age:
        rawPatient.age ||
        (rawPatient.dateOfBirth
          ? new Date().getFullYear() -
            new Date(rawPatient.dateOfBirth).getFullYear()
          : 30), // Default age if not available
      gender: rawPatient.gender?.toLowerCase() || "unknown",
      dob: rawPatient.dateOfBirth,
      contact: rawPatient.phone || rawPatient.contact,
      email: rawPatient.email,
      status: rawPatient.status || rawPatient.profileStatus || "active",
      treatmentType:
        rawPatient.treatmentType || rawPatient.serviceName || "IVF",
      nextAppointment:
        rawPatient.nextAppointment || rawPatient.latestAppointment,
      progress:
        rawPatient.progress ||
        apiDoctor.calculateProgressFromPhase(
          rawPatient.status || rawPatient.profileStatus
        ),
      servicePackage:
        rawPatient.servicePackage || rawPatient.serviceName || "IVF_PREMIUM",
      createdAt: rawPatient.createdAt,
    };

    console.log("🔄 [apiDoctor] Transformed patient data:", transformed);
    return transformed;
  },

  // Helper function để tính progress từ profile status
  calculateProgressFromPhase: (status) => {
    switch (status) {
      case "pending":
        return 10;
      case "active":
        return 50;
      case "completed":
        return 100;
      case "cancelled":
        return 0;
      case "inactive":
        return 0;
      default:
        return 25; // Default progress for active patients
    }
  },
};

export default apiDoctor;
