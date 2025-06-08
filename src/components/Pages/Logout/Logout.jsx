import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../../../context/UserContext";

export default function Logout() {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  const handleLogout = () => {
    localStorage.removeItem("user"); // Xóa dữ liệu đăng nhập
    setUser(null); // Cập nhật trạng thái đăng nhập
    navigate("/login"); // Chuyển hướng về trang đăng nhập
  };

  return (
    <button onClick={handleLogout} className="btn-logout">
      Đăng xuất
    </button>
  );
}
