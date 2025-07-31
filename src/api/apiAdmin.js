import axiosClient from "./axiosClient";

const apiAdmin = {
  // Dashboard APIs
  getDashboardData: async () => {
    try {
      console.log("🔍 [apiAdmin] Fetching dashboard data...");
      
      // Get basic dashboard data
      const dashboardResponse = await axiosClient.get("/api/admin/dashboard");
      console.log("✅ [apiAdmin] Basic dashboard data received:", dashboardResponse.data);
      
      // Get accurate department statistics
      const departmentStatsResponse = await axiosClient.get("/api/admin/departments/statistics");
      console.log("✅ [apiAdmin] Department statistics received:", departmentStatsResponse.data);
      
      // Helper function to get department color
      const getDepartmentColor = (departmentName) => {
        if (!departmentName) return "#1890ff";
        
        switch (departmentName.toLowerCase()) {
          case "ivf":
            return "#1890ff";
          case "iui":
            return "#52c41a";
          case "tư vấn sinh sản":
          case "consulting":
          case "tư vấn":
            return "#fa8c16";
          case "icsi":
            return "#722ed1";
          case "khám tổng quát":
          case "general":
            return "#13c2c2";
          case "siêu âm":
          case "ultrasound":
            return "#eb2f96";
          case "xét nghiệm":
          case "laboratory":
            return "#f5222d";
          default:
            // Generate a consistent color based on department name hash
            const hash = departmentName.toLowerCase().split('').reduce((a, b) => {
              a = ((a << 5) - a) + b.charCodeAt(0);
              return a & a;
            }, 0);
            const colors = ["#1890ff", "#52c41a", "#fa8c16", "#722ed1", "#13c2c2", "#eb2f96", "#f5222d", "#faad14", "#a0d911"];
            return colors[Math.abs(hash) % colors.length];
        }
      };
      
      // Merge the data
      const mergedData = {
        ...dashboardResponse.data,
        totalDepartments: departmentStatsResponse.data.totalDepartments || dashboardResponse.data.totalDepartments,
        departmentData: departmentStatsResponse.data.departments?.map(dept => ({
          department: dept.name,
          patients: dept.patientCount,
          color: getDepartmentColor(dept.name)
        })) || dashboardResponse.data.departmentData
      };
      
      console.log("✅ [apiAdmin] Merged dashboard data:", mergedData);
      return mergedData;
    } catch (error) {
      console.error("❌ [apiAdmin] Dashboard fetch failed:", error);
      throw error;
    }
  },

  getUserStats: async () => {
    try {
      console.log("🔍 [apiAdmin] Fetching user stats...");
      const response = await axiosClient.get("/api/admin/users/stats");
      console.log("✅ [apiAdmin] User stats received:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ [apiAdmin] User stats fetch failed:", error);
      throw error;
    }
  },

  getDepartmentStats: async () => {
    try {
      console.log("🔍 [apiAdmin] Fetching department stats...");
      const response = await axiosClient.get("/api/admin/dashboard");
      console.log("✅ [apiAdmin] Department stats received:", response.data);
      
      // Extract department stats from dashboard data
      const dashboardData = response.data;
      const departmentStats = {
        totalDepartments: dashboardData.totalDepartments || 0,
        totalDoctors: dashboardData.totalDoctors || 0,
        totalPatients: dashboardData.totalPatients || 0,
        avgPatientsPerDept: dashboardData.totalDepartments > 0 
          ? Math.round((dashboardData.totalPatients || 0) / dashboardData.totalDepartments) 
          : 0,
        departmentData: dashboardData.departmentData || []
      };
      
      console.log("✅ [apiAdmin] Processed department stats:", departmentStats);
      return departmentStats;
    } catch (error) {
      console.error("❌ [apiAdmin] Department stats fetch failed:", error);
      throw error;
    }
  },

  getAccurateDepartmentStats: async () => {
    try {
      console.log("🔍 [apiAdmin] Fetching accurate department statistics...");
      const response = await axiosClient.get("/api/admin/departments/statistics");
      console.log("✅ [apiAdmin] Accurate department stats received:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ [apiAdmin] Accurate department stats fetch failed:", error);
      throw error;
    }
  },

  getDepartmentDetails: async (departmentId) => {
    try {
      console.log("🔍 [apiAdmin] Fetching department details for:", departmentId);
      
      // Use the new backend endpoint that provides real counts
      const response = await axiosClient.get(`/api/admin/departments/${departmentId}`);
      console.log("✅ [apiAdmin] Department details received:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ [apiAdmin] Department details fetch failed:", error);
      throw error;
    }
  },

  getDoctorsByDepartment: async (departmentId, departmentName) => {
    try {
      console.log("🔍 [apiAdmin] Fetching doctors for department:", departmentName, "ID:", departmentId);
      
      // Use the new backend endpoint for doctors by department
      const response = await axiosClient.get(`/api/admin/departments/${departmentId}/doctors`);
      console.log("✅ [apiAdmin] Doctors by department received:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ [apiAdmin] Doctors by department fetch failed:", error);
      throw error;
    }
  },

  getDoctorCountByDepartment: async (departmentId) => {
    try {
      console.log("🔍 [apiAdmin] Fetching doctor count for department:", departmentId);
      const response = await axiosClient.get(`/api/admin/departments/${departmentId}/doctor-count`);
      console.log("✅ [apiAdmin] Doctor count received:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ [apiAdmin] Doctor count fetch failed:", error);
      throw error;
    }
  },

  getPatientsByDepartment: async (departmentName) => {
    try {
      console.log("🔍 [apiAdmin] Fetching patients for department:", departmentName);
      
      // Map department names to treatment types
      const treatmentTypeMap = {
        'ivf': 'IVF',
        'iui': 'IUI',
        'khoa sản phụ': 'ICSI',
        'khoa san phu': 'ICSI'
      };
      
      const treatmentType = treatmentTypeMap[departmentName.toLowerCase()];
      
      // Get patients count from new API endpoint
      const response = await axiosClient.get(`/api/admin/patients/by-department?departmentName=${encodeURIComponent(departmentName)}`);
      const patientCount = response.data?.patientCount || 0;
      
      console.log("✅ [apiAdmin] Patients count for", departmentName, ":", patientCount);
      return { patientCount };
    } catch (error) {
      console.error("❌ [apiAdmin] Patients by department fetch failed:", error);
      throw error;
    }
  },

  getSystemHealth: async () => {
    try {
      console.log("🔍 [apiAdmin] Fetching system health...");
      const response = await axiosClient.get("/api/admin/system/health");
      console.log("✅ [apiAdmin] System health received:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ [apiAdmin] System health fetch failed:", error);
      throw error;
    }
  },

  // User Management APIs
  getAllUsers: async (params = {}) => {
    try {
      console.log("🔍 [apiAdmin] Fetching users with params:", params);
      const response = await axiosClient.get("/api/admin/users", { params });
      console.log("✅ [apiAdmin] Users received:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ [apiAdmin] Users fetch failed:", error);
      throw error;
    }
  },

  createUser: async (userData) => {
    try {
      console.log("🔍 [apiAdmin] Creating user:", userData);
      const response = await axiosClient.post("/api/admin/users", userData);
      console.log("✅ [apiAdmin] User created:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ [apiAdmin] User creation failed:", error);
      throw error;
    }
  },

  updateUser: async (userId, userData) => {
    try {
      console.log("🔍 [apiAdmin] Updating user:", userId, userData);
      const response = await axiosClient.put(`/api/admin/users/${userId}`, userData);
      console.log("✅ [apiAdmin] User updated:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ [apiAdmin] User update failed:", error);
      throw error;
    }
  },



  toggleUserStatus: async (userId) => {
    try {
      console.log("🔍 [apiAdmin] Toggling user status:", userId);
      const response = await axiosClient.put(`/api/admin/users/${userId}/status`);
      console.log("✅ [apiAdmin] User status toggled:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ [apiAdmin] Status toggle failed:", error);
      throw error;
    }
  },

  // ===================== DEPARTMENT MANAGEMENT =====================
  
  getAllDepartments: async () => {
    try {
      console.log("🔍 [apiAdmin] Fetching all departments...");
      const response = await axiosClient.get("/api/admin/departments");
      console.log("✅ [apiAdmin] Departments received:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ [apiAdmin] Department fetch failed:", error);
      throw error;
    }
  },

  getDepartmentById: async (id) => {
    try {
      console.log(`🔍 [apiAdmin] Fetching department ${id}...`);
      const response = await axiosClient.get(`/api/admin/departments/${id}`);
      console.log("✅ [apiAdmin] Department received:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ [apiAdmin] Department fetch failed:", error);
      throw error;
    }
  },

  createDepartment: async (departmentData) => {
    try {
      console.log("🔍 [apiAdmin] Creating department:", departmentData);
      const response = await axiosClient.post("/api/admin/departments", departmentData);
      console.log("✅ [apiAdmin] Department created:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ [apiAdmin] Department creation failed:", error);
      throw error;
    }
  },

  updateDepartment: async (id, departmentData) => {
    try {
      console.log(`🔍 [apiAdmin] Updating department ${id}:`, departmentData);
      const response = await axiosClient.put(`/api/admin/departments/${id}`, departmentData);
      console.log("✅ [apiAdmin] Department updated:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ [apiAdmin] Department update failed:", error);
      throw error;
    }
  },



  toggleDepartmentStatus: async (id) => {
    try {
      console.log(`🔍 [apiAdmin] Toggling department ${id} status...`);
      const response = await axiosClient.patch(`/api/admin/departments/${id}/toggle-status`);
      console.log("✅ [apiAdmin] Department status toggled:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ [apiAdmin] Department status toggle failed:", error);
      throw error;
    }
  },

  // New method to get real department statistics
  getRealDepartmentStats: async () => {
    try {
      console.log("🔍 [apiAdmin] Fetching real department stats...");
      const response = await axiosClient.get("/api/admin/departments/stats");
      console.log("✅ [apiAdmin] Real department stats received:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ [apiAdmin] Real department stats fetch failed:", error);
      throw error;
    }
  },

  // New method to get doctors by department name
  getDoctorsByDepartmentName: async (departmentName) => {
    try {
      console.log("🔍 [apiAdmin] Fetching doctors for department:", departmentName);
      const response = await axiosClient.get(`/api/admin/departments/${encodeURIComponent(departmentName)}/doctors`);
      console.log("✅ [apiAdmin] Doctors by department name received:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ [apiAdmin] Doctors by department name fetch failed:", error);
      throw error;
    }
  },

  // New method to get patients by department name
  getPatientsByDepartmentName: async (departmentName) => {
    try {
      console.log("🔍 [apiAdmin] Fetching patients for department:", departmentName);
      const response = await axiosClient.get(`/api/admin/departments/${encodeURIComponent(departmentName)}/patients`);
      console.log("✅ [apiAdmin] Patients by department name received:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ [apiAdmin] Patients by department name fetch failed:", error);
      throw error;
    }
  },
};

export default apiAdmin; 