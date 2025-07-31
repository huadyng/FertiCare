import axiosClient from "../services/axiosClient";

export const getPatientAppointments = async (patientId) => {
  const response = await axiosClient.get(
    `/api/appointments/patient/${patientId}/appointments`
  );
  return response.data;
};
