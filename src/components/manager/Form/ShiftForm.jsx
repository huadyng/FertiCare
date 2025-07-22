import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  DatePicker,
  TimePicker,
  Select,
  Button,
  message,
  Spin,
} from "antd";
import { getDoctors } from "../../../api/apiManager";
import dayjs from "dayjs";

const { Option } = Select;

const ShiftForm = ({ mode, initialValues, onSubmit, onCancel }) => {
  const [form] = Form.useForm();
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  const isReadOnly = mode === "detail";

  // ✅ Convert safely string -> dayjs or return null
  const safeDayjs = (value, format) => {
    if (!value) return null;
    const parsed = format ? dayjs(value, format) : dayjs(value);
    return parsed.isValid() ? parsed : null;
  };

  // 📥 Fetch doctors list
  const fetchDoctors = async () => {
    setLoadingDoctors(true);
    try {
      const res = await getDoctors();
      const doctorData = Array.isArray(res.data) ? res.data : [];
      setDoctors(doctorData);
    } catch (err) {
      console.error("❌ Lỗi lấy danh sách bác sĩ:", err);
      message.error("Không thể tải danh sách bác sĩ");
    } finally {
      setLoadingDoctors(false);
    }
  };

  // ⏳ Preload form data
  useEffect(() => {
    if (mode === "assign") fetchDoctors();

    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        date: safeDayjs(initialValues.date, "YYYY-MM-DD"),
        startTime: safeDayjs(initialValues.startTime, "HH:mm"),
        endTime: safeDayjs(initialValues.endTime, "HH:mm"),
        staffIds: initialValues.assignedStaff?.map((s) => s.staffId) || [],
        status: initialValues.status || "active",
      });
    } else {
      form.resetFields();
    }
  }, [initialValues, mode]);

  // 📝 Submit
  const handleFinish = (values) => {
    let payload = {};
    if (mode === "assign") {
      payload = {
        shiftId: initialValues?.id,
        staffIds: values.staffIds,
        note: values.note || "",
        status: values.status,
      };
    } else {
      payload = {
        name: values.name,
        department: values.department,
        date: values.date?.format("YYYY-MM-DD"),
        startTime: values.startTime?.format("HH:mm"),
        endTime: values.endTime?.format("HH:mm"),
        priority: values.priority,
        note: values.note,
        requiredDoctors: values.requiredDoctors,
        requiredNurses: 0, // Mặc định
        requiredTechnicians: 0, // Mặc định
      };
    }
    onSubmit(payload);
  };

  return (
    <Spin spinning={loadingDoctors && mode === "assign"}>
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        {/* 🟢 Form Tạo/Sửa ca */}
        {mode !== "assign" && (
          <>
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
                disabled={isReadOnly}
                style={{ width: "100%" }}
                format="YYYY-MM-DD"
              />
            </Form.Item>

            <Form.Item label="Thời gian" style={{ marginBottom: 0 }}>
              <Form.Item
                name="startTime"
                rules={[{ required: true, message: "Chọn giờ bắt đầu" }]}
                style={{ display: "inline-block", width: "48%" }}
              >
                <TimePicker
                  disabled={isReadOnly}
                  style={{ width: "100%" }}
                  format="HH:mm"
                />
              </Form.Item>
              <span
                style={{
                  display: "inline-block",
                  width: "4%",
                  textAlign: "center",
                }}
              >
                -
              </span>
              <Form.Item
                name="endTime"
                rules={[{ required: true, message: "Chọn giờ kết thúc" }]}
                style={{ display: "inline-block", width: "48%" }}
              >
                <TimePicker
                  disabled={isReadOnly}
                  style={{ width: "100%" }}
                  format="HH:mm"
                />
              </Form.Item>
            </Form.Item>

            <Form.Item
              label="Ưu tiên"
              name="priority"
              rules={[{ required: true, message: "Chọn mức ưu tiên" }]}
            >
              <Select disabled={isReadOnly}>
                <Option value="high">Cao</Option>
                <Option value="medium">Trung bình</Option>
                <Option value="low">Thấp</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Số bác sĩ cần"
              name="requiredDoctors"
              rules={[{ required: true, message: "Nhập số bác sĩ cần" }]}
            >
              <Input type="number" disabled={isReadOnly} />
            </Form.Item>

            <Form.Item label="Ghi chú" name="note">
              <Input.TextArea rows={3} disabled={isReadOnly} />
            </Form.Item>
          </>
        )}

        {/* 🟡 Form Phân ca */}
        {mode === "assign" && (
          <>
            <Form.Item
              label="Chọn bác sĩ"
              name="staffIds"
              rules={[{ required: true, message: "Chọn ít nhất 1 bác sĩ" }]}
            >
              <Select
                mode="multiple"
                placeholder="Chọn bác sĩ"
                optionFilterProp="children"
              >
                {doctors.map((doc) => (
                  <Option key={doc.id} value={doc.id}>
                    {doc.fullName}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Trạng thái"
              name="status"
              rules={[{ required: true, message: "Chọn trạng thái" }]}
            >
              <Select placeholder="Chọn trạng thái">
                <Option value="active">Hoạt động</Option>
                <Option value="pending">Chờ</Option>
              </Select>
            </Form.Item>

            <Form.Item label="Ghi chú" name="note">
              <Input.TextArea rows={3} />
            </Form.Item>
          </>
        )}

        {/* 🟣 Action buttons */}
        {!isReadOnly && (
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
              {mode === "assign"
                ? "👥 Xác nhận phân ca"
                : mode === "edit"
                ? "💾 Lưu"
                : "➕ Tạo"}
            </Button>
            <Button onClick={onCancel}>Hủy</Button>
          </Form.Item>
        )}
      </Form>
    </Spin>
  );
};

export default ShiftForm;
