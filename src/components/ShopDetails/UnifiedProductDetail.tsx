"use client";
import { useState, useEffect } from "react";
import ProductSpecsTable from "./ProductSpecsTable";
import ReviewSection from "./ReviewSection";

interface UnifiedProductDetailProps {
  product: any;
  specRows: any[];
  reviews: any[];
  reviewStats: any;
  currentUserId?: string;
}

export default function UnifiedProductDetail({ 
  product, 
  specRows, 
  reviews,
  reviewStats,
  currentUserId
}: UnifiedProductDetailProps) {
  const [activeTab, setActiveTab] = useState<"description" | "specs" | "reviews">("description");

  // Auto-switch to reviews tab if hash is #reviews
  useEffect(() => {
    if (window.location.hash === "#reviews") {
      setActiveTab("reviews");
      // Smooth scroll to the section
      setTimeout(() => {
        const element = document.getElementById("product-tabs");
        element?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, []);

  const tabs = [
    { id: "description", label: "Mô tả sản phẩm", icon: "📄" },
    { id: "specs", label: "Thông số kỹ thuật", icon: "⚙️", count: specRows.length },
    { id: "reviews", label: "Đánh giá", icon: "⭐", count: reviewStats.totalReviews },
  ];

  return (
    <div className="mt-12" id="product-tabs">
      {/* Tab Navigation */}
      <div className="border-b border-gray-3 mb-8">
        <div className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative px-4 py-3 font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-blue border-b-2 border-blue"
                  : "text-dark-5 hover:text-dark"
              }`}
            >
              <span className="flex items-center gap-2">
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id 
                      ? "bg-blue text-white" 
                      : "bg-gray-2 text-dark-5"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === "description" && (
          <div className="prose max-w-none">
            <div className="bg-white rounded-xl border border-gray-3 p-6">
              <h3 className="text-xl font-semibold text-dark mb-4">Mô tả chi tiết</h3>
              <div className="text-dark-2 leading-relaxed whitespace-pre-wrap">
                {product.description || "Chưa có mô tả chi tiết cho sản phẩm này."}
              </div>
            </div>
          </div>
        )}

        {activeTab === "specs" && (
          <div>
            {specRows.length > 0 ? (
              <div className="bg-white rounded-xl border border-gray-3 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-1">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-dark border-b border-gray-3">
                        Thông số
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-dark border-b border-gray-3">
                        Giá trị
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {specRows.map((row: any, idx: number) => (
                      <tr key={idx} className="border-b border-gray-3 last:border-0 hover:bg-gray-1 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-dark-2">{row.label}</td>
                        <td className="px-6 py-4 text-sm text-dark">{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-1 rounded-xl">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-dark-5 font-medium">Chưa có thông số kỹ thuật</p>
                <p className="text-sm text-dark-5 mt-2">Thông tin chi tiết sẽ được cập nhật sau</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "reviews" && (
          <ReviewSection
            productId={product.id}
            stats={reviewStats}
            reviews={reviews}
            currentUserId={currentUserId}
          />
        )}
      </div>
    </div>
  );
}
