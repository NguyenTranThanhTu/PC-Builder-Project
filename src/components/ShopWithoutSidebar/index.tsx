import React from "react";
import Breadcrumb from "../Common/Breadcrumb";
import SingleGridItem from "../Shop/SingleGridItem";
import SingleListItem from "../Shop/SingleListItem";
import CustomSelect from "../ShopWithSidebar/CustomSelect";
import type { Product } from "@/types/product";
import Link from "next/link";
import PaginationPrefetch from "../Common/PaginationPrefetch";

interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
  category?: string;
}

type ViewMode = "grid" | "list";

interface Props {
  products: Product[];
  pagination?: PaginationMeta;
  view?: ViewMode;
}

function buildPageHref(page: number, category?: string, view: ViewMode = "grid") {
  const params = new URLSearchParams();
  params.set("page", String(page));
  if (category) params.set("category", category);
  params.set("view", view);
  return `/shop-without-sidebar?${params.toString()}`;
}

function renderPageNumbers(p: PaginationMeta) {
  const maxButtons = 7;
  const pages: Array<{ page?: number; ellipsis?: boolean; key: string }> = [];
  if (p.pageCount <= maxButtons) {
    for (let i = 1; i <= p.pageCount; i++) pages.push({ page: i, key: `p-${i}` });
  } else {
    const first = 1;
    const last = p.pageCount;
    const neighbors = [p.page - 1, p.page, p.page + 1].filter((n) => n > first && n < last);
    pages.push({ page: first, key: `p-${first}` });
    if (neighbors[0] && neighbors[0] > first + 1) pages.push({ ellipsis: true, key: "e-1" });
    for (const n of neighbors) pages.push({ page: n, key: `p-${n}` });
    if (neighbors[neighbors.length - 1] && neighbors[neighbors.length - 1] < last - 1)
      pages.push({ ellipsis: true, key: "e-2" });
    pages.push({ page: last, key: `p-${last}` });
  }
  return pages;
}

