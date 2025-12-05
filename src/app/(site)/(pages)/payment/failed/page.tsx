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

  const getFailureType = () => {
    if (code === "24") return "cancelled";
    if (code === "51") return "insufficient";
    if (code === "11") return "expired";
    return "error";
  };

  const failureType = getFailureType();

  return (
    <>
      <Breadcrumb title="Thanh toán không thành công" pages={["Thanh toán"]} />
      <section className="relative overflow-hidden py-20 lg:py-25 bg-gray-1">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-red-light-5 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-orange-light-4 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" style={{ animationDelay: '2s' }}></div>

        <div className="relative max-w-[900px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-3">
            {/* Header with red theme */}
            <div className={`px-8 py-10 relative overflow-hidden ${
              failureType === "cancelled" ? "bg-orange" : "bg-red"
            }`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
              <div className="relative flex flex-col sm:flex-row items-center gap-6">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                  {failureType === "cancelled" ? (
                    <svg className="w-12 h-12 text-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="w-12 h-12 text-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  )}
                </div>
                <div className="text-center sm:text-left">
                  <h2 className="font-bold text-white text-3xl lg:text-heading-4 mb-2">
                    {failureType === "cancelled" ? "Đã hủy thanh toán" : "Thanh toán không thành công"}
                  </h2>
                  <p className="text-white opacity-90 text-lg">
                    {failureType === "cancelled" ? "Bạn đã hủy giao dịch" : "Đơn hàng chưa được thanh toán"}
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 sm:px-8 py-10">
              {/* Error message */}
              <div className="text-center mb-10">
                <p className="text-lg text-gray-7 max-w-2xl mx-auto font-semibold leading-relaxed">
                  {decodeURIComponent(message)}
                </p>
              </div>

              {/* Error Details Card */}
              <div className="bg-red-light-6 rounded-xl p-6 lg:p-8 mb-8 border-2 border-red-light-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-red rounded-lg flex items-center justify-center shadow-md">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-2xl text-dark">Chi tiết lỗi</h3>
                </div>

                <div className="space-y-3">
                  {orderId && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 border-b border-red-light-3 gap-2">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <span className="text-gray-6 font-medium text-base">Mã đơn hàng</span>
                      </div>
                      <span className="font-mono font-bold text-dark bg-white px-4 py-2 rounded-lg border-2 border-red-light-4 text-lg">
                        #{orderId.slice(-8).toUpperCase()}
                      </span>
                    </div>
                  )}
                  {code && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 border-b border-red-light-3 gap-2">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                        <span className="text-gray-6 font-medium text-base">Mã lỗi VNPay</span>
                      </div>
                      <span className="font-mono font-bold text-red bg-white px-4 py-2 rounded-lg border-2 border-red text-lg">
                        {code}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 gap-2">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-6 font-medium text-base">Trạng thái</span>
                    </div>
                    <span className="inline-flex items-center gap-2 font-bold text-white bg-red px-5 py-2 rounded-full shadow-md">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      Chưa thanh toán
                    </span>
                  </div>
                </div>
              </div>

              {/* Suggestions based on failure type */}
              <div className="bg-blue-light-6 border-l-4 border-blue p-6 rounded-lg mb-10">
                <div className="flex gap-3">
                  <svg className="w-6 h-6 text-blue flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <div className="flex-1">
                    <h4 className="font-bold text-dark text-lg mb-3">
                      {failureType === "cancelled" ? "Bạn muốn tiếp tục?" : "💡 Gợi ý khắc phục"}
                    </h4>
                    {failureType === "cancelled" ? (
                      <ul className="space-y-2.5 text-gray-7">
                        <li className="flex items-start gap-2">
                          <span className="text-blue mt-1 font-bold">✓</span>
                          <span>Đơn hàng vẫn còn, bạn có thể thử thanh toán lại</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue mt-1 font-bold">✓</span>
                          <span>Chọn phương thức thanh toán khác nếu cần</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue mt-1 font-bold">✓</span>
                          <span>Liên hệ hotline nếu cần hỗ trợ</span>
                        </li>
                      </ul>
                    ) : failureType === "insufficient" ? (
                      <ul className="space-y-2.5 text-gray-7">
                        <li className="flex items-start gap-2">
                          <span className="text-blue mt-1 font-bold">✓</span>
                          <span>Kiểm tra số dư tài khoản ngân hàng</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue mt-1 font-bold">✓</span>
                          <span>Nạp thêm tiền vào tài khoản hoặc thử thẻ khác</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue mt-1 font-bold">✓</span>
                          <span>Chọn phương thức COD nếu cần</span>
                        </li>
                      </ul>
                    ) : failureType === "expired" ? (
                      <ul className="space-y-2.5 text-gray-7">
                        <li className="flex items-start gap-2">
                          <span className="text-blue mt-1 font-bold">✓</span>
                          <span>Phiên thanh toán đã hết hạn (15 phút)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue mt-1 font-bold">✓</span>
                          <span>Vui lòng thực hiện lại từ đầu</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue mt-1 font-bold">✓</span>
                          <span>Chuẩn bị sẵn thông tin để thanh toán nhanh hơn</span>
                        </li>
                      </ul>
                    ) : (
                      <ul className="space-y-2.5 text-gray-7">
                        <li className="flex items-start gap-2">
                          <span className="text-blue mt-1 font-bold">✓</span>
                          <span>Kiểm tra kết nối internet và thử lại</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue mt-1 font-bold">✓</span>
                          <span>Đảm bảo thông tin thẻ/tài khoản chính xác</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue mt-1 font-bold">✓</span>
                          <span>Liên hệ ngân hàng nếu vấn đề tiếp diễn</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue mt-1 font-bold">✓</span>
                          <span>Chọn phương thức thanh toán khác</span>
                        </li>
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/my-account?tab=orders"
                  className="group inline-flex items-center justify-center gap-3 font-bold text-white bg-blue hover:bg-blue-dark py-4 px-8 rounded-xl ease-out duration-200 shadow-2 hover:shadow-3 transform hover:-translate-y-0.5"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Thử thanh toán lại
                </Link>
                <Link
                  href="/"
                  className="group inline-flex items-center justify-center gap-3 font-semibold text-dark bg-white border-2 border-gray-4 hover:border-gray-5 py-4 px-8 rounded-xl ease-out duration-200 shadow-1 hover:shadow-2 transform hover:-translate-y-0.5"
                >
                  <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
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
