import React, { useEffect, useState } from "react";
import SingleOrder from "./SingleOrder";

const Orders = () => {
  const [orders, setOrders] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetch(`/api/orders`)
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders || []);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err.message);
        setLoading(false);
      });
  }, []);

  const filteredOrders = orders.filter((order: any) => {
    if (filter === "ALL") return true;
    return order.status === filter;
  });

  const getStatusCount = (status: string) => {
    if (status === "ALL") return orders.length;
    return orders.filter((o: any) => o.status === status).length;
  };

  return (
    <>
      <div className="w-full">
        {/* Header with stats */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-dark">Đơn hàng của tôi</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>Tổng: <strong>{orders.length}</strong> đơn hàng</span>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2">
            {["ALL", "PENDING", "PROCESSING", "SHIPPED", "COMPLETED", "CANCELLED"].map((status) => {
              const count = getStatusCount(status);
              return (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                    filter === status
                      ? "bg-blue text-white shadow-2 transform scale-105"
                      : "bg-gray-1 text-gray-7 hover:bg-gray-2 border border-gray-3"
                  }`}
                >
                  {status === "ALL" && `Tất cả (${count})`}
                  {status === "PENDING" && `⏳ Chờ xác nhận (${count})`}
                  {status === "PROCESSING" && `🔄 Đang xử lý (${count})`}
                  {status === "SHIPPED" && `🚚 Đang giao (${count})`}
                  {status === "COMPLETED" && `✅ Hoàn thành (${count})`}
                  {status === "CANCELLED" && `❌ Đã hủy (${count})`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Orders list */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue"></div>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((orderItem: any, key: number) => (
              <SingleOrder key={orderItem.id || key} orderItem={orderItem} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-1 rounded-2xl border-2 border-dashed border-gray-3">
            <svg className="w-20 h-20 mx-auto mb-4 text-gray-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-dark mb-2">
              {filter === "ALL" ? "Chưa có đơn hàng nào" : `Không có đơn hàng "${filter}"`}
            </h3>
            <p className="text-gray-6 mb-6">
              {filter === "ALL" 
                ? "Hãy bắt đầu mua sắm và tạo đơn hàng đầu tiên của bạn!"
                : "Thử chọn bộ lọc khác để xem đơn hàng"}
            </p>
            {filter === "ALL" && (
              <a
                href="/"
                className="inline-flex items-center gap-2 bg-blue text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-dark transition-colors shadow-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Bắt đầu mua sắm
              </a>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Orders;
