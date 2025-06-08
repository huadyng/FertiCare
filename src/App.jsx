import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import Footer from "./components/layout/Footer/Footer";
import Header from "./components/layout/Header/Header";
import HeroSection from "./components/Pages/HomePage/HeroSection";
import AboutUs from "./components/Pages/HomePage/AboutUs";
import Service from "./components/Pages/HomePage/Service";
import DoctorCarousel from "./components/Pages/HomePage/DoctorCarousel";
import AchievementPage from "./components/Pages/HomePage/AchievementPage";
import NewsPage from "./components/Pages/HomePage/NewsPage";
import FeedbackPage from "./components/Pages/HomePage/FeedbackPage";
import Doctor from "./components/Pages/DoctorTeam/Doctor";
import Login from "./components/pages/Login/Login";
import Register from "./components/Pages/Register/RegisterPage";
import DoctorDetail from "./components/Pages/DoctorTeam/Card/DoctorDetail/DoctorDetail";
import { Button, Result } from "antd";
import "./App.css";
import BlogPage from "./components/Pages/Blog/BlogPage";
import RegisterPage from "./components/Pages/Register/RegisterPage";
import BookingForm from "./components/pages/BookingForm/BookingForm";
import AppContext from "antd/es/app/context";
import { UserContext, UserProvider } from "./context/UserContext";

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const isDoctorPage = location.pathname.startsWith("/doctor");
  const isHomePage = location.pathname === "/"; // Kiểm tra nếu là trang chủ

  return (
    <>
      {!["/login", "/register"].includes(location.pathname) && <Header />}

      <Routes>
        <Route path="/" element={<HeroSection />} />
        <Route path="/doctor" element={<Doctor />} />
        <Route path="/doctor/:id" element={<DoctorDetail />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/booking" element={user ? <BookingForm /> : <Login />} />

        <Route
          path="*"
          element={
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
          }
        />
      </Routes>

      {/* Chỉ hiển thị các thành phần này nếu đang ở trang chủ */}
      {isHomePage && (
        <>
          <AboutUs />
          <DoctorCarousel />
          <Service />
          <AchievementPage />
          <NewsPage />
          <FeedbackPage />
        </>
      )}

      {!["/login", "/register"].includes(location.pathname) && <Footer />}
    </>
  );
}

function App() {
  return (
    <>
      <UserProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </UserProvider>
    </>
  );
}

export default App;
