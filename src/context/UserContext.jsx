//UserContext để quản lý trạng thái đăng nhập

import { createContext, useState, useEffect } from "react";

//Tạo Context
export const UserContext = createContext();

//Provider để bọc toàn bộ ứng dụng
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  //Kiểm tra nếu có thông tin người dùng trong localStorage khi sử dụng
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsLoggedIn(true);
    }
  }, []);
  const loginWithGoogle = (googleUser) => {
    const userData = {
      name: googleUser.name,
      email: googleUser.email,
    };
    setUser(userData);
    setIsLoggedIn(true);
    localStorage.setItem("user", JSON.stringify(userData));
  };
  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setIsLoggedIn(false);
  };
  return (
    <UserContext.Provider
      value={{ user, setUser, isLoggedIn, loginWithGoogle, logout }}
    >
      {children}
    </UserContext.Provider>
  );
};
