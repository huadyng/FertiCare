import axiosClient from "../services/axiosClient";

const apiForgotPassword = {
  // Gửi email quên mật khẩu
  forgotPassword: async (email) => {
    try {
      const response = await axiosClient.post("/api/notifications/request-password-reset", { email });
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  // Đặt lại mật khẩu
  resetPassword: async (token, newPassword) => {
    try {
      const response = await axiosClient.post("/api/notifications/reset-password", { token, newPassword });
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },
};

export default apiForgotPassword; 