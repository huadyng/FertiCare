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
  Timeline,
  Progress,
  Divider,
  Select,
  DatePicker,
} from "antd";
import {
  UserOutlined,
  FileTextOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  ReloadOutlined,
  MedicineBoxOutlined,
  HeartOutlined,
  HistoryOutlined,
  FilterOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { UserContext } from "../../../context/UserContext";
import apiTreatmentManagement from "../../../api/apiTreatmentManagement";
import axiosClient from "../../../services/axiosClient";
import "./PatientPages.css";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const History = () => {
  const { user } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [treatmentHistory, setTreatmentHistory] = useState([]);
  const [clinicalResults, setClinicalResults] = useState([]);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [filterDateRange, setFilterDateRange] = useState(null);

  useEffect(() => {
    if (user?.id) {
      loadHistoryData();
    }
  }, [user]);

  const loadHistoryData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(
        "🏥 [PatientHistory] Loading history data for patient:",
        user.id
      );

      // Load all history data in parallel
      const [appointmentsResponse, treatmentResponse, clinicalResponse] =
        await Promise.allSettled([
          axiosClient.get(`/api/appointments/customer/${user.id}`),
          apiTreatmentManagement.getPatientTreatmentHistory(user.id),
          apiTreatmentManagement.getPatientClinicalResults(user.id),
        ]);

      // Process appointments
      const appointmentsData =
        appointmentsResponse.status === "fulfilled"
          ? appointmentsResponse.value.data || []
          : [];

      // Process treatment history
      const treatmentData =
        treatmentResponse.status === "fulfilled" &&
        treatmentResponse.value?.success
          ? treatmentResponse.value.data || []
          : [];

      // Process clinical results
      const clinicalData =
        clinicalResponse.status === "fulfilled" &&
        clinicalResponse.value?.success
          ? clinicalResponse.value.data || []
          : [];

      setAppointments(appointmentsData);
      setTreatmentHistory(treatmentData);
      setClinicalResults(clinicalData);

      console.log("✅ [PatientHistory] History data loaded:", {
        appointments: appointmentsData.length,
        treatmentHistory: treatmentData.length,
        clinicalResults: clinicalData.length,
      });
    } catch (error) {
      console.error("❌ [PatientHistory] Error loading history data:", error);
      setError("Không thể tải lịch sử khám. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadHistoryData();
    setRefreshing(false);
    message.success("Đã cập nhật lịch sử khám");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa có thông tin";
    try {
      return dayjs(dateString).format("DD/MM/YYYY");
    } catch (error) {
      return "Ngày không hợp lệ";
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "Chưa có thông tin";
    try {
      return dayjs(dateTimeString).format("DD/MM/YYYY HH:mm");
    } catch (error) {
      return "Thời gian không hợp lệ";
    }
  };

  const viewItemDetail = (item, type) => {
    setSelectedItem({ ...item, type });
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
      case "checkedin":
        return "cyan";
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
      case "checkedin":
        return "Đã check-in";
      default:
        return "Không xác định";
    }
  };

  const getAppointmentStatus = (appointment) => {
    const now = dayjs();
    const appointmentTime = dayjs(appointment.appointmentTime);

    if (appointment.checkInStatus === "Completed") {
      return { status: "completed", text: "Đã hoàn thành", color: "green" };
    }

    if (appointment.checkInStatus === "Cancelled") {
      return { status: "cancelled", text: "Đã hủy", color: "red" };
    }

    if (appointmentTime.isBefore(now)) {
      return { status: "missed", text: "Đã bỏ lỡ", color: "red" };
    }

    if (appointment.checkInStatus === "CheckedIn") {
      return { status: "checked-in", text: "Đã check-in", color: "blue" };
    }

    return { status: "upcoming", text: "Sắp tới", color: "orange" };
  };

  const filterData = () => {
    let filteredData = [];

    // Combine all data
    const allData = [
      ...appointments.map((item) => ({ ...item, dataType: "appointment" })),
      ...treatmentHistory.map((item) => ({ ...item, dataType: "treatment" })),
      ...clinicalResults.map((item) => ({ ...item, dataType: "clinical" })),
    ];

    // Filter by type
    if (filterType !== "all") {
      filteredData = allData.filter((item) => item.dataType === filterType);
    } else {
      filteredData = allData;
    }

    // Filter by date range
    if (filterDateRange && filterDateRange.length === 2) {
      const startDate = filterDateRange[0];
      const endDate = filterDateRange[1];

      filteredData = filteredData.filter((item) => {
        let itemDate;
        if (item.dataType === "appointment") {
          itemDate = dayjs(item.appointmentTime);
        } else if (item.dataType === "treatment") {
          itemDate = dayjs(item.startDate);
        } else if (item.dataType === "clinical") {
          itemDate = dayjs(item.examinationDate);
        }

        return itemDate && itemDate.isBetween(startDate, endDate, "day", "[]");
      });
    }

    // Sort by date (newest first)
    return filteredData.sort((a, b) => {
      let dateA, dateB;

      if (a.dataType === "appointment") {
        dateA = dayjs(a.appointmentTime);
      } else if (a.dataType === "treatment") {
        dateA = dayjs(a.startDate);
      } else if (a.dataType === "clinical") {
        dateA = dayjs(a.examinationDate);
      }

      if (b.dataType === "appointment") {
        dateB = dayjs(b.appointmentTime);
      } else if (b.dataType === "treatment") {
        dateB = dayjs(b.startDate);
      } else if (b.dataType === "clinical") {
        dateB = dayjs(b.examinationDate);
      }

      return dateB.diff(dateA);
    });
  };

  const getItemIcon = (dataType) => {
    switch (dataType) {
      case "appointment":
        return <CalendarOutlined />;
      case "treatment":
        return <MedicineBoxOutlined />;
      case "clinical":
        return <FileTextOutlined />;
      default:
        return <HistoryOutlined />;
    }
  };

  const getItemTitle = (item) => {
    switch (item.dataType) {
      case "appointment":
        return `Lịch khám - ${formatDateTime(item.appointmentTime)}`;
      case "treatment":
        return `Giai đoạn điều trị - ${item.phaseName || "Không tên"}`;
      case "clinical":
        return `Kết quả khám - ${formatDate(item.examinationDate)}`;
      default:
        return "Mục không xác định";
    }
  };

  const getItemDescription = (item) => {
    switch (item.dataType) {
      case "appointment":
        const status = getAppointmentStatus(item);
        return `Phòng: ${item.room || "Chưa phân công"} | ${status.text}`;
      case "treatment":
        return `${formatDate(item.startDate)} - ${
          formatDate(item.endDate) || "Đang thực hiện"
        }`;
      case "clinical":
        return `Chẩn đoán: ${item.diagnosis || "Chưa có"}`;
      default:
        return "";
    }
  };

  const filteredData = filterData();

  if (loading) {
    return (
      <div className="patient-page-loading">
        <Spin size="large" />
        <Text>Đang tải lịch sử khám...</Text>
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
            <Button size="small" danger onClick={loadHistoryData}>
              Thử lại
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="patient-history">
      {/* Header */}
      <div className="page-header">
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2}>Lịch sử khám</Title>
            <Text type="secondary">
              Xem lại toàn bộ lịch sử khám và điều trị
            </Text>
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
              title="Tổng lịch khám"
              value={appointments.length}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic
              title="Lịch khám hoàn thành"
              value={
                appointments.filter(
                  (a) => getAppointmentStatus(a).status === "completed"
                ).length
              }
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
              title="Kết quả khám"
              value={clinicalResults.length}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Row gutter={[24, 24]} className="mt-24">
        <Col span={24}>
          <Card title="Bộ lọc" size="small">
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} md={8}>
                <Text strong>Loại dữ liệu:</Text>
                <Select
                  value={filterType}
                  onChange={setFilterType}
                  style={{ width: "100%", marginTop: 8 }}
                >
                  <Option value="all">Tất cả</Option>
                  <Option value="appointment">Lịch khám</Option>
                  <Option value="treatment">Điều trị</Option>
                  <Option value="clinical">Kết quả khám</Option>
                </Select>
              </Col>
              <Col xs={24} md={8}>
                <Text strong>Khoảng thời gian:</Text>
                <DatePicker.RangePicker
                  value={filterDateRange}
                  onChange={setFilterDateRange}
                  style={{ width: "100%", marginTop: 8 }}
                  placeholder={["Từ ngày", "Đến ngày"]}
                />
              </Col>
              <Col xs={24} md={8}>
                <Button
                  icon={<FilterOutlined />}
                  onClick={() => {
                    setFilterType("all");
                    setFilterDateRange(null);
                  }}
                  style={{ marginTop: 24 }}
                >
                  Xóa bộ lọc
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Timeline View */}
      <Row gutter={[24, 24]} className="mt-24">
        <Col span={24}>
          <Card
            title="Lịch sử theo thời gian"
            className="timeline-card"
            extra={
              <Badge count={filteredData.length} showZero>
                <HistoryOutlined />
              </Badge>
            }
          >
            {filteredData.length > 0 ? (
              <Timeline>
                {filteredData.map((item, index) => (
                  <Timeline.Item
                    key={index}
                    dot={getItemIcon(item.dataType)}
                    color={
                      item.dataType === "appointment"
                        ? getAppointmentStatus(item).color
                        : getStatusColor(item.status)
                    }
                  >
                    <div className="timeline-item">
                      <div className="timeline-header">
                        <Space>
                          <Text strong>{getItemTitle(item)}</Text>
                          <Tag
                            color={
                              item.dataType === "appointment"
                                ? getAppointmentStatus(item).color
                                : getStatusColor(item.status)
                            }
                          >
                            {item.dataType === "appointment"
                              ? getAppointmentStatus(item).text
                              : getStatusText(item.status)}
                          </Tag>
                        </Space>
                      </div>
                      <div className="timeline-description">
                        <Text type="secondary">{getItemDescription(item)}</Text>
                      </div>
                      <div className="timeline-actions">
                        <Button
                          type="primary"
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={() => viewItemDetail(item, item.dataType)}
                        >
                          Xem chi tiết
                        </Button>
                      </div>
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            ) : (
              <Empty
                description="Không có dữ liệu lịch sử"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* List View */}
      <Row gutter={[24, 24]} className="mt-24">
        <Col span={24}>
          <Card
            title="Danh sách chi tiết"
            className="list-card"
            extra={
              <Badge count={filteredData.length} showZero>
                <FileTextOutlined />
              </Badge>
            }
          >
            {filteredData.length > 0 ? (
              <List
                dataSource={filteredData}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Button
                        type="primary"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => viewItemDetail(item, item.dataType)}
                      >
                        Xem chi tiết
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar icon={getItemIcon(item.dataType)} />}
                      title={
                        <Space>
                          <Text strong>{getItemTitle(item)}</Text>
                          <Tag
                            color={
                              item.dataType === "appointment"
                                ? getAppointmentStatus(item).color
                                : getStatusColor(item.status)
                            }
                          >
                            {item.dataType === "appointment"
                              ? getAppointmentStatus(item).text
                              : getStatusText(item.status)}
                          </Tag>
                        </Space>
                      }
                      description={getItemDescription(item)}
                    />
                  </List.Item>
                )}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} của ${total} mục`,
                }}
              />
            ) : (
              <Empty
                description="Không có dữ liệu lịch sử"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết lịch sử"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={800}
      >
        {selectedItem && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="Loại" span={2}>
              <Tag color="blue">
                {selectedItem.type === "appointment" && "Lịch khám"}
                {selectedItem.type === "treatment" && "Giai đoạn điều trị"}
                {selectedItem.type === "clinical" && "Kết quả khám"}
              </Tag>
            </Descriptions.Item>

            {selectedItem.type === "appointment" && (
              <>
                <Descriptions.Item label="Thời gian" span={2}>
                  {formatDateTime(selectedItem.appointmentTime)}
                </Descriptions.Item>
                <Descriptions.Item label="Phòng">
                  {selectedItem.room || "Chưa phân công"}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag color={getAppointmentStatus(selectedItem).color}>
                    {getAppointmentStatus(selectedItem).text}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Dịch vụ" span={2}>
                  {selectedItem.serviceName || "Khám tổng quát"}
                </Descriptions.Item>
                {selectedItem.note && (
                  <Descriptions.Item label="Ghi chú" span={2}>
                    {selectedItem.note}
                  </Descriptions.Item>
                )}
              </>
            )}

            {selectedItem.type === "treatment" && (
              <>
                <Descriptions.Item label="Giai đoạn" span={2}>
                  {selectedItem.phaseName || "Không tên"}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày bắt đầu">
                  {formatDate(selectedItem.startDate)}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày kết thúc">
                  {formatDate(selectedItem.endDate) || "Chưa kết thúc"}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag color={getStatusColor(selectedItem.status)}>
                    {getStatusText(selectedItem.status)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Mô tả" span={2}>
                  {selectedItem.description || "Không có mô tả"}
                </Descriptions.Item>
                {selectedItem.notes && (
                  <Descriptions.Item label="Ghi chú" span={2}>
                    {selectedItem.notes}
                  </Descriptions.Item>
                )}
              </>
            )}

            {selectedItem.type === "clinical" && (
              <>
                <Descriptions.Item label="Ngày khám" span={2}>
                  {formatDateTime(selectedItem.examinationDate)}
                </Descriptions.Item>
                <Descriptions.Item label="Bác sĩ">
                  {selectedItem.doctorName || "Chưa phân công"}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag color={selectedItem.isCompleted ? "green" : "orange"}>
                    {selectedItem.isCompleted ? "Hoàn thành" : "Đang xử lý"}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Chẩn đoán" span={2}>
                  {selectedItem.diagnosis || "Chưa có"}
                </Descriptions.Item>
                <Descriptions.Item label="Triệu chứng" span={2}>
                  {selectedItem.symptoms || "Chưa có"}
                </Descriptions.Item>
                <Descriptions.Item label="Khuyến nghị" span={2}>
                  {selectedItem.recommendations || "Chưa có"}
                </Descriptions.Item>
                {selectedItem.notes && (
                  <Descriptions.Item label="Ghi chú" span={2}>
                    {selectedItem.notes}
                  </Descriptions.Item>
                )}
              </>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default History;
