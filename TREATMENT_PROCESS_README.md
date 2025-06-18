# 🏥 Hệ Thống Quản Lý Quy Trình Khám & Theo Dõi Điều Trị

## 📋 Tổng Quan

Hệ thống quản lý quy trình khám và theo dõi điều trị hỗ trợ sinh sản được xây dựng với React + Antd, bao gồm 5 bước chính:

1. **Khám lâm sàng** - Nhập kết quả khám và xét nghiệm
2. **Lập phác đồ điều trị** - Chọn template và cá nhân hóa
3. **Tạo lịch trình điều trị** - Lập lịch các buổi điều trị
4. **Xem lịch trình** - Giao diện cho bệnh nhân theo dõi
5. **Thông báo & nhắc nhở** - Hệ thống notification

## 🚀 Demo

**ĐÃ XÓA**: Route `/treatment-demo` không còn tồn tại. Sử dụng `/doctor/dashboard` thay thế.

## 📁 Cấu Trúc File

```
src/
├── components/
│   ├── treatment/
│   │   ├── ExaminationForm.jsx          # Bước 1-2: Form khám lâm sàng
│   │   ├── TreatmentPlanEditor.jsx      # Bước 3: Lập phác đồ điều trị
│   │   ├── TreatmentScheduleForm.jsx    # Bước 4: Tạo lịch trình
│   │   ├── PatientScheduleView.jsx      # Bước 5: Xem lịch trình
│   │   ├── TreatmentProcess.jsx         # Component chính (Stepper)
│   │   └── index.js                     # Export components
│   └── pages/
│       └── (TreatmentDemo.jsx - ĐÃ XÓA)    # Đã tích hợp vào Doctor Dashboard
├── services/
│   └── treatmentAPI.js                  # API services
└── db.json                              # Mock data
```

## 🔧 Cài Đặt & Chạy

### 1. Cài đặt dependencies (nếu chưa có)

```bash
npm install
```

### 2. Chạy json-server (mock API)

```bash
npm run server
# hoặc
json-server --watch db.json --port 3001
```

### 3. Chạy ứng dụng React

```bash
npm run dev
```

### 4. Truy cập demo

```
**THAY THẾ BẰNG**: http://localhost:3002/doctor/dashboard (sau khi đăng nhập qua /mock-login)
```

## 📊 Các Component Chính

### 🔍 1. ExaminationForm

- **Mục đích**: Nhập kết quả khám lâm sàng và xét nghiệm
- **Tính năng**:
  - Form nhập triệu chứng (với tags có sẵn)
  - Nhập dấu hiệu lâm sàng (huyết áp, nhiệt độ, v.v.)
  - Kết quả xét nghiệm máu (FSH, LH, E2, v.v.)
  - Upload file đính kèm
  - Kết quả siêu âm
  - Chuẩn đoán và khuyến nghị

```jsx
<ExaminationForm
  patientId="1"
  patientInfo={patientData}
  onNext={(data) => console.log(data)}
/>
```

### 💊 2. TreatmentPlanEditor

- **Mục đích**: Chọn template phác đồ và cá nhân hóa
- **Tính năng**:
  - Chọn template phác đồ (IVF, IUI)
  - Hiển thị chi tiết các giai đoạn điều trị
  - Chỉnh sửa thuốc (liều lượng, tần suất)
  - Thêm thuốc mới
  - Thêm xét nghiệm bổ sung
  - Ghi chú cá nhân hóa

```jsx
<TreatmentPlanEditor
  patientId="1"
  patientInfo={patientData}
  examinationData={examData}
  onNext={(data) => console.log(data)}
/>
```

### 📅 3. TreatmentScheduleForm

- **Mục đích**: Tạo lịch trình các buổi điều trị
- **Tính năng**:
  - Calendar picker
  - Quản lý các loại buổi điều trị
  - Chọn phòng và nhân viên
  - Thiết lập thời gian và ghi chú
  - View dạng bảng và calendar

```jsx
<TreatmentScheduleForm
  patientId="1"
  patientInfo={patientData}
  treatmentPlan={planData}
  onNext={(data) => console.log(data)}
/>
```

### 👤 4. PatientScheduleView

- **Mục đích**: Giao diện cho bệnh nhân xem lịch trình
- **Tính năng**:
  - Hiển thị tiến độ điều trị
  - Danh sách buổi sắp tới
  - Timeline điều trị
  - Calendar view
  - Chi tiết từng buổi điều trị
  - Thông báo nhắc nhở

```jsx
<PatientScheduleView
  patientId="1"
  patientInfo={patientData}
  isPatientView={true}
/>
```

### 🔄 5. TreatmentProcess

- **Mục đích**: Component chính điều phối toàn bộ quy trình
- **Tính năng**:
  - Stepper hiển thị tiến độ
  - Navigation giữa các bước
  - Quản lý state của toàn bộ quy trình
  - Kết nối dữ liệu giữa các bước

```jsx
<TreatmentProcess
  patientId="1"
  mode="doctor" // hoặc "patient"
/>
```

## 🗃️ Cấu Trúc Dữ Liệu

