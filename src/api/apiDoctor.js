import axiosClient from "../services/axiosClient";

const apiDoctor = {
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

  // Helper function to get doctor profile with fallback
  getDoctorProfileWithFallback: async (doctorId) => {
    console.log(`🔍 [apiDoctor] Getting doctor profile for: ${doctorId}`);

    try {
      // Use the correct endpoint for doctor profile
      console.log(
        `🔍 [apiDoctor] Using correct endpoint: /api/profiles/doctor/me`
      );
      const response = await axiosClient.get("/api/profiles/doctor/me");

      if (response.data) {
        console.log(`✅ [apiDoctor] Successfully loaded doctor profile`);
        return {
          success: true,
          data: response.data,
          message: "Lấy thông tin bác sĩ thành công",
        };
      }
    } catch (error) {
      console.warn(
        `⚠️ [apiDoctor] Failed to load doctor profile:`,
        error.message
      );

      // If it's a permission error, return appropriate message
      if (error.response?.status === 403) {
        console.log("ℹ️ [apiDoctor] Permission denied");
        return {
          success: false,
          data: null,
          message: "Không có quyền truy cập thông tin bác sĩ",
          permissionDenied: true,
        };
      }

      // If it's a 500 error, return default data
      if (error.response?.status === 500) {
        console.log("ℹ️ [apiDoctor] Server error, returning default data");
        return {
          success: true,
          data: {
            id: doctorId,
            specialty: "IUI",
            role: "DOCTOR",
            fullName: "Bác sĩ",
            email: "doctor@ferticare.com",
          },
          message: "Sử dụng thông tin bác sĩ mặc định do lỗi server",
        };
      }
    }

    // If all else fails, return default data
    console.log("ℹ️ [apiDoctor] All attempts failed, returning default data");
    return {
      success: true,
      data: {
        id: doctorId,
        specialty: "IUI",
        role: "DOCTOR",
        fullName: "Bác sĩ",
        email: "doctor@ferticare.com",
      },
      message: "Sử dụng thông tin bác sĩ mặc định",
    };
  },
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

      // Lấy treatment phases của bác sĩ (chứa thông tin planId)
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

      // 🆕 ĐANG ĐIỀU TRỊ: Đếm unique planId từ treatment phases 
      // (API chỉ trả về active treatment plans, nên mỗi planId = 1 bệnh nhân đang điều trị)
      const uniqueActivePlans = new Set();
      treatmentPhases.forEach((phase) => {
        if (phase.planId) {
          uniqueActivePlans.add(phase.planId);
        }
      });
      const inTreatment = uniqueActivePlans.size;

      // 🆕 ĐÃ HOÀN THÀNH: Tính từ patient status 
      // (vì API không trả về completed plans, dùng patient status làm fallback)
      let completed = 0;
      if (patients.length > 0) {
        patients.forEach((patient) => {
          if (
            patient.status === "completed" ||
            patient.profileStatus === "completed"
          ) {
            completed++;
          }
        });
      }

      // 🆕 TỈ LỆ THÀNH CÔNG: (completed patients / total patients) * 100
      const totalPatientsForSuccess = patients.length;
      const successRate =
        totalPatientsForSuccess > 0 ? Math.round((completed / totalPatientsForSuccess) * 100) : 0;

      // Fallback: Nếu không có treatment phases, tính toán từ profile status của patients
      let fallbackInTreatment = 0;
      let fallbackCompleted = 0;

      if (treatmentPhases.length === 0 && patients.length > 0) {
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
        inTreatment: treatmentPhases.length > 0 ? inTreatment : fallbackInTreatment,
        completed: treatmentPhases.length > 0 ? completed : fallbackCompleted,
        successRate:
          treatmentPhases.length > 0
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
      const patients = await Promise.all(
        response.data.patients.map(async (patient) => {
          // Lấy thông tin dịch vụ chính xác từ API
          let treatmentType = "Khám lâm sàng"; // Default
          let servicePackage = "BASIC";

          try {
            const serviceInfo = await apiDoctor.getPatientServiceInfo(
              patient.patientId
            );
            treatmentType = serviceInfo.treatmentType;
            servicePackage = serviceInfo.servicePackage;
          } catch (error) {
            console.warn(
              `⚠️ [apiDoctor] Không thể lấy thông tin dịch vụ cho bệnh nhân ${patient.patientId}:`,
              error.message
            );

            // Fallback: Dựa vào thông tin có sẵn
            if (patient.healthBackground) {
              const healthLower = patient.healthBackground.toLowerCase();
              if (
                healthLower.includes("ivf") ||
                healthLower.includes("thụ tinh ống nghiệm")
              ) {
                treatmentType = "IVF";
                servicePackage = "IVF_PREMIUM";
              } else if (
                healthLower.includes("icsi") ||
                healthLower.includes("tiêm tinh trùng")
              ) {
                treatmentType = "ICSI";
                servicePackage = "ICSI_STANDARD";
              } else if (
                healthLower.includes("iui") ||
                healthLower.includes("thụ tinh nhân tạo")
              ) {
                treatmentType = "IUI";
                servicePackage = "IUI_BASIC";
              }
            }
          }

          return {
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
            treatmentType: treatmentType,
            nextAppointment: patient.latestAppointment,
            progress: apiDoctor.calculateProgressFromPhase(
              patient.profileStatus
            ),
            servicePackage: servicePackage,
            createdAt: patient.latestAppointment,
            appointmentCount: patient.appointmentCount,
            latestAppointmentStatus: patient.latestAppointmentStatus,
            maritalStatus: patient.maritalStatus,
            healthBackground: patient.healthBackground,
            notes: patient.notes,
            avatarUrl: patient.avatarUrl,
            address: patient.address,
          };
        })
      );

      return patients;
    } catch (error) {
      console.error("❌ [apiDoctor] Lỗi lấy danh sách bệnh nhân:", error);
      throw error;
    }
  },

  getPatientDetails: async (patientId) => {
    try {
      console.log(`👤 [apiDoctor] Lấy chi tiết bệnh nhân ${patientId}...`);

      // Thử lấy từ clinical results trước
      try {
        const response = await axiosClient.get(
          `/api/clinical-results/patient/${patientId}`
        );
        if (response.data && response.data.length > 0) {
          const latestResult = response.data[0];
          console.log(
            "✅ [apiDoctor] Chi tiết bệnh nhân từ clinical results:",
            latestResult
          );
          return {
            id: patientId,
            name: latestResult.patientName || `Bệnh nhân ${patientId}`,
            diagnosis: latestResult.diagnosis,
            recommendations: latestResult.recommendations,
            examinationDate: latestResult.examinationDate,
            status: "active",
          };
        }
      } catch (clinicalError) {
        console.warn(
          "⚠️ [apiDoctor] Không thể lấy từ clinical results:",
          clinicalError.message
        );
      }

      // Thử lấy từ treatment workflow
      try {
        // Sử dụng role-appropriate endpoint
        const user = localStorage.getItem("user");
        let doctorId = null;
        if (user) {
          const userData = JSON.parse(user);
          doctorId = userData.id || userData.userId;
        }

        // DOCTOR sử dụng doctor phases endpoint
        const response = await axiosClient.get(
          `/api/treatment-workflow/doctor/${doctorId}/treatment-phases`
        );
        if (response.data && response.data.length > 0) {
          const latestTreatment = response.data[0];
          console.log(
            "✅ [apiDoctor] Chi tiết bệnh nhân từ treatment history:",
            latestTreatment
          );
          return {
            id: patientId,
            name: latestTreatment.patientName || `Bệnh nhân ${patientId}`,
            treatmentType: latestTreatment.treatmentType,
            status: latestTreatment.status || "active",
            startDate: latestTreatment.startDate,
          };
        }
      } catch (treatmentError) {
        console.warn(
          "⚠️ [apiDoctor] Không thể lấy từ treatment workflow:",
          treatmentError.message
        );
      }

      // Trả về dữ liệu mặc định nếu không tìm thấy
      const defaultData = {
        id: patientId,
        name: `Bệnh nhân ${patientId}`,
        status: "active",
        treatmentType: "IUI",
      };
      console.log("✅ [apiDoctor] Sử dụng dữ liệu mặc định:", defaultData);
      return defaultData;
    } catch (error) {
      console.error("❌ [apiDoctor] Lỗi lấy chi tiết bệnh nhân:", error);
      // Trả về dữ liệu mặc định thay vì throw error
      return {
        id: patientId,
        name: `Bệnh nhân ${patientId}`,
        status: "active",
        treatmentType: "IUI",
      };
    }
  },

  // Lấy thông tin dịch vụ của bệnh nhân từ specialty của bác sĩ hiện tại
  getPatientServiceInfo: async (patientId) => {
    try {
      console.log(
        `🔍 [apiDoctor] Lấy thông tin dịch vụ của bệnh nhân ${patientId}...`
      );

      // Lấy doctorId từ localStorage
      const user = localStorage.getItem("user");
      let doctorId = null;
      if (user) {
        try {
          const userData = JSON.parse(user);
          doctorId = userData.id || userData.userId;
        } catch (e) {
          console.error("❌ [apiDoctor] Lỗi parse user data:", e);
        }
      }

      if (!doctorId) {
        throw new Error("Không tìm thấy thông tin bác sĩ");
      }

      // Priority 1: Lấy từ specialty của bác sĩ hiện tại
      try {
        console.log("🔍 [apiDoctor] Lấy specialty của bác sĩ hiện tại...");
        const doctorProfileResponse = await axiosClient.get(
          `/api/profiles/doctor/me`
        );

        if (
          doctorProfileResponse.data &&
          doctorProfileResponse.data.specialty
        ) {
          const doctorSpecialty =
            doctorProfileResponse.data.specialty.toUpperCase();
          console.log("✅ [apiDoctor] Specialty của bác sĩ:", doctorSpecialty);

          // Mapping specialty với treatment type
          let treatmentType = "Khám lâm sàng";
          let servicePackage = "BASIC";

          switch (doctorSpecialty) {
            case "IUI":
              treatmentType = "IUI";
              servicePackage = "IUI_PACKAGE";
              break;
            case "IVF":
              treatmentType = "IVF";
              servicePackage = "IVF_PACKAGE";
              break;
            case "ICSI":
              treatmentType = "ICSI";
              servicePackage = "ICSI_PACKAGE";
              break;
            default:
              console.warn(
                "⚠️ [apiDoctor] Specialty không xác định:",
                doctorSpecialty
              );
          }

          return {
            serviceId: doctorId, // Sử dụng doctorId làm serviceId
            serviceName: doctorSpecialty,
            treatmentType: treatmentType,
            servicePackage: servicePackage,
            doctorSpecialty: doctorSpecialty,
          };
        }
      } catch (error) {
        console.warn(
          "⚠️ [apiDoctor] Không thể lấy specialty của bác sĩ:",
          error.message
        );
      }

      // Priority 2: Thử lấy từ treatment plans
      try {
        const treatmentPlan = await apiDoctor.getPatientTreatmentPlan(
          patientId
        );

        if (treatmentPlan) {
          return {
            serviceId: treatmentPlan.planId,
            serviceName: treatmentPlan.treatmentType,
            treatmentType: treatmentPlan.treatmentType,
            servicePackage: `${treatmentPlan.treatmentType.toUpperCase()}_PACKAGE`,
          };
        }
      } catch (error) {
        console.warn(
          "⚠️ [apiDoctor] Không thể lấy từ treatment plans:",
          error.message
        );
      }

      // Priority 3: Thử lấy từ clinical results
      try {
        const clinicalResultsResponse = await axiosClient.get(
          `/api/clinical-results/patient/${patientId}`
        );

        const results = clinicalResultsResponse.data || [];
        if (results.length > 0) {
          const latestResult = results[0];
          // Dựa vào diagnosis để xác định loại dịch vụ
          let treatmentType = "Khám lâm sàng";
          if (latestResult.diagnosis) {
            const diagnosis = latestResult.diagnosis.toLowerCase();
            if (
              diagnosis.includes("ivf") ||
              diagnosis.includes("thụ tinh ống nghiệm")
            ) {
              treatmentType = "IVF";
            } else if (
              diagnosis.includes("icsi") ||
              diagnosis.includes("tiêm tinh trùng")
            ) {
              treatmentType = "ICSI";
            } else if (
              diagnosis.includes("iui") ||
              diagnosis.includes("thụ tinh nhân tạo")
            ) {
              treatmentType = "IUI";
            }
          }

          return {
            serviceId: latestResult.resultId,
            serviceName: treatmentType,
            treatmentType: treatmentType,
            servicePackage: `${treatmentType.toUpperCase()}_PACKAGE`,
          };
        }
      } catch (error) {
        console.warn(
          "⚠️ [apiDoctor] Không thể lấy từ clinical results:",
          error.message
        );
      }

      // Fallback: Trả về dịch vụ mặc định
      console.log("✅ [apiDoctor] Sử dụng dịch vụ mặc định");
      return {
        serviceId: "default",
        serviceName: "Khám lâm sàng",
        treatmentType: "Khám lâm sàng",
        servicePackage: "BASIC",
      };
    } catch (error) {
      console.error("❌ [apiDoctor] Lỗi lấy thông tin dịch vụ:", error);
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

      // TODO: Handle empty appointments
      if (todayAppointments.length === 0) {
        console.log("ℹ️ [apiDoctor] No appointments found for today");
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

      return defaultAppointments;
    }
  },

  // 🆕 Lấy lịch hẹn theo ngày cụ thể
  getAppointmentsByDate: async (date) => {
    try {
      console.log("📅 [apiDoctor] Lấy lịch hẹn cho ngày:", date);

      // Lấy doctorId từ localStorage
      const user = localStorage.getItem("user");
      let doctorId = null;

      if (user) {
        try {
          const userData = JSON.parse(user);
          doctorId = userData.id || userData.userId;
        } catch (e) {
          console.error("❌ [apiDoctor] Lỗi parse user data:", e);
        }
      }

      // Thử lấy appointments từ API backend
      let appointments = [];
      if (doctorId) {
        try {
          // Gọi API backend để lấy appointments theo ngày
          const response = await axiosClient.get(
            `/api/doctor/schedule/my-appointments?date=${date}`
          );
          
          if (response.data && response.data.appointments) {
            appointments = response.data.appointments.map((appointment) => ({
              id: appointment.appointmentId,
              time: appointment.appointmentTime 
                ? new Date(appointment.appointmentTime).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "09:00",
              patientName: appointment.customer?.name || `Bệnh nhân ${appointment.customerId}`,
              service: "Khám lâm sàng",
              status: appointment.checkInStatus || "Scheduled",
              type: "Consultation",
              notes: "Lịch hẹn khám",
              room: appointment.room,
            }));
          }
          
          console.log("✅ [apiDoctor] Appointments from API:", appointments.length);
        } catch (error) {
          console.warn(
            "⚠️ [apiDoctor] Không thể lấy appointments từ API:",
            error.message
          );
          
          // Fallback: thử lấy từ treatment phases
          try {
            const response = await axiosClient.get(
              `/api/treatment-workflow/doctor/${doctorId}/treatment-phases`
            );
            const phases = response.data || [];

            // Lọc phases theo ngày
            const targetDate = new Date(date).toDateString();
            const targetPhases = phases.filter(
              (phase) =>
                phase.startDate &&
                new Date(phase.startDate).toDateString() === targetDate
            );

            // Transform thành format lịch hẹn
            appointments = targetPhases.map((phase) => ({
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
          } catch (phaseError) {
            console.warn(
              "⚠️ [apiDoctor] Không thể lấy treatment phases:",
              phaseError.message
            );
          }
        }
      }

      console.log("✅ [apiDoctor] Lịch hẹn cho ngày", date, ":", appointments.length);
      return appointments;
    } catch (error) {
      console.error("❌ [apiDoctor] Lỗi lấy lịch hẹn theo ngày:", error);
      return [];
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

  // Lấy thông tin treatment plan của bệnh nhân
  getPatientTreatmentPlan: async (patientId) => {
    try {
      console.log(
        `🔍 [apiDoctor] Lấy treatment plan của bệnh nhân ${patientId}...`
      );

      // Lấy doctorId từ localStorage
      const user = localStorage.getItem("user");
      let doctorId = null;
      if (user) {
        try {
          const userData = JSON.parse(user);
          doctorId = userData.id || userData.userId;
        } catch (e) {
          console.error("❌ [apiDoctor] Lỗi parse user data:", e);
        }
      }

      if (!doctorId) {
        throw new Error("Không tìm thấy thông tin bác sĩ");
      }

      // Lấy treatment plans của bác sĩ
      const treatmentPlansResponse = await axiosClient.get(
        `/api/treatment-workflow/doctor/${doctorId}/treatment-phases`
      );

      const phases = treatmentPlansResponse.data || [];
      const patientPhase = phases.find(
        (phase) => phase.patientId === patientId
      );

      if (patientPhase) {
        // Lấy chi tiết treatment plan
        const planResponse = await axiosClient.get(
          `/api/treatment-workflow/treatment-plan/${patientPhase.planId}/phases`
        );

        if (planResponse.data && planResponse.data.length > 0) {
          return {
            planId: patientPhase.planId,
            treatmentType: patientPhase.treatmentType || "Điều trị vô sinh",
            status: patientPhase.status || "active",
            phases: planResponse.data,
          };
        }
      }

      return null;
    } catch (error) {
      console.warn(
        "⚠️ [apiDoctor] Không thể lấy treatment plan:",
        error.message
      );
      return null;
    }
  },

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

      // Thử lấy từ danh sách bệnh nhân của bác sĩ trước (endpoint này chắc chắn tồn tại)
      try {
        const myPatientsResponse = await axiosClient.get(
          "/api/doctor/schedule/my-patients"
        );
        const patient = myPatientsResponse.data.patients?.find(
          (p) => p.patientId === patientId || p.id === patientId
        );
        if (patient) {
          console.log(
            "✅ [apiDoctor] Tìm thấy bệnh nhân trong danh sách:",
            patient
          );
          return { data: patient };
        }
      } catch (myPatientsError) {
        console.warn(
          "⚠️ [apiDoctor] Không thể lấy danh sách bệnh nhân:",
          myPatientsError.message
        );
      }

      // Thử lấy từ clinical results
      try {
        const response = await axiosClient.get(
          `/api/clinical-results/patient/${patientId}`
        );
        if (response.data && response.data.length > 0) {
          const latestResult = response.data[0];
          console.log(
            "✅ [apiDoctor] Thông tin bệnh nhân từ clinical results:",
            latestResult
          );
          return { data: latestResult };
        }
      } catch (clinicalError) {
        console.warn(
          "⚠️ [apiDoctor] Không thể lấy từ clinical results:",
          clinicalError.message
        );
      }

      // Thử API profiles (chỉ cho user hiện tại)
      try {
        const response = await axiosClient.get(`/api/profiles/me`);
        console.log(
          "✅ [apiDoctor] Thông tin user hiện tại từ /api/profiles/me:",
          response.data
        );
        // Chỉ trả về nếu đây là thông tin của patient cần tìm
        if (response.data && response.data.id === patientId) {
          return response.data;
        }
      } catch (profilesError) {
        console.warn(
          "⚠️ [apiDoctor] Không thể lấy từ /api/profiles/me:",
          profilesError.message
        );
      }

      // Nếu tất cả đều thất bại, trả về dữ liệu mặc định
      console.warn(
        "⚠️ [apiDoctor] Không thể lấy thông tin bệnh nhân từ bất kỳ API nào"
      );

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
    } catch (error) {
      console.warn(
        "⚠️ [apiDoctor] Lỗi không mong muốn khi lấy thông tin bệnh nhân:",
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

      // Sử dụng role-appropriate endpoint
      const user = localStorage.getItem("user");
      let doctorId = null;
      if (user) {
        const userData = JSON.parse(user);
        doctorId = userData.id || userData.userId;
      }

      // DOCTOR sử dụng doctor phases endpoint và lọc theo patientId
      const response = await axiosClient.get(
        `/api/treatment-workflow/doctor/${doctorId}/treatment-phases`
      );

      // Lọc phases theo patientId
      if (response.data && Array.isArray(response.data)) {
        const patientPhases = response.data.filter(
          (phase) =>
            phase.patientId === patientId || phase.patient?.id === patientId
        );
        console.log("✅ [apiDoctor] Lịch sử điều trị:", patientPhases);
        return patientPhases;
      }

      console.log("✅ [apiDoctor] Không có lịch sử điều trị");
      return [];
    } catch (error) {
      console.error("❌ [apiDoctor] Lỗi lấy lịch sử điều trị:", error);
      throw error;
    }
  },

  // Lấy kết quả khám lâm sàng của bệnh nhân
  getPatientClinicalResults: async (patientId) => {
    try {
      console.log(
        `🔬 [apiDoctor] Lấy kết quả khám lâm sàng của bệnh nhân ${patientId}...`
      );

      // Thử API clinical-results trước
      try {
        const response = await axiosClient.get(
          `/api/clinical-results/patient/${patientId}`
        );
        console.log("✅ [apiDoctor] Kết quả khám lâm sàng:", response.data);
        return response.data;
      } catch (clinicalError) {
        console.warn(
          "⚠️ [apiDoctor] Không thể lấy từ clinical-results, thử treatment-workflow:",
          clinicalError.message
        );

        // Thử API treatment-workflow
        try {
          const response = await axiosClient.get(
            `/api/treatment-workflow/patient/${patientId}/clinical-results`
          );
          console.log(
            "✅ [apiDoctor] Kết quả khám lâm sàng từ treatment-workflow:",
            response.data
          );
          return response.data;
        } catch (treatmentError) {
          console.warn(
            "⚠️ [apiDoctor] Không thể lấy từ treatment-workflow:",
            treatmentError.message
          );

          // Trả về dữ liệu mặc định thay vì throw error
          const defaultResults = [];
          console.log(
            "✅ [apiDoctor] Sử dụng kết quả khám mặc định:",
            defaultResults
          );
          return defaultResults;
        }
      }
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
