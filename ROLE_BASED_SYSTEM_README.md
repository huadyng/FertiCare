# 🩺 FertiCare - Hệ thống phân quyền dựa trên vai trò

## Tổng quan

Hệ thống FertiCare đã được cập nhật với hệ thống phân quyền hoàn chỉnh cho 4 vai trò chính:

- **👨‍💼 Admin**: Quản trị viên hệ thống
- **👩‍💼 Manager**: Quản lý nhóm bác sĩ
- **👨‍⚕️ Doctor**: Bác sĩ điều trị
- **🤱 Patient**: Bệnh nhân

## 🚀 Demo nhanh

Để test hệ thống, truy cập: `/mock-login`

Tại đây bạn có thể đăng nhập với các vai trò khác nhau để trải nghiệm giao diện riêng biệt.

## 📋 Cấu trúc hệ thống

### 1. Context & Authentication

- `src/context/UserContext.jsx`: Quản lý trạng thái người dùng và phân quyền
- `src/components/auth/ProtectedRoute.jsx`: Bảo vệ route theo vai trò
- `src/components/auth/MockLogin.jsx`: Demo đăng nhập (chỉ dùng cho testing)

### 2. Layouts theo vai trò

- `src/components/layout/AdminLayout.jsx`: Layout cho Admin
- `src/components/layout/ManagerLayout.jsx`: Layout cho Manager
- `src/components/layout/DoctorLayout.jsx`: Layout cho Doctor
- `src/components/layout/PatientLayout.jsx`: Layout cho Patient
- `src/components/layout/Layout.css`: Styles cho tất cả layouts

### 3. Dashboards

- `src/components/dashboards/AdminDashboard.jsx`: Dashboard Admin với thống kê tổng quan
- `src/components/dashboards/PatientDashboard.jsx`: Dashboard Patient với tiến trình điều trị

## 🎨 Thiết kế UI/UX

### Màu sắc theo vai trò:

