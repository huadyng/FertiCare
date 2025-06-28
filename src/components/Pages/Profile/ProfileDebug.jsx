import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "../../../context/UserContext";
import { Link } from "react-router-dom";
import apiProfile from "../../../api/apiProfile";
import apiLogin from "../../../api/apiLogin";
import "./UserProfile.css";

const ProfileDebug = () => {
  const { user, isLoggedIn, login } = useContext(UserContext);
  const [debugInfo, setDebugInfo] = useState({});
  const [apiResponse, setApiResponse] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [testLoginCredentials, setTestLoginCredentials] = useState({
    email: "",
    password: "",
  });

  // ✅ Kiểm tra localStorage và UserContext
  useEffect(() => {
    const checkDebugInfo = () => {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");

      let parsedUser = null;
      try {
        parsedUser = storedUser ? JSON.parse(storedUser) : null;
      } catch (e) {
        console.error("Error parsing stored user:", e);
      }

      setDebugInfo({
        // LocalStorage
        localStorage_user_exists: !!storedUser,
        localStorage_user_content: parsedUser,
        localStorage_token_exists: !!storedToken,
        localStorage_token_preview: storedToken
          ? storedToken.substring(0, 50) + "..."
          : null,

        // UserContext
        userContext_isLoggedIn: isLoggedIn,
        userContext_user_exists: !!user,
        userContext_user_content: user,

        // Consistency check
        consistency_user_match:
          JSON.stringify(parsedUser) === JSON.stringify(user),
        consistency_token_match: parsedUser?.token === storedToken,
      });
    };

    checkDebugInfo();
    const interval = setInterval(checkDebugInfo, 2000); // Cập nhật mỗi 2 giây
    return () => clearInterval(interval);
  }, [user, isLoggedIn]);

  // ✅ Test API Profile
  const testApiProfile = async () => {
    try {
      setApiError(null);
      console.log("🧪 Testing API Profile...");
      const response = await apiProfile.getMyProfile();
      setApiResponse(response);
      console.log("✅ API Profile success:", response);
    } catch (error) {
      setApiError(error);
      console.error("❌ API Profile error:", error);
    }
  };

  // ✅ Test Login với credentials cụ thể
  const testLogin = async () => {
    try {
      setApiError(null);
      console.log("🧪 Testing Login...");
      const response = await apiLogin.login(
        testLoginCredentials.email,
        testLoginCredentials.password
      );
      console.log("✅ Login success:", response);
      login(response); // Cập nhật UserContext
    } catch (error) {
      setApiError(error);
      console.error("❌ Login error:", error);
    }
  };

  return (
    <div className="profile-container">
      <div
        style={{
          background: "white",
          padding: "30px",
          borderRadius: "12px",
          marginBottom: "20px",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h1 style={{ color: "#1976d2", marginBottom: "20px" }}>
          🔧 Profile Debug Panel
        </h1>

        {/* ✅ Debug Info Section */}
        <div style={{ marginBottom: "30px" }}>
          <h3>📊 Debug Information</h3>
          <div
            style={{
              background: "#f8f9fa",
              padding: "15px",
              borderRadius: "8px",
              fontFamily: "monospace",
              fontSize: "12px",
              lineHeight: "1.6",
            }}
          >
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        </div>

        {/* ✅ Quick Test Login */}
        <div style={{ marginBottom: "30px" }}>
          <h3>🧪 Quick Test Login</h3>
          <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
            <input
              type="email"
              placeholder="Email"
              value={testLoginCredentials.email}
              onChange={(e) =>
                setTestLoginCredentials((prev) => ({
                  ...prev,
                  email: e.target.value,
                }))
              }
              style={{ padding: "8px", flex: 1 }}
            />
            <input
              type="password"
              placeholder="Password"
              value={testLoginCredentials.password}
              onChange={(e) =>
                setTestLoginCredentials((prev) => ({
                  ...prev,
                  password: e.target.value,
                }))
              }
              style={{ padding: "8px", flex: 1 }}
            />
            <button
              onClick={testLogin}
              style={{
                padding: "8px 16px",
                background: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
              }}
            >
              🔐 Test Login
            </button>
          </div>
        </div>

        {/* ✅ API Test Section */}
        <div style={{ marginBottom: "30px" }}>
          <h3>🔗 API Test</h3>
          <button
            onClick={testApiProfile}
            style={{
              padding: "10px 20px",
              background: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "8px",
              marginRight: "10px",
            }}
          >
            🧪 Test GET /api/profiles/me
          </button>

          {apiResponse && (
            <div style={{ marginTop: "15px" }}>
              <h4 style={{ color: "#28a745" }}>✅ API Response:</h4>
              <div
                style={{
                  background: "#d4edda",
                  padding: "10px",
                  borderRadius: "4px",
                  fontFamily: "monospace",
                  fontSize: "12px",
                }}
              >
                <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
              </div>
            </div>
          )}

          {apiError && (
            <div style={{ marginTop: "15px" }}>
              <h4 style={{ color: "#dc3545" }}>❌ API Error:</h4>
              <div
                style={{
                  background: "#f8d7da",
                  padding: "10px",
                  borderRadius: "4px",
                  fontFamily: "monospace",
                  fontSize: "12px",
                }}
              >
                <pre>
                  {JSON.stringify(
                    {
                      message: apiError.message,
                      response: apiError.response?.data,
                      status: apiError.response?.status,
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* ✅ Navigation Links */}
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
            to="/test-profile"
            style={{
              padding: "10px 20px",
              background: "#ff9800",
              color: "white",
              textDecoration: "none",
              borderRadius: "8px",
            }}
          >
            🧪 Test Profile
          </Link>
          <Link
            to="/login"
            style={{
              padding: "10px 20px",
              background: "#6c757d",
              color: "white",
              textDecoration: "none",
              borderRadius: "8px",
            }}
          >
            🔐 Login Page
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProfileDebug;
