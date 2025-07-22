import React, { useState, useEffect, useContext } from "react";
import {
  Card,
  Button,
  Row,
  Col,
  Typography,
  Space,
  Badge,
  Tag,
  List,
  Avatar,
  Descriptions,
  Alert,
  message,
  Statistic,
  Tooltip,
  Spin,
  Empty,
  Modal,
  Tabs,
  Table,
  Progress,
  Timeline,
  Divider,
} from "antd";
import {
  UserOutlined,
  FileTextOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  DownloadOutlined,
  EyeOutlined,
  ReloadOutlined,
  MedicineBoxOutlined,
  HeartOutlined,
  ExperimentOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { UserContext } from "../../../context/UserContext";
import apiTreatmentManagement from "../../../api/apiTreatmentManagement";
import "./PatientPages.css";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const MedicalRecords = () => {
  const { user } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [clinicalResults, setClinicalResults] = useState([]);
  const [treatmentHistory, setTreatmentHistory] = useState([]);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadMedicalRecords();
    }
  }, [user]);

  const loadMedicalRecords = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(
        "🏥 [PatientMedicalRecords] Loading medical records for patient:",
        user.id
      );

      // Load all medical data in parallel
      const [clinicalResponse, historyResponse] = await Promise.allSettled([
        apiTreatmentManagement.getPatientClinicalResults(user.id),
        apiTreatmentManagement.getPatientTreatmentHistory(user.id),
      ]);

      // Process clinical results
      const clinicalData =
        clinicalResponse.status === "fulfilled" &&
        clinicalResponse.value?.success
          ? clinicalResponse.value.data || []
          : [];

      // Process treatment history
      const historyData =
        historyResponse.status === "fulfilled" && historyResponse.value?.success
          ? historyResponse.value.data || []
          : [];

      setClinicalResults(clinicalData);
      setTreatmentHistory(historyData);

      console.log("✅ [PatientMedicalRecords] Medical records loaded:", {
        clinicalResults: clinicalData.length,
        treatmentHistory: historyData.length,
      });
    } catch (error) {
      console.error(
        "❌ [PatientMedicalRecords] Error loading medical records:",
        error
      );
      setError("Không thể tải hồ sơ y tế. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadMedicalRecords();
    setRefreshing(false);
    message.success("Đã cập nhật hồ sơ y tế");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa có thông tin";
    try {
      return new Date(dateString).toLocaleDateString("vi-VN");
    } catch (error) {
      return "Ngày không hợp lệ";
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "Chưa có thông tin";
    try {
      return new Date(dateTimeString).toLocaleString("vi-VN");
    } catch (error) {
      return "Thời gian không hợp lệ";
    }
  };

  const viewRecordDetail = (record) => {
    setSelectedRecord(record);
    setModalVisible(true);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "green";
      case "in progress":
        return "blue";
      case "pending":
        return "orange";
      case "cancelled":
        return "red";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "Hoàn thành";
      case "in progress":
        return "Đang thực hiện";
      case "pending":
        return "Chờ thực hiện";
      case "cancelled":
        return "Đã hủy";
      default:
        return "Không xác định";
    }
  };

  const clinicalColumns = [
    {
      title: "Ngày khám",
      dataIndex: "examinationDate",
      key: "examinationDate",
      render: (date) => formatDate(date),
      sorter: (a, b) =>
        new Date(a.examinationDate) - new Date(b.examinationDate),
    },
    {
      title: "Chẩn đoán",
      dataIndex: "diagnosis",
      key: "diagnosis",
      render: (diagnosis) => diagnosis || "Chưa có",
    },
    {
      title: "Bác sĩ",
      dataIndex: "doctorName",
      key: "doctorName",
      render: (name) => name || "Chưa phân công",
    },
    {
      title: "Trạng thái",
      dataIndex: "isCompleted",
      key: "isCompleted",
      render: (completed) => (
        <Tag color={completed ? "green" : "orange"}>
          {completed ? "Hoàn thành" : "Đang xử lý"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => viewRecordDetail(record)}
          >
            Xem chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  const treatmentColumns = [
    {
      title: "Giai đoạn",
      dataIndex: "phaseName",
      key: "phaseName",
      render: (name) => name || "Giai đoạn điều trị",
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
      render: (date) => formatDate(date),
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "endDate",
      key: "endDate",
      render: (date) => formatDate(date) || "Chưa kết thúc",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: "Ghi chú",
      dataIndex: "notes",
      key: "notes",
      render: (notes) => notes || "Không có ghi chú",
    },
  ];

  if (loading) {
    return (
      <div className="patient-page-loading">
        <Spin size="large" />
        <Text>Đang tải hồ sơ y tế...</Text>
      </div>
    );
  }

  if (error) {
    return (
      <div className="patient-page-error">
        <Alert
          message="Lỗi tải dữ liệu"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" danger onClick={loadMedicalRecords}>
              Thử lại
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="patient-medical-records">
      {/* Header */}
      <div className="page-header">
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2}>Hồ sơ y tế</Title>
            <Text type="secondary">Xem và quản lý hồ sơ y tế của bạn</Text>
          </Col>
          <Col>
            <Button
              icon={<ReloadOutlined />}
              onClick={refreshData}
              loading={refreshing}
            >
              Làm mới
            </Button>
          </Col>
        </Row>
      </div>

      {/* Statistics */}
      <Row gutter={[24, 24]} className="mt-24">
        <Col xs={24} md={6}>
          <Card>
            <Statistic
              title="Tổng kết quả khám"
              value={clinicalResults.length}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic
              title="Kết quả hoàn thành"
              value={clinicalResults.filter((r) => r.isCompleted).length}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic
              title="Giai đoạn điều trị"
              value={treatmentHistory.length}
              prefix={<MedicineBoxOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic
              title="Giai đoạn hoàn thành"
              value={
                treatmentHistory.filter((t) => t.status === "Completed").length
              }
              prefix={<HeartOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Row gutter={[24, 24]} className="mt-24">
        <Col span={24}>
          <Card className="records-card">
            <Tabs defaultActiveKey="clinical">
              <TabPane
                tab={
                  <span>
                    <FileTextOutlined />
                    Kết quả khám lâm sàng
                    <Badge
                      count={clinicalResults.length}
                      style={{ marginLeft: 8 }}
                    />
                  </span>
                }
                key="clinical"
              >
                {clinicalResults.length > 0 ? (
                  <Table
                    columns={clinicalColumns}
                    dataSource={clinicalResults}
                    rowKey="resultId"
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) =>
                        `${range[0]}-${range[1]} của ${total} kết quả`,
                    }}
                  />
                ) : (
                  <Empty
                    description="Chưa có kết quả khám lâm sàng"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                )}
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <MedicineBoxOutlined />
                    Lịch sử điều trị
                    <Badge
                      count={treatmentHistory.length}
                      style={{ marginLeft: 8 }}
                    />
                  </span>
                }
                key="treatment"
              >
                {treatmentHistory.length > 0 ? (
                  <Table
                    columns={treatmentColumns}
                    dataSource={treatmentHistory}
                    rowKey={(record, index) => index}
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) =>
                        `${range[0]}-${range[1]} của ${total} giai đoạn`,
                    }}
                  />
                ) : (
                  <Empty
                    description="Chưa có lịch sử điều trị"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                )}
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <HistoryOutlined />
                    Tổng quan
                  </span>
                }
                key="overview"
              >
                <Row gutter={[24, 24]}>
                  <Col xs={24} lg={12}>
                    <Card title="Kết quả khám gần đây" size="small">
                      {clinicalResults.length > 0 ? (
                        <List
                          dataSource={clinicalResults.slice(0, 5)}
                          renderItem={(result) => (
                            <List.Item>
                              <List.Item.Meta
                                avatar={<Avatar icon={<FileTextOutlined />} />}
                                title={
                                  <Space>
                                    <Text strong>
                                      {formatDate(result.examinationDate)}
                                    </Text>
                                    <Tag
                                      color={
                                        result.isCompleted ? "green" : "orange"
                                      }
                                    >
                                      {result.isCompleted
                                        ? "Hoàn thành"
                                        : "Đang xử lý"}
                                    </Tag>
                                  </Space>
                                }
                                description={
                                  <div>
                                    <Text>
                                      Chẩn đoán: {result.diagnosis || "Chưa có"}
                                    </Text>
                                    <br />
                                    <Text type="secondary">
                                      Bác sĩ:{" "}
                                      {result.doctorName || "Chưa phân công"}
                                    </Text>
                                  </div>
                                }
                              />
                            </List.Item>
                          )}
                        />
                      ) : (
                        <Empty
                          description="Chưa có kết quả khám"
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                      )}
                    </Card>
                  </Col>

                  <Col xs={24} lg={12}>
                    <Card title="Giai đoạn điều trị gần đây" size="small">
                      {treatmentHistory.length > 0 ? (
                        <Timeline>
                          {treatmentHistory
                            .slice(0, 5)
                            .map((treatment, index) => (
                              <Timeline.Item
                                key={index}
                                color={getStatusColor(treatment.status)}
                              >
                                <div>
                                  <Text strong>
                                    {treatment.phaseName ||
                                      "Giai đoạn điều trị"}
                                  </Text>
                                  <br />
                                  <Text type="secondary">
                                    {formatDate(treatment.startDate)} -{" "}
                                    {formatDate(treatment.endDate) ||
                                      "Đang thực hiện"}
                                  </Text>
                                  <br />
                                  <Tag color={getStatusColor(treatment.status)}>
                                    {getStatusText(treatment.status)}
                                  </Tag>
                                </div>
                              </Timeline.Item>
                            ))}
                        </Timeline>
                      ) : (
                        <Empty
                          description="Chưa có giai đoạn điều trị"
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                      )}
                    </Card>
                  </Col>
                </Row>
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết kết quả khám"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={800}
      >
        {selectedRecord && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="Ngày khám" span={2}>
              {formatDateTime(selectedRecord.examinationDate)}
            </Descriptions.Item>
            <Descriptions.Item label="Bác sĩ khám">
              {selectedRecord.doctorName || "Chưa phân công"}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={selectedRecord.isCompleted ? "green" : "orange"}>
                {selectedRecord.isCompleted ? "Hoàn thành" : "Đang xử lý"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Chẩn đoán" span={2}>
              {selectedRecord.diagnosis || "Chưa có"}
            </Descriptions.Item>
            <Descriptions.Item label="Triệu chứng" span={2}>
              {selectedRecord.symptoms || "Chưa có"}
            </Descriptions.Item>
            <Descriptions.Item label="Khuyến nghị" span={2}>
              {selectedRecord.recommendations || "Chưa có"}
            </Descriptions.Item>
            {selectedRecord.notes && (
              <Descriptions.Item label="Ghi chú" span={2}>
                {selectedRecord.notes}
              </Descriptions.Item>
            )}
            {selectedRecord.attachedFileUrl && (
              <Descriptions.Item label="File đính kèm" span={2}>
                <Button
                  type="link"
                  icon={<DownloadOutlined />}
                  href={selectedRecord.attachedFileUrl}
                  target="_blank"
                >
                  Tải xuống
                </Button>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default MedicalRecords;
