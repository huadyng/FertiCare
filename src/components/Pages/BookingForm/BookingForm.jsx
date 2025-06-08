import React, { useState } from "react";
import "./BookingForm.css";

const citiesData = {
  "Hồ Chí Minh": {
    "Quận 1": ["Phường Bến Nghé", "Phường Bến Thành", "Phường Tân Định"],
    "Quận 3": [
      "Phường Võ Thị Sáu",
      "Phường Phạm Ngũ Lão",
      "Phường Nguyễn Thái Bình",
    ],
  },
  "Hà Nội": {
    "Quận Hoàn Kiếm": [
      "Phường Hàng Trống",
      "Phường Hàng Bồ",
      "Phường Cửa Đông",
    ],
    "Quận Ba Đình": ["Phường Phúc Xá", "Phường Trúc Bạch", "Phường Vĩnh Phúc"],
  },
};

function BookingForm() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    date: "",
    time: "",
    service: "",
    notes: "",
    city: "",
    district: "",
    ward: "",
    addressDetail: "",
  });

  const handleCityChange = (e) => {
    const city = e.target.value;
    setFormData((prev) => ({
      ...prev,
      city,
      district: "",
      ward: "",
    }));
  };

  const handleDistrictChange = (e) => {
    const district = e.target.value;
    setFormData((prev) => ({
      ...prev,
      district,
      ward: "",
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Đặt lịch thành công cho ${formData.name} vào ngày ${formData.date} lúc ${formData.time}
Địa chỉ: ${formData.addressDetail}, ${formData.ward}, ${formData.district}, ${formData.city}`);
  };

  const districts = formData.city ? Object.keys(citiesData[formData.city]) : [];
  const wards =
    formData.city && formData.district
      ? citiesData[formData.city][formData.district]
      : [];

  return (
    <div className="booking fullpage">
      <div className="booking-wrapper">
        <h2 className="booking-title">Đặt lịch khám</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-box">
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Họ tên"
              required
            />
          </div>
          <div className="input-box">
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Số điện thoại"
              required
            />
          </div>
          <div className="input-box">
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              type="email"
            />
          </div>
          <div className="input-box">
            <input
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-box">
            <input
              name="time"
              type="time"
              value={formData.time}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-box">
            <select
              name="service"
              value={formData.service}
              onChange={handleChange}
              required
            >
              <option value="">Chọn dịch vụ khám</option>
              <option value="kham-tong-quat">Khám tổng quát</option>
              <option value="kham-chuyen-khoa">Khám chuyên khoa</option>
            </select>
          </div>
          <div className="input-box">
            <input
              name="addressDetail"
              value={formData.addressDetail}
              onChange={handleChange}
              placeholder="Số nhà, tên đường"
              required
            />
          </div>
          <div className="input-box">
            <select
              name="city"
              value={formData.city}
              onChange={handleCityChange}
              required
            >
              <option value="">Chọn thành phố</option>
              {Object.keys(citiesData).map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
          <div className="input-box">
            <select
              name="district"
              value={formData.district}
              onChange={handleDistrictChange}
              required
              disabled={!formData.city}
            >
              <option value="">Chọn quận</option>
              {districts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>
          <div className="input-box">
            <select
              name="ward"
              value={formData.ward}
              onChange={handleChange}
              required
              disabled={!formData.district}
            >
              <option value="">Chọn phường</option>
              {wards.map((ward) => (
                <option key={ward} value={ward}>
                  {ward}
                </option>
              ))}
            </select>
          </div>
          <div className="input-box">
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Ghi chú"
            />
          </div>
          <button type="submit" className="booking-btn">
            Đặt lịch
          </button>
          <p className="notes">Thông tin của bạn sẽ được bảo mật.</p>
          <div className="back-link">
            <span onClick={() => window.history.back()}>
              ← Quay lại trang trước
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BookingForm;
