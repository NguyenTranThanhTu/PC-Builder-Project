"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

type VIPTierConfig = {
  tier: number;
  name: string;
  discountPercent: number;
  badgeColor: string;
};

type Props = {
  oldTier: number;
  newTier: number;
  show: boolean;
  onClose: () => void;
};

export default function VIPUpgradeModal({ oldTier, newTier, show, onClose }: Props) {
  const [tierConfig, setTierConfig] = useState<VIPTierConfig | null>(null);

  useEffect(() => {
    if (show) {
      fetchTierConfig();
      triggerConfetti();
    }
  }, [show, newTier]);

  const fetchTierConfig = async () => {
    try {
      const res = await fetch(`/api/public/vip-tiers/${newTier}`);
      if (res.ok) {
        const data = await res.json();
        setTierConfig(data);
      }
    } catch (error) {
      console.error("Failed to fetch tier config:", error);
    }
  };

  const triggerConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999] p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 relative animate-scaleIn shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="text-center">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center animate-bounce"
              style={{
                backgroundColor: tierConfig?.badgeColor || "#FFD700",
                boxShadow: `0 0 50px ${tierConfig?.badgeColor || "#FFD700"}50`,
              }}
            >
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-dark mb-2">
            🎉 Chúc mừng!
          </h2>
          <p className="text-xl text-gray-700 mb-6">
            Bạn đã được nâng cấp lên
          </p>

          {/* VIP Badge */}
          <div
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full text-white text-2xl font-bold mb-6"
            style={{ backgroundColor: tierConfig?.badgeColor || "#FFD700" }}
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>{tierConfig?.name || `VIP ${newTier}`}</span>
          </div>

          {/* Benefits */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-dark mb-3">Quyền lợi của bạn:</h3>
            <ul className="space-y-2 text-left">
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-gray-700">
                  Giảm <strong className="text-blue">{tierConfig?.discountPercent}%</strong> cho tất cả đơn hàng
                </span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-gray-700">
                  Truy cập mã giảm giá <strong className="text-blue">VIP độc quyền</strong>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-gray-700">
                  Hỗ trợ <strong className="text-blue">ưu tiên</strong> từ đội ngũ chăm sóc khách hàng
                </span>
              </li>
            </ul>
          </div>

          {/* Action Button */}
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-blue to-purple text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200"
          >
            Bắt đầu mua sắm ngay!
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scaleIn {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
}
