"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatVnd, formatVndFromCents } from "@/lib/formatVnd";

// User type
interface UserItem {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: "USER" | "ADMIN";
  vipTier: number;
  totalSpent: number;
  isBanned: boolean;
  createdAt: string;
}

interface VIPTierConfig {
  tier: number;
  name: string;
  minSpend: number;
  discountPercent: number;
  badgeColor: string;
}

const VIP_TIER_NAMES: Record<number, { name: string; color: string; icon: string }> = {
  0: { name: "Thành viên", color: "bg-gray-100 text-gray-700", icon: "👤" },
  1: { name: "Đồng", color: "bg-orange-100 text-orange-700", icon: "🥉" },
  2: { name: "Bạc", color: "bg-gray-200 text-gray-800", icon: "🥈" },
  3: { name: "Vàng", color: "bg-yellow-100 text-yellow-700", icon: "🥇" },
  4: { name: "Bạch Kim", color: "bg-blue-100 text-blue-700", icon: "💎" },
  5: { name: "Kim Cương", color: "bg-purple-100 text-purple-700", icon: "💠" },
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [vipTiers, setVipTiers] = useState<VIPTierConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [vipFilter, setVipFilter] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    vipUsers: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    // Load VIP tier configs
    fetch("/api/admin/vip-config")
      .then((res) => res.json())
      .then((data) => setVipTiers(data.tiers || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams();
    if (search) params.append("q", search);
    if (role) params.append("role", role);
    fetch(`/api/admin/users?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        const usersList = data.users || [];
        setUsers(usersList);
        
        // Calculate stats
        setStats({
          total: usersList.length,
          admins: usersList.filter((u: UserItem) => u.role === "ADMIN").length,
          vipUsers: usersList.filter((u: UserItem) => u.vipTier > 0).length,
          totalRevenue: usersList.reduce((sum: number, u: UserItem) => sum + (u.totalSpent || 0), 0),
        });
      })
      .catch(() => setError("Không thể tải danh sách user"))
      .finally(() => setLoading(false));
  }, [search, role]);

  const getVIPBadge = (tier: number) => {
    const vipInfo = VIP_TIER_NAMES[tier] || VIP_TIER_NAMES[0];
    const tierConfig = vipTiers.find((t) => t.tier === tier);
    
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${vipInfo.color}`}
        title={tierConfig ? `${tierConfig.name} - ${tierConfig.discountPercent}% discount` : ""}
      >
        <span>{vipInfo.icon}</span>
        <span>{tierConfig?.name || vipInfo.name}</span>
      </span>
    );
  };

  const filteredUsers = vipFilter
    ? users.filter((u) => u.vipTier === parseInt(vipFilter))
    : users;

  return (
    <section className="overflow-hidden py-12 bg-gray-1">
      <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-dark mb-2">Quản lý khách hàng</h1>
          <p className="text-base text-dark-2">Quản lý thông tin, VIP tier và quyền hạn của người dùng</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-3 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-dark-3 mb-1">Tổng khách hàng</p>
                <p className="text-3xl font-bold text-dark">{stats.total}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-3 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-dark-3 mb-1">Admin</p>
                <p className="text-3xl font-bold text-dark">{stats.admins}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-3 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-dark-3 mb-1">Khách hàng VIP</p>
                <p className="text-3xl font-bold text-dark">{stats.vipUsers}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-yellow/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-3 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-dark-3 mb-1">Tổng doanh thu</p>
                <p className="text-2xl font-bold text-dark">{formatVndFromCents(stats.totalRevenue)}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-3 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto flex-1">
              <div className="relative flex-1 lg:min-w-[300px]">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm kiếm theo tên hoặc email..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-3 rounded-lg text-sm text-dark focus:outline-none focus:ring-2 focus:ring-blue/20 focus:border-blue"
                />
                <svg className="w-5 h-5 text-dark-3 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="px-4 py-2.5 border border-gray-3 rounded-lg text-sm text-dark font-medium focus:outline-none focus:ring-2 focus:ring-blue/20 focus:border-blue"
              >
                <option value="">Tất cả vai trò</option>
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>

              <select
                value={vipFilter}
                onChange={(e) => setVipFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-3 rounded-lg text-sm text-dark font-medium focus:outline-none focus:ring-2 focus:ring-blue/20 focus:border-blue"
              >
                <option value="">Tất cả VIP Tier</option>
                <option value="0">Thành viên thường</option>
                {vipTiers.map((tier) => (
                  <option key={tier.tier} value={tier.tier}>
                    {tier.name}
                  </option>
                ))}
              </select>
            </div>

            <Link
              href="/admin/vip-config"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue text-white rounded-lg text-sm font-medium hover:bg-blue-dark transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Cấu hình VIP Tier
            </Link>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-3 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue"></div>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <svg className="w-16 h-16 text-red mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red font-medium">{error}</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-20">
              <svg className="w-16 h-16 text-dark-3 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-base font-medium text-dark-2">Không tìm thấy khách hàng nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-3">
                <thead className="bg-gray-1">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark uppercase tracking-wider">
                      Khách hàng
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark uppercase tracking-wider">
                      Vai trò
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark uppercase tracking-wider">
                      VIP Tier
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark uppercase tracking-wider">
                      Tổng chi tiêu
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark uppercase tracking-wider">
                      Ngày tham gia
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-dark uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-3">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-1 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue to-purple flex items-center justify-center text-white font-bold text-sm overflow-hidden flex-shrink-0">
                            {user.image ? (
                              <Image src={user.image} alt={user.name} width={40} height={40} className="w-full h-full object-cover" />
                            ) : (
                              user.name?.charAt(0).toUpperCase() || "U"
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-dark truncate">{user.name}</p>
                            <p className="text-xs text-dark-3 truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.role === "ADMIN" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple/15 text-purple-dark">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-200 text-dark-2">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            User
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getVIPBadge(user.vipTier)}
                          {user.isBanned && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-light-5 text-red-dark border border-red">
                              🚫 Bị chặn
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-bold text-dark">{formatVndFromCents(user.totalSpent)}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-medium text-dark-2">{new Date(user.createdAt).toLocaleDateString("vi-VN")}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue text-white rounded-lg text-sm font-medium hover:bg-blue-dark transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Chi tiết
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
