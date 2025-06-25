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
      }
    } catch (e) {
      console.warn("User data không hợp lệ:", e);
    }
  }
  return config;
});

export default axiosClient;
