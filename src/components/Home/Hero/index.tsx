"use client";
import React, { useState, useEffect } from "react";
import HeroCarousel from "./HeroCarousel";
import HeroFeature from "./HeroFeature";
import Image from "next/image";

interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
}

const Hero = () => {
  const [sideBanners, setSideBanners] = useState<Banner[]>([]);

  useEffect(() => {
    fetch("/api/public/banners?position=hero-side")
      .then((res) => res.json())
      .then((data) => setSideBanners(data || []))
      .catch((err) => console.error("Failed to fetch side banners:", err));
  }, []);

  return (
    <section className="overflow-hidden pb-10 lg:pb-12.5 xl:pb-15 pt-57.5 sm:pt-45 lg:pt-30 xl:pt-51.5 bg-[#E5EAF4]">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="flex flex-wrap gap-5">
          <div className="xl:max-w-[757px] w-full">
            <div className="relative z-1 rounded-[10px] bg-white overflow-hidden">
              {/* <!-- bg shapes --> */}
              <Image
                src="/images/hero/hero-bg.png"
                alt="hero bg shapes"
                className="absolute right-0 bottom-0 -z-1"
                width={534}
                height={520}
              />

              <HeroCarousel />
            </div>
          </div>

          <div className="xl:max-w-[393px] w-full">
            <div className="flex flex-col sm:flex-row xl:flex-col gap-5">
              {sideBanners.length > 0 ? (
                sideBanners.map((banner) => (
                  <div key={banner.id} className="w-full relative rounded-[10px] bg-white p-4 sm:p-7.5">
                    <a href={banner.linkUrl || "#"} className="flex items-center gap-4">
                      <div className="flex-1">
                        <h2 className="max-w-[153px] font-semibold text-dark text-xl mb-4">
                          {banner.title}
                        </h2>

                        {banner.subtitle && (
                          <p className="font-medium text-dark-4 text-custom-sm">
                            {banner.subtitle}
                          </p>
                        )}
                      </div>

                      <div className="flex-shrink-0 relative w-[123px] h-[161px]">
                        <Image
                          src={banner.imageUrl}
                          alt={banner.title}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                    </a>
                  </div>
                ))
              ) : (
                <>
                  <div className="w-full relative rounded-[10px] bg-white p-4 sm:p-7.5">
                    <div className="flex items-center gap-14">
                      <div>
                        <h2 className="max-w-[153px] font-semibold text-dark text-xl mb-20">
                          <a href="#"> iPhone 14 Plus & 14 Pro Max </a>
                        </h2>

                        <div>
                          <p className="font-medium text-dark-4 text-custom-sm mb-1.5">
                            limited time offer
                          </p>
                        </div>
                      </div>

                      <div>
                        <Image
                          src="/images/hero/hero-02.png"
                          alt="mobile image"
                          width={123}
                          height={161}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="w-full relative rounded-[10px] bg-white p-4 sm:p-7.5">
                    <div className="flex items-center gap-14">
                      <div>
                        <h2 className="max-w-[153px] font-semibold text-dark text-xl mb-20">
                          <a href="#"> Wireless Headphone </a>
                        </h2>

                        <div>
                          <p className="font-medium text-dark-4 text-custom-sm mb-1.5">
                            limited time offer
                          </p>
                        </div>
                      </div>

                      <div>
                        <Image
                          src="/images/hero/hero-01.png"
                          alt="mobile image"
                          width={123}
                          height={161}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* <!-- Hero features --> */}
      <HeroFeature />
    </section>
  );
};

export default Hero;
