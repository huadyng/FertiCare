import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Avatar,
  Badge,
  Drawer,
  Descriptions,
  Divider,
  DatePicker,
  Row,
  Col,
  Statistic,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  UserOutlined,
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  LockOutlined,
  UnlockOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import apiAdmin from "../../api/apiAdmin";
import { dateOfBirthValidator, getDateOfBirthConstraints } from "../../../utils/dateValidation";

const { Option } = Select;
const { Search } = Input;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewDrawerVisible, setIsViewDrawerVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [filterRole, setFilterRole] = useState([]);
  const [filterStatus, setFilterStatus] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    admin: 0,
    manager: 0,
    doctor: 0,
    patient: 0,
    active: 0,
  });

  // Departments for dropdown
  const [departments, setDepartments] = useState([]);
  // Track selected role for conditional validation
  const [selectedRole, setSelectedRole] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [pagination.current, pagination.pageSize, searchText, filterRole, filterStatus]);

  // Initialize departments with hardcoded data
  useEffect(() => {
    fetchDepartments();
  }, []);

  // Debug: Track users state changes
  useEffect(() => {
    console.log("🔄 [UserManagement] Users state updated:", users.length, "users");
    if (users.length > 0) {
      console.log("🔄 [UserManagement] First user status:", users[0].fullName, users[0].emailVerified);
    }
  }, [users]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Check authentication first
      const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
      const user = localStorage.getItem("user");
      
      if (!token || !user) {
        message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
        window.location.href = "/login";
        return;
      }
      
      const params = {
        page: pagination.current - 1, // Spring pagination starts from 0
        size: pagination.pageSize,
        search: searchText,
        role: filterRole.length > 0 ? filterRole.join(',') : "",
        status: filterStatus.length > 0 ? filterStatus.join(',') : "",
      };

      console.log("🔍 [UserManagement] Fetching users with params:", params);
      
      // Use real API instead of mock
      const response = await apiAdmin.getAllUsers(params);
      
      console.log("✅ [UserManagement] Users received:", response);
      console.log("🔍 [UserManagement] Sample user data:", response.content?.[0]);
      console.log("🔍 [UserManagement] All users with status:", response.content?.map(u => ({id: u.id, fullName: u.fullName, emailVerified: u.emailVerified})));
      
      // Handle Spring Boot pagination response
      setUsers(response.content || response.data || []);
      setPagination((prev) => ({
        ...prev,
        total: response.totalElements || response.total || 0,
      }));

      // Get user stats from dedicated API
      try {
        const statsResponse = await apiAdmin.getUserStats();
        setStats({
          total: statsResponse.total,
          admin: statsResponse.admin,
          manager: statsResponse.manager,
          doctor: statsResponse.doctor,
          patient: statsResponse.patient,
          active: statsResponse.active,
        });
      } catch (statsError) {
        console.warn("⚠️ [UserManagement] Failed to fetch user stats:", statsError);
        // Calculate stats from current data as fallback
        const users = response.content || response.data || [];
        const newStats = {
          total: response.totalElements || response.total || 0,
          admin: users.filter((u) => u.role === "ADMIN").length,
          manager: users.filter((u) => u.role === "MANAGER").length,
          doctor: users.filter((u) => u.role === "DOCTOR").length,
          patient: users.filter((u) => u.role === "CUSTOMER").length,
          active: users.filter((u) => u.emailVerified === true).length,
        };
        setStats(newStats);
      }
    } catch (error) {
      console.error("❌ [UserManagement] Failed to fetch users:", error);
      
      // Handle authentication errors
      if (error.response?.status === 403) {
        message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
        // Clear invalid data
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("accessToken");
        // Redirect to login
        window.location.href = "/login";
        return;
      }
      
      message.error("Lỗi khi tải danh sách người dùng: " + (error.response?.data?.message || error.message));
    }
    setLoading(false);
  };

  const fetchDepartments = async () => {
    try {
      console.log("🔍 [UserManagement] Fetching active departments...");
      const response = await apiAdmin.getAllDepartments();
      // Filter only active departments
      const activeDepartments = response.filter(dept => dept.isActive === true);
      console.log("✅ [UserManagement] Active departments:", activeDepartments);
      setDepartments(activeDepartments);
    } catch (error) {
      console.error("❌ [UserManagement] Failed to fetch departments:", error);
      // Fallback to empty array
      setDepartments([]);
    }
  };

  const handleCreate = () => {
    setSelectedUser(null);
    setSelectedRole(null);
    form.resetFields();
    form.setFieldValue('password', 'Abcd1234');
    setIsModalVisible(true);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setSelectedRole(user.role || null);
    form.setFieldsValue({
      fullName: user.fullName || "",
      email: user.email || "",
      phone: user.phone || "",
      dateOfBirth: user.dateOfBirth ? dayjs(user.dateOfBirth) : null,
      gender: user.gender || null,
      address: user.address || "",
      role: user.role || null,
      department: user.department || null,
      status: user.emailVerified ? "active" : "inactive",
      password: "", // Don't show existing password
    });
    setIsModalVisible(true);
  };

  const handleView = (user) => {
    setSelectedUser(user);
    setIsViewDrawerVisible(true);
  };



  const handleToggleStatus = async (user) => {
    try {
      console.log("🔍 [UserManagement] Before toggle - user status:", user.emailVerified);
      const updatedUser = await apiAdmin.toggleUserStatus(user.id);
      console.log("✅ [UserManagement] Toggle response:", updatedUser);
      
      // Update state immediately for instant UI feedback
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === user.id 
            ? { ...u, emailVerified: updatedUser.emailVerified }
            : u
        )
      );
      
      message.success("Cập nhật trạng thái người dùng thành công");
      console.log("🔄 [UserManagement] User state updated immediately");
      
      // Also refresh from server to ensure consistency
      await fetchUsers();
      console.log("🔄 [UserManagement] Users data refreshed after toggle");
    } catch (error) {
      console.error("❌ [UserManagement] Status toggle failed:", error);
      message.error("Lỗi khi cập nhật trạng thái người dùng: " + (error.response?.data?.message || error.message));
    }
  };

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    // Clear department if role doesn't require it
    if (role !== 'DOCTOR' && role !== 'MANAGER') {
      form.setFieldValue('department', null);
    }
  };

  const handleSubmit = async (values) => {
    try {
      console.log("🔍 [UserManagement] Submitting user data:", values);
      
      // Check authentication first
      const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
      const user = localStorage.getItem("user");
      
      if (!token || !user) {
        message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
        // Redirect to login
        window.location.href = "/login";
        return;
      }
      
      // Process dateOfBirth from DatePicker
      const processedValues = {
        ...values,
        dateOfBirth: values.dateOfBirth ? dayjs(values.dateOfBirth).format('YYYY-MM-DD') : null
      };

      // Set password logic
      if (selectedUser) {
        // Update: only send password if provided
        if (!values.password || values.password.trim() === "") {
          delete processedValues.password;
        }
      } else {
        // Create: always set password to "Abcd1234"
        processedValues.password = "Abcd1234";
      }
      
      console.log("🔍 [UserManagement] Processed values:", processedValues);
      
      if (selectedUser) {
        // Update
        await apiAdmin.updateUser(selectedUser.id, processedValues);
        message.success("Cập nhật người dùng thành công");
      } else {
        // Create
        await apiAdmin.createUser(processedValues);
        message.success("Tạo người dùng thành công");
      }
      setIsModalVisible(false);
      fetchUsers();
    } catch (error) {
      console.error("❌ [UserManagement] Submit failed:", error);
      
      // Handle authentication errors
      if (error.response?.status === 403) {
        message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
        // Clear invalid data
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("accessToken");
        // Redirect to login
        window.location.href = "/login";
        return;
      }
      
      message.error("Lỗi khi lưu thông tin người dùng: " + (error.response?.data?.message || error.message));
    }
  };

  const getRoleDisplay = (role) => {
    const roleMap = {
      ADMIN: { text: "Quản trị viên", color: "blue" },
      MANAGER: { text: "Quản lý", color: "green" },
      DOCTOR: { text: "Bác sĩ", color: "purple" },
      CUSTOMER: { text: "Bệnh nhân", color: "orange" },
      // Backward compatibility
      admin: { text: "Quản trị viên", color: "blue" },
      manager: { text: "Quản lý", color: "green" },
      doctor: { text: "Bác sĩ", color: "purple" },
      patient: { text: "Bệnh nhân", color: "orange" },
      customer: { text: "Khách hàng", color: "gold" },
    };
    const roleInfo = roleMap[role] || { text: role, color: "default" };
    return <Tag color={roleInfo.color}>{roleInfo.text}</Tag>;
  };



  const columns = [
    {
      title: "Avatar",
      dataIndex: "avatar",
      key: "avatar",
      width: 80,
      render: (_, record) => (
        <Avatar
          size="large"
          icon={<UserOutlined />}
          style={{
            backgroundColor: record.role === "admin" ? "#1890ff" : "#87d068",
          }}
        >
          {record.fullName?.charAt(0)}
        </Avatar>
      ),
    },
    {
      title: "Họ tên",
      dataIndex: "fullName",
      key: "fullName",
      sorter: true,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Số ĐT",
      dataIndex: "phone",
      key: "phone",
      width: 120,
      render: (phone) => phone || "-",
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: getRoleDisplay,
      filters: [
        { text: "Quản trị viên", value: "ADMIN" },
        { text: "Quản lý", value: "MANAGER" },
        { text: "Bác sĩ", value: "DOCTOR" },
        { text: "Bệnh nhân", value: "CUSTOMER" },
      ],
    },
    {
      title: "Trạng thái",
      dataIndex: "emailVerified",
      key: "status",
      render: (emailVerified) => {
        return emailVerified === true ? (
          <Badge status="success" text="Hoạt động" />
        ) : (
          <Badge status="error" text="Vô hiệu hóa" />
        );
      },
      filters: [
        { text: "Hoạt động", value: "active" },
        { text: "Vô hiệu hóa", value: "inactive" },
      ],
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: true,
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 200,
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
            title="Xem chi tiết"
          />
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            title="Chỉnh sửa"
          />
          <Button
            type="link"
            icon={record.emailVerified === true ? <LockOutlined /> : <UnlockOutlined />}
            onClick={() => handleToggleStatus(record)}
            title={record.emailVerified === true ? "Vô hiệu hóa" : "Kích hoạt"}
          />

        </Space>
      ),
    },
  ];

  // Check if user is authenticated
  const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
  const user = localStorage.getItem("user");
  
  if (!token || !user) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '50px 20px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        margin: '20px'
      }}>
        <div style={{ fontSize: '24px', color: '#666', marginBottom: '16px' }}>
          🔒 Phiên đăng nhập đã hết hạn
        </div>
        <div style={{ fontSize: '16px', color: '#999', marginBottom: '24px' }}>
          Vui lòng đăng nhập lại để tiếp tục sử dụng hệ thống
        </div>
        <Button 
          type="primary" 
          size="large"
          onClick={() => window.location.href = "/login"}
        >
          Đăng nhập lại
        </Button>
      </div>
    );
  }

  return (
    <div className="user-management">
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={8} md={4}>
          <Card>
            <Statistic
              title="Tổng số"
              value={stats.total}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card>
            <Statistic
              title="Admin"
              value={stats.admin}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card>
            <Statistic
              title="Manager"
              value={stats.manager}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card>
            <Statistic
              title="Bác sĩ"
              value={stats.doctor}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card>
            <Statistic
              title="Bệnh nhân"
              value={stats.patient}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card>
            <Statistic
              title="Hoạt động"
              value={stats.active}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Card title="Quản lý người dùng" className="dashboard-card">
        {/* Toolbar */}
        <div
          style={{
            marginBottom: 16,
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          {/* Filter Info */}
          {(searchText || filterRole.length > 0 || filterStatus.length > 0) && (
            <div style={{ 
              width: "100%", 
              marginBottom: 8, 
              padding: "8px 12px", 
              backgroundColor: "#f0f8ff", 
              borderRadius: 6,
              fontSize: "12px",
              color: "#666"
            }}>
              <strong>Bộ lọc hiện tại:</strong>
              {searchText && <span style={{ marginLeft: 8 }}>Tìm kiếm: "{searchText}"</span>}
              {filterRole.length > 0 && (
                <span style={{ marginLeft: 8 }}>
                  Vai trò: {filterRole.map(role => {
                    const roleMap = {
                      "ADMIN": "Quản trị viên",
                      "MANAGER": "Quản lý", 
                      "DOCTOR": "Bác sĩ",
                      "CUSTOMER": "Bệnh nhân"
                    };
                    return roleMap[role] || role;
                  }).join(", ")}
                </span>
              )}
              {filterStatus.length > 0 && (
                <span style={{ marginLeft: 8 }}>
                  Trạng thái: {filterStatus.map(status => {
                    return status === "active" ? "Hoạt động" : "Vô hiệu hóa";
                  }).join(", ")}
                </span>
              )}
            </div>
          )}
          <Space wrap>
            <Search
              placeholder="Tìm kiếm theo tên, email..."
              allowClear
              style={{ width: 300 }}
              onSearch={setSearchText}
            />
            <Select
              placeholder="Lọc theo vai trò"
              allowClear
              mode="multiple"
              style={{ width: 200 }}
              onChange={setFilterRole}
              maxTagCount="responsive"
            >
              <Option value="ADMIN">Quản trị viên</Option>
              <Option value="MANAGER">Quản lý</Option>
              <Option value="DOCTOR">Bác sĩ</Option>
              <Option value="CUSTOMER">Bệnh nhân</Option>
            </Select>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => {
                setSearchText("");
                setFilterRole([]);
                setFilterStatus([]);
                setPagination(prev => ({ ...prev, current: 1 }));
              }}
            >
              Làm mới
            </Button>
          </Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Thêm người dùng
          </Button>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} người dùng`,
          }}
          onChange={(paginationInfo, filters, sorter) => {
            setPagination(paginationInfo);
            
            // Handle column filters
            if (filters.role) {
              setFilterRole(filters.role);
            } else {
              setFilterRole([]);
            }
            
            if (filters.status) {
              setFilterStatus(filters.status);
            } else {
              setFilterStatus([]);
            }
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={selectedUser ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Họ tên"
                name="fullName"
                rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Vui lòng nhập email!" },
                  { type: "email", message: "Email không hợp lệ!" },
                ]}
              >
                <Input disabled={selectedUser !== null} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Số điện thoại"
                name="phone"
                rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Ngày sinh"
                name="dateOfBirth"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày sinh!" },
                  { validator: dateOfBirthValidator }
                ]}
              >
                <DatePicker 
                  style={{ width: "100%" }} 
                  format="YYYY-MM-DD"
                  disabledDate={(current) => {
                    const { minDate, maxDate } = getDateOfBirthConstraints();
                    return current && (current < minDate || current > maxDate);
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Giới tính"
                name="gender"
                rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
              >
                <Select>
                  <Option value="MALE">Nam</Option>
                  <Option value="FEMALE">Nữ</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Địa chỉ"
            name="address"
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
          >
            <Input />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Vai trò"
                name="role"
                rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}
              >
                <Select onChange={handleRoleChange}>
                  <Option value="ADMIN">Quản trị viên</Option>
                  <Option value="MANAGER">Quản lý</Option>
                  <Option value="DOCTOR">Bác sĩ</Option>
                  <Option value="CUSTOMER">Bệnh nhân</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                label="Phòng ban" 
                name="department"
                rules={[
                  {
                    required: selectedRole === 'DOCTOR' || selectedRole === 'MANAGER',
                    message: "Vui lòng chọn phòng ban!"
                  }
                ]}
              >
                <Select 
                  allowClear 
                  placeholder="Chọn phòng ban"
                  disabled={selectedRole !== 'DOCTOR' && selectedRole !== 'MANAGER'}
                >
                  {departments.map(dept => (
                    <Option key={dept.id} value={dept.name}>
                      {dept.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Mật khẩu"
            name="password"
            initialValue="Abcd1234"
            rules={[
              { 
                required: !selectedUser, 
                message: "Vui lòng nhập mật khẩu!" 
              }
            ]}
            extra={selectedUser ? "Để trống nếu không muốn thay đổi mật khẩu" : "Mật khẩu mặc định: Abcd1234"}
          >
            <Input.Password 
              placeholder="Mật khẩu mặc định: Abcd1234" 
              disabled={!selectedUser}
              value="Abcd1234"
            />
          </Form.Item>

          {/* Chỉ hiển thị trạng thái khi edit user, không hiển thị khi tạo mới */}
          {selectedUser && (
            <Form.Item label="Trạng thái" name="status" initialValue="active">
              <Select>
                <Option value="active">Hoạt động</Option>
                <Option value="inactive">Vô hiệu hóa</Option>
              </Select>
            </Form.Item>
          )}

          <div style={{ textAlign: "right" }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                {selectedUser ? "Cập nhật" : "Tạo mới"}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* View Details Drawer */}
      <Drawer
        title="Chi tiết người dùng"
        placement="right"
        width={500}
        onClose={() => setIsViewDrawerVisible(false)}
        open={isViewDrawerVisible}
      >
        {selectedUser && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <Avatar
                size={80}
                icon={<UserOutlined />}
                style={{ backgroundColor: "#1890ff" }}
              >
                {selectedUser.fullName?.charAt(0)}
              </Avatar>
              <h3 style={{ marginTop: 16, marginBottom: 8 }}>
                {selectedUser.fullName}
              </h3>
              {getRoleDisplay(selectedUser.role)}
            </div>

            <Descriptions column={1} variant="bordered" size="small">
              <Descriptions.Item label="Email">
                {selectedUser.email}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {selectedUser.phone || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày sinh">
                {selectedUser.dateOfBirth ? new Date(selectedUser.dateOfBirth).toLocaleDateString("vi-VN") : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Giới tính">
                {selectedUser.gender === "MALE" ? "Nam" : selectedUser.gender === "FEMALE" ? "Nữ" : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">
                {selectedUser.address || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Vai trò">
                {getRoleDisplay(selectedUser.role)}
              </Descriptions.Item>
              <Descriptions.Item label="Phòng ban">
                {selectedUser.department || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {selectedUser.emailVerified === true ? (
                  <Badge status="success" text="Hoạt động" />
                ) : (
                  <Badge status="error" text="Vô hiệu hóa" />
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString("vi-VN") : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày cập nhật">
                {selectedUser.updatedAt ? new Date(selectedUser.updatedAt).toLocaleDateString("vi-VN") : "-"}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <div style={{ textAlign: "center" }}>
              <Space>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => {
                    setIsViewDrawerVisible(false);
                    handleEdit(selectedUser);
                  }}
                >
                  Chỉnh sửa
                </Button>
                <Button
                  icon={
                    selectedUser.status === "active" ? (
                      <LockOutlined />
                    ) : (
                      <UnlockOutlined />
                    )
                  }
                  onClick={() => handleToggleStatus(selectedUser)}
                >
                  {selectedUser.status === "active"
                    ? "Vô hiệu hóa"
                    : "Kích hoạt"}
                </Button>
              </Space>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default UserManagement;
