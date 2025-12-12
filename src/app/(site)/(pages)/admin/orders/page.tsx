"use client";
import React, { useState, useEffect } from "react";
import { FaCheckCircle, FaTruck, FaTimesCircle } from "react-icons/fa";
import { Tooltip } from "@/components/Common/Tooltip";
import { formatVndFromCents } from "@/lib/formatVnd";

function OrderDetailModal({ order, onClose }: { order: any, onClose: () => void }) {
  if (!order) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-[350px] max-w-[90vw] relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl">×</button>
        <h2 className="text-lg font-bold mb-2">Chi tiết đơn hàng</h2>
        <div className="mb-2"><span className="font-semibold">Mã đơn:</span> <span className="font-mono">{order.id}</span></div>
        {order.user?.name && (
          <div className="mb-2"><span className="font-semibold">Tài khoản đặt hàng:</span> {order.user.name}</div>
        )}
        <div className="mb-2"><span className="font-semibold">Tên người nhận:</span> {order.customerName || "-"}</div>
        <div className="mb-2"><span className="font-semibold">Email:</span> {order.user?.email || order.customerEmail || "-"}</div>
        <div className="mb-2"><span className="font-semibold">Số điện thoại:</span> {order.customerPhone || "-"}</div>
        <div className="mb-2"><span className="font-semibold">Địa chỉ giao hàng:</span> {order.shippingAddress || "-"}</div>
        <div className="mb-2"><span className="font-semibold">Thành phố:</span> {order.city || "-"}</div>
        <div className="mb-2"><span className="font-semibold">Quốc gia/Khu vực:</span> {order.country || "-"}</div>
        <div className="mb-2"><span className="font-semibold">Phương thức thanh toán:</span> {order.paymentMethod === "bank" ? "Chuyển khoản ngân hàng" : order.paymentMethod === "cash" ? "Thanh toán khi nhận hàng" : order.paymentMethod || "-"}</div>
        <div className="mb-2"><span className="font-semibold">Trạng thái:</span> {order.status}</div>
        {order.status === "CANCELLED" && order.cancelReason && (
          <div className="mb-2">
            <span className="font-semibold text-red">Lý do hủy:</span> <span className="text-red-600">{order.cancelReason}</span>
          </div>
        )}
        {order.subtotalCents > 0 && <div className="mb-2"><span className="font-semibold">Tạm tính:</span> {formatVndFromCents(order.subtotalCents)}</div>}
        {order.couponCode && order.couponDiscount > 0 && (
          <div className="mb-2 text-green">
            <span className="font-semibold">Mã giảm giá ({order.couponCode}):</span> <span className="font-bold">-{(order.couponDiscount/100).toLocaleString()}₫</span>
          </div>
        )}
        {order.vipDiscount > 0 && (
          <div className="mb-2 text-blue">
            <span className="font-semibold">Giảm giá VIP:</span> <span className="font-bold">-{formatVndFromCents(order.vipDiscount)}</span>
          </div>
        )}
        <div className="mb-2"><span className="font-semibold">Tổng cộng:</span> <span className="text-blue font-bold text-lg">{order.totalCents ? formatVndFromCents(order.totalCents) : "0₫"}</span></div>
        <div className="mb-2"><span className="font-semibold">Ngày tạo:</span> {order.createdAt ? new Date(order.createdAt).toLocaleString() : "-"}</div>
        <div className="mb-2"><span className="font-semibold">Ghi chú:</span> {order.note || "-"}</div>
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Sản phẩm</h3>
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-2 py-1 border">Tên sản phẩm</th>
                <th className="px-2 py-1 border">Số lượng</th>
                <th className="px-2 py-1 border">Đơn giá</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item: any, idx: number) => (
                <tr key={item.id || idx}>
                  <td className="px-2 py-1 border flex items-center gap-2">
                    {item.product?.imageUrl && (
                      <img src={item.product.imageUrl} alt={item.product?.name || "Sản phẩm"} className="w-10 h-10 object-cover rounded" />
                    )}
                    <span>{item.product?.name || item.productId}</span>
                  </td>
                  <td className="px-2 py-1 border text-center">{item.quantity}</td>
                  <td className="px-2 py-1 border">{item.priceCents ? (item.priceCents / 100).toLocaleString() : "0"}₫</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const statusMap = {
  PENDING: {
    label: "Chờ xác nhận",
    color: "bg-yellow-light text-black font-bold",
    icon: <FaCheckCircle className="inline mr-1 text-yellow-dark" />,
  },
  PROCESSING: {
    label: "Đang xử lý",
    color: "bg-blue-light text-white font-bold",
    icon: <FaCheckCircle className="inline mr-1 text-blue-dark" />,
  },
  SHIPPED: {
    label: "Đang giao",
    color: "bg-purple-light text-black font-bold",
    icon: <FaTruck className="inline mr-1 text-white" />,
  },
  COMPLETED: {
    label: "Đã hoàn thành",
    color: "bg-green-light text-black font-bold",
    icon: <FaCheckCircle className="inline mr-1 text-green-dark" />,
  },
  CANCELLED: {
    label: "Đã hủy",
    color: "bg-red-light text-white font-bold",
    icon: <FaTimesCircle className="inline mr-1 text-white" />,
  },
};



export default function AdminOrdersPage() {
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<string>("");
  const [cancelModalOrder, setCancelModalOrder] = useState<any>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams();
    if (filter) params.append("status", filter);
    if (search) params.append("q", search);
    params.append("page", String(page));
    params.append("pageSize", String(pageSize));
    fetch(`/api/orders?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders || []);
        setTotalPages(data.totalPages || 1);
        setLoading(false);
      })
      .catch(() => {
        setError("Lỗi tải đơn hàng");
        setLoading(false);
      });
  }, [filter, search, page]);

  return (
    <div className="bg-white rounded-xl shadow-1 p-6">
      <h1 className="text-xl font-semibold text-dark mb-4">Quản lý đơn hàng</h1>
      <div className="flex flex-wrap gap-4 mb-4">
        <select
          className="border rounded px-3 py-2 text-sm"
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="PENDING">Chờ xác nhận</option>
          <option value="PROCESSING">Đang xử lý</option>
          <option value="SHIPPED">Đang giao</option>
          <option value="COMPLETED">Đã hoàn thành</option>
          <option value="CANCELLED">Đã hủy</option>
        </select>
        <input
          className="border rounded px-3 py-2 text-sm"
          placeholder="Tìm kiếm mã đơn hoặc khách hàng"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-3 py-2 border">Mã đơn</th>
              <th className="px-3 py-2 border">Khách hàng</th>
              <th className="px-3 py-2 border">Tổng tiền</th>
              <th className="px-3 py-2 border">Trạng thái</th>
              <th className="px-3 py-2 border">Ngày tạo</th>
              <th className="px-3 py-2 border">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-400">
                  Đang tải...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-red-500">
                  {error}
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-400">
                  Không có đơn hàng phù hợp
                </td>
              </tr>
            ) : (
              orders.map((order, idx) => (
                <tr
                  key={order.id}
                  className={`border-b transition duration-150 ${
                    idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } hover:bg-blue-50`}
                >
                  <td className="px-3 py-2 border font-mono">{order.id}</td>
                  <td className="px-3 py-2 border">
                    {order.customerName || order.user?.name || order.customerEmail || "-"}
                  </td>
                  <td className="px-3 py-2 border font-semibold text-green-700">
                    {formatVndFromCents(order.totalCents || 0)}
                  </td>
                  <td
                    className={`px-3 py-2 border font-semibold rounded flex items-center gap-1 ${
                      statusMap[order.status]?.color || "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {statusMap[order.status]?.icon}
                    {statusMap[order.status]?.label || order.status}
                  </td>
                  <td className="px-3 py-2 border">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-3 py-2 border flex gap-2">
                    <span>
                      <Tooltip content="Xem chi tiết đơn hàng" side="top">
                        <button
                          className="px-2 py-1 text-xs rounded border shadow transition"
                          style={{
                            background: "#22c55e",
                            color: "#fff",
                            border: "1px solid #16a34a",
                            fontWeight: 600,
                            boxShadow: "0 1px 4px #16a34a22",
                            fontSize: 13,
                            lineHeight: "18px",
                            zIndex: 1,
                            position: "relative",
                            outline: "none",
                            cursor: "pointer",
                            WebkitAppearance: "none",
                            MozAppearance: "none",
                            appearance: "none",
                            backgroundClip: "padding-box",
                            backgroundColor: "#22c55e !important",
                            colorScheme: "light",
                            color: "#fff !important",
                          }}
                          onClick={() => setSelectedOrder(order)}
                        >
                          Xem
                        </button>
                      </Tooltip>
                    </span>
                    <span>
                      <Tooltip content="Cập nhật trạng thái" side="top">
                        <button
                          className="px-2 py-1 text-xs rounded border shadow transition"
                          style={{
                            background: "#3B82F6",
                            color: "#fff",
                            border: "1px solid #2563EB",
                            fontWeight: 600,
                            boxShadow: "0 1px 4px #2563EB22",
                            fontSize: 13,
                            lineHeight: "18px",
                            zIndex: 1,
                            position: "relative",
                            outline: "none",
                            cursor: "pointer",
                            WebkitAppearance: "none",
                            MozAppearance: "none",
                            appearance: "none",
                            backgroundClip: "padding-box",
                            backgroundColor: "#3B82F6 !important",
                            colorScheme: "light",
                            color: "#fff !important",
                          }}
                          disabled={
                            actionLoading === order.id + "-update" ||
                            order.status === "CANCELLED" ||
                            order.status === "COMPLETED" ||
                            order.status === "SHIPPED"
                          }
                          onClick={async () => {
                            setActionLoading(order.id + "-update");
                            let nextStatus = "PROCESSING";
                            if (order.status === "PENDING") nextStatus = "PROCESSING";
                            else if (order.status === "PROCESSING") nextStatus = "SHIPPED";
                            console.log("[Cập nhật trạng thái]", order.id, "->", nextStatus);
                            try {
                              const res = await fetch(`/api/orders/${order.id}/status`, {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ status: nextStatus }),
                              });
                              const result = await res.json();
                              console.log("[Kết quả cập nhật]", result);
                              // Reload orders
                              const params = new URLSearchParams();
                              if (filter) params.append("status", filter);
                              if (search) params.append("q", search);
                              params.append("page", String(page));
                              params.append("pageSize", String(pageSize));
                              const resList = await fetch(`/api/orders?${params.toString()}`);
                              const data = await resList.json();
                              setOrders(data.orders || []);
                            } finally {
                              setActionLoading("");
                            }
                          }}
                        >
                          {actionLoading === order.id + "-update"
                            ? "Đang cập nhật..."
                            : "Cập nhật"}
                        </button>
                      </Tooltip>
                    </span>
                    {order.status === "SHIPPED" && (
                      <span>
                        <Tooltip content="Xác nhận hoàn thành" side="top">
                          <button
                            className="px-2 py-1 text-xs rounded border shadow transition"
                            style={{
                              background: "#22c55e",
                              color: "#fff",
                              border: "1px solid #16a34a",
                              fontWeight: 600,
                              boxShadow: "0 1px 4px #16a34a22",
                              fontSize: 13,
                              lineHeight: "18px",
                              zIndex: 1,
                              position: "relative",
                              outline: "none",
                              cursor: "pointer",
                              WebkitAppearance: "none",
                              MozAppearance: "none",
                              appearance: "none",
                              backgroundClip: "padding-box",
                              backgroundColor: "#22c55e !important",
                              colorScheme: "light",
                              color: "#fff !important",
                            }}
                            disabled={actionLoading === order.id + "-complete"}
                            onClick={async () => {
                              setActionLoading(order.id + "-complete");
                              console.log("[Xác nhận hoàn thành]", order.id);
                              try {
                                const res = await fetch(`/api/orders/${order.id}/status`, {
                                  method: "PUT",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ status: "COMPLETED" }),
                                });
                                const result = await res.json();
                                console.log("[Kết quả hoàn thành]", result);
                                // Reload orders
                                const params = new URLSearchParams();
                                if (filter) params.append("status", filter);
                                if (search) params.append("q", search);
                                params.append("page", String(page));
                                params.append("pageSize", String(pageSize));
                                const resList = await fetch(`/api/orders?${params.toString()}`);
                                const data = await resList.json();
                                setOrders(data.orders || []);
                              } finally {
                                setActionLoading("");
                              }
                            }}
                          >
                            {actionLoading === order.id + "-complete"
                              ? "Đang xác nhận..."
                              : "Xác nhận hoàn thành"}
                          </button>
                        </Tooltip>
                      </span>
                    )}
                    <span>
                      <Tooltip content="Hủy đơn hàng" side="top">
                        <button
                          className={`px-2 py-1 text-xs rounded border shadow transition bg-red text-white border-red-dark font-semibold disabled:opacity-50 disabled:cursor-not-allowed`}
                          disabled={
                            actionLoading === order.id + "-cancel" ||
                            order.status === "SHIPPED" ||
                            order.status === "COMPLETED" ||
                            order.status === "CANCELLED"
                          }
                          onClick={() => {
                            setCancelModalOrder(order);
                            setCancelReason("");
                          }}
                        >
                          {actionLoading === order.id + "-cancel"
                            ? "Đang hủy..."
                            : "Hủy"}
                        </button>
                      </Tooltip>
                      {/* Modal nhập lý do hủy đơn hàng */}
                      {cancelModalOrder && (
                        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                          <div className="bg-white rounded-lg shadow-lg p-6 min-w-[350px] max-w-[90vw] relative">
                            <h2 className="text-lg font-bold mb-2">Nhập lý do hủy đơn hàng</h2>
                            <div className="mb-2">Mã đơn: <span className="font-mono">{cancelModalOrder.id}</span></div>
                            <textarea
                              className="border rounded w-full p-2 mb-4"
                              rows={3}
                              placeholder="Nhập lý do hủy..."
                              value={cancelReason}
                              onChange={e => setCancelReason(e.target.value)}
                            />
                            <div className="flex gap-2 justify-end">
                              <button
                                className="px-3 py-1 rounded bg-gray-3 text-gray-7 font-semibold"
                                onClick={() => setCancelModalOrder(null)}
                              >Hủy bỏ</button>
                              <button
                                className="px-3 py-1 rounded bg-red text-white font-semibold disabled:opacity-50"
                                disabled={!cancelReason || actionLoading === cancelModalOrder.id + "-cancel"}
                                onClick={async () => {
                                  setActionLoading(cancelModalOrder.id + "-cancel");
                                  try {
                                    await fetch(`/api/orders/${cancelModalOrder.id}/status`, {
                                      method: "PUT",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({ status: "CANCELLED", cancelReason }),
                                    });
                                    // Reload orders
                                    const params = new URLSearchParams();
                                    if (filter) params.append("status", filter);
                                    if (search) params.append("q", search);
                                    params.append("page", String(page));
                                    params.append("pageSize", String(pageSize));
                                    const resList = await fetch(`/api/orders?${params.toString()}`);
                                    const data = await resList.json();
                                    setOrders(data.orders || []);
                                    setCancelModalOrder(null);
                                  } finally {
                                    setActionLoading("");
                                  }
                                }}
                              >Xác nhận hủy</button>
                            </div>
                          </div>
                        </div>
                      )}
                    </span>
                    {order.status === "CANCELLED" && (
                      <span>
                        <Tooltip content="Xóa đơn hàng" side="top">
                          <button
                            className="px-2 py-1 text-xs rounded border shadow transition"
                            style={{
                              background: "#6B7280",
                              color: "#fff",
                              border: "1px solid #374151",
                              fontWeight: 600,
                              boxShadow: "0 1px 4px #37415122",
                              fontSize: 13,
                              lineHeight: "18px",
                              zIndex: 1,
                              position: "relative",
                              outline: "none",
                              cursor: "pointer",
                              WebkitAppearance: "none",
                              MozAppearance: "none",
                              appearance: "none",
                              backgroundClip: "padding-box",
                              backgroundColor: "#6B7280 !important",
                              colorScheme: "light",
                              color: "#fff",
                              textShadow: "0 1px 2px #0002",
                            }}
                            disabled={actionLoading === order.id + "-delete"}
                            onClick={async () => {
                              if (!window.confirm("Bạn có chắc chắn muốn xóa đơn hàng này? Thao tác này không thể hoàn tác.")) return;
                              setActionLoading(order.id + "-delete");
                              try {
                                await fetch(`/api/orders/${order.id}`, { method: "DELETE" });
                                // Xóa đơn hàng khỏi danh sách hiện tại mà không cần reload toàn bộ
                                setOrders(prev => prev.filter(o => o.id !== order.id));
                              } finally {
                                setActionLoading("");
                              }
                            }}
                          >
                            {actionLoading === order.id + "-delete"
                              ? "Đang xóa..."
                              : "Xóa"}
                          </button>
                        </Tooltip>
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Modal chi tiết đơn hàng */}
      <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 mt-4">
        <button
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
          className="px-3 py-1 rounded border bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
        >
          Trước
        </button>
        <span>
          Trang {page} / {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage(page + 1)}
          className="px-3 py-1 rounded border bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
        >
          Sau
        </button>
      </div>
    </div>
  );
}
