// src/pages/DoctorManagement.jsx
import React, { useState, useEffect } from "react";
import { Table, Card, Button, Modal, Space, message, Popconfirm, Switch } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";

import {
  getDoctors,
  createDoctor,
  updateDoctor,
  toggleDoctorStatus,
} from "../../api/apiManager";

import DoctorForm from "./Form/DoctorForm";

const DoctorManagement = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("view"); // "view" | "edit" | "create"
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await getDoctors();
      setDoctors(res.data.data || []);

    } catch (error) {
      message.error("Failed to fetch doctors");
    } finally {
      setLoading(false);
    }
  };

  // Open modal
  const openModal = (mode, doctor = null) => {
    setModalMode(mode);
    setSelectedDoctor(doctor);
    setModalVisible(true);
  };

  // Close modal
  const closeModal = () => {
    setModalVisible(false);
    setSelectedDoctor(null);
  };

  // Submit form handler
  const handleFormSubmit = async (values) => {
    setLoading(true);
    try {
      if (modalMode === "create") {
        await createDoctor(values);
        message.success("Doctor created successfully");
      } else if (modalMode === "edit" && selectedDoctor) {
        await updateDoctor(selectedDoctor.id, values);
        message.success("Doctor updated successfully");
      }
      closeModal();
      fetchDoctors();
    } catch (error) {
      message.error("Operation failed");
    } finally {
      setLoading(false);
    }
  };

  // Toggle status handler
  const handleToggleStatus = async (doctor) => {
  setLoading(true);
  try {
    await toggleDoctorStatus(doctor.id); // Chỉ truyền ID
    message.success("Doctor status toggled");
    fetchDoctors(); // Reload danh sách
  } catch (error) {
    console.error(error);
    message.error("Failed to toggle doctor status");
  } finally {
    setLoading(false);
  }
};

  const columns = [
    {
      title: "Họ và Tên",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "Khoa",
      dataIndex: "department",
      key: "department",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (_, record) => (
        <Switch
          checked={record.status === "active"}
          onChange={() => handleToggleStatus(record)}
          checkedChildren="Hoat động"
          unCheckedChildren="Không hoạt động"
        />
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => openModal("view", record)}>
            Coi
          </Button>
          <Button icon={<EditOutlined />} onClick={() => openModal("edit", record)}>
            Sửa
          </Button>
          
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="Quản lý Bác Sĩ"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal("create")}>
          Thêm bác sĩ
        </Button>
      }
    >
      <Table
  dataSource={Array.isArray(doctors) ? doctors : []}
  columns={columns}
  rowKey="id"
  loading={loading}
  pagination={{ pageSize: 10 }}
/>

      <Modal
        visible={modalVisible}
        title={
          modalMode === "create"
            ? "Add New Doctor"
            : modalMode === "edit"
            ? "Edit Doctor"
            : "Doctor Details"
        }
        onCancel={closeModal}
        footer={null}
        width={800}
        destroyOnClose
      >
        <DoctorForm
          initialValues={selectedDoctor}
          onSubmit={handleFormSubmit}
          onCancel={closeModal}
          disabled={modalMode === "view"}
        />
      </Modal>
    </Card>
  );
};

export default DoctorManagement;
