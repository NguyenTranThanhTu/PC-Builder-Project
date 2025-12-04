"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

type VIPTierConfig = {
  tier: number;
  name: string;
  minSpend: number;
  discountPercent: number;
  badgeColor: string;
};

type UserVIPData = {
  vipTier: number;
  totalSpent: number;
  tierConfig?: VIPTierConfig;
  nextTierConfig?: VIPTierConfig;
  progressPercent?: number;
};

export default function VIPBadge() {
  const { data: session, status } = useSession();
  const [vipData, setVipData] = useState<UserVIPData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      fetchVIPData();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status, session]);

  const fetchVIPData = async () => {
    try {
      const res = await fetch("/api/user/vip-status");
      if (res.ok) {
        const data = await res.json();
        setVipData(data);
      }
    } catch (error) {
      console.error("Failed to fetch VIP data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !session || !vipData) return null;

  const { vipTier, tierConfig, nextTierConfig, progressPercent } = vipData;

  if (vipTier === 0) return null; // Don't show badge for non-VIP

  return (
    <div className="relative group">
      {/* VIP Badge */}
      <div
        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-white cursor-pointer transition-transform hover:scale-105"
        style={{ backgroundColor: tierConfig?.badgeColor || "#CD7F32" }}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <span>{tierConfig?.name || `VIP ${vipTier}`}</span>
      </div>

      {/* Tooltip on hover */}
      <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: tierConfig?.badgeColor }}
          >
            {vipTier}
          </div>
          <div>
            <p className="font-semibold text-dark">{tierConfig?.name}</p>
            <p className="text-xs text-gray-600">Giảm {tierConfig?.discountPercent}% mọi đơn hàng</p>
          </div>
        </div>

        {nextTierConfig && (
          <div className="border-t pt-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Tiến độ lên {nextTierConfig.name}</span>
              <span className="font-semibold text-blue">{progressPercent}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue to-purple transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Còn {((nextTierConfig.minSpend - vipData.totalSpent) / 100).toLocaleString("vi-VN")}₫
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
