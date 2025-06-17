import React, { useState } from "react";
import Sidebar from "./SideBar";
import RatingsPieChart from "./RatingsPieChart";
import "./ManagerDashboard.css";

export default function Dashboard() {
  const [selectedChart, setSelectedChart] = useState("ratings");

  return (
    <div className="dashboard-container">
      <Sidebar onSelectChart={setSelectedChart} />
      <div className="dashboard-content">
        {selectedChart === "ratings" && <RatingsPieChart />}
      </div>
    </div>
  );
}
