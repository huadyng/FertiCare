import axiosClient from "./axiosClient";

const BASE = "/api/manager/doctor-management";

export const getDoctors = () => {
  return axiosClient.get(BASE);
};

export const createDoctor = (doctor) => {
  return axiosClient.post(BASE, doctor);
};

export const updateDoctor = (id, doctor) => {
  return axiosClient.put(`${BASE}/${id}`, doctor);
};

export const toggleDoctorStatus = (id) => {
  return axiosClient.put(`${BASE}/${id}/status`);
};

const DASHBOARD = "/api/manager/dashboard";

export const getDashboard = () => {
  return axiosClient.get(DASHBOARD).then((res) => res.data); // 🟢 Trả về trực tiếp data
};
const WORK_SHIFT_STATS = "/api/manager/work-shifts/statistics";

export const getWorkShiftStats = () => {
  return axiosClient.get(WORK_SHIFT_STATS).then((res) => res.data); // 🟡 Trả về trực tiếp data
};
