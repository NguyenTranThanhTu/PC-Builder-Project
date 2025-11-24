"use client";
import React, { useState, useEffect } from "react";
import { FaCheckCircle, FaTruck, FaTimesCircle } from "react-icons/fa";
import { Tooltip } from "@/components/Common/Tooltip";

function OrderDetailModal({ order, onClose }: { order: any, onClose: () => void }) {
  if (!order) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-[350px] max-w-[90vw] relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl">×</button>
        <h2 className="text-lg font-bold mb-2">Chi tiết đơn hàng</h2>
        <div className="mb-2"><span className="font-semibold">Mã đơn:</span> <span className="font-mono">{order.id}</span></div>
        <div className="mb-2"><span className="font-semibold">Khách hàng:</span> {order.customerName || order.user?.name || order.customerEmail || "-"}</div>
        <div className="mb-2"><span className="font-semibold">Email:</span> {order.customerEmail || order.user?.email || "-"}</div>
        <div className="mb-2"><span className="font-semibold">Số điện thoại:</span> {order.customerPhone || "-"}</div>
        <div className="mb-2"><span className="font-semibold">Địa chỉ giao hàng:</span> {order.shippingAddress || "-"}</div>
        <div className="mb-2"><span className="font-semibold">Trạng thái:</span> {order.status}</div>
        <div className="mb-2"><span className="font-semibold">Tổng tiền:</span> {order.totalCents ? (order.totalCents/100).toLocaleString() : "0"}₫</div>
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
                  <td className="px-2 py-1 border">{item.productId}</td>
                  <td className="px-2 py-1 border">{item.quantity}</td>
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
    color: "bg-gray-100 text-gray-800",
    icon: <FaCheckCircle className="inline mr-1 text-gray-500" />,
  },
  PROCESSING: {
    label: "Đang xử lý",
    color: "bg-yellow-100 text-yellow-800",
    icon: <FaCheckCircle className="inline mr-1 text-yellow-500" />,
  },
  SHIPPED: {
    label: "Đang giao",
    color: "bg-blue-100 text-blue-800",
    icon: <FaTruck className="inline mr-1 text-blue-500" />,
  },
  COMPLETED: {
    label: "Đã hoàn thành",
    color: "bg-green-100 text-green-800",
    icon: <FaCheckCircle className="inline mr-1 text-green-500" />,
  },
  CANCELLED: {
    label: "Đã hủy",
    color: "bg-red-100 text-red-800",
    icon: <FaTimesCircle className="inline mr-1 text-red-500" />,
  },
};



export default function AdminOrdersPage() {
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<string>("");
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
                    {order.totalCents ? (order.totalCents / 100).toLocaleString() : "0"}₫
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
                          className="px-2 py-1 text-xs rounded border shadow transition"
                          style={{
                            background: "#EF4444",
                            color: "#fff",
                            border: "1px solid #B91C1C",
                            fontWeight: 600,
                            boxShadow: "0 1px 4px #B91C1C22",
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
                            backgroundColor: "#EF4444 !important",
                            colorScheme: "light",
                            color: "#fff !important",
                          }}
                          disabled={actionLoading === order.id + "-cancel"}
                          onClick={async () => {
                            if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) return;
                            setActionLoading(order.id + "-cancel");
                            console.log("[Hủy đơn hàng]", order.id);
                            try {
                              const res = await fetch(`/api/orders/${order.id}/status`, {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ status: "CANCELLED" }),
                              });
                              const result = await res.json();
                              console.log("[Kết quả hủy]", result);
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
                          {actionLoading === order.id + "-cancel"
                            ? "Đang hủy..."
                            : "Hủy"}
                        </button>
                      </Tooltip>
                    </span>
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
