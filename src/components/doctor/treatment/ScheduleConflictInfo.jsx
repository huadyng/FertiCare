import React from "react";
import { Card, Alert, Descriptions, Tag, Typography } from "antd";
import { 
  ClockCircleOutlined, 
  ExclamationCircleOutlined, 
  CheckCircleOutlined,
  UserOutlined,
  CalendarOutlined 
} from "@ant-design/icons";

const { Title, Text } = Typography;

const ScheduleConflictInfo = () => {
  return (
    <div style={{ padding: "20px", background: "linear-gradient(135deg, #fce4ec 0%, #f8bbd9 100%)", minHeight: "100vh" }}>
      <Card
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ExclamationCircleOutlined style={{ color: "#ff7eb3" }} />
            <span>Thông tin kiểm tra lịch trùng</span>
          </div>
        }
        style={{ marginBottom: 20 }}
      >
        <Alert
          message="✅ Logic kiểm tra lịch trùng đã được cập nhật"
          description="Backend sẽ kiểm tra 3 loại conflict trước khi tạo lịch hẹn"
          type="success"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Descriptions title="Các loại kiểm tra conflict:" column={1} bordered>
          <Descriptions.Item 
            label={
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <UserOutlined style={{ color: "#ff7eb3" }} />
                <span>1. Appointment thông thường</span>
              </div>
            }
          >
            <div>
              <Text>Kiểm tra xem bác sĩ đã có lịch hẹn thông thường vào thời gian này chưa</Text>
              <br />
              <Tag color="red">Lỗi: "Bác sĩ đã có lịch hẹn vào thời gian này"</Tag>
            </div>
          </Descriptions.Item>

          <Descriptions.Item 
            label={
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <CalendarOutlined style={{ color: "#ff7eb3" }} />
                <span>2. Treatment Schedule khác</span>
              </div>
            }
          >
            <div>
              <Text>Kiểm tra xem bác sĩ đã có lịch điều trị khác vào thời gian này chưa</Text>
              <br />
              <Tag color="red">Lỗi: "Bác sĩ đã có lịch điều trị vào thời gian này"</Tag>
            </div>
          </Descriptions.Item>

          <Descriptions.Item 
            label={
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ClockCircleOutlined style={{ color: "#ff7eb3" }} />
                <span>3. Lịch làm việc của bác sĩ</span>
              </div>
            }
          >
            <div>
              <Text>Kiểm tra xem bác sĩ có lịch làm việc (active) vào thời gian này không</Text>
              <br />
              <Tag color="red">Lỗi: "Bác sĩ không có lịch làm việc vào thời gian này"</Tag>
            </div>
          </Descriptions.Item>
        </Descriptions>

        <Alert
          message="🔍 Chi tiết kiểm tra"
          description={
            <div>
              <p><strong>Appointment:</strong> Sử dụng <code>appointmentRepository.existsByDoctorIdAndAppointmentTime()</code></p>
              <p><strong>Treatment Schedule:</strong> Sử dụng <code>treatmentScheduleRepository.findBookedTimesByDoctorIdAndDateRange()</code></p>
              <p><strong>Work Schedule:</strong> Kiểm tra <code>DoctorWorkSchedule</code> với status = "active"</p>
            </div>
          }
          type="info"
          showIcon
          style={{ marginTop: 16 }}
        />

        <Alert
          message="📋 Các bảng dữ liệu liên quan"
          description={
            <div>
              <p><strong>appointment:</strong> Lịch hẹn thông thường</p>
              <p><strong>treatment_schedule:</strong> Lịch điều trị cho treatment plan</p>
              <p><strong>doctor_work_schedule:</strong> Lịch làm việc của bác sĩ</p>
            </div>
          }
          type="warning"
          showIcon
          style={{ marginTop: 16 }}
        />
      </Card>
    </div>
  );
};

export default ScheduleConflictInfo; 