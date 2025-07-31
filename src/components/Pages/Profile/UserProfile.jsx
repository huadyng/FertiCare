import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../../context/UserContext";
import apiProfile from "../../../api/apiProfile";
import { validateDateOfBirth } from "../../../utils/dateValidation";
import {
  Card,
  Avatar,
  Button,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Spin,
  Row,
  Col,
  Divider,
  Tag,
  Typography,
  Space,
  Alert,
  Descriptions,
  Upload,
  Modal,
  Tooltip,
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  IdcardOutlined,
  TrophyOutlined,
  HeartOutlined,
  TeamOutlined,
  SettingOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const UserProfile = () => {
  const { user, USER_ROLES, setUser } = useContext(UserContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    fetchProfile().catch((error) => {
      console.error(
        "❌ [UserProfile] Failed to fetch profile on mount:",
        error
      );
    });
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Debug: Log user context and token
      console.log("🔍 [UserProfile] Current user context:", user);
      console.log("🔍 [UserProfile] User role:", user?.role);
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        console.log("🔍 [UserProfile] Stored user data:", userData);
        console.log("🔍 [UserProfile] Stored role:", userData.role);
        console.log(
          "🔍 [UserProfile] Token:",
          userData.token ? "EXISTS" : "MISSING"
        );
        if (userData.token) {
          console.log(
            "🔍 [UserProfile] Token preview:",
            userData.token.substring(0, 50) + "..."
          );
        }
      }

      // Sử dụng endpoint phù hợp với role để lấy profile (có thể có avatarUrl)
      let profileData;
      try {
        switch (user?.role?.toUpperCase()) {
          case "CUSTOMER":
          case "PATIENT":
            profileData = await apiProfile.getCustomerProfile();
            break;
          case "DOCTOR":
            // ✅ Luôn lấy profile của bác sĩ đang đăng nhập
            console.log(
              "🔍 [UserProfile] Lấy profile cho doctor ID:",
              user?.id
            );
            profileData = await apiProfile.getDoctorProfile(user?.id);
            // Đảm bảo ID của bác sĩ được set
            if (profileData && user?.id) {
              profileData.id = user.id;
              console.log("✅ [UserProfile] Đã set doctor ID:", user.id);
            }
            break;
          case "MANAGER":
          case "ADMIN":
            profileData = await apiProfile.getManagerAdminProfile();
            break;
          default:
            profileData = await apiProfile.getMyProfile();
            break;
        }
      } catch (roleSpecificError) {
        console.log(
          "⚠️ [UserProfile] Role-specific endpoint failed, trying generic endpoint"
        );
        try {
          profileData = await apiProfile.getMyProfile();
        } catch (genericError) {
          console.log(
            "⚠️ [UserProfile] Generic endpoint also failed, using user context data"
          );
          // Sử dụng dữ liệu từ user context nếu cả hai API đều thất bại
          profileData = null;
        }
      }

      console.log(
        "🔄 [UserProfile] Profile data updated:",
        profileData.avatarUrl
      );
      setProfile(profileData);

      // Set form data for editing
      const formData = {
        ...profileData,
        gender: convertGenderForForm(profileData.gender),
        maritalStatus: convertMaritalStatusForForm(profileData.maritalStatus),
        dateOfBirth: profileData.dateOfBirth
          ? dayjs(profileData.dateOfBirth)
          : null,
      };

      form.setFieldsValue(formData);

      return profileData; // Return profile data để có thể sử dụng ngay
    } catch (err) {
      console.error("❌ [UserProfile] Profile fetch error:", err);
      console.error("❌ [UserProfile] Error response:", err.response?.data);

      // Fallback: Create mock profile from user context if API fails
      if (err.response?.status === 403 && user) {
        console.log(
          "📝 [UserProfile] Creating fallback profile from user context"
        );
        const fallbackProfile = {
          fullName: user.fullName || "",
          email: user.email || "",
          phone: "",
          gender: "",
          dateOfBirth: "",
          address: "",
          avatarUrl: user.avatarUrl || "",
          // Role-specific fields will be empty
          specialty: "",
          qualification: "",
          experienceYears: "",
          maritalStatus: "",
          healthBackground: "",
          assignedDepartment: "",
          extraPermissions: "",
        };
        setProfile(fallbackProfile);
        form.setFieldsValue({
          ...fallbackProfile,
          gender: convertGenderForForm(fallbackProfile.gender),
          maritalStatus: convertMaritalStatusForForm(
            fallbackProfile.maritalStatus
          ),
        });
        setError(
          "⚠️ Không thể kết nối API. Đang sử dụng dữ liệu cơ bản từ phiên đăng nhập."
        );
        return fallbackProfile;
      } else {
        setError(
          err.response?.data?.message || "Không thể tải thông tin profile"
        );
        throw err;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset form data when canceling
      form.setFieldsValue({
        ...profile,
        gender: convertGenderForForm(profile.gender),
        maritalStatus: convertMaritalStatusForForm(profile.maritalStatus),
        dateOfBirth: profile.dateOfBirth ? dayjs(profile.dateOfBirth) : null,
      });
      setUpdateMessage("");
    }
    setIsEditing(!isEditing);
  };

  const handleUpdateProfile = async (values) => {
    try {
      setUpdateLoading(true);
      setUpdateMessage("");

      // Chuẩn bị data để cập nhật profile
      let dataToUpdate = {
        ...values,
        dateOfBirth: values.dateOfBirth
          ? values.dateOfBirth.format("YYYY-MM-DD")
          : null,
      };

      // ✅ Đảm bảo ID được giữ nguyên cho doctor
      if (user?.role?.toUpperCase() === "DOCTOR" && user?.id) {
        dataToUpdate.id = user.id;
        console.log("✅ [UserProfile] Giữ nguyên doctor ID:", user.id);
      }

      // Cập nhật profile
      console.log("📝 [UserProfile] Updating profile...");
      const updatedProfile = await apiProfile.updateProfile(
        dataToUpdate,
        user?.role
      );

      // Hiển thị message thành công
      const messageDetail = updatedProfile?.message?.messageDetail || "";
      let successMessage = "";

      if (messageDetail.includes("mock")) {
        successMessage = "✅ Cập nhật thông tin thành công (chế độ demo)!";
      } else {
        successMessage = "✅ Cập nhật thông tin thành công!";
      }

      messageApi.success(successMessage);
      setIsEditing(false);

      // Fetch lại profile
      console.log("🔄 [UserProfile] Fetching updated profile...");
      const updatedProfileData = await fetchProfile();

      console.log("✅ [UserProfile] Update process completed!");

      // Clear success message after 3 seconds
      setTimeout(() => setUpdateMessage(""), 3000);
    } catch (err) {
      messageApi.error(
        "❌ Có lỗi xảy ra khi cập nhật: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setUpdateLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa cập nhật";
    try {
      return dayjs(dateString).format("DD/MM/YYYY");
    } catch {
      return "Không hợp lệ";
    }
  };

  const getGenderDisplay = (gender) => {
    switch (gender?.toLowerCase()) {
      case "male":
        return "Nam";
      case "female":
        return "Nữ";
      case "other":
        return "Khác";
      default:
        return "Chưa cập nhật";
    }
  };

  const getMaritalStatusDisplay = (maritalStatus) => {
    switch (maritalStatus?.toLowerCase()) {
      case "single":
        return "Độc thân";
      case "married":
        return "Đã kết hôn";
      case "divorced":
        return "Đã ly hôn";
      case "widowed":
        return "Góa";
      default:
        return "Chưa cập nhật";
    }
  };

  // Function để convert giá trị từ database (tiếng Anh) sang tiếng Việt cho form
  const convertMaritalStatusForForm = (maritalStatus) => {
    switch (maritalStatus?.toLowerCase()) {
      case "single":
        return "độc thân";
      case "married":
        return "đã kết hôn";
      case "divorced":
        return "đã ly hôn";
      case "widowed":
        return "góa";
      default:
        return maritalStatus; // Giữ nguyên nếu không match
    }
  };

  // Function để convert gender từ backend format (MALE/FEMALE/OTHER) sang frontend format (male/female/other)
  const convertGenderForForm = (gender) => {
    if (!gender) return "";
    return gender.toLowerCase();
  };

  const getRoleDisplay = () => {
    if (!user?.role) return "Chưa xác định";

    switch (user.role.toUpperCase()) {
      case USER_ROLES.ADMIN:
        return "Quản trị viên";
      case USER_ROLES.MANAGER:
        return "Quản lý";
      case USER_ROLES.DOCTOR:
        return "Bác sĩ";
      case USER_ROLES.PATIENT:
        return "Bệnh nhân";
      case USER_ROLES.CUSTOMER:
        return "Khách hàng";
      default:
        return "Chưa xác định";
    }
  };

  const getRoleColor = () => {
    switch (user?.role?.toUpperCase()) {
      case USER_ROLES.ADMIN:
        return "red";
      case USER_ROLES.MANAGER:
        return "orange";
      case USER_ROLES.DOCTOR:
        return "blue";
      case USER_ROLES.PATIENT:
        return "green";
      case USER_ROLES.CUSTOMER:
        return "purple";
      default:
        return "default";
    }
  };

  const renderRoleSpecificInfo = () => {
    if (!profile) return null;

    switch (user?.role?.toUpperCase()) {
      case USER_ROLES.DOCTOR:
        return (
          <Card
            title={
              <Space>
                <TrophyOutlined />
                <span>Thông tin chuyên môn</span>
              </Space>
            }
            className="role-specific-card"
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Descriptions.Item label="Chuyên khoa">
                  {profile.specialty || "Chưa cập nhật"}
                </Descriptions.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Descriptions.Item label="Bằng cấp">
                  {profile.qualification || "Chưa cập nhật"}
                </Descriptions.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Descriptions.Item label="Số năm kinh nghiệm">
                  {profile.experienceYears || "Chưa cập nhật"}
                </Descriptions.Item>
              </Col>
            </Row>
          </Card>
        );

      case USER_ROLES.CUSTOMER:
      case USER_ROLES.PATIENT:
        return (
          <Card
            title={
              <Space>
                <HeartOutlined />
                <span>Thông tin sức khỏe</span>
              </Space>
            }
            className="role-specific-card"
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Descriptions.Item label="Tình trạng hôn nhân">
                  {getMaritalStatusDisplay(profile.maritalStatus)}
                </Descriptions.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Descriptions.Item label="Tiền sử sức khỏe">
                  {profile.healthBackground || "Chưa cập nhật"}
                </Descriptions.Item>
              </Col>
            </Row>
          </Card>
        );

      case USER_ROLES.MANAGER:
      case USER_ROLES.ADMIN:
        return (
          <Card
            title={
              <Space>
                <SettingOutlined />
                <span>Thông tin công việc</span>
              </Space>
            }
            className="role-specific-card"
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Descriptions.Item label="Phòng ban phụ trách">
                  {profile.assignedDepartment || "Chưa cập nhật"}
                </Descriptions.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Descriptions.Item label="Quyền mở rộng">
                  {profile.extraPermissions || "Chưa cập nhật"}
                </Descriptions.Item>
              </Col>
            </Row>
          </Card>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
        <div style={{ marginTop: "16px" }}>
          <Text type="secondary">Đang tải thông tin profile...</Text>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <Alert
          message="Có lỗi xảy ra"
          description={error}
          type="error"
          showIcon
          action={
            <Button
              size="small"
              onClick={() => fetchProfile().catch(console.error)}
            >
              Thử lại
            </Button>
          }
        />
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card>
        <Alert
          message="Không tìm thấy thông tin profile"
          description="Vui lòng liên hệ quản trị viên để được hỗ trợ."
          type="warning"
          showIcon
        />
      </Card>
    );
  }

  return (
    <>
      {contextHolder}
      <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
        <Card>
          {/* Profile Header */}
          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} sm={8} md={6}>
              <div style={{ textAlign: "center" }}>
                <Avatar
                  size={120}
                  src={
                    profile.avatarUrl || "/src/assets/img/default-avatar.png"
                  }
                  icon={<UserOutlined />}
                />
              </div>
            </Col>
            <Col xs={24} sm={16} md={12}>
              <Title level={2} style={{ marginBottom: "8px" }}>
                {profile.fullName || "Chưa cập nhật tên"}
              </Title>
              <Tag color={getRoleColor()} size="large">
                {getRoleDisplay()}
              </Tag>
              <div style={{ marginTop: "8px" }}>
                <Text type="secondary">
                  <MailOutlined /> {profile.email}
                </Text>
              </div>
            </Col>
            <Col xs={24} sm={24} md={6}>
              <div style={{ textAlign: "right" }}>
                <Button
                  type={isEditing ? "default" : "primary"}
                  icon={isEditing ? <CloseOutlined /> : <EditOutlined />}
                  onClick={handleEditToggle}
                  loading={updateLoading}
                  size="large"
                >
                  {isEditing ? "Hủy" : "Chỉnh sửa"}
                </Button>
              </div>
            </Col>
          </Row>

          <Divider />

          {/* Basic Information */}
          <Card
            title={
              <Space>
                <IdcardOutlined />
                <span>Thông tin cá nhân</span>
              </Space>
            }
            style={{ marginBottom: "24px" }}
          >
            <Row gutter={[24, 16]}>
              <Col xs={24} sm={12}>
                <Descriptions.Item label="Họ và tên">
                  {profile.fullName || "Chưa cập nhật"}
                </Descriptions.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Descriptions.Item label="Email">
                  {profile.email || "Chưa cập nhật"}
                </Descriptions.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Descriptions.Item label="Số điện thoại">
                  <PhoneOutlined /> {profile.phone || "Chưa cập nhật"}
                </Descriptions.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Descriptions.Item label="Giới tính">
                  {getGenderDisplay(profile.gender)}
                </Descriptions.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Descriptions.Item label="Ngày sinh">
                  <CalendarOutlined /> {formatDate(profile.dateOfBirth)}
                </Descriptions.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Descriptions.Item label="Địa chỉ">
                  <EnvironmentOutlined /> {profile.address || "Chưa cập nhật"}
                </Descriptions.Item>
              </Col>
            </Row>
          </Card>

          {/* Role-specific Information */}
          {renderRoleSpecificInfo()}

          {/* Edit Form */}
          {isEditing && (
            <Card
              title={
                <Space>
                  <EditOutlined />
                  <span>Chỉnh sửa thông tin</span>
                </Space>
              }
              style={{ marginTop: "24px" }}
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={handleUpdateProfile}
                initialValues={{
                  gender: "",
                  maritalStatus: "",
                }}
              >
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="fullName"
                      label="Họ và tên"
                      rules={[
                        { required: true, message: "Vui lòng nhập họ và tên!" },
                        {
                          min: 2,
                          message: "Họ và tên phải có ít nhất 2 ký tự!",
                        },
                      ]}
                    >
                      <Input
                        prefix={<UserOutlined />}
                        placeholder="Nhập họ và tên"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="email"
                      label="Email"
                      rules={[
                        { required: true, message: "Vui lòng nhập email!" },
                        {
                          type: "email",
                          message: "Email không đúng định dạng!",
                        },
                      ]}
                    >
                      <Input
                        prefix={<MailOutlined />}
                        placeholder="Nhập email"
                        disabled
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="phone"
                      label="Số điện thoại"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập số điện thoại!",
                        },
                        {
                          pattern: /^[0-9]{10,11}$/,
                          message: "Số điện thoại không đúng định dạng!",
                        },
                      ]}
                    >
                      <Input
                        prefix={<PhoneOutlined />}
                        placeholder="Nhập số điện thoại"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="gender" label="Giới tính">
                      <Select placeholder="Chọn giới tính">
                        <Option value="male">Nam</Option>
                        <Option value="female">Nữ</Option>
                        <Option value="other">Khác</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="dateOfBirth"
                      label="Ngày sinh"
                      rules={[
                        {
                          validator: (_, value) => {
                            if (!value) return Promise.resolve();
                            const age = dayjs().diff(value, "year");
                            if (age < 18 || age > 100) {
                              return Promise.reject(
                                new Error("Tuổi phải từ 18 đến 100!")
                              );
                            }
                            return Promise.resolve();
                          },
                        },
                      ]}
                    >
                      <DatePicker
                        style={{ width: "100%" }}
                        placeholder="Chọn ngày sinh"
                        disabledDate={(current) => {
                          const age = dayjs().diff(current, "year");
                          return age < 18 || age > 100;
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Form.Item name="address" label="Địa chỉ">
                      <TextArea rows={3} placeholder="Nhập địa chỉ đầy đủ..." />
                    </Form.Item>
                  </Col>

                  {/* Role-specific fields */}
                  {user?.role?.toUpperCase() === USER_ROLES.DOCTOR && (
                    <>
                      <Col xs={24} sm={12}>
                        <Form.Item name="specialty" label="Chuyên khoa">
                          <Input placeholder="VD: Sản phụ khoa" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="qualification" label="Bằng cấp">
                          <Input placeholder="VD: Thạc sĩ, Tiến sĩ" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          name="experienceYears"
                          label="Số năm kinh nghiệm"
                          rules={[
                            {
                              type: "number",
                              min: 0,
                              max: 50,
                              message: "Số năm kinh nghiệm phải từ 0-50!",
                            },
                          ]}
                        >
                          <Input
                            type="number"
                            min={0}
                            max={50}
                            placeholder="Nhập số năm kinh nghiệm"
                          />
                        </Form.Item>
                      </Col>
                    </>
                  )}

                  {(user?.role?.toUpperCase() === USER_ROLES.CUSTOMER ||
                    user?.role?.toUpperCase() === USER_ROLES.PATIENT) && (
                    <>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          name="maritalStatus"
                          label="Tình trạng hôn nhân"
                        >
                          <Select placeholder="Chọn tình trạng">
                            <Option value="độc thân">Độc thân</Option>
                            <Option value="đã kết hôn">Đã kết hôn</Option>
                            <Option value="đã ly hôn">Đã ly hôn</Option>
                            <Option value="góa">Góa</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          name="healthBackground"
                          label="Tiền sử sức khỏe"
                        >
                          <TextArea
                            rows={2}
                            placeholder="Mô tả ngắn về tình trạng sức khỏe..."
                          />
                        </Form.Item>
                      </Col>
                    </>
                  )}

                  {(user?.role?.toUpperCase() === USER_ROLES.MANAGER ||
                    user?.role?.toUpperCase() === USER_ROLES.ADMIN) && (
                    <>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          name="assignedDepartment"
                          label="Phòng ban phụ trách"
                        >
                          <Input placeholder="VD: Phòng kế hoạch" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          name="extraPermissions"
                          label="Quyền mở rộng"
                        >
                          <Input placeholder="VD: Quản lý hệ thống" />
                        </Form.Item>
                      </Col>
                    </>
                  )}
                </Row>

                <Divider />

                <div style={{ textAlign: "right" }}>
                  <Space>
                    <Button onClick={handleEditToggle} disabled={updateLoading}>
                      Hủy
                    </Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={updateLoading}
                      icon={<SaveOutlined />}
                    >
                      {updateLoading ? "Đang lưu..." : "Lưu thay đổi"}
                    </Button>
                  </Space>
                </div>
              </Form>
            </Card>
          )}
        </Card>
      </div>
    </>
  );
};

export default UserProfile;
