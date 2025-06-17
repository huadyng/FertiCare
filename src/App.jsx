import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";
import { useContext} from "react";
import Footer from "./components/layout/Footer/Footer";
import Header from "./components/layout/Header/Header";
// import HeroSection from "./components/pages/HomePage/HeroSection";
// import AboutUs from "./components/pages/HomePage/AboutUs/AboutUs";
// import Service from "./components/pages/HomePage/ServiceHomePage/Service";
// import DoctorCarousel from "./components/pages/HomePage/DoctorCarousel/DoctorCarousel";
// import AchievementPage from "./components/pages/HomePage/AchievementPage/AchievementPage";
// import NewsPage from "./components/pages/HomePage/NewsPage/NewsPage";
// import FeedbackPage from "./components/pages/HomePage/FeedbackPage/FeedbackPage";
import Doctor from "./components/pages/DoctorTeam/Doctor";
import Login from "./components/pages/Login/Login";
import Register from "./components/pages/Register/Register";
import DoctorDetail from "./components/pages/DoctorTeam/Card/DoctorDetail/DoctorDetail";
import { Button, Result } from "antd";
import "./App.css";
import BlogPage from "./components/pages/Blog/BlogPage";
import ForgotPassword from "./components/pages/Login/ForgotPassword";
import RegisterPage from "./components/pages/Register/Register";
import BookingForm from "./components/pages/BookingForm/BookingForm";
import { UserProvider, UserContext } from "./context/UserContext";
import HomePage from "./components/pages/HomePage/index/HomePage";
import RegistrationForm from "./components/pages/RegistrationServiceForm/index/RegistrationForm";
import Contact from "./components/Pages/Contact/ContactForm";
import Articles from "./components/Pages/Articles/Articles";
import ArticleDetail from "./components/Pages/Articles/ArticleDetail";
import Achievements from "./components/Pages/Achievement/Achievements";
import ServiceList from "./components/Pages/Services/ServicesList";
import ServiceDetail from "./components/Pages/Services/ServiceDetail";
import Dashboard from "./components/Pages/ManagerDashboard/DashBoard";

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  
  const isHomePage = location.pathname === "/"; // Kiểm tra nếu là trang chủ

  return (
    <>
      {!["/login", "/register", "/forgot-password", "/booking","/dashboard"].includes(
        location.pathname
      ) && <Header />}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/doctor" element={<Doctor />} />
        <Route path="/doctor/:id" element={<DoctorDetail />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/articles" element={<Articles />} />
        <Route path="/articles/:id" element={<ArticleDetail />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/services" element={<ServiceList />} />
        <Route path="/services/:id" element={<ServiceDetail />} />
        <Route path="/dashboard" element={<Dashboard />} />

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
      {isHomePage}
      {!["/login", "/register", "/forgot-password", "/booking", "/dashboard"].includes(
        location.pathname
      ) && <Footer />}
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