import React from "react";

interface OrderModalProps {
  orderItem: any;
  onClose: () => void;
}

const OrderModal: React.FC<OrderModalProps> = ({ orderItem, onClose }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("vi-VN") + "₫";
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { bg: string; text: string; icon: string; label: string }> = {
      PENDING: { bg: "bg-yellow-light", text: "text-yellow-dark-2", icon: "⏳", label: "Chờ xác nhận" },
      PROCESSING: { bg: "bg-blue-light-5", text: "text-blue", icon: "🔄", label: "Đang xử lý" },
      SHIPPED: { bg: "bg-purple-light-4", text: "text-purple-dark", icon: "🚚", label: "Đang giao" },
      COMPLETED: { bg: "bg-green-light-5", text: "text-green-dark", icon: "✅", label: "Hoàn thành" },
      CANCELLED: { bg: "bg-red-light-5", text: "text-red-dark", icon: "❌", label: "Đã hủy" },
    };
    return configs[status] || { bg: "bg-gray-2", text: "text-gray-7", icon: "ℹ", label: status };
  };

  const statusConfig = getStatusConfig(orderItem.status);

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-8 animate-fadeIn">
      <div className="relative bg-white rounded-2xl shadow-3 w-full max-w-4xl max-h-[90vh] overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue to-blue-dark px-6 sm:px-8 py-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h2 className="font-bold text-white text-2xl">Chi tiết đơn hàng</h2>
                <p className="text-white/80 text-sm mt-1">#{(orderItem.id || "--------").slice(-8).toUpperCase()}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)] px-6 sm:px-8 py-6">
          {/* Status & Date */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-6 border-b-2 border-gray-3">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-gray-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-xs text-gray-6">Ngày đặt hàng</p>
                <p className="font-semibold text-dark">{formatDate(orderItem.createdAt)}</p>
              </div>
            </div>
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm ${statusConfig.bg} ${statusConfig.text}`}>
              <span>{statusConfig.icon}</span>
              {statusConfig.label}
            </span>
          </div>

          {/* Products List */}
          <div className="mb-6">
            <h3 className="font-bold text-dark text-lg mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Sản phẩm ({orderItem.items?.length || 0})
            </h3>
            <div className="space-y-3">
              {orderItem.items?.map((item: any, idx: number) => (
                <div key={item.id || idx} className="flex items-center gap-4 p-4 bg-gray-1 rounded-xl border border-gray-3 hover:shadow-1 transition-shadow">
                  <div className="w-20 h-20 flex-shrink-0 bg-white rounded-lg overflow-hidden border-2 border-gray-3 shadow-1">
                    {item.product?.imageUrl ? (
                      <img 
                        src={item.product.imageUrl} 
                        alt={item.product?.name || "Product"} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-4">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-dark mb-1">{item.product?.name || item.productId}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-6">
                      <span>Số lượng: <span className="font-bold text-dark">{item.quantity}</span></span>
                      <span className="text-gray-4">•</span>
                      <span>Đơn giá: <span className="font-bold text-dark">{formatPrice(item.priceCents)}</span></span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-6 mb-1">Thành tiền</p>
                    <p className="font-bold text-blue text-lg">{formatPrice(item.priceCents * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-blue-light-6 rounded-xl p-6 border-2 border-blue-light-4 mb-6">
            <h3 className="font-bold text-dark text-lg mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Tổng quan đơn hàng
            </h3>
            <div className="space-y-3">
              {orderItem.subtotalCents && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-6">Tạm tính:</span>
                  <span className="font-semibold text-dark">{formatPrice(orderItem.subtotalCents)}</span>
                </div>
              )}
              {orderItem.couponDiscount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-green">Giảm giá (Coupon):</span>
                  <span className="font-semibold text-green">-{formatPrice(orderItem.couponDiscount)}</span>
                </div>
              )}
              {orderItem.vipDiscount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-purple">Giảm giá VIP:</span>
                  <span className="font-semibold text-purple">-{formatPrice(orderItem.vipDiscount)}</span>
                </div>
              )}
              <div className="border-t-2 border-blue pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-dark text-lg">Tổng cộng:</span>
                  <span className="font-bold text-blue text-2xl">{formatPrice(orderItem.totalCents)}</span>
                </div>
              </div>
              <div className="flex justify-between items-center text-sm pt-2">
                <span className="text-gray-6">Phương thức thanh toán:</span>
                <span className="font-semibold text-dark capitalize">{orderItem.paymentMethod || "COD"}</span>
              </div>
            </div>
          </div>

          {/* Customer & Shipping Info */}
          <div className="bg-gray-1 rounded-xl p-6 border border-gray-3 mb-6">
            <h3 className="font-bold text-dark text-lg mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Thông tin khách hàng
            </h3>
            <div className="space-y-3">
              {orderItem.customerName && (
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-gray-6 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <div>
                    <p className="text-xs text-gray-6 mb-0.5">Họ và tên</p>
                    <p className="font-semibold text-dark">{orderItem.customerName}</p>
                  </div>
                </div>
              )}
              
              {orderItem.customerEmail && (
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-gray-6 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-xs text-gray-6 mb-0.5">Email</p>
                    <p className="font-medium text-dark">{orderItem.customerEmail}</p>
                  </div>
                </div>
              )}

              {orderItem.customerPhone && (
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-gray-6 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <p className="text-xs text-gray-6 mb-0.5">Số điện thoại</p>
                    <p className="font-medium text-dark">{orderItem.customerPhone}</p>
                  </div>
                </div>
              )}

              {orderItem.shippingAddress && (
                <div className="flex items-start gap-3 pt-3 border-t border-gray-3">
                  <svg className="w-5 h-5 text-blue flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="text-xs text-gray-6 mb-0.5">Địa chỉ giao hàng</p>
                    <p className="font-semibold text-dark">{orderItem.shippingAddress}</p>
                    {orderItem.city && <p className="text-sm text-gray-6 mt-1">Thành phố: {orderItem.city}</p>}
                    {orderItem.country && <p className="text-sm text-gray-6">Quốc gia: {orderItem.country}</p>}
                  </div>
                </div>
              )}

              {orderItem.note && (
                <div className="flex items-start gap-3 pt-3 border-t border-gray-3">
                  <svg className="w-5 h-5 text-gray-6 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  <div>
                    <p className="text-xs text-gray-6 mb-0.5">Ghi chú</p>
                    <p className="text-dark">{orderItem.note}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cancel Reason */}
          {orderItem.status === "CANCELLED" && orderItem.cancelReason && (
            <div className="bg-red-light-6 border-l-4 border-red rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="font-bold text-red-dark mb-1">Lý do hủy đơn:</p>
                  <p className="text-red">{orderItem.cancelReason}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-8 py-4 bg-gray-1 border-t-2 border-gray-3">
          <button
            onClick={onClose}
            className="w-full bg-blue hover:bg-blue-dark text-white font-bold py-3 rounded-xl transition-colors shadow-2"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderModal;
