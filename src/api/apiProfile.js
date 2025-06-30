import axiosClient from "./axiosClient";

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

      // Giữ lại avatarUrl nếu có để cập nhật cùng form
      // delete requestData.avatarUrl; // Bỏ dòng này để cho phép gửi avatarUrl

      // Xác định endpoint và whitelist fields dựa trên role
      let allowedFields = [];

      switch (userRole?.toUpperCase()) {
        case "DOCTOR":
          endpoint = "/api/profiles/doctor/me";
          allowedFields = [
            "fullName",
            "phone",
            "gender",
            "dateOfBirth",
            "address",
            "avatarUrl",
            "specialty",
            "qualification",
            "experienceYears",
          ];
          break;
        case "CUSTOMER":
        case "PATIENT":
          endpoint = "/api/profiles/customer/me";
          allowedFields = [
            "fullName",
            "phone",
            "gender",
            "dateOfBirth",
            "address",
            "maritalStatus",
            "healthBackground",
            // avatarUrl KHÔNG được phép cho customer - backend không hỗ trợ
          ];
          break;
        case "MANAGER":
        case "ADMIN":
          endpoint = "/api/profiles/admin/me";
          allowedFields = [
            "fullName",
            "phone",
            "gender",
            "dateOfBirth",
            "address",
            "avatarUrl",
            "assignedDepartment",
            "extraPermissions",
          ];
          break;
        default:
          // Fallback về endpoint generic với fields cơ bản
          endpoint = "/api/profiles/me";
          allowedFields = [
            "fullName",
            "phone",
            "gender",
            "dateOfBirth",
            "address",
            "avatarUrl",
          ];
          break;
      }

      // Chỉ giữ lại fields được phép
      const filteredData = {};
      allowedFields.forEach((field) => {
        if (requestData[field] !== undefined) {
          filteredData[field] = requestData[field];
        }
      });

      // Chuẩn hóa format
      if (filteredData.gender) {
        filteredData.gender = filteredData.gender.toUpperCase();
      }
      if (filteredData.maritalStatus) {
        // Mapping từ tiếng Việt sang tiếng Anh cho backend
        const maritalStatusMapping = {
          "độc thân": "SINGLE",
          "đã kết hôn": "MARRIED",
          "đã ly hôn": "DIVORCED",
          góa: "WIDOWED",
        };

        const vietnameseValue = filteredData.maritalStatus.toLowerCase();
        filteredData.maritalStatus =
          maritalStatusMapping[vietnameseValue] ||
          filteredData.maritalStatus.toUpperCase();
      }

      requestData = filteredData;

      console.log("📤 [apiProfile] Request data sau khi filter:", requestData);

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

  // Cập nhật avatar URL - sử dụng endpoint generic cho tất cả role
  updateAvatarUrl: async (avatarUrl) => {
    try {
      console.log("🌐 [apiProfile] Đang cập nhật avatar URL:", avatarUrl);

      const response = await axiosClient.put("/api/profiles/me", {
        avatarUrl: avatarUrl,
      });

      console.log(
        "✅ [apiProfile] Cập nhật avatar URL thành công:",
        response.data
      );
      return response.data;
    } catch (error) {
      console.error(
        "❌ [apiProfile] Lỗi khi cập nhật avatar URL:",
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
