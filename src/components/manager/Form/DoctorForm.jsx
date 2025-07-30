// src/components/DoctorForm.jsx
import React from "react";
import { Form, Input, Select, DatePicker, InputNumber, Switch, Button, Row, Col } from "antd";
import moment from "moment";
import { dateOfBirthValidator, getDateOfBirthConstraints } from "../../../utils/dateValidation";

const { Option } = Select;

const genders = ["MALE", "FEMALE", "OTHER"];
const contractTypes = ["full-time", "part-time", "freelance"];
const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const shifts = ["morning", "afternoon", "evening"];

const DoctorForm = ({ initialValues, onSubmit, onCancel, disabled = false }) => {
  // Chuẩn hóa giá trị schedule để form hiển thị đúng checkbox
  const initialSchedule = {};
  daysOfWeek.forEach((day) => {
    initialSchedule[day] = {};
    shifts.forEach((shift) => {
      initialSchedule[day][shift] = initialValues?.schedule?.[day]?.[shift] || false;
    });
  });

  // Giá trị mặc định cho form
  const defaultValues = {
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: null,
    gender: "MALE",
    address: "",
    specialty: "",
    department: "",
    experienceYears: 0,
    contractType: "full-time",
    schedule: initialSchedule,
  };

  const [form] = Form.useForm();

  React.useEffect(() => {
    // Khi initialValues thay đổi, set lại form
    form.setFieldsValue({
      ...defaultValues,
      ...initialValues,
      dateOfBirth: initialValues?.dateOfBirth ? moment(initialValues.dateOfBirth) : null,
      schedule: initialSchedule,
    });
  }, [initialValues]);

  // Khi submit form
  const handleFinish = (values) => {
    // format ngày sinh về chuỗi ISO
    const formattedValues = {
      ...values,
      dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format("YYYY-MM-DD") : null,
    };
    onSubmit(formattedValues);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      disabled={disabled}
      scrollToFirstError
    >
      <Form.Item
        label="Full Name"
        name="fullName"
        rules={[{ required: true, message: "Please input full name" }]}
      >
        <Input placeholder="Enter full name" />
      </Form.Item>

      <Form.Item
        label="Email"
        name="email"
        rules={[
          { required: true, message: "Please input email" },
          { type: "email", message: "Invalid email" },
        ]}
      >
        <Input placeholder="Enter email" disabled={initialValues?.id !== undefined} />
      </Form.Item>

      <Form.Item
        label="Phone"
        name="phone"
        rules={[{ required: true, message: "Please input phone number" }]}
      >
        <Input placeholder="Enter phone number" />
      </Form.Item>

      <Form.Item
        label="Date of Birth"
        name="dateOfBirth"
        rules={[
          { required: true, message: "Please select date of birth" },
          { validator: dateOfBirthValidator }
        ]}
      >
        <DatePicker 
          style={{ width: "100%" }}
          disabledDate={(current) => {
            const { minDate, maxDate } = getDateOfBirthConstraints();
            return current && (current < moment(minDate) || current > moment(maxDate));
          }}
        />
      </Form.Item>

      <Form.Item
        label="Gender"
        name="gender"
        rules={[{ required: true, message: "Please select gender" }]}
      >
        <Select>
          {genders.map((g) => (
            <Option key={g} value={g}>
              {g}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        label="Address"
        name="address"
        rules={[{ required: true, message: "Please input address" }]}
      >
        <Input.TextArea rows={2} placeholder="Enter address" />
      </Form.Item>

      <Form.Item
        label="Specialty"
        name="specialty"
        rules={[{ required: true, message: "Please input specialty" }]}
      >
        <Input placeholder="Enter specialty" />
      </Form.Item>

      <Form.Item
        label="Department"
        name="department"
        rules={[{ required: true, message: "Please input department" }]}
      >
        <Input placeholder="Enter department" />
      </Form.Item>

      <Form.Item
        label="Experience Years"
        name="experienceYears"
        rules={[{ required: true, message: "Please input experience years" }]}
      >
        <InputNumber min={0} style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item
        label="Contract Type"
        name="contractType"
        rules={[{ required: true, message: "Please select contract type" }]}
      >
        <Select>
          {contractTypes.map((type) => (
            <Option key={type} value={type}>
              {type}
            </Option>
          ))}
        </Select>
      </Form.Item>

      {/* Work Schedule */}
      <Form.Item label="Work Schedule" shouldUpdate>
        {() => {
          const schedule = form.getFieldValue("schedule") || {};
          return (
            <div style={{ maxHeight: 300, overflowY: "auto", border: "1px solid #ddd", padding: 10 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ border: "1px solid #ccc", padding: 8 }}>Day</th>
                    {shifts.map((shift) => (
                      <th key={shift} style={{ border: "1px solid #ccc", padding: 8, textTransform: "capitalize" }}>
                        {shift}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {daysOfWeek.map((day) => (
                    <tr key={day}>
                      <td style={{ border: "1px solid #ccc", padding: 8, textTransform: "capitalize" }}>{day}</td>
                      {shifts.map((shift) => (
                        <td key={shift} style={{ border: "1px solid #ccc", padding: 8, textAlign: "center" }}>
                          <Form.Item
                            name={["schedule", day, shift]}
                            valuePropName="checked"
                            noStyle
                          >
                            <Switch disabled={disabled} />
                          </Form.Item>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }}
      </Form.Item>

      {!disabled && (
        <Form.Item style={{ textAlign: "right" }}>
          <Button onClick={onCancel} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      )}
    </Form>
  );
};

export default DoctorForm;
