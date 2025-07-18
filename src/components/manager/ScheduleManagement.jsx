import React, { useEffect, useState } from "react";
import { Table, Tag, Button, message, Spin, Modal, Popconfirm } from "antd";
import { getAllSchedules, createSchedule, updateSchedule,deleteSchedule } from "../../api/apiSchedule";
import ScheduleForm from "./Form/ScheduleForm";
import dayjs from "dayjs";
const ScheduleManagement = () => {
  // ✅ STATE
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false); // 🟢 ĐÃ KHAI BÁO
  const [showEditModal, setShowEditModal] = useState(false); // 🟢 modal edit
  const [editingSchedule, setEditingSchedule] = useState(null); // 🟢 ca đang chỉnh
  // ✅ LẤY DANH SÁCH CA TRỰC
  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const data = await getAllSchedules();
      setSchedules(data || []);
    } catch (err) {
      console.error("❌ Lỗi API:", err);
      message.error("Không thể tải danh sách ca trực!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  // ✅ TẠO CA TRỰC MỚI
  const handleCreate = async (formData) => {
    try {
      console.log("📤 Payload gửi backend:", formData);
      await createSchedule(formData);
      message.success("✅ Tạo ca trực thành công!");
      setShowCreateModal(false); // 🟢 Đóng modal sau khi tạo
      fetchSchedules();
    } catch (err) {
      console.error("❌ Lỗi tạo ca trực:", err.response?.data || err);
      message.error(
        "Tạo ca trực thất bại: " +
          (err.response?.data?.message?.messageDetail || "Lỗi không xác định"),
      );
    }
  };
  const handleUpdate = async (formData) => {
  try {
    console.log("📤 Data update gửi backend:", formData);
    await updateSchedule(editingSchedule.id, formData); // 🟢 Gửi API update
    message.success("✅ Cập nhật ca trực thành công!");
    setShowEditModal(false);
    setEditingSchedule(null);
    fetchSchedules(); // Reload danh sách
  } catch (err) {
    console.error("❌ Lỗi cập nhật:", err.response?.data || err);
    message.error("Cập nhật ca trực thất bại!");
  }
};
const handleDelete = async (id) => {
    try {
      await deleteSchedule(id);
      message.success("🗑️ Xoá ca trực thành công!");
      fetchSchedules();
    } catch (err) {
      console.error("❌ Lỗi xoá:", err);
      message.error("Xoá ca trực thất bại!");
    }
  };

  // ✅ CẤU HÌNH COLUMNS BẢNG
  const columns = [
    { title: "Ngày", dataIndex: "date", key: "date" },
    { title: "Phòng", dataIndex: "room", key: "room" },
    {
      title: "Thời gian",
      render: (_, record) => `${record.startTime} - ${record.endTime}`,
    },
    { title: "Loại ca", dataIndex: "type", key: "type" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "default";
        if (status === "pending") color = "orange";
        else if (status === "active") color = "green";
        else if (status === "completed") color = "blue";
        return <Tag color={color}>{status?.toUpperCase()}</Tag>;
      },
    },
    {
  title: "Hành động",
  render: (_, record) => (
    <>
      <Button
        type="link"
        onClick={() => {
          setEditingSchedule(record); // 🟢 Gán ca đang chỉnh sửa
          setShowEditModal(true);     // 🟢 Mở modal chỉnh sửa
        }}
      >
        ✏️ Sửa
      </Button> 
      <Popconfirm
            title="Bạn có chắc muốn xoá ca này không?"
            okText="Xoá"
            cancelText="Huỷ"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" danger>
              🗑️ Xoá
            </Button>
          </Popconfirm>
    </>
  ),
},
  ];

  return (
    <div>
      <h2>📅 Quản lý ca trực</h2>

      <Button
        type="primary"
        style={{ marginBottom: 16 }}
        onClick={() => setShowCreateModal(true)} // 🟢 MỞ MODAL
      >
        ➕ Thêm ca trực
      </Button>

      {loading ? (
        <Spin tip="Đang tải danh sách..." size="large" />
      ) : (
        <Table
          rowKey="id"
          dataSource={schedules}
          columns={columns}
          pagination={{ pageSize: 5 }}
        />
      )}

      {/* 🔥 MODAL THÊM CA TRỰC */}
      <Modal
        title="➕ Thêm ca trực"
        open={showCreateModal}
        onCancel={() => setShowCreateModal(false)} // 🟢 Đóng modal khi cancel
        footer={null}
      >
        <ScheduleForm
          onSubmit={handleCreate}
          onCancel={() => setShowCreateModal(false)} // 🟢 Đóng modal khi hủy
        />
      </Modal>
      {/* 🔥 MODAL CHỈNH SỬA CA TRỰC */}
      <Modal
  title="✏️ Chỉnh sửa ca trực"
  open={showEditModal}
  onCancel={() => {
    setShowEditModal(false);
    setEditingSchedule(null);
  }}
  footer={null}
>
  {editingSchedule && (
    <ScheduleForm
      mode="edit"
      initialValues={{
        ...editingSchedule,
        timeRange: [
          dayjs(editingSchedule.startTime, "HH:mm"),
          dayjs(editingSchedule.endTime, "HH:mm"),
        ],
      }}
      onSubmit={handleUpdate}
      onCancel={() => {
        setShowEditModal(false);
        setEditingSchedule(null);
      }}
    />
  )}
</Modal>
    </div>
  );
};

export default ScheduleManagement;
