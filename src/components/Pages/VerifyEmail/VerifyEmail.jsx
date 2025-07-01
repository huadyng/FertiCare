import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import apiVerification from "../../../api/apiVerification";
import "../../common/FormStyles.css";

function VerifyEmail() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showTestLogin, setShowTestLogin] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showResendOption, setShowResendOption] = useState(false);
  const hasRun = useRef(false);

  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Extract token và email từ URL params
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get("token");
  const emailParam = searchParams.get("email");

  // ✅ Get email từ location state hoặc URL
  const userEmail = location.state?.email || emailParam;

  useEffect(() => {
    const verifyEmailToken = async () => {
      // ✅ Prevent double execution in React StrictMode
      if (hasRun.current) {
        console.log("🛑 [VerifyEmail] Already ran, skipping...");
        return;
      }
      hasRun.current = true;

      if (!token) {
        setMessage(
          "❌ Đường link không hợp lệ. Vui lòng kiểm tra lại email của bạn."
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setMessage("Đang xác thực email của bạn...");

        // ✅ Test backend connection trước
        const connectionOk = await apiVerification.testConnection();

        if (!connectionOk) {
          throw new Error("Không thể kết nối đến server");
        }

        // ✅ Smart verification
        const response = await apiVerification.smartVerifyEmail(
          token,
          userEmail
        );

        // ✅ Handle successful verification
        if (response?.data) {
          console.log(
            "🔍 [VerifyEmail] Checking response data:",
            response.data
          );

          // ✅ Only redirect if truly successful
          const isSuccessful =
            response.data.success === true ||
            response.data.verified === true ||
            (response.data.message &&
              response.data.message.includes("thành công"));

          if (isSuccessful) {
            console.log(
              "🎉 [VerifyEmail] Verification confirmed successful, redirecting..."
            );
            // ✅ Set redirecting state and message
            setIsRedirecting(true);
            setMessage(
              "✅ Xác thực thành công! Đang chuyển đến trang đăng nhập..."
            );

            // ✅ Small delay to show success message before redirect
            setTimeout(() => {
              navigate("/login", {
                state: {
                  emailVerified: true,
                  message:
                    "🎉 Email đã được xác thực thành công! Bạn có thể đăng nhập ngay bây giờ.",
                  userEmail: userEmail,
                },
              });
            }, 800); // 0.8 second delay

            return; // Exit early to avoid setting success state
          } else {
            console.log(
              "❌ [VerifyEmail] Response data does not indicate success"
            );
            throw new Error("Verification response không hợp lệ");
          }
        } else {
          throw new Error("Không nhận được response data");
        }
      } catch (err) {
        console.error("❌ [VerifyEmail] Verification failed:", err);

        // ✅ Detailed error handling
        if (err.response?.data?.suggestTestLogin) {
          setMessage(
            "⚠️ Không thể xác nhận qua API nhưng email có thể đã được xác thực."
          );
          setShowTestLogin(true);
        } else if (err.response?.status === 400) {
          const errorData = err.response.data;
          const errorMessage =
            typeof errorData === "string"
              ? errorData
              : errorData?.message || "";

          if (errorMessage.includes("Token không hợp lệ")) {
            setMessage(
              "❌ Link xác thực không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra email mới nhất hoặc yêu cầu gửi lại email xác thực."
            );
            setShowResendOption(true);
          } else if (
            errorMessage.includes("đã được xác thực") ||
            errorMessage.includes("already verified")
          ) {
            setMessage(
              "✅ Email này đã được xác thực trước đó. Bạn có thể đăng nhập ngay."
            );
            setShowTestLogin(true);
          } else {
            setMessage(
              `❌ Lỗi xác thực: ${errorMessage || "Token không hợp lệ"}`
            );
          }
        } else if (err.response?.status === 410) {
          setMessage(
            "✅ Link xác thực đã được sử dụng trước đó. Email của bạn đã được xác thực thành công."
          );
          setShowTestLogin(true);
        } else {
          setMessage(
            "❌ Có lỗi xảy ra khi xác thực email. Vui lòng thử lại hoặc liên hệ hỗ trợ."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    verifyEmailToken();
  }, [token]);

  // ✅ Handle test login
  const handleTestLogin = () => {
    navigate("/login", {
      state: {
        message: "Hãy thử đăng nhập để kiểm tra trạng thái tài khoản.",
        email: userEmail,
      },
    });
  };

  // ✅ Handle resend verification email
  const handleResendVerification = async () => {
    if (!userEmail) {
      alert("Không tìm thấy email. Vui lòng đăng ký lại.");
      return;
    }

    try {
      setLoading(true);
      setMessage("Đang gửi lại email xác thực...");

      await apiVerification.resendVerificationEmail(userEmail);

      setMessage(
        "✅ Email xác thực mới đã được gửi! Vui lòng kiểm tra hộp thư và spam folder."
      );
      setShowResendOption(false);
    } catch (error) {
      console.error("❌ [VerifyEmail] Resend failed:", error);
      setMessage(
        "❌ Không thể gửi lại email xác thực. Vui lòng thử lại sau hoặc liên hệ hỗ trợ."
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ If redirecting, show minimal UI
  if (isRedirecting) {
    return (
      <div className="form-container">
        <div
          className="form-wrapper"
          style={{ maxWidth: "500px", margin: "0 auto" }}
        >
          <div
            className="form-content"
            style={{ textAlign: "center", padding: "40px 30px" }}
          >
            <div
              style={{
                fontSize: "60px",
                marginBottom: "20px",
                animation: "pulse 2s infinite",
              }}
            >
              ✅
            </div>
            <h1
              style={{
                fontSize: "24px",
                color: "#28a745",
                marginBottom: "20px",
                fontWeight: "600",
              }}
            >
              Xác Thực Thành Công!
            </h1>
            <p style={{ fontSize: "16px", color: "#666", margin: "0" }}>
              {message}
            </p>
            <div style={{ marginTop: "20px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  border: "4px solid #f3f3f3",
                  borderTop: "4px solid #28a745",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  margin: "0 auto",
                }}
              ></div>
            </div>
          </div>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="form-container">
      <div
        className="form-wrapper"
        style={{ maxWidth: "500px", margin: "0 auto" }}
      >
        <div
          className="form-content"
          style={{ textAlign: "center", padding: "40px 30px" }}
        >
          {/* ✅ Header */}
          <div style={{ marginBottom: "40px" }}>
            <div
              style={{
                fontSize: "60px",
                marginBottom: "20px",
                animation: loading ? "pulse 2s infinite" : "none",
              }}
            >
              {loading ? "⏳" : isSuccess ? "✅" : "❌"}
            </div>
            <h1
              style={{
                fontSize: "28px",
                color: "#333",
                marginBottom: "10px",
                fontWeight: "600",
              }}
            >
              Xác Thực Email
            </h1>
          </div>

          {/* ✅ Loading State */}
          {loading && (
            <div style={{ marginBottom: "30px" }}>
              <p
                style={{
                  fontSize: "18px",
                  color: "#666",
                  margin: "0",
                }}
              >
                {message}
              </p>
            </div>
          )}

          {/* ✅ Success State */}
          {!loading && isSuccess && (
            <div style={{ marginBottom: "40px" }}>
              <h2
                style={{
                  fontSize: "24px",
                  color: "#28a745",
                  marginBottom: "15px",
                  fontWeight: "500",
                }}
              >
                Thành Công!
              </h2>
              <p
                style={{
                  fontSize: "18px",
                  color: "#333",
                  lineHeight: "1.5",
                  marginBottom: "0",
                }}
              >
                Tài khoản của bạn đã được kích hoạt. <br />
                Bạn có thể đăng nhập và sử dụng dịch vụ ngay bây giờ.
              </p>
            </div>
          )}

          {/* ✅ Error State */}
          {!loading && !isSuccess && (
            <div style={{ marginBottom: "40px" }}>
              <h2
                style={{
                  fontSize: "22px",
                  color: "#dc3545",
                  marginBottom: "15px",
                  fontWeight: "500",
                }}
              >
                {showTestLogin ? "Cần Kiểm Tra" : "Có Lỗi Xảy Ra"}
              </h2>
              <p
                style={{
                  fontSize: "16px",
                  color: "#333",
                  lineHeight: "1.5",
                  marginBottom: "0",
                }}
              >
                {message}
              </p>
            </div>
          )}

          {/* ✅ Action Buttons */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "15px",
              alignItems: "center",
            }}
          >
            {/* Main Action Button */}
            {!loading && (
              <>
                {isSuccess ? (
                  <Link
                    to="/login"
                    style={{
                      display: "inline-block",
                      backgroundColor: "#28a745",
                      color: "white",
                      padding: "15px 40px",
                      borderRadius: "8px",
                      textDecoration: "none",
                      fontSize: "18px",
                      fontWeight: "500",
                      minWidth: "200px",
                      textAlign: "center",
                      transition: "background-color 0.3s",
                    }}
                    onMouseOver={(e) =>
                      (e.target.style.backgroundColor = "#218838")
                    }
                    onMouseOut={(e) =>
                      (e.target.style.backgroundColor = "#28a745")
                    }
                  >
                    🚀 Đăng Nhập Ngay
                  </Link>
                ) : showTestLogin ? (
                  <button
                    onClick={handleTestLogin}
                    style={{
                      backgroundColor: "#007bff",
                      color: "white",
                      border: "none",
                      padding: "15px 40px",
                      borderRadius: "8px",
                      fontSize: "18px",
                      fontWeight: "500",
                      cursor: "pointer",
                      minWidth: "200px",
                      transition: "background-color 0.3s",
                    }}
                    onMouseOver={(e) =>
                      (e.target.style.backgroundColor = "#0056b3")
                    }
                    onMouseOut={(e) =>
                      (e.target.style.backgroundColor = "#007bff")
                    }
                  >
                    🧪 Kiểm Tra Đăng Nhập
                  </button>
                ) : showResendOption ? (
                  <button
                    onClick={handleResendVerification}
                    style={{
                      backgroundColor: "#28a745",
                      color: "white",
                      border: "none",
                      padding: "15px 40px",
                      borderRadius: "8px",
                      fontSize: "18px",
                      fontWeight: "500",
                      cursor: "pointer",
                      minWidth: "200px",
                      transition: "background-color 0.3s",
                    }}
                    onMouseOver={(e) =>
                      (e.target.style.backgroundColor = "#218838")
                    }
                    onMouseOut={(e) =>
                      (e.target.style.backgroundColor = "#28a745")
                    }
                  >
                    📧 Gửi Lại Email Xác Thực
                  </button>
                ) : (
                  <Link
                    to="/register"
                    style={{
                      display: "inline-block",
                      backgroundColor: "#6c757d",
                      color: "white",
                      padding: "15px 40px",
                      borderRadius: "8px",
                      textDecoration: "none",
                      fontSize: "18px",
                      fontWeight: "500",
                      minWidth: "200px",
                      textAlign: "center",
                      transition: "background-color 0.3s",
                    }}
                    onMouseOver={(e) =>
                      (e.target.style.backgroundColor = "#545b62")
                    }
                    onMouseOut={(e) =>
                      (e.target.style.backgroundColor = "#6c757d")
                    }
                  >
                    📝 Đăng Ký Lại
                  </Link>
                )}

                {/* Secondary Action */}
                {showResendOption && (
                  <Link
                    to="/register"
                    style={{
                      color: "#6c757d",
                      textDecoration: "none",
                      fontSize: "16px",
                      padding: "10px",
                      transition: "color 0.3s",
                    }}
                    onMouseOver={(e) => (e.target.style.color = "#495057")}
                    onMouseOut={(e) => (e.target.style.color = "#6c757d")}
                  >
                    📝 Đăng Ký Lại
                  </Link>
                )}

                <Link
                  to="/"
                  style={{
                    color: "#007bff",
                    textDecoration: "none",
                    fontSize: "16px",
                    padding: "10px",
                    transition: "color 0.3s",
                  }}
                  onMouseOver={(e) => (e.target.style.color = "#0056b3")}
                  onMouseOut={(e) => (e.target.style.color = "#007bff")}
                >
                  🏠 Về Trang Chủ
                </Link>
              </>
            )}
          </div>

          {/* ✅ Support Info (Only if error) */}
          {!loading && !isSuccess && !showTestLogin && (
            <div
              style={{
                marginTop: "40px",
                padding: "20px",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
                border: "1px solid #dee2e6",
              }}
            >
              <h4
                style={{
                  fontSize: "16px",
                  color: "#495057",
                  marginBottom: "10px",
                }}
              >
                💬 Cần Hỗ Trợ?
              </h4>
              <p
                style={{
                  fontSize: "14px",
                  color: "#6c757d",
                  margin: "0",
                  lineHeight: "1.4",
                }}
              >
                Liên hệ: <strong>admin@fertility.com</strong> <br />
                Hoặc gọi: <strong>0123-456-789</strong>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ✅ CSS Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .form-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        
        .form-wrapper {
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          width: 100%;
        }
      `}</style>
    </div>
  );
}

export default VerifyEmail;
