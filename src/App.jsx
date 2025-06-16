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
import Register from "./components/pages/Register/Register";
import DoctorDetail from "./components/pages/DoctorTeam/Card/DoctorDetail/DoctorDetail";
import { Button, Result } from "antd";
import "./App.css";

import ForgotPassword from "./components/pages/Login/ForgotPassword";
import RegisterPage from "./components/pages/Register/Register";
import BookingForm from "./components/pages/BookingForm/BookingForm";
import { UserProvider, UserContext } from "./context/UserContext";
import HomePage from "./components/pages/HomePage/index/HomePage";
import RegistrationForm from "./components/pages/RegistrationServiceForm/index/RegistrationForm";
import Pie from "./components/pages/ChartsForm/Pie";
import Contact from "./components/pages/Contact/ContactForm";


import Pie from "./components/pages/ChartsForm/Pie";
import BlogPublic from "./components/Pages/Blog/BlogPublic";
import BlogManager from "./components/Pages/Blog/BlogManager";
import BlogDetail from "./components/Pages/Blog/BlogDetail";


// Wrapper để hiển thị Header/Footer tùy theo route
function LayoutWrapper({ children }) {
  const location = useLocation();
  const hideHeaderFooterPaths = [
    "/login",
    "/register",
    "/forgot-password",
    "/booking",
  ];
  const shouldHideHeaderFooter = hideHeaderFooterPaths.includes(
    location.pathname
  );

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

// Chỉ cho guest vào (chưa đăng nhập)
function GuestOnlyRoute({ children }) {
  const { user } = useContext(UserContext);
  return user ? <Navigate to="/" replace /> : children;
}

// AppContent chứa toàn bộ route

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  return (

    <>
      {!["/login", "/register", "/forgot-password", "/booking"].includes(
        location.pathname
      ) && <Header />}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/doctor" element={<Doctor />} />
        <Route path="/doctor/:id" element={<DoctorDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />


        <Route path="/chart" element={<Pie />} />
        <Route path="/blog-public" element={<BlogPublic />} />
        <Route path="/blog-manager" element={<BlogManager />} />
        <Route path="/blog/:id" element={<BlogDetail />} />
        <Route
          path="/register"
          element={user ? <Navigate to="/" /> : <RegisterPage />}
        />
        <Route
          path="/booking"
          element={user ? <RegistrationForm /> : <Navigate to="/login" />}
        />
        <Route
          path="*"
          element={

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
      <Route
        path="/blog"
        element={
          <LayoutWrapper>
            <BlogPage />
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
  );
}

// Component App chính
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
