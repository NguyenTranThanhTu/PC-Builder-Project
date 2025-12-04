"use client";
import React from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Login from "./Login";
import Shipping from "./Shipping";
import ShippingMethod from "./ShippingMethod";
import PaymentMethod from "./PaymentMethod";
import Coupon from "./Coupon";
import Billing from "./Billing";
import CouponSelectorModal from "./CouponSelectorModal";
import { useAppSelector } from "@/redux/store";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { removeAllItemsFromCart } from "@/redux/features/cart-slice";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { formatVnd } from "@/lib/formatVnd";

const Checkout = () => {
  const cartItems = useAppSelector((s) => s.cartReducer.items);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { status } = useSession();
  
  const [paymentMethod, setPaymentMethod] = React.useState<string>("cash");
  const [selectedCoupon, setSelectedCoupon] = React.useState<string>("");
  const [couponDiscount, setCouponDiscount] = React.useState<number>(0);
  const [isCouponModalOpen, setIsCouponModalOpen] = React.useState(false);
  const [selectedBank, setSelectedBank] = React.useState<string>("");
  const [isProcessing, setIsProcessing] = React.useState(false);

  // Calculate totals
  const items = cartItems;
  const merchandise = items.reduce((sum, it: any) => sum + (it.discountedPrice || it.price) * it.quantity, 0);
  const shippingFee = items.length ? 15000 : 0;
  const subtotal = merchandise + shippingFee;
  const total = subtotal - couponDiscount;

  // Validate coupon function
  const validateCoupon = React.useCallback(async (code: string) => {
    try {
      const merchandiseInCents = merchandise * 100;
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ couponCode: code, orderTotal: merchandiseInCents }),
      });
      const data = await res.json();
      if (data.valid) {
        setCouponDiscount(data.discountAmount / 100);
      } else {
        setCouponDiscount(0);
        setSelectedCoupon("");
      }
    } catch (error) {
      console.error("Coupon validation failed:", error);
      setCouponDiscount(0);
    }
  }, [merchandise]);

  // Validate coupon when selected
  React.useEffect(() => {
    if (selectedCoupon) {
      validateCoupon(selectedCoupon);
    } else {
      setCouponDiscount(0);
    }
  }, [selectedCoupon, validateCoupon]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status !== "authenticated") {
      window.location.href = "/signin";
      return;
    }
    if (!cartItems.length) {
      alert("Giỏ hàng đang trống");
      return;
    }
    const missing = cartItems.filter((i) => !("productId" in i) || !(i as any).productId);
    if (missing.length) {
      alert("Một số sản phẩm trong giỏ thiếu mã sản phẩm. Vui lòng thêm lại từ trang chủ (đã được cập nhật)!");
      return;
    }

    const form = e.currentTarget;
    const fd = new FormData(form);
    const firstName = String(fd.get("firstName") || "").trim();
    const lastName = String(fd.get("lastName") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const phone = String(fd.get("phone") || "").trim();
    const addr1 = String(fd.get("address") || "").trim();
    const notes = String(fd.get("notes") || "").trim();
    const countryName = String(fd.get("countryName") || "Việt Nam");
    const city = String(fd.get("town") || "");

    const customerName = [firstName, lastName].filter(Boolean).join(" ");
    // Bổ sung thông tin user từ session
    let userInfo = {};
    if (status === "authenticated" && typeof window !== "undefined") {
      const sessionData = window.sessionStorage.getItem("next-auth.session");
      if (sessionData) {
        try {
          const session = JSON.parse(sessionData);
          userInfo = {
            userName: session?.user?.name,
            userEmail: session?.user?.email,
          };
        } catch {}
      }
    }
    // Save full product info for mail-success page
    const itemsWithDetails = cartItems.map((i: any) => ({
      productId: i.productId as string,
      quantity: i.quantity,
      title: i.title,
      price: i.price,
      discountedPrice: i.discountedPrice
    }));
    // Calculate total (same as UI)
    const merchandise = itemsWithDetails.reduce((sum, it) => sum + (it.discountedPrice || it.price) * it.quantity, 0);
    const shippingFee = itemsWithDetails.length ? 15000 : 0;
    const subtotal = merchandise + shippingFee;
    const total = subtotal - couponDiscount;
    const payload = {
      customerName,
      customerEmail: email || undefined,
      customerPhone: phone || undefined,
      shippingAddress: addr1 || undefined,
      note: notes || undefined,
      country: countryName,
      city,
      paymentMethod,
      items: itemsWithDetails,
      subtotal,
      total,
      couponCode: selectedCoupon || undefined,
      couponDiscount,
      ...userInfo,
    };

    try {
      setIsProcessing(true);
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data?.error || "Đặt hàng thất bại");
        setIsProcessing(false);
        return;
      }

      const orderId = data.orderId;

      // Lưu thông tin đơn hàng vào localStorage để hiển thị ở trang xác nhận
      if (typeof window !== "undefined") {
        window.localStorage.setItem("lastOrderInfo", JSON.stringify(payload));
        console.log("[Checkout] Saved lastOrderInfo:", payload);
      }

      // If VNPay payment selected, redirect to payment gateway
      if (paymentMethod === "vnpay") {
        try {
          const vnpayRes = await fetch("/api/vnpay/create-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              orderId,
              bankCode: selectedBank || undefined 
            }),
          });
          const vnpayData = await vnpayRes.json();
          
          if (!vnpayRes.ok) {
            alert(vnpayData?.error || "Không thể tạo link thanh toán VNPay");
            setIsProcessing(false);
            return;
          }

          // Clear cart and redirect to VNPay
          dispatch(removeAllItemsFromCart());
          window.location.href = vnpayData.paymentUrl;
          return;
        } catch (err) {
          console.error("VNPay payment error:", err);
          alert("Lỗi khi tạo thanh toán VNPay");
          setIsProcessing(false);
          return;
        }
      }

      // For other payment methods (cash, bank_transfer)
      dispatch(removeAllItemsFromCart());
      router.push("/mail-success");
    } catch (err) {
      setIsProcessing(false);
      console.error(err);
      alert("Có lỗi khi kết nối máy chủ");
    }
  }

  return (
    <>
    <section className="overflow-hidden py-20 bg-gray-2">
      <Breadcrumb title={"Checkout"} pages={["checkout"]} />
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <form onSubmit={onSubmit}>
            <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-11">
              {/* <!-- checkout left --> */}
              <div className="lg:max-w-[670px] w-full">
                {/* <!-- login box --> */}
                <Login />

                {/* <!-- billing details --> */}
                <Billing />

                {/* Shipping đã bị loại bỏ theo yêu cầu */}

                {/* <!-- others note box --> */}
                <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5 mt-7.5">
                  <div>
                    <label htmlFor="notes" className="block mb-2.5">
                      Other Notes (optional)
                    </label>

                    <textarea
                      name="notes"
                      id="notes"
                      rows={5}
                      placeholder="Notes about your order, e.g. speacial notes for delivery."
                      className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full p-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* // <!-- checkout right --> */}
              <div className="max-w-[455px] w-full">
                {/* <!-- order list box --> */}
                <div className="bg-white shadow-1 rounded-[10px]">
                  <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
                    <h3 className="font-medium text-xl text-dark">
                      Your Order
                    </h3>
                  </div>

                  <div className="pt-2.5 pb-8.5 px-4 sm:px-8.5">
                    {/* <!-- title --> */}
                    <div className="flex items-center justify-between py-5 border-b border-gray-3">
                      <div>
                        <h4 className="font-medium text-dark">Product</h4>
                      </div>
                      <div>
                        <h4 className="font-medium text-dark text-right">
                          Subtotal
                        </h4>
                      </div>
                    </div>

                    {/* <!-- dynamic cart items --> */}
                    {items.map((it: any) => (
                      <div key={it.id} className="flex items-center justify-between py-5 border-b border-gray-3">
                        <div>
                          <p className="text-dark">{it.title} x {it.quantity}</p>
                        </div>
                        <div>
                          <p className="text-dark text-right">{formatVnd((it.discountedPrice || it.price) * it.quantity)}</p>
                        </div>
                      </div>
                    ))}
                    {/* <!-- shipping fee --> */}
                    {shippingFee > 0 && (
                      <div className="flex items-center justify-between py-5 border-b border-gray-3">
                        <div>
                          <p className="text-dark">Phí vận chuyển</p>
                        </div>
                        <div>
                          <p className="text-dark text-right">{formatVnd(shippingFee)}</p>
                        </div>
                      </div>
                    )}

                    {/* <!-- coupon selector --> */}
                    <div className="py-5 border-b border-gray-3">
                      <button
                        type="button"
                        onClick={() => setIsCouponModalOpen(true)}
                        className="w-full flex items-center justify-between py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <svg className="w-6 h-6 text-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                          </svg>
                          <div className="text-left">
                            {selectedCoupon ? (
                              <>
                                <p className="font-mono font-bold text-blue">{selectedCoupon}</p>
                                <p className="text-xs text-gray-600">-{formatVnd(couponDiscount)}</p>
                              </>
                            ) : (
                              <>
                                <p className="font-medium text-dark">Chọn mã giảm giá</p>
                                <p className="text-xs text-gray-600">Nhấn để xem các mã có sẵn</p>
                              </>
                            )}
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-blue transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>

                    {/* <!-- coupon discount --> */}
                    {couponDiscount > 0 && (
                      <div className="flex items-center justify-between py-5 border-b border-gray-3">
                        <div>
                          <p className="text-green font-medium">Giảm giá</p>
                        </div>
                        <div>
                          <p className="text-green font-medium text-right">-{formatVnd(couponDiscount)}</p>
                        </div>
                      </div>
                    )}

                    {/* <!-- total --> */}
                    <div className="flex items-center justify-between pt-5">
                      <div>
                        <h4 className="font-semibold text-xl text-dark">Tổng cộng</h4>
                      </div>
                      <div>
                        <h4 className="font-semibold text-xl text-dark text-right">
                          {formatVnd(total)}
                        </h4>
                      </div>
                    </div>
                </div>
              </div>

              {/* <!-- payment box --> */}
              <PaymentMethod 
                paymentMethod={paymentMethod} 
                setPaymentMethod={setPaymentMethod}
                selectedBank={selectedBank}
                setSelectedBank={setSelectedBank}
              />

                {/* <!-- checkout button --> */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`w-full flex justify-center items-center gap-2 font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5 ${isProcessing ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  {isProcessing && (
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                  )}
                  {isProcessing ? 'Đang xử lý...' : (paymentMethod === 'vnpay' ? 'Thanh toán VNPay' : 'Process to Checkout')}
                </button>
            </div>
          </div>
        </form>
      </div>

      {/* Coupon Modal */}
      <CouponSelectorModal
        isOpen={isCouponModalOpen}
        onClose={() => setIsCouponModalOpen(false)}
        onSelectCoupon={setSelectedCoupon}
        currentCoupon={selectedCoupon}
        orderTotal={merchandise * 100}
      />
    </section>
    </>
  );
};

export default Checkout;
