"use client";
import { useState } from "react";
import Image from "next/image";

interface ReviewFormModalProps {
  productId: string;
  productName: string;
  productImage?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReviewFormModal({
  productId,
  productName,
  productImage,
  onClose,
  onSuccess,
}: ReviewFormModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleStarClick = (star: number) => {
    setRating(star);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 5) {
      setError("Tối đa 5 ảnh");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Create FormData
        const formData = new FormData();
        formData.append("file", file);

        // Upload to API
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Lỗi upload ảnh");
        }

        const data = await response.json();
        uploadedUrls.push(data.url);
      }

      setImages((prev) => [...prev, ...uploadedUrls]);
    } catch (err: any) {
      setError(err.message || "Lỗi upload ảnh");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError("Vui lòng chọn số sao");
      return;
    }

    if (content.trim().length < 20) {
      setError("Nội dung tối thiểu 20 ký tự");
      return;
    }

    if (content.trim().length > 1000) {
      setError("Nội dung tối đa 1000 ký tự");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload = {
        productId,
        rating: Number(rating), // Ensure it's a number
        content: content.trim(),
        images: images.filter(img => img.startsWith('http')), // Only send real URLs
      };
      
      console.log("[ReviewForm] Submitting:", payload);

      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Lỗi khi gửi đánh giá");
      }

      // Success
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Lỗi khi gửi đánh giá");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-5">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-3 p-6 flex items-center justify-between">
          <h3 className="text-2xl font-bold text-dark">Đánh giá sản phẩm</h3>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-gray-2 flex items-center justify-center transition-colors"
          >
            <svg className="w-6 h-6 text-gray-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Product Info */}
        <div className="p-6 border-b border-gray-3">
          <div className="flex gap-4">
            <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-3 flex-shrink-0">
              {productImage ? (
                <Image
                  src={productImage}
                  alt={productName}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-2 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-dark mb-1">{productName}</p>
              <p className="text-sm text-gray-6">Bạn đã mua sản phẩm này</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Star Rating */}
          <div>
            <label className="block text-sm font-semibold text-dark mb-3">
              Đánh giá của bạn <span className="text-red">*</span>
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <svg
                    className={`w-12 h-12 ${
                      star <= (hoverRating || rating)
                        ? "text-yellow"
                        : "text-gray-3"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-gray-6 mt-2">
                Bạn đã chọn {rating} sao -{" "}
                {rating === 5 && "Tuyệt vời!"}
                {rating === 4 && "Hài lòng"}
                {rating === 3 && "Bình thường"}
                {rating === 2 && "Không hài lòng"}
                {rating === 1 && "Rất tệ"}
              </p>
            )}
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-semibold text-dark mb-3">
              Nhận xét của bạn <span className="text-red">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này... (tối thiểu 20 ký tự)"
              className="w-full border-2 border-gray-3 rounded-xl px-4 py-3 focus:border-blue focus:outline-none resize-none"
              rows={6}
              maxLength={1000}
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm text-gray-6">
                {content.length}/1000 ký tự
              </p>
              {content.length > 0 && content.length < 20 && (
                <p className="text-sm text-red">Còn {20 - content.length} ký tự nữa</p>
              )}
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-dark mb-3">
              Thêm ảnh (tùy chọn, tối đa 5 ảnh)
            </label>
            
            <div className="flex flex-wrap gap-3">
              {/* Uploaded Images */}
              {images.map((img, idx) => (
                <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-3">
                  <img
                    src={img}
                    alt={`Upload ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red text-white rounded-full flex items-center justify-center hover:bg-red-dark transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}

              {/* Upload Button */}
              {images.length < 5 && (
                <label className="w-24 h-24 border-2 border-dashed border-gray-4 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue hover:bg-blue-light-6 transition-colors">
                  <svg className="w-8 h-8 text-gray-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-xs text-gray-6 mt-1">Thêm ảnh</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              )}
            </div>

            {uploading && (
              <p className="text-sm text-blue mt-2">Đang tải ảnh...</p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-light-5 border-l-4 border-red rounded-lg p-4">
              <p className="text-red-dark font-semibold">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-3 text-gray-7 font-bold rounded-xl hover:bg-gray-2 transition-colors"
              disabled={submitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue text-white font-bold rounded-xl hover:bg-blue-dark transition-colors disabled:bg-gray-4 disabled:cursor-not-allowed"
              disabled={submitting || rating === 0 || content.trim().length < 20}
            >
              {submitting ? "Đang gửi..." : "Gửi đánh giá"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
