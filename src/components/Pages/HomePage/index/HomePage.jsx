import React from "react";
import Header from "../../../layout/Header/Header";
import Footer from "../../../layout/Footer/Footer";
import HeroSection from "../HeroSection/HeroSection";
import AboutUs from "../AboutUs/AboutUs";
import Service from "../ServiceHomePage/Service";
import DoctorCarousel from "../DoctorCarousel/DoctorCarousel";
import AchievementPage from "../AchievementPage/AchievementPage";
import FeedbackPage from "../FeedbackPage/FeedbackPage";
import NewsPage from "../NewsPage/NewsPage";

const HomePage = () => {
  return (
    <>
      <HeroSection />
      <AboutUs />
      <Service />
      <DoctorCarousel />
      <AchievementPage />
      <NewsPage />
      <FeedbackPage />
    </>
  );
};

export default HomePage;
