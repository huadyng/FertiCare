//Danh sách bác sĩ mẫu
export const getDoctors = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: "1", name: "Bác sĩ A" },
        { id: "2", name: "Bác sĩ B" },
        { id: "3", name: "Bác sĩ C" },
      ]);
    });
  });
};

export const getDoctorSchedule = async (doctorId, date) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        morning: ["08:00", "08:30", "09:00"],
        afternoon: ["14:00", "14:30", "15:00"],
        evening: ["18:00", "18:30"],
      });
    }, 500);
  });
};

// // api/realApi.js
// export const getDoctors = async () => {
//   const response = await fetch("/api/doctors");
//   const data = await response.json();
//   return data;
// };
