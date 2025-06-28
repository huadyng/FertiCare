import React, { useState } from "react";
import apiAuth from "../../../api/apiAuth";
import axiosClient from "../../../services/axiosClient";

const TokenGenerator = () => {
  const [tokenData, setTokenData] = useState({
    email: "admin@ferticare.com",
    role: "ADMIN",
    fullName: "Test Admin User",
    userId: 1,
  });

  // Real test users from backend DataInitializationConfig
  // Note: Passwords need to meet pattern: ^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$
  const REAL_TEST_USERS = {
    ADMIN: {
      email: "newadmin@test.com", // New email to avoid conflicts
      password: "Admin123", // Updated to meet password pattern
      fullName: "New Admin User",
    },
    CUSTOMER: {
      email: "newcustomer@test.com", // New email to avoid conflicts
      password: "Customer123", // Updated to meet password pattern
      fullName: "New Customer A",
    },
    DOCTOR: {
      email: "newdoctor@test.com", // New email to avoid conflicts
      password: "Doctor123", // Updated to meet password pattern
      fullName: "New Dr. John Doe",
    },
    MANAGER: {
      email: "newmanager@test.com", // New email to avoid conflicts
      password: "Manager123", // Updated to meet password pattern
      fullName: "New Manager Jane",
    },
  };

  // Mock test tokens (for fallback)
  const TEST_TOKENS = {
    ADMIN: {
      email: "admin@ferticare.com",
      role: "ADMIN",
      fullName: "Admin User",
      userId: 1,
      token: "test-admin-token-" + Date.now(),
    },
    CUSTOMER: {
      email: "customer@ferticare.com",
      role: "CUSTOMER",
      fullName: "Customer User",
      userId: 2,
      token: "test-customer-token-" + Date.now(),
    },
    DOCTOR: {
      email: "doctor@ferticare.com",
      role: "DOCTOR",
      fullName: "Doctor User",
      userId: 3,
      token: "test-doctor-token-" + Date.now(),
    },
    MANAGER: {
      email: "manager@ferticare.com",
      role: "MANAGER",
      fullName: "Manager User",
      userId: 4,
      token: "test-manager-token-" + Date.now(),
    },
  };

  const setTestToken = (role) => {
    const userData = TEST_TOKENS[role];

    // Set token and user data in localStorage
    localStorage.setItem("token", userData.token);
    localStorage.setItem("user", JSON.stringify(userData));

    console.log(`🔑 [TokenGenerator] Set ${role} token:`, userData);
    alert(
      `✅ Set ${role} token successfully!\nToken: ${userData.token}\nUser: ${userData.fullName}`
    );

    // Refresh the page to apply the new token
    window.location.reload();
  };

  const clearTokens = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    console.log("🧹 [TokenGenerator] Cleared all tokens");
    alert("🧹 Cleared all tokens");
    window.location.reload();
  };

  const checkCurrentToken = () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      try {
        const userData = JSON.parse(user);
        alert(
          `Current Token:\n${token}\n\nUser Data:\n${JSON.stringify(
            userData,
            null,
            2
          )}`
        );
      } catch (e) {
        alert(`Token exists but user data is invalid:\n${user}`);
      }
    } else {
      alert("No token found in localStorage");
    }
  };

  const generateRealJWT = () => {
    // This is a mock JWT token structure - in real app, you'd get this from login API
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = btoa(
      JSON.stringify({
        sub: tokenData.email,
        role: tokenData.role,
        name: tokenData.fullName,
        userId: tokenData.userId,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
      })
    );
    const signature =
      "mock-signature-" + Math.random().toString(36).substr(2, 9);

    return `${header}.${payload}.${signature}`;
  };

  const setCustomToken = () => {
    const customToken = generateRealJWT();

    localStorage.setItem("token", customToken);
    localStorage.setItem("user", JSON.stringify(tokenData));

    console.log("🔑 [TokenGenerator] Set custom token:", {
      token: customToken,
      user: tokenData,
    });
    alert(
      `✅ Set custom token successfully!\nRole: ${tokenData.role}\nEmail: ${tokenData.email}`
    );

    window.location.reload();
  };

  // Create new user with Google Login (bypasses email verification)
  const createUserWithGoogleLogin = async (role) => {
    const userCreds = REAL_TEST_USERS[role];
    if (!userCreds) {
      alert(`❌ No credentials found for role: ${role}`);
      return;
    }

    try {
      console.log(
        `🔐 [TokenGenerator] Creating ${role} user via Google login:`,
        userCreds
      );

      // Use Google login API which automatically verifies email
      const googleLoginData = {
        googleToken: `mock-google-token-${Date.now()}`,
        email: userCreds.email,
        fullName: userCreds.fullName,
        avatarUrl: "https://example.com/avatar.jpg",
      };

      const response = await axiosClient.post(
        "/api/auth/google-login",
        googleLoginData
      );

      console.log(
        "✅ [TokenGenerator] Google login successful:",
        response.data
      );

      // Save the token
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: response.data.id,
            email: response.data.email,
            fullName: response.data.fullName,
            token: response.data.token,
            role: role,
          })
        );
      }

      alert(
        `✅ User created and logged in via Google!\nRole: ${role}\nEmail: ${
          userCreds.email
        }\nToken: ${response.data.token.substring(0, 50)}...`
      );

      // Refresh page to apply new token
      window.location.reload();
    } catch (error) {
      console.error(
        `❌ [TokenGenerator] Google login failed for ${role}:`,
        error
      );
      alert(
        `❌ Google login failed for ${role}:\n${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  // Create new user with correct password pattern (legacy method)
  const createNewUser = async (role) => {
    const userCreds = REAL_TEST_USERS[role];
    if (!userCreds) {
      alert(`❌ No credentials found for role: ${role}`);
      return;
    }

    try {
      console.log(`👤 [TokenGenerator] Creating new ${role} user:`, userCreds);

      const userData = {
        fullName: userCreds.fullName,
        gender: "MALE",
        dateOfBirth: "1990-01-01",
        email: userCreds.email,
        phone: "0901234567", // Valid Vietnamese phone number
        address: "Test Address",
        password: userCreds.password,
      };

      const response = await axiosClient.post("/api/users", userData);

      console.log(
        "✅ [TokenGenerator] User created successfully:",
        response.data
      );

      alert(
        `✅ User created successfully!\nRole: ${role}\nEmail: ${userCreds.email}\n\n⚠️ Note: Email verification required.\nTry "Create via Google Login" for instant access!`
      );
    } catch (error) {
      console.error(
        `❌ [TokenGenerator] User creation failed for ${role}:`,
        error
      );

      if (
        error.response?.status === 400 &&
        error.response?.data?.message?.includes("Email đã tồn tại")
      ) {
        alert(`ℹ️ User already exists!\nTrying Google login instead...`);
        // Try Google login if user already exists
        createUserWithGoogleLogin(role);
      } else {
        alert(
          `❌ User creation failed for ${role}:\n${
            error.response?.data?.message || error.message
          }`
        );
      }
    }
  };

  // Real login with backend API
  const realLogin = async (role) => {
    const userCreds = REAL_TEST_USERS[role];
    if (!userCreds) {
      alert(`❌ No credentials found for role: ${role}`);
      return;
    }

    try {
      console.log(
        `🔐 [TokenGenerator] Attempting real login for ${role}:`,
        userCreds
      );

      const response = await apiAuth.login(userCreds.email, userCreds.password);

      console.log("✅ [TokenGenerator] Real login successful:", response);
      alert(
        `✅ Real login successful!\nRole: ${role}\nEmail: ${
          userCreds.email
        }\nToken: ${response.token.substring(0, 50)}...`
      );

      // Refresh page to apply new token
      window.location.reload();
    } catch (error) {
      console.error(
        `❌ [TokenGenerator] Real login failed for ${role}:`,
        error
      );

      if (
        error.response?.status === 403 &&
        error.response?.data?.message?.includes(
          "Email của bạn chưa được xác thực"
        )
      ) {
        alert(
          `⚠️ Email not verified!\nCreating new user for ${role} with verified email...`
        );
        // Try to create new user if email verification is required
        createNewUser(role);
      } else {
        alert(
          `❌ Real login failed for ${role}:\n${
            error.response?.data?.message || error.message
          }`
        );
      }
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>🔑 Token Generator & Manager</h2>

      {/* Real Login Section */}
      <div
        style={{
          marginBottom: "30px",
          padding: "15px",
          border: "2px solid #52c41a",
          borderRadius: "5px",
          backgroundColor: "#f6ffed",
        }}
      >
        <h3>🔐 Real Backend Login (Recommended)</h3>
        <p>Login with real backend API to get valid JWT tokens:</p>

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            marginBottom: "10px",
          }}
        >
          {Object.keys(REAL_TEST_USERS).map((role) => (
            <button
              key={role}
              onClick={() => realLogin(role)}
              style={{
                padding: "10px 20px",
                backgroundColor: "#52c41a",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Login as {role}
            </button>
          ))}
        </div>

        <div style={{ fontSize: "12px", color: "#666" }}>
          <strong>Credentials:</strong>
          <br />
          {Object.entries(REAL_TEST_USERS).map(([role, creds]) => (
            <div key={role}>
              {role}: {creds.email} / {creds.password}
            </div>
          ))}
        </div>
      </div>

      {/* Create New Users Section */}
      <div
        style={{
          marginBottom: "30px",
          padding: "15px",
          border: "2px solid #52c41a",
          borderRadius: "5px",
          backgroundColor: "#f6ffed",
        }}
      >
        <h3>🚀 Instant Login via Google (Recommended)</h3>
        <p>
          Create users and login instantly via Google OAuth (bypasses email
          verification):
        </p>

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            marginBottom: "10px",
          }}
        >
          {Object.keys(REAL_TEST_USERS).map((role) => (
            <button
              key={role}
              onClick={() => createUserWithGoogleLogin(role)}
              style={{
                padding: "10px 20px",
                backgroundColor: "#52c41a",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              🔐 Instant {role} Login
            </button>
          ))}
        </div>

        <div style={{ fontSize: "12px", color: "#666" }}>
          <strong>✅ Advantages:</strong> No email verification needed, instant
          JWT token, ready to use!
        </div>
      </div>

      {/* Create New Users Section */}
      <div
        style={{
          marginBottom: "30px",
          padding: "15px",
          border: "2px solid #faad14",
          borderRadius: "5px",
          backgroundColor: "#fffbe6",
        }}
      >
        <h3>👤 Manual User Creation (Legacy)</h3>
        <p>
          Create new users with correct password patterns (requires email
          verification):
        </p>

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            marginBottom: "10px",
          }}
        >
          {Object.keys(REAL_TEST_USERS).map((role) => (
            <button
              key={role}
              onClick={() => createNewUser(role)}
              style={{
                padding: "10px 20px",
                backgroundColor: "#faad14",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Create {role} User
            </button>
          ))}
        </div>

        <div style={{ fontSize: "12px", color: "#666" }}>
          <strong>⚠️ Note:</strong> Requires email verification before login.
          <br />
          <strong>Password Pattern:</strong> Must have 1 uppercase, 1 lowercase,
          1 digit, min 8 chars
        </div>
      </div>

      {/* Quick Test Tokens */}
      <div
        style={{
          marginBottom: "30px",
          padding: "15px",
          border: "1px solid #ddd",
          borderRadius: "5px",
        }}
      >
        <h3>🚀 Mock Test Tokens (Fallback)</h3>
        <p>
          Click to set mock tokens for testing (may not work with real backend):
        </p>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {Object.keys(TEST_TOKENS).map((role) => (
            <button
              key={role}
              onClick={() => setTestToken(role)}
              style={{
                padding: "10px 20px",
                backgroundColor: "#1890ff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Set Mock {role} Token
            </button>
          ))}
        </div>
      </div>

      {/* Custom Token Generator */}
      <div
        style={{
          marginBottom: "30px",
          padding: "15px",
          border: "1px solid #ddd",
          borderRadius: "5px",
        }}
      >
        <h3>⚙️ Custom Token Generator</h3>

        <div style={{ display: "grid", gap: "10px", maxWidth: "400px" }}>
          <div>
            <label>Email:</label>
            <input
              type="email"
              value={tokenData.email}
              onChange={(e) =>
                setTokenData({ ...tokenData, email: e.target.value })
              }
              style={{ width: "100%", padding: "5px", marginLeft: "10px" }}
            />
          </div>

          <div>
            <label>Role:</label>
            <select
              value={tokenData.role}
              onChange={(e) =>
                setTokenData({ ...tokenData, role: e.target.value })
              }
              style={{ width: "100%", padding: "5px", marginLeft: "10px" }}
            >
              <option value="ADMIN">ADMIN</option>
              <option value="MANAGER">MANAGER</option>
              <option value="DOCTOR">DOCTOR</option>
              <option value="CUSTOMER">CUSTOMER</option>
            </select>
          </div>

          <div>
            <label>Full Name:</label>
            <input
              type="text"
              value={tokenData.fullName}
              onChange={(e) =>
                setTokenData({ ...tokenData, fullName: e.target.value })
              }
              style={{ width: "100%", padding: "5px", marginLeft: "10px" }}
            />
          </div>

          <div>
            <label>User ID:</label>
            <input
              type="number"
              value={tokenData.userId}
              onChange={(e) =>
                setTokenData({ ...tokenData, userId: parseInt(e.target.value) })
              }
              style={{ width: "100%", padding: "5px", marginLeft: "10px" }}
            />
          </div>

          <button
            onClick={setCustomToken}
            style={{
              padding: "10px",
              backgroundColor: "#52c41a",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              marginTop: "10px",
            }}
          >
            Generate & Set Custom Token
          </button>
        </div>
      </div>

      {/* Token Management */}
      <div
        style={{
          padding: "15px",
          border: "1px solid #ddd",
          borderRadius: "5px",
        }}
      >
        <h3>🛠️ Token Management</h3>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={checkCurrentToken}
            style={{
              padding: "10px 20px",
              backgroundColor: "#722ed1",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Check Current Token
          </button>

          <button
            onClick={clearTokens}
            style={{
              padding: "10px 20px",
              backgroundColor: "#ff4d4f",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Clear All Tokens
          </button>

          <button
            onClick={() => (window.location.href = "/token-debug")}
            style={{
              padding: "10px 20px",
              backgroundColor: "#faad14",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Go to Token Debug
          </button>

          <button
            onClick={() => (window.location.href = "/profile-test")}
            style={{
              padding: "10px 20px",
              backgroundColor: "#13c2c2",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Test Profile Page
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div
        style={{
          marginTop: "30px",
          padding: "15px",
          backgroundColor: "#f6ffed",
          border: "1px solid #b7eb8f",
          borderRadius: "5px",
        }}
      >
        <h3>📋 Instructions</h3>
        <ol>
          <li>
            Use "Quick Test Tokens" to quickly set predefined tokens for testing
          </li>
          <li>
            Use "Custom Token Generator" to create tokens with specific user
            data
          </li>
          <li>Click "Check Current Token" to see what's currently stored</li>
          <li>Click "Clear All Tokens" to remove authentication data</li>
          <li>Go to "/token-debug" to test API endpoints with current token</li>
          <li>Go to "/profile-test" to test the profile page functionality</li>
        </ol>

        <p>
          <strong>Note:</strong> These are mock tokens for testing. In
          production, tokens should only come from successful login API calls.
        </p>
      </div>
    </div>
  );
};

export default TokenGenerator;
