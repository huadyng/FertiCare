//Kết nối URL của Backend
import axios from "axios";
const axiosClient = axios.create({
  //"http://localhost:8080" -- http://localhost:3001

  baseURL: "http://localhost:8080", //URL của backend
  headers: { "Content-Type": "application/json" },
  timeout: 10000, //tối thiểu 10s
});

axiosClient.interceptors.request.use((config) => {
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    try {
      const userData = JSON.parse(storedUser);
      if (userData.token) {
        config.headers.Authorization = `Bearer ${userData.token}`;
        console.log("🔍 [axiosClient] Sending request to:", config.url);
        console.log(
          "🔍 [axiosClient] Authorization header:",
          config.headers.Authorization ? "SET" : "MISSING"
        );
      } else {
        console.warn("⚠️ [axiosClient] No token found in user data");
      }
    } catch (e) {
      console.warn("⚠️ [axiosClient] User data không hợp lệ:", e);
    }
  } else {
    console.warn("⚠️ [axiosClient] No user data in localStorage");
  }
  return config;
});

// Response interceptor để xử lý lỗi
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("❌ [axiosClient] API Error:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data,
    });

    // Xử lý lỗi 403 - Forbidden (có thể do token hết hạn)
    if (error.response?.status === 403) {
      console.warn("⚠️ [axiosClient] 403 Forbidden - Token có thể hết hạn");
      // Có thể redirect về login hoặc refresh token
    }

    // Xử lý lỗi 500 - Internal Server Error
    if (error.response?.status === 500) {
      console.error(
        "💥 [axiosClient] 500 Internal Server Error - Backend có vấn đề"
      );
    }

    // Xử lý lỗi 401 - Unauthorized
    if (error.response?.status === 401) {
      console.warn("⚠️ [axiosClient] 401 Unauthorized - Token không hợp lệ");
      // Có thể redirect về login
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
