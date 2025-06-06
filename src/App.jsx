import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Footer from "./components/layout/Footer/Footer";
import Header from "./components/layout/Header/Header";
import HeroSection from "./components/Pages/HomePage/HeroSection";
import Login from "./components/Pages/Login/Login";
import AboutUs from "./components/Pages/HomePage/AboutUs";
import Service from "./components/Pages/HomePage/Service";
import DoctorCarousel from "./components/Pages/HomePage/DoctorCarousel";
import AchievementPage from "./components/Pages/HomePage/AchievementPage";
import NewsPage from "./components/Pages/HomePage/NewsPage";
import FeedbackPage from "./components/Pages/HomePage/FeedbackPage";
import Register from "./components/Pages/Register/Register";
import Doctor from "./components/Pages/DoctorTeam/Doctor";
import DoctorDetail from "./components/Pages/DoctorTeam/Card/DoctorDetail/DoctorDetail";

function AppContent() {
  const location = useLocation();
  const isAuthPage = location.pathname === "/login" || location.pathname == "/register";
  const isDoctorPage = location.pathname.startsWith ("/doctor");
  
  const hideSections = isAuthPage || isDoctorPage ;
  return (
    <>
      {!isAuthPage && <Header />}
      <Routes>
        <Route path="/" element={<HeroSection />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/doctor" element={<Doctor />} />
        <Route path="/doctor/:id" element={<DoctorDetail />} />
      </Routes>
      {!hideSections && <AboutUs />}
      {!hideSections && <DoctorCarousel/>}
      {!hideSections  && <AchievementPage />}
      {!hideSections && <AchievementPage />}
      {!hideSections  && <NewsPage />}
      {!hideSections  && <FeedbackPage />}
      {!isAuthPage && <Footer />}



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
