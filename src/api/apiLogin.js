import axiosClient from "./axiosClient";

const apiLogin = {
  // Đăng nhập thường
  login: async (email, password) => {
    try {
      console.log("🔐 [apiLogin] Gửi dữ liệu đăng nhập:");
      console.log("📧 Email:", email);
      console.log("🔑 Password:", password ? "***" : "empty");

      const response = await axiosClient.post("/api/auth/login", {
        email,
        password,
      });

      console.log("✅ [apiLogin] Phản hồi từ server:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "❌ [apiLogin] Lỗi khi đăng nhập:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Đăng nhập Google
  googleLogin: async (googleData) => {
    try {
      console.log("🔐 [apiLogin] Google login data:", {
        email: googleData.email,
        fullName: googleData.name || googleData.fullName,
        avatarUrl: googleData.picture || googleData.avatarUrl,
      });

      const response = await axiosClient.post("/api/auth/google-login", {
        googleToken: googleData.credential,
        email: googleData.email,
        fullName: googleData.name || googleData.fullName,
        avatarUrl: googleData.picture || googleData.avatarUrl,
      });

      console.log("✅ [apiLogin] Google login thành công:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "❌ [apiLogin] Lỗi Google login:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Đăng xuất (nếu cần gọi API)
  logout: async () => {
    try {
      const response = await axiosClient.post("/api/auth/logout");
      console.log("✅ [apiLogin] Đăng xuất thành công:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "❌ [apiLogin] Lỗi đăng xuất:",
        error.response?.data || error.message
      );
      // Không throw error vì đăng xuất local vẫn có thể thực hiện
      return null;
    }
  },
};

// Export both named and default cho compatibility
export const { login: apiLoginFunction, googleLogin: apiGoogleLogin } =
  apiLogin;
export default apiLogin;
