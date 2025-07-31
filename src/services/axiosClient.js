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
    // Bỏ hoàn toàn log cho login API
    if (process.env.NODE_ENV === 'development' && false && !config.url?.includes("/login")) { // Tắt log
      console.log("🔍 [axiosClient] Sending request to:", config.url);
    }

    // 🆕 Kiểm tra token trước khi gửi request (trừ login/register)
    if (!config.url.includes("/login") && !config.url.includes("/register") && !config.url.includes("/verify-email")) {
      // 🆕 Bỏ qua token validation cho một số API khi page mới load
      const pageLoadTime = performance.timing.navigationStart || performance.timeOrigin;
      const currentTime = Date.now();
      const timeSincePageLoad = currentTime - pageLoadTime;
      const isRecentPageLoad = timeSincePageLoad < 5000; // 5 giây đầu tiên
      
      const shouldSkipValidation = shouldSkipTokenValidation(config.url) && isRecentPageLoad;
      
      if (!shouldSkipValidation) {
        const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
        if (token && isTokenExpired(token)) {
          console.warn("🔒 [axiosClient] Token expired before request, handling expiration...");
          handleTokenExpiration("Token đã hết hạn trước khi gửi yêu cầu");
          return Promise.reject(new Error("Token expired"));
        }
      } else {
        console.log("🔄 [axiosClient] Skipping token validation for recent page load:", {
          url: config.url,
          timeSincePageLoad: `${timeSincePageLoad}ms`
        });
      }
    }

    // ✅ Lấy token từ cả hai nơi để đảm bảo compatibility
    let token = localStorage.getItem("token") || localStorage.getItem("accessToken"); // Thử lấy token từ cả hai format
    const user = localStorage.getItem("user");

    // Bỏ hoàn toàn log cho login API
    if (process.env.NODE_ENV === 'development' && false && !config.url?.includes("/login")) { // Tắt log
      console.log("🔍 [axiosClient] LocalStorage check:");
      console.log("  - Token (separate) exists:", !!token);
      console.log("  - User exists:", !!user);
    }

    // Nếu không có token riêng biệt, thử lấy từ trong user object
    if (!token && user) {
      try {
        const userData = JSON.parse(user);
        token = userData.token;
        // Bỏ hoàn toàn log cho login API
        if (process.env.NODE_ENV === 'development' && false && !config.url?.includes("/login")) { // Tắt log
          console.log("🔍 [axiosClient] Token found in user object");
          console.log("🔍 [axiosClient] User data:", {
            id: userData.id,
            email: userData.email,
            role: userData.role,
            fullName: userData.fullName,
            hasToken: !!token,
          });
        }
        
        // 🔄 Auto-sync token từ user object vào localStorage nếu thiếu
        if (token && !localStorage.getItem("token")) {
          localStorage.setItem("token", token);
        }
        
        // 🔄 Also sync to STORAGE_KEYS format for compatibility
        if (token && !localStorage.getItem("accessToken")) {
          localStorage.setItem("accessToken", token);
        }
      } catch (e) {
        console.error("❌ [axiosClient] Error parsing user data:", e);
      }
    }

    // Bỏ hoàn toàn log cho login API
    if (process.env.NODE_ENV === 'development' && false && !config.url?.includes("/login")) { // Tắt log
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
    } else {
      // Chỉ set token mà không log
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

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
    // Bỏ hoàn toàn log cho login API
    if (process.env.NODE_ENV === 'development' && false && !response.config.url?.includes("/login")) { // Tắt log
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
    }

    return response;
  },
  async (error) => {
    // Bỏ hoàn toàn log cho login API
    if (!error.config?.url?.includes("/login")) {
      console.error("❌ [axiosClient] Response error details:");
      console.error("  - Status:", error.response?.status);
      console.error("  - Status Text:", error.response?.statusText);
      console.error("  - URL:", error.config?.url);
      console.error("  - Method:", error.config?.method);
      console.error("  - Message:", error.message);
    }

    if (error.response) {
      // Bỏ hoàn toàn log cho login API
      if (!error.config?.url?.includes("/login")) {
        console.error(
          "❌ [axiosClient] Error response data:",
          error.response.data
        );
        console.error(
          "❌ [axiosClient] Error response headers:",
          error.response.headers
        );
      }

      // Bỏ hoàn toàn log cho login API
      if (!error.config?.url?.includes("/login")) {
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
      }
    } else if (error.request) {
      console.error("❌ [axiosClient] No response received:", error.request);
      // ✅ Bỏ thông báo lỗi cho profile API vì có fallback
      if (!error.config?.url?.includes("/profiles/")) {
        message.error({
          content: "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng!",
          duration: 4,
          key: "network-error",
        });
      }
    }

    // Handle different HTTP status codes
    switch (error.response?.status) {
      case 401:
        // Chỉ log khi debug mode
        if (process.env.NODE_ENV === 'development' && false) {
          console.warn("🔒 [axiosClient] 401 Unauthorized - Token invalid or expired");
        }
        // ✅ Bỏ thông báo lỗi cho các API không quan trọng
        if (!shouldSkipTokenValidation(error.config?.url)) {
          
              // 🆕 Kiểm tra xem có phải đang refresh trang không
    const isPageRefresh = performance.navigation.type === 1 || 
                         document.readyState === 'loading' ||
                         window.performance.getEntriesByType('navigation')[0]?.type === 'reload';
    
    // 🆕 Thêm kiểm tra thời gian từ khi page load
    const pageLoadTime = performance.timing.navigationStart || performance.timeOrigin;
    const currentTime = Date.now();
    const timeSincePageLoad = currentTime - pageLoadTime;
    const isRecentPageLoad = timeSincePageLoad < 5000; // 5 giây đầu tiên
    
    if (!isPageRefresh && !isRecentPageLoad) {
      handleTokenExpiration("Phiên đăng nhập đã hết hạn");
    } else {
      console.log("🔄 [axiosClient] Page is refreshing or recently loaded, skipping 401 handling", {
        isPageRefresh,
        isRecentPageLoad,
        timeSincePageLoad: `${timeSincePageLoad}ms`
      });
    }
        }
        break;
      case 403:
        console.warn(
          "🔒 [axiosClient] 403 Forbidden - Token có thể hết hạn"
        );
        // ✅ Bỏ thông báo lỗi cho các API không quan trọng
        if (!shouldSkipTokenValidation(error.config?.url)) {
          
          // 🆕 Kiểm tra xem có user data hợp lệ không trước khi refresh
          const hasValidUserData = checkAndRestoreUserData();
          if (hasValidUserData) {
            // Thử refresh token trước khi logout
            try {
              await forceRefreshToken();
              // Nếu refresh thành công, thử lại request
              console.log("🔄 [axiosClient] Token refreshed, retrying request...");
              return axiosClient.request(error.config);
            } catch (refreshError) {
              console.warn("⚠️ [axiosClient] Token refresh failed, logging out...");
              handleTokenExpiration("Không có quyền truy cập");
            }
          } else {
            // 🆕 Không có user data hợp lệ, không cần refresh token
            console.log("ℹ️ [axiosClient] No valid user data, skipping token refresh");
            // Không logout, chỉ reject error để component xử lý
            return Promise.reject(error);
          }
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
        // ✅ Bỏ thông báo lỗi cho doctor profile vì có fallback
        if (!error.config?.url?.includes("/profiles/doctor")) {
          message.error({
            content: "Lỗi hệ thống. Vui lòng thử lại sau!",
            duration: 4,
            key: "server-error",
          });
        }
        break;

      default:
        console.error(
          `❌ [axiosClient] HTTP ${error.response?.status} - Unexpected error`
        );
        // ✅ Bỏ thông báo lỗi cho profile API vì có fallback
        if (!error.config?.url?.includes("/profiles/")) {
          message.error({
            content: "Đã xảy ra lỗi không xác định. Vui lòng thử lại!",
            duration: 4,
            key: "unknown-error",
          });
        }
    }

    return Promise.reject(error);
  }
);

