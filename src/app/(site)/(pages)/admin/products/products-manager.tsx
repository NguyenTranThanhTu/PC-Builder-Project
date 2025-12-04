"use client";
import { useCallback, useEffect, useState } from "react";
import Tooltip from "@/components/Common/Tooltip";
import { formatVnd } from "@/lib/formatVnd";
import Link from "next/link";

type Category = { id: string; name: string; slug: string };
type ProductItem = {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  stock: number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  featured: boolean;
  updatedAt: string;
  category?: { id: string; name: string; slug: string } | null;
};
type Pagination = { page: number; pageSize: number; total: number; pageCount: number };

export default function ProductsManager() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ProductItem[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  // Filters
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [featured, setFeatured] = useState<boolean | "">("");
  const [page, setPage] = useState(1);

  // Stats
  const stats = {
    total: pagination?.total || 0,
    published: items.filter(p => p.status === 'PUBLISHED').length,
    draft: items.filter(p => p.status === 'DRAFT').length,
    outOfStock: items.filter(p => p.stock === 0).length,
  };

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch {}
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      if (q.trim()) params.set("q", q.trim());
      if (status) params.set("status", status);
      if (categoryId) params.set("categoryId", categoryId);
      if (featured !== "") params.set("featured", String(featured));
      const res = await fetch(`/api/admin/products?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed fetch");
      setItems(data.items || []);
      setPagination(data.pagination || null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [q, status, categoryId, featured, page]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);
  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Actions
  const toggleArchive = async (p: ProductItem) => {
    if (p.status === "ARCHIVED") return;
    if (!confirm(`Lưu trữ sản phẩm '${p.name}'?`)) return;
    try {
      const res = await fetch(`/api/admin/products/${p.id}`, { method: "PATCH", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ status: "ARCHIVED", updatedAt: p.updatedAt }) });
      if (res.status === 409) { alert("Xung đột cập nhật, vui lòng refresh."); return; }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lưu trữ thất bại");
      fetchProducts();
    } catch (e: any) { alert(e.message); }
  };

  const togglePublish = async (p: ProductItem) => {
    const nextStatus = p.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      const res = await fetch(`/api/admin/products/${p.id}`, { method: "PATCH", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ status: nextStatus, updatedAt: p.updatedAt }) });
      if (res.status === 409) { alert("Xung đột cập nhật, vui lòng refresh."); return; }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Cập nhật trạng thái thất bại");
      fetchProducts();
    } catch (e: any) { alert(e.message); }
  };

  const resetFilters = () => {
    setQ(""); setStatus(""); setCategoryId(""); setFeatured(""); setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-dark">Quản lý sản phẩm</h2>
          <p className="text-custom-sm text-dark-5 mt-1">Quản lý toàn bộ sản phẩm trong hệ thống</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchProducts} 
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-3 bg-white text-dark text-sm font-medium hover:bg-gray-1 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Làm mới
          </button>
          <Link 
            href="/admin/products/new" 
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue text-white text-sm font-medium hover:bg-blue-dark transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Thêm sản phẩm
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-3 p-5 hover:shadow-2 transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-lg bg-blue-light-5 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-blue">{stats.total}</span>
          </div>
          <h3 className="text-custom-sm font-medium text-dark-5">Tổng sản phẩm</h3>
        </div>

        <div className="bg-white rounded-xl border border-gray-3 p-5 hover:shadow-2 transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-lg bg-green-light-6 flex items-center justify-center">
              <svg className="w-6 h-6 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-green">{stats.published}</span>
          </div>
          <h3 className="text-custom-sm font-medium text-dark-5">Đang hiển thị</h3>
        </div>

        <div className="bg-white rounded-xl border border-gray-3 p-5 hover:shadow-2 transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-lg bg-yellow-light-2 flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-yellow-dark">{stats.draft}</span>
          </div>
          <h3 className="text-custom-sm font-medium text-dark-5">Bản nháp</h3>
        </div>

        <div className="bg-white rounded-xl border border-gray-3 p-5 hover:shadow-2 transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-lg bg-red-light-6 flex items-center justify-center">
              <svg className="w-6 h-6 text-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-red">{stats.outOfStock}</span>
          </div>
          <h3 className="text-custom-sm font-medium text-dark-5">Hết hàng</h3>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-3 p-5">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-dark-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <h3 className="text-base font-semibold text-dark">Bộ lọc</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-2">
            <input 
              value={q} 
              onChange={e=>{setQ(e.target.value); setPage(1);}} 
              placeholder="Tìm kiếm theo tên sản phẩm..." 
              className="w-full border border-gray-3 rounded-lg px-4 py-2.5 text-sm focus:border-blue focus:ring-2 focus:ring-blue/20 outline-none transition-all"
            />
          </div>
          <select 
            value={status} 
            onChange={e=>{setStatus(e.target.value); setPage(1);}} 
            className="w-full border border-gray-3 rounded-lg px-4 py-2.5 text-sm focus:border-blue focus:ring-2 focus:ring-blue/20 outline-none transition-all"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="DRAFT">Bản nháp</option>
            <option value="PUBLISHED">Đang hiển thị</option>
            <option value="ARCHIVED">Đã lưu trữ</option>
          </select>
          <select 
            value={categoryId} 
            onChange={e=>{setCategoryId(e.target.value); setPage(1);}} 
            className="w-full border border-gray-3 rounded-lg px-4 py-2.5 text-sm focus:border-blue focus:ring-2 focus:ring-blue/20 outline-none transition-all"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select 
            value={featured === "" ? "" : (featured ? "1" : "0")} 
            onChange={e=>{const v=e.target.value; setFeatured(v===""?"":v==="1"?true:false); setPage(1);}} 
            className="w-full border border-gray-3 rounded-lg px-4 py-2.5 text-sm focus:border-blue focus:ring-2 focus:ring-blue/20 outline-none transition-all"
          >
            <option value="">Trang chủ</option>
            <option value="1">Có</option>
            <option value="0">Không</option>
          </select>
        </div>
        <div className="flex gap-2 mt-4">
          <button 
            onClick={fetchProducts} 
            className="px-5 py-2.5 rounded-lg bg-blue text-white text-sm font-medium hover:bg-blue-dark transition-colors"
          >
            Áp dụng bộ lọc
          </button>
          <button 
            onClick={resetFilters} 
            className="px-5 py-2.5 rounded-lg border border-gray-3 bg-white text-dark text-sm font-medium hover:bg-gray-1 transition-colors"
          >
            Xóa bộ lọc
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-light-6 border border-red-light-4 rounded-lg p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-red flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-red mb-1">Có lỗi xảy ra</h4>
            <p className="text-sm text-red-dark">{error}</p>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-gray-3 overflow-hidden">
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-12 h-12 border-4 border-blue-light-4 border-t-blue rounded-full animate-spin mb-4"></div>
            <p className="text-sm text-dark-5">Đang tải dữ liệu...</p>
          </div>
        )}
        
        {!loading && items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-gray-2 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-dark-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-base font-medium text-dark mb-1">Không có sản phẩm nào</p>
            <p className="text-sm text-dark-5">Hãy thêm sản phẩm đầu tiên của bạn</p>
          </div>
        )}
        
        {!loading && items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-3">
              <thead className="bg-gray-1">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-dark uppercase tracking-wider">Sản phẩm</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-dark uppercase tracking-wider">Danh mục</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-dark uppercase tracking-wider">Giá bán</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-dark uppercase tracking-wider">Tồn kho</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-dark uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-dark uppercase tracking-wider">Trang chủ</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-dark uppercase tracking-wider">Cập nhật</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-dark uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-3">
                {items.map((p) => {
                  const isOutOfStock = p.stock === 0;
                  return (
                    <tr key={p.id} className="hover:bg-gray-1 transition-colors">
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <Link href={`/admin/products/${p.id}/edit`} className="font-semibold text-dark text-sm mb-1 truncate hover:text-blue transition-colors block">
                            {p.name}
                          </Link>
                          <div className="text-xs text-dark-5 truncate font-mono">/{p.slug}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-light-5 text-blue text-xs font-medium">
                          {p.category?.name || "Chưa phân loại"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-semibold text-dark">{formatVnd(p.priceCents / 100)}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-2">
                          <span className={`text-sm font-semibold ${isOutOfStock ? 'text-red' : 'text-dark'}`}>
                            {p.stock}
                          </span>
                          {isOutOfStock && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-red-light-6 text-red text-xs font-medium">
                              Hết hàng
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-1">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            p.status === 'PUBLISHED' 
                              ? 'bg-green-light-6 text-green' 
                              : p.status === 'DRAFT' 
                              ? 'bg-yellow-light-2 text-yellow-dark' 
                              : 'bg-gray-2 text-dark-5'
                          }`}>
                            {p.status === 'DRAFT' ? "Nháp" : p.status === 'PUBLISHED' ? "Hiển thị" : "Lưu trữ"}
                          </span>
                          <Tooltip
                            content={
                              p.status === 'PUBLISHED'
                                ? 'Hiển thị: Sản phẩm đang công bố cho khách hàng.'
                                : p.status === 'DRAFT'
                                ? 'Nháp: Chỉ nội bộ admin, chưa hiển thị.'
                                : 'Lưu trữ: Ẩn khỏi danh sách & tìm kiếm, giữ lại dữ liệu.'
                            }
                            side="top"
                          >
                            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-dark-5 text-[10px] font-bold text-white cursor-help">i</span>
                          </Tooltip>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {p.featured ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-yellow-light-2 text-yellow-dark text-xs font-medium">
                            ⭐ Nổi bật
                          </span>
                        ) : (
                          <span className="text-dark-5 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-dark-5">
                          {new Date(p.updatedAt).toLocaleDateString("vi-VN", {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Link 
                            href={`/admin/products/${p.id}/edit`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-light-5 text-blue text-xs font-medium hover:bg-blue-light-4 transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Sửa
                          </Link>
                          {p.status !== 'ARCHIVED' && (
                            <button 
                              onClick={() => toggleArchive(p)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-light-6 text-red text-xs font-medium hover:bg-red-light-5 transition-colors"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                              </svg>
                              Lưu trữ
                            </button>
                          )}
                          <button 
                            onClick={() => togglePublish(p)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                              p.status === 'PUBLISHED'
                                ? 'bg-yellow-light-2 text-yellow-dark hover:bg-yellow-light'
                                : 'bg-green-light-6 text-green hover:bg-green-light-5'
                            }`}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={p.status === 'PUBLISHED' ? "M15 19l-7-7 7-7" : "M5 13l4 4L19 7"} />
                            </svg>
                            {p.status === 'PUBLISHED' ? "Đưa về Nháp" : "Hiển thị"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pageCount > 1 && (
        <div className="bg-white rounded-xl border border-gray-3 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-dark-5">
              Hiển thị trang <span className="font-semibold text-dark">{pagination.page}</span> trong tổng số{' '}
              <span className="font-semibold text-dark">{pagination.pageCount}</span> trang
              <span className="mx-2">•</span>
              <span className="font-semibold text-dark">{pagination.total}</span> sản phẩm
            </div>
            <div className="flex items-center gap-2">
              <button 
                disabled={page <= 1} 
                onClick={() => setPage(p => p - 1)} 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-3 bg-white text-dark text-sm font-medium hover:bg-gray-1 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Trang trước
              </button>
              <div className="px-4 py-2 text-sm font-semibold text-dark">
                {page}
              </div>
              <button 
                disabled={page >= pagination.pageCount} 
                onClick={() => setPage(p => p + 1)} 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-3 bg-white text-dark text-sm font-medium hover:bg-gray-1 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Trang sau
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
