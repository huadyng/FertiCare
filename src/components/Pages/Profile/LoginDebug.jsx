import React, { useState, useContext } from "react";
import { UserContext } from "../../../context/UserContext";
import apiLogin from "../../../api/apiLogin";
import apiProfile from "../../../api/apiProfile";

const LoginDebug = () => {
  const { user, login, logout } = useContext(UserContext);
  const [normalLoginData, setNormalLoginData] = useState({
    email: "customer@example.com",
    password: "Customer123", // Updated to meet password pattern
  });
  const [debugResults, setDebugResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testNormalLogin = async () => {
    setLoading(true);
    try {
      console.log("🔍 [LoginDebug] Testing normal login...");

      const loginResponse = await apiLogin.login(
        normalLoginData.email,
        normalLoginData.password
      );
      console.log("✅ [LoginDebug] Normal login response:", loginResponse);

      // Test profile access immediately after login
      login(loginResponse);

      // Wait a bit for context to update
      setTimeout(async () => {
        try {
          const profileResponse = await apiProfile.getMyProfile();
          console.log(
            "✅ [LoginDebug] Profile after normal login:",
            profileResponse
          );

          setDebugResults((prev) => ({
            ...prev,
            normalLogin: {
              loginData: loginResponse,
              profileData: profileResponse,
              success: true,
            },
          }));
        } catch (profileError) {
          console.error(
            "❌ [LoginDebug] Profile error after normal login:",
            profileError
          );
          setDebugResults((prev) => ({
            ...prev,
            normalLogin: {
              loginData: loginResponse,
              profileError: profileError.response?.data || profileError.message,
              success: false,
            },
          }));
        }
      }, 1000);
    } catch (error) {
      console.error("❌ [LoginDebug] Normal login error:", error);
      setDebugResults((prev) => ({
        ...prev,
        normalLogin: {
          error: error.response?.data || error.message,
          success: false,
        },
      }));
    } finally {
      setLoading(false);
    }
  };

  const testGoogleLogin = async () => {
    setLoading(true);
    try {
      console.log("🔍 [LoginDebug] Testing Google login...");

      // Simulate Google login data - use same email as normal login for comparison
      const googleData = {
        email: "customer@example.com",
        name: "Customer A",
        picture: "https://example.com/avatar.jpg",
        credential: "mock_google_token",
      };

      const loginResponse = await apiLogin.googleLogin(googleData);
      console.log("✅ [LoginDebug] Google login response:", loginResponse);

      // Test profile access immediately after login
      login(loginResponse);

      // Wait a bit for context to update
      setTimeout(async () => {
        try {
          const profileResponse = await apiProfile.getMyProfile();
          console.log(
            "✅ [LoginDebug] Profile after Google login:",
            profileResponse
          );

          setDebugResults((prev) => ({
            ...prev,
            googleLogin: {
              loginData: loginResponse,
              profileData: profileResponse,
              success: true,
            },
          }));
        } catch (profileError) {
          console.error(
            "❌ [LoginDebug] Profile error after Google login:",
            profileError
          );
          setDebugResults((prev) => ({
            ...prev,
            googleLogin: {
              loginData: loginResponse,
              profileError: profileError.response?.data || profileError.message,
              success: false,
            },
          }));
        }
      }, 1000);
    } catch (error) {
      console.error("❌ [LoginDebug] Google login error:", error);
      setDebugResults((prev) => ({
        ...prev,
        googleLogin: {
          error: error.response?.data || error.message,
          success: false,
        },
      }));
    } finally {
      setLoading(false);
    }
  };

  const clearDebug = () => {
    setDebugResults({});
    logout();
  };

  const createTestUser = async () => {
    setLoading(true);
    try {
      console.log("🔍 [LoginDebug] Creating test user...");

      // Generate unique email and phone to avoid conflicts
      const timestamp = Date.now();
      const uniqueEmail = `testuser${timestamp}@example.com`;
      const uniquePhone = `090${timestamp.toString().slice(-7)}`; // Generate unique phone

      const testUserData = {
        fullName: "Test Customer User",
        gender: "MALE",
        dateOfBirth: "1990-01-01",
        email: uniqueEmail,
        phone: uniquePhone,
        address: "Test Address",
        password: "TestPass123", // Meets pattern: lowercase + uppercase + digit + 8+ chars
      };

      const response = await fetch("http://localhost:8080/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testUserData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("✅ [LoginDebug] Test user created:", result);

        // Auto verify email for testing
        await verifyUserEmail(result.userId || result.id);

        // Update login data to use new user
        setNormalLoginData({
          email: uniqueEmail,
          password: "TestPass123",
        });

        setDebugResults((prev) => ({
          ...prev,
          userCreation: {
            success: true,
            userData: result,
            email: uniqueEmail,
          },
        }));
      } else {
        const error = await response.json();
        console.error("❌ [LoginDebug] User creation failed:", error);
        setDebugResults((prev) => ({
          ...prev,
          userCreation: {
            success: false,
            error: error,
          },
        }));
      }
    } catch (error) {
      console.error("❌ [LoginDebug] User creation error:", error);
      setDebugResults((prev) => ({
        ...prev,
        userCreation: {
          success: false,
          error: error.message,
        },
      }));
    } finally {
      setLoading(false);
    }
  };

  const verifyUserEmail = async (userId) => {
    try {
      console.log("🔍 [LoginDebug] Verifying email for user:", userId);

      // Direct database update to set email as verified
      const response = await fetch(
        `http://localhost:8080/api/users/${userId}/verify-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        console.log("✅ [LoginDebug] Email verified successfully");
      } else {
        console.log(
          "⚠️ [LoginDebug] Email verification endpoint not found, user may need manual verification"
        );
      }
    } catch (error) {
      console.log("⚠️ [LoginDebug] Email verification failed:", error.message);
    }
  };

  const forceVerifyEmail = async () => {
    const userEmail = debugResults.userCreation?.userData?.email;
    if (!userEmail) {
      alert("Vui lòng tạo user trước!");
      return;
    }

    setLoading(true);
    try {
      console.log("🔍 [LoginDebug] Force verifying email:", userEmail);

      // Try to verify via notification endpoint (as seen in backend logs)
      const response = await fetch(
        "http://localhost:8080/api/notifications/verify-email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: userEmail,
            token: "FORCE_VERIFY_TOKEN", // Mock token for testing
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log("✅ [LoginDebug] Email force verified:", result);

        setDebugResults((prev) => ({
          ...prev,
          emailVerification: {
            success: true,
            message: "Email verified successfully",
            email: userEmail,
          },
        }));

        alert("✅ Email đã được verify! Bây giờ có thể login bình thường.");
      } else {
        const error = await response.json();
        console.error("❌ [LoginDebug] Force verify failed:", error);

        setDebugResults((prev) => ({
          ...prev,
          emailVerification: {
            success: false,
            error: error,
            email: userEmail,
          },
        }));
      }
    } catch (error) {
      console.error("❌ [LoginDebug] Force verify error:", error);
      setDebugResults((prev) => ({
        ...prev,
        emailVerification: {
          success: false,
          error: error.message,
          email: userEmail,
        },
      }));
    } finally {
      setLoading(false);
    }
  };

  const loginViaGoogle = async () => {
    const userData = debugResults.userCreation?.userData;
    if (!userData) {
      alert("Vui lòng tạo user trước!");
      return;
    }

    setLoading(true);
    try {
      console.log(
        "🔍 [LoginDebug] Login via Google bypass for:",
        userData.email
      );

      // Use Google login with the created user's data
      const googleData = {
        email: userData.email,
        name: userData.fullName,
        picture: userData.avatarUrl,
        credential: "mock_google_token_for_" + userData.email,
      };

      const loginResponse = await apiLogin.googleLogin(googleData);
      console.log(
        "✅ [LoginDebug] Google bypass login response:",
        loginResponse
      );

      // Test profile access immediately after login
      login(loginResponse);

      // Wait a bit for context to update
      setTimeout(async () => {
        try {
          const profileResponse = await apiProfile.getMyProfile();
          console.log(
            "✅ [LoginDebug] Profile after Google bypass:",
            profileResponse
          );

          setDebugResults((prev) => ({
            ...prev,
            googleBypass: {
              loginData: loginResponse,
              profileData: profileResponse,
              success: true,
              message: "✅ Đăng nhập thành công qua Google bypass!",
            },
          }));

          alert("🎉 Đăng nhập thành công! Bây giờ có thể update profile!");
        } catch (profileError) {
          console.error(
            "❌ [LoginDebug] Profile error after Google bypass:",
            profileError
          );
          setDebugResults((prev) => ({
            ...prev,
            googleBypass: {
              loginData: loginResponse,
              profileError: profileError.response?.data || profileError.message,
              success: false,
            },
          }));
        }
      }, 1000);
    } catch (error) {
      console.error("❌ [LoginDebug] Google bypass error:", error);
      setDebugResults((prev) => ({
        ...prev,
        googleBypass: {
          error: error.response?.data || error.message,
          success: false,
        },
      }));
    } finally {
      setLoading(false);
    }
  };

  const testCurrentProfile = async () => {
    if (!user) {
      alert("Vui lòng đăng nhập trước");
      return;
    }

    try {
      const profileData = await apiProfile.getMyProfile();
      console.log("✅ [LoginDebug] Current profile:", profileData);
      setDebugResults((prev) => ({
        ...prev,
        currentProfile: profileData,
      }));
    } catch (error) {
      console.error("❌ [LoginDebug] Current profile error:", error);
      setDebugResults((prev) => ({
        ...prev,
        currentProfileError: error.response?.data || error.message,
      }));
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h2>🔍 Login Debug Tool</h2>

      <div style={{ marginBottom: "20px" }}>
        <h3>Current User Context:</h3>
        <pre
          style={{ background: "#f5f5f5", padding: "10px", fontSize: "12px" }}
        >
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3>Normal Login Test:</h3>
        <div style={{ marginBottom: "10px", fontSize: "12px", color: "#666" }}>
          <p>📋 Available test users:</p>
          <ul>
            <li>
              customer@example.com / cust123 (may need email verification)
            </li>
            <li>admin@example.com / admin123 (may need email verification)</li>
            <li>
              doctor@example.com / doctor123 (may need email verification)
            </li>
            <li>
              manager@example.com / manager123 (may need email verification)
            </li>
          </ul>
          <p>⚠️ Note: Old passwords may not meet new validation pattern</p>
        </div>
        <div style={{ marginBottom: "10px" }}>
          <input
            type="email"
            placeholder="Email"
            value={normalLoginData.email}
            onChange={(e) =>
              setNormalLoginData((prev) => ({ ...prev, email: e.target.value }))
            }
            style={{ marginRight: "10px", padding: "5px", width: "200px" }}
          />
          <input
            type="password"
            placeholder="Password"
            value={normalLoginData.password}
            onChange={(e) =>
              setNormalLoginData((prev) => ({
                ...prev,
                password: e.target.value,
              }))
            }
            style={{ marginRight: "10px", padding: "5px", width: "150px" }}
          />
        </div>
        <button
          onClick={createTestUser}
          disabled={loading}
          style={{
            padding: "10px 20px",
            marginRight: "10px",
            backgroundColor: "#28a745",
            color: "white",
          }}
        >
          Create Test User
        </button>
        <button
          onClick={forceVerifyEmail}
          disabled={loading || !debugResults.userCreation?.userData?.email}
          style={{
            padding: "10px 20px",
            marginRight: "10px",
            backgroundColor: "#17a2b8",
            color: "white",
          }}
        >
          Force Verify Email
        </button>
        <button
          onClick={loginViaGoogle}
          disabled={loading || !debugResults.userCreation?.userData?.email}
          style={{
            padding: "10px 20px",
            marginRight: "10px",
            backgroundColor: "#dc3545",
            color: "white",
          }}
        >
          Login via Google (Bypass)
        </button>
        <button
          onClick={() => {
            // Test with existing user from database
            setNormalLoginData({
              email: "customer@example.com",
              password: "cust123",
            });
          }}
          disabled={loading}
          style={{
            padding: "10px 20px",
            marginRight: "10px",
            backgroundColor: "#ffc107",
            color: "black",
          }}
        >
          Use Existing User
        </button>
        <button
          onClick={testNormalLogin}
          disabled={loading}
          style={{ padding: "10px 20px", marginRight: "10px" }}
        >
          Test Normal Login
        </button>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3>Google Login Test:</h3>
        <button
          onClick={testGoogleLogin}
          disabled={loading}
          style={{ padding: "10px 20px", marginRight: "10px" }}
        >
          Test Google Login
        </button>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={testCurrentProfile}
          disabled={loading || !user}
          style={{ padding: "10px 20px", marginRight: "10px" }}
        >
          Test Current Profile
        </button>
        <button
          onClick={clearDebug}
          style={{
            padding: "10px 20px",
            backgroundColor: "#dc3545",
            color: "white",
          }}
        >
          Clear & Logout
        </button>
      </div>

      {loading && <p>⏳ Loading...</p>}

      <div style={{ marginTop: "20px" }}>
        <h3>Debug Results:</h3>
        <pre
          style={{
            background: "#f5f5f5",
            padding: "10px",
            fontSize: "12px",
            maxHeight: "400px",
            overflow: "auto",
          }}
        >
          {JSON.stringify(debugResults, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default LoginDebug;
