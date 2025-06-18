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
  DeleteOutlined,
  UserOutlined,
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  LockOutlined,
  UnlockOutlined,
} from "@ant-design/icons";
import { userAPI } from "../../services/api";

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
  const [filterRole, setFilterRole] = useState("");
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

  useEffect(() => {
    fetchUsers();
  }, [pagination.current, pagination.pageSize, searchText, filterRole]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        search: searchText,
        role: filterRole,
      };

      const response = await userAPI.getAll(params);
      setUsers(response.data);
      setPagination((prev) => ({
        ...prev,
        total: response.total,
      }));

      // Calculate stats
      const newStats = {
        total: response.total,
        admin: response.data.filter((u) => u.role === "admin").length,
        manager: response.data.filter((u) => u.role === "manager").length,
        doctor: response.data.filter((u) => u.role === "doctor").length,
        patient: response.data.filter((u) => u.role === "patient").length,
        active: response.data.filter((u) => u.status === "active").length,
      };
      setStats(newStats);
    } catch (error) {
      message.error("Lỗi khi tải danh sách người dùng");
      console.error(error);
    }
    setLoading(false);
  };

  const handleCreate = () => {
    setSelectedUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    form.setFieldsValue({
      ...user,
      password: "", // Don't show existing password
    });
    setIsModalVisible(true);
  };

  const handleView = (user) => {
    setSelectedUser(user);
    setIsViewDrawerVisible(true);
  };

  const handleDelete = async (userId) => {
    try {
      await userAPI.delete(userId);
      message.success("Xóa người dùng thành công");
      fetchUsers();
    } catch (error) {
      message.error("Lỗi khi xóa người dùng");
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      const newStatus = user.status === "active" ? "inactive" : "active";
      await userAPI.update(user.id, { status: newStatus });
      message.success(
        `${
          newStatus === "active" ? "Kích hoạt" : "Vô hiệu hóa"
        } người dùng thành công`
      );
      fetchUsers();
    } catch (error) {
      message.error("Lỗi khi cập nhật trạng thái người dùng");
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (selectedUser) {
        // Update
        await userAPI.update(selectedUser.id, values);
        message.success("Cập nhật người dùng thành công");
      } else {
        // Create
        await userAPI.create(values);
        message.success("Tạo người dùng thành công");
      }
      setIsModalVisible(false);
      fetchUsers();
    } catch (error) {
      message.error("Lỗi khi lưu thông tin người dùng");
    }
  };

  const getRoleDisplay = (role) => {
    const roleMap = {
      admin: { text: "Quản trị viên", color: "blue" },
      manager: { text: "Quản lý", color: "green" },
      doctor: { text: "Bác sĩ", color: "purple" },
      patient: { text: "Bệnh nhân", color: "orange" },
      customer: { text: "Khách hàng", color: "gold" },
    };
    const roleInfo = roleMap[role] || { text: role, color: "default" };
    return <Tag color={roleInfo.color}>{roleInfo.text}</Tag>;
  };

  const getStatusDisplay = (status) => {
    return status === "active" ? (
      <Badge status="success" text="Hoạt động" />
    ) : (
      <Badge status="error" text="Vô hiệu hóa" />
    );
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
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: getRoleDisplay,
      filters: [
        { text: "Quản trị viên", value: "admin" },
        { text: "Quản lý", value: "manager" },
        { text: "Bác sĩ", value: "doctor" },
        { text: "Bệnh nhân", value: "patient" },
        { text: "Khách hàng", value: "customer" },
      ],
    },
    {
      title: "Phòng ban",
      dataIndex: "department",
      key: "department",
      render: (department) => department || "-",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: getStatusDisplay,
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
            icon={
              record.status === "active" ? <LockOutlined /> : <UnlockOutlined />
            }
            onClick={() => handleToggleStatus(record)}
            title={record.status === "active" ? "Vô hiệu hóa" : "Kích hoạt"}
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa người dùng này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="link" danger icon={<DeleteOutlined />} title="Xóa" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

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
              style={{ width: 150 }}
              onChange={setFilterRole}
            >
              <Option value="admin">Quản trị viên</Option>
              <Option value="manager">Quản lý</Option>
              <Option value="doctor">Bác sĩ</Option>
              <Option value="patient">Bệnh nhân</Option>
              <Option value="customer">Khách hàng</Option>
            </Select>
            <Button icon={<ReloadOutlined />} onClick={fetchUsers}>
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
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Vai trò"
                name="role"
                rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}
              >
                <Select>
                  <Option value="admin">Quản trị viên</Option>
                  <Option value="manager">Quản lý</Option>
                  <Option value="doctor">Bác sĩ</Option>
                  <Option value="patient">Bệnh nhân</Option>
                  <Option value="customer">Khách hàng</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Phòng ban" name="department">
                <Select allowClear>
                  <Option value="IT">IT</Option>
                  <Option value="IVF">IVF</Option>
                  <Option value="Khám tổng quát">Khám tổng quát</Option>
                  <Option value="Siêu âm">Siêu âm</Option>
                  <Option value="Xét nghiệm">Xét nghiệm</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {!selectedUser && (
            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
            >
              <Input.Password />
            </Form.Item>
          )}

          <Form.Item label="Trạng thái" name="status" initialValue="active">
            <Select>
              <Option value="active">Hoạt động</Option>
              <Option value="inactive">Vô hiệu hóa</Option>
            </Select>
          </Form.Item>

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

            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Email">
                {selectedUser.email}
              </Descriptions.Item>
              <Descriptions.Item label="Vai trò">
                {getRoleDisplay(selectedUser.role)}
              </Descriptions.Item>
              <Descriptions.Item label="Phòng ban">
                {selectedUser.department || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {getStatusDisplay(selectedUser.status)}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {new Date(selectedUser.createdAt).toLocaleDateString("vi-VN")}
              </Descriptions.Item>
              <Descriptions.Item label="Chuyên khoa">
                {selectedUser.specialty || "-"}
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
