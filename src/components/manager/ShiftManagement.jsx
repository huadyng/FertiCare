import React, { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Button,
  Modal,
  message,
  Popconfirm,
  Spin,
} from "antd";
import {
  getAllWorkShifts,
  createWorkShift,
  updateWorkShift,
  deleteWorkShift,
} from "../../api/apiShift";
import ShiftForm from "./Form/ShiftForm";

const ShiftManagement = () => {
  const [workShifts, setWorkShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // create | edit | detail
  const [currentShift, setCurrentShift] = useState(null);

  // 🔄 Fetch danh sách ca làm việc
  const fetchWorkShifts = async () => {
  setLoading(true);
  try {
    const data = await getAllWorkShifts(); // ✅ lấy mảng từ API
    console.log("✅ Work Shifts:", data);
    setWorkShifts(data || []);
  } catch (err) {
    console.error("❌ Lỗi API:", err);
    message.error("Không thể tải danh sách ca làm việc!");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchWorkShifts();
  }, []);

  const handleCreate = async (formData) => {
    try {
      await createWorkShift(formData);
      message.success("✅ Tạo ca làm việc thành công!");
      setShowModal(false);
      fetchWorkShifts();
    } catch (err) {
      console.error("❌ Lỗi tạo ca:", err);
      message.error("Tạo ca làm việc thất bại!");
    }
  };

  const handleUpdate = async (formData) => {
    try {
      await updateWorkShift(currentShift.id, formData);
      message.success("✅ Cập nhật ca thành công!");
      setShowModal(false);
      fetchWorkShifts();
    } catch (err) {
      console.error("❌ Lỗi cập nhật ca:", err);
      message.error("Cập nhật ca làm việc thất bại!");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteWorkShift(id);
      message.success("✅ Xóa ca làm việc thành công!");
      fetchWorkShifts();
    } catch (err) {
      console.error("❌ Lỗi xóa ca:", err);
      message.error("Xóa ca làm việc thất bại!");
    }
  };

  const columns = [
    {
      title: "Tên ca",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Phòng ban",
      dataIndex: "department",
      key: "department",
    },
    {
      title: "Ngày",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Thời gian",
      render: (_, record) => `${record.startTime} - ${record.endTime}`,
    },
    {
      title: "Ưu tiên",
      dataIndex: "priority",
      key: "priority",
      render: (priority) => {
        let color = "default";
        if (priority === "high") color = "red";
        else if (priority === "medium") color = "orange";
        else if (priority === "low") color = "green";
        return <Tag color={color}>{priority?.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Hành động",
      render: (_, record) => (
        <>
          <Button
            size="small"
            type="link"
            onClick={() => {
              setModalMode("detail");
              setCurrentShift(record);
              setShowModal(true);
            }}
          >
            📖 Chi tiết
          </Button>
          <Button
            size="small"
            type="link"
            onClick={() => {
              setModalMode("edit");
              setCurrentShift(record);
              setShowModal(true);
            }}
          >
            ✏️ Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa ca này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button size="small" danger type="link">
              🗑 Xóa
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div>
      <h2>👨‍⚕️ Quản lý ca làm việc</h2>
      <Button
        type="primary"
        style={{ marginBottom: 16 }}
        onClick={() => {
          setModalMode("create");
          setCurrentShift(null);
          setShowModal(true);
        }}
      >
        ➕ Thêm ca làm việc
      </Button>
      {loading ? (
        <Spin tip="Đang tải danh sách..." size="large" />
      ) : (
        <Table
  rowKey="id"
  dataSource={Array.isArray(workShifts) ? workShifts : []}
  columns={columns}
  pagination={{ pageSize: 5 }}
/>
      )}

      <Modal
        title={
          modalMode === "create"
            ? "➕ Thêm ca làm việc"
            : modalMode === "edit"
            ? "✏️ Cập nhật ca làm việc"
            : "📖 Chi tiết ca làm việc"
        }
        open={showModal}
        onCancel={() => setShowModal(false)}
        footer={null}
        width={600}
      >
        <ShiftForm
          mode={modalMode}
          initialValues={currentShift}
          onSubmit={
            modalMode === "create" ? handleCreate : handleUpdate
          }
          onCancel={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
};

export default ShiftManagement;
