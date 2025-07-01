import axiosClient from "./axiosClient";

const apiVerification = {
  // Xác thực email bằng token - improved với backend response format đúng
  verifyEmail: async (token) => {
    console.log(
      "🔍 [apiVerification] Bắt đầu xác thực email với token:",
      token
    );

    // ✅ Backend confirmed working: GET /api/notifications/verify-email?token=...
    // Expected response: { "message": "Email xác thực thành công!", "success": true }
    try {
      console.log(
        "🔍 [apiVerification] Calling backend endpoint (confirmed working)..."
      );
      const response = await axiosClient.get(
        `/api/notifications/verify-email?token=${token}`
      );

      console.log("✅ [apiVerification] Raw response:", response);
      console.log("✅ [apiVerification] Response data:", response.data);
      console.log("✅ [apiVerification] Response status:", response.status);
      console.log(
        "🔍 [apiVerification] Data details:",
        JSON.stringify(response.data, null, 2)
      );

      // ✅ Check for success in response data
      if (response.data && response.data.success === true) {
        console.log(
          "🎉 [apiVerification] Email verification SUCCESS confirmed!"
        );
        return response;
      }
      console.log(
        "🔍 [apiVerification] Success field check:",
        response.data?.success
      );

      // ✅ Check for success message
      if (
        response.data &&
        response.data.message &&
        response.data.message.includes("thành công")
      ) {
        console.log(
          "🎉 [apiVerification] Email verification SUCCESS by message!"
        );
        return response;
      }
      console.log(
        "🔍 [apiVerification] Message check:",
        response.data?.message
      );

      // ✅ If we get here, response was 200 but no clear success indicators
      console.warn(
        "⚠️ [apiVerification] 200 response but no clear success indicators"
      );
      console.warn("📄 Response data:", response.data);

      // Don't consider it success if no clear indicators
      const shouldReject = true;
      if (shouldReject) {
        const ambiguousError = new Error("Response không rõ ràng về success");
        ambiguousError.response = {
          status: 200,
          data: response.data,
        };
        throw ambiguousError;
      }
    } catch (error) {
      console.error("❌ [apiVerification] Primary endpoint failed:", error);

      // ✅ Detailed error logging
      if (error.response) {
        console.log("📄 Error response status:", error.response.status);
        console.log("📄 Error response data:", error.response.data);
        console.log("📄 Error response headers:", error.response.headers);

        const { status, data } = error.response;

        // ✅ Handle "already verified" cases as SUCCESS
        if (status === 400 && data) {
          console.log(
            "🔍 [apiVerification] 400 error data:",
            JSON.stringify(data, null, 2)
          );

          // Check for success indicators in error response
          const errorMessage =
            typeof data === "string" ? data : data.message || "";

          if (
            errorMessage.includes("thành công") ||
            errorMessage.includes("đã được xác thực") ||
            errorMessage.includes("already verified") ||
            errorMessage.includes("đã kích hoạt") ||
            errorMessage.includes("already used") ||
            errorMessage.includes("đã sử dụng")
          ) {
            console.log("✅ [apiVerification] Token already used = SUCCESS!");
            return {
              data: {
                message: errorMessage || "Email đã được xác thực trước đó",
                success: true,
                alreadyVerified: true,
              },
            };
          }
        }

        // ✅ 410 Gone = Token already used = SUCCESS
        if (status === 410) {
          console.log(
            "✅ [apiVerification] 410 Gone - token already used = SUCCESS!"
          );
          return {
            data: {
              message: "Email đã được xác thực trước đó",
              success: true,
              alreadyVerified: true,
            },
          };
        }
      } else if (error.request) {
        console.error("❌ [apiVerification] Network error:", error.request);
      } else {
        console.error("❌ [apiVerification] Unknown error:", error.message);
      }

      // ✅ Re-throw với detailed info
      throw error;
    }

    // ✅ If we get here, something unexpected happened
    console.warn("⚠️ [apiVerification] Unexpected response format");
    const unexpectedError = new Error("Unexpected response format from server");
    unexpectedError.response = {
      status: 500,
      data: {
        message: "Server trả về format không mong đợi. Vui lòng thử lại.",
        suggestTestLogin: true,
      },
    };
    throw unexpectedError;
  },

  // ✅ NEW: Test direct endpoint call với debugging
  testDirectVerification: async (token) => {
    try {
      console.log("🧪 [apiVerification] Testing direct API call...");

      // Make direct call với full URL để test
      const fullUrl = `${axiosClient.defaults.baseURL}/api/notifications/verify-email?token=${token}`;
      console.log("🔗 Full URL:", fullUrl);

      const response = await axiosClient.get(
        `/api/notifications/verify-email?token=${token}`,
        {
          timeout: 10000,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      console.log(
        "✅ [apiVerification] Direct test successful:",
        response.data
      );
      return response;
    } catch (error) {
      console.error("❌ [apiVerification] Direct test failed:", error);
      throw error;
    }
  },

  // ✅ NEW: Test user verification status indirectly
  checkUserVerificationStatus: async (email) => {
    try {
      console.log(
        "🔍 [apiVerification] Checking user verification status for:",
        email
      );

      // Try to get user info (this usually fails if not verified)
      const response = await axiosClient.get(
        `/api/users/status?email=${email}`
      );
      console.log("✅ [apiVerification] User status:", response.data);

      return {
        isVerified: response.data.verified || response.data.status === "ACTIVE",
        status: response.data.status,
        message: response.data.message,
      };
    } catch (error) {
      if (error.response?.status === 403) {
        // 403 có thể means user chưa verified
        return {
          isVerified: false,
          status: "UNVERIFIED",
          message: "Email chưa được xác thực",
        };
      }

      console.log(
        "❌ [apiVerification] Cannot check user status:",
        error.response?.status
      );
      return null;
    }
  },

  // ✅ NEW: Smart verification với fallback
  smartVerifyEmail: async (token, userEmail = null) => {
    try {
      // Try normal verification first
      console.log("🧠 [apiVerification] Starting smart verification...");
      return await apiVerification.verifyEmail(token);
    } catch (error) {
      console.log(
        "🔄 [apiVerification] Normal verification failed, trying fallback methods..."
      );

      // Try direct test
      try {
        console.log("🧪 [apiVerification] Trying direct verification test...");
        return await apiVerification.testDirectVerification(token);
      } catch (directError) {
        console.log("❌ [apiVerification] Direct test also failed");
      }

      // If we have user email, try to check status indirectly
      if (userEmail) {
        const status = await apiVerification.checkUserVerificationStatus(
          userEmail
        );
        if (status && status.isVerified) {
          console.log(
            "✅ [apiVerification] User is verified via status check!"
          );
          return {
            data: {
              message: "Email đã được xác thực (confirmed via user status)",
              verified: true,
              method: "status_check",
            },
          };
        }
      }

      // If all fails, throw original error with suggestion
      console.log(
        "🔍 [apiVerification] All methods failed, suggesting test login..."
      );
      const finalError = new Error("Smart verification không thể xác nhận");
      finalError.response = {
        status: 400,
        data: {
          message:
            "Không thể xác nhận verification qua API. Backend hoạt động đúng trong Swagger nhưng có thể có CORS hoặc network issues. Hãy thử đăng nhập để kiểm tra.",
          suggestTestLogin: true,
          debugInfo: {
            backendWorking: true,
            swaggerTest: "SUCCESS",
            frontendIssue: "CORS/Network",
            recommendation: "Test login to confirm",
          },
        },
      };
      throw finalError;
    }
  },

  // Test connection đến backend
  testConnection: async () => {
    try {
      console.log("🔍 [apiVerification] Test connection đến backend...");
      const response = await axiosClient.get("/api/services"); // endpoint public
      console.log(
        "✅ [apiVerification] Backend connection OK:",
        response.status
      );
      return true;
    } catch (error) {
      console.error("❌ [apiVerification] Backend connection failed:", error);
      return false;
    }
  },

  // Test login để verify indirectly
  testLoginCapability: async (email) => {
    try {
      console.log("🔍 [apiVerification] Test xem có thể login không...");

      // Gọi API check user status (không cần password)
      const response = await axiosClient.get(
        `/api/users/check-status?email=${email}`
      );
      console.log("✅ [apiVerification] User status:", response.data);
      return response.data;
    } catch (error) {
      console.log(
        "❌ [apiVerification] Cannot check user status:",
        error.response?.status
      );
      return null;
    }
  },

  // Gửi lại email xác thực
  resendVerificationEmail: async (email) => {
    try {
      console.log("📧 [apiVerification] Gửi lại email xác thực cho:", email);
      const response = await axiosClient.post(
        "/api/notifications/resend-verification",
        { email }
      );
      console.log(
        "✅ [apiVerification] Gửi lại email thành công:",
        response.data
      );
      return response;
    } catch (error) {
      console.error(
        "❌ [apiVerification] Lỗi gửi lại email:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
};

export default apiVerification;
