import React from "react";

export default function Home() {
  const user = localStorage.getItem("user");
  const googleToken = localStorage.getItem("googleToken");

  return (
    <div style={{ padding: "50px", textAlign: "center" }}>
      <h1>🎉 Chào mừng bạn đến trang Home!</h1>
      {user && <p>Đăng nhập bằng tài khoản thường: {JSON.parse(user).email}</p>}
      {googleToken && <p>Đăng nhập bằng Google (token JWT đã lưu)</p>}
    </div>
  );
}
