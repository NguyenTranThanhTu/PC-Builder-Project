"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

type DiscountType = "PERCENTAGE" | "FIXED_AMOUNT";

type CouponFormData = {
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: string;
  minOrderValue: string;
  maxDiscount: string;
  maxUsage: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  forVIPOnly: boolean;
  minVIPTier: string;
};

type Coupon = {
  id: string;
  code: string;
  description: string | null;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue: number;
  maxDiscount: number | null;
  maxUsage: number | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
  forVIPOnly: boolean;
  minVIPTier: number | null;
};

type Props = {
  coupon?: Coupon | null;
  onClose: () => void;
  onSuccess: () => void;
};

export default function CouponFormModal({ coupon, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CouponFormData>({
    code: "",
    description: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    minOrderValue: "0",
    maxDiscount: "",
    maxUsage: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    isActive: true,
    forVIPOnly: false,
    minVIPTier: "",
  });

  useEffect(() => {
    if (coupon) {
      setFormData({
        code: coupon.code,
        description: coupon.description || "",
        discountType: coupon.discountType,
        discountValue: String(coupon.discountValue / 100), // Convert from cents
        minOrderValue: String(coupon.minOrderValue / 100),
        maxDiscount: coupon.maxDiscount ? String(coupon.maxDiscount / 100) : "",
        maxUsage: coupon.maxUsage ? String(coupon.maxUsage) : "",
        startDate: coupon.startDate.split("T")[0],
        endDate: coupon.endDate.split("T")[0],
        isActive: coupon.isActive,
        forVIPOnly: coupon.forVIPOnly,
        minVIPTier: coupon.minVIPTier ? String(coupon.minVIPTier) : "",
      });
    }
  }, [coupon]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
      if (!formData.code.trim()) {
        toast.error("Vui lòng nhập mã code");
        return;
      }
      if (!formData.discountValue || Number(formData.discountValue) <= 0) {
        toast.error("Giá trị giảm giá không hợp lệ");
        return;
      }
      if (!formData.endDate) {
        toast.error("Vui lòng chọn ngày kết thúc");
        return;
      }

      // Convert VND to cents
      const payload = {
        code: formData.code.toUpperCase(),
        description: formData.description.trim() || null,
        discountType: formData.discountType,
        discountValue: formData.discountType === "PERCENTAGE" 
          ? Number(formData.discountValue) // Percentage as-is
          : Number(formData.discountValue) * 100, // VND to cents
        minOrderValue: Number(formData.minOrderValue) * 100,
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) * 100 : null,
        maxUsage: formData.maxUsage ? Number(formData.maxUsage) : null,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        isActive: formData.isActive,
        forVIPOnly: formData.forVIPOnly,
        minVIPTier: formData.minVIPTier ? Number(formData.minVIPTier) : null,
      };

      const url = coupon
        ? `/api/admin/coupons/${coupon.id}`
        : "/api/admin/coupons";
      const method = coupon ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save");
      }

      toast.success(coupon ? "Đã cập nhật mã giảm giá" : "Đã tạo mã giảm giá mới");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-3xl w-full p-6 my-8">
        <h2 className="text-2xl font-semibold mb-6">
          {coupon ? "Chỉnh sửa mã giảm giá" : "Tạo mã giảm giá mới"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Code */}
          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Mã code <span className="text-red">*</span>
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              disabled={!!coupon} // Cannot edit code
              placeholder="WELCOME10"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue focus:border-transparent disabled:bg-gray-100 font-mono font-bold"
              required
            />
            {coupon && (
              <p className="text-xs text-gray-500 mt-1">Mã code không thể thay đổi</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-dark mb-2">Mô tả</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Giảm 10% cho khách hàng mới..."
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue focus:border-transparent"
            />
          </div>

          {/* Discount Type & Value */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Loại giảm giá <span className="text-red">*</span>
              </label>
              <select
                value={formData.discountType}
                onChange={(e) =>
                  setFormData({ ...formData, discountType: e.target.value as DiscountType })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue focus:border-transparent"
              >
                <option value="PERCENTAGE">Phần trăm (%)</option>
                <option value="FIXED_AMOUNT">Số tiền cố định (VNĐ)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Giá trị <span className="text-red">*</span>
              </label>
              <input
                type="number"
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                placeholder={formData.discountType === "PERCENTAGE" ? "10" : "50000"}
                min="0"
                step={formData.discountType === "PERCENTAGE" ? "1" : "1000"}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.discountType === "PERCENTAGE" ? "Ví dụ: 10 (= 10%)" : "Ví dụ: 50000 (= 50k VNĐ)"}
              </p>
            </div>
          </div>

          {/* Min Order & Max Discount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Đơn hàng tối thiểu (VNĐ)
              </label>
              <input
                type="number"
                value={formData.minOrderValue}
                onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                placeholder="0"
                min="0"
                step="1000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">0 = Không giới hạn</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Giảm tối đa (VNĐ)
              </label>
              <input
                type="number"
                value={formData.maxDiscount}
                onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                placeholder="Không giới hạn"
                min="0"
                step="1000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue focus:border-transparent"
                disabled={formData.discountType === "FIXED_AMOUNT"}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.discountType === "PERCENTAGE" ? "Áp dụng cho loại %" : "Không áp dụng cho số tiền cố định"}
              </p>
            </div>
          </div>

          {/* Max Usage */}
          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Giới hạn sử dụng
            </label>
            <input
              type="number"
              value={formData.maxUsage}
              onChange={(e) => setFormData({ ...formData, maxUsage: e.target.value })}
              placeholder="Không giới hạn"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Để trống = Không giới hạn số lần sử dụng</p>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Ngày bắt đầu <span className="text-red">*</span>
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Ngày kết thúc <span className="text-red">*</span>
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                min={formData.startDate}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* VIP Settings */}
          <div className="border-t pt-5">
            <h3 className="font-semibold text-dark mb-3">Cài đặt VIP</h3>
            
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.forVIPOnly}
                  onChange={(e) =>
                    setFormData({ ...formData, forVIPOnly: e.target.checked })
                  }
                  className="w-4 h-4 text-blue focus:ring-blue rounded"
                />
                <span className="text-sm text-dark">Chỉ dành cho khách hàng VIP</span>
              </label>

              {formData.forVIPOnly && (
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    Yêu cầu VIP tối thiểu
                  </label>
                  <select
                    value={formData.minVIPTier}
                    onChange={(e) => setFormData({ ...formData, minVIPTier: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue focus:border-transparent"
                  >
                    <option value="">Tất cả VIP</option>
                    <option value="1">VIP Đồng trở lên</option>
                    <option value="2">VIP Bạc trở lên</option>
                    <option value="3">Chỉ VIP Vàng</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Active Status */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-blue focus:ring-blue rounded"
              />
              <span className="text-sm text-dark">Kích hoạt mã giảm giá ngay</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue text-white rounded-lg hover:bg-blue-dark disabled:opacity-50 font-medium"
            >
              {loading ? "Đang lưu..." : coupon ? "Cập nhật" : "Tạo mã"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
