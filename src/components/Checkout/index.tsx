"use client";
import React from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Login from "./Login";
import Shipping from "./Shipping";
import ShippingMethod from "./ShippingMethod";
import PaymentMethod from "./PaymentMethod";
import Coupon from "./Coupon";
import Billing from "./Billing";
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
    const total = merchandise + shippingFee;
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
      total,
      ...userInfo,
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data?.error || "Đặt hàng thất bại");
        return;
      }
      // Lưu thông tin đơn hàng vào localStorage để hiển thị ở trang xác nhận
      if (typeof window !== "undefined") {
        window.localStorage.setItem("lastOrderInfo", JSON.stringify(payload));
      }
      dispatch(removeAllItemsFromCart());
      router.push("/mail-success");
    } catch (err) {
      console.error(err);
      alert("Có lỗi khi kết nối máy chủ");
    }
  }

  // derive totals from cart
  const items = cartItems;
  const merchandise = items.reduce((sum, it: any) => sum + (it.discountedPrice || it.price) * it.quantity, 0);
  const shippingFee = items.length ? 15000 : 0; // 15,000 VND
  const total = merchandise + shippingFee;

  return (
    <>
      <Breadcrumb title={"Checkout"} pages={["checkout"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
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

                    {/* <!-- total --> */}
                    <div className="flex items-center justify-between pt-5">
                      <div>
                        <p className="font-medium text-lg text-dark">Tổng cộng</p>
                      </div>
                      <div>
                        <p className="font-medium text-lg text-dark text-right">
                          {formatVnd(total)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* <!-- coupon box --> */}
                <Coupon />

                {/* ShippingMethod đã bị loại bỏ theo yêu cầu */}

                {/* <!-- payment box --> */}
                <PaymentMethod paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />

                {/* <!-- checkout button --> */}
                <button
                  type="submit"
                  className="w-full flex justify-center font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5"
                >
                  Process to Checkout
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default Checkout;
