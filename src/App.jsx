import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";
import { useContext, Suspense, lazy } from "react";
import { Button, Result, Spin } from "antd";
import { UserProvider, UserContext } from "./context/UserContext";
import "./App.css";

// Lazy load components for better performance
const Footer = lazy(() => import("./components/layout/Footer/Footer"));
const Header = lazy(() => import("./components/layout/Header/Header"));
const Doctor = lazy(() => import("./components/pages/DoctorTeam/Doctor"));
const Login = lazy(() => import("./components/pages/Login/Login"));
const Register = lazy(() => import("./components/pages/Register/Register"));
const DoctorDetail = lazy(() =>
  import("./components/pages/DoctorTeam/Card/DoctorDetail/DoctorDetail")
);
const BlogPage = lazy(() => import("./components/pages/Blog/BlogPage"));
const ForgotPassword = lazy(() =>
  import("./components/pages/Login/ForgotPassword")
);
const RegisterPage = lazy(() => import("./components/pages/Register/Register"));
const BookingForm = lazy(() =>
  import("./components/pages/BookingForm/BookingForm")
);
const HomePage = lazy(() =>
  import("./components/pages/HomePage/index/HomePage")
);
const RegistrationForm = lazy(() =>
  import("./components/pages/RegistrationServiceForm/index/RegistrationForm")
);
const Pie = lazy(() => import("./components/pages/ChartsForm/Pie"));
const Contact = lazy(() => import("./components/pages/Contact/ContactForm"));

// Lazy load layouts
const AdminLayout = lazy(() => import("./components/layout/AdminLayout"));
const ManagerLayout = lazy(() => import("./components/layout/ManagerLayout"));
const DoctorLayout = lazy(() => import("./components/layout/DoctorLayout"));
const PatientLayout = lazy(() => import("./components/layout/PatientLayout"));

// Lazy load dashboards
const AdminDashboard = lazy(() =>
  import("./components/dashboards/AdminDashboard")
);
const ManagerDashboard = lazy(() =>
  import("./components/dashboards/ManagerDashboard")
);
const DoctorDashboard = lazy(() =>
  import("./components/doctor/DoctorDashboard")
);
const PatientDashboard = lazy(() =>
  import("./components/dashboards/PatientDashboard")
);

// Lazy load admin components
const UserManagement = lazy(() => import("./components/admin/UserManagement"));
const DepartmentManagement = lazy(() =>
  import("./components/admin/DepartmentManagement")
);
const SystemReports = lazy(() => import("./components/admin/SystemReports"));
const SystemSettings = lazy(() => import("./components/admin/SystemSettings"));

// Lazy load manager components
const DoctorManagement = lazy(() =>
  import("./components/manager/DoctorManagement")
);
const ScheduleManagement = lazy(() =>
  import("./components/manager/ScheduleManagement")
);
const ShiftManagement = lazy(() =>
  import("./components/manager/ShiftManagement")
);

// Lazy load mock login for testing
const MockLogin = lazy(() => import("./components/auth/MockLogin"));

// Import auth components (keep these for route protection)
import {
  RoleBasedRoute,
  GuestOnlyRoute,
  AuthRequiredRoute,
  AdminRoute,
  ManagerRoute,
  DoctorRoute,
  PatientRoute,
} from "./components/auth/ProtectedRoute";

// Loading component
const LoadingSpinner = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "200px",
    }}
  >
    <Spin size="large" />
  </div>
);

// Routes that should hide header/footer
const HIDE_HEADER_FOOTER_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/booking",
];

// Wrapper to display Header/Footer based on route
function LayoutWrapper({ children }) {
  const location = useLocation();
  const shouldHideHeaderFooter = HIDE_HEADER_FOOTER_PATHS.includes(
    location.pathname
  );

  return (
    <>
      {!shouldHideHeaderFooter && (
        <Suspense fallback={<div />}>
          <Header />
        </Suspense>
      )}
      {children}
      {!shouldHideHeaderFooter && (
        <Suspense fallback={<div />}>
          <Footer />
        </Suspense>
      )}
    </>
  );
}

// Legacy components - keeping for backward compatibility
function PrivateRoute({ children }) {
  const { user } = useContext(UserContext);
  return user ? children : <Navigate to="/login" replace />;
}

// Auto redirect to dashboard based on role after login
function DashboardRedirect() {
  const { user, getDashboardPath } = useContext(UserContext);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getDashboardPath()} replace />;
}

// Coming Soon component
const ComingSoon = ({ title }) => (
  <div
    style={{
      padding: "50px",
      textAlign: "center",
      background: "#f5f5f5",
      borderRadius: "8px",
      margin: "20px",
    }}
  >
    <h3>{title} - Coming Soon</h3>
    <p>Tính năng này đang được phát triển</p>
  </div>
);

