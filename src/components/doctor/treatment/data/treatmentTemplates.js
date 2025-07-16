// Phác đồ mẫu chi tiết cho dịch vụ IVF và IUI
export const treatmentTemplates = {
  IVF: {
    id: "ivf_standard",
    name: "Phác đồ IVF Chuẩn",
    type: "IVF",
    description: "Thụ tinh trong ống nghiệm - Quy trình chuẩn",
    estimatedDuration: "6-8 tuần",
    phases: [
      {
        id: "phase_1",
        name: "Chuẩn bị và Đánh giá",
        duration: "5-7 ngày",
        order: 1,
        activities: [
          {
            day: 1,
            name: "Khám tổng quát và tư vấn",
            type: "consultation",
            duration: 60,
            room: "Phòng khám",
            required: true,
          },
          {
            day: 2,
            name: "Xét nghiệm máu cơ bản",
            type: "test",
            tests: ["AMH", "FSH", "LH", "E2", "TSH"],
            duration: 30,
            room: "Phòng xét nghiệm",
            required: true,
          },
          {
            day: 3,
            name: "Siêu âm âm đạo đánh giá buồng trứng",
            type: "ultrasound",
            duration: 30,
            room: "Phòng siêu âm",
            required: true,
          },
          {
            day: 5,
            name: "Nhận kết quả và lập kế hoạch",
            type: "consultation",
            duration: 45,
            room: "Phòng khám",
            required: true,
          },
        ],
        medications: [],
        notes: "Giai đoạn đánh giá tình trạng sức khỏe và khả năng sinh sản",
      },
      {
        id: "phase_2",
        name: "Kích thích buồng trứng",
        duration: "8-12 ngày",
        order: 2,
        activities: [
          {
            day: 1,
            name: "Bắt đầu tiêm FSH",
            type: "injection",
            duration: 15,
            room: "Phòng tiêm",
            required: true,
          },
          {
            day: 5,
            name: "Siêu âm theo dõi - lần 1",
            type: "ultrasound",
            duration: 30,
            room: "Phòng siêu âm",
            required: true,
          },
          {
            day: 7,
            name: "Siêu âm theo dõi - lần 2",
            type: "ultrasound",
            duration: 30,
            room: "Phòng siêu âm",
            required: true,
          },
          {
            day: 9,
            name: "Siêu âm theo dõi - lần 3",
            type: "ultrasound",
            duration: 30,
            room: "Phòng siêu âm",
            required: true,
          },
          {
            day: 10,
            name: "Tiêm HCG kích thích phóng noãn",
            type: "injection",
            duration: 15,
            room: "Phòng tiêm",
            required: true,
          },
        ],
        medications: [
          {
            name: "Gonal-F (FSH)",
            dosage: "150-300 IU",
            frequency: "1 lần/ngày",
            route: "Tiêm dưới da",
            startDay: 1,
            duration: 8,
          },
          {
            name: "Cetrotide (GnRH antagonist)",
            dosage: "0.25mg",
            frequency: "1 lần/ngày",
            route: "Tiêm dưới da",
            startDay: 5,
            duration: 5,
          },
          {
            name: "Ovitrelle (HCG)",
            dosage: "250mcg",
            frequency: "1 lần",
            route: "Tiêm dưới da",
            startDay: 10,
            duration: 1,
          },
        ],
        notes:
          "Theo dõi chặt chẽ phản ứng buồng trứng, điều chỉnh liều thuốc nếu cần",
      },
      {
        id: "phase_3",
        name: "Lấy trứng và Thụ tinh",
        duration: "3-5 ngày",
        order: 3,
        activities: [
          {
            day: 1,
            name: "Lấy trứng (OPU)",
            type: "procedure",
            duration: 45,
            room: "Phòng phẫu thuật",
            required: true,
            anesthesia: true,
          },
          {
            day: 1,
            name: "Lấy tinh trùng và chuẩn bị",
            type: "procedure",
            duration: 30,
            room: "Phòng lab",
            required: true,
          },
          {
            day: 1,
            name: "Thụ tinh IVF/ICSI",
            type: "laboratory",
            duration: 240,
            room: "Phòng lab",
            required: true,
          },
          {
            day: 3,
            name: "Đánh giá phôi ngày 3",
            type: "laboratory",
            duration: 30,
            room: "Phòng lab",
            required: true,
          },
          {
            day: 5,
            name: "Đánh giá phôi ngày 5 (blastocyst)",
            type: "laboratory",
            duration: 30,
            room: "Phòng lab",
            required: false,
          },
        ],
        medications: [
          {
            name: "Progesterone",
            dosage: "400mg",
            frequency: "2 lần/ngày",
            route: "Đặt âm đạo",
            startDay: 1,
            duration: 14,
          },
        ],
        notes:
          "Thời điểm quan trọng nhất của quy trình, cần nghỉ ngơi sau lấy trứng",
      },
      {
        id: "phase_4",
        name: "Chuyển phôi",
        duration: "1 ngày",
        order: 4,
        activities: [
          {
            day: 1,
            name: "Chuyển phôi vào tử cung",
            type: "procedure",
            duration: 30,
            room: "Phòng phẫu thuật",
            required: true,
          },
        ],
        medications: [
          {
            name: "Progesterone",
            dosage: "400mg",
            frequency: "2 lần/ngày",
            route: "Đặt âm đạo",
            startDay: 1,
            duration: 14,
          },
        ],
        notes:
          "Chuyển phôi tốt nhất (thường ngày 3 hoặc 5), nghỉ ngơi 30 phút sau chuyển",
      },
      {
        id: "phase_5",
        name: "Theo dõi và Xét nghiệm thai",
        duration: "14 ngày",
        order: 5,
        activities: [
          {
            day: 14,
            name: "Xét nghiệm Beta-HCG",
            type: "test",
            duration: 15,
            room: "Phòng xét nghiệm",
            required: true,
          },
          {
            day: 16,
            name: "Xét nghiệm Beta-HCG lần 2",
            type: "test",
            duration: 15,
            room: "Phòng xét nghiệm",
            required: false,
          },
          {
            day: 28,
            name: "Siêu âm xác nhận thai",
            type: "ultrasound",
            duration: 30,
            room: "Phòng siêu âm",
            required: false,
          },
        ],
        medications: [
          {
            name: "Progesterone",
            dosage: "400mg",
            frequency: "2 lần/ngày",
            route: "Đặt âm đạo",
            startDay: 1,
            duration: 14,
          },
        ],
        notes: "Giai đoạn chờ đợi quan trọng, cần duy trì thuốc hỗ trợ",
      },
    ],
    successRate: "40-50%",
    cost: "80-120 triệu VNĐ",
    contraindications: [
      "Ung thư buồng trứng",
      "Ung thư tử cung",
      "Bệnh lý tim mạch nặng",
      "Tuổi > 42",
    ],
    requirements: [
      "Kết quả xét nghiệm máu đầy đủ",
      "Siêu âm đánh giá buồng trứng",
      "Tinh dịch đồ bình thường",
      "Sức khỏe tổng quát tốt",
    ],
  },

  IUI: {
    id: "iui_standard",
    name: "Phác đồ IUI Chuẩn",
    type: "IUI",
    description:
      "Bơm tinh trùng vào buồng tử cung - Quy trình tự nhiên hoặc kích thích",
    estimatedDuration: "2-3 tuần",
    phases: [
      {
        id: "phase_1",
        name: "Chuẩn bị và Đánh giá",
        duration: "3-5 ngày",
        order: 1,
        activities: [
          {
            day: 1,
            name: "Khám phụ khoa và tư vấn",
            type: "consultation",
            duration: 45,
            room: "Phòng khám",
            required: true,
          },
          {
            day: 2,
            name: "Xét nghiệm cơ bản",
            type: "test",
            tests: ["FSH", "LH", "E2", "AMH"],
            duration: 30,
            room: "Phòng xét nghiệm",
            required: true,
          },
          {
            day: 3,
            name: "Siêu âm đánh giá buồng trứng",
            type: "ultrasound",
            duration: 30,
            room: "Phòng siêu âm",
            required: true,
          },
          {
            day: 3,
            name: "Tinh dịch đồ và chuẩn bị tinh trùng",
            type: "test",
            duration: 60,
            room: "Phòng lab",
            required: true,
          },
        ],
        medications: [],
        notes: "Đánh giá khả năng rụng trứng tự nhiên và chất lượng tinh trùng",
      },
      {
        id: "phase_2",
        name: "Theo dõi rụng trứng",
        duration: "7-10 ngày",
        order: 2,
        activities: [
          {
            day: 3,
            name: "Siêu âm theo dõi - lần 1",
            type: "ultrasound",
            duration: 30,
            room: "Phòng siêu âm",
            required: true,
          },
          {
            day: 5,
            name: "Siêu âm theo dõi - lần 2",
            type: "ultrasound",
            duration: 30,
            room: "Phòng siêu âm",
            required: true,
          },
          {
            day: 7,
            name: "Siêu âm xác định rụng trứng",
            type: "ultrasound",
            duration: 30,
            room: "Phòng siêu âm",
            required: true,
          },
        ],
        medications: [
          {
            name: "Clomiphene Citrate",
            dosage: "50-100mg",
            frequency: "1 lần/ngày",
            route: "Uống",
            startDay: 1,
            duration: 5,
            optional: true,
          },
          {
            name: "HCG (Ovitrelle)",
            dosage: "250mcg",
            frequency: "1 lần",
            route: "Tiêm dưới da",
            startDay: 7,
            duration: 1,
            optional: true,
          },
        ],
        notes:
          "Có thể thực hiện chu kỳ tự nhiên hoặc kích thích nhẹ tùy trường hợp",
      },
      {
        id: "phase_3",
        name: "Bơm tinh trùng",
        duration: "1 ngày",
        order: 3,
        activities: [
          {
            day: 1,
            name: "Chuẩn bị tinh trùng",
            type: "laboratory",
            duration: 90,
            room: "Phòng lab",
            required: true,
          },
          {
            day: 1,
            name: "Thực hiện IUI",
            type: "procedure",
            duration: 15,
            room: "Phòng thủ thuật",
            required: true,
          },
        ],
        medications: [],
        notes:
          "Thủ thuật đơn giản, không đau, thực hiện vào thời điểm rụng trứng",
      },
      {
        id: "phase_4",
        name: "Hỗ trợ và Theo dõi",
        duration: "14 ngày",
        order: 4,
        activities: [
          {
            day: 14,
            name: "Xét nghiệm Beta-HCG",
            type: "test",
            duration: 15,
            room: "Phòng xét nghiệm",
            required: true,
          },
          {
            day: 28,
            name: "Siêu âm xác nhận thai (nếu dương tính)",
            type: "ultrasound",
            duration: 30,
            room: "Phòng siêu âm",
            required: false,
          },
        ],
        medications: [
          {
            name: "Progesterone",
            dosage: "200mg",
            frequency: "2 lần/ngày",
            route: "Đặt âm đạo",
            startDay: 1,
            duration: 14,
            optional: true,
          },
        ],
        notes: "Hỗ trợ hoàng thể nếu cần thiết, theo dõi kết quả",
      },
    ],
    successRate: "15-20%",
    cost: "8-15 triệu VNĐ",
    contraindications: [
      "Tắc ống dẫn trứng 2 bên",
      "Tinh trùng quá ít (<5 triệu)",
      "Ung thư phụ khoa",
      "Viêm nhiễm nặng",
    ],
    requirements: [
      "Ít nhất 1 ống dẫn trứng thông thoáng",
      "Tinh trùng tối thiểu 5 triệu",
      "Buồng trứng còn chức năng",
      "Tử cung bình thường",
    ],
  },
};

