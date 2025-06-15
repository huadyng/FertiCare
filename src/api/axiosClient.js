//Kết nối URL của Backend
import axios from "axios";
const axiosClient = axios.create({
  //"http://localhost:8080" -- http://localhost:3001
  baseURL: "http://localhost:3001", //URL của backend
  headers: { "Content-Type": "application/json" },
  timeout: 1000,
});

export default axiosClient;
