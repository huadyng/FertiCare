import axiosClient from "../services/axiosClient";
import dayjs from "dayjs";

// Helper function để tính toán lịch làm việc cho tháng
const generateMonthlySchedule = (workSchedule, year, month) => {
  if (!workSchedule || !workSchedule.schedules) {
    return [];
  }

  const monthlySchedule = [];
  const startDate = dayjs(`${year}-${month.toString().padStart(2, '0')}-01`);
  const endDate = startDate.endOf('month');
  
  // Tạo lịch cho từng ngày trong tháng
  let currentDate = startDate;
  while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
    const dayOfWeek = currentDate.day(); // 0 = Chủ nhật, 1 = Thứ 2, ..., 6 = Thứ 7
    const adjustedDayOfWeek = dayOfWeek === 0 ? 8 : dayOfWeek + 1; // Chuyển về format BE (2=Thứ 2, 8=Chủ nhật)
    
    // Tìm lịch làm việc cho ngày này
    const daySchedule = workSchedule.schedules.find(schedule => 
      schedule.dayOfWeek === adjustedDayOfWeek
    );
    
    if (daySchedule) {
      monthlySchedule.push({
        id: `${currentDate.format('YYYY-MM-DD')}-${daySchedule.dayOfWeek}`,
        date: currentDate.format('YYYY-MM-DD'),
        time: daySchedule.startTime,
        endTime: daySchedule.endTime,
        type: 'work',
        title: `${daySchedule.startTime} - ${daySchedule.endTime}`,
        status: 'active',
        notes: `Làm việc tại ${daySchedule.room}`,
        location: daySchedule.room,
        workShift: daySchedule.startTime < '12:00' ? 'sang' : 'chieu',
        dayOfWeek: daySchedule.dayOfWeek,
        dayName: daySchedule.dayName,
      });
    }
    
    currentDate = currentDate.add(1, 'day');
  }
  
  return monthlySchedule;
};

// Helper function để tính toán lịch làm việc cho ngày cụ thể
const generateDailySchedule = (workSchedule, date) => {
  if (!workSchedule || !workSchedule.schedules) {
    return [];
  }

  const targetDate = dayjs(date);
  const dayOfWeek = targetDate.day(); // 0 = Chủ nhật, 1 = Thứ 2, ..., 6 = Thứ 7
  const adjustedDayOfWeek = dayOfWeek === 0 ? 8 : dayOfWeek + 1; // Chuyển về format BE
  
  // Tìm lịch làm việc cho ngày này
  const daySchedule = workSchedule.schedules.find(schedule => 
    schedule.dayOfWeek === adjustedDayOfWeek
  );
  
  if (daySchedule) {
    return [{
      id: `${targetDate.format('YYYY-MM-DD')}-${daySchedule.dayOfWeek}`,
      date: targetDate.format('YYYY-MM-DD'),
      time: daySchedule.startTime,
      endTime: daySchedule.endTime,
      type: 'work',
      title: `Ca ${daySchedule.startTime < '12:00' ? 'sáng' : 'chiều'}`,
      status: 'active',
      notes: `Làm việc tại ${daySchedule.room}`,
      location: daySchedule.room,
      workShift: daySchedule.startTime < '12:00' ? 'sang' : 'chieu',
      dayOfWeek: daySchedule.dayOfWeek,
      dayName: daySchedule.dayName,
    }];
  }
  
  return [];
};

const apiDoctorWorkSchedule = {
  // Lấy lịch làm việc của bác sĩ hiện tại
  getMyWorkSchedule: async () => {
    try {
      const response = await axiosClient.get("/api/doctor/schedule/my-schedule");
      return response.data;
    } catch (error) {
      console.error("Error fetching doctor work schedule:", error);
      throw error;
    }
  },

  // Lấy lịch làm việc theo tháng (tính toán từ lịch làm việc cố định)
  getWorkScheduleByMonth: async (year, month) => {
    try {
      // Lấy lịch làm việc cố định của bác sĩ
      const response = await axiosClient.get("/api/doctor/schedule/my-schedule");
      const workSchedule = response.data;
      
      // Tính toán lịch làm việc cho tháng cụ thể
      const monthlySchedule = generateMonthlySchedule(workSchedule, year, month);
      return monthlySchedule;
    } catch (error) {
      console.error("Error fetching work schedule by month:", error);
      throw error;
    }
  },

  // Lấy lịch làm việc theo ngày
  getWorkScheduleByDate: async (date) => {
    try {
      const response = await axiosClient.get("/api/doctor/schedule/my-schedule");
      const workSchedule = response.data;
      
      // Tính toán lịch làm việc cho ngày cụ thể
      const dailySchedule = generateDailySchedule(workSchedule, date);
      return dailySchedule;
    } catch (error) {
      console.error("Error fetching work schedule by date:", error);
      throw error;
    }
  },



  // Lấy lịch làm việc hôm nay
  getTodayWorkSchedule: async () => {
    try {
      const today = dayjs().format('YYYY-MM-DD');
      const response = await axiosClient.get("/api/doctor/schedule/my-schedule");
      const workSchedule = response.data;
      
      // Tính toán lịch làm việc cho hôm nay
      const todaySchedule = generateDailySchedule(workSchedule, today);
      return todaySchedule;
    } catch (error) {
      console.error("Error fetching today's work schedule:", error);
      throw error;
    }
  },

  // Transform data từ BE sang format UI
  transformWorkScheduleData: (data) => {
    if (!data) return [];
    
    // Nếu data đã được tính toán từ helper functions (monthly/daily schedule)
    if (Array.isArray(data)) {
      return data;
    }
    
    // Nếu data là object từ BE (my-schedule endpoint)
    if (data.schedules && Array.isArray(data.schedules)) {
      // Data này là lịch làm việc cố định, cần được xử lý bởi helper functions
      return [];
    }
    
    // Nếu data là array của DoctorScheduleDTO
    if (Array.isArray(data) && data.length > 0 && data[0].workSchedules) {
      const result = [];
      data.forEach(doctor => {
        if (doctor.workSchedules) {
          doctor.workSchedules.forEach(schedule => {
            result.push({
              id: `${doctor.id}-${schedule.dayOfWeek}`,
              date: null, // Sẽ được tính toán bởi helper functions
              time: schedule.startTime,
              endTime: schedule.endTime,
              type: 'work',
              title: `${schedule.startTime} - ${schedule.endTime}`,
              status: 'active',
              notes: `Làm việc tại ${schedule.room}`,
              location: schedule.room,
              workShift: schedule.startTime < '12:00' ? 'sang' : 'chieu',
              dayOfWeek: schedule.dayOfWeek,
              dayName: schedule.dayName,
              doctorId: doctor.id,
              doctorName: doctor.name,
            });
          });
        }
      });
      return result;
    }
    
    return [];
  },


};

export default apiDoctorWorkSchedule; 