import { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    try {
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error("❌ Lỗi parse user từ localStorage:", error);
      localStorage.removeItem("user"); // dọn sạch dữ liệu lỗi
    }
  }, []);

  const login = (userData) => {
    const dataToStore = {
      ...userData,
      token: userData.token, // giữ token nếu có
    };
    setUser(dataToStore);
    setIsLoggedIn(true);
    localStorage.setItem("user", JSON.stringify(dataToStore));
  };

  const loginWithGoogle = (googleUser) => {
    const userData = {
      fullName: googleUser.name,
      email: googleUser.email,
    };
    login(userData); // dùng lại logic login
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <UserContext.Provider
      value={{ user, setUser, isLoggedIn, login, loginWithGoogle, logout }}
    >
      {children}
    </UserContext.Provider>
  );
};
