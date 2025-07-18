import React from "react";
import { Form, Input, DatePicker, TimePicker, Button, Select } from "antd";
import dayjs from "dayjs";

const ShiftForm = ({ mode, initialValues, onSubmit, onCancel }) => {
  const [form] = Form.useForm();

  const handleFinish = (values) => {
  const payload = {
    name: values.name,
    department: values.department,
    date: values.date.format("YYYY-MM-DD"),
    startTime: values.timeRange[0].format("HH:mm"),
    endTime: values.timeRange[1].format("HH:mm"),
    priority: values.priority,
    note: values.note,
    requiredDoctors: values.requiredDoctors,
    requiredNurses: values.requiredNurses,
    requiredTechnicians: values.requiredTechnicians,
  };
  onSubmit(payload);
};

  const isReadOnly = mode === "detail";

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={
        initialValues
          ? {
              ...initialValues,
              date: dayjs(initialValues.date),
              timeRange: [
                dayjs(initialValues.startTime, "HH:mm"),
                dayjs(initialValues.endTime, "HH:mm"),
              ],
            }
          : {}
      }
      onFinish={handleFinish}
    >
      <Form.Item
        label="Tên ca"
        name="name"
        rules={[{ required: true, message: "Nhập tên ca" }]}
      >
        <Input disabled={isReadOnly} />
      </Form.Item>

      <Form.Item
        label="Phòng ban"
        name="department"
        rules={[{ required: true, message: "Nhập phòng ban" }]}
      >
        <Input disabled={isReadOnly} />
      </Form.Item>

      <Form.Item
        label="Ngày"
        name="date"
        rules={[{ required: true, message: "Chọn ngày" }]}
      >
        <DatePicker
          format="YYYY-MM-DD"
          style={{ width: "100%" }}
          disabled={isReadOnly}
        />
      </Form.Item>

      <Form.Item
        label="Thời gian"
        name="timeRange"
        rules={[{ required: true, message: "Chọn thời gian" }]}
      >
        <TimePicker.RangePicker
          format="HH:mm"
          style={{ width: "100%" }}
          disabled={isReadOnly}
        />
      </Form.Item>

      <Form.Item
        label="Loại ca"
        name="type"
        rules={[{ required: true, message: "Nhập loại ca" }]}
      >
        <Input disabled={isReadOnly} />
      </Form.Item>

      <Form.Item
        label="Mức ưu tiên"
        name="priority"
        rules={[{ required: true, message: "Vui lòng chọn mức ưu tiên" }]}
      >
        <Select placeholder="Chọn mức ưu tiên">
        <Option value="low">Thấp</Option>
        <Option value="medium">Trung bình</Option>
        <Option value="high">Cao</Option>
        </Select>
    </Form.Item>

      <Form.Item
        label="Ghi chú"
        name="note"
      >
        <Input.TextArea rows={3} disabled={isReadOnly} />
      </Form.Item>

      {!isReadOnly && (
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            {mode === "create" ? "Thêm mới" : "Cập nhật"}
          </Button>
          <Button block onClick={onCancel} style={{ marginTop: 8 }}>
            Hủy
          </Button>
        </Form.Item>
      )}
    </Form>
  );
};

export default ShiftForm;
