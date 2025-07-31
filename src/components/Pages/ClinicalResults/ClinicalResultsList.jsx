import React, { useEffect, useState, useContext } from "react";
import {
  Table,
  Card,
  Button,
  Tag,
  Space,
  Typography,
  Spin,
  Alert,
  Empty,
} from "antd";
import {
  EyeOutlined,
  CalendarOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import clinicalResultsAPI from "../../../api/apiClinicalResults";
import { UserContext } from "../../../context/UserContext";

const { Title, Text } = Typography;

const ClinicalResultsList = ({ onSelectResult, selectedResultId }) => {
  const { user } = useContext(UserContext);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Nếu không truyền prop thì tự quản lý state
  const [internalSelectedId, setInternalSelectedId] = useState(null);
  const effectiveSelectedId =
    selectedResultId !== undefined ? selectedResultId : internalSelectedId;
  const handleSelect = (id) => {
    if (onSelectResult) onSelectResult(id);
    else setInternalSelectedId(id);
  };

  const fetchResults = async () => {
    setLoading(true);
    setError(null);
    try {
      // Lấy patientId từ user context
      const patientId = user?.id;
      console.log("[ClinicalResultsList] patientId:", patientId);
      if (!patientId) {
        setError("Không tìm thấy thông tin bệnh nhân. Vui lòng đăng nhập lại.");
        setLoading(false);
        return;
      }
      console.log(
        "[ClinicalResultsList] Bắt đầu gọi API lấy danh sách kết quả khám lâm sàng..."
      );
      const data = await clinicalResultsAPI.getClinicalResultsByPatient(
        patientId
      );
      console.log("[ClinicalResultsList] Dữ liệu trả về từ API:", data);
      setResults(data);
    } catch (err) {
      console.error(
        "[ClinicalResultsList] Lỗi khi lấy danh sách kết quả khám:",
        err
      );
      setError(
        "Lỗi khi lấy danh sách kết quả khám lâm sàng. Vui lòng thử lại sau."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [user]);

  const columns = [
    {
      title: "Ngày khám",
      dataIndex: "examinationDate",
      key: "examinationDate",
      render: (date) => (
        <Space>
          <CalendarOutlined style={{ color: "#ff6b9d" }} />
          <Text>{date ? new Date(date).toLocaleDateString("vi-VN") : "-"}</Text>
        </Space>
      ),
      sorter: (a, b) =>
        new Date(a.examinationDate) - new Date(b.examinationDate),
    },

    {
      title: "Chẩn đoán",
      dataIndex: "diagnosis",
      key: "diagnosis",
      render: (diagnosis) => (
        <Text style={{ color: "#475569" }}>{diagnosis || "-"}</Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={status === "completed" ? "success" : "processing"}
          icon={
            status === "completed" ? (
              <CheckCircleOutlined />
            ) : (
              <ClockCircleOutlined />
            )
          }
        >
          {status === "completed" ? "Hoàn thành" : "Đang xử lý"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => {
            console.log(
              "[ClinicalResultsList] Xem chi tiết kết quả:",
              record.id
            );
            handleSelect(record.id);
          }}
          style={{
            background:
              "linear-gradient(135deg, #ff7eb3 0%, #ff758c 50%, #ff6b9d 100%)",
            border: "none",
            borderRadius: "8px",
          }}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
        <div style={{ marginTop: "16px", color: "#666" }}>
          Đang tải danh sách kết quả khám lâm sàng...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Lỗi"
        description={error}
        type="error"
        showIcon
        style={{ margin: "16px" }}
      />
    );
  }

  if (!results.length) {
    return (
      <Empty
        description="Chưa có kết quả khám lâm sàng nào"
        style={{ margin: "50px 0" }}
      />
    );
  }

  return (
    <Card
      style={{
        borderRadius: "16px",
        boxShadow: "0 8px 32px rgba(255, 107, 157, 0.1)",
        border: "1px solid rgba(255, 107, 157, 0.1)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <Title
          level={2}
          style={{
            color: "#ff6b9d",
            margin: 0,
          }}
        >
          Kết quả khám lâm sàng của bạn
        </Title>
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={() => {
            console.log("[ClinicalResultsList] Làm mới danh sách kết quả...");
            fetchResults();
          }}
          loading={loading}
          style={{
            background:
              "linear-gradient(135deg, #ff7eb3 0%, #ff758c 50%, #ff6b9d 100%)",
            border: "none",
            borderRadius: "8px",
          }}
        >
          Làm mới
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={results}
        rowKey="id"
        pagination={false}
        style={{
          borderRadius: "12px",
          overflow: "hidden",
        }}
      />
    </Card>
  );
};

export default ClinicalResultsList;
