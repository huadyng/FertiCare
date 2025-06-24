import axiosClient from "./axiosClient";

export const apiLogin = async (email, password) => {
  try {
    console.log("🔐 [apiLogin] Gửi dữ liệu đăng nhập:");
    console.log("📧 Email:", email);
    console.log("🔑 Password:", password);

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
};

// Đăng nhập Google
export const apiGoogleLogin = async (googleUser) => {
  try {
    const res = await axiosClient.post("/api/auth/google-login", {
      googleToken: googleUser.credential,
      email: googleUser.email,
      fullName: googleUser.name,
      avatarUrl: googleUser.picture,
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};
