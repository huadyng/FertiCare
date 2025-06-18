import React, { useState, useContext } from "react";
import {
  Card,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Row,
  Col,
  Steps,
  message,
  Modal,
  Alert,
  Divider,
  Space,
  Typography,
  Radio,
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  HeartOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  MedicineBoxOutlined,
} from "@ant-design/icons";
import { UserContext } from "../../../../context/UserContext";
import { serviceAPI } from "../../../../services/api";
import "./ServiceRegistration.css";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;

const ServiceRegistration = () => {
  const { user, updateServiceRegistration, USER_ROLES } =
    useContext(UserContext);
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Chỉ hiển thị cho customer đã đăng nhập và chưa đăng ký dịch vụ
  if (!user || user.role !== USER_ROLES.CUSTOMER || user.hasRegisteredService) {
    return null;
  }

  const services = [
    {
      id: "ivf",
      name: "Thụ tinh ống nghiệm (IVF)",
      description: "Phương pháp hỗ trợ sinh sản hiện đại, tỷ lệ thành công cao",
      price: "50,000,000 - 80,000,000 VNĐ",
      duration: "2-3 tháng",
      icon: <MedicineBoxOutlined />,
    },
    {
      id: "icsi",
      name: "Tiêm tinh trùng vào bào tương trứng (ICSI)",
      description: "Phù hợp với trường hợp nam giới có vấn đề về tinh trùng",
      price: "55,000,000 - 85,000,000 VNĐ",
      duration: "2-3 tháng",
      icon: <HeartOutlined />,
    },
    {
      id: "consultation",
      name: "Tư vấn và khám sức khỏe sinh sản",
      description: "Đánh giá tình trạng sức khỏe, tư vấn phương pháp phù hợp",
      price: "500,000 - 2,000,000 VNĐ",
      duration: "1-2 tuần",
      icon: <UserOutlined />,
    },
    {
      id: "ultrasound",
      name: "Siêu âm theo dõi phát triển thai",
      description: "Theo dõi sự phát triển của thai nhi qua các giai đoạn",
      price: "300,000 - 800,000 VNĐ",
      duration: "Theo lịch hẹn",
      icon: <CalendarOutlined />,
    },
  ];

  const handleNext = () => {
    form
      .validateFields()
      .then(() => {
        setCurrentStep(currentStep + 1);
      })
      .catch(() => {
        message.error("Vui lòng điền đầy đủ thông tin");
      });
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const registrationData = {
        ...values,
        userId: user.id,
        status: "pending_approval",
        registrationDate: new Date().toISOString(),
      };

      const response = await serviceAPI.register(registrationData);

      // Cập nhật user context
      updateServiceRegistration(registrationData);

      message.success(
        "Đăng ký dịch vụ thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất."
      );
      setIsModalVisible(true);
    } catch (error) {
      message.error("Có lỗi xảy ra khi đăng ký dịch vụ. Vui lòng thử lại.");
      console.error(error);
    }
    setLoading(false);
  };

  const steps = [
    {
      title: "Chọn dịch vụ",
      content: (
        <div>
          <Title level={4} style={{ textAlign: "center", marginBottom: 24 }}>
            Chọn dịch vụ phù hợp với bạn
          </Title>
          <Form.Item
            name="serviceType"
            rules={[{ required: true, message: "Vui lòng chọn dịch vụ!" }]}
          >
            <Radio.Group style={{ width: "100%" }}>
              <Row gutter={[16, 16]}>
                {services.map((service) => (
                  <Col xs={24} md={12} key={service.id}>
                    <Card
                      hoverable
                      className="service-card"
                      style={{ height: "100%" }}
                    >
                      <Radio value={service.id} style={{ width: "100%" }}>
                        <div style={{ marginLeft: 8 }}>
                          <div
                            style={{
                              fontSize: "24px",
                              color: "#1890ff",
                              marginBottom: 8,
                            }}
                          >
                            {service.icon}
                          </div>
                          <Title level={5} style={{ margin: 0 }}>
                            {service.name}
                          </Title>
                          <Paragraph
                            style={{
                              fontSize: "13px",
                              color: "#8c8c8c",
                              margin: "8px 0",
                            }}
                          >
                            {service.description}
                          </Paragraph>
                          <div style={{ fontSize: "12px" }}>
                            <div>
                              <strong>Chi phí:</strong> {service.price}
                            </div>
                            <div>
                              <strong>Thời gian:</strong> {service.duration}
                            </div>
                          </div>
                        </div>
                      </Radio>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Radio.Group>
          </Form.Item>
        </div>
      ),
    },
    {
      title: "Thông tin cá nhân",
      content: (
        <div>
          <Title level={4} style={{ textAlign: "center", marginBottom: 24 }}>
            Thông tin cá nhân
          </Title>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Họ và tên"
                name="fullName"
                initialValue={user?.fullName}
                rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
              >
                <Input prefix={<UserOutlined />} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Số điện thoại"
                name="phone"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại!" },
                  {
                    pattern: /^[0-9]{10,11}$/,
                    message: "Số điện thoại không hợp lệ!",
                  },
                ]}
              >
                <Input prefix={<PhoneOutlined />} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Email"
                name="email"
                initialValue={user?.email}
                rules={[
                  { required: true, message: "Vui lòng nhập email!" },
                  { type: "email", message: "Email không hợp lệ!" },
                ]}
              >
                <Input prefix={<MailOutlined />} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Ngày sinh"
                name="dateOfBirth"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày sinh!" },
                ]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  placeholder="Chọn ngày sinh"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Giới tính"
                name="gender"
                rules={[
                  { required: true, message: "Vui lòng chọn giới tính!" },
                ]}
              >
                <Select placeholder="Chọn giới tính">
                  <Option value="female">Nữ</Option>
                  <Option value="male">Nam</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Tình trạng hôn nhân"
                name="maritalStatus"
                rules={[
                  { required: true, message: "Vui lòng chọn tình trạng!" },
                ]}
              >
                <Select placeholder="Chọn tình trạng hôn nhân">
                  <Option value="married">Đã kết hôn</Option>
                  <Option value="single">Độc thân</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Địa chỉ"
            name="address"
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
          >
            <TextArea rows={2} placeholder="Nhập địa chỉ đầy đủ..." />
          </Form.Item>
        </div>
      ),
    },
    {
      title: "Thông tin y tế",
      content: (
        <div>
          <Title level={4} style={{ textAlign: "center", marginBottom: 24 }}>
            Thông tin y tế
          </Title>

          <Alert
            message="Thông tin y tế"
            description="Vui lòng cung cấp thông tin chính xác để chúng tôi có thể tư vấn phù hợp nhất."
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />

          <Form.Item label="Tiền sử bệnh lý" name="medicalHistory">
            <TextArea
              rows={3}
              placeholder="Mô tả các bệnh lý đã từng mắc phải (nếu có)..."
            />
          </Form.Item>

          <Form.Item
            label="Thời gian cố gắng có con"
            name="tryingDuration"
            rules={[{ required: true, message: "Vui lòng chọn thời gian!" }]}
          >
            <Select placeholder="Chọn thời gian">
              <Option value="under_6_months">Dưới 6 tháng</Option>
              <Option value="6_12_months">6-12 tháng</Option>
              <Option value="1_2_years">1-2 năm</Option>
              <Option value="over_2_years">Trên 2 năm</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Đã từng điều trị hiếm muộn"
            name="previousTreatment"
            rules={[{ required: true, message: "Vui lòng chọn!" }]}
          >
            <Radio.Group>
              <Radio value={true}>Có</Radio>
              <Radio value={false}>Không</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item label="Ghi chú thêm" name="notes">
            <TextArea
              rows={3}
              placeholder="Thông tin thêm mà bạn muốn chia sẻ với bác sĩ..."
            />
          </Form.Item>
        </div>
      ),
    },
    {
      title: "Xác nhận",
      content: (
        <div>
          <Title level={4} style={{ textAlign: "center", marginBottom: 24 }}>
            Xác nhận thông tin đăng ký
          </Title>

          <Alert
            message="Xác nhận đăng ký"
            description="Vui lòng kiểm tra lại thông tin trước khi hoàn tất đăng ký."
            type="warning"
            showIcon
            style={{ marginBottom: 24 }}
          />

          <Card>
            <Title level={5}>Thông tin tóm tắt:</Title>
            <div style={{ marginLeft: 16 }}>
              <p>
                <strong>Họ tên:</strong> {form.getFieldValue("fullName")}
              </p>
              <p>
                <strong>Điện thoại:</strong> {form.getFieldValue("phone")}
              </p>
              <p>
                <strong>Email:</strong> {form.getFieldValue("email")}
              </p>
              <p>
                <strong>Dịch vụ:</strong>{" "}
                {
                  services.find(
                    (s) => s.id === form.getFieldValue("serviceType")
                  )?.name
                }
              </p>
            </div>
          </Card>

          <Divider />

          <Alert
            message="Cam kết"
            description="Bằng việc đăng ký, bạn đồng ý với các điều khoản và chính sách bảo mật của FertiCare. Chúng tôi cam kết bảo mật thông tin cá nhân của bạn."
            type="info"
            showIcon
          />
        </div>
      ),
    },
  ];

  return (
    <div
      className="service-registration"
      style={{ padding: "60px 0", background: "#f8f9fa" }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <Title level={2} style={{ color: "#1890ff" }}>
            Đăng ký dịch vụ điều trị
          </Title>
          <Paragraph style={{ fontSize: "16px", color: "#666" }}>
            Chào mừng {user.fullName}! Hãy đăng ký dịch vụ để bắt đầu hành trình
            điều trị cùng FertiCare.
          </Paragraph>
        </div>

        <Card
          className="registration-card"
          style={{ maxWidth: "900px", margin: "0 auto" }}
        >
          <Steps current={currentStep} style={{ marginBottom: 32 }}>
            {steps.map((item) => (
              <Step key={item.title} title={item.title} />
            ))}
          </Steps>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            style={{ minHeight: "400px" }}
          >
            <div>{steps[currentStep].content}</div>

            <div style={{ marginTop: 32, textAlign: "center" }}>
              <Space size="large">
                {currentStep > 0 && (
                  <Button onClick={handlePrev}>Quay lại</Button>
                )}
                {currentStep < steps.length - 1 && (
                  <Button type="primary" onClick={handleNext}>
                    Tiếp theo
                  </Button>
                )}
                {currentStep === steps.length - 1 && (
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    size="large"
                  >
                    Hoàn tất đăng ký
                  </Button>
                )}
              </Space>
            </div>
          </Form>
        </Card>

        {/* Success Modal */}
        <Modal
          title={
            <div style={{ textAlign: "center" }}>
              <CheckCircleOutlined
                style={{ color: "#52c41a", fontSize: "48px" }}
              />
              <Title level={3} style={{ marginTop: 16, color: "#52c41a" }}>
                Đăng ký thành công!
              </Title>
            </div>
          }
          open={isModalVisible}
          onOk={() => {
            setIsModalVisible(false);
            window.location.reload(); // Reload để cập nhật UI
          }}
          onCancel={() => {
            setIsModalVisible(false);
            window.location.reload();
          }}
          centered
          width={500}
        >
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <Paragraph style={{ fontSize: "16px", marginBottom: 16 }}>
              Cảm ơn bạn đã đăng ký dịch vụ tại FertiCare!
            </Paragraph>
            <Paragraph>
              Chúng tôi sẽ liên hệ với bạn trong vòng 24 giờ để xác nhận và
              hướng dẫn các bước tiếp theo.
            </Paragraph>
            <Alert
              message="Bạn sẽ được chuyển đến khu vực bệnh nhân để theo dõi tiến trình điều trị."
              type="success"
              showIcon
              style={{ marginTop: 16 }}
            />
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default ServiceRegistration;
