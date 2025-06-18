# Hướng dẫn sử dụng các tính năng mới

## 🏥 Tính năng Manager (Quản lý)

### 1. Quản lý Bác sĩ (`/manager/doctors`)

#### Tính năng chính:

- **Quản lý thông tin bác sĩ**: Thêm, sửa, xóa thông tin bác sĩ
- **Theo dõi hiệu suất**: Đánh giá, số bệnh nhân, tỷ lệ thành công
- **Quản lý lịch làm việc**: Thiết lập lịch trình cho từng bác sĩ
- **Phân loại theo chuyên khoa**: Sắp xếp theo khoa/phòng
- **Báo cáo chi tiết**: Thống kê hiệu suất và đánh giá

#### Cách sử dụng:

1. **Thêm bác sĩ mới**: Nhấp "Thêm bác sĩ" → Điền thông tin → Lưu
2. **Chỉnh sửa thông tin**: Nhấp icon "Chỉnh sửa" → Cập nhật → Lưu
3. **Quản lý lịch**: Nhấp icon "Lịch làm việc" → Thiết lập ca → Lưu
4. **Xem hiệu suất**: Nhấp icon "Xem chi tiết" → Xem báo cáo

### 2. Quản lý Lịch trình (`/manager/schedule`)

#### Tính năng chính:

- **Lịch trực quan**: Hiển thị dạng lịch và bảng
- **Phân loại ca làm**: Sáng, chiều, tối với mã màu khác nhau
- **Quản lý phòng**: Phân bổ phòng cho từng lịch trình
- **Giới hạn bệnh nhân**: Thiết lập số lượng bệnh nhân tối đa
- **Trạng thái duyệt**: Quản lý trạng thái chờ duyệt/đã duyệt

#### Cách sử dụng:

1. **Thêm lịch trình**: Nhấp "Thêm lịch trình" → Chọn bác sĩ, thời gian → Lưu
2. **Chuyển đổi view**: Chọn "Lịch" hoặc "Bảng" ở dropdown
3. **Lọc dữ liệu**: Sử dụng các bộ lọc theo bác sĩ, loại lịch
4. **Duyệt lịch**: Thay đổi trạng thái trong cột "Trạng thái"

### 3. Phân ca Hệ thống (`/manager/shift-management`)

#### Tính năng chính:

- **Phân công nhân sự**: Gán nhân viên vào từng ca làm việc
- **Theo dõi workload**: Giám sát giờ làm việc của nhân viên
- **Cảnh báo thiếu nhân sự**: Thông báo khi ca làm việc thiếu người
- **Sao chép ca**: Tạo ca mới từ template có sẵn
- **Quản lý ưu tiên**: Đặt mức độ ưu tiên cho từng ca

#### Cách sử dụng:

1. **Tạo ca làm việc**: Nhấp "Thêm ca làm việc" → Thiết lập yêu cầu nhân sự
2. **Phân công**: Nhấp "Phân công" ở cột "Đã phân công" → Chọn nhân viên
3. **Sao chép ca**: Nhấp icon "Sao chép" → Ca mới sẽ được tạo
4. **Theo dõi trạng thái**: Xem màu sắc của trạng thái ca (xanh=đủ, đỏ=thiếu)

---

## ⚙️ Tính năng Admin (Quản trị)

### 1. Báo cáo Hệ thống (`/admin/reports`)

#### Tính năng chính:

- **Dashboard tổng quan**: Thống kê tổng thể về hệ thống
- **Biểu đồ xu hướng**: Theo dõi xu hướng theo thời gian
- **Báo cáo hiệu suất**: Đánh giá hiệu suất bác sĩ và điều trị
- **Báo cáo tài chính**: Thống kê doanh thu theo khoa/tháng
- **Xuất báo cáo**: Export Excel, PDF, in ấn

#### Các tab báo cáo:

- **Tổng quan**: Xu hướng tổng thể, phân bố theo khoa
- **Hiệu suất điều trị**: Tỷ lệ thành công các loại điều trị
- **Hiệu suất bác sĩ**: Ranking bác sĩ theo các tiêu chí
- **Báo cáo tài chính**: Doanh thu chi tiết theo khoa

#### Cách sử dụng:

1. **Lọc thời gian**: Chọn khoảng thời gian cần báo cáo
2. **Chọn khoa**: Lọc theo khoa/phòng cụ thể
3. **Thay đổi biểu đồ**: Chọn loại biểu đồ (đường, cột, vùng)
4. **Xuất báo cáo**: Nhấp "Xuất Excel" hoặc "In báo cáo"

### 2. Cài đặt Hệ thống (`/admin/settings`)

#### Tính năng chính:

