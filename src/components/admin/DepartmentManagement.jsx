import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Button,
  Space,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
  Drawer,
  Descriptions,
  Divider,
  Row,
  Col,
  Statistic,
  Progress,
  Tag,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  TeamOutlined,
  UserOutlined,
  MedicineBoxOutlined,
} from "@ant-design/icons";
import { departmentAPI } from "../../services/api";

const { Search } = Input;
const { TextArea } = Input;

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewDrawerVisible, setIsViewDrawerVisible] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");

  // Stats
  const [stats, setStats] = useState({
    totalDepartments: 0,
    totalDoctors: 0,
    totalPatients: 0,
    avgPatientsPerDept: 0,
  });

  useEffect(() => {
    fetchDepartments();
  }, [searchText]);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response = await departmentAPI.getAll();
      const filteredData = searchText
        ? response.data.filter(
            (dept) =>
              dept.name.toLowerCase().includes(searchText.toLowerCase()) ||
              dept.description.toLowerCase().includes(searchText.toLowerCase())
          )
        : response.data;

      setDepartments(filteredData);

      // Calculate stats
      const totalDoctors = filteredData.reduce(
        (sum, dept) => sum + dept.doctorCount,
        0
      );
      const totalPatients = filteredData.reduce(
        (sum, dept) => sum + dept.patientCount,
        0
      );

      setStats({
        totalDepartments: filteredData.length,
        totalDoctors,
        totalPatients,
        avgPatientsPerDept:
          filteredData.length > 0
            ? Math.round(totalPatients / filteredData.length)
            : 0,
      });
    } catch (error) {
      message.error("Lỗi khi tải danh sách phòng ban");
      console.error(error);
    }
    setLoading(false);
  };

  const handleCreate = () => {
    setSelectedDepartment(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (department) => {
    setSelectedDepartment(department);
    form.setFieldsValue(department);
    setIsModalVisible(true);
  };

  const handleView = (department) => {
    setSelectedDepartment(department);
    setIsViewDrawerVisible(true);
  };

  const handleDelete = async (departmentId) => {
    try {
      await departmentAPI.delete(departmentId);
      message.success("Xóa phòng ban thành công");
      fetchDepartments();
    } catch (error) {
      message.error("Lỗi khi xóa phòng ban");
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (selectedDepartment) {
        // Update
        await departmentAPI.update(selectedDepartment.id, values);
        message.success("Cập nhật phòng ban thành công");
      } else {
        // Create
        await departmentAPI.create({
          ...values,
          doctorCount: 0,
          patientCount: 0,
          status: "active",
        });
        message.success("Tạo phòng ban thành công");
      }
      setIsModalVisible(false);
      fetchDepartments();
    } catch (error) {
      message.error("Lỗi khi lưu thông tin phòng ban");
    }
  };

  const getEfficiencyColor = (patientCount) => {
    if (patientCount >= 400) return "#52c41a"; // Green
    if (patientCount >= 200) return "#faad14"; // Orange
    return "#ff4d4f"; // Red
  };

  const getEfficiencyText = (patientCount) => {
    if (patientCount >= 400) return "Cao";
    if (patientCount >= 200) return "Trung bình";
    return "Thấp";
  };

  const columns = [
    {
      title: "Tên phòng ban",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Số bác sĩ",
      dataIndex: "doctorCount",
      key: "doctorCount",
      sorter: (a, b) => a.doctorCount - b.doctorCount,
      render: (count) => (
        <Space>
          <TeamOutlined style={{ color: "#1890ff" }} />
          <span>{count}</span>
        </Space>
      ),
    },
    {
      title: "Số bệnh nhân",
      dataIndex: "patientCount",
      key: "patientCount",
      sorter: (a, b) => a.patientCount - b.patientCount,
      render: (count) => (
        <Space>
          <UserOutlined style={{ color: "#52c41a" }} />
          <span>{count}</span>
        </Space>
      ),
    },
    {
      title: "Hiệu suất",
      key: "efficiency",
      render: (_, record) => {
        const efficiency = record.patientCount;
        const color = getEfficiencyColor(efficiency);
        const text = getEfficiencyText(efficiency);
        return <Tag color={color}>{text}</Tag>;
      },
      sorter: (a, b) => a.patientCount - b.patientCount,
    },
    {
      title: "Tỷ lệ bệnh nhân/bác sĩ",
      key: "ratio",
      render: (_, record) => {
        const ratio =
          record.doctorCount > 0
            ? (record.patientCount / record.doctorCount).toFixed(1)
            : 0;
        return <span>{ratio}</span>;
      },
      sorter: (a, b) => {
        const ratioA = a.doctorCount > 0 ? a.patientCount / a.doctorCount : 0;
        const ratioB = b.doctorCount > 0 ? b.patientCount / b.doctorCount : 0;
        return ratioA - ratioB;
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 150,
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
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa phòng ban này?"
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
    <div className="department-management">
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="Tổng phòng ban"
              value={stats.totalDepartments}
              valueStyle={{ color: "#1890ff" }}
              prefix={<MedicineBoxOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="Tổng bác sĩ"
              value={stats.totalDoctors}
              valueStyle={{ color: "#52c41a" }}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="Tổng bệnh nhân"
              value={stats.totalPatients}
              valueStyle={{ color: "#fa8c16" }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="TB bệnh nhân/phòng ban"
              value={stats.avgPatientsPerDept}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Card title="Quản lý phòng ban" className="dashboard-card">
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
              placeholder="Tìm kiếm phòng ban..."
              allowClear
              style={{ width: 300 }}
              onSearch={setSearchText}
            />
            <Button icon={<ReloadOutlined />} onClick={fetchDepartments}>
              Làm mới
            </Button>
          </Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Thêm phòng ban
          </Button>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={departments}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} phòng ban`,
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={
          selectedDepartment ? "Chỉnh sửa phòng ban" : "Thêm phòng ban mới"
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Tên phòng ban"
            name="name"
            rules={[
              { required: true, message: "Vui lòng nhập tên phòng ban!" },
            ]}
          >
            <Input placeholder="VD: IVF, Khám tổng quát..." />
          </Form.Item>

          <Form.Item
            label="Mô tả"
            name="description"
            rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
          >
            <TextArea
              rows={4}
              placeholder="Mô tả chi tiết về chức năng và dịch vụ của phòng ban..."
            />
          </Form.Item>

          <div style={{ textAlign: "right" }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                {selectedDepartment ? "Cập nhật" : "Tạo mới"}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* View Details Drawer */}
      <Drawer
        title="Chi tiết phòng ban"
        placement="right"
        width={500}
        onClose={() => setIsViewDrawerVisible(false)}
        open={isViewDrawerVisible}
      >
        {selectedDepartment && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  backgroundColor: "#1890ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  fontSize: "32px",
                  color: "white",
                }}
              >
                <MedicineBoxOutlined />
              </div>
              <h3 style={{ marginBottom: 8 }}>{selectedDepartment.name}</h3>
              <Tag color={getEfficiencyColor(selectedDepartment.patientCount)}>
                Hiệu suất: {getEfficiencyText(selectedDepartment.patientCount)}
              </Tag>
            </div>

            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Tên phòng ban">
                {selectedDepartment.name}
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả">
                {selectedDepartment.description}
              </Descriptions.Item>
              <Descriptions.Item label="Số bác sĩ">
                <Space>
                  <TeamOutlined style={{ color: "#1890ff" }} />
                  {selectedDepartment.doctorCount}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Số bệnh nhân">
                <Space>
                  <UserOutlined style={{ color: "#52c41a" }} />
                  {selectedDepartment.patientCount}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Tỷ lệ bệnh nhân/bác sĩ">
                {selectedDepartment.doctorCount > 0
                  ? (
                      selectedDepartment.patientCount /
                      selectedDepartment.doctorCount
                    ).toFixed(1)
                  : 0}
              </Descriptions.Item>
            </Descriptions>

            <Divider>Thống kê hoạt động</Divider>

            <div style={{ marginBottom: 16 }}>
              <p>Tỷ lệ công suất:</p>
              <Progress
                percent={Math.min(
                  (selectedDepartment.patientCount / 500) * 100,
                  100
                )}
                strokeColor={getEfficiencyColor(
                  selectedDepartment.patientCount
                )}
                format={(percent) => `${percent.toFixed(0)}%`}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <p>Phân bổ nhân lực:</p>
              <Progress
                percent={Math.min(
                  (selectedDepartment.doctorCount / 20) * 100,
                  100
                )}
                strokeColor="#722ed1"
                format={(percent) => `${percent.toFixed(0)}%`}
              />
            </div>

            <Divider />

            <div style={{ textAlign: "center" }}>
              <Space>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => {
                    setIsViewDrawerVisible(false);
                    handleEdit(selectedDepartment);
                  }}
                >
                  Chỉnh sửa
                </Button>
                <Button icon={<TeamOutlined />}>Quản lý nhân sự</Button>
              </Space>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default DepartmentManagement;
