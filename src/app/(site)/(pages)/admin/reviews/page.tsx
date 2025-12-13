"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatVnd } from "@/lib/formatVnd";

type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

interface Review {
  id: string;
  rating: number;
  content: string;
  images: string[];
  status: ReviewStatus;
  adminReply: string | null;
  adminReplyAt: Date | null;
  rejectionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  } | null;
  product: {
    id: string;
    name: string;
    slug: string;
    imageUrl: string | null;
  };
}

export default function ReviewManagementPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | ReviewStatus>("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [filter, page]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/reviews?status=${filter}&page=${page}&limit=20`
      );
      const data = await res.json();
      setReviews(data.reviews);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (
    reviewId: string,
    action: string,
    payload?: any
  ) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...payload }),
      });

      if (res.ok) {
        fetchReviews();
        setSelectedReview(null);
        setReplyText("");
      } else {
        alert("Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Error performing action:", error);
      alert("Có lỗi xảy ra");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Bạn có chắc muốn xóa vĩnh viễn đánh giá này?")) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchReviews();
      } else {
        alert("Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Có lỗi xảy ra");
    } finally {
      setActionLoading(false);
    }
  };

  const StatusBadge = ({ status }: { status: ReviewStatus }) => {
    const colors = {
      PENDING: "bg-yellow-light-5 text-yellow-dark border border-yellow-light-3",
      APPROVED: "bg-green-light-6 text-green-dark border border-green-light-4",
      REJECTED: "bg-red-light-6 text-red-dark border border-red-light-4",
    };
    const labels = {
      PENDING: "⏳ Chờ duyệt",
      APPROVED: "✓ Đã duyệt",
      REJECTED: "✗ Từ chối",
    };
    return (
      <span
        className={`px-3 py-1 rounded-lg text-xs font-semibold ${colors[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-1 p-6">
      {/* Header */}
      <div className="mb-8 border-b border-gray-3 pb-4">
        <h1 className="text-2xl font-bold text-dark mb-2">⭐ Quản lý Đánh giá</h1>
        <p className="text-dark-5 text-sm">
          Kiểm duyệt, trả lời và quản lý đánh giá sản phẩm
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="flex gap-3">
          {["ALL", "PENDING", "APPROVED", "REJECTED"].map((status) => (
            <button
              key={status}
              onClick={() => {
                setFilter(status as any);
                setPage(1);
              }}
              className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                filter === status
                  ? "bg-blue text-white shadow-md"
                  : "bg-gray-1 text-dark-2 hover:bg-gray-2 border border-gray-3"
              }`}
            >
              {status === "ALL"
                ? "Tất cả"
                : status === "PENDING"
                ? "⏳ Chờ duyệt"
                : status === "APPROVED"
                ? "✓ Đã duyệt"
                : "✗ Từ chối"}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-16">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-blue border-r-transparent"></div>
          <p className="mt-4 text-dark-5 font-medium">Đang tải đánh giá...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-gray-1 rounded-xl p-16 text-center border-2 border-dashed border-gray-3">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-dark-2 font-semibold text-lg">Không có đánh giá nào</p>
          <p className="text-dark-5 text-sm mt-2">Chưa có đánh giá {filter !== "ALL" ? "trong danh mục này" : ""}</p>
        </div>
      ) : (
        <div className="space-y-5">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl border-2 border-gray-2 p-6 hover:border-blue transition-colors duration-200 hover:shadow-lg">
              <div className="flex gap-5">
                {/* Product Image */}
                <Link href={`/shop/${review.product.slug}`} target="_blank" className="flex-shrink-0 group">
                  <div className="relative overflow-hidden rounded-lg border-2 border-gray-3 group-hover:border-blue transition-colors">
                    <Image
                      src={review.product.imageUrl || "/images/placeholder.png"}
                      alt={review.product.name}
                      width={90}
                      height={90}
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                </Link>

                <div className="flex-1">
                  {/* Product Info */}
                  <Link
                    href={`/shop/${review.product.slug}`}
                    target="_blank"
                    className="text-lg font-bold text-dark hover:text-blue transition-colors inline-block mb-2"
                  >
                    {review.product.name}
                  </Link>

                  {/* User Info */}
                  <div className="flex items-center gap-3 mb-3 text-sm">
                    {review.user?.image && (
                      <Image
                        src={review.user.image}
                        alt={review.user.name || "User"}
                        width={28}
                        height={28}
                        className="rounded-full border-2 border-gray-3"
                      />
                    )}
                    <span className="font-semibold text-dark">
                      {review.user?.name || "Khách"}
                    </span>
                    <span className="text-gray-4">•</span>
                    <span className="text-dark-5">
                      {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                    <StatusBadge status={review.status} />
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg
                        key={i}
                        className={`w-5 h-5 ${
                          i < review.rating
                            ? "text-yellow fill-current"
                            : "text-gray-3"
                        }`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  {/* Review Content */}
                  <p className="text-dark-2 mb-4 leading-relaxed bg-gray-1 p-4 rounded-lg border border-gray-3">{review.content}</p>

                  {/* Review Images */}
                  {review.images.length > 0 && (
                    <div className="flex gap-3 mb-4 flex-wrap">
                      {review.images.map((img, idx) => (
                        <div key={idx} className="w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-3 hover:border-blue transition-colors">
                          <Image
                            src={img}
                            alt="Review"
                            width={96}
                            height={96}
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Admin Reply */}
                  {review.adminReply && (
                    <div className="mb-4 bg-blue-light-6 border-l-4 border-blue p-4 rounded-lg">
                      <p className="text-sm font-bold text-blue mb-2 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                        </svg>
                        💬 Phản hồi từ Shop
                      </p>
                      <p className="text-dark-2 leading-relaxed">{review.adminReply}</p>
                      <p className="text-xs text-dark-5 mt-2">
                        {new Date(review.adminReplyAt!).toLocaleString("vi-VN")}
                      </p>
                    </div>
                  )}

                  {/* Rejection Reason */}
                  {review.status === "REJECTED" && review.rejectionReason && (
                    <div className="mb-4 bg-red-light-6 border-l-4 border-red p-4 rounded-lg">
                      <p className="text-sm font-bold text-red mb-2 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        ❌ Lý do từ chối
                      </p>
                      <p className="text-dark-2">{review.rejectionReason}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 flex-wrap">
                    {review.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => handleAction(review.id, "approve")}
                          disabled={actionLoading}
                          className="px-5 py-2.5 bg-green text-white rounded-lg hover:bg-green-dark disabled:opacity-50 transition-all duration-200 font-medium shadow-md hover:shadow-lg flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Duyệt
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt("Lý do từ chối (không bắt buộc):");
                            handleAction(review.id, "reject", { rejectionReason: reason });
                          }}
                          disabled={actionLoading}
                          className="px-5 py-2.5 bg-red text-white rounded-lg hover:bg-red-dark disabled:opacity-50 transition-all duration-200 font-medium shadow-md hover:shadow-lg flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          Từ chối
                        </button>
                      </>
                    )}

                    {review.status === "APPROVED" && (
                      <button
                        onClick={() => handleAction(review.id, "reject")}
                        disabled={actionLoading}
                        className="px-5 py-2.5 bg-yellow text-white rounded-lg hover:bg-yellow-dark disabled:opacity-50 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                      >
                        Chuyển sang Từ chối
                      </button>
                    )}

                    {review.status === "REJECTED" && (
                      <button
                        onClick={() => handleAction(review.id, "approve")}
                        disabled={actionLoading}
                        className="px-5 py-2.5 bg-green text-white rounded-lg hover:bg-green-dark disabled:opacity-50 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                      >
                        Duyệt lại
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setSelectedReview(review);
                        setReplyText(review.adminReply || "");
                      }}
                      disabled={actionLoading}
                      className="px-5 py-2.5 bg-blue text-white rounded-lg hover:bg-blue-dark disabled:opacity-50 transition-all duration-200 font-medium shadow-md hover:shadow-lg flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                        <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                      </svg>
                      {review.adminReply ? "Sửa phản hồi" : "Trả lời"}
                    </button>

                    {review.adminReply && (
                      <button
                        onClick={() => handleAction(review.id, "delete-reply")}
                        disabled={actionLoading}
                        className="px-5 py-2.5 bg-gray-6 text-white rounded-lg hover:bg-gray-7 disabled:opacity-50 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                      >
                        Xóa phản hồi
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(review.id)}
                      disabled={actionLoading}
                      className="px-5 py-2.5 bg-red-dark text-white rounded-lg hover:bg-red-dark-2 disabled:opacity-50 transition-all duration-200 font-medium shadow-md hover:shadow-lg flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Xóa vĩnh viễn
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-3 mt-8 items-center">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-5 py-2.5 bg-white border-2 border-gray-3 rounded-lg hover:bg-gray-1 hover:border-blue disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 font-medium text-dark-2 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Trước
          </button>
          <div className="px-5 py-2.5 bg-blue text-white rounded-lg font-semibold shadow-md">
            Trang {page} / {totalPages}
          </div>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-5 py-2.5 bg-white border-2 border-gray-3 rounded-lg hover:bg-gray-1 hover:border-blue disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 font-medium text-dark-2 flex items-center gap-2"
          >
            Sau
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {/* Reply Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl transform transition-all">
            <div className="flex items-center justify-between mb-6 border-b border-gray-3 pb-4">
              <h3 className="text-2xl font-bold text-dark flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-light-5 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                    <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                  </svg>
                </div>
                Phản hồi đánh giá
              </h3>
              <button
                onClick={() => {
                  setSelectedReview(null);
                  setReplyText("");
                }}
                className="text-gray-5 hover:text-dark transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <div className="mb-5 p-5 bg-gray-1 rounded-xl border-2 border-gray-3">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-blue text-white flex items-center justify-center font-bold text-sm">
                  {selectedReview.user?.name?.charAt(0).toUpperCase() || "K"}
                </div>
                <div>
                  <p className="font-bold text-dark">
                    {selectedReview.user?.name || "Khách"}
                  </p>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${i < selectedReview.rating ? "text-yellow fill-current" : "text-gray-3"}`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-dark-2 leading-relaxed">{selectedReview.content}</p>
            </div>

            <label className="block mb-2 text-sm font-semibold text-dark">
              Phản hồi của bạn:
            </label>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Nhập phản hồi của bạn..."
              className="w-full border-2 border-gray-3 rounded-xl p-4 h-36 mb-5 focus:border-blue focus:outline-none transition-colors resize-none text-dark-2"
            />

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setSelectedReview(null);
                  setReplyText("");
                }}
                className="px-6 py-3 bg-gray-2 text-dark-2 rounded-lg hover:bg-gray-3 transition-all duration-200 font-medium"
              >
                Hủy
              </button>
              <button
                onClick={() =>
                  handleAction(selectedReview.id, "reply", {
                    adminReply: replyText,
                  })
                }
                disabled={!replyText.trim() || actionLoading}
                className="px-6 py-3 bg-blue text-white rounded-lg hover:bg-blue-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
                Gửi phản hồi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
