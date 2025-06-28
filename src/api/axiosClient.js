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

export default axiosClient;
