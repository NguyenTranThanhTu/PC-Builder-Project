"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import CouponFormModal from "./coupon-form-modal";

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
  createdAt: string;
  _count?: { orderCoupons: number };
};

export default function CouponsManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive" | "vip">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  useEffect(() => {
    fetchCoupons();
  }, [search, filter]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (filter === "active") params.append("isActive", "true");
      if (filter === "inactive") params.append("isActive", "false");
      if (filter === "vip") params.append("forVIPOnly", "true");

      const res = await fetch(`/api/admin/coupons?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setCoupons(data.coupons);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh sách mã giảm giá");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Xóa mã giảm giá "${code}"?`)) return;

    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      const data = await res.json();
      toast.success(data.message || "Đã xóa mã giảm giá");
      fetchCoupons();
    } catch (error) {
      console.error(error);
      toast.error("Không thể xóa mã giảm giá");
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      });
      if (!res.ok) throw new Error("Failed to update");
      toast.success(coupon.isActive ? "Đã vô hiệu hóa" : "Đã kích hoạt");
      fetchCoupons();
    } catch (error) {
      console.error(error);
      toast.error("Không thể cập nhật");
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN");
  };

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("vi-VN") + "₫";
  };

  const getVIPTierName = (tier: number | null) => {
    if (!tier) return "-";
    const names = ["", "VIP Đồng", "VIP Bạc", "VIP Vàng"];
    return names[tier] || `VIP ${tier}`;
  };

  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  const isUpcoming = (startDate: string) => {
    return new Date(startDate) > new Date();
  };

  return (
    <div>
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Tìm mã giảm giá..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue focus:border-transparent"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue focus:border-transparent"
        >
          <option value="all">Tất cả</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Ngừng hoạt động</option>
          <option value="vip">Chỉ VIP</option>
        </select>
        <button
          onClick={() => {
            setEditingCoupon(null);
            setIsModalOpen(true);
          }}
          className="px-6 py-2 bg-blue text-white rounded-lg hover:bg-blue-dark transition-colors font-medium"
        >
          + Tạo mã mới
        </button>
      </div>

      {/* Coupons Table */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Đang tải...</div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Không có mã giảm giá nào</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-dark">Mã code</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-dark">Mô tả</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-dark">Giảm giá</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-dark">Điều kiện</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-dark">Sử dụng</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-dark">Thời hạn</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-dark">Trạng thái</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-dark">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-blue">{coupon.code}</span>
                      {coupon.forVIPOnly && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          VIP
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700 max-w-xs truncate">
                    {coupon.description || "-"}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <div className="font-semibold text-green">
                      {coupon.discountType === "PERCENTAGE"
                        ? `${coupon.discountValue}%`
                        : formatPrice(coupon.discountValue)}
                    </div>
                    {coupon.maxDiscount && (
                      <div className="text-xs text-gray-500">
                        Tối đa {formatPrice(coupon.maxDiscount)}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {coupon.minOrderValue > 0 ? (
                      <div>Đơn tối thiểu: {formatPrice(coupon.minOrderValue)}</div>
                    ) : (
                      <div>Không giới hạn</div>
                    )}
                    {coupon.minVIPTier && (
                      <div className="text-xs text-yellow-700">
                        {getVIPTierName(coupon.minVIPTier)}+
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <div className="font-medium">
                      {coupon.usageCount}
                      {coupon.maxUsage && ` / ${coupon.maxUsage}`}
                    </div>
                    {coupon.maxUsage && coupon.usageCount >= coupon.maxUsage && (
                      <span className="text-xs text-red-600">Đã hết</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    <div>{formatDate(coupon.startDate)}</div>
                    <div className="text-xs">→ {formatDate(coupon.endDate)}</div>
                    {isExpired(coupon.endDate) && (
                      <span className="text-xs text-red-600">Đã hết hạn</span>
                    )}
                    {isUpcoming(coupon.startDate) && (
                      <span className="text-xs text-blue">Sắp diễn ra</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => handleToggleActive(coupon)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        coupon.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {coupon.isActive ? "Hoạt động" : "Tắt"}
                    </button>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingCoupon(coupon);
                          setIsModalOpen(true);
                        }}
                        className="px-3 py-1 text-sm text-blue hover:bg-blue-50 rounded"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(coupon.id, coupon.code)}
                        className="px-3 py-1 text-sm text-red hover:bg-red-50 rounded"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <CouponFormModal
          coupon={editingCoupon}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchCoupons}
        />
      )}
    </div>
  );
}
