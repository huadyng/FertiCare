import React, { useContext } from "react";
import Header from "../../../layout/Header/Header";
import Footer from "../../../layout/Footer/Footer";
import HeroSection from "../HeroSection/HeroSection";
import AboutUs from "../AboutUs/AboutUs";
import Service from "../ServiceHomePage/Service";
import DoctorCarousel from "../DoctorCarousel/DoctorCarousel";
import FeedbackPage from "../FeedbackPage/FeedbackPage";
import NewsPage from "../NewsPage/NewsPage";
import ArticlePreview from "../../News/ArticlesPreview";
import ServiceRegistration from "../ServiceRegistration/ServiceRegistration";
import { UserContext } from "../../../../context/UserContext";
import AchievementPage from "../../Achievement/AchievementPreview";
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
      <ArticlePreview />
      <FeedbackPage />
    </>
  );
};

export default HomePage;
