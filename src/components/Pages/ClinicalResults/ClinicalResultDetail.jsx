import React, { useEffect, useState } from "react";
import {
  Modal,
  Descriptions,
  Card,
  Tag,
  Typography,
  Spin,
  Alert,
  Space,
  Button,
} from "antd";
import {
  CloseOutlined,
  CalendarOutlined,
  UserOutlined,
  HeartOutlined,
  FireOutlined,
  DashboardOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
  ExperimentOutlined,
  MedicineBoxOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import clinicalResultsAPI from "../../../api/apiClinicalResults";

const { Title, Text } = Typography;

const ClinicalResultDetail = ({ resultId, onClose }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!resultId) return;
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log(
          "[ClinicalResultDetail] Gọi API lấy chi tiết kết quả với id:",
          resultId
        );
        const data = await clinicalResultsAPI.getClinicalResultById(resultId);
        console.log("[ClinicalResultDetail] Dữ liệu trả về:", data);
        setDetail(data);
      } catch (err) {
        console.error(
          "[ClinicalResultDetail] Lỗi khi lấy chi tiết kết quả:",
          err
        );
        setError("Lỗi khi lấy chi tiết kết quả khám lâm sàng.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [resultId]);

  if (!resultId) return null;

  return (
    <Modal
      title={
        <Title level={3} style={{ color: "#ff6b9d", margin: 0 }}>
          Chi tiết kết quả khám lâm sàng
        </Title>
      }
      open={true}
      onCancel={onClose}
      footer={null}
      width="90vw"
      style={{ top: 20 }}
      styles={{
        body: {
          padding: "24px",
          maxHeight: "80vh",
          overflowY: "auto",
        },
      }}
    >
      {loading && (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Spin size="large" />
          <div style={{ marginTop: "16px", color: "#666" }}>
            Đang tải chi tiết kết quả...
          </div>
        </div>
      )}

      {error && (
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: "16px" }}
        />
      )}

      {!loading && !error && detail && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
            gap: "16px",
          }}
        >
          {/* Thông tin cơ bản */}
          <Card title="Thông tin cơ bản" size="small">
            <Descriptions column={1}>
              <Descriptions.Item
                label={
                  <Space>
                    <CalendarOutlined style={{ color: "#ff6b9d" }} />
                    <Text strong>Ngày khám</Text>
                  </Space>
                }
              >
                {detail.examinationDate
                  ? new Date(detail.examinationDate).toLocaleString("vi-VN")
                  : "-"}
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <Space>
                    <FileTextOutlined style={{ color: "#ff6b9d" }} />
                    <Text strong>Chẩn đoán</Text>
                  </Space>
                }
              >
                {detail.diagnosis || "-"}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <Space>
                    {detail.isCompleted ? (
                      <CheckCircleOutlined style={{ color: "#52c41a" }} />
                    ) : (
                      <ClockCircleOutlined style={{ color: "#1890ff" }} />
                    )}
                    <Text strong>Trạng thái</Text>
                  </Space>
                }
              >
                <Tag color={detail.isCompleted ? "success" : "processing"}>
                  {detail.isCompleted ? "Hoàn thành" : "Đang xử lý"}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Triệu chứng */}
          <Card title="Triệu chứng" size="small">
            <Descriptions column={1}>
              <Descriptions.Item label="Triệu chứng">
                {detail.symptoms?.join(", ") || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Chi tiết triệu chứng">
                {detail.symptomsDetail || "-"}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Dấu hiệu sinh tồn */}
          <Card title="Dấu hiệu sinh tồn" size="small">
            <Descriptions column={2}>
              <Descriptions.Item
                label={
                  <Space>
                    <HeartOutlined style={{ color: "#ff6b9d" }} />
                    <Text strong>Huyết áp</Text>
                  </Space>
                }
              >
                {detail.bloodPressureSystolic && detail.bloodPressureDiastolic
                  ? `${detail.bloodPressureSystolic}/${detail.bloodPressureDiastolic} mmHg`
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <Space>
                    <FireOutlined style={{ color: "#ff6b9d" }} />
                    <Text strong>Nhiệt độ</Text>
                  </Space>
                }
              >
                {detail.temperature ? `${detail.temperature} °C` : "-"}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <Space>
                    <HeartOutlined style={{ color: "#ff6b9d" }} />
                    <Text strong>Nhịp tim</Text>
                  </Space>
                }
              >
                {detail.heartRate ? `${detail.heartRate} bpm` : "-"}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <Space>
                    <DashboardOutlined style={{ color: "#ff6b9d" }} />
                    <Text strong>Cân nặng</Text>
                  </Space>
                }
              >
                {detail.weight ? `${detail.weight} kg` : "-"}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <Space>
                    <DashboardOutlined style={{ color: "#ff6b9d" }} />
                    <Text strong>Chiều cao</Text>
                  </Space>
                }
              >
                {detail.height ? `${detail.height} cm` : "-"}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <Space>
                    <DashboardOutlined style={{ color: "#ff6b9d" }} />
                    <Text strong>BMI</Text>
                  </Space>
                }
              >
                {detail.bmi || "-"}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Kết quả xét nghiệm máu */}
          <Card title="Kết quả xét nghiệm máu" size="small">
            <Descriptions column={2}>
              <Descriptions.Item label="Loại máu">
                {detail.bloodType || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Hemoglobin">
                {detail.hemoglobin ? `${detail.hemoglobin} g/dL` : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Bạch cầu">
                {detail.whiteBloodCell ? `${detail.whiteBloodCell} /μL` : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Tiểu cầu">
                {detail.plateletCount ? `${detail.plateletCount} /μL` : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Glucose">
                {detail.glucose ? `${detail.glucose} mg/dL` : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Creatinine">
                {detail.creatinine ? `${detail.creatinine} mg/dL` : "-"}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Xét nghiệm nội tiết */}
          <Card
            title={
              <Space>
                <ExperimentOutlined style={{ color: "#ff6b9d" }} />
                <Text strong>Xét nghiệm nội tiết</Text>
              </Space>
            }
            size="small"
          >
            <Descriptions column={2}>
              <Descriptions.Item label="FSH">
                {detail.fshLevel ? `${detail.fshLevel} mIU/mL` : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="LH">
                {detail.lhLevel ? `${detail.lhLevel} mIU/mL` : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Estradiol">
                {detail.estradiolLevel ? `${detail.estradiolLevel} pg/mL` : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Testosterone">
                {detail.testosteroneLevel
                  ? `${detail.testosteroneLevel} ng/mL`
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="AMH">
                {detail.amhLevel ? `${detail.amhLevel} ng/mL` : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Prolactin">
                {detail.prolactinLevel ? `${detail.prolactinLevel} ng/mL` : "-"}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Kết quả siêu âm */}
          <Card title="Kết quả siêu âm" size="small">
            <Descriptions column={1}>
              <Descriptions.Item label="Kết quả siêu âm">
                {detail.ultrasoundFindings || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Kích thước buồng trứng trái">
                {detail.ovarySizeLeft ? `${detail.ovarySizeLeft} cm` : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Kích thước buồng trứng phải">
                {detail.ovarySizeRight ? `${detail.ovarySizeRight} cm` : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Số nang trứng trái">
                {detail.follicleCountLeft || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Số nang trứng phải">
                {detail.follicleCountRight || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Độ dày niêm mạc tử cung">
                {detail.endometrialThickness
                  ? `${detail.endometrialThickness} mm`
                  : "-"}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Chẩn đoán và đánh giá */}
          <Card
            title={
              <Space>
                <MedicineBoxOutlined style={{ color: "#ff6b9d" }} />
                <Text strong>Chẩn đoán và đánh giá</Text>
              </Space>
            }
            size="small"
          >
            <Descriptions column={1}>
              <Descriptions.Item label="Mã chẩn đoán">
                {detail.diagnosisCode || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Mức độ nghiêm trọng">
                {detail.severityLevel || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian vô sinh (tháng)">
                {detail.infertilityDurationMonths
                  ? `${detail.infertilityDurationMonths} tháng`
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Điều trị trước đó">
                {detail.previousTreatments || "-"}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Khuyến nghị và ghi chú */}
          <Card title="Khuyến nghị và ghi chú" size="small">
            <Descriptions column={1}>
              <Descriptions.Item label="Khuyến nghị">
                {detail.recommendations || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Ưu tiên điều trị">
                {detail.treatmentPriority || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Lịch hẹn tiếp theo">
                {detail.nextAppointmentDate
                  ? new Date(detail.nextAppointmentDate).toLocaleString("vi-VN")
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú">
                {detail.notes || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày hoàn thành">
                {detail.completionDate
                  ? new Date(detail.completionDate).toLocaleString("vi-VN")
                  : "-"}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </div>
      )}
    </Modal>
  );
};

export default ClinicalResultDetail;
