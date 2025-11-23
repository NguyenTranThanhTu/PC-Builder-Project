import React from "react";
import { formatVnd } from "@/lib/formatVnd";

type Order = {
  id: string;
  customer: string;
  phone: string;
  total: number; // VND
  status: "Đang chờ" | "Đã xử lý" | "Đang giao" | "Huỷ";
  createdAt: Date;
};

function StatusBadge({ s }: { s: Order["status"] }) {
  const color =
    s === "Đã xử lý" ? "bg-emerald-100 text-emerald-700" :
    s === "Đang giao" ? "bg-blue-100 text-blue" :
    s === "Huỷ" ? "bg-red-100 text-red" :
    "bg-gray-100 text-gray-700";
  return <span className={`px-2 py-1 rounded text-xs ${color}`}>{s}</span>;
}

export default async function RecentOrders({ data }: { data?: Order[] }) {
  // Mock data for now
  const rows: Order[] = data ?? [
    { id: "87", customer: "Nguyễn B", phone: "0986890456", total: 165_000_000, status: "Đang chờ", createdAt: new Date() },
    { id: "86", customer: "Nguyễn Văn c", phone: "0961800344", total: 116_600_000, status: "Đang chờ", createdAt: new Date() },
    { id: "85", customer: "Nguyễn B", phone: "0986890456", total: 33_000_000, status: "Đã xử lý", createdAt: new Date() },
    { id: "84", customer: "Nguyễn B", phone: "0986890456", total: 20_900_000, status: "Đang chờ", createdAt: new Date() },
  ];

  return (
    <div className="border rounded-lg p-4 bg-white">
      <h3 className="font-medium text-dark mb-3">Danh sách đơn hàng mới</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="py-2 px-3">#</th>
              <th className="py-2 px-3">Tên Khách hàng</th>
              <th className="py-2 px-3">Số điện thoại</th>
              <th className="py-2 px-3">Tổng tiền</th>
              <th className="py-2 px-3">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id} className="border-b">
                <td className="py-2 px-3">{o.id}</td>
                <td className="py-2 px-3">{o.customer}</td>
                <td className="py-2 px-3">{o.phone}</td>
                <td className="py-2 px-3">{formatVnd(o.total)}</td>
                <td className="py-2 px-3"><StatusBadge s={o.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
