import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";
import { useContext } from "react";
import Footer from "./components/layout/Footer/Footer";
import Header from "./components/layout/Header/Header";
import Doctor from "./components/pages/DoctorTeam/Doctor";
import Login from "./components/pages/Login/Login";
import RegisterPage from "./components/pages/Register/Register";
import ForgotPassword from "./components/pages/Login/ForgotPassword";
import DoctorDetail from "./components/pages/DoctorTeam/Card/DoctorDetail/DoctorDetail";
import BookingForm from "./components/pages/BookingForm/BookingForm";
import HomePage from "./components/pages/HomePage/index/HomePage";
import RegistrationForm from "./components/pages/RegistrationServiceForm/index/RegistrationForm";
import Pie from "./components/pages/ChartsForm/Pie";
import Contact from "./components/pages/Contact/ContactForm";
import BlogPublic from "./components/Pages/Blog/BlogPublic";
import BlogManager from "./components/Pages/Blog/BlogManager";
import BlogDetail from "./components/Pages/Blog/BlogDetail";
// import BlogPage from "./components/Pages/Blog/BlogPage"; // Nếu bạn cần BlogPage thì import lại
import { Button, Result } from "antd";
import { UserProvider, UserContext } from "./context/UserContext";
import "./App.css";

// Layout wrapper để ẩn header/footer ở một số page
function LayoutWrapper({ children }) {
  const location = useLocation();
  const hideHeaderFooterPaths = [
    "/login",
    "/register",
    "/forgot-password",
    "/booking",
  ];
  const shouldHideHeaderFooter = hideHeaderFooterPaths.includes(location.pathname);

  return (
    <>
      {!shouldHideHeaderFooter && <Header />}
      {children}
      {!shouldHideHeaderFooter && <Footer />}
    </>
  );
}

// Route cần đăng nhập
function PrivateRoute({ children }) {
  const { user } = useContext(UserContext);
  return user ? children : <Navigate to="/login" replace />;
}

// Chỉ cho guest (chưa đăng nhập)
function GuestOnlyRoute({ children }) {
  const { user } = useContext(UserContext);
  return user ? <Navigate to="/" replace /> : children;
}

// App content
function AppContent() {
  const navigate = useNavigate();

  return (
    <Routes>
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
        path="/doctor/:id"
        element={
          <LayoutWrapper>
            <DoctorDetail />
          </LayoutWrapper>
        }
      />
      {/* Blog page placeholder nếu có */}
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
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route
        path="/register"
        element={
          <GuestOnlyRoute>
            <RegisterPage />
          </GuestOnlyRoute>
        }
      />
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
      <Route
        path="/contact"
        element={
          <LayoutWrapper>
            <Contact />
          </LayoutWrapper>
        }
      />
      <Route
        path="*"
        element={
          <LayoutWrapper>
            <Result
              status="404"
              title="404"
              subTitle="Xin lỗi, trang bạn tìm không tồn tại."
              extra={[
                <Button key="back" onClick={() => navigate("/")}>
                  Về trang chủ
                </Button>,
              ]}
            />
          </LayoutWrapper>
        }
      />
    </Routes>
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
