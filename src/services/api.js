// Mock API Service - Dễ dàng thay thế bằng API thật
const API_BASE_URL = "http://localhost:3001";
const USE_MOCK = true; // Đặt false khi có API thật

// Utility function để simulate API delay
const delay = (ms = 1000) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock data
const MOCK_DATA = {
  users: [
    {
      id: 1,
      fullName: "Nguyễn Văn Admin",
      email: "admin@ferticare.com",
      role: "admin",
      status: "active",
      createdAt: "2024-01-01",
      department: "IT",
    },
    {
      id: 2,
      fullName: "Trần Thị Manager",
      email: "manager@ferticare.com",
      role: "manager",
      status: "active",
      createdAt: "2024-01-02",
      department: "IVF",
    },
    {
      id: 3,
      fullName: "BS. Lê Văn Doctor",
      email: "doctor@ferticare.com",
      role: "doctor",
      status: "active",
      createdAt: "2024-01-03",
      department: "IVF",
      specialty: "Sinh sản hỗ trợ",
    },
    {
      id: 4,
      fullName: "Phạm Thị Patient",
      email: "patient@ferticare.com",
      role: "patient",
      status: "active",
      createdAt: "2024-01-04",
      hasRegisteredService: true,
    },
  ],
  departments: [
    {
      id: 1,
      name: "IVF",
      description: "Thụ tinh ống nghiệm",
      doctorCount: 12,
      patientCount: 456,
    },
    {
      id: 2,
      name: "Khám tổng quát",
      description: "Khám sức khỏe sinh sản",
      doctorCount: 8,
      patientCount: 312,
    },
    {
      id: 3,
      name: "Siêu âm",
      description: "Chẩn đoán hình ảnh",
      doctorCount: 6,
      patientCount: 234,
    },
    {
      id: 4,
      name: "Xét nghiệm",
      description: "Xét nghiệm hormone và gen",
      doctorCount: 4,
      patientCount: 166,
    },
  ],
  patients: [
    {
      id: 1,
      fullName: "Nguyễn Thị A",
      age: 28,
      phone: "0123456789",
      email: "patient1@gmail.com",
      doctorId: 3,
      status: "in_treatment",
      treatmentPhase: "Kích thích buồng trứng",
      progress: 65,
      nextAppointment: "2024-01-15 09:00",
    },
    {
      id: 2,
      fullName: "Lê Thị B",
      age: 32,
      phone: "0123456788",
      email: "patient2@gmail.com",
      doctorId: 3,
      status: "consultation",
      treatmentPhase: "Tư vấn ban đầu",
      progress: 10,
      nextAppointment: "2024-01-16 14:00",
    },
  ],
  appointments: [
    {
      id: 1,
      patientId: 1,
      doctorId: 3,
      date: "2024-01-15",
      time: "09:00",
      type: "Siêu âm kiểm tra",
      status: "confirmed",
      notes: "",
    },
    {
      id: 2,
      patientId: 2,
      doctorId: 3,
      date: "2024-01-16",
      time: "14:00",
      type: "Tư vấn",
      status: "pending",
      notes: "",
    },
  ],
  treatmentPlans: [
    {
      id: 1,
      patientId: 1,
      doctorId: 3,
      title: "Phác đồ IVF cơ bản",
      description: "Thụ tinh ống nghiệm cho lần đầu",
      phases: [
        { name: "Khám ban đầu", status: "completed", date: "2023-12-15" },
        { name: "Chuẩn bị chu kỳ", status: "completed", date: "2023-12-20" },
        {
          name: "Kích thích buồng trứng",
          status: "in_progress",
          date: "2024-01-10",
        },
        { name: "Chọc hút trứng", status: "pending", date: "2024-01-22" },
        { name: "Chuyển phôi", status: "pending", date: "2024-01-25" },
      ],
      medications: [
        {
          name: "Gonal-F",
          dosage: "150 IU",
          frequency: "Tối",
          duration: "10 ngày",
        },
        {
          name: "Cetrotide",
          dosage: "0.25mg",
          frequency: "Sáng",
          duration: "5 ngày",
        },
      ],
    },
  ],
};

// Base API class
class ApiService {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    if (USE_MOCK) {
      return this.mockRequest(endpoint, options);
    }

    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  // Mock implementation
  async mockRequest(endpoint, options = {}) {
    await delay(800); // Simulate network delay

    const method = options.method || "GET";
    const body = options.body ? JSON.parse(options.body) : null;

    // Route the mock requests
    switch (true) {
      case endpoint === "/auth/login" && method === "POST":
        return this.mockLogin(body);
      case endpoint === "/users" && method === "GET":
        return { data: MOCK_DATA.users, total: MOCK_DATA.users.length };
      case endpoint === "/departments" && method === "GET":
        return {
          data: MOCK_DATA.departments,
          total: MOCK_DATA.departments.length,
        };
      case endpoint === "/patients" && method === "GET":
        return { data: MOCK_DATA.patients, total: MOCK_DATA.patients.length };
      case endpoint === "/appointments" && method === "GET":
        return {
          data: MOCK_DATA.appointments,
          total: MOCK_DATA.appointments.length,
        };
      case endpoint === "/treatment-plans" && method === "GET":
        return {
          data: MOCK_DATA.treatmentPlans,
          total: MOCK_DATA.treatmentPlans.length,
        };
      case endpoint === "/service-registration" && method === "POST":
        return this.mockServiceRegistration(body);
      case endpoint.startsWith("/dashboard/") && method === "GET":
        return this.mockDashboardData(endpoint);
      default:
        throw new Error(`Mock endpoint not found: ${method} ${endpoint}`);
    }
  }

