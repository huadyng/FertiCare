import axiosClient from "../services/axiosClient";

const apiRegist = {
  register: (userData) => {
    return axiosClient.post("/api/users", userData);
  },
};

export default apiRegist;
