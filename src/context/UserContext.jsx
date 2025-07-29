import { createContext, useState, useEffect } from "react";

// 1. Định nghĩa các vai trò và quyền
export const USER_ROLES = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  DOCTOR: "DOCTOR",
  PATIENT: "PATIENT",
  CUSTOMER: "CUSTOMER",
};

// Map backend roles to frontend roles
const ROLE_MAPPING = {
  // Standard uppercase (backend preference)
  ADMIN: USER_ROLES.ADMIN,
  MANAGER: USER_ROLES.MANAGER,
  DOCTOR: USER_ROLES.DOCTOR,
  PATIENT: USER_ROLES.PATIENT,
  CUSTOMER: USER_ROLES.CUSTOMER,

  // Capitalized (actual backend format from SQL)
  Admin: USER_ROLES.ADMIN,
  Manager: USER_ROLES.MANAGER,
  Doctor: USER_ROLES.DOCTOR,
  Patient: USER_ROLES.PATIENT,
  Customer: USER_ROLES.CUSTOMER,

  // Legacy lowercase support
  admin: USER_ROLES.ADMIN,
  manager: USER_ROLES.MANAGER,
  doctor: USER_ROLES.DOCTOR,
  patient: USER_ROLES.PATIENT,
  customer: USER_ROLES.CUSTOMER,

  // Additional doctor role variations
  physician: USER_ROLES.DOCTOR,
  medical_doctor: USER_ROLES.DOCTOR,
  doc: USER_ROLES.DOCTOR,
  PHYSICIAN: USER_ROLES.DOCTOR,
  MEDICAL_DOCTOR: USER_ROLES.DOCTOR,
  DOC: USER_ROLES.DOCTOR,
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
  const [isUserLoading, setIsUserLoading] = useState(true);

  // Khi load lại trang, lấy user từ localStorage (có xử lý lỗi)
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    try {
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        console.log(
          "🔄 [UserContext] Loading user from localStorage:",
          userData
        );
        setUser(userData);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error("❌ Lỗi parse user từ localStorage:", error);
      localStorage.removeItem("user");
    }
    setIsUserLoading(false); // Đã xác định xong user
  }, []);

  // Đăng nhập (có role & trạng thái dịch vụ mặc định)
  const login = async (userData) => {
    console.log("🔍 [UserContext] Login data received:", userData);
    console.log("🔍 [UserContext] Raw role from backend:", userData.role);

    // 🩺 QUICK FIX: Auto-detect doctor role for test accounts
    let finalRole = userData.role;
    if (!finalRole && userData.email) {
      const doctorEmails = [
        "doctor.test@ferticare.com",
        "doctor.ivf@ferticare.com",
        "doctor.iui@ferticare.com",
        "doctor.ob@ferticare.com",
      ];

      if (
        doctorEmails.includes(userData.email) ||
        userData.fullName?.includes("BS.") ||
        userData.fullName?.includes("Dr.") ||
        userData.email?.includes("doctor.")
      ) {
        finalRole = "DOCTOR";
        console.log(
          "🩺 [UserContext] QUICK FIX: Auto-detected doctor role for:",
          userData.email
        );
      }
    }

    // Map role from backend to frontend
    const mappedRole = ROLE_MAPPING[finalRole] || USER_ROLES.CUSTOMER;

    console.log("🔍 [UserContext] Mapped role:", finalRole, "=>", mappedRole);

    // Debug: Show available mappings if role not found
    if (!ROLE_MAPPING[finalRole]) {
      console.warn("⚠️ [UserContext] Role not found in mapping:", finalRole);
      console.warn("Available mappings:", Object.keys(ROLE_MAPPING));
    }

    const dataToStore = {
      ...userData,
      role: mappedRole,
      token: userData.token,
      hasRegisteredService: userData.hasRegisteredService || false,
    };

    console.log("🔍 [UserContext] Data to store:", dataToStore);
    console.log("🔍 [UserContext] Token exists:", !!dataToStore.token);
    console.log("🔍 [UserContext] Token preview:", dataToStore.token ? dataToStore.token.substring(0, 50) + "..." : "NO TOKEN");
    console.log(
      "🔍 [UserContext] Dashboard path will be:",
      getDashboardPathForRole(mappedRole)
    );

    setUser(dataToStore);
    setIsLoggedIn(true);

    // ✅ Lưu cả user object và token riêng biệt để đảm bảo compatibility
    localStorage.setItem("user", JSON.stringify(dataToStore));
    if (userData.token) {
      localStorage.setItem("token", userData.token);
      localStorage.setItem("accessToken", userData.token); // Also save to STORAGE_KEYS format
      console.log("✅ [UserContext] Token saved to localStorage (both formats)");
    } else {
      console.warn("⚠️ [UserContext] No token found in userData:", userData);
    }

    // 🔄 Fetch thêm profile data để lấy avatar mới nhất (skip mock tokens)
    if (!userData.token?.includes("mock")) {
      try {
        console.log(
          "🔄 [UserContext] Fetching fresh profile data for avatar..."
        );

        // Dynamic import để tránh circular dependency
        const { default: apiProfile } = await import("../api/apiProfile");

        let profileData;
        try {
          switch (mappedRole.toUpperCase()) {
            case USER_ROLES.DOCTOR:
              profileData = await apiProfile.getDoctorProfile();
              break;
            case USER_ROLES.MANAGER:
            case USER_ROLES.ADMIN:
              profileData = await apiProfile.getManagerAdminProfile();
              break;
            case USER_ROLES.CUSTOMER:
            case USER_ROLES.PATIENT:
              profileData = await apiProfile.getCustomerProfile();
              break;
            default:
              profileData = await apiProfile.getMyProfile();
              break;
          }
        } catch (profileError) {
          console.warn(
            "⚠️ [UserContext] Profile API failed:",
            profileError.message
          );
          // Fallback: Try doctor profile if customer profile fails (for mis-classified users)
          if (
            mappedRole === USER_ROLES.CUSTOMER &&
            userData.email?.includes("doctor.")
          ) {
            try {
              console.log(
                "🔄 [UserContext] Retrying with doctor profile API..."
              );
              profileData = await apiProfile.getDoctorProfile();
            } catch (doctorError) {
              console.warn(
                "⚠️ [UserContext] Doctor profile also failed:",
                doctorError.message
              );
              profileData = null;
            }
          }
        }

        // Cập nhật user với avatar mới nhất từ profile
        if (profileData?.avatarUrl) {
          const updatedUserData = {
            ...dataToStore,
            avatarUrl: profileData.avatarUrl,
          };

          console.log(
            "✅ [UserContext] Updated user data with fresh avatar:",
            updatedUserData.avatarUrl
          );

          setUser(updatedUserData);
          localStorage.setItem("user", JSON.stringify(updatedUserData));
          
          // 🔄 Đảm bảo token vẫn được lưu riêng biệt
          if (userData.token) {
            localStorage.setItem("token", userData.token);
            console.log("✅ [UserContext] Token re-saved after profile update");
          }
        }
      } catch (error) {
        console.warn(
          "⚠️ [UserContext] Could not fetch profile for avatar:",
          error.message
        );
        // Không throw error để không block login process
      }
    } else {
      console.log("🔄 [UserContext] Skipping profile fetch for mock token");
    }
  };

  // Đăng nhập bằng Google
  const loginWithGoogle = async (googleUser) => {
    const userData = {
      fullName: googleUser.name,
      email: googleUser.email,
      role: USER_ROLES.CUSTOMER,
      hasRegisteredService: false,
    };
    await login(userData);
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
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken"); // Also remove STORAGE_KEYS format
    setUser(null);
    setIsLoggedIn(false);
  };

  // Force refresh user data từ server (dùng khi cần sync avatar mới)
  const refreshUserData = async () => {
    if (!user?.token) return;

    try {
      console.log("🔄 [UserContext] Refreshing user data...");

      const { default: apiProfile } = await import("../api/apiProfile");

      let profileData;
      switch (user.role?.toUpperCase()) {
        case USER_ROLES.CUSTOMER:
        case USER_ROLES.PATIENT:
          profileData = await apiProfile.getCustomerProfile();
          break;
        case USER_ROLES.DOCTOR:
          profileData = await apiProfile.getDoctorProfile();
          break;
        case USER_ROLES.MANAGER:
        case USER_ROLES.ADMIN:
          profileData = await apiProfile.getManagerAdminProfile();
          break;
        default:
          profileData = await apiProfile.getMyProfile();
          break;
      }

      const updatedUser = {
        ...user,
        avatarUrl: profileData?.avatarUrl || user.avatarUrl,
      };

      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      console.log("✅ [UserContext] User data refreshed successfully");
      return updatedUser;
    } catch (error) {
      console.warn(
        "⚠️ [UserContext] Failed to refresh user data:",
        error.message
      );
      return user;
    }
  };

  // Kiểm tra permission
  const hasPermission = (permission) => {
    if (!user || !user.role) return false;
    return ROLE_PERMISSIONS[user.role]?.[permission] || false;
  };

  // Kiểm tra vai trò
  const hasRole = (role) => user?.role === role;

  // Helper function to get dashboard path for any role
  const getDashboardPathForRole = (role) => {
    if (!role) return "/";
    console.log("🔍 [UserContext] getDashboardPathForRole input:", role);
    switch (role.toUpperCase()) {
      case USER_ROLES.ADMIN:
        return "/admin/dashboard";
      case USER_ROLES.MANAGER:
        return "/manager/dashboard";
      case USER_ROLES.DOCTOR:
        return "/doctor-dashboard";
      case USER_ROLES.PATIENT:
        return "/patient/dashboard";
      case USER_ROLES.CUSTOMER:
      default:
        return "/";
    }
  };

  // Lấy dashboard path
  const getDashboardPath = () => {
    if (!user?.role) return "/";
    console.log("🔍 [UserContext] getDashboardPath for user role:", user.role);
    const path = getDashboardPathForRole(user.role);
    console.log("🔍 [UserContext] Dashboard path resolved:", path);
    return path;
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
        isUserLoading,
        login,
        loginWithGoogle,
        logout,
        updateServiceRegistration,
        hasPermission,
        hasRole,
        getDashboardPath,
        canAccessPatientArea,
        refreshUserData,
        USER_ROLES,
        ROLE_PERMISSIONS,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
