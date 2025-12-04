"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

type DiscountType = "PERCENTAGE" | "FIXED_AMOUNT";

type Coupon = {
  id: string;
  code: string;
  description: string | null;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue: number;
  maxDiscount: number | null;
  maxUsage: number | null;
  usageCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  forVIPOnly: boolean;
  minVIPTier: number | null;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSelectCoupon: (code: string) => void;
  currentCoupon?: string | null;
  orderTotal: number; // in cents
};

export default function CouponSelectorModal({
  isOpen,
  onClose,
  onSelectCoupon,
  currentCoupon,
  orderTotal,
}: Props) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState<string | null>(null);
  const [inputCode, setInputCode] = useState("");
  const [tab, setTab] = useState<"all" | "vip">("all");

  useEffect(() => {
    if (isOpen) {
      fetchCoupons();
    }
  }, [isOpen]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/public/coupons/available");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setCoupons(data.coupons || []);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh sách mã giảm giá");
    } finally {
      setLoading(false);
    }
  };

  const validateAndApplyCoupon = async (code: string) => {
    try {
      setValidating(code);
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ couponCode: code, orderTotal }),
      });

      const data = await res.json();

      if (!res.ok || !data.valid) {
        toast.error(data.error || "Mã không hợp lệ");
        return;
      }

      toast.success(`Áp dụng mã ${code} thành công!`);
      onSelectCoupon(code);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra");
    } finally {
      setValidating(null);
    }
  };

  const handleApplyInputCode = () => {
    if (!inputCode.trim()) {
      toast.error("Vui lòng nhập mã giảm giá");
      return;
    }
    validateAndApplyCoupon(inputCode.toUpperCase());
  };

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("vi-VN") + "₫";
  };

  const getDiscountDisplay = (coupon: Coupon) => {
    if (coupon.discountType === "PERCENTAGE") {
      return `${coupon.discountValue}%`;
    }
    return formatPrice(coupon.discountValue);
  };

  const isEligible = (coupon: Coupon) => {
    if (orderTotal < coupon.minOrderValue) return false;
    if (coupon.maxUsage && coupon.usageCount >= coupon.maxUsage) return false;
    const now = new Date();
    if (new Date(coupon.startDate) > now || new Date(coupon.endDate) < now) return false;
    return true;
  };

  const filteredCoupons = coupons.filter((c) => {
    if (tab === "vip") return c.forVIPOnly;
    return true;
  });

  const eligibleCoupons = filteredCoupons.filter(isEligible);
  const ineligibleCoupons = filteredCoupons.filter((c) => !isEligible(c));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-dark">Chọn mã giảm giá</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Input Code */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === "Enter" && handleApplyInputCode()}
              placeholder="Nhập mã giảm giá..."
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue focus:border-transparent font-mono font-semibold uppercase"
            />
            <button
              onClick={handleApplyInputCode}
              disabled={validating === inputCode || !inputCode.trim()}
              className="px-6 py-2.5 bg-blue text-white rounded-lg hover:bg-blue-dark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {validating === inputCode ? "..." : "Áp dụng"}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setTab("all")}
            className={`flex-1 px-6 py-3 font-medium transition-colors relative ${
              tab === "all"
                ? "text-blue border-b-2 border-blue"
                : "text-gray-600 hover:text-blue"
            }`}
          >
            Tất cả mã
            {tab === "all" && eligibleCoupons.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-blue text-white text-xs rounded-full">
                {eligibleCoupons.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab("vip")}
            className={`flex-1 px-6 py-3 font-medium transition-colors relative ${
              tab === "vip"
                ? "text-blue border-b-2 border-blue"
                : "text-gray-600 hover:text-blue"
            }`}
          >
            <span className="flex items-center justify-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              VIP độc quyền
            </span>
          </button>
        </div>

        {/* Coupon List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Đang tải...</div>
          ) : (
            <>
              {/* Eligible Coupons */}
              {eligibleCoupons.length > 0 && (
                <div className="space-y-3 mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase">
                    Có thể áp dụng ({eligibleCoupons.length})
                  </h3>
                  {eligibleCoupons.map((coupon) => (
                    <CouponCard
                      key={coupon.id}
                      coupon={coupon}
                      isSelected={currentCoupon === coupon.code}
                      isEligible={true}
                      onSelect={() => validateAndApplyCoupon(coupon.code)}
                      isValidating={validating === coupon.code}
                      formatPrice={formatPrice}
                      getDiscountDisplay={getDiscountDisplay}
                    />
                  ))}
                </div>
              )}

              {/* Ineligible Coupons */}
              {ineligibleCoupons.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase">
                    Không đủ điều kiện ({ineligibleCoupons.length})
                  </h3>
                  {ineligibleCoupons.map((coupon) => (
                    <CouponCard
                      key={coupon.id}
                      coupon={coupon}
                      isSelected={false}
                      isEligible={false}
                      onSelect={() => {}}
                      isValidating={false}
                      formatPrice={formatPrice}
                      getDiscountDisplay={getDiscountDisplay}
                      orderTotal={orderTotal}
                    />
                  ))}
                </div>
              )}

              {filteredCoupons.length === 0 && (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                  <p className="text-gray-500">Không có mã giảm giá</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50">
          {currentCoupon && (
            <button
              onClick={() => {
                onSelectCoupon("");
                toast.success("Đã bỏ chọn mã giảm giá");
                onClose();
              }}
              className="w-full py-2.5 text-red hover:bg-red-50 rounded-lg font-medium transition-colors"
            >
              Bỏ chọn mã giảm giá
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Coupon Card Component
type CouponCardProps = {
  coupon: Coupon;
  isSelected: boolean;
  isEligible: boolean;
  onSelect: () => void;
  isValidating: boolean;
  formatPrice: (cents: number) => string;
  getDiscountDisplay: (coupon: Coupon) => string;
  orderTotal?: number;
};

function CouponCard({
  coupon,
  isSelected,
  isEligible,
  onSelect,
  isValidating,
  formatPrice,
  getDiscountDisplay,
  orderTotal,
}: CouponCardProps) {
  const getIneligibleReason = () => {
    if (!orderTotal) return null;
    if (orderTotal < coupon.minOrderValue) {
      const needed = (coupon.minOrderValue - orderTotal) / 100;
      return `Thiếu ${needed.toLocaleString("vi-VN")}₫`;
    }
    if (coupon.maxUsage && coupon.usageCount >= coupon.maxUsage) {
      return "Đã hết lượt sử dụng";
    }
    const now = new Date();
    if (new Date(coupon.startDate) > now) {
      return "Chưa đến thời gian";
    }
    if (new Date(coupon.endDate) < now) {
      return "Đã hết hạn";
    }
    return null;
  };

  return (
    <div
      className={`border-2 rounded-xl p-4 transition-all ${
        isSelected
          ? "border-blue bg-blue-50"
          : isEligible
          ? "border-gray-200 hover:border-blue hover:shadow-md cursor-pointer"
          : "border-gray-200 bg-gray-50 opacity-60"
      }`}
      onClick={isEligible ? onSelect : undefined}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`flex-shrink-0 w-16 h-16 rounded-lg flex items-center justify-center ${
          isEligible ? "bg-gradient-to-br from-blue to-purple" : "bg-gray-300"
        }`}>
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono font-bold text-blue text-lg">{coupon.code}</span>
              {coupon.forVIPOnly && (
                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  VIP
                </span>
              )}
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green">
                {getDiscountDisplay(coupon)}
              </div>
              {coupon.maxDiscount && coupon.discountType === "PERCENTAGE" && (
                <div className="text-xs text-gray-500">Tối đa {formatPrice(coupon.maxDiscount)}</div>
              )}
            </div>
          </div>

          <p className="text-sm text-gray-700 mb-2 line-clamp-2">
            {coupon.description || "Áp dụng mã giảm giá"}
          </p>

          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">
              {coupon.minOrderValue > 0 ? `Đơn tối thiểu ${formatPrice(coupon.minOrderValue)}` : "Không giới hạn"}
            </span>
            {!isEligible && (
              <span className="text-red font-medium">{getIneligibleReason()}</span>
            )}
          </div>

          {coupon.maxUsage && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Đã dùng {coupon.usageCount}/{coupon.maxUsage}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-blue transition-all"
                  style={{ width: `${Math.min(100, (coupon.usageCount / coupon.maxUsage) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Select Button/Checkbox */}
        {isEligible && (
          <div className="flex-shrink-0">
            {isValidating ? (
              <div className="w-6 h-6 border-2 border-blue border-t-transparent rounded-full animate-spin" />
            ) : isSelected ? (
              <div className="w-6 h-6 bg-blue rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : (
              <div className="w-6 h-6 border-2 border-gray-300 rounded-full" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
