import React, { useState } from "react";
import Image from "next/image";

interface PaymentMethodProps {
  paymentMethod: string;
  setPaymentMethod: (val: string) => void;
  selectedBank?: string;
  setSelectedBank?: (val: string) => void;
}
const PaymentMethod = ({ paymentMethod, setPaymentMethod, selectedBank, setSelectedBank }: PaymentMethodProps) => {
  const VNPAY_BANKS = [
    { code: "", name: "Cổng thanh toán VNPay (Quét QR)" },
    { code: "VIETCOMBANK", name: "Ngân hàng TMCP Ngoại Thương Việt Nam (Vietcombank)" },
    { code: "VIETINBANK", name: "Ngân hàng TMCP Công Thương Việt Nam (VietinBank)" },
    { code: "BIDV", name: "Ngân hàng TMCP Đầu Tư và Phát Triển Việt Nam (BIDV)" },
    { code: "AGRIBANK", name: "Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam (Agribank)" },
    { code: "SACOMBANK", name: "Ngân hàng TMCP Sài Gòn Thương Tín (Sacombank)" },
    { code: "TECHCOMBANK", name: "Ngân hàng TMCP Kỹ Thương Việt Nam (Techcombank)" },
    { code: "ACB", name: "Ngân hàng TMCP Á Châu (ACB)" },
    { code: "VPBANK", name: "Ngân hàng TMCP Việt Nam Thịnh Vượng (VPBank)" },
    { code: "TPBANK", name: "Ngân hàng TMCP Tiên Phong (TPBank)" },
    { code: "MB", name: "Ngân hàng TMCP Quân Đội (MB)" },
  ];

  return (
    <div className="bg-white shadow-1 rounded-[10px] mt-7.5">
      <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
        <h3 className="font-medium text-xl text-dark">Payment Method</h3>
      </div>

      <div className="p-4 sm:p-8.5">
        <div className="flex flex-col gap-3">
          {/* VNPay Payment Option */}
          <label
            htmlFor="vnpay"
            className="flex cursor-pointer select-none items-center gap-4"
          >
            <div className="relative">
              <input
                type="radio"
                name="paymentMethod"
                id="vnpay"
                className="sr-only"
                checked={paymentMethod === "vnpay"}
                onChange={() => setPaymentMethod("vnpay")}
              />
              <div
                className={`flex h-4 w-4 items-center justify-center rounded-full ${
                  paymentMethod === "vnpay"
                    ? "border-4 border-blue"
                    : "border border-gray-4"
                }`}
              ></div>
            </div>

            <div
              className={`rounded-md border-[0.5px] py-3.5 px-5 ease-out duration-200 hover:bg-gray-2 hover:border-transparent hover:shadow-none flex-1 ${
                paymentMethod === "vnpay"
                  ? "border-transparent bg-gray-2"
                  : " border-gray-4 shadow-1"
              }`}
            >
              <div className="flex items-center">
                <div className="pr-2.5">
                  <svg className="w-7 h-7 text-blue" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                  </svg>
                </div>

                <div className="border-l border-gray-4 pl-2.5">
                  <p className="font-medium">VNPay Payment Gateway</p>
                  <p className="text-xs text-gray-500 mt-0.5">Thanh toán trực tuyến qua VNPay</p>
                </div>
              </div>
            </div>
          </label>

          {/* Bank Selection for VNPay */}
          {paymentMethod === "vnpay" && setSelectedBank && (
            <div className="ml-8 pl-5 border-l-2 border-blue-light py-3">
              <label className="block text-sm font-medium text-dark mb-2">
                Chọn ngân hàng (Không bắt buộc)
              </label>
              <select
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                className="w-full rounded-md border border-gray-4 py-2.5 px-4 outline-none focus:border-blue"
              >
                {VNPAY_BANKS.map((bank) => (
                  <option key={bank.code} value={bank.code}>
                    {bank.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-2">
                💡 Bỏ qua để thanh toán bằng QR Code tại cổng VNPay
              </p>
            </div>
          )}

          {/* Cash on Delivery Option */}
          <label
            htmlFor="cash"
            className="flex cursor-pointer select-none items-center gap-4"
          >
            <div className="relative">
              <input
                type="radio"
                name="paymentMethod"
                id="cash"
                className="sr-only"
                checked={paymentMethod === "cash"}
                onChange={() => setPaymentMethod("cash")}
              />
              <div
                className={`flex h-4 w-4 items-center justify-center rounded-full ${
                  paymentMethod === "cash"
                    ? "border-4 border-blue"
                    : "border border-gray-4"
                }`}
              ></div>
            </div>

            <div
              className={`rounded-md border-[0.5px] py-3.5 px-5 ease-out duration-200 hover:bg-gray-2 hover:border-transparent hover:shadow-none min-w-[240px] ${
                paymentMethod === "cash"
                  ? "border-transparent bg-gray-2"
                  : " border-gray-4 shadow-1"
              }`}
            >
              <div className="flex items-center">
                <div className="pr-2.5">
                  <Image src="/images/checkout/cash.svg" alt="cash" width={21} height={21} />
                </div>

                <div className="border-l border-gray-4 pl-2.5">
                  <p>Cash on delivery</p>
                </div>
              </div>
            </div>
          </label>

        </div>
      </div>
    </div>
  );
};

export default PaymentMethod;
