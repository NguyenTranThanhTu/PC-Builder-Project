"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Breadcrumb from "@/components/Common/Breadcrumb";

const PaymentSuccessPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [orderInfo, setOrderInfo] = useState<any>(null);

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
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[800px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="bg-white rounded-xl shadow-1 px-4 py-10 sm:py-15 lg:py-20 xl:py-25">
            <div className="text-center">
              {/* Success Icon */}
              <div className="mx-auto w-20 h-20 mb-6 bg-green-light rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-green"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <h2 className="font-bold text-green text-4xl lg:text-[45px] lg:leading-[57px] mb-5">
                Thanh toán thành công!
              </h2>
              <h3 className="font-medium text-dark text-xl sm:text-2xl mb-3">
                Đơn hàng của bạn đã được xác nhận
              </h3>
              <p className="max-w-[491px] w-full mx-auto mb-7.5 text-gray-600">
                Cảm ơn bạn đã thanh toán qua VNPay. Chúng tôi sẽ xử lý và giao
                hàng trong thời gian sớm nhất.
              </p>

              {/* Payment Details */}
              <div className="max-w-[500px] mx-auto text-left bg-gray-1 rounded-lg p-6 mb-7.5">
                <h4 className="font-semibold mb-4 text-lg text-center">
                  Thông tin thanh toán
                </h4>
                {orderId && (
                  <div className="mb-3 flex justify-between">
                    <span className="text-gray-600">Mã đơn hàng:</span>
                    <span className="font-mono font-semibold">{orderId}</span>
                  </div>
                )}
                {amount && (
                  <div className="mb-3 flex justify-between">
                    <span className="text-gray-600">Số tiền:</span>
                    <span className="font-bold text-green text-lg">
                      {formatVnd(parseFloat(amount))}
                    </span>
                  </div>
                )}
                {transactionNo && (
                  <div className="mb-3 flex justify-between">
                    <span className="text-gray-600">Mã giao dịch:</span>
                    <span className="font-mono">{transactionNo}</span>
                  </div>
                )}
                <div className="mb-3 flex justify-between">
                  <span className="text-gray-600">Phương thức:</span>
                  <span className="font-medium text-blue">VNPay</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Trạng thái:</span>
                  <span className="inline-flex items-center gap-1 font-medium text-green">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Đã thanh toán
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {orderId && (
                  <Link
                    href={`/my-account?tab=orders&orderId=${orderId}`}
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
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Xem chi tiết đơn hàng
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

export default PaymentSuccessPage;
