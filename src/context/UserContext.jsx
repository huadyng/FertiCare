import { createContext, useState, useEffect } from "react";

// 1. Định nghĩa các vai trò và quyền
export const USER_ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  DOCTOR: "doctor",
  PATIENT: "patient",
  CUSTOMER: "customer",
};

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

// 2. Tạo Context
export const UserContext = createContext();

// 3. UserProvider kết hợp
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Khi load lại trang, lấy user từ localStorage (có xử lý lỗi)
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
      localStorage.removeItem("user");
    }
  }, []);

  // Đăng nhập (có role & trạng thái dịch vụ mặc định)
  const login = (userData) => {
    const dataToStore = {
      ...userData,
      role: userData.role || USER_ROLES.CUSTOMER,
      token: userData.token,
      hasRegisteredService: userData.hasRegisteredService || false,
    };
    setUser(dataToStore);
    setIsLoggedIn(true);
    localStorage.setItem("user", JSON.stringify(dataToStore));
  };

  // Đăng nhập bằng Google
  const loginWithGoogle = (googleUser) => {
    const userData = {
      fullName: googleUser.name,
      email: googleUser.email,
      role: USER_ROLES.CUSTOMER,
      hasRegisteredService: false,
    };
    login(userData);
  };

  // Đăng ký dịch vụ, chuyển customer => patient
  const updateServiceRegistration = (registrationData) => {
    if (!user) return;
    const updatedUser = {
      ...user,
      role: USER_ROLES.PATIENT,
      hasRegisteredService: true,
      serviceInfo: registrationData,
    };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  // Đăng xuất
  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setIsLoggedIn(false);
  };

  // Kiểm tra permission
  const hasPermission = (permission) => {
    if (!user || !user.role) return false;
    return ROLE_PERMISSIONS[user.role]?.[permission] || false;
  };

  // Kiểm tra vai trò
  const hasRole = (role) => user?.role === role;

  // Lấy dashboard path
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
      default:
        return "/";
    }
  };

  // Có được truy cập patient area không?
  const canAccessPatientArea = () =>
    user?.role === USER_ROLES.PATIENT && user?.hasRegisteredService;

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        isLoggedIn,
        login,
        loginWithGoogle,
        logout,
        updateServiceRegistration,
        hasPermission,
        hasRole,
        getDashboardPath,
        canAccessPatientArea,
        USER_ROLES,
        ROLE_PERMISSIONS,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
