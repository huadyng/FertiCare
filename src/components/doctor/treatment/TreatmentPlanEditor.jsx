import React, { useState, useEffect, useContext } from "react";
import {
  Card,
  Form,
  Input,
  InputNumber,
  Button,
  Row,
  Col,
  Typography,
  Space,
  message,
  Select,
} from "antd";
import {
  EditOutlined,
  SaveOutlined,
  PlusOutlined,
  MedicineBoxOutlined,
  SettingOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
  OrderedListOutlined,
  DeleteOutlined,
  WarningOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { treatmentPlanAPI } from "../../../api/treatmentPlanAPI";
import { UserContext } from "../../../context/UserContext";

import './TreatmentPlanEditor.css';

const { Title, Text } = Typography;

const TreatmentPlanEditor = ({ patientId, examinationData }) => {
  const [existingPlan, setExistingPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form] = Form.useForm();
  const [initialValues, setInitialValues] = useState({});
  const { user } = useContext(UserContext);

  // Kiểm tra xem có patientId hợp lệ không
  if (!patientId) {
    return (
      <div style={{ padding: '20px' }}>
        <Card className="examination-main-card">
          <div className="examination-header">
            <Title level={2} className="examination-title">
              <Space>
                <MedicineBoxOutlined className="title-icon" />
                Lập phác đồ
              </Space>
            </Title>
          </div>
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            borderRadius: '12px',
            margin: '20px 0'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px', opacity: 0.6 }}>
              📋
            </div>
            <Title level={3} style={{ color: '#666', marginBottom: '16px' }}>
              Không có phác đồ điều trị
            </Title>
            <Text style={{ fontSize: '16px', color: '#888', display: 'block', marginBottom: '24px' }}>
              Vui lòng chọn bệnh nhân để lập phác đồ điều trị
            </Text>
            <Button
              type="primary"
              size="large"
              icon={<UserOutlined />}
              style={{
                background: 'linear-gradient(135deg, #ff6b9d 0%, #ff758c 100%)',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                height: 'auto'
              }}
            >
              Chọn bệnh nhân
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    const loadPlan = async () => {
      if (!patientId) return;
      
      // 🔍 Debug token status before API call
      const user = localStorage.getItem("user");
      const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
      console.log("🔍 [TreatmentPlanEditor] Token check before API call:");
      console.log("  - User exists:", !!user);
      console.log("  - Token exists:", !!token);
      

      
      // 🔍 Double-check token after refresh
      const tokenAfterRefresh = localStorage.getItem("token") || localStorage.getItem("accessToken");
      console.log("🔍 [TreatmentPlanEditor] Token after refresh:", !!tokenAfterRefresh);
      
      if (!tokenAfterRefresh) {
        console.error("❌ [TreatmentPlanEditor] No token available after refresh!");
        // Try to get from user context
        const user = localStorage.getItem("user");
        if (user) {
          try {
            const userData = JSON.parse(user);
            if (userData.token) {
              localStorage.setItem("token", userData.token);
              localStorage.setItem("accessToken", userData.token);
              console.log("🔄 [TreatmentPlanEditor] Token restored from user data");
            }
          } catch (e) {
            console.error("❌ [TreatmentPlanEditor] Error parsing user data:", e);
          }
        }
      }
      
      setLoading(true);
      try {
        // GET: Lấy phác đồ active của bệnh nhân
        const res = await treatmentPlanAPI.getActiveTreatmentPlan(patientId);
        if (res.success) {
          setExistingPlan(res.data);
          console.log("✅ [TreatmentPlanEditor] Loaded active treatment plan:", res.data);
        } else {
          console.log("ℹ️ [TreatmentPlanEditor] No active treatment plan found");
          setExistingPlan(null);
        }
      } catch (error) {
        console.error("❌ [TreatmentPlanEditor] Error loading treatment plan:", error);
        setExistingPlan(null);
      }
      setLoading(false);
    };
    loadPlan();
  }, [patientId]);

  useEffect(() => {
    if (existingPlan) {
      // Set initial values cho form
      setInitialValues(existingPlan);
      form.setFieldsValue(existingPlan);
    }
  }, [existingPlan, form]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      console.log("🔍 [TreatmentPlanEditor] handleSubmit called with values:", values);
      console.log("🔍 [TreatmentPlanEditor] examinationData:", examinationData);
      console.log("🔍 [TreatmentPlanEditor] existingPlan:", existingPlan);
      console.log("🔍 [TreatmentPlanEditor] editing:", editing);
      
      let res;
      if (editing && existingPlan) {
        // PUT: Cập nhật phác đồ hiện có
        const planId = existingPlan?.planId;
        if (!planId) {
          console.error("❌ [TreatmentPlanEditor] No planId found in existingPlan");
          message.error("Không thể cập nhật: Thiếu ID phác đồ");
          setLoading(false);
          return;
        }
        
        // Gửi đầy đủ data đã chỉnh sửa (loại bỏ các field không cần thiết)
        const { 
          planId: existingPlanId, 
          doctorId, 
          status, 
          startDate, 
          endDate, 
          currentPhase,
          // BaseEntity fields
          createdBy,
          updatedBy,
          createdDate,
          updatedDate,
          ...updateableFields 
        } = initialValues;
        const updatePayload = {
          ...updateableFields, // Chỉ giữ các field có thể update
          ...values, // Override với data mới từ form
          // Thêm lại các field bắt buộc cho BE
          patientId: initialValues.patientId,
          treatmentType: values.treatmentType || initialValues.treatmentType,
          templateId: initialValues.templateId, // Giữ lại templateId vì database yêu cầu
          status: initialValues.status || "active", // Đảm bảo status không null
          startDate: initialValues.startDate || new Date().toISOString(), // Đảm bảo startDate không null
          endDate: initialValues.endDate || (initialValues.startDate ? 
            new Date(new Date(initialValues.startDate).getTime() + (values.estimatedDurationDays || 30) * 24 * 60 * 60 * 1000).toISOString() 
            : new Date().toISOString()), // Tính endDate từ startDate + duration
        };
        
        console.log("🔄 [TreatmentPlanEditor] Updating existing plan with ID:", planId);
        console.log("🔄 [TreatmentPlanEditor] Update payload:", updatePayload);
        
        res = await treatmentPlanAPI.updateTreatmentPlan(planId, updatePayload);
      } else {
        // Create new plan - chỉ cần planName và planDescription
        if (!examinationData || !examinationData.id) {
          console.error("❌ [TreatmentPlanEditor] No examinationData.id available for creating new plan");
          message.error("Không thể tạo phác đồ mới: Thiếu dữ liệu khám lâm sàng");
          setLoading(false);
          return;
        }
        
        // Tự động detect treatmentType - ưu tiên specialty của bác sĩ
        let treatmentType = "IUI"; // Default fallback
        
        // Ưu tiên 1: Specialty của bác sĩ (quan trọng nhất)
        if (user?.specialty) {
          treatmentType = user.specialty === "IUI" ? "IUI" : "IVF";
        }
        // Ưu tiên 2: examinationData.resultType (chỉ khi khớp với specialty)
        else if (examinationData?.resultType && examinationData.resultType !== "Other") {
          treatmentType = examinationData.resultType === "IUI" ? "IUI" : "IVF";
        }
        
        console.log("🔍 [TreatmentPlanEditor] Auto-detected treatmentType:", treatmentType);
        console.log("🔍 [TreatmentPlanEditor] Based on examinationData.resultType:", examinationData?.resultType);
        console.log("🔍 [TreatmentPlanEditor] Based on user.specialty:", user?.specialty);
        
        const createPayload = {
          planName: values.planName,
          planDescription: values.planDescription,
          patientId: examinationData.patientId,
          treatmentType: treatmentType, // Tự động detect theo examinationData hoặc user specialty
        };
        
        console.log("🔄 [TreatmentPlanEditor] Creating new plan with payload:", createPayload);
        res = await treatmentPlanAPI.createTreatmentPlanFromClinicalResult(examinationData.id, createPayload);
      }
      
      if (res.success) {
        setExistingPlan(res.data);
        setEditing(false);
        message.success("Phác đồ điều trị đã được lưu thành công!");
        console.log("✅ [TreatmentPlanEditor] Plan saved successfully:", res.data);
      } else {
        message.error(res.message || "Có lỗi xảy ra khi lưu phác đồ điều trị");
        console.error("❌ [TreatmentPlanEditor] Failed to save plan:", res);
      }
    } catch (e) {
      console.error("❌ [TreatmentPlanEditor] Error in handleSubmit:", e);
      message.error("Có lỗi xảy ra khi lưu phác đồ điều trị");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="treatment-plan-container">
      <Card>
        <Title level={3}>Phác đồ điều trị</Title>
        {(() => {
          console.log("🔍 [TreatmentPlanEditor] Render debug:");
          console.log("  - existingPlan:", existingPlan);
          console.log("  - editing:", editing);
          console.log("  - !existingPlan || !editing:", !existingPlan || !editing);
          return !editing; // Chỉ hiển thị button khi không editing
        })() ? (
          <>
            {existingPlan && (
              <>
                <div className="info-display">
                  <p><b>Tên phác đồ:</b> {existingPlan.planName}</p>
                  <p><b>Mô tả:</b> {existingPlan.planDescription}</p>
                  <p><b>Loại điều trị:</b> {existingPlan.treatmentType}</p>
                  <p><b>Trạng thái:</b> {existingPlan.status || 'Chưa xác định'}</p>
                </div>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => setEditing(true)}
                  style={{ marginTop: 16 }}
                >
                  Chỉnh sửa phác đồ
                </Button>
              </>
            )}
            {!existingPlan && (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ marginBottom: 20 }}>
                  <PlusOutlined style={{ fontSize: 48, color: '#667eea', marginBottom: 16 }} />
                  <p style={{ color: '#666', fontSize: 16 }}>Chưa có phác đồ điều trị nào</p>
                </div>
                <Button
                  type="primary"
                  size="large"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    console.log("🔍 [TreatmentPlanEditor] 'Tạo phác đồ mới' button clicked");
                    console.log("🔍 [TreatmentPlanEditor] examinationData:", examinationData);
                    setEditing(true);
                  }}
                >
                  Tạo phác đồ mới
                </Button>
              </div>
            )}
          </>
        ) : (
          <>
            {/* 🆕 Alert khi treatment plan đã completed hoặc cancelled */}
            {existingPlan && (existingPlan.status === "completed" || existingPlan.status === "cancelled") && (
              <div style={{ 
                marginBottom: 16, 
                padding: 12, 
                backgroundColor: existingPlan.status === "completed" ? "#f6ffed" : "#fff2e8",
                border: `1px solid ${existingPlan.status === "completed" ? "#b7eb8f" : "#ffbb96"}`,
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                gap: 8
              }}>
                <InfoCircleOutlined style={{ 
                  color: existingPlan.status === "completed" ? "#52c41a" : "#fa8c16",
                  fontSize: 16
                }} />
                <span style={{ 
                  color: existingPlan.status === "completed" ? "#52c41a" : "#fa8c16",
                  fontWeight: 500
                }}>
                  Phác đồ điều trị đã {existingPlan.status === "completed" ? "hoàn thành" : "hủy"}. 
                  Không thể chỉnh sửa phác đồ ở trạng thái này.
                </span>
              </div>
            )}
            
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              className="treatment-plan-form"
              disabled={existingPlan && (existingPlan.status === "completed" || existingPlan.status === "cancelled")}
            >
            <Card type="inner" className="section-card">
              <div className="section-title">
                <SettingOutlined style={{ marginRight: 8 }} />
                Thông tin cơ bản
              </div>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="planName"
                    label="Tên phác đồ"
                    rules={[{ required: true, message: 'Vui lòng nhập tên phác đồ!' }]}
                  >
                    <Input placeholder="Nhập tên phác đồ..." />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="treatmentType"
                    label="Loại điều trị"
                  >
                    <Input disabled />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="treatmentCycle"
                    label="Chu kỳ điều trị"
                  >
                    <InputNumber min={1} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="estimatedDurationDays"
                    label="Thời gian ước tính (ngày)"
                  >
                    <InputNumber min={1} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="estimatedCost"
                    label="Chi phí ước tính (VNĐ)"
                  >
                    <InputNumber 
                      min={0} 
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/\$\s?|(,*)/g, '')}
                      style={{ width: '100%' }} 
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="successProbability"
                    label="Tỷ lệ thành công (%)"
                  >
                    <InputNumber 
                      min={0} 
                      max={100} 
                      formatter={value => `${value}%`}
                      parser={value => value.replace('%', '')}
                      style={{ width: '100%' }} 
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item
                name="planDescription"
                label="Mô tả"
              >
                <Input.TextArea rows={3} placeholder="Mô tả chi tiết..." />
              </Form.Item>
            </Card>

            {/* Treatment Steps */}
            <Card type="inner" className="section-card treatment-steps-section" style={{ marginTop: 16 }}>
              <div className="section-title">
                <OrderedListOutlined style={{ marginRight: 8 }} />
                Các bước điều trị
              </div>
              <Form.List name="treatmentSteps">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Card key={key} size="small" style={{ marginBottom: 8 }}>
                        <Row gutter={16}>
                          <Col xs={24} md={6}>
                            <Form.Item
                              {...restField}
                              name={[name, 'step']}
                              label="Bước"
                            >
                              <InputNumber min={1} style={{ width: '100%' }} />
                            </Form.Item>
                          </Col>
                          <Col xs={24} md={6}>
                            <Form.Item
                              {...restField}
                              name={[name, 'name']}
                              label="Tên bước"
                            >
                              <Input />
                            </Form.Item>
                          </Col>
                          <Col xs={24} md={6}>
                            <Form.Item
                              {...restField}
                              name={[name, 'duration']}
                              label="Thời gian"
                            >
                              <Input />
                            </Form.Item>
                          </Col>
                          <Col xs={24} md={6}>
                            <Form.Item
                              {...restField}
                              name={[name, 'description']}
                              label="Mô tả"
                            >
                              <Input.TextArea rows={2} />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Button 
                          type="text" 
                          danger 
                          onClick={() => remove(name)}
                          icon={<DeleteOutlined />}
                        >
                          Xóa bước
                        </Button>
                      </Card>
                    ))}
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      Thêm bước điều trị
                    </Button>
                  </>
                )}
              </Form.List>
            </Card>

            {/* Medication Plan */}
            <Card type="inner" className="section-card medication-plan-section" style={{ marginTop: 16 }}>
              <div className="section-title">
                <MedicineBoxOutlined style={{ marginRight: 8 }} />
                Kế hoạch dùng thuốc
              </div>
              <Form.List name="medicationPlan">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Card key={key} size="small" style={{ marginBottom: 8 }}>
                        <Row gutter={16}>
                          <Col xs={24} md={8}>
                            <Form.Item
                              {...restField}
                              name={[name, 'phase']}
                              label="Giai đoạn"
                            >
                              <Input />
                            </Form.Item>
                          </Col>
                          <Col xs={24} md={16}>
                            <Form.List name={[name, 'medications']}>
                              {(medFields, { add: addMed, remove: removeMed }) => (
                                <>
                                  {medFields.map(({ key: medKey, name: medName, ...medRestField }) => (
                                    <Row key={medKey} gutter={8} style={{ marginBottom: 8 }}>
                                      <Col span={6}>
                                        <Form.Item
                                          {...medRestField}
                                          name={[medName, 'name']}
                                          label="Tên thuốc"
                                        >
                                          <Input />
                                        </Form.Item>
                                      </Col>
                                      <Col span={6}>
                                        <Form.Item
                                          {...medRestField}
                                          name={[medName, 'dosage']}
                                          label="Liều lượng"
                                        >
                                          <Input />
                                        </Form.Item>
                                      </Col>
                                      <Col span={6}>
                                        <Form.Item
                                          {...medRestField}
                                          name={[medName, 'frequency']}
                                          label="Tần suất"
                                        >
                                          <Input />
                                        </Form.Item>
                                      </Col>
                                      <Col span={5}>
                                        <Form.Item
                                          {...medRestField}
                                          name={[medName, 'duration']}
                                          label="Thời gian"
                                        >
                                          <Input />
                                        </Form.Item>
                                      </Col>
                                      <Col span={1}>
                                        <Button 
                                          type="text" 
                                          danger 
                                          onClick={() => removeMed(medName)}
                                          icon={<DeleteOutlined />}
                                        />
                                      </Col>
                                    </Row>
                                  ))}
                                  <Button type="dashed" onClick={() => addMed()} size="small">
                                    Thêm thuốc
                                  </Button>
                                </>
                              )}
                            </Form.List>
                          </Col>
                        </Row>
                        <Button 
                          type="text" 
                          danger 
                          onClick={() => remove(name)}
                          icon={<DeleteOutlined />}
                        >
                          Xóa giai đoạn
                        </Button>
                      </Card>
                    ))}
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      Thêm giai đoạn thuốc
                    </Button>
                  </>
                )}
              </Form.List>
            </Card>

            {/* Monitoring Schedule */}
            <Card type="inner" className="section-card monitoring-schedule-section" style={{ marginTop: 16 }}>
              <div className="section-title">
                <ClockCircleOutlined style={{ marginRight: 8 }} />
                Lịch theo dõi
              </div>
              <Form.List name="monitoringSchedule">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Card key={key} size="small" style={{ marginBottom: 8 }}>
                        <Row gutter={16}>
                          <Col xs={24} md={6}>
                            <Form.Item
                              {...restField}
                              name={[name, 'day']}
                              label="Ngày"
                            >
                              <InputNumber min={1} style={{ width: '100%' }} />
                            </Form.Item>
                          </Col>
                          <Col xs={24} md={8}>
                            <Form.Item
                              {...restField}
                              name={[name, 'activity']}
                              label="Hoạt động"
                            >
                              <Input placeholder="Mô tả hoạt động..." />
                            </Form.Item>
                          </Col>
                          <Col xs={24} md={6}>
                            <Form.Item
                              {...restField}
                              name={[name, 'type']}
                              label="Loại"
                            >
                              <Select placeholder="Chọn loại">
                                <Select.Option value="consultation">Tư vấn</Select.Option>
                                <Select.Option value="medication">Thuốc</Select.Option>
                                <Select.Option value="ultrasound">Siêu âm</Select.Option>
                                <Select.Option value="test">Xét nghiệm</Select.Option>
                                <Select.Option value="procedure">Thủ thuật</Select.Option>
                                <Select.Option value="trigger">Trigger</Select.Option>
                                <Select.Option value="monitoring">Theo dõi</Select.Option>
                              </Select>
                            </Form.Item>
                          </Col>
                          <Col xs={24} md={4}>
                            <Button 
                              type="text" 
                              danger 
                              onClick={() => remove(name)}
                              icon={<DeleteOutlined />}
                              style={{ marginTop: 32 }}
                            >
                              Xóa
                            </Button>
                          </Col>
                        </Row>
                      </Card>
                    ))}
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      Thêm lịch theo dõi
                    </Button>
                  </>
                )}
              </Form.List>
            </Card>

            {/* Risk Factors & Contraindications */}
            <Card type="inner" className="section-card" style={{ marginTop: 16 }}>
              <div className="section-title">
                <WarningOutlined style={{ marginRight: 8 }} />
                Đánh giá và tiên lượng
              </div>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="riskFactors"
                    label="Yếu tố nguy cơ"
                  >
                    <Input.TextArea rows={3} placeholder="Mô tả các yếu tố nguy cơ..." />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="contraindications"
                    label="Chống chỉ định"
                  >
                    <Input.TextArea rows={3} placeholder="Mô tả các chống chỉ định..." />
                  </Form.Item>
                </Col>
              </Row>
            </Card>



            {/* Actions */}
            <div className="actions-section">
              <Button 
                onClick={() => setEditing(false)}
                disabled={false}
              >
                Quay lại
              </Button>
              <Button 
                type="primary" 
                icon={<SaveOutlined />} 
                htmlType="submit" 
                loading={loading} 
                disabled={existingPlan && (existingPlan.status === "completed" || existingPlan.status === "cancelled")}
                title={existingPlan && (existingPlan.status === "completed" || existingPlan.status === "cancelled") 
                  ? `Không thể chỉnh sửa phác đồ đã ${existingPlan.status === "completed" ? "hoàn thành" : "hủy"}`
                  : undefined}
                onClick={() => {
                  console.log("🔍 [TreatmentPlanEditor] 'Lưu' button clicked");
                  console.log("🔍 [TreatmentPlanEditor] Form values:", form.getFieldsValue());
                }}
              >
                Hoàn thành & Lưu phác đồ
              </Button>
            </div>
          </Form>
          </>
        )}
      </Card>
    </div>
  );
};

export default TreatmentPlanEditor;
