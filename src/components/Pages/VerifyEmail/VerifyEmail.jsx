// VerifyEmail

import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState("Đang xác thực...");
  const token = searchParams.get("token");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const res = await axios.get(
          `/api/notifications/verify-email?token=${token}`
        );
        setMessage(res.data.message || "✅ Xác thực email thành công!");
      } catch (err) {
        setMessage("❌ Token không hợp lệ hoặc đã hết hạn.");
      }
    };

    if (token) {
      verifyEmail();
    } else {
      setMessage("❌ Không tìm thấy token xác thực.");
    }
  }, [token]);

  return (
    <div className="container text-center mt-5">
      <h2>Xác thực Email</h2>
      <p>{message}</p>
    </div>
  );
}