// Hàm helper để lấy phác đồ theo loại
export const getTemplateByType = (type) => {
  return treatmentTemplates[type] || null;
};

// Hàm tính toán lịch trình dựa trên phác đồ
export const generateScheduleFromTemplate = (template, startDate) => {
  const schedule = [];
  let currentDate;
  try {
    currentDate = new Date(startDate);
    if (isNaN(currentDate.getTime())) throw new Error("Invalid startDate");
  } catch {
    currentDate = new Date(); // fallback to today
  }

  template.phases.forEach((phase, phaseIndex) => {
    (Array.isArray(phase.activities) ? phase.activities : []).forEach(
      (activity, activityIndex) => {
        let activityDate = new Date(currentDate);
        // Nếu activity.day không hợp lệ thì bỏ qua hoặc lấy mặc định là 1
        let dayOffset = 0;
        if (typeof activity.day === "number" && !isNaN(activity.day)) {
          dayOffset = activity.day - 1;
        }
        activityDate.setDate(activityDate.getDate() + dayOffset);
        let dateStr = "";
        try {
          dateStr = activityDate.toISOString().split("T")[0];
        } catch {
          dateStr = "";
        }

        // FIX: Generate unique ID with better fallback
        const phaseId = phase.id || phase.phaseId || `phase_${phaseIndex}`;
        const activityDay = activity.day || activityIndex + 1;
        const timestamp = Date.now() + activityIndex; // Add small offset to ensure uniqueness
        const randomSuffix = Math.random().toString(36).substr(2, 6);
        const uniqueId = `${phaseId}_${activityDay}_${timestamp}_${randomSuffix}`;

        schedule.push({
          id: uniqueId,
          phaseId: phaseId,
          phaseName:
            phase.name || phase.phaseName || `Giai đoạn ${phaseIndex + 1}`,
          date: dateStr,
          activity: activity.name || "Hoạt động",
          type: activity.type || "consultation",
          duration: activity.duration || activity.estimatedDuration || 30,
          room: activity.room || "Phòng khám",
          required:
            activity.required !== undefined
              ? activity.required
              : activity.isRequired !== undefined
              ? activity.isRequired
              : true,
          completed: false,
          order: phaseIndex + 1,
        });
      }
    );
    // Chuyển sang phase tiếp theo
    const phaseDays = (
      Array.isArray(phase.activities) ? phase.activities : []
    ).map((a) => (typeof a.day === "number" && !isNaN(a.day) ? a.day : 1));
    const phaseDuration = Math.max(...phaseDays, 1);
    currentDate.setDate(currentDate.getDate() + phaseDuration);
  });

  return schedule.sort((a, b) => new Date(a.date) - new Date(b.date));
};
