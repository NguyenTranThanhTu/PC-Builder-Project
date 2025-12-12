"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { formatVnd, formatVndFromCents } from "@/lib/formatVnd";

interface UserDetail {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: "USER" | "ADMIN";
  vipTier: number;
  totalSpent: number;
  lastTierUpdate?: string;
  isBanned: boolean;
  banReason?: string | null;
  bannedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  orders: any[];
  reviews: any[];
}

interface Stats {
  totalOrders: number;
  completedOrders: number;
  totalSpent: number;
  totalReviews: number;
}

interface VIPTierInfo {
  tier: number;
  name: string;
  minSpend: number;
  discountPercent: number;
  badgeColor: string;
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<UserDetail | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [vipTierInfo, setVipTierInfo] = useState<VIPTierInfo | null>(null);
  const [nextVipTier, setNextVipTier] = useState<VIPTierInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [banReason, setBanReason] = useState("");

  useEffect(() => {
    fetchUserDetail();
  }, [userId]);

  const fetchUserDetail = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to load user");
      }

      setUser(data.user);
      setStats(data.stats);
      setVipTierInfo(data.vipTierInfo);
      setNextVipTier(data.nextVipTier);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (newRole: "USER" | "ADMIN") => {
    if (!confirm(`Bạn có chắc muốn thay đổi vai trò thành ${newRole}?`)) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update role");
      }

      alert("Cập nhật vai trò thành công!");
      fetchUserDetail();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBanUser = async () => {
    if (!banReason.trim()) {
      alert("Vui lòng nhập lý do chặn tài khoản");
      return;
    }

    if (!confirm(`Xác nhận CHẶN tài khoản ${user?.name || user?.email}?`)) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/ban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: banReason }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to ban user");
      }

      alert("Đã chặn tài khoản thành công!");
      setShowBanModal(false);
      setBanReason("");
      fetchUserDetail();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnbanUser = async () => {
    if (!confirm(`Xác nhận MỞ KHÓA tài khoản ${user?.name || user?.email}?`)) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/ban`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to unban user");
      }

      alert("Đã mở khóa tài khoản thành công!");
      fetchUserDetail();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getVIPProgress = () => {
    if (!nextVipTier || !stats) return 100;
    
    const current = stats.totalSpent;
    const required = nextVipTier.minSpend;
    const previous = vipTierInfo?.minSpend || 0;
    
    const progress = ((current - previous) / (required - previous)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  if (loading) {
    return (
      <section className="overflow-hidden py-12 bg-gray-2">
        <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !user) {
    return (
      <section className="overflow-hidden py-12 bg-gray-2">
        <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-3 p-8 text-center">
            <svg className="w-16 h-16 text-red mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red font-medium mb-4">{error || "User not found"}</p>
            <Link href="/admin/users" className="inline-flex items-center gap-2 px-4 py-2 bg-blue text-white rounded-lg text-sm font-medium hover:bg-blue-dark">
              ← Quay lại danh sách
            </Link>
          </div>
        </div>
      </section>
    );
  }

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
              <h1 className="text-3xl font-bold text-dark">Chi tiết khách hàng</h1>
              <p className="text-base text-dark-2 mt-1">Thông tin và lịch sử hoạt động</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - User Info */}
          <div className="xl:col-span-1 space-y-6">
            {/* User Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-3 p-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue to-purple flex items-center justify-center text-white font-bold text-3xl overflow-hidden mb-4">
                  {user.image ? (
                    <Image src={user.image} alt={user.name} width={96} height={96} className="w-full h-full object-cover" />
                  ) : (
                    user.name?.charAt(0).toUpperCase() || "U"
                  )}
                </div>
                <h2 className="text-xl font-bold text-dark mb-1">{user.name}</h2>
                <p className="text-sm text-dark-5 mb-4">{user.email}</p>

                <div className="flex items-center gap-2 mb-4">
                  {user.role === "ADMIN" ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold bg-purple/10 text-purple">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Admin
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-dark">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      User
                    </span>
                  )}
                </div>

                <div className="w-full border-t border-gray-3 pt-4 space-y-3 text-left">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-dark-3">Ngày tham gia:</span>
                    <span className="font-bold text-dark">{new Date(user.createdAt).toLocaleDateString("vi-VN")}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-dark-3">Cập nhật lần cuối:</span>
                    <span className="font-bold text-dark">{new Date(user.updatedAt).toLocaleDateString("vi-VN")}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-dark-3">ID:</span>
                    <span className="font-mono text-xs font-medium text-dark-2">{user.id.slice(0, 12)}...</span>
                  </div>
                </div>

                {/* Ban Status Alert */}
                {user.isBanned && (
                  <div className="w-full mt-4 p-3 bg-red-light-5 border-l-4 border-red rounded-lg">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-red flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div className="flex-1">
                        <p className="font-bold text-red-dark text-sm mb-1">🚫 Tài khoản bị chặn</p>
                        {user.bannedAt && (
                          <p className="text-xs text-dark-3">
                            {new Date(user.bannedAt).toLocaleDateString("vi-VN")}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Role Management */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-3 p-6">
              <h3 className="text-lg font-bold text-dark mb-4">Quản lý vai trò</h3>
              <div className="space-y-3">
                <button
                  onClick={() => handleRoleChange("USER")}
                  disabled={actionLoading || user.role === "USER"}
                  className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    user.role === "USER"
                      ? "bg-gray-100 text-dark border-2 border-gray-300"
                      : "bg-gray-50 text-dark-5 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>User (Khách hàng)</span>
                    {user.role === "USER" && (
                      <svg className="w-5 h-5 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => handleRoleChange("ADMIN")}
                  disabled={actionLoading || user.role === "ADMIN"}
                  className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    user.role === "ADMIN"
                      ? "bg-purple/10 text-purple border-2 border-purple"
                      : "bg-gray-50 text-dark-5 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>Admin (Quản trị viên)</span>
                    {user.role === "ADMIN" && (
                      <svg className="w-5 h-5 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </button>
              </div>
            </div>

            {/* Ban/Unban Management */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-3 p-6">
              <h3 className="text-lg font-bold text-dark mb-4">Quản lý trạng thái</h3>
              
              {user.isBanned ? (
                <div>
                  {/* Show Ban Reason */}
                  {user.banReason && (
                    <div className="mb-4 p-4 bg-red-light-6 border border-red-light-4 rounded-lg">
                      <p className="text-xs font-semibold text-dark-3 mb-2">Lý do chặn:</p>
                      <p className="text-sm text-dark-2">{user.banReason}</p>
                    </div>
                  )}

                  {/* Unban Button */}
                  <button
                    onClick={handleUnbanUser}
                    disabled={actionLoading}
                    className="w-full px-4 py-3 bg-green hover:bg-green-dark text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                    <span>{actionLoading ? "Đang xử lý..." : "Mở khóa tài khoản"}</span>
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-dark-3 mb-4">
                    Chặn tài khoản sẽ ngăn người dùng đăng nhập vào hệ thống.
                  </p>
                  <button
                    onClick={() => setShowBanModal(true)}
                    disabled={actionLoading}
                    className="w-full px-4 py-3 bg-red hover:bg-red-dark text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    <span>Chặn tài khoản</span>
                  </button>
                </div>
              )}
            </div>

            {/* VIP Tier Info */}
            {vipTierInfo && (
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-sm border border-yellow-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🏆</span>
                  <h3 className="text-lg font-bold text-dark">VIP {vipTierInfo.name}</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-dark-3">Giảm giá:</span>
                    <span className="font-bold text-lg text-yellow-dark">{vipTierInfo.discountPercent}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-dark-3">Chi tiêu tối thiểu:</span>
                    <span className="font-bold text-dark">{formatVndFromCents(vipTierInfo.minSpend)}</span>
                  </div>
                </div>

                {nextVipTier && stats && (
                  <div className="mt-4 pt-4 border-t border-yellow-200">
                    <p className="text-sm font-medium text-dark-2 mb-2">
                      Tiến độ lên <span className="font-bold text-dark">{nextVipTier.name}</span>:
                    </p>
                    <div className="w-full bg-yellow-100 rounded-full h-2.5 mb-2">
                      <div
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${getVIPProgress()}%` }}
                      ></div>
                    </div>
                    <p className="text-xs font-medium text-dark-2">
                      Còn <span className="font-bold text-dark">{formatVndFromCents(nextVipTier.minSpend - stats.totalSpent)}</span> nữa
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Stats & Activity */}
          <div className="xl:col-span-2 space-y-6">
            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-3 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-dark-5">Tổng đơn</p>
                      <p className="text-xl font-bold text-dark">{stats.totalOrders}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-3 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-green/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-dark-5">Hoàn thành</p>
                      <p className="text-xl font-bold text-dark">{stats.completedOrders}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-3 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-yellow/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-dark-5">Chi tiêu</p>
                      <p className="text-lg font-bold text-dark">{formatVndFromCents(stats.totalSpent)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-3 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-purple/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-dark-5">Đánh giá</p>
                      <p className="text-xl font-bold text-dark">{stats.totalReviews}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-3 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-dark">Đơn hàng gần đây</h3>
                <Link href={`/admin/orders?userId=${userId}`} className="text-sm text-blue hover:text-blue-dark font-medium">
                  Xem tất cả →
                </Link>
              </div>

              {user.orders.length === 0 ? (
                <p className="text-center py-8 text-dark-5">Chưa có đơn hàng nào</p>
              ) : (
                <div className="space-y-3">
                  {user.orders.slice(0, 5).map((order: any) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-1 rounded-lg hover:bg-gray-2 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-dark truncate">#{order.id.slice(0, 8)}</p>
                        <p className="text-xs text-dark-5">{new Date(order.createdAt).toLocaleDateString("vi-VN")}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-dark">{formatVndFromCents(order.totalCents)}</p>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          order.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                          order.status === "CANCELLED" ? "bg-red-100 text-red-700" :
                          "bg-blue-100 text-blue-700"
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Reviews */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-3 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-dark">Đánh giá gần đây</h3>
              </div>

              {user.reviews.length === 0 ? (
                <p className="text-center py-8 text-dark-5">Chưa có đánh giá nào</p>
              ) : (
                <div className="space-y-4">
                  {user.reviews.slice(0, 5).map((review: any) => (
                    <div key={review.id} className="p-4 bg-gray-1 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm font-semibold text-dark">{review.product?.name}</p>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${i < review.rating ? "text-yellow fill-yellow" : "text-gray-300"}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-dark-5">{review.content}</p>
                      <p className="text-xs text-dark-5 mt-2">{new Date(review.createdAt).toLocaleDateString("vi-VN")}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ban User Modal */}
      {showBanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-3 max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-light-5 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-dark">Chặn tài khoản</h3>
                <p className="text-sm text-dark-3">
                  {user?.name || user?.email}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-dark mb-2">
                Lý do chặn <span className="text-red">*</span>
              </label>
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="VD: Spam đơn hàng, Thông tin sai sự thật, Vi phạm điều khoản..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-3 rounded-lg text-sm text-dark focus:outline-none focus:ring-2 focus:ring-red/20 focus:border-red resize-none"
              />
              <p className="text-xs text-dark-3 mt-2">
                💡 Lý do này sẽ hiển thị cho người dùng khi họ đăng nhập
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowBanModal(false);
                  setBanReason("");
                }}
                disabled={actionLoading}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-dark rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleBanUser}
                disabled={actionLoading || !banReason.trim()}
                className="flex-1 px-4 py-3 bg-red hover:bg-red-dark text-white rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? "Đang xử lý..." : "Xác nhận chặn"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
