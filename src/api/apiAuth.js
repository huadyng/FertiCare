import axiosClient from "./axiosClient";

const apiAuth = {
  // Login với email/password để lấy JWT token thật
  login: async (email, password) => {
    try {
      console.log("🔐 [apiAuth] Attempting login:", { email, password: "***" });

      const response = await axiosClient.post("/api/auth/login", {
        email,
        password,
      });

      console.log("✅ [apiAuth] Login successful:", response.data);

      // Lưu token và user data vào localStorage
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: response.data.id,
            email: response.data.email,
            fullName: response.data.fullName,
            token: response.data.token,
          })
        );

        console.log("💾 [apiAuth] Saved token to localStorage");
      }

      return response.data;
    } catch (error) {
      console.error("❌ [apiAuth] Login failed:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  // Google Login
  googleLogin: async (googleToken, email, fullName, avatarUrl) => {
    try {
      console.log("🔐 [apiAuth] Attempting Google login:", { email, fullName });

      const response = await axiosClient.post("/api/auth/google-login", {
        googleToken,
        email,
        fullName,
        avatarUrl,
      });

      console.log("✅ [apiAuth] Google login successful:", response.data);

      // Lưu token và user data vào localStorage
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: response.data.id,
            email: response.data.email,
            fullName: response.data.fullName,
            token: response.data.token,
          })
        );

        console.log("💾 [apiAuth] Saved Google token to localStorage");
      }

      return response.data;
    } catch (error) {
      console.error("❌ [apiAuth] Google login failed:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  // Logout
  logout: () => {
    console.log("🚪 [apiAuth] Logging out...");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    console.log("✅ [apiAuth] Logout successful");
  },

  // Check if user is logged in
  isLoggedIn: () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    return !!(token && user);
  },

  // Get current user data
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error("❌ [apiAuth] Error parsing user data:", error);
      return null;
    }
  },

  // Get current token
  getCurrentToken: () => {
    return localStorage.getItem("token");
  },
};

export default apiAuth;
