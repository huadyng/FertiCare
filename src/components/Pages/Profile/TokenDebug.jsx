import React, { useState, useEffect } from "react";
import axiosClient from "../../../services/axiosClient";

const TokenDebug = () => {
  const [debugInfo, setDebugInfo] = useState({});
  const [testResults, setTestResults] = useState({});

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    let userData = null;
    try {
      userData = user ? JSON.parse(user) : null;
    } catch (e) {
      console.error("Error parsing user data:", e);
    }

    setDebugInfo({
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
      tokenPreview: token ? token.substring(0, 50) + "..." : "No token",
      hasUser: !!user,
      userData: userData,
      currentUrl: window.location.href,
      timestamp: new Date().toISOString(),
    });
  };

  const testEndpoint = async (endpoint, method = "GET") => {
    console.log(`🧪 [TokenDebug] Testing ${method} ${endpoint}`);

    try {
      const response = await axiosClient({
        method,
        url: endpoint,
      });

      setTestResults((prev) => ({
        ...prev,
        [endpoint]: {
          success: true,
          status: response.status,
          data: response.data,
          timestamp: new Date().toISOString(),
        },
      }));

      console.log(`✅ [TokenDebug] ${endpoint} success:`, response.data);
    } catch (error) {
      setTestResults((prev) => ({
        ...prev,
        [endpoint]: {
          success: false,
          status: error.response?.status,
          error: error.response?.data || error.message,
          timestamp: new Date().toISOString(),
        },
      }));

      console.error(`❌ [TokenDebug] ${endpoint} failed:`, error);
    }
  };

  const clearAuth = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setDebugInfo({});
    setTestResults({});
    console.log("🧹 [TokenDebug] Cleared authentication data");
  };

  const testBackendConnection = async () => {
    console.log("🔌 [TokenDebug] Testing backend connection...");

    try {
      const response = await fetch("http://localhost:8080/actuator/health");
      const data = await response.json();

      setTestResults((prev) => ({
        ...prev,
        "backend-health": {
          success: true,
          status: response.status,
          data: data,
          timestamp: new Date().toISOString(),
        },
      }));
    } catch (error) {
      setTestResults((prev) => ({
        ...prev,
        "backend-health": {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        },
      }));
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "monospace", fontSize: "12px" }}>
      <h2>🔍 Token & Authentication Debug</h2>

      {/* Auth Status */}
      <div
        style={{
          marginBottom: "20px",
          padding: "10px",
          border: "1px solid #ddd",
          borderRadius: "5px",
        }}
      >
        <h3>📊 Authentication Status</h3>
        <pre>{JSON.stringify(debugInfo, null, 2)}</pre>

        <div style={{ marginTop: "10px" }}>
          <button onClick={checkAuthStatus} style={{ marginRight: "10px" }}>
            🔄 Refresh Auth Status
          </button>
          <button
            onClick={clearAuth}
            style={{ marginRight: "10px", color: "red" }}
          >
            🧹 Clear Auth Data
          </button>
        </div>
      </div>

      {/* Test Buttons */}
      <div
        style={{
          marginBottom: "20px",
          padding: "10px",
          border: "1px solid #ddd",
          borderRadius: "5px",
        }}
      >
        <h3>🧪 API Tests</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          <button onClick={testBackendConnection}>
            🔌 Test Backend Health
          </button>
          <button onClick={() => testEndpoint("/api/profiles/me")}>
            👤 Test /api/profiles/me
          </button>
          <button onClick={() => testEndpoint("/api/profiles/doctor/me")}>
            👨‍⚕️ Test Doctor Profile
          </button>
          <button onClick={() => testEndpoint("/api/profiles/customer/me")}>
            🏥 Test Customer Profile
          </button>
          <button onClick={() => testEndpoint("/api/profiles/admin/me")}>
            👑 Test Admin Profile
          </button>
          <button onClick={() => testEndpoint("/api/users")}>
            👥 Test Users List
          </button>
        </div>
      </div>

      {/* Test Results */}
      <div
        style={{
          padding: "10px",
          border: "1px solid #ddd",
          borderRadius: "5px",
        }}
      >
        <h3>📋 Test Results</h3>
        {Object.keys(testResults).length === 0 ? (
          <p>No tests run yet. Click the buttons above to test endpoints.</p>
        ) : (
          Object.entries(testResults).map(([endpoint, result]) => (
            <div
              key={endpoint}
              style={{
                marginBottom: "15px",
                padding: "10px",
                border: `1px solid ${result.success ? "#4CAF50" : "#f44336"}`,
                borderRadius: "3px",
                backgroundColor: result.success ? "#f8fff8" : "#fff8f8",
              }}
            >
              <h4 style={{ color: result.success ? "#4CAF50" : "#f44336" }}>
                {result.success ? "✅" : "❌"} {endpoint}
              </h4>
              <p>
                <strong>Status:</strong> {result.status || "N/A"}
              </p>
              <p>
                <strong>Time:</strong> {result.timestamp}
              </p>

              {result.success ? (
                <div>
                  <p>
                    <strong>Response Data:</strong>
                  </p>
                  <pre
                    style={{
                      fontSize: "10px",
                      overflow: "auto",
                      maxHeight: "200px",
                    }}
                  >
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              ) : (
                <div>
                  <p>
                    <strong>Error:</strong>
                  </p>
                  <pre
                    style={{
                      fontSize: "10px",
                      overflow: "auto",
                      maxHeight: "200px",
                      color: "#f44336",
                    }}
                  >
                    {JSON.stringify(result.error, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TokenDebug;
