import React, { useEffect, useState } from "react";
import { Card, Statistic, Row, Col, Spin, message, Button } from "antd";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { getDashboard, getWorkShiftStats } from "../../api/apiManager";

const COLORS = ["#3b82f6", "#ef4444", "#facc15", "#22c55e"];

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [shiftStats, setShiftStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [dashboardRes, shiftRes] = await Promise.all([
          getDashboard(),
          getWorkShiftStats(),
        ]);
        setDashboardData(dashboardRes);
        setShiftStats(shiftRes.data);
      } catch (err) {
        console.error("❌ Lỗi tải dashboard:", err);
        message.error("Không thể tải dữ liệu dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <Spin tip="Đang tải dashboard..." size="large" />;
  }

  if (!dashboardData || !shiftStats) {
    return <p>⚠️ Không có dữ liệu dashboard.</p>;
  }

  // 🥧 Doctors Pie Data
  const doctorPieData = [
    { name: "Active Doctors", value: dashboardData.activeDoctors || 0 },
    {
      name: "Inactive Doctors",
      value:
        (dashboardData.totalDoctors || 0) - (dashboardData.activeDoctors || 0),
    },
  ];

  // 🥧 Shifts Pie Data
  const shiftPieData = [
    { name: "Understaffed", value: shiftStats.understaffedShifts || 0 },
    { name: "Pending", value: shiftStats.pendingShifts || 0 },
    { name: "Active", value: shiftStats.activeShifts || 0 },
    { name: "Completed", value: shiftStats.completedShifts || 0 },
  ];

  return (
    <div>
      {/* 🎯 Statistic cards */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="📅 Today's Appointments"
              value={dashboardData.todayAppointments || 0}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="⭐ Average Rating"
              value={dashboardData.averageRating || 0}
              precision={1}
              suffix="/5"
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="😊 Patient Satisfaction"
              value={dashboardData.patientSatisfaction || 0}
              suffix="%"
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
      </Row>

      {/* 🥧 Pie charts */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        {/* Doctor Pie */}
        <Col span={12}>
          <Card title="🥧 Doctors Overview">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={doctorPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {doctorPieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Shift Pie */}
        <Col span={12}>
          <Card
            title="📊 Work Shift Overview"
            extra={
              <Button
                type="primary"
                onClick={() => navigate("/manager/shift-management")}
              >
                ➕ Phân việc
              </Button>
            }
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={shiftPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {shiftPieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* 📈 Line chart */}
      <Row gutter={16}>
        <Col span={24}>
          <Card title="📈 Monthly Performance">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={dashboardData.performanceData}
                margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="patients"
                  stroke="#3b82f6"
                  name="Patients"
                />
                <Line
                  type="monotone"
                  dataKey="appointments"
                  stroke="#f97316"
                  name="Appointments"
                />
                <Line
                  type="monotone"
                  dataKey="success"
                  stroke="#22c55e"
                  name="Success"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
