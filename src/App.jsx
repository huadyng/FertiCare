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

// Lazy load các components/pages chính
const Footer = lazy(() => import("./components/layout/Footer/Footer"));
const Header = lazy(() => import("./components/layout/Header/Header"));
const Doctor = lazy(() => import("./components/pages/DoctorTeam/Doctor"));
const Services = lazy(() => import("./components/Pages/Services/ServicesList"));

const ServiceDetail = lazy(() =>
  import("./components/Pages/Services/ServiceDetail")
);

const Articles = lazy(() => import("./components/Pages/News/Articles"));

const ArticlesDetail = lazy(() =>
  import("./components/Pages/News/ArticlesDetail")
);

const Achievements = lazy(() =>
  import("./components/Pages/Achievement/Achievements")
);

const Login = lazy(() => import("./components/pages/Login/Login"));
const Register = lazy(() => import("./components/pages/Register/Register"));
const RegisterPage = lazy(() => import("./components/pages/Register/Register"));
const DoctorDetail = lazy(() =>
  import("./components/pages/DoctorTeam/Card/DoctorDetail/DoctorDetail")
);
const HomePage = lazy(() =>
  import("./components/pages/HomePage/index/HomePage")
);
const RegistrationForm = lazy(() =>
  import("./components/pages/RegistrationForm/RegistrationForm")
);
const Pie = lazy(() => import("./components/pages/ChartsForm/Pie"));
const Contact = lazy(() => import("./components/pages/Contact/ContactForm"));
const BlogPublic = lazy(() => import("./components/pages/Blog/BlogPublic"));
const BlogManager = lazy(() => import("./components/pages/Blog/BlogManager"));
const BlogDetail = lazy(() => import("./components/pages/Blog/BlogDetail"));
const ForgotPassword = lazy(() =>
  import("./components/Pages/ForgotPassword/ForgotPassword")
);
const ResetPassword = lazy(() =>
  import("./components/Pages/ForgotPassword/ResetPassword")
);
const VerifyEmail = lazy(() =>
  import("./components/pages/VerifyEmail/VerifyEmail")
);
const UserProfile = lazy(() =>
  import("./components/pages/Profile/UserProfile")
);

// Lazy load layouts và dashboard
const AdminLayout = lazy(() => import("./components/layout/AdminLayout"));
const ManagerLayout = lazy(() => import("./components/layout/ManagerLayout"));
const DoctorLayout = lazy(() => import("./components/layout/DoctorLayout"));
const PatientLayout = lazy(() => import("./components/layout/PatientLayout"));

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

const UserManagement = lazy(() => import("./components/admin/UserManagement"));
const DepartmentManagement = lazy(() =>
  import("./components/admin/DepartmentManagement")
);
const SystemReports = lazy(() => import("./components/admin/SystemReports"));
const SystemSettings = lazy(() => import("./components/admin/SystemSettings"));

const DoctorManagement = lazy(() =>
  import("./components/manager/DoctorManagement")
);
const ScheduleManagement = lazy(() =>
  import("./components/manager/ScheduleManagement")
);
const ShiftManagement = lazy(() =>
  import("./components/manager/ShiftManagement")
);
const MockLogin = lazy(() => import("./components/auth/MockLogin"));

// Import auth routes (hoặc dùng component cũ cũng được)
import {
  RoleBasedRoute,
  GuestOnlyRoute,
  AuthRequiredRoute,
  AdminRoute,
  ManagerRoute,
  DoctorRoute,
  PatientRoute,
} from "./components/auth/ProtectedRoute";
import ScrollToTop from "./components/common/ScrollToTop";

// Loading Spinner
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

// Định nghĩa các route cần ẩn header/footer
const HIDE_HEADER_FOOTER_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/booking",
];

// Wrapper để ẩn/hiện Header/Footer
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

// PrivateRoute cũ, có thể vẫn dùng cho các route public cũ
function PrivateRoute({ children }) {
  const { user } = useContext(UserContext);
  return user ? children : <Navigate to="/login" replace />;
}

// Chỉ cho guest (chưa đăng nhập)
function GuestOnlyLegacyRoute({ children }) {
  const { user } = useContext(UserContext);
  return user ? <Navigate to="/" replace /> : children;
}

// Auto redirect dashboard theo role
function DashboardRedirect() {
  const { user, getDashboardPath } = useContext(UserContext);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getDashboardPath()} replace />;
}

// Coming Soon
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

