import React, { useState } from "react";
import OrderActions from "./OrderActions";
import OrderModal from "./OrderModal";

const SingleOrder = ({ orderItem, smallView }: any) => {
    const [showQuickView, setShowQuickView] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  const toggleEdit = () => {
    setShowEdit(!showEdit);
  };

  const toggleModal = (status: boolean) => {
    setShowDetails(status);
    setShowEdit(status);
  };

  return (
    <>
      {/* Modal chi tiết đơn hàng */}
      {showQuickView && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 min-w-[350px] max-w-[90vw] relative">
            <button onClick={() => setShowQuickView(false)} className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl">×</button>
            <h2 className="text-lg font-bold mb-4">Chi tiết đơn hàng</h2>
            <div className="mb-2"><span className="font-semibold">Mã đơn:</span> <span className="font-mono">{orderItem.orderId || orderItem.id}</span></div>
            <div className="mb-2"><span className="font-semibold">Ngày đặt:</span> {orderItem.createdAt}</div>
            <div className="mb-2"><span className="font-semibold">Trạng thái:</span> {orderItem.status}</div>
            <div className="mb-2">
              <span className="font-bold text-base md:text-lg">Tổng tiền:</span> <span className="text-blue font-bold text-lg md:text-xl">{typeof orderItem.totalCents === "number" ? `${(orderItem.totalCents/100).toLocaleString()}₫` : orderItem.totalCents || "-"}</span>
            </div>
            {orderItem.status === "CANCELLED" && orderItem.cancelReason && (
              <div className="mb-2">
                <span className="font-semibold text-red-600">Lý do hủy:</span> <span className="text-red-500">{orderItem.cancelReason}</span>
              </div>
            )}
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Sản phẩm</h3>
              <table className="min-w-full border text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-2 py-1 border">Ảnh</th>
                    <th className="px-2 py-1 border">Tên sản phẩm</th>
                    <th className="px-2 py-1 border">Số lượng</th>
                    <th className="px-2 py-1 border">Giá tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {orderItem.items?.map((item: any, idx: number) => (
                    <tr key={item.id || idx}>
                      <td className="px-2 py-1 border text-center">
                        {item.product?.imageUrl ? (
                          <img src={item.product.imageUrl} alt={item.product?.name || "Sản phẩm"} className="w-12 h-12 object-cover rounded" />
                        ) : (
                          <span className="text-gray-400">Không có ảnh</span>
                        )}
                      </td>
                      <td className="px-2 py-1 border">{item.product?.name || item.productId}</td>
                      <td className="px-2 py-1 border text-center">{item.quantity}</td>
                      <td className="px-2 py-1 border">{item.priceCents ? `${(item.priceCents/100).toLocaleString()}₫` : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {!smallView && (
        <div className="items-center justify-between border rounded-xl shadow-md py-6 px-8 mb-5 bg-white hover:shadow-lg transition-all flex flex-wrap">
          <div className="min-w-[111px] flex items-center gap-2">
            <span className="font-bold text-gray-7">#{(orderItem.orderId || orderItem.id || "--------").slice(-8)}</span>
            {/* Đảm bảo căn lề cho badge trạng thái, đặc biệt với CANCELLED */}
            {orderItem.status === "CANCELLED" && (
              <span className="inline-block px-2 py-0.5 rounded bg-red-light-5 text-red-dark text-xs font-semibold ml-2 align-middle">Đã hủy</span>
            )}
            {orderItem.status === "PENDING" && (
              <span className="inline-block px-2 py-0.5 rounded bg-yellow-light text-black text-xs font-semibold ml-2 align-middle">Chờ xác nhận</span>
            )}
            {orderItem.status === "PROCESSING" && (
              <span className="inline-block px-2 py-0.5 rounded bg-blue-light text-white text-xs font-semibold ml-2 align-middle">Đang xử lý</span>
            )}
            {orderItem.status === "SHIPPED" && (
              <span className="inline-block px-2 py-0.5 rounded bg-purple-light text-black text-xs font-semibold ml-2 align-middle">Đang giao</span>
            )}
            {orderItem.status === "COMPLETED" && (
              <span className="inline-block px-2 py-0.5 rounded bg-green-light text-black text-xs font-semibold ml-2 align-middle">Đã hoàn thành</span>
            )}
          </div>
          <div className="min-w-[175px]">
            <p className="text-custom-sm text-gray-6">{orderItem.createdAt}</p>
          </div>

          <div className="min-w-[128px]">
            <span
              className={`inline-flex items-center gap-1 text-custom-sm py-1 px-3 rounded-full capitalize font-semibold ${
                orderItem.status === "PENDING"
                  ? "bg-yellow-light text-black border border-yellow-dark"
                  : orderItem.status === "PROCESSING"
                  ? "bg-blue-light text-white border border-blue-dark"
                  : orderItem.status === "SHIPPED"
                  ? "bg-purple-light text-black border border-purple-dark"
                  : orderItem.status === "COMPLETED"
                  ? "bg-green-light text-black border border-green-dark"
                  : orderItem.status === "CANCELLED"
                  ? "bg-red-light-5 text-red-dark border border-red"
                  : "bg-gray-3 text-gray-6 border border-gray-4"
              }`}
            >
              {orderItem.status === "PENDING" && <span>⏳</span>}
              {orderItem.status === "PROCESSING" && <span>🔄</span>}
              {orderItem.status === "SHIPPED" && <span>🚚</span>}
              {orderItem.status === "COMPLETED" && <span>✔️</span>}
              {orderItem.status === "CANCELLED" && <span>❌</span>}
              {orderItem.status}
            </span>
          </div>

          <div className="min-w-[213px]">
            <p className="text-custom-sm text-dark font-medium">{orderItem.title}</p>
            {/* Hiển thị lý do hủy đơn hàng nếu có */}
            {orderItem.status === "CANCELLED" && orderItem.cancelReason && (
              <div className="mt-2 px-3 py-2 rounded bg-red-light-6 border border-red-light-4 flex items-center">
                <span className="font-semibold text-red-dark mr-2">Lý do hủy:</span>
                <span className="text-red-500">{orderItem.cancelReason}</span>
              </div>
            )}
          </div>

          <div className="min-w-[113px] w-full flex justify-center">
            <p className="text-base md:text-lg text-blue font-bold text-center w-full">
              Tổng tiền: <span className="text-lg md:text-xl text-blue font-bold">{typeof orderItem.totalCents === "number" ? `${(orderItem.totalCents/100).toLocaleString()}₫` : orderItem.totalCents || "-"}</span>
            </p>
          </div>

          <div className="flex gap-5 items-center">
            <OrderActions
              toggleDetails={() => setShowQuickView(true)}
              toggleEdit={toggleEdit}
            />
          </div>
        </div>
      )}

      {smallView && (
        <div className="block md:hidden">
          <div className="py-5 px-4 mb-4 rounded-xl border shadow bg-white">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold text-gray-7">#{(orderItem.orderId || orderItem.id || "--------").slice(-8)}</span>
              {orderItem.status === "CANCELLED" && (
                <span className="inline-block px-2 py-0.5 rounded bg-red-light-5 text-red-dark text-xs font-semibold ml-2">Đã hủy</span>
              )}
              {orderItem.status === "PENDING" && (
                <span className="inline-block px-2 py-0.5 rounded bg-yellow-light text-black text-xs font-semibold ml-2">Chờ xác nhận</span>
              )}
              {orderItem.status === "PROCESSING" && (
                <span className="inline-block px-2 py-0.5 rounded bg-blue-light text-white text-xs font-semibold ml-2">Đang xử lý</span>
              )}
              {orderItem.status === "SHIPPED" && (
                <span className="inline-block px-2 py-0.5 rounded bg-purple-light text-black text-xs font-semibold ml-2">Đang giao</span>
              )}
              {orderItem.status === "COMPLETED" && (
                <span className="inline-block px-2 py-0.5 rounded bg-green-light text-black text-xs font-semibold ml-2">Đã hoàn thành</span>
              )}
            </div>
            <div className="mb-1">
              <span className="font-bold">Ngày đặt:</span> <span className="text-gray-6">{orderItem.createdAt}</span>
            </div>
            <div className="mb-1">
              <span className="font-bold">Trạng thái:</span> <span className={`font-semibold px-2 py-1 rounded ${
                orderItem.status === "PENDING"
                  ? "bg-yellow-light text-black"
                  : orderItem.status === "PROCESSING"
                  ? "bg-blue-light text-white"
                  : orderItem.status === "SHIPPED"
                  ? "bg-purple-light text-black"
                  : orderItem.status === "COMPLETED"
                  ? "bg-green-light text-black"
                  : orderItem.status === "CANCELLED"
                  ? "bg-red-light-5 text-red-dark"
                  : "bg-gray-3 text-gray-6"
              }`}>
                {orderItem.status === "PENDING" && "⏳"}
                {orderItem.status === "PROCESSING" && "🔄"}
                {orderItem.status === "SHIPPED" && "🚚"}
                {orderItem.status === "COMPLETED" && "✔️"}
                {orderItem.status === "CANCELLED" && "❌"}
                {orderItem.status}
              </span>
            </div>
            <div className="mb-1 flex flex-col gap-1">
              <span className="font-bold">Tiêu đề:</span> <span className="text-dark">{orderItem.title}</span>
              {/* Hiển thị lý do hủy đơn hàng nếu có */}
              {orderItem.status === "CANCELLED" && orderItem.cancelReason && (
                <div className="mt-1 px-3 py-2 rounded bg-red-light-6 border border-red-light-4 flex items-center">
                  <span className="font-semibold text-red-dark mr-2">Lý do hủy:</span>
                  <span className="text-red-500">{orderItem.cancelReason}</span>
                </div>
              )}
            </div>
            <div className="mb-1 w-full flex justify-center">
              <span className="font-bold text-base md:text-lg">Tổng tiền:</span> <span className="text-blue font-bold text-lg md:text-xl">{typeof orderItem.totalCents === "number" ? `${(orderItem.totalCents/100).toLocaleString()}₫` : orderItem.totalCents || "-"}</span>
            </div>
            <div className="mt-3 flex items-center">
              <OrderActions
                toggleDetails={toggleDetails}
                toggleEdit={toggleEdit}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SingleOrder;
