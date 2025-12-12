"use client";
import { useState } from "react";
import Image from "next/image";

interface Review {
  id: string;
  rating: number;
  content: string;
  createdAt: string;
  userId: string;
  user: {
    name: string;
    image?: string | null;
    vipTier: number;
  };
  verifiedPurchase: boolean;
  helpfulCount: number;
  images?: string[];
  adminReply?: {
    content: string;
    createdAt: string;
  } | null;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

interface ReviewSectionProps {
  productId: string;
  stats: ReviewStats;
  reviews: Review[];
  currentUserId?: string;
}

const StarRating = ({ rating, size = "w-4 h-4" }: { rating: number; size?: string }) => {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`${size} ${star <= rating ? "text-yellow" : "text-gray-300"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

const VIPBadge = ({ tier }: { tier: number }) => {
  const badges = {
    1: { label: "VIP Đồng", color: "bg-orange-100 text-orange-700 border-orange-300" },
    2: { label: "VIP Bạc", color: "bg-gray-100 text-gray-700 border-gray-300" },
    3: { label: "VIP Vàng", color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
  };
  
  const badge = badges[tier as keyof typeof badges];
  if (!badge) return null;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${badge.color}`}>
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      {badge.label}
    </span>
  );
};

export default function ReviewSection({ productId, stats, reviews: initialReviews, currentUserId }: ReviewSectionProps) {
  const [sortBy, setSortBy] = useState<"recent" | "helpful" | "rating">("recent");
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [votedReviews, setVotedReviews] = useState<Set<string>>(new Set());

  const handleHelpfulClick = async (reviewId: string) => {
    if (votedReviews.has(reviewId)) return;

    try {
      const response = await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: "PATCH",
      });

      if (response.ok) {
        const data = await response.json();
        setReviews((prev) =>
          prev.map((r) =>
            r.id === reviewId ? { ...r, helpfulCount: data.helpfulCount } : r
          )
        );
        setVotedReviews((prev) => {
          const newSet = new Set(prev);
          newSet.add(reviewId);
          return newSet;
        });
      }
    } catch (error) {
      console.error("Error voting helpful:", error);
    }
  };

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === "recent") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === "helpful") return b.helpfulCount - a.helpfulCount;
    if (sortBy === "rating") return b.rating - a.rating;
    return 0;
  });

  return (
    <div className="space-y-8">
      {/* Rating Overview */}
      <div className="bg-white rounded-xl border border-gray-3 p-6">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Average Rating */}
          <div className="flex flex-col items-center md:items-start">
            <div className="text-5xl font-bold text-dark mb-2">{stats.averageRating.toFixed(1)}</div>
            <StarRating rating={Math.round(stats.averageRating)} size="w-6 h-6" />
            <p className="text-sm text-dark-5 mt-2">{stats.totalReviews} đánh giá</p>
          </div>

          {/* Distribution */}
          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats.distribution[star as keyof typeof stats.distribution];
              const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
              
              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-dark w-8">{star}★</span>
                  <div className="flex-1 h-2 bg-gray-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-dark-5 w-12 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-dark">
          {stats.totalReviews} đánh giá
        </h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-4 py-2 border border-gray-3 rounded-lg text-sm focus:outline-none focus:border-blue"
        >
          <option value="recent">Mới nhất</option>
          <option value="helpful">Hữu ích nhất</option>
          <option value="rating">Đánh giá cao nhất</option>
        </select>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {sortedReviews.length === 0 ? (
          <div className="text-center py-12 bg-gray-1 rounded-xl">
            <p className="text-dark-5">Chưa có đánh giá nào cho sản phẩm này</p>
            <p className="text-sm text-dark-5 mt-2">Hãy là người đầu tiên đánh giá!</p>
          </div>
        ) : (
          sortedReviews.map((review) => {
            const isCurrentUserReview = currentUserId && review.userId === currentUserId;
            
            return (
              <div 
                key={review.id} 
                id={isCurrentUserReview ? "reviews" : undefined}
                className={`bg-white rounded-xl border p-6 ${
                  isCurrentUserReview 
                    ? "border-blue-500 shadow-lg ring-2 ring-blue-200" 
                    : "border-gray-3"
                }`}
              >
                {/* "Your Review" badge */}
                {isCurrentUserReview && (
                  <div className="mb-3 -mt-2 -mx-2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue text-white rounded-full text-xs font-semibold">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      Đánh giá của bạn
                    </span>
                  </div>
                )}
                
                {/* User Info */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-2 flex-shrink-0">
                  {review.user.image ? (
                    <Image
                      src={review.user.image}
                      alt={review.user.name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue text-white font-semibold">
                      {review.user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-dark">{review.user.name}</span>
                    {review.verifiedPurchase && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-light-6 text-green rounded-full text-xs font-medium">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Đã mua hàng
                      </span>
                    )}
                    {review.user.vipTier > 0 && <VIPBadge tier={review.user.vipTier} />}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <StarRating rating={review.rating} />
                    <span className="text-xs text-dark-5">
                      {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Review Content */}
              <p className="text-dark-2 mb-4 whitespace-pre-wrap">{review.content}</p>

              {/* Review Images */}
              {review.images && review.images.length > 0 && (
                <div className="flex gap-2 mb-4 flex-wrap">
                  {review.images.map((img, idx) => (
                    <div key={idx} className="w-20 h-20 rounded-lg overflow-hidden border border-gray-3">
                      <Image
                        src={img}
                        alt={`Review image ${idx + 1}`}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Helpful Button */}
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => handleHelpfulClick(review.id)}
                  disabled={votedReviews.has(review.id)}
                  className={`inline-flex items-center gap-2 text-sm transition-colors ${
                    votedReviews.has(review.id)
                      ? "text-blue cursor-not-allowed"
                      : "text-dark-5 hover:text-blue"
                  }`}
                >
                  <svg 
                    className="w-4 h-4" 
                    fill={votedReviews.has(review.id) ? "currentColor" : "none"} 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                  {votedReviews.has(review.id) ? "Đã đánh dấu hữu ích" : "Hữu ích"} ({review.helpfulCount})
                </button>
              </div>

              {/* Admin Reply */}
              {review.adminReply && (
                <div className="mt-4 ml-16 bg-blue-light-6 rounded-lg p-4 border-l-4 border-blue">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue text-white rounded text-xs font-semibold">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                      </svg>
                      Phản hồi từ Admin
                    </span>
                    <span className="text-xs text-dark-5">
                      {new Date(review.adminReply.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <p className="text-sm text-dark-2">{review.adminReply.content}</p>
                </div>
              )}
            </div>
          );
        })
        )}
      </div>
    </div>
  );
}