// AppContent contains all routes
function AppContent() {
  const navigate = useNavigate();

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <LayoutWrapper>
              <HomePage />
            </LayoutWrapper>
          }
        />
        <Route
          path="/doctor-team"
          element={
            <LayoutWrapper>
              <Doctor />
            </LayoutWrapper>
          }
        />
        <Route
          path="/doctor-team/:id"
          element={
            <LayoutWrapper>
              <DoctorDetail />
            </LayoutWrapper>
          }
        />
        <Route
          path="/blog"
          element={
            <LayoutWrapper>
              <BlogPage />
            </LayoutWrapper>
          }
        />
        <Route
          path="/contact"
          element={
            <LayoutWrapper>
              <Contact />
            </LayoutWrapper>
          }
        />

        {/* Auth Routes */}
        <Route
          path="/login"
          element={
            <GuestOnlyRoute>
              <Login />
            </GuestOnlyRoute>
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/register"
          element={
            <GuestOnlyRoute>
              <RegisterPage />
            </GuestOnlyRoute>
          }
        />

        {/* Dashboard redirect */}
        <Route path="/dashboard" element={<DashboardRedirect />} />

        {/* Mock Login for Testing */}
        <Route path="/mock-login" element={<MockLogin />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="departments" element={<DepartmentManagement />} />
          <Route
            path="doctors"
            element={<ComingSoon title="Quản lý bác sĩ" />}
          />
          <Route
            path="schedule"
            element={<ComingSoon title="Quản lý lịch trình" />}
          />
          <Route path="reports" element={<SystemReports />} />
          <Route path="settings" element={<SystemSettings />} />
          <Route
            path="profile"
            element={<ComingSoon title="Thông tin cá nhân" />}
          />
        </Route>

        {/* Manager Routes */}
        <Route
          path="/manager"
          element={
            <ManagerRoute>
              <ManagerLayout />
            </ManagerRoute>
          }
        >
          <Route index element={<Navigate to="/manager/dashboard" replace />} />
          <Route path="dashboard" element={<ManagerDashboard />} />
          <Route path="doctors" element={<DoctorManagement />} />
          <Route path="schedule" element={<ScheduleManagement />} />
          <Route path="shift-management" element={<ShiftManagement />} />
          <Route
            path="treatment-approval"
            element={<ComingSoon title="Duyệt phác đồ điều trị" />}
          />
          <Route path="reports" element={<ComingSoon title="Báo cáo nhóm" />} />
          <Route
            path="profile"
            element={<ComingSoon title="Thông tin cá nhân" />}
          />
        </Route>

        {/* Doctor Routes - New Integrated Dashboard */}
        <Route
          path="/doctor"
          element={
            <DoctorRoute>
              <DoctorDashboard />
            </DoctorRoute>
          }
        >
          <Route path="dashboard" element={<DoctorDashboard />} />
        </Route>

        {/* Doctor Routes - Legacy Panel */}
        <Route
          path="/doctor-panel"
          element={
            <DoctorRoute>
              <DoctorLayout />
            </DoctorRoute>
          }
        >
          <Route index element={<Navigate to="/doctor/dashboard" replace />} />
          <Route
            path="dashboard"
            element={<Navigate to="/doctor/dashboard" replace />}
          />
          <Route
            path="patients"
            element={<ComingSoon title="Danh sách bệnh nhân" />}
          />
          <Route
            path="treatment-plans"
            element={<ComingSoon title="Phác đồ điều trị" />}
          />
          <Route
            path="clinical-examination"
            element={<ComingSoon title="Khám lâm sàng" />}
          />
          <Route
            path="treatment-monitoring"
            element={<ComingSoon title="Theo dõi điều trị" />}
          />
          <Route
            path="schedule"
            element={<ComingSoon title="Lịch làm việc" />}
          />
          <Route
            path="reports"
            element={<ComingSoon title="Báo cáo cá nhân" />}
          />
          <Route
            path="profile"
            element={<ComingSoon title="Thông tin cá nhân" />}
          />
        </Route>

        {/* Patient Routes */}
        <Route
          path="/patient"
          element={
            <PatientRoute>
              <PatientLayout />
            </PatientRoute>
          }
        >
          <Route index element={<Navigate to="/patient/dashboard" replace />} />
          <Route path="dashboard" element={<PatientDashboard />} />
          <Route
            path="treatment-process"
            element={<ComingSoon title="Tiến trình điều trị" />}
          />
          <Route path="schedule" element={<ComingSoon title="Lịch khám" />} />
          <Route
            path="medical-records"
            element={<ComingSoon title="Hồ sơ y tế" />}
          />
          <Route path="history" element={<ComingSoon title="Lịch sử khám" />} />
          <Route
            path="notifications"
            element={<ComingSoon title="Thông báo" />}
          />
          <Route
            path="profile"
            element={<ComingSoon title="Thông tin cá nhân" />}
          />
          <Route path="settings" element={<ComingSoon title="Cài đặt" />} />
        </Route>

        {/* Legacy Routes */}
        <Route
          path="/booking"
          element={
            <PrivateRoute>
              <RegistrationForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/chart"
          element={
            <LayoutWrapper>
              <Pie />
            </LayoutWrapper>
          }
        />

        {/* 404 Route */}
        <Route
          path="*"
          element={
            <LayoutWrapper>
              <Result
                status="404"
                title="404"
                subTitle="Xin lỗi, trang bạn tìm không tồn tại."
                extra={
                  <Button type="primary" onClick={() => navigate("/")}>
                    Về trang chủ
                  </Button>
                }
              />
            </LayoutWrapper>
          }
        />
      </Routes>
    </Suspense>
  );
}

// Main App component
function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
