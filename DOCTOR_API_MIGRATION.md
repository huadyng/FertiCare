# Migration từ Mock Data sang API thực cho Doctor Dashboard

## Tổng quan

Đã hoàn thành việc chuyển đổi từ sử dụng mock data sang API thực cho trang bác sĩ. Tất cả dữ liệu hiện tại được lấy trực tiếp từ backend thông qua các endpoint có sẵn trong `treatmentmanagement`.

## Các thay đổi đã thực hiện

### 1. Backend Changes

#### Sử dụng API có sẵn trong treatmentmanagement

- **TreatmentWorkflowController**:
  - `GET /api/treatment-workflow/doctor/{doctorId}/treatment-phases` - **API chính để lấy dữ liệu dashboard**
- **ClinicalResultController**:
  - `GET /api/clinical-results/patient/{patientId}` - Lấy kết quả khám của bệnh nhân
- **TreatmentPlanTemplateController**:
  - `GET /api/treatment-plan-templates` - Lấy danh sách template điều trị

#### Không cần tạo API mới

- Tận dụng các endpoint có sẵn trong `treatmentmanagement`
- Sử dụng `TreatmentWorkflowService.getDoctorTreatmentPhases()` làm nguồn dữ liệu chính
- Transform dữ liệu từ treatment phases thành format dashboard cần thiết

### 2. Frontend Changes

#### Cập nhật apiDoctor.js

- **File**: `src/api/apiDoctor.js`
- **Thay đổi**:
  - `getMyPatients()`: Sử dụng `/api/treatment-workflow/doctor/me/treatment-phases` và transform data
  - `getTodayAppointments()`: Lọc từ treatment phases theo ngày hôm nay
  - `getDashboardStats()`: Tính toán từ treatment phases
  - Loại bỏ tất cả mock data
  - Thêm helper function `calculateProgressFromPhase()`

#### Cập nhật DoctorDashboard.jsx

- **File**: `src/components/doctor/DoctorDashboard.jsx`
- **Thay đổi**:
  - Loại bỏ fallback mock data
  - Cập nhật error handling
  - Loại bỏ import mockData

## API Endpoints được sử dụng

### 1. GET /api/treatment-workflow/doctor/me/treatment-phases

**Response**:

```json
[
  {
    "phaseName": "Khám lâm sàng",
    "status": "In Progress",
    "startDate": "2024-01-20T09:00:00",
    "endDate": null,
    "patientId": "uuid",
    "planId": "uuid",
    "phaseId": "uuid"
  }
]
```

### 2. Transform thành format dashboard

**Patients**:

```json
[
  {
    "id": "uuid",
    "fullName": "Bệnh nhân uuid",
    "age": null,
    "gender": null,
    "dateOfBirth": null,
    "phone": null,
    "email": null,
    "status": "In Progress",
    "treatmentType": "IVF",
    "nextAppointment": "2024-01-20T09:00:00",
    "progress": 50,
    "servicePackage": "IVF_PREMIUM",
    "createdAt": "2024-01-20T09:00:00"
  }
]
```

**Dashboard Stats**:

```json
{
  "totalPatients": 5,
  "todayAppointments": 2,
  "inTreatment": 3,
  "completed": 1,
  "successRate": 20
}
```

**Today Appointments**:

```json
[
  {
    "id": "uuid",
    "time": "09:00",
    "patient": "Bệnh nhân uuid",
    "patientName": "Bệnh nhân uuid",
    "type": "Khám lâm sàng",
    "status": "In Progress",
    "appointmentDate": "Mon Jan 20 2025"
  }
]
```

## Cách sử dụng

### 1. Khởi động Backend

```bash
cd ferticare-back
./mvnw spring-boot:run
```

### 2. Khởi động Frontend

```bash
npm start
```

### 3. Đăng nhập với tài khoản bác sĩ

- Sử dụng tài khoản có role DOCTOR
- Dashboard sẽ tự động load dữ liệu từ treatment phases

## Lưu ý quan trọng

1. **Authentication**: Tất cả endpoints yêu cầu JWT token với role DOCTOR
2. **Data Source**: Dữ liệu được lấy từ:
   - `TreatmentPhaseStatus` table cho thông tin phases điều trị
   - `TreatmentPlan` table cho thông tin phác đồ
   - `User` table cho thông tin chi tiết (cần bổ sung)
3. **Data Transformation**: Frontend transform dữ liệu từ treatment phases thành format dashboard
4. **Performance**: Sử dụng Promise.all để load song song các API

## Troubleshooting

### Lỗi 403 Forbidden

- Kiểm tra JWT token có hợp lệ không
- Kiểm tra user có role DOCTOR không

### Lỗi 500 Internal Server Error

- Kiểm tra database connection
- Kiểm tra logs trong backend console

### Không có dữ liệu hiển thị

- Kiểm tra có TreatmentPlan nào được assign cho doctor không
- Kiểm tra có TreatmentPhaseStatus nào trong ngày hôm nay không

## Migration Checklist

- [x] Xác định API có sẵn trong treatmentmanagement
- [x] Cập nhật apiDoctor.js để sử dụng API có sẵn
- [x] Transform dữ liệu từ treatment phases
- [x] Cập nhật DoctorDashboard.jsx
- [x] Loại bỏ mock data dependencies
- [x] Test API endpoints
- [x] Verify data flow

## Ưu điểm của approach này

1. **Tận dụng code có sẵn**: Không cần tạo API mới
2. **Consistency**: Sử dụng cùng data source với treatment workflow
3. **Maintainability**: Ít code hơn, dễ maintain
4. **Real-time data**: Dữ liệu luôn đồng bộ với treatment phases

## Hạn chế và cải thiện tương lai

1. **Thiếu thông tin chi tiết bệnh nhân**: Cần bổ sung User service để lấy thông tin đầy đủ
2. **Performance**: Có thể cần cache hoặc optimize query
3. **Data accuracy**: Cần validate data transformation logic