// 🆕 Flag để tránh gọi nhiều lần refresh token
let isRefreshingToken = false;
let isHandlingTokenExpiration = false;

// 🆕 Function để kiểm tra xem có nên bỏ qua token validation không
const shouldSkipTokenValidation = (url) => {
  // Bỏ qua cho các API không quan trọng
  const skipUrls = [
    "/login",
    "/auth", 
    "/profiles/",
    "/clinical-results",
    "/treatment-plans",
    "/doctor/schedule/my-patients",
    "/treatment-workflow/doctor"
  ];
  
  return skipUrls.some(skipUrl => url?.includes(skipUrl));
};

// 🔄 Force refresh token function
export const forceRefreshToken = async () => {
  // Tránh gọi nhiều lần cùng lúc
  if (isRefreshingToken) {
    console.log("🔄 [axiosClient] Token refresh already in progress, skipping...");
    return;
  }
  
  isRefreshingToken = true;
  console.log("🔄 [axiosClient] Force refreshing token...");
  
  try {
    // Kiểm tra user data trước
    const hasValidUserData = checkAndRestoreUserData();
    if (!hasValidUserData) {
      console.warn("⚠️ [axiosClient] No valid user data found, cannot refresh token");
      throw new Error("No valid user data found");
    }
    
    // Lấy thông tin user hiện tại
    const user = localStorage.getItem("user");
    let userData;
    try {
      userData = JSON.parse(user);
    } catch (parseError) {
      console.error("❌ [axiosClient] Error parsing user data:", parseError);
      throw new Error("Invalid user data format");
    }
    
    if (!userData.email) {
      console.warn("⚠️ [axiosClient] No email found in user data");
      throw new Error("No email in user data");
    }
    
    console.log("🔄 [axiosClient] Attempting to refresh token for user:", userData.email);
    
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
      console.warn("⚠️ [axiosClient] No token in response");
      throw new Error("No token in response");
    }
  } catch (error) {
    console.error("❌ [axiosClient] Error refreshing token:", error);
    throw error;
  } finally {
    isRefreshingToken = false;
  }
};