const ShopWithoutSidebar = ({ products, pagination, view = "grid" }: Props) => {
  const options = [
    { label: "Latest Products", value: "0" },
    { label: "Best Selling", value: "1" },
    { label: "Old Products", value: "2" },
  ];

  return (
    <>
      <Breadcrumb title={"Explore All Products"} pages={["shop", "/", "shop without sidebar"]} />
      <section className="overflow-hidden relative pb-20 pt-5 lg:pt-20 xl:pt-28 bg-[#f3f4f6]">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="rounded-lg bg-white shadow-1 pl-3 pr-2.5 py-2.5 mb-6 flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-4">
              <CustomSelect options={options} />
              {pagination ? (
                <p>
                  Showing <span className="text-dark">{products.length}</span> of
                  <span className="text-dark"> {pagination.total} </span> Products
                </p>
              ) : (
                <p>
                  Showing <span className="text-dark">{products.length}</span> Products
                </p>
              )}
            </div>
            {pagination && (
              <div className="flex items-center gap-2.5">
                <Link
                  href={buildPageHref(pagination.page, pagination.category, "grid")}
                  aria-label="switch to grid view"
                  className={`${
                    view === "grid"
                      ? "bg-blue border-blue text-white"
                      : "text-dark bg-gray-1 border-gray-3"
                  } flex items-center justify-center w-10.5 h-9 rounded-[5px] border ease-out duration-200 hover:bg-blue hover:border-blue hover:text-white`}
                >
                  <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M4.836 1.3125C4.16215 1.31248 3.60022 1.31246 3.15414 1.37244C2.6833 1.43574 2.2582 1.57499 1.91659 1.91659C1.57499 2.2582 1.43574 2.6833 1.37244 3.15414C1.31246 3.60022 1.31248 4.16213 1.3125 4.83598V4.914C1.31248 5.58785 1.31246 6.14978 1.37244 6.59586C1.43574 7.06671 1.57499 7.49181 1.91659 7.83341C2.2582 8.17501 2.6833 8.31427 3.15414 8.37757C3.60022 8.43754 4.16213 8.43752 4.83598 8.4375H4.914C5.58785 8.43752 6.14978 8.43754 6.59586 8.37757C7.06671 8.31427 7.49181 8.17501 7.83341 7.83341C8.17501 7.49181 8.31427 7.06671 8.37757 6.59586C8.43754 6.14978 8.43752 5.58787 8.4375 4.91402V4.83601C8.43752 4.16216 8.43754 3.60022 8.37757 3.15414C8.31427 2.6833 8.17501 2.2582 7.83341 1.91659C7.49181 1.57499 7.06671 1.43574 6.59586 1.37244C6.14978 1.31246 5.58787 1.31248 4.91402 1.3125H4.836Z" />
                  </svg>
                </Link>
                <Link
                  href={buildPageHref(pagination.page, pagination.category, "list")}
                  aria-label="switch to list view"
                  className={`${
                    view === "list"
                      ? "bg-blue border-blue text-white"
                      : "text-dark bg-gray-1 border-gray-3"
                  } flex items-center justify-center w-10.5 h-9 rounded-[5px] border ease-out duration-200 hover:bg-blue hover:border-blue hover:text-white`}
                >
                  <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M4.4234 0.899903C3.74955 0.899882 3.18763 0.899864 2.74155 0.959838C2.2707 1.02314 1.8456 1.16239 1.504 1.504C1.16239 1.8456 1.02314 2.2707 0.959838 2.74155C0.899864 3.18763 0.899882 3.74953 0.899903 4.42338V4.5014C0.899882 5.17525 0.899864 5.73718 0.959838 6.18326C1.02314 6.65411 1.16239 7.07921 1.504 7.42081C1.8456 7.76241 2.2707 7.90167 2.74155 7.96497C3.18763 8.02495 3.74953 8.02493 4.42339 8.02491H4.5014C5.17525 8.02493 14.7372 8.02495 15.1833 7.96497C15.6541 7.90167 16.0792 7.76241 16.4208 7.42081C16.7624 7.07921 16.9017 6.65411 16.965 6.18326C17.0249 5.73718 17.0249 5.17527 17.0249 4.50142V4.42341C17.0249 3.74956 17.0249 3.18763 16.965 2.74155C16.9017 2.2707 16.7624 1.8456 16.4208 1.504C16.0792 1.16239 15.6541 1.02314 15.1833 0.959838C14.7372 0.899864 5.17528 0.899882 4.50142 0.899903H4.4234Z" />
                  </svg>
                </Link>
              </div>
            )}
          </div>

          <div
            className={
              view === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
                : "flex flex-col gap-7.5"
            }
          >
            {products.map((item, idx) =>
              view === "grid" ? (
                <SingleGridItem key={idx} item={item} />
              ) : (
                <SingleListItem key={idx} item={item} />
              )
            )}
          </div>

          {pagination && pagination.pageCount > 1 && (
            <div className="flex justify-center mt-15">
              <div className="bg-white shadow-1 rounded-md p-2">
                <ul className="flex items-center">
                  <li>
                    <Link
                      aria-label="previous page"
                      className={`flex items-center justify-center w-8 h-9 rounded-[3px] duration-200 ${pagination.page === 1 ? "text-gray-4" : "hover:text-white hover:bg-blue"}`}
                      href={
                        pagination.page === 1
                          ? "#"
                          : buildPageHref(pagination.page - 1, pagination.category, view)
                      }
                    >
                      <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.1782 16.1156C12.0095 16.1156 11.8407 16.0594 11.7282 15.9187L5.37197 9.45C5.11885 9.19687 5.11885 8.80312 5.37197 8.55L11.7282 2.08125C11.9813 1.82812 12.3751 1.82812 12.6282 2.08125C12.8813 2.33437 12.8813 2.72812 12.6282 2.98125L6.72197 9L12.6563 15.0187C12.9095 15.2719 12.9095 15.6656 12.6563 15.9187C12.4876 16.0312 12.347 16.1156 12.1782 16.1156Z" />
                      </svg>
                    </Link>
                  </li>
                  {renderPageNumbers(pagination).map((p) => (
                    <li key={p.key}>
                      {p.ellipsis ? (
                        <span className="flex py-1.5 px-3.5 rounded-[3px]">...</span>
                      ) : (
                        <Link
                          href={buildPageHref(p.page!, pagination.category, view)}
                          className={`flex py-1.5 px-3.5 rounded-[3px] duration-200 ${p.page === pagination.page ? "bg-blue text-white" : "hover:text-white hover:bg-blue"}`}
                        >
                          {p.page}
                        </Link>
                      )}
                    </li>
                  ))}
                  <li>
                    <Link
                      aria-label="next page"
                      className={`flex items-center justify-center w-8 h-9 rounded-[3px] duration-200 ${pagination.page === pagination.pageCount ? "text-gray-4" : "hover:text-white hover:bg-blue"}`}
                      href={
                        pagination.page === pagination.pageCount
                          ? "#"
                          : buildPageHref(pagination.page + 1, pagination.category, view)
                      }
                    >
                      <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5.82197 16.1156C5.65322 16.1156 5.5126 16.0594 5.37197 15.9469C5.11885 15.6937 5.11885 15.3 5.37197 15.0469L11.2782 9L5.37197 2.98125C5.11885 2.72812 5.11885 2.33437 5.37197 2.08125C5.6251 1.82812 6.01885 1.82812 6.27197 2.08125L12.6282 8.55C12.8813 8.80312 12.8813 9.19687 12.6282 9.45L6.72197 15.9187C6.15947 16.0312 5.99072 16.1156 5.82197 16.1156Z" />
                      </svg>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          )}
          {pagination && (
            <PaginationPrefetch
              prevHref={
                pagination.page === 1
                  ? "#"
                  : buildPageHref(pagination.page - 1, pagination.category, view)
              }
              nextHref={
                pagination.page === pagination.pageCount
                  ? "#"
                  : buildPageHref(pagination.page + 1, pagination.category, view)
              }
            />
          )}
        </div>
      </section>
    </>
  );
};

export default ShopWithoutSidebar;
