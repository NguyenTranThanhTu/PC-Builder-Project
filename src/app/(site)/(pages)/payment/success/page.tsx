"use client";
import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Breadcrumb from "@/components/Common/Breadcrumb";

const PaymentSuccessPage = () => {
  const searchParams = useSearchParams();

  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");
  const transactionNo = searchParams.get("transactionNo");

  useEffect(() => {
    // Clear cart from localStorage
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("cart");
    }
  }, []);

  const formatVnd = (amount: number) =>
    amount?.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    });

  return (
    <>
      <Breadcrumb title="Thanh toán thành công" pages={["Thanh toán"]} />
      <section className="relative overflow-hidden py-20 lg:py-25 bg-gray-1">
        {/* Decorative background blobs */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-green-light-5 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-light-5 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-teal-light-3 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" style={{ animationDelay: '4s' }}></div>

        <div className="relative max-w-[900px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-3">
            {/* Header with green theme */}
            <div className="bg-green px-8 py-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-green-light opacity-20 rounded-full -mr-32 -mt-32"></div>
              <div className="relative flex flex-col sm:flex-row items-center gap-6">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                  <svg className="w-12 h-12 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="text-center sm:text-left">
                  <h2 className="font-bold text-white text-3xl lg:text-heading-4 mb-2">
                    Thanh toán thành công!
                  </h2>
                  <p className="text-white opacity-90 text-lg">Đơn hàng đã được xác nhận và đang xử lý</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 sm:px-8 py-10">
              {/* Success message */}
              <div className="text-center mb-10">
                <p className="text-lg text-gray-6 max-w-2xl mx-auto leading-relaxed">
                  Cảm ơn bạn đã tin tưởng và thanh toán qua VNPay. Chúng tôi sẽ xử lý đơn hàng và giao đến bạn trong thời gian sớm nhất.
                </p>
              </div>

              {/* Payment Details Card */}
              <div className="bg-gray-1 rounded-xl p-6 lg:p-8 mb-8 border-2 border-gray-3">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-blue rounded-lg flex items-center justify-center shadow-md">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-2xl text-dark">Thông tin giao dịch</h3>
                </div>

                <div className="space-y-3">
                  {orderId && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 border-b border-gray-3 gap-2">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <span className="text-gray-6 font-medium text-base">Mã đơn hàng</span>
                      </div>
                      <span className="font-mono font-bold text-dark bg-white px-4 py-2 rounded-lg border-2 border-blue-light-5 text-lg">
                        #{orderId.slice(-8).toUpperCase()}
                      </span>
                    </div>
                  )}
                  {amount && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 border-b border-gray-3 gap-2">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-gray-6 font-medium text-base">Số tiền thanh toán</span>
                      </div>
                      <span className="font-bold text-green text-2xl">
                        {formatVnd(parseFloat(amount))}
                      </span>
                    </div>
                  )}
                  {transactionNo && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 border-b border-gray-3 gap-2">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span className="text-gray-6 font-medium text-base">Mã giao dịch VNPay</span>
                      </div>
                      <span className="font-mono text-dark text-base">{transactionNo}</span>
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 border-b border-gray-3 gap-2">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <span className="text-gray-6 font-medium text-base">Phương thức</span>
                    </div>
                    <span className="inline-flex items-center gap-2 font-semibold text-blue bg-blue-light-5 px-4 py-2 rounded-lg">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                        <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                      </svg>
                      VNPay Gateway
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 gap-2">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-6 font-medium text-base">Trạng thái</span>
                    </div>
                    <span className="inline-flex items-center gap-2 font-bold text-white bg-green px-5 py-2 rounded-full shadow-md">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Đã thanh toán
                    </span>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-blue-light-6 border-l-4 border-blue p-6 rounded-lg mb-10">
                <div className="flex gap-3">
                  <svg className="w-6 h-6 text-blue flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-bold text-dark text-lg mb-3">Các bước tiếp theo</h4>
                    <ul className="space-y-2.5 text-gray-7">
                      <li className="flex items-start gap-2">
                        <span className="text-blue mt-1 font-bold">✓</span>
                        <span>Chúng tôi sẽ xử lý đơn hàng của bạn trong vòng 24h</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue mt-1 font-bold">✓</span>
                        <span>Bạn sẽ nhận được email xác nhận và thông tin vận chuyển</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue mt-1 font-bold">✓</span>
                        <span>Theo dõi trạng thái đơn hàng trong mục "Đơn hàng của tôi"</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/my-account?tab=orders"
                  className="group inline-flex items-center justify-center gap-3 font-bold text-white bg-blue hover:bg-blue-dark py-4 px-8 rounded-xl ease-out duration-200 shadow-2 hover:shadow-3 transform hover:-translate-y-0.5"
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Xem đơn hàng của tôi
                </Link>
                <Link
                  href="/"
                  className="group inline-flex items-center justify-center gap-3 font-semibold text-dark bg-white border-2 border-gray-4 hover:border-gray-5 py-4 px-8 rounded-xl ease-out duration-200 shadow-1 hover:shadow-2 transform hover:-translate-y-0.5"
                >
                  <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Tiếp tục mua sắm
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default PaymentSuccessPage;
