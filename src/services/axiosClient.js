import axios from "axios";

const API_BASE_URL = "http://localhost:8080";

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
axiosClient.interceptors.request.use(
  (config) => {
    console.log("🔍 [axiosClient] Sending request to:", config.url);

    // ✅ Lấy token từ cả hai nơi để đảm bảo compatibility
    let token = localStorage.getItem("token"); // Thử lấy token riêng biệt trước
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
  (error) => {
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
    }

    // Handle different HTTP status codes
    switch (error.response?.status) {
      case 401:
        console.warn(
          "🔒 [axiosClient] 401 Unauthorized - Token invalid or expired"
        );
        console.log(
          "🔒 [axiosClient] Clearing localStorage and redirecting..."
        );
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
        break;

      case 403:
        console.warn(
          "🚫 [axiosClient] 403 Forbidden - Insufficient permissions"
        );
        console.log(
          "🚫 [axiosClient] Current token may not have required permissions"
        );
        break;

      case 404:
        console.warn("🔍 [axiosClient] 404 Not Found - Endpoint may not exist");
        break;

      case 500:
        console.error(
          "💥 [axiosClient] 500 Internal Server Error - Backend issue"
        );
        break;

      default:
        console.error(
          `❌ [axiosClient] HTTP ${error.response?.status} - Unexpected error`
        );
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
