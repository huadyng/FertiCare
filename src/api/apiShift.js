import axiosClient from "./axiosClient";

const BASE_URL = "/api/manager/work-shifts";

export const getAllWorkShifts = async () => {
  const res = await axiosClient.get(BASE_URL);
  return res.data.data; // ✅ chỉ trả về array
};

export const createWorkShift = async (data) => {
  console.log("📤 Payload gửi lên:", data);
  return axiosClient.post(BASE_URL, data);
};

export const updateWorkShift = (id, data) => axiosClient.put(`${BASE_URL}/${id}`, data);
export const deleteWorkShift = (id) => axiosClient.delete(`${BASE_URL}/${id}`);
export const getWorkShiftById = (id) => axiosClient.get(`${BASE_URL}/${id}`);
