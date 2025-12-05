import React, { useState } from "react";
import OrderModal from "./OrderModal";

const SingleOrder = ({ orderItem }: any) => {
  const [showModal, setShowModal] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("vi-VN") + "₫";
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { bg: string; text: string; icon: string; label: string; borderColor: string }> = {
      PENDING: { bg: "bg-yellow-light", text: "text-yellow-dark-2", icon: "⏳", label: "Chờ xác nhận", borderColor: "border-yellow" },
      PROCESSING: { bg: "bg-blue-light-5", text: "text-blue", icon: "🔄", label: "Đang xử lý", borderColor: "border-blue" },
      SHIPPED: { bg: "bg-purple-light-4", text: "text-purple-dark", icon: "🚚", label: "Đang giao", borderColor: "border-purple" },
      COMPLETED: { bg: "bg-green-light-5", text: "text-green-dark", icon: "✅", label: "Hoàn thành", borderColor: "border-green" },
      CANCELLED: { bg: "bg-red-light-5", text: "text-red-dark", icon: "❌", label: "Đã hủy", borderColor: "border-red" },
    };
    return configs[status] || { bg: "bg-gray-2", text: "text-gray-7", icon: "ℹ", label: status, borderColor: "border-gray-4" };
  };

  const statusConfig = getStatusConfig(orderItem.status);

  return (
    <>
      {/* Order Card - Completely New Design */}
      <div className={`group bg-white rounded-2xl shadow-1 hover:shadow-3 transition-all duration-300 overflow-hidden border-l-4 ${statusConfig.borderColor}`}>
        <div className="p-6">
          {/* Header Row */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
            {/* Left: Order ID & Status */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-light-6 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-6 mb-1">Mã đơn hàng</p>
                  <p className="font-bold text-dark text-lg">
                    #{(orderItem.id || "--------").slice(-8).toUpperCase()}
                  </p>
                </div>
              </div>
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm ${statusConfig.bg} ${statusConfig.text} shadow-sm`}>
                <span>{statusConfig.icon}</span>
                {statusConfig.label}
              </span>
            </div>

            {/* Right: Date & Total */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-2 text-gray-6">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm">{formatDate(orderItem.createdAt)}</span>
              </div>
              <div className="bg-blue-light-6 px-4 py-2 rounded-xl">
                <p className="text-xs text-gray-6 mb-1">Tổng tiền</p>
                <p className="font-bold text-blue text-xl">{formatPrice(orderItem.totalCents)}</p>
              </div>
            </div>
          </div>

          {/* Products Preview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {orderItem.items?.slice(0, 3).map((item: any, idx: number) => (
              <div key={item.id || idx} className="bg-gray-1 rounded-xl p-4 border border-gray-3 hover:border-blue transition-colors group/item">
                <div className="flex gap-3">
                  <div className="w-16 h-16 flex-shrink-0 bg-white rounded-lg overflow-hidden border-2 border-gray-3 group-hover/item:border-blue transition-colors">
                    {item.product?.imageUrl ? (
                      <img 
                        src={item.product.imageUrl} 
                        alt={item.product?.name || "Product"} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-4">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-dark text-sm mb-1 line-clamp-2">{item.product?.name || item.productId}</p>
                    <p className="text-xs text-gray-6">SL: <span className="font-bold text-dark">{item.quantity}</span></p>
                  </div>
                </div>
              </div>
            ))}
            {orderItem.items?.length > 3 && (
              <div className="bg-gray-1 rounded-xl p-4 border border-gray-3 flex items-center justify-center">
                <div className="text-center">
                  <p className="font-bold text-2xl text-blue mb-1">+{orderItem.items.length - 3}</p>
                  <p className="text-xs text-gray-6">sản phẩm khác</p>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Section */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t-2 border-gray-3">
            {/* Left: Payment Method */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-1 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-6">Thanh toán</p>
                <p className="font-semibold text-dark capitalize">{orderItem.paymentMethod || "COD"}</p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue hover:bg-blue-dark text-white px-6 py-3 rounded-xl font-bold transition-all duration-200 shadow-2 hover:shadow-3 group/btn"
              >
                <svg className="w-5 h-5 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>Xem chi tiết</span>
              </button>
            </div>
          </div>

          {/* Cancel Reason */}
          {orderItem.status === "CANCELLED" && orderItem.cancelReason && (
            <div className="mt-4 p-4 bg-red-light-6 border-l-4 border-red rounded-xl">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="font-bold text-red-dark text-sm mb-1">Lý do hủy đơn</p>
                  <p className="text-red-dark">{orderItem.cancelReason}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <OrderModal orderItem={orderItem} onClose={() => setShowModal(false)} />
      )}
    </>
  );
};

export default SingleOrder;
