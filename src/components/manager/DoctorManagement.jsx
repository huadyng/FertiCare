// src/pages/DoctorManagement.jsx
import React, { useState, useEffect } from "react";
import { Table, Card, Button, Modal, Space, message, Popconfirm, Switch } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";

import {
  getDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  toggleDoctorStatus,
} from "../../api/apiManager";

import DoctorForm from "./doctorWorks/DoctorForm";

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
      const newStatus = doctor.status === "active" ? "inactive" : "active";
      await toggleDoctorStatus(doctor.id, newStatus);
      message.success("Status updated");
      fetchDoctors();
    } catch (error) {
      message.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  // Delete doctor handler
  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await deleteDoctor(id);
      message.success("Doctor deleted");
      fetchDoctors();
    } catch (error) {
      message.error("Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (_, record) => (
        <Switch
          checked={record.status === "active"}
          onChange={() => handleToggleStatus(record)}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => openModal("view", record)}>
            View
          </Button>
          <Button icon={<EditOutlined />} onClick={() => openModal("edit", record)}>
            Edit
          </Button>
          <Popconfirm
            title="Are you sure to delete this doctor?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="Doctor Management"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal("create")}>
          Add Doctor
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
