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

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();

  const isDoctorPage = location.pathname.startsWith("/doctor");

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const showAnyModal = showLoginModal || showRegisterModal;

  const handleSwitchToRegister = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  const handleSwitchToLogin = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  return (
    <>
      {<Header onLoginClick={() => setShowLoginModal(true)} />}

      <Routes>
        <Route path="/" element={<HeroSection />} />
        <Route path="/doctor" element={<Doctor />} />
        <Route path="/doctor/:id" element={<DoctorDetail />} />
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

      {showAnyModal && (
        <div
          className="modal-overlay visible"
          onClick={() => {
            setShowLoginModal(false);
            setShowRegisterModal(false);
          }}
        >
          {showLoginModal && (
            <div
              className="modal-content visible"
              onClick={(e) => e.stopPropagation()}
            >
              <Login
                visible={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onRegisterClick={handleSwitchToRegister}
              />
            </div>
          )}

          {showRegisterModal && (
            <div
              className="modal-content register-modal visible"
              onClick={(e) => e.stopPropagation()}
            >
              <Register
                onClose={() => setShowRegisterModal(false)}
                onLoginClick={handleSwitchToLogin}
              />
            </div>
          )}
        </div>
      )}

      {!isDoctorPage && (
        <>
          <AboutUs />
          <DoctorCarousel />
          <Service />
          <AchievementPage />
          <NewsPage />
          <FeedbackPage />
          
        </>
      )}
      <Footer />
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
