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
    <div className="border rounded-lg p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3">
        <h2 className="text-lg font-semibold">Danh sách sản phẩm</h2>
        <div className="flex gap-2">
          <Link href="/admin/products/new" aria-label="Thêm sản phẩm mới" className="px-3 py-1.5 rounded-md bg-blue text-white text-sm">+ Thêm sản phẩm</Link>
          <button onClick={fetchProducts} className="inline-flex items-center px-3 py-1.5 rounded-md border hover:bg-gray-50">Làm mới</button>
        </div>
      </div>
      <div className="grid md:grid-cols-5 gap-3 mb-4">
        <input value={q} onChange={e=>{setQ(e.target.value); setPage(1);}} placeholder="Tìm theo tên..." className="w-full border rounded px-3 py-2 text-sm md:col-span-2" />
        <select value={status} onChange={e=>{setStatus(e.target.value); setPage(1);}} className="w-full border rounded px-3 py-2 text-sm" title="Lọc theo trạng thái vòng đời sản phẩm">
          <option value="">Trạng thái</option>
          <option value="DRAFT">Nháp</option>
          <option value="PUBLISHED">Hiển thị</option>
          <option value="ARCHIVED">Lưu trữ</option>
        </select>
        <select value={categoryId} onChange={e=>{setCategoryId(e.target.value); setPage(1);}} className="w-full border rounded px-3 py-2 text-sm">
          <option value="">Danh mục</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={featured === "" ? "" : (featured ? "1" : "0")} onChange={e=>{const v=e.target.value; setFeatured(v===""?"":v==="1"?true:false); setPage(1);}} className="w-full border rounded px-3 py-2 text-sm">
          <option value="">Trang chủ</option>
          <option value="1">Có</option>
          <option value="0">Không</option>
        </select>
        <div className="md:col-span-5 flex flex-wrap gap-2 items-center">
          <button onClick={fetchProducts} className="px-4 py-2 rounded bg-blue text-white text-sm">Áp dụng</button>
          <button onClick={resetFilters} className="px-4 py-2 rounded bg-gray-200 text-sm">Xóa lọc</button>
        </div>
      </div>

      {error && <div className="mb-3 p-2 rounded bg-red-50 text-red-600 text-sm">{error}</div>}

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="py-2 px-3">Sản phẩm</th>
              <th className="py-2 px-3">Danh mục</th>
              <th className="py-2 px-3">Giá</th>
              <th className="py-2 px-3">Tồn</th>
              <th className="py-2 px-3">Hết hàng</th>
              <th className="py-2 px-3">Trạng thái</th>
              <th className="py-2 px-3">Trang chủ</th>
              <th className="py-2 px-3">Cập nhật</th>
              <th className="py-2 px-3">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={9} className="px-3 py-6 text-center text-xs">Đang tải...</td></tr>
            )}
            {!loading && items.length === 0 && (
              <tr><td colSpan={9} className="px-3 py-6 text-center text-xs">Không có sản phẩm</td></tr>
            )}
            {!loading && items.map(p => (
              <tr key={p.id} className="border-b">
                <td className="py-2 px-3">
                  <div className="font-medium"><Link href={`/admin/products/${p.id}/edit`} className="text-blue hover:underline">{p.name}</Link></div>
                  <div className="text-gray-500 text-xs">/{p.slug}</div>
                </td>
                <td className="py-2 px-3">{p.category?.name || '-'}</td>
                <td className="py-2 px-3">{formatVnd(p.priceCents / 100)}</td>
                <td className="py-2 px-3">{p.stock}</td>
                <td className="py-2 px-3">
                  {p.stock === 0 ? (
                    <span className="inline-block rounded bg-red-100 px-2 py-0.5 text-red-700">Hết hàng</span>
                  ) : (
                    <span className="inline-block rounded bg-green-50 px-2 py-0.5 text-green-700">Còn</span>
                  )}
                </td>
                <td className="py-2 px-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-semibold ${p.status==='PUBLISHED'?'bg-green-100 text-green-700':p.status==='DRAFT'?'bg-yellow-100 text-yellow-700':'bg-gray-300 text-gray-700'}`}>
                    {p.status==='DRAFT'?"Nháp":p.status==='PUBLISHED'?"Hiển thị":"Lưu trữ"}
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
                      <span className="ml-1 inline-flex h-3 w-3 items-center justify-center rounded bg-gray-700 text-[9px] font-bold text-white cursor-help">i</span>
                    </Tooltip>
                  </span>
                </td>
                <td className="py-2 px-3">{p.featured?"✔":""}</td>
                <td className="py-2 px-3 text-xs">{new Date(p.updatedAt).toLocaleString('vi-VN')}</td>
                <td className="py-2 px-3 space-x-2">
                  <Link href={`/admin/products/${p.id}/edit`} className="text-xs px-2 py-1 rounded bg-purple-600 text-white">Sửa</Link>
                  {p.status !== 'ARCHIVED' && <button onClick={()=>toggleArchive(p)} className="text-xs px-2 py-1 rounded bg-gray-300 text-gray-800 hover:bg-gray-400">Lưu trữ</button>}
                  <button onClick={()=>togglePublish(p)} className="text-xs px-2 py-1 rounded bg-blue text-white">{p.status==='PUBLISHED'?"Đưa về Nháp":"Hiển thị"}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && pagination.pageCount > 1 && (
        <div className="mt-3 flex items-center justify-between text-xs">
          <div>Trang {pagination.page}/{pagination.pageCount} • Tổng {pagination.total}</div>
          <div className="flex gap-2">
            <button disabled={page<=1} onClick={()=>setPage(p=>p-1)} className="px-3 py-1 rounded border disabled:opacity-40">Trước</button>
            <button disabled={page>=pagination.pageCount} onClick={()=>setPage(p=>p+1)} className="px-3 py-1 rounded border disabled:opacity-40">Sau</button>
          </div>
        </div>
      )}
    </div>
  );
}
