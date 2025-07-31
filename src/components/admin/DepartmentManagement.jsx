import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Tag,
  Tooltip,
  Switch,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import apiAdmin from "../../api/apiAdmin";

const { Search } = Input;
const { TextArea } = Input;

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewDrawerVisible, setIsViewDrawerVisible] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();
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
      console.log("🔍 [DepartmentManagement] Fetching departments from real API...");
      const response = await apiAdmin.getAllDepartments();
      
      // response is already the data array, not wrapped in .data
      const allData = Array.isArray(response) ? response : [];
      
      const filteredData = searchText
        ? allData.filter(
            (dept) =>
              dept.name.toLowerCase().includes(searchText.toLowerCase()) ||
              (dept.description && dept.description.toLowerCase().includes(searchText.toLowerCase()))
          )
        : allData;

      console.log("✅ [DepartmentManagement] Real departments data:", filteredData);
      
      // Use the data directly from Backend without additional processing
      setDepartments(filteredData);
      
      // Calculate stats from departments data
      const totalDoctors = filteredData.reduce(
        (sum, dept) => sum + (dept.doctorCount || 0),
        0
      );
      const totalPatients = filteredData.reduce(
        (sum, dept) => sum + (dept.patientCount || 0),
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
      console.error("❌ [DepartmentManagement] Real API fetch failed:", error);
      message.error("Lỗi khi tải danh sách phòng ban: " + (error.response?.data?.message || error.message));
      
      // Fallback to empty data
      setDepartments([]);
      setStats({
        totalDepartments: 0,
        totalDoctors: 0,
        totalPatients: 0,
        avgPatientsPerDept: 0,
      });
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

  const handleView = async (department) => {
    setSelectedDepartment(department);
    setIsViewDrawerVisible(true);
    
    // Fetch detailed doctor information for this department
    try {
      console.log("🔍 [DepartmentManagement] Fetching doctors for department:", department.name);
      const doctorData = await apiAdmin.getDoctorsByDepartment(department.id, department.name);
      console.log("✅ [DepartmentManagement] Doctor data received:", doctorData);
      
      // Update selected department with doctor details
      setSelectedDepartment(prev => ({
        ...prev,
        doctors: doctorData.doctors || [],
        doctorCount: doctorData.doctorCount || 0
      }));
    } catch (error) {
      console.error("❌ [DepartmentManagement] Failed to fetch doctors:", error);
      message.warning("Không thể tải danh sách bác sĩ");
    }
  };



  const handleSubmit = async (values) => {
    try {
      console.log("🔍 [DepartmentManagement] Submitting department data:", values);
      
      if (selectedDepartment) {
        // Update - đảm bảo isActive được gửi
        const updateData = {
          ...values,
          isActive: values.isActive !== undefined ? values.isActive : selectedDepartment.isActive
        };
        
        // Đảm bảo không gửi undefined
        if (updateData.isActive === undefined) {
          updateData.isActive = selectedDepartment.isActive;
        }
        console.log("🔍 [DepartmentManagement] Updating department with data:", updateData);
        await apiAdmin.updateDepartment(selectedDepartment.id, updateData);
        message.success("Cập nhật phòng ban thành công");
      } else {
        // Create
        const departmentData = {
          ...values,
          doctorCount: 0,
          patientCount: 0,
          isActive: values.isActive !== undefined ? values.isActive : true,
        };
        console.log("🔍 [DepartmentManagement] Creating department with data:", departmentData);
        await apiAdmin.createDepartment(departmentData);
        message.success("Tạo phòng ban thành công");
      }
      setIsModalVisible(false);
      fetchDepartments();
    } catch (error) {
      console.error("❌ [DepartmentManagement] Submit failed:", error);
      message.error("Lỗi khi lưu thông tin phòng ban: " + (error.response?.data?.message || error.message));
    }
  };

  const getEfficiencyColor = (patientCount, doctorCount) => {
    if (doctorCount === 0) return "#ff4d4f"; // Red - không có bác sĩ
    
    const ratio = patientCount / doctorCount;
    if (ratio >= 15) return "#52c41a"; // Green - hiệu suất cao
    if (ratio >= 8) return "#faad14"; // Orange - hiệu suất trung bình
    return "#ff4d4f"; // Red - hiệu suất thấp
  };

  const getEfficiencyText = (patientCount, doctorCount) => {
    if (doctorCount === 0) return "Không có bác sĩ";
    
    const ratio = patientCount / doctorCount;
    if (ratio >= 15) return "Cao";
    if (ratio >= 8) return "Trung bình";
    return "Thấp";
  };

  const getEfficiencyTooltip = (patientCount, doctorCount) => {
    if (doctorCount === 0) {
      return "Không có khả năng phục vụ bệnh nhân – cần ưu tiên xử lý";
    }
    
    const ratio = patientCount / doctorCount;
    if (ratio >= 15) {
      return "Bác sĩ đang phục vụ nhiều bệnh nhân – tối ưu tốt nguồn lực";
    }
    if (ratio >= 8) {
      return "Phân bổ hợp lý, hiệu suất ở mức chấp nhận được";
    }
    return "Bác sĩ đang không được khai thác hết năng lực làm việc";
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
      render: (count, record) => (
        <Button
          type="link"
          style={{ padding: 0, height: 'auto' }}
          onClick={() => handleView(record)}
        >
          <Space>
            <UserOutlined style={{ color: "#1890ff" }} />
            <span>{count}</span>
          </Space>
        </Button>
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
        const color = getEfficiencyColor(record.patientCount, record.doctorCount);
        const text = getEfficiencyText(record.patientCount, record.doctorCount);
        const tooltip = getEfficiencyTooltip(record.patientCount, record.doctorCount);
        return (
          <Tooltip title={tooltip}>
            <Tag color={color}>
              {text} <InfoCircleOutlined style={{ marginLeft: 4, fontSize: '12px' }} />
            </Tag>
          </Tooltip>
        );
      },
      sorter: (a, b) => a.patientCount - b.patientCount,
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Hoạt động" : "Không hoạt động"}
        </Tag>
      ),
      sorter: (a, b) => (a.isActive === b.isActive ? 0 : a.isActive ? 1 : -1),
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
              prefix={<UserOutlined />}
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

          <Form.Item
            label="Trạng thái"
            name="isActive"
            valuePropName="checked"
          >
            <Switch 
              checkedChildren="Hoạt động" 
              unCheckedChildren="Không hoạt động"
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
        zIndex={1000}
        mask={true}
        maskClosable={true}
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
                          <Tooltip title={getEfficiencyTooltip(selectedDepartment.patientCount, selectedDepartment.doctorCount)}>
              <Tag color={getEfficiencyColor(selectedDepartment.patientCount, selectedDepartment.doctorCount)}>
                Hiệu suất: {getEfficiencyText(selectedDepartment.patientCount, selectedDepartment.doctorCount)}
                <InfoCircleOutlined style={{ marginLeft: 4, fontSize: '12px' }} />
              </Tag>
            </Tooltip>
            </div>

            <Descriptions column={1} variant="bordered" size="small">
              <Descriptions.Item label="Tên phòng ban">
                {selectedDepartment.name}
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả">
                {selectedDepartment.description}
              </Descriptions.Item>
              <Descriptions.Item label="Số bác sĩ">
                <Space>
                  <UserOutlined style={{ color: "#1890ff" }} />
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
                <Button 
                  icon={<UserOutlined />}
                  onClick={() => {
                    setIsViewDrawerVisible(false); // Đóng drawer trước
                    navigate('/admin/users', { 
                      state: { departmentFilter: selectedDepartment?.name } 
                    });
                  }}
                >
                  Quản lý người dùng
                </Button>
              </Space>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default DepartmentManagement;
