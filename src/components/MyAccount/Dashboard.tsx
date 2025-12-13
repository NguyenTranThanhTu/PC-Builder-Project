"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { formatVnd } from "@/lib/formatVnd";

interface VipTierConfig {
  tier: number;
  name: string;
  min: number;
  max: number;
  discount: number;
}

interface DashboardStats {
  totalOrders: number;
  totalSpent: number;
  pendingOrders: number;
  completedOrders: number;
  vipTier: number;
  vipDiscount: number;
  nextTierAmount: number;
  nextTierName: string;
  spendingByMonth: { [key: string]: number };
  recentOrders: any[];
  reviews: any[];
  tiers?: VipTierConfig[];
}

export default function MyAccountDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"month" | "year">("month");

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const res = await fetch("/api/user/dashboard");
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue"></div>
      </div>
    );
  }

  if (!stats) {
    return <div className="text-center py-10 text-dark-5">Không thể tải dữ liệu</div>;
  }

  // Ensure vipTier has a valid value
  const userVipTier = Math.max(0, stats.vipTier || 0);
  
  // Get tier configurations from API response (fallback to defaults if not available)
  const tiersFromDB = stats.tiers || [];
  const maxTier = tiersFromDB.length > 0 ? tiersFromDB.length - 1 : 3;

  // Build tier info from database data
  const buildTierInfo = () => {
    const info: any = {};
    
    if (tiersFromDB.length > 0) {
      tiersFromDB.forEach((tier) => {
        const tierColors: any = {
          0: { 
            bgColor: "bg-gray-3", 
            textColor: "text-gray-7",
            borderColor: "border-gray-4",
            iconBgColor: "bg-gray-3",
            icon: "⭐"
          },
          1: { 
            bgColor: "bg-orange-100", 
            textColor: "text-orange-700",
            borderColor: "border-orange-300",
            iconBgColor: "bg-orange-100",
            icon: "🥉"
          },
          2: { 
            bgColor: "bg-gray-200", 
            textColor: "text-gray-700",
            borderColor: "border-gray-400",
            iconBgColor: "bg-gray-200",
            icon: "🥈"
          },
          3: { 
            bgColor: "bg-yellow-100", 
            textColor: "text-yellow-700",
            borderColor: "border-yellow-400",
            iconBgColor: "bg-yellow-100",
            icon: "🥇"
          },
        };

        const colors = tierColors[tier.tier] || tierColors[0];
        const nextTierIndex = Math.min(tier.tier + 1, tiersFromDB.length - 1);
        const nextTier = tiersFromDB[nextTierIndex];
        
        info[tier.tier] = {
          name: tier.name,
          ...colors,
          nextTier: nextTier.name,
          nextAmount: nextTier.min,
          min: tier.min,
          max: tier.max,
        };
      });
    } else {
      // Fallback to hardcoded if no tiers from DB
      info[0] = { 
        name: "Thường", 
        bgColor: "bg-gray-3", 
        textColor: "text-gray-7",
        borderColor: "border-gray-4",
        iconBgColor: "bg-gray-3",
        nextTier: "Đồng", 
        nextAmount: 5000000,
        icon: "⭐",
        min: 0,
        max: 5000000,
      };
      info[1] = { 
        name: "Đồng", 
        bgColor: "bg-orange-100", 
        textColor: "text-orange-700",
        borderColor: "border-orange-300",
        iconBgColor: "bg-orange-100",
        nextTier: "Bạc", 
        nextAmount: 10000000,
        icon: "🥉",
        min: 5000000,
        max: 10000000,
      };
      info[2] = { 
        name: "Bạc", 
        bgColor: "bg-gray-200", 
        textColor: "text-gray-700",
        borderColor: "border-gray-400",
        iconBgColor: "bg-gray-200",
        nextTier: "Vàng", 
        nextAmount: 30000000,
        icon: "🥈",
        min: 10000000,
        max: 30000000,
      };
      info[3] = { 
        name: "Vàng", 
        bgColor: "bg-yellow-100", 
        textColor: "text-yellow-700",
        borderColor: "border-yellow-400",
        iconBgColor: "bg-yellow-100",
        nextTier: "Max", 
        nextAmount: 0,
        icon: "🥇",
        min: 30000000,
        max: Infinity,
      };
    }
    
    return info;
  };

  const tierInfo = buildTierInfo();
  const currentTier = tierInfo[userVipTier] || tierInfo[0];
  
  // Calculate progress to next tier correctly using tier data
  const calculateProgress = () => {
    if (userVipTier >= maxTier) return 100; // Max tier
    
    const currentTierData = tierInfo[userVipTier];
    if (!currentTierData) return 0;
    
    const spent = stats.totalSpent || 0;
    const min = currentTierData.min || 0;
    const max = currentTierData.max || currentTierData.nextAmount || 0;
    
    if (max === Infinity || max <= min) return 100;
    
    const progress = ((spent - min) / (max - min)) * 100;
    
    return Math.min(Math.max(0, progress), 100);
  };
  
  const progressPercent = calculateProgress();

  // Chart data
  const monthlyData = Object.entries(stats?.spendingByMonth || {});
  const maxSpending = monthlyData.length > 0 ? Math.max(...monthlyData.map(([_, v]) => v), 1) : 1;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue to-blue-dark rounded-xl p-6 text-white shadow-1">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              Xin chào, {session?.user?.name || "Khách hàng"}! 👋
            </h2>
            <p className="text-blue-light-3">
              Chào mừng trở lại với tài khoản của bạn
            </p>
          </div>
          <div className={`px-6 py-3 ${currentTier.iconBgColor} ${currentTier.borderColor} border-2 rounded-xl shadow-lg`}>
            <div className="text-center">
              <p className="text-3xl mb-1">{currentTier.icon}</p>
              <p className={`text-xl font-bold ${currentTier.textColor}`}>{currentTier.name}</p>
              <p className={`text-sm ${currentTier.textColor} mt-1`}>-{stats.vipDiscount || 0}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Orders */}
        <div className="bg-white rounded-xl p-6 shadow-1 border-2 border-gray-2 hover:border-blue transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-blue-light-6 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
            </div>
            <span className="text-3xl font-bold text-dark">{stats.totalOrders}</span>
          </div>
          <p className="text-dark-5 text-sm font-medium">Tổng đơn hàng</p>
        </div>

        {/* Total Spent */}
        <div className="bg-white rounded-xl p-6 shadow-1 border-2 border-gray-2 hover:border-green transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-green-light-6 flex items-center justify-center">
              <svg className="w-6 h-6 text-green" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-dark">{formatVnd(stats.totalSpent)}</span>
          </div>
          <p className="text-dark-5 text-sm font-medium">Tổng chi tiêu</p>
        </div>

        {/* Pending Orders */}
        <div className="bg-white rounded-xl p-6 shadow-1 border-2 border-gray-2 hover:border-yellow transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-yellow-light-1 flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-3xl font-bold text-dark">{stats.pendingOrders}</span>
          </div>
          <p className="text-dark-5 text-sm font-medium">Đang xử lý</p>
        </div>

        {/* Completed Orders */}
        <div className="bg-white rounded-xl p-6 shadow-1 border-2 border-gray-2 hover:border-green transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-green-light-6 flex items-center justify-center">
              <svg className="w-6 h-6 text-green" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-3xl font-bold text-dark">{stats.completedOrders}</span>
          </div>
          <p className="text-dark-5 text-sm font-medium">Hoàn thành</p>
        </div>
      </div>

      {/* VIP Progress & Spending Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* VIP Tier Progress */}
        <div className="bg-white rounded-xl p-6 shadow-1 border-2 border-gray-2">
          <h3 className="text-lg font-bold text-dark mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-yellow" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Hạng VIP của bạn
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-dark-5 mb-1">Hạng hiện tại</p>
                <div className={`inline-flex items-center gap-2 px-4 py-2 ${currentTier.iconBgColor} ${currentTier.borderColor} border-2 rounded-lg`}>
                  <span className="text-xl">{currentTier.icon}</span>
                  <p className={`text-xl font-bold ${currentTier.textColor}`}>
                    {currentTier.name}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-dark-5 mb-1">Giảm giá</p>
                <p className="text-2xl font-bold text-green">
                  {stats.vipDiscount || 0}%
                </p>
              </div>
            </div>

            {userVipTier < 3 && (
              <>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-dark-5">Tiến độ lên hạng {currentTier.nextTier}</span>
                    <span className="font-semibold text-dark">{progressPercent.toFixed(0)}%</span>
                  </div>
                  <div className="h-3 bg-gray-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="bg-blue-light-6 rounded-lg p-4">
                  <p className="text-sm text-dark-2">
                    💰 Còn <span className="font-bold text-blue">{formatVnd(stats.nextTierAmount || 0)}</span> nữa để lên hạng <span className="font-bold">{currentTier.nextTier}</span>
                  </p>
                </div>
              </>
            )}

            {userVipTier === 3 && (
              <div className="bg-yellow-light-1 rounded-lg p-4 text-center">
                <p className="text-yellow-dark font-bold">
                  🎉 Bạn đã đạt hạng VIP cao nhất!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Spending Chart */}
        <div className="bg-white rounded-xl p-6 shadow-1 border-2 border-gray-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-dark flex items-center gap-2">
              <svg className="w-5 h-5 text-blue" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              Chi tiêu {period === "month" ? "theo tháng" : "theo năm"}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setPeriod("month")}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  period === "month" ? "bg-blue text-white" : "bg-gray-2 text-dark-5"
                }`}
              >
                Tháng
              </button>
              <button
                onClick={() => setPeriod("year")}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  period === "year" ? "bg-blue text-white" : "bg-gray-2 text-dark-5"
                }`}
              >
                Năm
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {monthlyData.length > 0 ? (
              monthlyData.slice(0, 6).map(([month, amount]) => (
                <div key={month}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-dark-5">{month}</span>
                    <span className="font-semibold text-dark">{formatVnd(amount)}</span>
                  </div>
                  <div className="h-2 bg-gray-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue transition-all duration-500"
                      style={{ width: `${(amount / maxSpending) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-dark-5 py-8">Chưa có dữ liệu chi tiêu</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl p-6 shadow-1 border-2 border-gray-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-dark">Đơn hàng gần đây</h3>
          <Link
            href="/my-account?tab=orders"
            className="text-sm text-blue hover:text-blue-dark font-medium"
          >
            Xem tất cả →
          </Link>
        </div>

        {(stats.recentOrders || []).length > 0 ? (
          <div className="space-y-3">
            {(stats.recentOrders || []).map((order: any) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 bg-gray-1 rounded-lg hover:bg-gray-2 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-semibold text-dark mb-1">
                    Đơn hàng #{order.id.slice(0, 8)}
                  </p>
                  <p className="text-sm text-dark-5">
                    {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-dark mb-1">{formatVnd(order.totalCents / 100)}</p>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      order.status === "COMPLETED"
                        ? "bg-green-light-6 text-green"
                        : order.status === "CANCELLED"
                        ? "bg-red-light-6 text-red"
                        : "bg-yellow-light-1 text-yellow-dark"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-dark-5 py-8">Chưa có đơn hàng nào</p>
        )}
      </div>
    </div>
  );
}
