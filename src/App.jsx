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
<<<<<<< HEAD
<<<<<<< HEAD
import Register from "./components/Pages/Register/Register";
=======
import Doctor from "./components/Pages/DoctorTeam/Doctor";
<<<<<<< HEAD
>>>>>>> 4dc01644 (doctorList)
=======
<<<<<<< Updated upstream
>>>>>>> 6f5cf66d (fix conflict)
=======
import Doctor from "./components/Pages/DoctorTeam/Doctor";
<<<<<<< Updated upstream
>>>>>>> 6f5cf66df2909cca5c03a017443eff56d5b917b8

=======
>>>>>>> Stashed changes

function AppContent() {
  const location = useLocation();
<<<<<<< HEAD
  const isAuthPage = location.pathname === "/login" || location.pathname == "/register";
  return (
    <>
      {!isAuthPage && <Header />}
      <Routes>
        <Route path="/" element={<HeroSection />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
      {!isAuthPage && <AboutUs />}
      {!isAuthPage && <Service />}
      {!isAuthPage && <DoctorCarousel />}
      {!isAuthPage && <AchievementPage />}
      {!isAuthPage && <NewsPage />}
      {!isAuthPage && <FeedbackPage />}
      {!isAuthPage && <Footer />}
=======
  const isLoginPage = location.pathname === "/login";
  const isDoctorPage = location.pathname === "/doctor";


  return (
    <>
      {!isLoginPage && <Header />}

      <Routes>
        <Route path="/" element={<HeroSection />} />
        <Route path="/login" element={<Login />} />
        <Route path="/doctor" element={<Doctor />} />
      </Routes>
<<<<<<< Updated upstream
      
      {!isLoginPage && !isDoctorPage && <AboutUs />}
      {!isLoginPage && !isDoctorPage && <Service />}
      {!isLoginPage && !isDoctorPage && <DoctorCarousel />}
      {!isLoginPage && !isDoctorPage && <AchievementPage />}
      {!isLoginPage && !isDoctorPage && <NewsPage />}
      {!isLoginPage && !isDoctorPage && <FeedbackPage />}
=======


      {!isLoginPage && <Footer />}
>>>>>>> 4dc01644 (doctorList)
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
