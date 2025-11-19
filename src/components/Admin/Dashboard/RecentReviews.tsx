import React from "react";

type Review = {
  id: string;
  author: string;
  product: string;
  content: string;
  rating: number;
  createdAt: Date;
};

export default async function RecentReviews({ data }: { data?: Review[] }) {
  const rows: Review[] = data ?? [
    { id: "31", author: "Nguyễn Văn c", product: "Điện thoại iPhone 15 Pro Max 256GB", content: "test", rating: 2, createdAt: new Date() },
    { id: "30", author: "Nguyễn B", product: "Điện thoại iPhone 15 Pro Max 256GB", content: "sản phẩm ổn", rating: 5, createdAt: new Date() },
    { id: "29", author: "Nguyễn B", product: "Tủ lạnh LG Inverter 470 lít Multi Door GR-B50BL", content: "ổn đấy", rating: 2, createdAt: new Date() },
    { id: "28", author: "chu loi", product: "Tủ lạnh LG Inverter 470 lít Multi Door GR-B50BL", content: "sp oke", rating: 5, createdAt: new Date() },
  ];

  return (
    <div className="border rounded-lg p-4 bg-white">
      <h3 className="font-medium text-dark mb-3">Danh sách đánh giá mới nhất</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="py-2 px-3">#</th>
              <th className="py-2 px-3">Tên đánh giá</th>
              <th className="py-2 px-3">Sản phẩm</th>
              <th className="py-2 px-3">Nội dung</th>
              <th className="py-2 px-3">Rating</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b">
                <td className="py-2 px-3">{r.id}</td>
                <td className="py-2 px-3">{r.author}</td>
                <td className="py-2 px-3 whitespace-nowrap">{r.product}</td>
                <td className="py-2 px-3">{r.content}</td>
                <td className="py-2 px-3">{r.rating}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
