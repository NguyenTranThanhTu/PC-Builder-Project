"use client";
import React from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Breadcrumb from "@/components/Common/Breadcrumb";

const PaymentFailedPage = () => {
  const searchParams = useSearchParams();

  const orderId = searchParams.get("orderId");
  const message = searchParams.get("message") || "Thanh toán không thành công";
  const code = searchParams.get("code");

  return (
    <>
      <Breadcrumb title="Thanh toán thất bại" pages={["Thanh toán"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[800px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="bg-white rounded-xl shadow-1 px-4 py-10 sm:py-15 lg:py-20 xl:py-25">
            <div className="text-center">
              {/* Error Icon */}
              <div className="mx-auto w-20 h-20 mb-6 bg-red-light rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-red"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>

              <h2 className="font-bold text-red text-4xl lg:text-[45px] lg:leading-[57px] mb-5">
                Thanh toán thất bại!
              </h2>
              <h3 className="font-medium text-dark text-xl sm:text-2xl mb-3">
                Đơn hàng chưa được thanh toán
              </h3>
              <p className="max-w-[550px] w-full mx-auto mb-7.5 text-gray-600">
                {decodeURIComponent(message)}
              </p>

              {/* Error Details */}
              <div className="max-w-[500px] mx-auto text-left bg-red-light bg-opacity-10 border border-red-light rounded-lg p-6 mb-7.5">
                <h4 className="font-semibold mb-4 text-lg text-center text-red">
                  Thông tin lỗi
                </h4>
                {orderId && (
                  <div className="mb-3 flex justify-between">
                    <span className="text-gray-600">Mã đơn hàng:</span>
                    <span className="font-mono font-semibold">{orderId}</span>
                  </div>
                )}
                {code && (
                  <div className="mb-3 flex justify-between">
                    <span className="text-gray-600">Mã lỗi:</span>
                    <span className="font-mono text-red">{code}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Trạng thái:</span>
                  <span className="inline-flex items-center gap-1 font-medium text-red">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Chưa thanh toán
                  </span>
                </div>
              </div>

              {/* Suggestions */}
              <div className="max-w-[550px] mx-auto text-left bg-blue-light bg-opacity-10 border border-blue-light rounded-lg p-6 mb-7.5">
                <h4 className="font-semibold mb-3 text-blue">
                  💡 Gợi ý giải quyết:
                </h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Kiểm tra lại thông tin tài khoản/thẻ ngân hàng</li>
                  <li>Đảm bảo tài khoản có đủ số dư</li>
                  <li>Thử lại với phương thức thanh toán khác</li>
                  <li>Liên hệ ngân hàng nếu vấn đề tiếp diễn</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {orderId && (
                  <Link
                    href={`/checkout?orderId=${orderId}`}
                    className="inline-flex items-center justify-center gap-2 font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                    Thử thanh toán lại
                  </Link>
                )}
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 font-medium text-dark bg-white border-2 border-gray-3 py-3 px-6 rounded-md ease-out duration-200 hover:bg-gray-1"
                >
                  <svg
                    className="fill-current"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <path d="M16.6654 9.37502C17.0105 9.37502 17.2904 9.65484 17.2904 10C17.2904 10.3452 17.0105 10.625 16.6654 10.625H8.95703L8.95703 15C8.95703 15.2528 8.80476 15.4807 8.57121 15.5774C8.33766 15.6742 8.06884 15.6207 7.89009 15.442L2.89009 10.442C2.77288 10.3247 2.70703 10.1658 2.70703 10C2.70703 9.83426 2.77288 9.67529 2.89009 9.55808L7.89009 4.55808C8.06884 4.37933 8.33766 4.32586 8.57121 4.42259C8.80475 4.51933 8.95703 4.74723 8.95703 5.00002L8.95703 9.37502H16.6654Z" />
                  </svg>
                  Về trang chủ
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default PaymentFailedPage;
