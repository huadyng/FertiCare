import { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

// Định nghĩa các vai trò (roles)
export const USER_ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  DOCTOR: "doctor",
  PATIENT: "patient",
  CUSTOMER: "customer", // Customer chưa đăng ký dịch vụ
};

// Định nghĩa quyền cho từng vai trò
export const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: {
    canManageUsers: true,
    canManageDepartments: true,
    canViewReports: true,
    canManageSystem: true,
    canAccessAll: true,
  },
  [USER_ROLES.MANAGER]: {
    canManageDoctors: true,
    canManageSchedule: true,
    canViewTeamReports: true,
    canManageTeam: true,
  },
  [USER_ROLES.DOCTOR]: {
    canManagePatients: true,
    canCreateTreatmentPlan: true,
    canViewOwnSchedule: true,
    canUpdateTreatmentStatus: true,
  },
  [USER_ROLES.PATIENT]: {
    canViewTreatmentProcess: true,
    canViewSchedule: true,
    canViewNotifications: true,
    canViewProfile: true,
  },
  [USER_ROLES.CUSTOMER]: {
    canViewPublicContent: true,
    canRegisterService: true,
    canViewProfile: true,
  },
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    try {
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
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
      role: userData.role || USER_ROLES.CUSTOMER, // mặc định là customer nếu không có role
      token: userData.token,
      hasRegisteredService: userData.hasRegisteredService || false, // Trạng thái đăng ký dịch vụ
    };
    setUser(dataToStore);
    setIsLoggedIn(true);
    localStorage.setItem("user", JSON.stringify(dataToStore));
  };

  const loginWithGoogle = (googleUser) => {
    const userData = {
      fullName: googleUser.name,
      email: googleUser.email,
      role: USER_ROLES.CUSTOMER, // mặc định Google login là customer
      hasRegisteredService: false,
    };
    login(userData);
  };

  // Cập nhật trạng thái đăng ký dịch vụ
  const updateServiceRegistration = (registrationData) => {
    const updatedUser = {
      ...user,
      role: USER_ROLES.PATIENT, // Chuyển từ customer sang patient
      hasRegisteredService: true,
      serviceInfo: registrationData,
    };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setIsLoggedIn(false);
  };

  // Kiểm tra quyền của user
  const hasPermission = (permission) => {
    if (!user || !user.role) return false;
    return ROLE_PERMISSIONS[user.role]?.[permission] || false;
  };

  // Kiểm tra vai trò
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Lấy dashboard path theo role
  const getDashboardPath = () => {
    if (!user?.role) return "/";

    switch (user.role) {
      case USER_ROLES.ADMIN:
        return "/admin/dashboard";
      case USER_ROLES.MANAGER:
        return "/manager/dashboard";
      case USER_ROLES.DOCTOR:
        return "/doctor-panel/dashboard";
      case USER_ROLES.PATIENT:
        return "/patient/dashboard";
      case USER_ROLES.CUSTOMER:
        return "/"; // Customer quay về homepage để đăng ký dịch vụ
      default:
        return "/";
    }
  };

  // Kiểm tra xem user có thể truy cập patient area không
  const canAccessPatientArea = () => {
    return user?.role === USER_ROLES.PATIENT && user?.hasRegisteredService;
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        isLoggedIn,
        login,
        loginWithGoogle,
        logout,
        hasPermission,
        hasRole,
        getDashboardPath,
        canAccessPatientArea,
        updateServiceRegistration,
        USER_ROLES,
        ROLE_PERMISSIONS,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
