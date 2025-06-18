import React, { useContext } from "react";
import Header from "../../../layout/Header/Header";
import Footer from "../../../layout/Footer/Footer";
import HeroSection from "../HeroSection/HeroSection";
import AboutUs from "../AboutUs/AboutUs";
import Service from "../ServiceHomePage/Service";
import DoctorCarousel from "../DoctorCarousel/DoctorCarousel";
import AchievementPage from "../AchievementPage/AchievementPage";
import FeedbackPage from "../FeedbackPage/FeedbackPage";
import NewsPage from "../NewsPage/NewsPage";
import ServiceRegistration from "../ServiceRegistration/ServiceRegistration";
import { UserContext } from "../../../../context/UserContext";

const HomePage = () => {
  const { user, USER_ROLES } = useContext(UserContext);

  // Kiểm tra nếu user là customer và chưa đăng ký dịch vụ
  const showServiceRegistration =
    user && user.role === USER_ROLES.CUSTOMER && !user.hasRegisteredService;

  return (
    <>
      <HeroSection />
      <AboutUs />
      <Service />
      {showServiceRegistration && <ServiceRegistration />}
      <DoctorCarousel />
      <AchievementPage />
      <NewsPage />
      <FeedbackPage />
    </>
  );
};

export default HomePage;
