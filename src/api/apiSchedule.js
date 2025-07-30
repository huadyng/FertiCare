import axiosClient from "../services/axiosClient";
const BASE_SCHEDULE = "/api/manager/schedule";

// 📥 Lấy danh sách ca trực
export const getAllSchedules = async () => {
  const res = await axiosClient.get(BASE_SCHEDULE);
  return res.data.data; // Trả về trực tiếp mảng data
};

// 📥 Lấy chi tiết 1 ca trực
export const getScheduleById = (id) => {
  return axiosClient.get(`${BASE_SCHEDULE}/${id}`);
};

// ➕ Tạo ca trực mới
export const createSchedule = (data) => {
  return axiosClient.post(BASE_SCHEDULE, data);
};

// ✏️ Cập nhật ca trực
export const updateSchedule = (id, data) => {
  return axiosClient.put(`${BASE_SCHEDULE}/${id}`, data);
};

// ❌ Xóa ca trực
export const deleteSchedule = (id) => {
  return axiosClient.delete(`${BASE_SCHEDULE}/${id}`);
};
