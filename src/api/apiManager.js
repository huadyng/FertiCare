import axiosClient from "../services/axiosClient";

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
