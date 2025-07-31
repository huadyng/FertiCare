import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  DatePicker,
  Select,
  Table,
  Button,
  Space,
  Tabs,
  Progress,
  List,
  Avatar,
  Tag,
  Alert,
  Divider,
  Typography,
  Export,
  Tooltip,
  Modal,
  message,
} from "antd";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  DollarOutlined,
  TrophyOutlined,
  FileTextOutlined,
  DownloadOutlined,
  PrinterOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  TableOutlined,
  FilterOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { formatDate, formatCurrency, formatNumber } from "../../utils";

const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

// TODO: Replace with actual API data
const monthlyData = [];
const departmentData = [];
const treatmentSuccessData = [];
const topDoctorsData = [];
const systemMetrics = {};

const SystemReports = () => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(6, "months"),
    dayjs(),
  ]);
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [reportType, setReportType] = useState("overview");
  const [chartType, setChartType] = useState("line");

  const handleExport = (format) => {
    setLoading(true);
    // Simulate export process
    setTimeout(() => {
      setLoading(false);
      message.success(`Xuất báo cáo ${format.toUpperCase()} thành công!`);
    }, 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success("Đã cập nhật dữ liệu!");
    }, 1000);
  };

  // Chart components
  const renderOverviewChart = () => {
    const ChartComponent =
      chartType === "line"
        ? LineChart
        : chartType === "area"
        ? AreaChart
        : BarChart;
    const DataComponent =
      chartType === "line" ? Line : chartType === "area" ? Area : Bar;

    return (
      <ResponsiveContainer width="100%" height={300}>
        <ChartComponent data={monthlyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <RechartsTooltip
            formatter={(value, name) => [
              name === "revenue" ? formatCurrency(value) : formatNumber(value),
              name === "patients"
                ? "Bệnh nhân"
                : name === "revenue"
                ? "Doanh thu"
                : name === "appointments"
                ? "Lịch hẹn"
                : "Điều trị",
            ]}
          />
          <Legend />
          <DataComponent
            type="monotone"
            dataKey="patients"
            stroke="#8884d8"
            fill="#8884d8"
            name="patients"
          />
          <DataComponent
            type="monotone"
            dataKey="appointments"
            stroke="#82ca9d"
            fill="#82ca9d"
            name="appointments"
          />
          <DataComponent
            type="monotone"
            dataKey="treatments"
            stroke="#ffc658"
            fill="#ffc658"
            name="treatments"
          />
        </ChartComponent>
      </ResponsiveContainer>
    );
  };

  const renderDepartmentChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={departmentData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) =>
            `${name} ${(percent * 100).toFixed(0)}%`
          }
          outerRadius={80}
          fill="#8884d8"
          dataKey="patients"
        >
          {departmentData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <RechartsTooltip
          formatter={(value) => [formatNumber(value), "Bệnh nhân"]}
        />
      </PieChart>
    </ResponsiveContainer>
  );

  const renderTreatmentSuccessChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={treatmentSuccessData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="treatment" />
        <YAxis />
        <RechartsTooltip
          formatter={(value, name) => [
            name === "success" ? value : value + "%",
            name === "success" ? "Thành công" : "Tỷ lệ",
          ]}
        />
        <Legend />
        <Bar dataKey="success" fill="#52c41a" name="success" />
        <Bar dataKey="rate" fill="#1890ff" name="rate" />
      </BarChart>
    </ResponsiveContainer>
  );

  const topDoctorsColumns = [
    {
      title: "Bác sĩ",
      key: "doctor",
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 600 }}>{record.name}</div>
            <div style={{ fontSize: 12, color: "#666" }}>
              {record.specialization}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Bệnh nhân",
      dataIndex: "patients",
      key: "patients",
      render: (value) => formatNumber(value),
      sorter: (a, b) => a.patients - b.patients,
    },
    {
      title: "Doanh thu",
      dataIndex: "revenue",
      key: "revenue",
      render: (value) => formatCurrency(value),
      sorter: (a, b) => a.revenue - b.revenue,
    },
    {
      title: "Đánh giá",
      dataIndex: "rating",
      key: "rating",
      render: (value) => (
        <div>
          <Text strong>{value}/5.0</Text>
          <Progress
            percent={value * 20}
            size="small"
            showInfo={false}
            strokeColor="#faad14"
          />
        </div>
      ),
      sorter: (a, b) => a.rating - b.rating,
    },
    {
      title: "Tỷ lệ thành công",
      dataIndex: "successRate",
      key: "successRate",
      render: (value) => (
        <Tag color={value >= 90 ? "green" : value >= 80 ? "orange" : "red"}>
          {value}%
        </Tag>
      ),
      sorter: (a, b) => a.successRate - b.successRate,
    },
  ];

  return (
    <div style={{ padding: "24px", background: "#f5f5f5", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Title level={2} style={{ margin: 0 }}>
            <BarChartOutlined style={{ marginRight: 8 }} />
            Báo cáo hệ thống
          </Title>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={refreshData}
              loading={loading}
            >
              Làm mới
            </Button>
            <Button icon={<PrinterOutlined />} onClick={handlePrint}>
              In báo cáo
            </Button>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={() => handleExport("excel")}
              loading={loading}
            >
              Xuất Excel
            </Button>
          </Space>
        </div>

        {/* Filters */}
        <Card size="small">
          <Row gutter={16} align="middle">
            <Col>
              <Text strong>Bộ lọc:</Text>
            </Col>
            <Col>
              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                format="DD/MM/YYYY"
              />
            </Col>
            <Col>
              <Select
                value={selectedDepartment}
                onChange={setSelectedDepartment}
                style={{ width: 150 }}
              >
                <Option value="all">Tất cả khoa</Option>
                {departmentData.map((dept) => (
                  <Option key={dept.name} value={dept.name}>
                    {dept.name}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col>
              <Select
                value={chartType}
                onChange={setChartType}
                style={{ width: 120 }}
              >
                <Option value="line">
                  <LineChartOutlined /> Đường
                </Option>
                <Option value="area">
                  <BarChartOutlined /> Vùng
                </Option>
                <Option value="bar">
                  <TableOutlined /> Cột
                </Option>
              </Select>
            </Col>
          </Row>
        </Card>
      </div>

      {/* Key Metrics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng bệnh nhân"
              value={systemMetrics.totalPatients}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#1890ff" }}
              suffix={
                <div style={{ fontSize: 12, color: "#52c41a" }}>
                  +{systemMetrics.monthlyGrowth}%
                </div>
              }
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Doanh thu tổng"
              value={systemMetrics.totalRevenue}
              formatter={(value) => formatCurrency(value)}
              prefix={<DollarOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Độ hài lòng"
              value={systemMetrics.patientSatisfaction}
              suffix="%"
              prefix={<TrophyOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Thời gian chờ TB"
              value={systemMetrics.avgWaitTime}
              suffix="phút"
              prefix={<CalendarOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
      </Row>

      {/* System Status */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card title="Trạng thái hệ thống" size="small">
            <Row gutter={16}>
              <Col span={12}>
                <div style={{ marginBottom: 16 }}>
                  <Text>Uptime hệ thống</Text>
                  <Progress
                    percent={systemMetrics.systemUptime}
                    strokeColor="#52c41a"
                    format={(percent) => `${percent}%`}
                  />
                </div>
              </Col>
              <Col span={12}>
                <div style={{ marginBottom: 16 }}>
                  <Text>Sao lưu dữ liệu</Text>
                  <div style={{ marginTop: 8 }}>
                    <Tag
                      color={
                        systemMetrics.dataBackupStatus === "success"
                          ? "green"
                          : "red"
                      }
                    >
                      {systemMetrics.dataBackupStatus === "success"
                        ? "Thành công"
                        : "Thất bại"}
                    </Tag>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Lần cuối: {formatDate(new Date())}
                    </Text>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Hoạt động gần đây" size="small">
            <List
              size="small"
              dataSource={[
                {
                  action: "Sao lưu dữ liệu hoàn tất",
                  time: "5 phút trước",
                  type: "success",
                },
                {
                  action: "Cập nhật hệ thống",
                  time: "2 giờ trước",
                  type: "info",
                },
                {
                  action: "Đăng nhập admin",
                  time: "3 giờ trước",
                  type: "info",
                },
                {
                  action: "Khởi động lại server",
                  time: "1 ngày trước",
                  type: "warning",
                },
              ]}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        size="small"
                        style={{
                          backgroundColor:
                            item.type === "success"
                              ? "#52c41a"
                              : item.type === "warning"
                              ? "#faad14"
                              : "#1890ff",
                        }}
                      />
                    }
                    title={item.action}
                    description={item.time}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Reports */}
      <Tabs defaultActiveKey="overview" onChange={setReportType}>
        <TabPane tab="Tổng quan" key="overview">
          <Row gutter={16}>
            <Col span={16}>
              <Card
                title="Xu hướng theo tháng"
                extra={
                  <Space>
                    <Button
                      size="small"
                      icon={<LineChartOutlined />}
                      onClick={() => setChartType("line")}
                    />
                    <Button
                      size="small"
                      icon={<BarChartOutlined />}
                      onClick={() => setChartType("area")}
                    />
                    <Button
                      size="small"
                      icon={<TableOutlined />}
                      onClick={() => setChartType("bar")}
                    />
                  </Space>
                }
              >
                {renderOverviewChart()}
              </Card>
            </Col>
            <Col span={8}>
              <Card title="Phân bố theo khoa" style={{ marginBottom: 16 }}>
                {renderDepartmentChart()}
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Hiệu suất điều trị" key="treatment">
          <Row gutter={16}>
            <Col span={16}>
              <Card title="Tỷ lệ thành công điều trị">
                {renderTreatmentSuccessChart()}
              </Card>
            </Col>
            <Col span={8}>
              <Card title="Thống kê chi tiết">
                <List
                  dataSource={treatmentSuccessData}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        title={item.treatment}
                        description={
                          <div>
                            <div>
                              {item.success}/{item.total} ca thành công
                            </div>
                            <Progress
                              percent={item.rate}
                              size="small"
                              strokeColor={
                                item.rate >= 80
                                  ? "#52c41a"
                                  : item.rate >= 60
                                  ? "#faad14"
                                  : "#ff4d4f"
                              }
                            />
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Hiệu suất bác sĩ" key="doctors">
          <Card title="Top bác sĩ hiệu suất cao">
            <Table
              columns={topDoctorsColumns}
              dataSource={topDoctorsData}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </TabPane>

        <TabPane tab="Báo cáo tài chính" key="financial">
          <Row gutter={16}>
            <Col span={12}>
              <Card title="Doanh thu theo khoa">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={departmentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip
                      formatter={(value) => [
                        formatCurrency(value),
                        "Doanh thu",
                      ]}
                    />
                    <Bar dataKey="revenue" fill="#1890ff" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Chi tiết doanh thu">
                <List
                  dataSource={departmentData}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        title={item.name}
                        description={
                          <div>
                            <div style={{ fontWeight: 600, color: "#52c41a" }}>
                              {formatCurrency(item.revenue)}
                            </div>
                            <div style={{ fontSize: 12, color: "#666" }}>
                              {item.patients} bệnh nhân
                            </div>
                          </div>
                        }
                      />
                      <div>
                        <div style={{ textAlign: "right", fontSize: 12 }}>
                          TB:{" "}
                          {formatCurrency(
                            Math.round(item.revenue / item.patients)
                          )}{" "}
                          /BN
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>

      {/* Export Modal would go here */}
    </div>
  );
};

export default SystemReports;
