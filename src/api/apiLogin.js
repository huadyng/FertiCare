import React from "react";
import axiosClient from "./axiosClient";

const apiLogin = async (email, password) => {
  try {
    const response = await axiosClient.post("/api/auth/login", {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.log("Lỗi khi đăng nhập", error);
    throw error;
  }
};

export default apiLogin;