// AppContent - routes tổng hợp
function AppContent() {
  const navigate = useNavigate();

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ScrollToTop />
      <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={
            <LayoutWrapper>
              <HomePage />
            </LayoutWrapper>
          }
        />
        <Route
          path="/doctor"
          element={
            <LayoutWrapper>
              <Doctor />
            </LayoutWrapper>
          }
        />
        <Route
          path="/articles"
          element={
            <LayoutWrapper>
              <Articles />
            </LayoutWrapper>
          }
        />
        <Route
          path="/services"
          element={
            <LayoutWrapper>
              <Services />
            </LayoutWrapper>
          }
        />
        <Route
          path="/services/:id"
          element={
            <LayoutWrapper>
              <ServiceDetail />
            </LayoutWrapper>
          }
        />
        <Route
          path="/articles/:id"
          element={
            <LayoutWrapper>
              <ArticlesDetail />
            </LayoutWrapper>
          }
        />
        <Route
          path="/achievements"
          element={
            <LayoutWrapper>
              <Achievements />
            </LayoutWrapper>
          }
        />
        <Route
          path="/doctor/:id"
          element={
            <LayoutWrapper>
              <DoctorDetail />
            </LayoutWrapper>
          }
        />
        {/* <Route
          path="/blog"
          element={
            <LayoutWrapper>
              <BlogPage />
            </LayoutWrapper>
          }
        /> */}
        <Route
          path="/blog-public"
          element={
            <LayoutWrapper>
              <BlogPublic />
            </LayoutWrapper>
          }
        />
        <Route
          path="/blog-manager"
          element={
            <LayoutWrapper>
              <BlogManager />
            </LayoutWrapper>
          }
        />
        <Route
          path="/blog/:id"
          element={
            <LayoutWrapper>
              <BlogDetail />
            </LayoutWrapper>
          }
        />
        <Route
          path="/verify-email"
          element={
            <LayoutWrapper>
              <VerifyEmail />
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
        <Route
          path="/chart"
          element={
            <LayoutWrapper>
              <Pie />
            </LayoutWrapper>
          }
        />

        {/* Auth Routes */}
        <Route
          path="/login"
          element={
            <GuestOnlyLegacyRoute>
              <Login />
            </GuestOnlyLegacyRoute>
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/register"
          element={
            <GuestOnlyLegacyRoute>
              <RegisterPage />
            </GuestOnlyLegacyRoute>
          }
        />

        {/* Legacy booking route - vẫn còn để dùng */}
        <Route
          path="/booking"
          element={
            <PrivateRoute>
              <RegistrationForm />
            </PrivateRoute>
          }
        />

        {/* Mock Login for testing */}
        <Route path="/mock-login" element={<MockLogin />} />

        {/* User Profile - Test Route (No Auth Required for Testing) */}
        <Route
          path="/profile-test"
          element={
            <LayoutWrapper>
              <UserProfile />
            </LayoutWrapper>
          }
        />

        {/* User Profile - Protected Route */}
        <Route
          path="/profile"
          element={
            <AuthRequiredRoute>
              <LayoutWrapper>
                <UserProfile />
              </LayoutWrapper>
            </AuthRequiredRoute>
          }
        />

        {/* Dashboard auto redirect */}
        <Route path="/dashboard" element={<DashboardRedirect />} />

        {/* Admin Dashboard + quản trị */}
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
          <Route path="profile" element={<UserProfile />} />
        </Route>

        {/* Manager Dashboard + quản lý */}
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
          <Route path="profile" element={<UserProfile />} />
        </Route>

        {/* Doctor Dashboard - tích hợp mới */}
        <Route
          path="/doctor-dashboard"
          element={
            <DoctorRoute>
              <DoctorDashboard />
            </DoctorRoute>
          }
        />

        {/* Doctor Legacy Panel */}
        <Route
          path="/doctor-panel"
          element={
            <DoctorRoute>
              <DoctorLayout />
            </DoctorRoute>
          }
        >
          <Route index element={<Navigate to="/doctor-dashboard" replace />} />
          <Route
            path="dashboard"
            element={<Navigate to="/doctor-dashboard" replace />}
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
          <Route path="profile" element={<UserProfile />} />
        </Route>

        {/* Patient Dashboard */}
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
          <Route path="profile" element={<UserProfile />} />
          <Route path="settings" element={<ComingSoon title="Cài đặt" />} />
        </Route>

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

// App chính
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
