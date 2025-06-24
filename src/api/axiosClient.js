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
    const userData = JSON.parse(storedUser);
    config.headers.Authorization = `Bearer ${userData.token}`;
  }
  return config;
});

export default axiosClient;
