import React from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const hospitalIcon = new L.Icon({
  iconUrl:
    "https://cdn-icons-png.flaticon.com/512/854/854878.png",
  iconSize: [32, 32],
});

export default function Contact() {
  const navigate = useNavigate();

  const handleBookingClick = () => {
    navigate("/booking");
  };

  return (
    <div style={{ padding: "2rem", background: "#fef2f2" }}>
      <h1 style={{ fontSize: "2rem", color: "#c2185b", textAlign: "center" }}>
        Liên hệ với Bệnh viện
      </h1>

      {/* Địa chỉ, email, hotline */}
      <div style={{ maxWidth: "600px", margin: "2rem auto", textAlign: "center" }}>
        <p><strong>Địa chỉ:</strong> 108 Hoàng Như Tiếp, Long Biên, Hà Nội</p>
        <p><strong>Email:</strong> info@tamanhhospital.vn</p>
        <p><strong>Hotline:</strong> 1800 6858</p>

        <button
          onClick={handleBookingClick}
          style={{
            backgroundColor: "#f43f5e",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "20px",
            cursor: "pointer",
            fontSize: "16px",
            marginTop: "1rem",
            transition: "background-color 0.3s ease, transform 0.2s ease",
          }}
        >
          Đặt lịch khám
        </button>
      </div>

      {/* Bản đồ */}
      <div style={{ height: "400px", maxWidth: "900px", margin: "0 auto", borderRadius: "10px", overflow: "hidden" }}>
        <MapContainer
          center={[21.039047, 105.886243]} // Tâm Anh Hà Nội
          zoom={16}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          />
          <Marker position={[21.039047, 105.886243]} icon={hospitalIcon}>
            <Popup>Bệnh viện Đa khoa Tâm Anh - Hà Nội</Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}
