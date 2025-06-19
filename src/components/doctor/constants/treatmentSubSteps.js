export const subStepConfigs = {
  IVF_PREMIUM: [
    {
      title: "Chuẩn bị",
      description: "Kiểm tra sức khỏe tổng quát",
      duration: "1-2 tuần",
    },
    {
      title: "Kích thích buồng trứng",
      description: "Tiêm hormone FSH/LH",
      duration: "10-14 ngày",
    },
    {
      title: "Theo dõi nang trứng",
      description: "Siêu âm định kỳ",
      duration: "5-7 ngày",
    },
    {
      title: "Chọc hút trứng",
      description: "Thu thập trứng từ buồng trứng",
      duration: "1 ngày",
    },
    {
      title: "Thụ tinh ống nghiệm",
      description: "Kết hợp tinh trùng và trứng",
      duration: "3-5 ngày",
    },
    {
      title: "Chuyển phôi",
      description: "Đưa phôi vào tử cung",
      duration: "1 ngày",
    },
    {
      title: "Theo dõi thai",
      description: "Kiểm tra kết quả",
      duration: "2 tuần",
    },
  ],
  IUI_STANDARD: [
    {
      title: "Chuẩn bị",
      description: "Kiểm tra chu kỳ kinh nguyệt",
      duration: "1 tuần",
    },
    {
      title: "Kích thích buồng trứng nhẹ",
      description: "Thuốc kích thích",
      duration: "5-7 ngày",
    },
    {
      title: "Theo dõi phóng noãn",
      description: "Siêu âm và xét nghiệm",
      duration: "3-5 ngày",
    },
    {
      title: "Đưa tinh trùng vào tử cung",
      description: "Thủ thuật IUI",
      duration: "1 ngày",
    },
    {
      title: "Theo dõi kết quả",
      description: "Kiểm tra có thai",
      duration: "2 tuần",
    },
  ],
  NATURAL_SUPPORT: [
    {
      title: "Tư vấn lối sống",
      description: "Chế độ ăn uống, tập luyện",
      duration: "1 tuần",
    },
    {
      title: "Theo dõi chu kỳ",
      description: "Ghi nhận thời gian rụng trứng",
      duration: "1-3 tháng",
    },
    {
      title: "Hỗ trợ dinh dưỡng",
      description: "Bổ sung vitamin",
      duration: "Liên tục",
    },
    {
      title: "Kiểm tra định kỳ",
      description: "Khám sức khỏe",
      duration: "Hàng tháng",
    },
  ],
};

export const getScheduleSubSteps = (servicePackage) => {
  return subStepConfigs[servicePackage] || subStepConfigs.IVF_PREMIUM;
};
