import axios from "axios";
import { message } from "antd";
import ENV_CONFIG from "../config/env.js";

const API_BASE_URL = ENV_CONFIG.API.BASE_URL;

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: ENV_CONFIG.API.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
axiosClient.interceptors.request.use(
  (config) => {
    console.log("🔍 [axiosClient] Sending request to:", config.url);

    // 🆕 Kiểm tra token trước khi gửi request (trừ login/register)
    if (!config.url.includes("/login") && !config.url.includes("/register") && !config.url.includes("/verify-email")) {
      const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
      if (token && isTokenExpired(token)) {
        console.warn("🔒 [axiosClient] Token expired before request, handling expiration...");
        handleTokenExpiration("Token đã hết hạn trước khi gửi yêu cầu");
        return Promise.reject(new Error("Token expired"));
      }
    }

    // ✅ Lấy token từ cả hai nơi để đảm bảo compatibility
    let token = localStorage.getItem("token") || localStorage.getItem("accessToken"); // Thử lấy token từ cả hai format
    const user = localStorage.getItem("user");

    console.log("🔍 [axiosClient] LocalStorage check:");
    console.log("  - Token (separate) exists:", !!token);
    console.log("  - User exists:", !!user);

    // Nếu không có token riêng biệt, thử lấy từ trong user object
    if (!token && user) {
      try {
        const userData = JSON.parse(user);
        token = userData.token;
        console.log("🔍 [axiosClient] Token found in user object");
        console.log("🔍 [axiosClient] User data:", {
          id: userData.id,
          email: userData.email,
          role: userData.role,
          fullName: userData.fullName,
          hasToken: !!token,
        });
        
        // 🔄 Auto-sync token từ user object vào localStorage nếu thiếu
        if (token && !localStorage.getItem("token")) {
          localStorage.setItem("token", token);
          console.log("🔄 [axiosClient] Auto-synced token from user object to localStorage");
        }
        
        // 🔄 Also sync to STORAGE_KEYS format for compatibility
        if (token && !localStorage.getItem("accessToken")) {
          localStorage.setItem("accessToken", token);
          console.log("🔄 [axiosClient] Auto-synced token to accessToken key");
        }
      } catch (e) {
        console.error("❌ [axiosClient] Error parsing user data:", e);
      }
    }

    console.log("  - Final token exists:", !!token);

    if (token) {
      console.log(
        "🔍 [axiosClient] Token (first 50 chars):",
        token.substring(0, 50) + "..."
      );
      config.headers.Authorization = `Bearer ${token}`;
      console.log("✅ [axiosClient] Authorization header set");
    } else {
      console.log("⚠️ [axiosClient] No token found anywhere");
    }

    console.log("🔍 [axiosClient] Full request config:", {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      headers: {
        ...config.headers,
        Authorization: config.headers.Authorization ? "[PRESENT]" : "[MISSING]",
      },
      timeout: config.timeout,
    });

    return config;
  },
  (error) => {
    console.error("❌ [axiosClient] Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosClient.interceptors.response.use(
  (response) => {
    console.log("✅ [axiosClient] Response received:", {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      dataType: typeof response.data,
      dataSize: JSON.stringify(response.data).length,
    });

    if (response.data) {
      console.log(
        "✅ [axiosClient] Response data preview:",
        JSON.stringify(response.data).substring(0, 200) + "..."
      );
    }

    return response;
  },
  async (error) => {
    console.error("❌ [axiosClient] Response error details:");
    console.error("  - Status:", error.response?.status);
    console.error("  - Status Text:", error.response?.statusText);
    console.error("  - URL:", error.config?.url);
    console.error("  - Method:", error.config?.method);
    console.error("  - Message:", error.message);

    if (error.response) {
      console.error(
        "❌ [axiosClient] Error response data:",
        error.response.data
      );
      console.error(
        "❌ [axiosClient] Error response headers:",
        error.response.headers
      );

      // Log specific error messages from backend
      if (error.response.data?.message) {
        console.error(
          "❌ [axiosClient] Backend error message:",
          error.response.data.message
        );
      }

      if (error.response.data?.errors) {
        console.error(
          "❌ [axiosClient] Backend validation errors:",
          error.response.data.errors
        );
      }
    } else if (error.request) {
      console.error("❌ [axiosClient] No response received:", error.request);
      message.error({
        content: "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng!",
        duration: 4,
        key: "network-error",
      });
    }

    // Handle different HTTP status codes
    switch (error.response?.status) {
      case 401:
        console.warn(
          "🔒 [axiosClient] 401 Unauthorized - Token invalid or expired"
        );
        // Hiển thị thông báo ngay lập tức
        message.error({
          content: "🔒 Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!",
          duration: 8,
          key: "unauthorized-error",
        });
        handleTokenExpiration("Token không hợp lệ hoặc đã hết hạn");
        break;
      case 403:
        console.warn(
          "🔒 [axiosClient] 403 Forbidden - Token có thể hết hạn"
        );
        // Thử refresh token trước khi logout
        try {
          await forceRefreshToken();
          // Nếu refresh thành công, thử lại request
          console.log("🔄 [axiosClient] Token refreshed, retrying request...");
          return axiosClient.request(error.config);
        } catch (refreshError) {
          console.warn("⚠️ [axiosClient] Token refresh failed, logging out...");
          message.error({
            content: "🔒 Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!",
            duration: 8,
            key: "forbidden-error",
          });
          handleTokenExpiration("Không có quyền truy cập");
        }
        break;

      case 404:
        console.warn("🔍 [axiosClient] 404 Not Found - Endpoint may not exist");
        message.warning({
          content: "Không tìm thấy tài nguyên yêu cầu!",
          duration: 3,
          key: "not-found",
        });
        break;

      case 500:
        console.error(
          "💥 [axiosClient] 500 Internal Server Error - Backend issue"
        );
        message.error({
          content: "Lỗi hệ thống. Vui lòng thử lại sau!",
          duration: 4,
          key: "server-error",
        });
        break;

      default:
        console.error(
          `❌ [axiosClient] HTTP ${error.response?.status} - Unexpected error`
        );
        message.error({
          content: "Đã xảy ra lỗi không xác định. Vui lòng thử lại!",
          duration: 4,
          key: "unknown-error",
        });
    }

    return Promise.reject(error);
  }
);



// 🆕 Centralized logout function
export const handleTokenExpiration = (reason = "Phiên đăng nhập đã hết hạn") => {
  console.log("🔒 [axiosClient] Handling token expiration:", reason);
  
  // Hiển thị thông báo rõ ràng hơn
  message.error({
    content: `🔒 ${reason}. Vui lòng đăng nhập lại!`,
    duration: 8,
    key: "token-expired",
    style: {
      marginTop: '20vh',
      fontSize: '16px',
      fontWeight: 'bold',
    },
  });
  
  // Clear tất cả dữ liệu authentication
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  
  // Hiển thị thông báo console để debug
  console.warn("🔒 [axiosClient] Token expired - redirecting to login in 3 seconds");
  
  // Redirect sau 3 giây để người dùng đọc thông báo
  setTimeout(() => {
    if (!window.location.pathname.includes("/login")) {
      console.log("🔒 [axiosClient] Redirecting to login page");
      window.location.href = "/login";
    }
  }, 3000);
};

// 🔄 Force refresh token function
export const forceRefreshToken = async () => {
  console.log("🔄 [axiosClient] Force refreshing token...");
  
  try {
    // Lấy thông tin user hiện tại
    const user = localStorage.getItem("user");
    if (!user) {
      throw new Error("No user data found");
    }
    
    const userData = JSON.parse(user);
    
    // Thử đăng nhập lại với thông tin hiện tại
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: userData.email,
      password: "password123" // Sử dụng password mặc định cho demo
    });
    
    if (response.data?.token) {
      // Cập nhật token mới
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("accessToken", response.data.token);
      
      // Cập nhật user object với token mới
      const updatedUser = { ...userData, token: response.data.token };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      console.log("✅ [axiosClient] Token refreshed successfully");
      return response.data.token;
    } else {
      throw new Error("No token in response");
    }
  } catch (error) {
    console.error("❌ [axiosClient] Error refreshing token:", error);
    throw error;
  }
};

// 🔄 Refresh token from context function (alias for forceRefreshToken)
export const refreshTokenFromContext = () => {
  return forceRefreshToken();
};

// 🆕 Check if token is expired (JWT token validation)
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    // Decode JWT token (without verification)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const payload = JSON.parse(jsonPayload);
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Check if token is expired (with 5 minutes buffer)
    return payload.exp < (currentTime + 300);
  } catch (error) {
    console.error("❌ [axiosClient] Error checking token expiration:", error);
    return true; // Consider invalid token as expired
  }
};

// 🆕 Validate current token
export const validateCurrentToken = () => {
  const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
  
  if (!token) {
    handleTokenExpiration("Không tìm thấy token đăng nhập");
    return false;
  }
  
  if (isTokenExpired(token)) {
    handleTokenExpiration("Token đã hết hạn");
    return false;
  }
  
  return true;
};

export default axiosClient;
