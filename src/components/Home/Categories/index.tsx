"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { useCallback, useRef, useEffect, useState } from "react";
import Image from "next/image";
import "swiper/css/navigation";
import "swiper/css";
import SingleItem from "./SingleItem";

interface CategoryApi {
  id: string;
  name: string;
  slug: string;
  productCount: number;
}

interface CategoryItem {
  id: string;
  title: string;
  slug: string;
  count: number;
}

const Categories = () => {
  const sliderRef = useRef<any>(null);
  const [items, setItems] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handlePrev = useCallback(() => {
    if (!sliderRef.current) return;
    sliderRef.current.swiper.slidePrev();
  }, []);

  const handleNext = useCallback(() => {
    if (!sliderRef.current) return;
    sliderRef.current.swiper.slideNext();
  }, []);

  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.swiper.init();
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/public/categories", { cache: 'no-store' });
        if (!res.ok) throw new Error("Không tải được danh mục");
        const data: CategoryApi[] = await res.json();
        setItems(
          data.map(d => ({
            id: d.id,
            title: d.name,
            slug: d.slug,
            count: d.productCount,
          }))
        );
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <section className="overflow-hidden pt-17.5">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 pb-15 border-b border-gray-3">
        <div className="swiper categories-carousel common-carousel">
          <div className="mb-10 flex items-center justify-between">
            <div>
              <span className="flex items-center gap-2.5 font-medium text-dark mb-1.5">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#clip0_834_7356)">
                    <path d="M3.94 13.447C2.652 12.16 2.008 11.516 1.769 10.68C1.529 9.844 1.734 8.957 2.143 7.182L2.38 6.159C2.724 4.666 2.896 3.919 3.408 3.408C3.919 2.897 4.666 2.724 6.159 2.38L7.182 2.144C8.957 1.734 9.844 1.529 10.68 1.769C11.515 2.009 12.159 2.652 13.447 3.94L14.972 5.465C17.213 7.706 18.333 8.826 18.333 10.219C18.333 11.611 17.213 12.731 14.972 14.972C12.731 17.213 11.611 18.333 10.218 18.333C8.826 18.333 7.706 17.213 5.465 14.972L3.94 13.447Z" stroke="#3C50E0" strokeWidth="1.5"/>
                    <circle cx="7.172" cy="7.399" r="1.667" transform="rotate(-45 7.172 7.399)" stroke="#3C50E0" strokeWidth="1.5"/>
                    <path d="M9.618 15.416L15.434 9.6" stroke="#3C50E0" strokeWidth="1.5" strokeLinecap="round"/>
                  </g>
                  <defs><clipPath id="clip0_834_7356"><rect width="20" height="20" fill="white"/></clipPath></defs>
                </svg>
                Danh mục
              </span>
              <h2 className="font-semibold text-xl xl:text-heading-5 text-dark">
                Duyệt theo danh mục
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={handlePrev} className="swiper-button-prev">
                <svg className="fill-current" width="24" height="24" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M15.488 4.431c.315.269.351.743.082 1.057L9.988 12l5.582 6.512c.269.314.232.788-.082 1.058-.315.269-.789.233-1.058-.082L8.431 12.488a.75.75 0 010-.976l6-6c.269-.315.743-.352 1.058-.082z"/>
                </svg>
              </button>
              <button onClick={handleNext} className="swiper-button-next">
                <svg className="fill-current" width="24" height="24" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M8.512 4.431a.75.75 0 011.058.081l6 6.999a.75.75 0 010 .978l-6 6.999a.75.75 0 01-1.058.081.75.75 0 01-.081-1.058L14.012 12 8.43 5.489a.75.75 0 01.081-1.058z"/>
                </svg>
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {loading && <p className="text-sm text-gray-500">Đang tải danh mục...</p>}

          {!loading && !error && (
            <Swiper
              ref={sliderRef}
              slidesPerView={6}
              breakpoints={{
                0: { slidesPerView: 2 },
                1000: { slidesPerView: 4 },
                1200: { slidesPerView: 6 },
              }}
            >
              {items.map((item) => (
                <SwiperSlide key={item.id}>
                  <SingleItem item={item} />
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
      </div>
    </section>
  );
};

export default Categories;
