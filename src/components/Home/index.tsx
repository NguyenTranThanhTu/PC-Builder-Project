import React from "react";
import Hero from "./Hero";
// import Categories from "./Categories"; // Tạm ẩn - cần fix API
import NewArrival from "./NewArrivals";
import PromoBanner from "./PromoBanner";
import BestSeller from "./BestSeller";
import CounDown from "./Countdown";
// import Testimonials from "./Testimonials"; // Đã xóa
import Newsletter from "../Common/Newsletter";

const Home = () => {
  return (
    <main>
      <Hero />
      {/* <Categories /> */}
      <NewArrival />
      <PromoBanner />
      <BestSeller />
      <CounDown />
      {/* <Testimonials /> */}
      <Newsletter />
    </main>
  );
};

export default Home;