// 🔄 Refresh token from context function (alias for forceRefreshToken)
export const refreshTokenFromContext = () => {
  return forceRefreshToken();
};

// 🆕 Centralized logout function
export const handleTokenExpiration = (reason = "Phiên đăng nhập đã hết hạn") => {
  // Tránh gọi nhiều lần cùng lúc
  if (isHandlingTokenExpiration) {
    console.log("🔒 [axiosClient] Token expiration already being handled, skipping...");
    return;
  }
  
  isHandlingTokenExpiration = true;
  console.log("🔒 [axiosClient] Handling token expiration:", reason);
  
  // 🆕 Kiểm tra xem có phải đang refresh trang không
  const isPageRefresh = performance.navigation.type === 1 || 
                       document.readyState === 'loading' ||
                       window.performance.getEntriesByType('navigation')[0]?.type === 'reload';
  
  // 🆕 Thêm kiểm tra thời gian từ khi page load
  const pageLoadTime = performance.timing.navigationStart || performance.timeOrigin;
  const currentTime = Date.now();
  const timeSincePageLoad = currentTime - pageLoadTime;
  const isRecentPageLoad = timeSincePageLoad < 5000; // 5 giây đầu tiên
  
  if (isPageRefresh || isRecentPageLoad) {
    console.log("🔄 [axiosClient] Page is refreshing or recently loaded, skipping token expiration handling", {
      isPageRefresh,
      isRecentPageLoad,
      timeSincePageLoad: `${timeSincePageLoad}ms`
    });
    isHandlingTokenExpiration = false;
    return;
  }
  
  // 🆕 Kiểm tra xem có user data hợp lệ không trước khi logout
  const hasValidUserData = checkAndRestoreUserData();
  if (!hasValidUserData) {
    console.log("ℹ️ [axiosClient] No valid user data, skipping logout");
    isHandlingTokenExpiration = false;
    return;
  }
  
  // Chỉ hiển thị thông báo nếu chưa có thông báo nào đang hiển thị
  const existingMessage = document.querySelector('.ant-message-notice');
  if (!existingMessage) {
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
  }
  
  // Clear tất cả dữ liệu authentication
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  
  // Hiển thị thông báo console để debug
  console.warn("🔒 [axiosClient] Token expired - no auto redirect");
  
  // Reset flag sau 3 giây
  setTimeout(() => {
    isHandlingTokenExpiration = false;
  }, 3000);
  
  // Bỏ redirect tự động để tránh render lại trang
  // setTimeout(() => {
  //   if (!window.location.pathname.includes("/login")) {
  //     console.log("🔒 [axiosClient] Redirecting to login page");
  //     window.location.href = "/login";
  //   }
  // }, 3000);
};

