import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Footer from "./components/layout/Footer/Footer";
import Header from "./components/layout/Header/Header";
import HeroSection from "./components/Pages/HomePage/HeroSection";

import AboutUs from "./components/Pages/HomePage/AboutUs";
import Service from "./components/Pages/HomePage/Service";
import DoctorCarousel from "./components/Pages/HomePage/DoctorCarousel";
import AchievementPage from "./components/Pages/HomePage/AchievementPage";
import NewsPage from "./components/Pages/HomePage/NewsPage";
import FeedbackPage from "./components/Pages/HomePage/FeedbackPage";
import Home from "./components/Pages/HomePage/Home"; // ✅ Tạo file Home.jsx ở đúng vị trí này
import RegisterForm from "./components/Pages/Register/RegisterForm";
import Login from "./components/Pages/Login/Login";
function AppContent() {
  const location = useLocation();

  switch (location.pathname) {
    case "/login":
    case "/register":
      return (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterForm />} />
        </Routes>
      );

    default:
      return (
        <>
          <Header />
          <HeroSection />
          <AboutUs />
          <Service />
          <DoctorCarousel />
          <AchievementPage />
          <NewsPage />
          <FeedbackPage />
          <Footer />
        </>
      );
  }
}

function App() {
  return (
    <GoogleOAuthProvider clientId="298912881431-a0l5ibtfk8jd44eh51b3f4vre3gr4pu3.apps.googleusercontent.com">
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
