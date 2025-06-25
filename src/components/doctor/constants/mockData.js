export const mockPatients = [
  {
    id: "1",
    name: "Nguyễn Thị Mai",
    age: 32,
    gender: "female",
    dob: "1992-03-15",
    contact: "0909123456",
    status: "in-treatment",
    treatmentType: "IVF",
    nextAppointment: "2024-01-20",
    progress: 65,
    servicePackage: "IVF_PREMIUM",
  },
  {
    id: "2",
    name: "Trần Văn Nam",
    age: 35,
    gender: "male",
    dob: "1989-07-22",
    contact: "0912345678",
    status: "consultation",
    treatmentType: "IUI",
    nextAppointment: "2024-01-18",
    progress: 25,
    servicePackage: "IUI_STANDARD",
  },
  {
    id: "3",
    name: "Lê Thị Hoa",
    age: 28,
    gender: "female",
    dob: "1996-12-08",
    contact: "0923456789",
    status: "completed",
    treatmentType: "Natural",
    nextAppointment: null,
    progress: 100,
    servicePackage: "NATURAL_SUPPORT",
  },
];

export const todayAppointments = [
  { time: "09:00", patient: "Nguyễn Thị Mai", type: "Khám định kỳ" },
  { time: "10:30", patient: "Trần Văn Nam", type: "Tư vấn điều trị" },
  { time: "14:00", patient: "Lê Thị Hoa", type: "Theo dõi kết quả" },
];

export const statistics = {
  totalPatients: 45,
  todayAppointments: 8,
  inTreatment: 12,
  completed: 28,
  successRate: 78,
};
