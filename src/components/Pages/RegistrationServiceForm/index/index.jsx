import React, { useState } from "react";
import CustomerInfoSection from "../CustomerInfoSection/CustomerInfoSection";
import ServiceSelectionSection from "../ServiceSelectionSection/ServiceSelectionSection";
import DoctorSelectionSection from "../DoctorSelectionSection/DoctorSelectionSection";
import NotesSection from "../NotesSection/NotesSection";
import axios from "axios";

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    dob: "",
    contact: "",
    idNumber: "",
    ivf: false,
    iui: false,
    doctorOption: "auto",
    doctor: "",
    schedule: "",
    notes: "",
    agreePolicy: false,
  });

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3001/registrations", formData);
      alert("Đăng ký thành công!");
    } catch (error) {
      console.error(error);
      alert("Đăng ký thất bại.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-4">
      <CustomerInfoSection formData={formData} handleChange={handleChange} />
      <ServiceSelectionSection
        formData={formData}
        handleChange={handleChange}
      />
      <DoctorSelectionSection formData={formData} handleChange={handleChange} />
      <NotesSection formData={formData} handleChange={handleChange} />
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Gửi đăng ký
      </button>
    </form>
  );
};

export default RegistrationForm;
