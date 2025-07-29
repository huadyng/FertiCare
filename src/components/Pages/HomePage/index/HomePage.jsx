import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import AchievementsPreview from "../../Achievement/AchievementPreview";
import ArticlePreview from "../../News/ArticlesPreview";
import { Spin } from "antd";

const HomePage = () => {
  const { user, getDashboardPath, USER_ROLES, isUserLoading } =
    useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Chỉ redirect khi đã load xong user và user không phải CUSTOMER
    if (
      !isUserLoading &&
      user &&
      user.role &&
      user.role !== USER_ROLES.CUSTOMER
    ) {
      const dashboardPath = getDashboardPath();
      console.log("🔄 [HomePage] Redirecting to dashboard:", dashboardPath);
      navigate(dashboardPath, { replace: true });
    }
  }, [user, getDashboardPath, USER_ROLES, navigate, isUserLoading]);

  // Chỉ hiển thị loading khi đang load user, không hiển thị khi đang redirect
  if (isUserLoading) {
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        <Spin size="large" />
      </div>
    );
  }

  // Nếu user không phải CUSTOMER, không render gì cả (sẽ redirect ngay)
  if (user && user.role && user.role !== USER_ROLES.CUSTOMER) {
    // Return một div rỗng thay vì null để tránh lỗi React
    return <div style={{ display: "none" }} />;
  }

  // Kiểm tra nếu user là customer và chưa đăng ký dịch vụ
  const showServiceRegistration =
    user && user.role === USER_ROLES.CUSTOMER && !user.hasRegisteredService;

  return (
    <>
      <HeroSection />
      <AboutUs />
      <Service />
      {/* {showServiceRegistration && <ServiceRegistration />} */}
      <DoctorCarousel />
      
      <ArticlePreview />
      <FeedbackPage />
    </>
  );
};

export default HomePage;