- **Admin**: Xanh dương (#1890ff) - Uy tín, chuyên nghiệp
- **Manager**: Xanh lá (#52c41a) - Tăng trưởng, quản lý
- **Doctor**: Tím (#722ed1) - Y tế, khoa học
- **Patient**: Đỏ nhẹ (#ff4d4f) - Quan tâm, chăm sóc

### Features UI:

- Responsive design cho mobile và desktop
- Smooth animations và transitions
- Modern gradient backgrounds
- Interactive hover effects
- Professional icons và typography

## 🛣️ Routing Structure

```
/                          - Homepage công khai
/login                     - Đăng nhập
/register                  - Đăng ký
/mock-login               - Demo login (testing)

/admin/*                  - Khu vực Admin
  ├── /dashboard          - Dashboard tổng quan
  ├── /users              - Quản lý người dùng
  ├── /departments        - Quản lý phòng ban
  ├── /doctors            - Quản lý bác sĩ
  ├── /schedule           - Quản lý lịch trình
  ├── /reports            - Báo cáo hệ thống
  └── /settings           - Cài đặt hệ thống

/manager/*                - Khu vực Manager
  ├── /dashboard          - Dashboard nhóm
  ├── /doctors            - Quản lý bác sĩ nhóm
  ├── /schedule           - Lịch trình nhóm
  ├── /shift-management   - Phân ca làm việc
  ├── /treatment-approval - Duyệt phác đồ
  └── /reports            - Báo cáo nhóm

/doctor-panel/*           - Khu vực Doctor
  ├── /dashboard          - Dashboard cá nhân
  ├── /patients           - Danh sách bệnh nhân
  ├── /treatment-plans    - Phác đồ điều trị
  ├── /clinical-examination - Khám lâm sàng
  ├── /treatment-monitoring - Theo dõi điều trị
  ├── /schedule           - Lịch làm việc
  └── /reports            - Báo cáo cá nhân

/patient/*                - Khu vực Patient
  ├── /dashboard          - Tổng quan điều trị
  ├── /treatment-process  - Tiến trình điều trị
  ├── /schedule           - Lịch khám
  ├── /medical-records    - Hồ sơ y tế
  ├── /history            - Lịch sử khám
  └── /notifications      - Thông báo
```

## 🔐 Phân quyền chi tiết

### Admin - Toàn quyền hệ thống

```javascript
{
  canManageUsers: true,
  canManageDepartments: true,
  canViewReports: true,
  canManageSystem: true,
  canAccessAll: true
}
```

### Manager - Quản lý nhóm

```javascript
{
  canManageDoctors: true,
  canManageSchedule: true,
  canViewTeamReports: true,
  canManageTeam: true
}
```

### Doctor - Điều trị bệnh nhân

```javascript
{
  canManagePatients: true,
  canCreateTreatmentPlan: true,
  canViewOwnSchedule: true,
  canUpdateTreatmentStatus: true
}
```

### Patient - Xem thông tin cá nhân

```javascript
{
  canViewTreatmentProcess: true,
  canViewSchedule: true,
  canViewNotifications: true,
  canViewProfile: true
}
```

## 🔧 Cách sử dụng

### 1. Kiểm tra quyền trong component:

```jsx
import { useContext } from "react";
import { UserContext } from "../context/UserContext";

function MyComponent() {
  const { hasPermission, hasRole } = useContext(UserContext);

  return (
    <div>
      {hasPermission("canManageUsers") && <button>Quản lý người dùng</button>}

      {hasRole("admin") && <AdminPanel />}
    </div>
  );
}
```

### 2. Bảo vệ route:

```jsx
import { AdminRoute } from "../components/auth/ProtectedRoute";

<Route
  path="/admin"
  element={
    <AdminRoute>
      <AdminPanel />
    </AdminRoute>
  }
/>;
```

### 3. Auto redirect sau login:

```jsx
const { getDashboardPath } = useContext(UserContext);
navigate(getDashboardPath()); // Tự động chuyển đến dashboard phù hợp
```

## 📱 Responsive Design

- **Desktop**: Full sidebar và tất cả features
- **Tablet**: Collapsible sidebar, compact layout
- **Mobile**: Drawer navigation, stacked layout

## 🚧 Tính năng sẽ phát triển

### Admin Features:

- [ ] User management CRUD
- [ ] Department management
- [ ] System settings
- [ ] Advanced reports
- [ ] Audit logs

### Manager Features:

- [ ] Doctor scheduling
- [ ] Team performance analytics
- [ ] Treatment plan approval workflow
- [ ] Resource allocation

### Doctor Features:

- [ ] Patient management
- [ ] Treatment plan creation
- [ ] Clinical examination forms
- [ ] Progress tracking
- [ ] Appointment scheduling

### Patient Features:

- [ ] Treatment timeline
- [ ] Appointment booking
- [ ] Medical record viewing
- [ ] Communication with doctors
- [ ] Educational resources

## 🛠️ Dependencies mới

```json
{
  "@ant-design/plots": "^2.2.6" // Cho charts và graphs
}
```

## 🎯 Best Practices

1. **Security First**: Luôn validate quyền ở cả frontend và backend
2. **User Experience**: Mỗi vai trò có UX được tối ưu riêng
3. **Responsive**: Test trên tất cả thiết bị
4. **Performance**: Lazy load các components không cần thiết
5. **Accessibility**: Tuân thủ WCAG guidelines

## 🐛 Debugging

### Common Issues:

1. **403 Forbidden**: User không có quyền truy cập

   - Check user role và permissions
   - Verify ProtectedRoute setup

2. **Infinite redirect**: Loop trong authentication

   - Check getDashboardPath() logic
   - Verify default routes

3. **Layout không load**: Import issues
   - Check component paths
   - Verify CSS imports

## 📞 Support

Nếu có vấn đề hoặc câu hỏi về hệ thống phân quyền, vui lòng tạo issue hoặc liên hệ team phát triển.

---

**Happy Coding! 🚀**
