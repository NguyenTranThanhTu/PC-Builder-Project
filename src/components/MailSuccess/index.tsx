import React from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Link from "next/link";

const MailSuccess = () => {
  // Giả lập lấy thông tin đơn hàng từ localStorage/sessionStorage (cần thay bằng API thực tế nếu có)
  let orderInfo: any = {};
  if (typeof window !== "undefined") {
    try {
      orderInfo = JSON.parse(window.localStorage.getItem("lastOrderInfo") || "{}");
    } catch {}
  }
  // Format VND
  const formatVnd = (amount: number) => amount?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });
  return (
    <>
      <Breadcrumb title={"MailSuccess"} pages={["MailSuccess"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="bg-white rounded-xl shadow-1 px-4 py-10 sm:py-15 lg:py-20 xl:py-25">
            <div className="text-center">
              <h2 className="font-bold text-blue text-4xl lg:text-[45px] lg:leading-[57px] mb-5">
                Đặt hàng thành công!
              </h2>
              <h3 className="font-medium text-dark text-xl sm:text-2xl mb-3">
                Cảm ơn bạn đã đặt hàng tại PC Builder!
              </h3>
              <p className="max-w-[491px] w-full mx-auto mb-7.5">
                Chúng tôi sẽ liên hệ xác nhận và giao hàng trong thời gian sớm nhất.
              </p>
              {/* Thông tin chi tiết đơn hàng */}
              <div className="max-w-[500px] mx-auto text-left bg-gray-1 rounded p-6 mb-7.5">
                <h4 className="font-semibold mb-3">Thông tin đơn hàng:</h4>
                <div className="mb-2">Tên khách hàng: <b>{orderInfo.customerName}</b></div>
                <div className="mb-2">Email: <b>{orderInfo.customerEmail}</b></div>
                <div className="mb-2">Số điện thoại: <b>{orderInfo.customerPhone}</b></div>
                <div className="mb-2">Địa chỉ: <b>{orderInfo.shippingAddress}</b></div>
                <div className="mb-2">Thành phố: <b>{orderInfo.city}</b></div>
                <div className="mb-2">Quốc gia/Khu vực: <b>{orderInfo.country}</b></div>
                <div className="mb-2">Phương thức thanh toán: <b>{orderInfo.paymentMethod === "bank" ? "Chuyển khoản ngân hàng" : orderInfo.paymentMethod === "cash" ? "Thanh toán khi nhận hàng" : orderInfo.paymentMethod}</b></div>
                <div className="mb-2">Ghi chú: <b>{orderInfo.note || '-'}</b></div>
                {/* Hiển thị sản phẩm đã đặt */}
                {orderInfo.items && Array.isArray(orderInfo.items) && orderInfo.items.length > 0 && (
                  <div className="mb-2">
                    <h5 className="font-semibold mb-2">Sản phẩm đã đặt:</h5>
                    <ul className="list-disc pl-5">
                      {orderInfo.items.map((it: any, idx: number) => (
                        <li key={idx}>
                          {it.title ? `${it.title}` : `ID: ${it.productId}`} x {it.quantity} - {formatVnd(it.discountedPrice || it.price)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="mb-2">Tổng tiền: <b>{orderInfo.total ? formatVnd(orderInfo.total) : '-'}</b></div>
                {orderInfo.paymentMethod === "bank" && (
                  <div className="mb-2">
                    <img src="/images/checkout/QR_thanhtoan.jpg" alt="Bank QR" className="max-w-[350px] w-full rounded" />
                  </div>
                )}
              </div>
              <Link
                href="/"
                className="inline-flex items-center gap-2 font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark"
              >
                <svg
                  className="fill-current"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M16.6654 9.37502C17.0105 9.37502 17.2904 9.65484 17.2904 10C17.2904 10.3452 17.0105 10.625 16.6654 10.625H8.95703L8.95703 15C8.95703 15.2528 8.80476 15.4807 8.57121 15.5774C8.33766 15.6742 8.06884 15.6207 7.89009 15.442L2.89009 10.442C2.77288 10.3247 2.70703 10.1658 2.70703 10C2.70703 9.83426 2.77288 9.67529 2.89009 9.55808L7.89009 4.55808C8.06884 4.37933 8.33766 4.32586 8.57121 4.42259C8.80475 4.51933 8.95703 4.74723 8.95703 5.00002L8.95703 9.37502H16.6654Z"
                    fill=""
                  />
                </svg>
                Về trang chủ
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default MailSuccess;
