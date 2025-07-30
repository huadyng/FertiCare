//Kết nối URL của Backend
import axios from "axios";
import { message } from "antd";
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
      message.error({
        content: "🔒 Không có quyền truy cập. Vui lòng đăng nhập lại!",
        duration: 5,
        style: {
          marginTop: '20vh',
          fontSize: '16px',
          fontWeight: 'bold',
        },
      });
      // Clear localStorage mà không redirect
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      // Bỏ redirect để tránh render lại trang
      // setTimeout(() => {
      //   window.location.href = "/login";
      // }, 3000);
    }

    // Xử lý lỗi 500 - Internal Server Error
    if (error.response?.status === 500) {
      console.error(
        "💥 [axiosClient] 500 Internal Server Error - Backend có vấn đề"
      );
      message.error({
        content: "💥 Lỗi hệ thống. Vui lòng thử lại sau!",
        duration: 5,
      });
    }

    // Xử lý lỗi 401 - Unauthorized
    if (error.response?.status === 401) {
      console.warn("⚠️ [axiosClient] 401 Unauthorized - Token không hợp lệ");
      message.error({
        content: "🔒 Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!",
        duration: 8,
        style: {
          marginTop: '20vh',
          fontSize: '16px',
          fontWeight: 'bold',
        },
      });
      // Clear localStorage mà không redirect
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      // Bỏ redirect để tránh render lại trang
      // setTimeout(() => {
      //   window.location.href = "/login";
      // }, 3000);
    }

    // Xử lý lỗi network
    if (error.request) {
      console.error("🌐 [axiosClient] Network Error - Không thể kết nối server");
      message.error({
        content: "🌐 Lỗi kết nối mạng. Vui lòng kiểm tra kết nối!",
        duration: 5,
      });
    }

    // Xử lý lỗi 404 - Not Found
    if (error.response?.status === 404) {
      console.warn("🔍 [axiosClient] 404 Not Found");
      message.error({
        content: "🔍 Không tìm thấy dữ liệu yêu cầu!",
        duration: 5,
      });
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
