"use client";
import { useEffect, useState } from "react";
import { formatVnd } from "@/lib/formatVnd";
import Link from "next/link";

interface VIPTierConfig {
  id: string;
  tier: number;
  name: string;
  minSpend: number;
  discountPercent: number;
  badgeColor: string;
  userCount?: number;
  createdAt: string;
  updatedAt: string;
}

const PRESET_COLORS = [
  { name: "Đồng", color: "#CD7F32" },
  { name: "Bạc", color: "#C0C0C0" },
  { name: "Vàng", color: "#FFD700" },
  { name: "Bạch Kim", color: "#E5E4E2" },
  { name: "Kim Cương", color: "#B9F2FF" },
  { name: "Xanh", color: "#3B82F6" },
  { name: "Tím", color: "#8B5CF6" },
  { name: "Đỏ", color: "#EF4444" },
];

export default function VIPConfigPage() {
  const [tiers, setTiers] = useState<VIPTierConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<VIPTierConfig | null>(null);
  const [formData, setFormData] = useState({
    tier: 1,
    name: "",
    minSpend: 0,
    discountPercent: 0,
    badgeColor: "#CD7F32",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTiers();
  }, []);

  const fetchTiers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/vip-config");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTiers(data.tiers || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (tier?: VIPTierConfig) => {
    if (tier) {
      setEditingTier(tier);
      setFormData({
        tier: tier.tier,
        name: tier.name,
        minSpend: tier.minSpend / 100, // Convert cents to VND
        discountPercent: tier.discountPercent,
        badgeColor: tier.badgeColor,
      });
    } else {
      setEditingTier(null);
      const nextTier = tiers.length > 0 ? Math.max(...tiers.map((t) => t.tier)) + 1 : 1;
      setFormData({
        tier: nextTier,
        name: "",
        minSpend: 0,
        discountPercent: 0,
        badgeColor: "#CD7F32",
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTier(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        minSpend: formData.minSpend * 100, // Convert VND to cents
      };

      const res = await fetch("/api/admin/vip-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert(editingTier ? "Cập nhật tier thành công!" : "Tạo tier mới thành công!");
      closeModal();
      fetchTiers();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (tier: number, userCount: number) => {
    if (userCount > 0) {
      alert(`Không thể xóa tier này vì có ${userCount} người dùng đang sử dụng.`);
      return;
    }

    if (!confirm("Bạn có chắc muốn xóa tier này?")) return;

    try {
      const res = await fetch(`/api/admin/vip-config/${tier}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert("Xóa tier thành công!");
      fetchTiers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <section className="overflow-hidden py-12 bg-gray-1">
      <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-2 px-3 py-2 text-dark-2 hover:text-dark font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Quay lại
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-dark">Cấu hình VIP Tier</h1>
              <p className="text-base text-dark-2 mt-1">Quản lý các mốc VIP và quyền lợi</p>
            </div>
          </div>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue text-white rounded-lg text-sm font-medium hover:bg-blue-dark transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Thêm Tier Mới
          </button>
        </div>

        {/* Info Banner */}
        <div className="bg-blue/5 border border-blue/20 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-blue flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-dark mb-1">Hướng dẫn cấu hình VIP Tier</p>
              <ul className="text-sm text-dark-5 space-y-1 list-disc list-inside">
                <li>Tier càng cao thì minSpend (chi tiêu tối thiểu) phải càng lớn</li>
                <li>Discount % thường tăng dần theo tier (ví dụ: 3% → 5% → 7%)</li>
                <li>Hệ thống tự động nâng cấp tier khi user đạt đủ tổng chi tiêu</li>
                <li>Không thể xóa tier đang có user sử dụng</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tiers Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue"></div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-3 p-8 text-center">
            <svg className="w-16 h-16 text-red mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red font-medium">{error}</p>
          </div>
        ) : tiers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-3 p-12 text-center">
            <svg className="w-20 h-20 text-dark-5 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <h3 className="text-xl font-bold text-dark mb-2">Chưa có VIP Tier nào</h3>
            <p className="text-dark-5 mb-4">Tạo tier đầu tiên để bắt đầu chương trình khách hàng thân thiết</p>
            <button
              onClick={() => openModal()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue text-white rounded-lg font-medium hover:bg-blue-dark transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tạo Tier Đầu Tiên
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className="bg-white rounded-xl shadow-sm border border-gray-3 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  {/* Tier Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl"
                        style={{ backgroundColor: tier.badgeColor }}
                      >
                        {tier.tier}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-dark">{tier.name}</h3>
                        <p className="text-xs text-dark-5">Tier {tier.tier}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openModal(tier)}
                        className="p-2 text-blue hover:bg-blue/10 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(tier.tier, tier.userCount || 0)}
                        className="p-2 text-red hover:bg-red/10 rounded-lg transition-colors"
                        title="Xóa"
                        disabled={tier.userCount && tier.userCount > 0}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Tier Info */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-1 rounded-lg">
                      <span className="text-sm font-medium text-dark-3">Chi tiêu tối thiểu:</span>
                      <span className="text-sm font-bold text-dark">{formatVnd(tier.minSpend)}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-green/10 rounded-lg">
                      <span className="text-sm font-medium text-dark-3">Giảm giá:</span>
                      <span className="text-xl font-bold text-green-dark">{tier.discountPercent}%</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-blue/10 rounded-lg">
                      <span className="text-sm font-medium text-dark-3">Số người dùng:</span>
                      <span className="text-sm font-bold text-blue-dark">{tier.userCount || 0} người</span>
                    </div>
                  </div>

                  {/* Color Preview */}
                  <div className="mt-4 pt-4 border-t border-gray-3">
                    <p className="text-xs font-semibold text-dark-3 mb-2">Badge Color:</p>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-lg border-2 border-gray-3"
                        style={{ backgroundColor: tier.badgeColor }}
                      ></div>
                      <span className="text-xs font-mono font-medium text-dark-2">{tier.badgeColor}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-3 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-dark">
                  {editingTier ? `Chỉnh sửa Tier ${editingTier.tier}` : "Tạo Tier Mới"}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 text-dark-5 hover:text-dark hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Tier Number */}
                  <div>
                    <label className="block text-sm font-semibold text-dark mb-2">
                      Tier <span className="text-red">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.tier}
                      onChange={(e) => setFormData({ ...formData, tier: parseInt(e.target.value) })}
                      disabled={!!editingTier}
                      className="w-full px-4 py-2.5 border border-gray-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue/20 focus:border-blue disabled:bg-gray-100"
                      required
                    />
                    <p className="text-xs text-dark-5 mt-1">Số thứ tự tier (1-10)</p>
                  </div>

                  {/* Tier Name */}
                  <div>
                    <label className="block text-sm font-semibold text-dark mb-2">
                      Tên Tier <span className="text-red">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ví dụ: Đồng, Bạc, Vàng..."
                      className="w-full px-4 py-2.5 border border-gray-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue/20 focus:border-blue"
                      required
                    />
                  </div>
                </div>

                {/* Min Spend */}
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    Chi tiêu tối thiểu (VND) <span className="text-red">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.minSpend}
                    onChange={(e) => setFormData({ ...formData, minSpend: parseInt(e.target.value) })}
                    placeholder="500000"
                    className="w-full px-4 py-2.5 border border-gray-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue/20 focus:border-blue"
                    required
                  />
                  <p className="text-xs text-dark-5 mt-1">Tổng tiền mua hàng tối thiểu để đạt tier này</p>
                </div>

                {/* Discount Percent */}
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    Phần trăm giảm giá (%) <span className="text-red">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.discountPercent}
                    onChange={(e) => setFormData({ ...formData, discountPercent: parseFloat(e.target.value) })}
                    placeholder="5"
                    className="w-full px-4 py-2.5 border border-gray-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue/20 focus:border-blue"
                    required
                  />
                  <p className="text-xs text-dark-5 mt-1">Giảm giá tự động áp dụng cho mọi đơn hàng</p>
                </div>

                {/* Badge Color */}
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    Màu Badge <span className="text-red">*</span>
                  </label>
                  <div className="grid grid-cols-4 gap-3 mb-3">
                    {PRESET_COLORS.map((preset) => (
                      <button
                        key={preset.color}
                        type="button"
                        onClick={() => setFormData({ ...formData, badgeColor: preset.color })}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          formData.badgeColor === preset.color
                            ? "border-blue ring-2 ring-blue/20"
                            : "border-gray-3 hover:border-gray-400"
                        }`}
                      >
                        <div className="w-full h-8 rounded" style={{ backgroundColor: preset.color }}></div>
                        <p className="text-xs text-dark-5 mt-1 text-center">{preset.name}</p>
                      </button>
                    ))}
                  </div>
                  <input
                    type="color"
                    value={formData.badgeColor}
                    onChange={(e) => setFormData({ ...formData, badgeColor: e.target.value })}
                    className="w-full h-12 rounded-lg border border-gray-3 cursor-pointer"
                  />
                  <p className="text-xs text-dark-5 mt-1">Chọn từ preset hoặc tùy chỉnh màu</p>
                </div>

                {/* Preview */}
                <div className="p-4 bg-gray-1 rounded-lg">
                  <p className="text-sm font-semibold text-dark mb-3">Preview Badge:</p>
                  <span
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: formData.badgeColor }}
                  >
                    <span>🏆</span>
                    <span>{formData.name || "Tier Name"}</span>
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2.5 bg-gray-100 text-dark rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2.5 bg-blue text-white rounded-lg font-medium hover:bg-blue-dark transition-colors disabled:opacity-50"
                  >
                    {submitting ? "Đang lưu..." : editingTier ? "Cập nhật" : "Tạo Tier"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
