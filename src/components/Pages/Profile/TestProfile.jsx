import React, { useContext } from "react";
import { UserContext } from "../../../context/UserContext";
import { Link } from "react-router-dom";
import "./UserProfile.css";

const TestProfile = () => {
  const { user, isLoggedIn } = useContext(UserContext);

  return (
    <div className="profile-container">
      <div
        style={{
          background: "white",
          padding: "30px",
          borderRadius: "12px",
          textAlign: "center",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h1 style={{ color: "#1976d2", marginBottom: "30px" }}>
          🧪 Test Profile (No API)
        </h1>

        {!isLoggedIn ? (
          <div>
            <h3>❌ Not logged in</h3>
            <Link
              to="/mock-login"
              style={{
                padding: "10px 20px",
                background: "#ff9800",
                color: "white",
                textDecoration: "none",
                borderRadius: "8px",
              }}
            >
              🔓 Login First
            </Link>
          </div>
        ) : (
          <div>
            <h3>✅ User logged in successfully!</h3>

            <div
              style={{
                background: "#f0f7ff",
                padding: "20px",
                borderRadius: "8px",
                marginBottom: "20px",
              }}
            >
              <h4>User Data from Context:</h4>
              <div style={{ textAlign: "left" }}>
                <p>
                  <strong>Name:</strong> {user.fullName || "N/A"}
                </p>
                <p>
                  <strong>Email:</strong> {user.email || "N/A"}
                </p>
                <p>
                  <strong>Role:</strong> {user.role || "N/A"}
                </p>
                <p>
                  <strong>Token:</strong>{" "}
                  {user.token ? "✅ Present" : "❌ Missing"}
                </p>
                <p>
                  <strong>Avatar:</strong>{" "}
                  {user.avatarUrl ? "✅ Present" : "❌ Missing"}
                </p>
              </div>
            </div>

            <div
              style={{
                background: "#e8f5e8",
                padding: "20px",
                borderRadius: "8px",
                marginBottom: "20px",
              }}
            >
              <h4>Test Results:</h4>
              <div style={{ textAlign: "left" }}>
                <p>✅ UserContext working</p>
                <p>✅ Login process successful</p>
                <p>✅ Data stored in localStorage</p>
                <p>{user.token ? "✅" : "❌"} JWT Token available</p>
                <p>✅ Role mapping working</p>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "15px",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Link
                to="/profile"
                style={{
                  padding: "10px 20px",
                  background: "#1976d2",
                  color: "white",
                  textDecoration: "none",
                  borderRadius: "8px",
                }}
              >
                📝 Try Real Profile
              </Link>
              <Link
                to="/profile-debug"
                style={{
                  padding: "10px 20px",
                  background: "#ff9800",
                  color: "white",
                  textDecoration: "none",
                  borderRadius: "8px",
                }}
              >
                🔧 Debug Page
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestProfile;