- **Cài đặt tổng quát**: Tên hệ thống, múi giờ, ngôn ngữ
- **Cấu hình Email**: Thiết lập SMTP để gửi thông báo
- **Cài đặt thông báo**: Cấu hình các loại thông báo
- **Bảo mật**: Chính sách mật khẩu, kiểm soát truy cập
- **Sao lưu**: Thiết lập tự động sao lưu dữ liệu
- **Bảo trì**: Chế độ bảo trì hệ thống

#### Các tab cài đặt:

##### **Tổng quát**:

- Tên hệ thống, phiên bản
- Múi giờ, ngôn ngữ, định dạng ngày
- Kích thước file tối đa, thời gian session

##### **Email**:

- Cấu hình SMTP (host, port, authentication)
- Email gửi từ, tên hiển thị
- Test email để kiểm tra cấu hình

##### **Thông báo**:

- Bật/tắt các loại thông báo (Email, SMS, Push)
- Thiết lập thời gian nhắc nhở
- Cảnh báo hệ thống

##### **Bảo mật**:

- Chính sách mật khẩu (độ dài, ký tự đặc biệt)
- Kiểm soát đăng nhập (số lần sai, thời gian khóa)
- Xác thực 2 yếu tố, IP whitelist

##### **Sao lưu**:

- Bật/tắt sao lưu tự động
- Tần suất sao lưu (hàng giờ/ngày/tuần/tháng)
- Thời gian lưu trữ, vị trí sao lưu
- Sao lưu thủ công

##### **Bảo trì**:

- Bật/tắt chế độ bảo trì
- Thông báo bảo trì tùy chỉnh
- IP được phép truy cập khi bảo trì
- Lên lịch bảo trì

##### **Nhật ký**:

- Xem lịch sử hoạt động hệ thống
- Lọc theo mức độ (INFO, WARNING, ERROR)
- Xuất nhật ký ra file

#### Cách sử dụng:

1. **Chọn tab**: Nhấp vào tab tương ứng với cài đặt cần thay đổi
2. **Chỉnh sửa**: Thay đổi các giá trị theo nhu cầu
3. **Test (nếu có)**: Kiểm tra cấu hình (như test email)
4. **Lưu**: Nhấp "Lưu cài đặt" để áp dụng thay đổi

---

## 🚀 Tính năng nổi bật

### Performance Optimization:

- **Lazy Loading**: Tất cả component được load khi cần
- **Code Splitting**: Tách code theo từng tính năng
- **Caching**: Cache dữ liệu để tăng tốc độ

### User Experience:

- **Responsive Design**: Tương thích mọi thiết bị
- **Loading States**: Hiển thị trạng thái loading rõ ràng
- **Error Handling**: Xử lý lỗi và thông báo thân thiện
- **Accessibility**: Hỗ trợ người dùng khuyết tật

### Security:

- **Role-based Access**: Phân quyền theo vai trò
- **Session Management**: Quản lý phiên đăng nhập
- **Data Validation**: Kiểm tra dữ liệu đầu vào
- **Audit Trail**: Theo dõi hoạt động người dùng

---

## 📱 Hướng dẫn Navigation

### Truy cập tính năng Manager:

1. Đăng nhập với tài khoản Manager
2. Vào `/manager` hoặc nhấp menu "Manager"
3. Chọn tính năng từ sidebar:
   - **Doctors**: Quản lý bác sĩ
   - **Schedule**: Quản lý lịch trình
   - **Shift Management**: Phân ca hệ thống

### Truy cập tính năng Admin:

1. Đăng nhập với tài khoản Admin
2. Vào `/admin` hoặc nhấp menu "Admin"
3. Chọn tính năng từ sidebar:
   - **Reports**: Báo cáo hệ thống
   - **Settings**: Cài đặt hệ thống

---

## 🔧 Technical Stack

### Frontend:

- **React 19.1.0**: UI framework
- **Ant Design 5.25.4**: Component library
- **React Router Dom 7.6.2**: Routing
- **Recharts 2.15.3**: Charts and graphs
- **Moment.js 2.30.1**: Date/time handling

### Development:

- **Vite 6.3.5**: Build tool
- **ESLint**: Code linting
- **Concurrent**: Development server

### Features:

- **Lazy Loading**: Performance optimization
- **Context API**: State management
- **Custom Hooks**: Reusable logic
- **Constants & Utils**: Code organization

---

## 🐛 Troubleshooting

### Lỗi thường gặp:

1. **Component không load**:

   - Kiểm tra import paths
   - Xem console errors
   - Reload trang

2. **Permission denied**:

   - Kiểm tra role của user
   - Đăng nhập lại
   - Liên hệ admin

3. **Dữ liệu không hiển thị**:
   - Kiểm tra network tab
   - Xem API responses
   - Làm mới dữ liệu

### Liên hệ hỗ trợ:

- **Email**: support@fertility.com
- **Phone**: 1900-xxx-xxx
- **Docs**: Xem tài liệu chi tiết tại `/docs`

---

_Cập nhật lần cuối: Tháng 1, 2024_
