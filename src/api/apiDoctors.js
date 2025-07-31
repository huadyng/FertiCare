import axiosClient from "../services/axiosClient";

export const getDoctors = async () => {
  try {
    const res = await axiosClient.get("/api/doctors");
    console.log("Danh sách bác sĩ nhận được:", res.data);
    return res.data;
  } catch (error) {
    console.error(
      "Lỗi khi gọi API getDoctors:",
      error?.response?.data || error.message
    );
    throw error;
  }
};
