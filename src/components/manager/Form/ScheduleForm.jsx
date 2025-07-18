import React from "react";
import { Form, Input, DatePicker, TimePicker, Button, Select } from "antd";
import dayjs from "dayjs";

const ScheduleForm = ({ onSubmit, onCancel }) => {
  const [form] = Form.useForm();

  const handleFinish = (values) => {
    // Chuẩn hoá payload đúng backend yêu cầu
    const payload = {
      date: values.date.format("YYYY-MM-DD"),
      doctorId: values.doctorId,
      shiftLabel: values.shiftLabel,
      startTime: values.timeRange[0].format("HH:mm"),
      endTime: values.timeRange[1].format("HH:mm"),
      type: values.type,
      room: values.room,
      maxPatients: values.maxPatients,
      note: values.note || "",
    };
    onSubmit(payload);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
    >
      <Form.Item
        label="Ngày"
        name="date"
        rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
      >
        <DatePicker style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item
        label="Bác sĩ (doctorId)"
        name="doctorId"
        rules={[{ required: true, message: "Vui lòng chọn bác sĩ" }]}
      >
        <Input placeholder="Nhập UUID của bác sĩ" />
        {/* Có thể thay bằng Select fetch API bác sĩ nếu muốn */}
      </Form.Item>

      <Form.Item
        label="Nhãn ca trực"
        name="shiftLabel"
        rules={[{ required: true, message: "Vui lòng nhập nhãn ca trực" }]}
      >
        <Input placeholder="Ví dụ: Ca sáng" />
      </Form.Item>

      <Form.Item
        label="Thời gian"
        name="timeRange"
        rules={[{ required: true, message: "Vui lòng chọn thời gian" }]}
      >
        <TimePicker.RangePicker format="HH:mm" style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item
        label="Loại ca"
        name="type"
        rules={[{ required: true, message: "Vui lòng nhập loại ca" }]}
      >
        <Input placeholder="Ví dụ: Khám bệnh" />
      </Form.Item>

      <Form.Item
        label="Phòng"
        name="room"
        rules={[{ required: true, message: "Vui lòng nhập phòng" }]}
      >
        <Input placeholder="Ví dụ: P101" />
      </Form.Item>

      <Form.Item
        label="Số bệnh nhân tối đa"
        name="maxPatients"
        rules={[{ required: true, message: "Vui lòng nhập số bệnh nhân tối đa" }]}
      >
        <Input type="number" min={1} placeholder="Ví dụ: 20" />
      </Form.Item>

      <Form.Item
        label="Ghi chú"
        name="note"
      >
        <Input.TextArea rows={3} placeholder="Ghi chú (tùy chọn)" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" block>
          Tạo ca trực
        </Button>
        <Button block onClick={onCancel} style={{ marginTop: "8px" }}>
          Hủy
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ScheduleForm;
