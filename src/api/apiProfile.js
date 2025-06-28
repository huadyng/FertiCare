import axiosClient from "../services/axiosClient";

const apiProfile = {
  // Lấy profile của user hiện tại (tự động detect role)
  getMyProfile: async () => {
    try {
      console.log("🔍 [apiProfile] Đang lấy profile của user hiện tại...");

      const response = await axiosClient.get("/api/profiles/me");

      console.log("✅ [apiProfile] Lấy profile thành công:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "❌ [apiProfile] Lỗi khi lấy profile:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Update profile theo role - sử dụng endpoint chính xác
  updateProfile: async (profileData, userRole) => {
    try {
      console.log("📝 [apiProfile] Đang cập nhật profile:", profileData);
      console.log("🎭 [apiProfile] User role:", userRole);

      let endpoint;
      let requestData = { ...profileData };

      // Xác định endpoint dựa trên role
      switch (userRole?.toUpperCase()) {
        case "DOCTOR":
          endpoint = "/api/profiles/doctor/me";
          // Đảm bảo dữ liệu phù hợp với UpdateDoctorProfileRequest
          if (requestData.gender) {
            requestData.gender = requestData.gender.toUpperCase();
          }
          break;
        case "CUSTOMER":
        case "PATIENT":
          endpoint = "/api/profiles/customer/me";
          // Đảm bảo dữ liệu phù hợp với UpdateCustomerProfileRequest
          if (requestData.gender) {
            requestData.gender = requestData.gender.toUpperCase();
          }
          if (requestData.maritalStatus) {
            requestData.maritalStatus = requestData.maritalStatus.toUpperCase();
          }
          break;
        case "MANAGER":
        case "ADMIN":
          endpoint = "/api/profiles/admin/me";
          // Đảm bảo dữ liệu phù hợp với UpdateManagerAdminProfileRequest
          if (requestData.gender) {
            requestData.gender = requestData.gender.toUpperCase();
          }
          break;
        default:
          // Fallback về endpoint generic
          endpoint = "/api/profiles/me";
          break;
      }

      const response = await axiosClient.put(endpoint, requestData);
      console.log(
        "✅ [apiProfile] Cập nhật profile thành công:",
        response.data
      );
      return response.data;
    } catch (error) {
      console.error(
        "❌ [apiProfile] Lỗi khi cập nhật profile:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Upload avatar - sử dụng endpoint có sẵn
  uploadAvatar: async (file) => {
    try {
      console.log("📷 [apiProfile] Đang upload avatar...");

      // Debug token
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        console.log(
          "🔍 [apiProfile] Token exists:",
          userData.token ? "YES" : "NO"
        );
      } else {
        console.log("🔍 [apiProfile] No user data in localStorage");
      }

      const formData = new FormData();
      formData.append("avatar", file);

      const response = await axiosClient.post(
        "/api/profiles/me/avatar",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("✅ [apiProfile] Upload avatar thành công:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "❌ [apiProfile] Lỗi khi upload avatar:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Lấy profile theo role cụ thể
  getDoctorProfile: async () => {
    try {
      console.log("🔍 [apiProfile] Đang lấy doctor profile...");
      const response = await axiosClient.get("/api/profiles/doctor/me");
      console.log(
        "✅ [apiProfile] Lấy doctor profile thành công:",
        response.data
      );
      return response.data;
    } catch (error) {
      console.error(
        "❌ [apiProfile] Lỗi khi lấy doctor profile:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  getCustomerProfile: async () => {
    try {
      console.log("🔍 [apiProfile] Đang lấy customer profile...");
      const response = await axiosClient.get("/api/profiles/customer/me");
      console.log(
        "✅ [apiProfile] Lấy customer profile thành công:",
        response.data
      );
      return response.data;
    } catch (error) {
      console.error(
        "❌ [apiProfile] Lỗi khi lấy customer profile:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  getManagerAdminProfile: async () => {
    try {
      console.log("🔍 [apiProfile] Đang lấy manager/admin profile...");
      const response = await axiosClient.get("/api/profiles/admin/me");
      console.log(
        "✅ [apiProfile] Lấy manager/admin profile thành công:",
        response.data
      );
      return response.data;
    } catch (error) {
      console.error(
        "❌ [apiProfile] Lỗi khi lấy manager/admin profile:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Lấy danh sách tất cả users (cho admin)
  getAllUsers: async () => {
    try {
      console.log("🔍 [apiProfile] Đang lấy danh sách users...");

      const response = await axiosClient.get("/api/users");

      console.log("✅ [apiProfile] Lấy users thành công:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "❌ [apiProfile] Lỗi khi lấy users:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Tạo user mới (cho admin)
  createUser: async (userData) => {
    try {
      console.log("📝 [apiProfile] Đang tạo user mới:", userData);

      const response = await axiosClient.post("/api/admin", userData);

      console.log("✅ [apiProfile] Tạo user thành công:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "❌ [apiProfile] Lỗi khi tạo user:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
};

export default apiProfile;
