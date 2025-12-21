"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { useState, useEffect } from "react";

// Import Swiper styles
import "swiper/css/pagination";
import "swiper/css";

import Image from "next/image";

interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  buttonText?: string;
}

const HeroCarousal = () => {
  const [banners, setBanners] = useState<Banner[]>([]);

  useEffect(() => {
    fetch("/api/public/banners?position=hero-carousel")
      .then((res) => res.json())
      .then((data) => setBanners(data || []))
      .catch((err) => console.error("Failed to fetch hero banners:", err));
  }, []);

  // Fallback static slide if no banners
  if (banners.length === 0) {
    return (
      <Swiper
        spaceBetween={30}
        centeredSlides={true}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        modules={[Autoplay, Pagination]}
        className="hero-carousel"
      >
        <SwiperSlide>
          <div className="flex items-center pt-6 sm:pt-0 flex-col-reverse sm:flex-row">
            <div className="max-w-[394px] py-10 sm:py-15 lg:py-24.5 pl-4 sm:pl-7.5 lg:pl-12.5">
              <div className="flex items-center gap-4 mb-7.5 sm:mb-10">
                <span className="block font-semibold text-heading-3 sm:text-heading-1 text-blue">
                  30%
                </span>
                <span className="block text-dark text-sm sm:text-custom-1 sm:leading-[24px]">
                  Sale
                  <br />
                  Off
                </span>
              </div>

              <h1 className="font-semibold text-dark text-xl sm:text-3xl mb-3">
                <a href="#">True Wireless Noise Cancelling Headphone</a>
              </h1>

              <p>
                Loading banners...
              </p>
            </div>

            <div>
              <Image
                src="/images/hero/hero-01.png"
                alt="headphone"
                width={351}
                height={358}
              />
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    );
  }

  return (
    <Swiper
      spaceBetween={30}
      centeredSlides={true}
      autoplay={{
        delay: 2500,
        disableOnInteraction: false,
      }}
      pagination={{
        clickable: true,
      }}
      modules={[Autoplay, Pagination]}
      className="hero-carousel"
    >
      {banners.map((banner) => (
        <SwiperSlide key={banner.id}>
          <div className="relative flex items-center pt-6 sm:pt-0 flex-col-reverse sm:flex-row min-h-[400px]">
            {/* Background Image - Full width */}
            <div className="absolute inset-0 -z-1">
              <Image
                src={banner.imageUrl}
                alt={banner.title}
                fill
                className="object-cover"
              />
            </div>

            {/* Content overlay on top of image */}
            <div className="relative z-1 max-w-[394px] py-10 sm:py-15 lg:py-24.5 pl-4 sm:pl-7.5 lg:pl-12.5">
              <div className="flex items-center gap-4 mb-7.5 sm:mb-10">
                <span className="block font-semibold text-heading-3 sm:text-heading-1 text-blue drop-shadow-lg">
                  {banner.subtitle?.split(" ")[0] || "30%"}
                </span>
                <span className="block text-dark text-sm sm:text-custom-1 sm:leading-[24px] drop-shadow-lg">
                  {banner.subtitle?.replace(/^\d+%\s*/, "") || "Sale Off"}
                </span>
              </div>

              <h1 className="font-semibold text-dark text-xl sm:text-3xl mb-3 drop-shadow-lg">
                <a href={banner.linkUrl || "#"}>{banner.title}</a>
              </h1>

              {banner.buttonText && (
                <a
                  href={banner.linkUrl || "#"}
                  className="inline-flex font-medium text-white text-custom-sm rounded-md bg-dark py-3 px-9 ease-out duration-200 hover:bg-blue mt-10 shadow-lg"
                >
                  {banner.buttonText}
                </a>
              )}
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default HeroCarousal;
