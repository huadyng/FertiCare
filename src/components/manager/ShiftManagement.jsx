import React, { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Button,
  Modal,
  message,
  Popconfirm,
  Spin,
  Select,
} from "antd";
import {
  getAllWorkShifts,
  createWorkShift,
  updateWorkShift,
  deleteWorkShift,
  assignStaffToShift,
  deleteStaffFromShift,
} from "../../api/apiShift";
import { getDoctors } from "../../api/apiManager";
import ShiftForm from "./Form/ShiftForm";
const { Option } = Select;

const ShiftManagement = () => {
  const [workShifts, setWorkShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // create | edit | detail
  const [currentShift, setCurrentShift] = useState(null);

  // Phân ca
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [doctorList, setDoctorList] = useState([]);
  const [selectedDoctorIds, setSelectedDoctorIds] = useState([]);
  const [assignLoading, setAssignLoading] = useState(false);

  const fetchWorkShifts = async () => {
    setLoading(true);
    try {
      const data = await getAllWorkShifts();
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

  // Fetch danh sách bác sĩ
  const fetchDoctors = async () => {
  try {
    const res = await getDoctors();
    console.log("✅ Doctors API:", res);

    // Nếu API trả về { data: [...] }
    const doctors = Array.isArray(res.data) ? res.data : res.data?.data || [];
    setDoctorList(doctors);

    console.log("👨‍⚕️ Doctors list đã xử lý:", doctors);
  } catch (err) {
    console.error("❌ Lỗi API bác sĩ:", err);
    message.error("Không thể tải danh sách bác sĩ");
    setDoctorList([]);
  }
};

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

  const handleAssignClick = async (shift) => {
  console.log("👥 Shift được chọn:", shift);
  setCurrentShift(shift);

  // ✅ Preload danh sách bác sĩ đã gán
  const preloadIds = shift.assignedStaff?.map((staff) => String(staff.staffId)) || [];
  setSelectedDoctorIds(preloadIds);

  setAssignModalVisible(true);

  // ✅ Gọi API lấy bác sĩ
  await fetchDoctors();
};

  const handleAssign = async () => {
    if (selectedDoctorIds.length === 0) {
      message.warning("⚠️ Vui lòng chọn ít nhất 1 bác sĩ");
      return;
    }
    setAssignLoading(true);
    try {
      const payload = {
        shiftId: currentShift.id,
        staffIds: selectedDoctorIds,
        note: "Phân ca tự động",
        status: "active",
      };
      console.log("📤 Payload phân ca:", payload);
      await assignStaffToShift(payload);
      message.success("✅ Phân ca thành công!");
      setAssignModalVisible(false);
      fetchWorkShifts();
    } catch (err) {
      console.error("❌ Lỗi phân ca:", err);
      message.error("Phân ca thất bại!");
    } finally {
      setAssignLoading(false);
    }
  };
const handleDoctorChange = async (newValues) => {
    const removedDoctors = selectedDoctorIds.filter(
      (id) => !newValues.includes(id),
    );
    if (removedDoctors.length > 0) {
      for (const staffId of removedDoctors) {
        try {
          await deleteStaffFromShift(currentShift.id, staffId); // 🆕 GỌI API XÓA
          message.success("🗑 Đã xóa nhân viên khỏi ca");
        } catch (err) {
          console.error("❌ Lỗi xóa nhân viên:", err);
          message.error("Xóa nhân viên khỏi ca thất bại!");
        }
      }
    }
    setSelectedDoctorIds(newValues);
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
          <Button
            size="small"
            type="link"
            onClick={() => handleAssignClick(record)}
          >
            👥 Phân ca
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
      : modalMode === "assign"
      ? "👩‍⚕️ Phân ca làm việc"
      : "📖 Chi tiết ca làm việc"
  }
  open={showModal}
  onCancel={() => setShowModal(false)}
  footer={null}
  width={600}
>
  <ShiftForm
    mode={modalMode} // 🛠 SỬA: truyền cả mode phân ca
    initialValues={currentShift}
    onSubmit={
      modalMode === "create"
        ? handleCreate
        : modalMode === "edit"
        ? handleUpdate
        : handleAssign // 🛠 SỬA: xử lý phân ca
    }
    onCancel={() => setShowModal(false)}
  />
</Modal>

<Modal
  title="👩‍⚕️ Phân ca làm việc"
  open={assignModalVisible}
  onCancel={() => setAssignModalVisible(false)}
  onOk={handleAssign}
  okButtonProps={{ loading: assignLoading }}
  okText="Xác nhận"
>
  <Select
    mode="multiple"
    placeholder="Chọn bác sĩ"
    style={{ width: "100%" }}
    value={selectedDoctorIds}
    onChange={handleDoctorChange} // 🆕 SỬ DỤNG FUNCTION MỚI
  >
    {doctorList.map((doc) => (
      <Option key={doc.id} value={String(doc.id)}>
        {doc.fullName}
      </Option>
    ))}
  </Select>
</Modal>
    </div>
  );
};

export default ShiftManagement;
