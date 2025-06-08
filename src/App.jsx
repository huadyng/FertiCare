import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useState } from "react";
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
import Login from "./components/Pages/Login/Login";
import Register from "./components/Pages/Register/Register";
import DoctorDetail from "./components/Pages/DoctorTeam/Card/DoctorDetail/DoctorDetail";
import { Button, Result } from "antd";
import "./App.css";
import BlogPage from './components/Pages/Blog/BlogPage';
import ForgotPassword from "./components/Pages/Login/ForgotPassword";


function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();

  const isDoctorPage = location.pathname.startsWith("/doctor");


  return (
    <>
        {!["/login", "/register","/forgot-password"].includes(location.pathname) && (
        <Header />
      )}

      <Routes>
        <Route path="/" element={<HeroSection />} />
        <Route path="/doctor" element={<Doctor />} />
        <Route path="/doctor/:id" element={<DoctorDetail />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/register" element={<Register />} />
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

      

          
  
      

        {!isDoctorPage && !["/login", "/register","/forgot-password","/forgot-password"].includes(location.pathname) && (
        <>
          <AboutUs />
          <DoctorCarousel />
          <Service />
          <AchievementPage />
          <NewsPage />
          <FeedbackPage />
          
        </>
      )}
      {!["/login", "/register","/forgot-password"].includes(location.pathname) && <Footer />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
