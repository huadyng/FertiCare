# 🔄 Treatment Sync System - Hệ thống đồng bộ điều trị

## Tổng quan

Hệ thống cho phép **TreatmentProcess.jsx** tự động đồng bộ dữ liệu từ các trang standalone:

- **ExaminationForm** (Khám lâm sàng)
- **TreatmentPlanEditor** (Lập phác đồ)
- **TreatmentScheduleForm** (Lập lịch điều trị)

## 🏗️ Kiến trúc

### Core Components:

1. **TreatmentStateManager** (`src/utils/treatmentStateManager.js`)

   - Quản lý state tập trung
   - Lưu trữ trong localStorage
   - Dispatch custom events

2. **TreatmentProcess.jsx** (Enhanced)

   - Listen real-time events
   - Auto-sync data on mount
   - Display progress & step status

3. **Standalone Pages** (Integrated)
   - Dispatch events on completion
   - Update state manager

## 📊 Data Flow

```
Standalone Page → Complete Action → StateManager → Event → TreatmentProcess → UI Update
```

## 🎯 Tính năng

✅ **Real-time sync**: Changes ngay lập tức update TreatmentProcess  
✅ **Persistent storage**: Dữ liệu không mất khi reload  
✅ **Progress tracking**: % hoàn thành và step status  
✅ **Visual feedback**: Steps hiển thị ✅ với timestamp  
✅ **Cross-tab sync**: Multiple tabs đồng bộ

## 🚀 Cách sử dụng

### 1. Test với Demo

```
DoctorDashboard → 🔄 Sync Demo tab
- Mô phỏng hoàn thành các bước
- Xem real-time events
- Debug state data
```

### 2. Workflow thực tế

```
1. Truy cập "Quy trình điều trị" → Thấy progress hiện tại
2. Làm việc trên standalone pages → Tự động sync
3. Quay lại "Quy trình điều trị" → Steps đã update với ✅
```

### 3. API Methods

```javascript
import { treatmentStateManager } from "../../../utils/treatmentStateManager";

// Initialize patient
treatmentStateManager.initializePatient(patientId, patientInfo);

// Update steps
treatmentStateManager.updateExamination(patientId, examData);
treatmentStateManager.updateTreatmentPlan(patientId, planData);
treatmentStateManager.updateSchedule(patientId, scheduleData);

// Get state
const state = treatmentStateManager.getCurrentState();
const progress = treatmentStateManager.getOverallProgress();

// Events
treatmentStateManager.addEventListener("examination:completed", callback);
```

## 🔧 State Structure

```javascript
{
  patientId: "1",
  currentStep: 2,
  completedSteps: [0, 1],
  data: {
    examination: { /* examination data */ },
    treatmentPlan: { /* plan data */ },
    schedule: { /* schedule data */ },
    progress: null
  },
  stepStatus: {
    0: 'finish',  // examination completed
    1: 'finish',  // treatment plan completed
    2: 'process', // schedule in progress
    3: 'wait',    // progress waiting
    4: 'wait'     // completion waiting
  },
  lastUpdated: "2024-01-20T10:30:00.000Z"
}
```

## 🎨 UI Features

### Progress Bar

- Hiển thị % hoàn thành tổng thể
- Real-time update khi có thay đổi

### Step Status

- ✅ **finish**: Bước đã hoàn thành với timestamp
- 🔵 **process**: Bước đang thực hiện
- ⚫ **wait**: Bước chờ thực hiện

### Sync Messages

- Toast notifications khi có sync
- Visual indicators cho completed steps

## 🧪 Testing

1. **Access Demo**: DoctorDashboard → "🔄 Sync Demo"
2. **Test buttons**: Khởi tạo → Khám → Phác đồ → Lịch
3. **Watch progress**: Real-time updates & event log
4. **Cross-tab test**: Mở nhiều tab cùng lúc

## 🔍 Debugging

- Check browser console cho event logs
- View "Raw State Data" trong demo
- localStorage key: `treatmentProcessData`

## 📱 Browser Support

- Modern browsers với localStorage support
- Custom Events API
- ES6+ features