  mockLogin(credentials) {
    const { email, password } = credentials;
    const user = MOCK_DATA.users.find((u) => u.email === email);

    if (!user) {
      throw new Error("User not found");
    }

    // Mock password validation (normally done on backend)
    if (password !== "123456") {
      throw new Error("Invalid password");
    }

    return {
      success: true,
      user: {
        ...user,
        token: `mock-token-${user.id}`,
      },
      message: "Login successful",
    };
  }

  mockServiceRegistration(registrationData) {
    return {
      success: true,
      serviceId: Date.now(),
      message: "Đăng ký dịch vụ thành công",
      data: {
        ...registrationData,
        status: "pending_approval",
        createdAt: new Date().toISOString(),
      },
    };
  }

  mockDashboardData(endpoint) {
    const role = endpoint.split("/")[2]; // Extract role from /dashboard/{role}

    switch (role) {
      case "admin":
        return {
          totalUsers: 1247,
          totalDoctors: 45,
          totalPatients: 1168,
          totalDepartments: 8,
          monthlyGrowth: 12.5,
          activeUsers: 892,
          pendingApprovals: 23,
          systemHealth: 98.5,
          recentActivities: MOCK_DATA.users.slice(0, 4).map((user) => ({
            user: user.fullName,
            action: "System activity",
            time: "2 phút trước",
            status: "success",
          })),
        };
      case "manager":
        return {
          teamSize: 12,
          activeDoctors: 10,
          monthlyPatients: 156,
          approvalsPending: 8,
          teamPerformance: 92.5,
        };
      case "doctor":
        return {
          totalPatients: 45,
          todayAppointments: 8,
          activeTreatments: 12,
          completedTreatments: 156,
          successRate: 78.5,
        };
      case "patient":
        return {
          treatmentProgress: 65,
          nextAppointment: "2024-01-15 09:00",
          totalSessions: 12,
          completedSessions: 8,
          currentPhase: "Kích thích buồng trứng",
        };
      default:
        return {};
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Specific service methods
export const authAPI = {
  login: (credentials) =>
    apiService.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),
  logout: () => apiService.request("/auth/logout", { method: "POST" }),
  register: (userData) =>
    apiService.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),
};

export const userAPI = {
  getAll: (params = {}) =>
    apiService.request(`/users?${new URLSearchParams(params)}`),
  getById: (id) => apiService.request(`/users/${id}`),
  create: (userData) =>
    apiService.request("/users", {
      method: "POST",
      body: JSON.stringify(userData),
    }),
  update: (id, userData) =>
    apiService.request(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    }),
  delete: (id) => apiService.request(`/users/${id}`, { method: "DELETE" }),
};

export const departmentAPI = {
  getAll: () => apiService.request("/departments"),
  getById: (id) => apiService.request(`/departments/${id}`),
  create: (data) =>
    apiService.request("/departments", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    apiService.request(`/departments/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    apiService.request(`/departments/${id}`, { method: "DELETE" }),
};

export const patientAPI = {
  getAll: (params = {}) =>
    apiService.request(`/patients?${new URLSearchParams(params)}`),
  getById: (id) => apiService.request(`/patients/${id}`),
  create: (data) =>
    apiService.request("/patients", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    apiService.request(`/patients/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

export const appointmentAPI = {
  getAll: (params = {}) =>
    apiService.request(`/appointments?${new URLSearchParams(params)}`),
  create: (data) =>
    apiService.request("/appointments", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    apiService.request(`/appointments/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  cancel: (id) =>
    apiService.request(`/appointments/${id}/cancel`, { method: "POST" }),
};

export const treatmentAPI = {
  getAll: (params = {}) =>
    apiService.request(`/treatment-plans?${new URLSearchParams(params)}`),
  getById: (id) => apiService.request(`/treatment-plans/${id}`),
  create: (data) =>
    apiService.request("/treatment-plans", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    apiService.request(`/treatment-plans/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

export const serviceAPI = {
  register: (data) =>
    apiService.request("/service-registration", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

export const dashboardAPI = {
  getAdminData: () => apiService.request("/dashboard/admin"),
  getManagerData: () => apiService.request("/dashboard/manager"),
  getDoctorData: () => apiService.request("/dashboard/doctor"),
  getPatientData: () => apiService.request("/dashboard/patient"),
};

export default apiService;
