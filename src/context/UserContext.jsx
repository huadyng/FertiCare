//UserContext để quản lý trạng thái đăng nhập

import { createContext, useState, useEffect } from "react";

//Tạo Context
export const UserContext = createContext();

//Provider để bọc toàn bộ ứng dụng
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  //Kiểm tra nếu có thông tin người dùng trong localStorage khi sử dụng
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);
  const loginWithGoogle = (googleUser) => {
    const userData = {
      name: googleUser.name,
      email: googleUser.email,
      avatar: googleUser.avatar,
    };
    setUser(googleUser);
    localStorage.setItem("user", JSON.stringify(googleUser));
  };
  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };
  return (
    <UserContext.Provider value={{ user, setUser, loginWithGoogle, logout }}>
      {children}
    </UserContext.Provider>
  );
};
