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
      // Note: Endpoint này cần được implement trong backend
      // Tạm thời sẽ tính toán từ các API có sẵn
      const [patients, appointments] = await Promise.all([
        apiDoctor.getMyPatients(),
        apiDoctor.getTodayAppointments(),
      ]);

      const stats = {
        totalPatients: patients.length,
        todayAppointments: appointments.length,
        inTreatment: patients.filter(
          (p) => p.status === "in-treatment" || p.status === "active"
        ).length,
        completed: patients.filter((p) => p.status === "completed").length,
        successRate:
          patients.length > 0
            ? Math.round(
                (patients.filter((p) => p.status === "completed").length /
                  patients.length) *
                  100
              )
            : 0,
      };

      console.log("✅ [apiDoctor] Thống kê dashboard:", stats);
      return stats;
    } catch (error) {
      console.error("❌ [apiDoctor] Lỗi lấy thống kê:", error);
      // Fallback to mock data if API fails
      return {
        totalPatients: 45,
        todayAppointments: 8,
        inTreatment: 12,
        completed: 28,
        successRate: 78,
      };
    }
  },

  // =================== PATIENT MANAGEMENT ===================
  getMyPatients: async () => {
    // Backend chưa có endpoint này (/api/service-request/my-patients không tồn tại)
    // Return mock data ngay để tránh 403 error
    console.log("👥 [apiDoctor] Lấy danh sách bệnh nhân...");
    console.log(
      "⚠️ [apiDoctor] Backend chưa có endpoint my-patients, sử dụng mock data"
    );

    const mockPatients = [
      {
        id: "1",
        fullName: "Nguyễn Thị Mai",
        age: 32,
        gender: "FEMALE",
        dateOfBirth: "1992-03-15",
        phone: "0909123456",
        email: "mai.nguyen@email.com",
        status: "in-treatment",
        treatmentType: "IVF",
        nextAppointment: "2024-01-20",
        progress: 65,
        servicePackage: "IVF_PREMIUM",
        createdAt: "2024-01-10T10:00:00Z",
      },
      {
        id: "2",
        fullName: "Trần Văn Nam",
        age: 35,
        gender: "MALE",
        dateOfBirth: "1989-07-22",
        phone: "0912345678",
        email: "nam.tran@email.com",
        status: "consultation",
        treatmentType: "IUI",
        nextAppointment: "2024-01-18",
        progress: 25,
        servicePackage: "IUI_STANDARD",
        createdAt: "2024-01-08T14:30:00Z",
      },
    ];

    return mockPatients;
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
    // Backend chưa có endpoint này (/api/appointments/my-appointments không tồn tại)
    // Return mock data ngay để tránh 403 error
    console.log("📅 [apiDoctor] Lấy lịch hẹn hôm nay...");
    console.log(
      "⚠️ [apiDoctor] Backend chưa có endpoint appointments, sử dụng mock data"
    );

    const todayAppointments = [
      {
        id: "1",
        time: "09:00",
        patient: "Nguyễn Thị Mai",
        patientName: "Nguyễn Thị Mai",
        type: "Khám định kỳ",
        status: "scheduled",
        appointmentDate: new Date().toISOString().split("T")[0],
      },
      {
        id: "2",
        time: "10:30",
        patient: "Trần Văn Nam",
        patientName: "Trần Văn Nam",
        type: "Tư vấn điều trị",
        status: "scheduled",
        appointmentDate: new Date().toISOString().split("T")[0],
      },
    ];

    return todayAppointments;
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

  // =================== UTILITY FUNCTIONS ===================
  transformPatientData: (rawPatient) => {
    // Transform API response to match UI expectations
    return {
      id: rawPatient.id,
      name: rawPatient.fullName || rawPatient.name,
      age:
        rawPatient.age ||
        (rawPatient.dateOfBirth
          ? new Date().getFullYear() -
            new Date(rawPatient.dateOfBirth).getFullYear()
          : "N/A"),
      gender: rawPatient.gender?.toLowerCase() || "unknown",
      dob: rawPatient.dateOfBirth,
      contact: rawPatient.phone,
      email: rawPatient.email,
      status: rawPatient.status || "unknown",
      treatmentType:
        rawPatient.treatmentType || rawPatient.serviceName || "General",
      nextAppointment: rawPatient.nextAppointment,
      progress: rawPatient.progress || 0,
      servicePackage: rawPatient.servicePackage || rawPatient.serviceName,
      createdAt: rawPatient.createdAt,
    };
  },
};

export default apiDoctor;
