"use client";
import { useEffect, useState, useCallback } from "react";
import { expectedValueTypeByKey } from "@/lib/attributeTemplates";
import { ATTRIBUTE_TEMPLATES as attributeTemplates } from "@/lib/attributeTemplates";
import Tooltip from "@/components/Common/Tooltip";
import Image from "next/image";
import Link from "next/link";

type Category = { id: string; name: string; slug: string };
type AttrTemplate = { key: string; label: string; valueType: "STRING" | "NUMBER" };

interface AttrInputState {
  key: string;
  stringValue?: string | null;
  numberValue?: number | null;
}

export default function NewProductPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState<string>("");
  const [stock, setStock] = useState<string>("0");
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED" | "ARCHIVED">("DRAFT");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageBlurData, setImageBlurData] = useState<string | null>(null);
  const [attrTemplates, setAttrTemplates] = useState<AttrTemplate[]>([]);
  const [attributes, setAttributes] = useState<AttrInputState[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("/api/admin/categories");
        if (!res.ok) return;
        const data = await res.json();
        setCategories(data.categories || []);
      } catch {}
    };
    run();
  }, []);

  useEffect(() => {
    const cat = categories.find(c => c.id === categoryId);
    if (!cat) {
      setAttrTemplates([]);
      setAttributes([]);
      return;
    }
    const tmpl = attributeTemplates[cat.slug] || [];
    setAttrTemplates(tmpl);
    setAttributes(
      tmpl.map(t => ({ key: t.key, stringValue: t.valueType === "STRING" ? "" : null, numberValue: t.valueType === "NUMBER" ? 0 : null }))
    );
  }, [categoryId, categories]);

  const onAttrChange = useCallback((key: string, value: string) => {
    setAttributes(prev => prev.map(a => {
      if (a.key !== key) return a;
      const template = attrTemplates.find(t => t.key === key);
      if (!template) return a;
      if (template.valueType === "STRING") {
        return { ...a, stringValue: value };
      } else {
        const num = value === "" ? null : Number(value);
        return { ...a, numberValue: isNaN(num as number) ? null : num };
      }
    }));
  }, [attrTemplates]);

  const handleUpload = async () => {
    if (!imageFile) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", imageFile);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setImageUrl(data.url);
      setImageBlurData(data.blurDataUrl);
      setSuccess("Đã upload ảnh");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  const validateLocal = (): string | null => {
    if (!name.trim()) return "Tên sản phẩm bắt buộc";
    if (!categoryId) return "Cần chọn danh mục";
    const p = Number(price);
    if (isNaN(p) || p < 0) return "Giá không hợp lệ";
    const s = Number(stock);
    if (isNaN(s) || s < 0) return "Tồn kho không hợp lệ";
    for (const a of attributes) {
      const tmpl = attrTemplates.find(t => t.key === a.key);
      if (!tmpl) continue;
      if (tmpl.valueType === "STRING" && (!a.stringValue || a.stringValue === "")) return `Thuộc tính ${a.key} thiếu giá trị`; 
      if (tmpl.valueType === "NUMBER" && (a.numberValue == null || isNaN(a.numberValue))) return `Thuộc tính ${a.key} thiếu số`; 
    }
    return null;
  };

  const handleSave = async () => {
    setError(null); setSuccess(null);
    const err = validateLocal();
    if (err) { setError(err); return; }
    setSaving(true);
    try {
      const body = {
        name: name.trim(),
        priceCents: Math.round(Number(price) * 100),
        stock: Number(stock),
        categoryId,
        featured,
        status,
        description: description || null,
        imageUrl,
        imageBlurData,
        attributes: attributes.map(a => ({ key: a.key, stringValue: a.stringValue ?? null, numberValue: a.numberValue ?? null }))
      };
      const res = await fetch("/api/admin/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Tạo sản phẩm thất bại");
      setSuccess("Tạo sản phẩm thành công");
      setName(""); setPrice(""); setStock("0"); setDescription(""); setAttributes(prev => prev.map(a => ({...a, stringValue: a.stringValue!=null?"":null, numberValue: a.numberValue!=null?0:null })));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-dark">Tạo sản phẩm mới</h1>
        <Link href="/admin/products" className="text-sm text-blue hover:underline">Quay lại danh sách</Link>
      </div>
      <div className="bg-white rounded-xl shadow p-6 space-y-6">
        {error && <div className="text-sm text-red-600">{error}</div>}
        {success && <div className="text-sm text-green-600">{success}</div>}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tên</label>
            <input className="w-full border rounded px-3 py-2 text-sm" value={name} onChange={e=>setName(e.target.value)} placeholder="VD: CPU Intel i5" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Danh mục</label>
            <select className="w-full border rounded px-3 py-2 text-sm" value={categoryId} onChange={e=>setCategoryId(e.target.value)}>
              <option value="">-- Chọn --</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Giá (VND)</label>
            <input className="w-full border rounded px-3 py-2 text-sm" value={price} onChange={e=>setPrice(e.target.value)} placeholder="12990000" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tồn kho</label>
            <input className="w-full border rounded px-3 py-2 text-sm" value={stock} onChange={e=>setStock(e.target.value)} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium">Trạng thái</label>
              <Tooltip
                content={
                  <span>
                    <strong>Nháp:</strong> Chỉ quản trị viên nhìn thấy.<br />
                    <strong>Hiển thị:</strong> Công bố ra storefront cho khách hàng.
                  </span>
                }
                side="top"
              >
                <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-gray-700 text-[10px] font-bold text-white cursor-help">i</span>
              </Tooltip>
            </div>
            <select className="w-full border rounded px-3 py-2 text-sm" value={status} onChange={e=>setStatus(e.target.value as any)}>
              <option value="DRAFT">Nháp</option>
              <option value="PUBLISHED">Hiển thị</option>
            </select>
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input id="featured" type="checkbox" checked={featured} onChange={e=>setFeatured(e.target.checked)} />
            <label htmlFor="featured" className="text-sm">Hiển thị trang chủ</label>
            <Tooltip
              side="top"
              content={<span>Đánh dấu để xuất hiện ở các khối nổi bật (slider / danh sách Trang chủ).</span>}
            >
              <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-gray-700 text-[10px] font-bold text-white cursor-help">i</span>
            </Tooltip>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mô tả</label>
            <textarea className="w-full border rounded px-3 py-2 text-sm" rows={4} value={description} onChange={e=>setDescription(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Ảnh sản phẩm</label>
          <div className="flex items-center gap-4">
            <input type="file" accept="image/*" onChange={e=>{const f=e.target.files?.[0]; setImageFile(f||null); setImagePreview(f?URL.createObjectURL(f):"");}} />
            <button disabled={!imageFile || uploading} onClick={handleUpload} className="px-4 py-2 text-sm rounded bg-blue text-white disabled:opacity-50">{uploading?"Đang upload...":"Upload"}</button>
            {imageUrl && <span className="text-xs text-green-700">Đã lưu: {imageUrl}</span>}
          </div>
          {imagePreview && <div className="mt-3"><Image src={imagePreview} alt="preview" width={160} height={120} className="rounded border" /></div>}
        </div>
        {attrTemplates.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold mb-2">Thuộc tính kỹ thuật</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {attrTemplates.map(t => {
                const st = attributes.find(a => a.key === t.key);
                return (
                  <div key={t.key} className="space-y-1">
                    <label className="block text-xs font-medium">{t.label}</label>
                    {t.valueType === "STRING" ? (
                      <input className="w-full border rounded px-2 py-1 text-xs" value={st?.stringValue || ""} onChange={e=>onAttrChange(t.key, e.target.value)} />
                    ) : (
                      <input className="w-full border rounded px-2 py-1 text-xs" value={st?.numberValue ?? ""} onChange={e=>onAttrChange(t.key, e.target.value)} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <div className="flex justify-end">
          <button onClick={handleSave} disabled={saving} className="px-6 py-2 rounded bg-purple-600 text-white text-sm font-medium disabled:opacity-50">
            {saving?"Đang lưu...":"Tạo sản phẩm"}
          </button>
        </div>
      </div>
    </div>
  );
}
