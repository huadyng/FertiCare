import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { UserContext } from "../../context/UserContext";
import { Result, Button } from "antd";

// Route bảo vệ theo role
export const RoleBasedRoute = ({
  children,
  allowedRoles = [],
  requireAuth = true,
}) => {
  const { user, isLoggedIn } = useContext(UserContext);
  const location = useLocation();

  // Nếu yêu cầu đăng nhập nhưng chưa đăng nhập
  if (requireAuth && !isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Nếu có yêu cầu role cụ thể
  if (allowedRoles.length > 0 && user) {
    const userRole = user.role?.toUpperCase();
    const hasValidRole = allowedRoles.some(
      (role) => role.toUpperCase() === userRole
    );

    if (!hasValidRole) {
      return (
        <Result
          status="403"
          title="403"
          subTitle="Xin lỗi, bạn không có quyền truy cập trang này."
          extra={
            <Button type="primary" onClick={() => window.history.back()}>
              Quay lại
            </Button>
          }
        />
      );
    }
  }

  return children;
};

// Route chỉ cho guest (chưa đăng nhập)
export const GuestOnlyRoute = ({ children }) => {
  const { isLoggedIn, getDashboardPath } = useContext(UserContext);

  if (isLoggedIn) {
    return <Navigate to={getDashboardPath()} replace />;
  }

  return children;
};

// Route yêu cầu đăng nhập (không cần role cụ thể)
export const AuthRequiredRoute = ({ children }) => {
  const { isLoggedIn } = useContext(UserContext);
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// HOC để tạo route cho từng role cụ thể
export const createRoleRoute = (allowedRoles) => {
  return ({ children }) => (
    <RoleBasedRoute allowedRoles={allowedRoles}>{children}</RoleBasedRoute>
  );
};

// Các route components cho từng role
export const AdminRoute = createRoleRoute(["ADMIN", "admin"]);
export const ManagerRoute = createRoleRoute(["MANAGER", "manager"]);
export const DoctorRoute = createRoleRoute(["DOCTOR", "doctor"]);
export const PatientRoute = createRoleRoute(["PATIENT", "patient"]);

// Route cho admin hoặc manager
export const AdminManagerRoute = createRoleRoute([
  "ADMIN",
  "MANAGER",
  "admin",
  "manager",
]);

// Route cho staff (admin, manager, doctor)
export const StaffRoute = createRoleRoute([
  "ADMIN",
  "MANAGER",
  "DOCTOR",
  "admin",
  "manager",
  "doctor",
]);