// 🆕 Function để kiểm tra và khôi phục user data
export const checkAndRestoreUserData = () => {
  try {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    
    if (!user && !token) {
      console.log("ℹ️ [axiosClient] No user data or token found");
      return false;
    }
    
    if (!user && token) {
      console.warn("⚠️ [axiosClient] Token exists but no user data found");
      return false;
    }
    
    if (user && !token) {
      console.warn("⚠️ [axiosClient] User data exists but no token found");
      return false;
    }
    
    // Cả user và token đều tồn tại
    const userData = JSON.parse(user);
    console.log("✅ [axiosClient] User data and token found:", {
      hasUser: !!userData,
      hasEmail: !!userData.email,
      hasToken: !!token,
      userRole: userData.role
    });
    
    return true;
  } catch (error) {
    console.error("❌ [axiosClient] Error checking user data:", error);
    return false;
  }
};

// 🆕 Check if token is expired (JWT token validation)
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    // Decode JWT token (without verification)
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn("⚠️ [axiosClient] Invalid JWT token format");
      return true;
    }
    
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const payload = JSON.parse(jsonPayload);
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Check if token has expiration field
    if (!payload.exp) {
      console.warn("⚠️ [axiosClient] Token has no expiration field");
      return false; // Don't consider it expired if no exp field
    }
    
    // Check if token is expired (with 5 minutes buffer)
    const isExpired = payload.exp < (currentTime + 300);
    
    if (isExpired) {
      console.log("🔒 [axiosClient] Token expired:", {
        tokenExp: new Date(payload.exp * 1000).toISOString(),
        currentTime: new Date(currentTime * 1000).toISOString(),
        bufferTime: new Date((currentTime + 300) * 1000).toISOString()
      });
    }
    
    return isExpired;
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

// 🆕 Helper function to ensure token consistency
export const ensureTokenConsistency = () => {
  try {
    const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
    const user = localStorage.getItem("user");
    
    if (!token || !user) {
      return false;
    }
    
    const userData = JSON.parse(user);
    
    // Ensure user object has the token
    if (!userData.token || userData.token !== token) {
      userData.token = token;
      localStorage.setItem("user", JSON.stringify(userData));
      console.log("🔄 [axiosClient] Token consistency ensured");
    }
    
    return true;
  } catch (error) {
    console.error("❌ [axiosClient] Error ensuring token consistency:", error);
    return false;
  }
};

// 🆕 Function để validate token khi refresh trang
export const validateTokenOnPageLoad = () => {
  try {
    const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
    const user = localStorage.getItem("user");
    
    // 🆕 Nếu không có token hoặc user data, chỉ return false mà không clear
    if (!token || !user) {
      console.log("ℹ️ [axiosClient] No token or user data found on page load - user not logged in");
      return false;
    }
    
    // Kiểm tra token có expired không
    if (isTokenExpired(token)) {
      console.warn("🔒 [axiosClient] Token expired on page load, clearing invalid data");
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
      return false;
    }
    
    // Kiểm tra user data có hợp lệ không
    try {
      const userData = JSON.parse(user);
      
      // 🆕 Cải thiện logic kiểm tra token - chỉ clear nếu thực sự cần thiết
      if (!userData.token) {
        // Nếu user object không có token, thêm token vào user object
        console.log("🔄 [axiosClient] User object missing token, adding token from localStorage");
        userData.token = token;
        localStorage.setItem("user", JSON.stringify(userData));
        console.log("✅ [axiosClient] Token added to user object");
        return true;
      }
      
      // Nếu token trong user object khác với token riêng biệt, sync lại
      if (userData.token !== token) {
        console.log("🔄 [axiosClient] Token mismatch detected, syncing tokens");
        console.log("  - User object token:", userData.token ? userData.token.substring(0, 20) + "..." : "null");
        console.log("  - Separate token:", token ? token.substring(0, 20) + "..." : "null");
        
        // Ưu tiên token riêng biệt vì nó thường được cập nhật mới hơn
        userData.token = token;
        localStorage.setItem("user", JSON.stringify(userData));
        console.log("✅ [axiosClient] Tokens synced successfully");
        return true;
      }
      
      console.log("✅ [axiosClient] Token validated successfully on page load");
      return true;
    } catch (parseError) {
      console.warn("⚠️ [axiosClient] Invalid user data format on page load, clearing invalid data");
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
      return false;
    }
  } catch (error) {
    console.error("❌ [axiosClient] Error validating token on page load:", error);
    // 🆕 Chỉ clear data nếu có lỗi nghiêm trọng
    if (error.message.includes("JSON") || error.message.includes("parse")) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
    }
    return false;
  }
};

export default axiosClient;