### Mock Data trong db.json

```json
{
  "examinationResults": [...],    // Kết quả khám
  "treatmentTemplates": [...],    // Template phác đồ
  "treatmentPlans": [...],        // Phác đồ cá nhân hóa
  "treatmentSchedules": [...],    // Lịch trình điều trị
  "rooms": [...],                 // Danh sách phòng
  "staff": [...],                 // Nhân viên
  "doctors": [...]                // Bác sĩ
}
```

### API Endpoints

```javascript
// Examination APIs
GET    /examinationResults?patientId=1
POST   /examinationResults
PUT    /examinationResults/:id

// Treatment Template APIs
GET    /treatmentTemplates
GET    /treatmentTemplates/:id
GET    /treatmentTemplates?type=IVF

// Treatment Plan APIs
GET    /treatmentPlans?patientId=1
POST   /treatmentPlans
PUT    /treatmentPlans/:id

// Schedule APIs
GET    /treatmentSchedules?patientId=1
POST   /treatmentSchedules
PUT    /treatmentSchedules/:id
```

## 🎨 UI/UX Features

### Design Patterns

- **Stepper Navigation**: Hiển thị tiến độ quy trình
- **Card Layout**: Tổ chức thông tin rõ ràng
- **Tabs Interface**: Phân chia nội dung logic
- **Modal Dialogs**: Chi tiết và chỉnh sửa
- **Calendar Integration**: Lập lịch trực quan
- **Color Coding**: Phân biệt loại điều trị

### Responsive Design

- Desktop first approach
- Mobile-friendly layout
- Collapsible sidebar
- Optimized table views

### Accessibility

- Keyboard navigation
- Screen reader support
- Color contrast compliance
- Focus management

## 🔌 API Integration

### Mock API (Development)

```javascript
// services/treatmentAPI.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

export const examinationAPI = {
  getExaminationResults: async (patientId) => {...},
  createExaminationResult: async (data) => {...},
  updateExaminationResult: async (id, data) => {...}
};
```

### Production API

Để chuyển sang API thật, chỉ cần thay đổi `API_BASE_URL` và cập nhật endpoint URLs.

## 📝 Customization

### Thêm loại điều trị mới

```javascript
// Trong TreatmentScheduleForm.jsx
const sessionTypes = [
  {
    value: "new-treatment",
    label: "Điều trị mới",
    icon: <NewIcon />,
    color: "purple",
  },
  // ... existing types
];
```

### Thêm template phác đồ mới

```json
// Trong db.json
{
  "id": "new-template",
  "name": "Phác đồ mới",
  "type": "NEW_TYPE",
  "description": "Mô tả phác đồ mới",
  "phases": [...]
}
```

### Custom styling

```css
/* Trong App.css hoặc component styles */
.treatment-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.treatment-stepper {
  margin: 24px 0;
}
```

## 🚀 Deployment

### Build for production

```bash
npm run build
```

### Deploy static files

```bash
# Copy dist/ folder to web server
cp -r dist/* /var/www/html/
```

### Environment Variables

```env
VITE_API_BASE_URL=https://api.example.com
VITE_APP_NAME=Treatment System
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] Khám lâm sàng: Form validation, file upload
- [ ] Lập phác đồ: Template selection, customization
- [ ] Tạo lịch trình: Calendar integration, session management
- [ ] Xem lịch trình: Timeline, progress tracking
- [ ] Navigation: Stepper functionality, data persistence

### Unit Testing (Future)

```javascript
// Example test structure
describe("ExaminationForm", () => {
  it("should validate required fields", () => {});
  it("should handle file upload", () => {});
  it("should submit form data", () => {});
});
```

## 📞 Support

### Common Issues

**1. Mock API not working**

```bash
# Make sure json-server is running
npm run server
# Check if port 3001 is available
```

**2. Components not loading**

```bash
# Check import paths
// TreatmentDemo đã được xóa - sử dụng DoctorDashboard thay thế
import { DoctorDashboard } from './components/doctor';
```

**3. Styling issues**

```bash
# Make sure Antd CSS is imported
import 'antd/dist/reset.css';
```

### Feature Requests

- Real-time notifications
- Print functionality
- Export to PDF
- Integration with EHR systems
- Multi-language support

## 📈 Future Enhancements

### Phase 2 Features

- [ ] Real-time collaboration
- [ ] Advanced reporting
- [ ] Mobile app
- [ ] AI-powered recommendations
- [ ] Telemedicine integration

### Technical Improvements

- [ ] TypeScript migration
- [ ] Unit test coverage
- [ ] Performance optimization
- [ ] PWA support
- [ ] Offline functionality

---

## 👥 Contributors

- **Frontend Developer**: React + Antd components
- **UI/UX Designer**: Design system and user flows
- **Backend Developer**: API integration (future)
- **QA Engineer**: Testing and validation (future)

## 📄 License

MIT License - Feel free to use this code for educational and commercial purposes.

---

**📞 Contact**: [Your Contact Information]
**🔗 Repository**: [GitHub Repository URL]
**📖 Documentation**: [Additional Documentation URL]
