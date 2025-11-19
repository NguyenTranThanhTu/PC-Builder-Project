"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ATTRIBUTE_TEMPLATES as attributeTemplates } from "@/lib/attributeTemplates";
import Tooltip from "@/components/Common/Tooltip";

type Category = { id: string; name: string; slug: string };
type AttrTemplate = { key: string; label: string; valueType: "STRING" | "NUMBER" };
interface AttrInputState { key: string; stringValue?: string | null; numberValue?: number | null; }

interface ProductPayload {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  priceCents: number;
  stock: number;
  categoryId: string;
  featured: boolean;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  imageUrl: string | null;
  imageBlurData: string | null;
  updatedAt: string; // ISO
  category: { id: string; name: string; slug: string };
  attributes: { attributeType: { key: string; label?: string; valueType: "STRING" | "NUMBER" }; stringValue: string | null; numberValue: number | null; }[];
}

// Relax prop typing to align with Next.js generated PageProps in Next 15 (params may be a Promise internally)
export default function EditProductPage({ params }: any) {
  const productId = params.id;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [product, setProduct] = useState<ProductPayload | null>(null);
  const [categoryId, setCategoryId] = useState<string>("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [price, setPrice] = useState<string>("");
  const [stock, setStock] = useState<string>("0");
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED" | "ARCHIVED">("DRAFT");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageBlurData, setImageBlurData] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [attrTemplates, setAttrTemplates] = useState<AttrTemplate[]>([]);
  const [attributes, setAttributes] = useState<AttrInputState[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null); // concurrency token
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [conflict, setConflict] = useState<{ currentUpdatedAt?: string } | null>(null);
  const [conflictRemote, setConflictRemote] = useState<ProductPayload | null>(null);
  const [diffSelection, setDiffSelection] = useState<Record<string, 'local' | 'remote'>>({});
  const [attributeDiffSelection, setAttributeDiffSelection] = useState<Record<string, 'local' | 'remote'>>({});

  const computeDiff = (remote: ProductPayload) => {
    const fieldKeys: { key: string; local: any; remote: any }[] = [
      { key: 'name', local: name, remote: remote.name },
      { key: 'slug', local: slug, remote: remote.slug },
      { key: 'priceCents', local: Math.round(Number(price) * 100), remote: remote.priceCents },
      { key: 'stock', local: Number(stock), remote: remote.stock },
      { key: 'status', local: status, remote: remote.status },
      { key: 'featured', local: featured, remote: remote.featured },
      { key: 'description', local: description, remote: remote.description },
      { key: 'categoryId', local: categoryId, remote: remote.categoryId },
    ];
    const selection: Record<string, 'local' | 'remote'> = {};
    fieldKeys.forEach(f => { if (f.local !== f.remote) selection[f.key] = 'remote'; });
    setDiffSelection(selection);
    const attrSel: Record<string, 'local' | 'remote'> = {};
    attrTemplates.forEach(t => {
      const remoteAttr = remote.attributes.find(a => a.attributeType.key === t.key);
      const localAttr = attributes.find(a => a.key === t.key);
      const remoteVal = t.valueType === 'STRING' ? remoteAttr?.stringValue : remoteAttr?.numberValue;
      const localVal = t.valueType === 'STRING' ? localAttr?.stringValue : localAttr?.numberValue;
      if (localVal !== remoteVal) attrSel[t.key] = 'remote';
    });
    setAttributeDiffSelection(attrSel);
  };

  useEffect(() => {
    const run = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch("/api/admin/categories"),
          fetch(`/api/admin/products/${productId}`),
        ]);
        if (catRes.ok) {
          const data = await catRes.json();
            setCategories(data.categories || []);
        }
        if (prodRes.ok) {
          const pdata = await prodRes.json();
          const p: ProductPayload = pdata.product;
          setProduct(p);
          setCategoryId(p.categoryId);
          setName(p.name);
          setSlug(p.slug);
          setPrice((p.priceCents / 100).toString());
          setStock(p.stock.toString());
          setFeatured(p.featured);
          setStatus(p.status);
          setDescription(p.description || "");
          setImageUrl(p.imageUrl);
          setImageBlurData(p.imageBlurData);
          setUpdatedAt(p.updatedAt);
        } else {
          setError("Không tìm thấy sản phẩm");
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [productId]);

  useEffect(() => {
    const cat = categories.find(c => c.id === categoryId);
    if (!cat) { setAttrTemplates([]); setAttributes([]); return; }
    const tmpl = attributeTemplates[cat.slug] || [];
    setAttrTemplates(tmpl);
    if (product) {
      const mapped = tmpl.map(t => {
        const found = product.attributes.find(a => a.attributeType.key === t.key);
        return {
          key: t.key,
          stringValue: t.valueType === "STRING" ? (found?.stringValue ?? "") : null,
          numberValue: t.valueType === "NUMBER" ? (found?.numberValue ?? 0) : null,
        } as AttrInputState;
      });
      setAttributes(mapped);
    } else {
      setAttributes(tmpl.map(t => ({ key: t.key, stringValue: t.valueType === "STRING" ? "" : null, numberValue: t.valueType === "NUMBER" ? 0 : null })));
    }
  }, [categoryId, categories, product]);

  const onAttrChange = useCallback((key: string, value: string) => {
    setAttributes(prev => prev.map(a => {
      if (a.key !== key) return a;
      const tmpl = attrTemplates.find(t => t.key === key);
      if (!tmpl) return a;
      if (tmpl.valueType === "STRING") {
        return { ...a, stringValue: value };
      } else {
        const num = value === "" ? null : Number(value);
        return { ...a, numberValue: isNaN(num as number) ? null : num };
      }
    }));
  }, [attrTemplates]);

  const validateLocal = (): string | null => {
    if (!name.trim()) return "Tên sản phẩm bắt buộc";
    if (!categoryId) return "Cần chọn danh mục";
    const p = Number(price); if (isNaN(p) || p < 0) return "Giá không hợp lệ";
    const s = Number(stock); if (isNaN(s) || s < 0) return "Tồn kho không hợp lệ";
    for (const a of attributes) {
      const tmpl = attrTemplates.find(t => t.key === a.key);
      if (!tmpl) continue;
      if (tmpl.valueType === "STRING" && (!a.stringValue || a.stringValue === "")) return `Thuộc tính ${a.key} thiếu giá trị`;
      if (tmpl.valueType === "NUMBER" && (a.numberValue == null || isNaN(a.numberValue))) return `Thuộc tính ${a.key} thiếu số`;
    }
    return null;
  };

  const handleUpload = async () => {
    if (!imageFile) return;
    setUploading(true); setError(null); setSuccess(null);
    try {
      const fd = new FormData(); fd.append("file", imageFile);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setImageUrl(data.url); setImageBlurData(data.blurDataUrl); setSuccess("Đã upload ảnh mới");
    } catch (e: any) { setError(e.message); } finally { setUploading(false); }
  };

  const refetchProduct = async () => {
    const res = await fetch(`/api/admin/products/${productId}`);
    if (res.ok) {
      const pdata = await res.json();
      const p: ProductPayload = pdata.product;
      setProduct(p);
      setUpdatedAt(p.updatedAt);
      setConflict(null);
      setSuccess("Đã tải dữ liệu mới nhất sau xung đột");
    }
  };

  const handleSave = async () => {
    setError(null); setSuccess(null); setConflict(null);
    const err = validateLocal(); if (err) { setError(err); return; }
    setSaving(true);
    try {
      const body = {
        name: name.trim(),
        slug: slug.trim() || undefined,
        priceCents: Math.round(Number(price) * 100),
        stock: Number(stock),
        categoryId,
        featured,
        status,
        description: description || null,
        imageUrl,
        imageBlurData,
        attributes: attributes.map(a => ({ key: a.key, stringValue: a.stringValue ?? null, numberValue: a.numberValue ?? null })),
        updatedAt, // concurrency token
      };
      const res = await fetch(`/api/admin/products/${productId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (res.status === 409) {
        setConflict({ currentUpdatedAt: data.currentUpdatedAt });
        // Tải bản remote mới nhất để so sánh
        const latestRes = await fetch(`/api/admin/products/${productId}`);
        if (latestRes.ok) {
          const latestData = await latestRes.json();
            const remoteProd: ProductPayload = latestData.product;
            setConflictRemote(remoteProd);
            computeDiff(remoteProd);
        }
        setError("Xung đột cập nhật – so sánh và chọn giá trị muốn giữ.");
        return;
      }
      if (!res.ok) throw new Error(data.error || "Cập nhật thất bại");
      const p: ProductPayload = data.product;
      setProduct(p);
      setUpdatedAt(p.updatedAt);
      setSuccess("Cập nhật thành công");
    } catch (e: any) { setError(e.message); } finally { setSaving(false); }
  };

  if (loading) return <div className="p-6 text-sm">Đang tải...</div>;
  if (!product) return <div className="p-6 text-sm text-red-600">Không có dữ liệu sản phẩm</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-dark">Chỉnh sửa sản phẩm</h1>
        <Link href="/admin/products" className="text-sm text-blue hover:underline">Quay lại danh sách</Link>
      </div>
      <div className="bg-white rounded-xl shadow p-6 space-y-6">
        {error && <div className="text-sm text-red-600">{error}</div>}
        {success && <div className="text-sm text-green-600">{success}</div>}
        {conflict && conflictRemote && (
          <div className="space-y-3">
            <div className="text-xs text-orange-600">Xung đột: dữ liệu đã thay đổi bởi người khác. Chọn giá trị bạn muốn giữ rồi nhấn &quot;Ghi đè&quot;.</div>
            <div className="overflow-auto max-h-64 border rounded">
              <table className="min-w-full text-[11px]">
                <thead className="bg-orange-50">
                  <tr>
                    <th className="px-2 py-1 text-left">Trường</th>
                    <th className="px-2 py-1 text-left">Cục bộ</th>
                    <th className="px-2 py-1 text-left">Remote</th>
                    <th className="px-2 py-1 text-left">Giữ</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(diffSelection).length === 0 && Object.keys(attributeDiffSelection).length === 0 && (
                    <tr><td colSpan={4} className="px-2 py-2 text-center text-gray-500">Không có khác biệt nào</td></tr>
                  )}
                  {Object.entries(diffSelection).map(([field, choice]) => {
                    const remoteVal = (conflictRemote as any)[field];
                    const localVal = ((): any => {
                      switch(field){
                        case 'priceCents': return Math.round(Number(price) * 100);
                        case 'stock': return Number(stock);
                        default: return (field === 'description' ? description : (field === 'name'? name : field === 'slug'? slug : field === 'status'? status : field === 'featured'? featured : field === 'categoryId'? categoryId : ''));
                      }
                    })();
                    return (
                      <tr key={field} className="border-t">
                        <td className="px-2 py-1 font-medium">{field}</td>
                        <td className="px-2 py-1 max-w-[180px] truncate" title={String(localVal)}>{String(localVal)}</td>
                        <td className="px-2 py-1 max-w-[180px] truncate" title={String(remoteVal)}>{String(remoteVal)}</td>
                        <td className="px-2 py-1">
                          <div className="flex items-center gap-2">
                            <label className="inline-flex items-center gap-1 cursor-pointer">
                              <input type="radio" name={`keep-${field}`} checked={diffSelection[field]==='local'} onChange={()=>setDiffSelection(prev=>({...prev,[field]:'local'}))} />
                              <span>Local</span>
                            </label>
                            <label className="inline-flex items-center gap-1 cursor-pointer">
                              <input type="radio" name={`keep-${field}`} checked={diffSelection[field]==='remote'} onChange={()=>setDiffSelection(prev=>({...prev,[field]:'remote'}))} />
                              <span>Remote</span>
                            </label>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {attrTemplates.map(t => {
                    if (!(t.key in attributeDiffSelection)) return null;
                    const remoteAttr = conflictRemote.attributes.find(a=>a.attributeType.key===t.key);
                    const localAttr = attributes.find(a=>a.key===t.key);
                    const remoteVal = t.valueType==='STRING'? remoteAttr?.stringValue : remoteAttr?.numberValue;
                    const localVal = t.valueType==='STRING'? localAttr?.stringValue : localAttr?.numberValue;
                    return (
                      <tr key={`attr-${t.key}`} className="border-t">
                        <td className="px-2 py-1 font-medium">attr:{t.key}</td>
                        <td className="px-2 py-1 max-w-[180px] truncate" title={String(localVal)}>{String(localVal)}</td>
                        <td className="px-2 py-1 max-w-[180px] truncate" title={String(remoteVal)}>{String(remoteVal)}</td>
                        <td className="px-2 py-1">
                          <div className="flex items-center gap-2">
                            <label className="inline-flex items-center gap-1 cursor-pointer">
                              <input type="radio" name={`keep-attr-${t.key}`} checked={attributeDiffSelection[t.key]==='local'} onChange={()=>setAttributeDiffSelection(prev=>({...prev,[t.key]:'local'}))} />
                              <span>Local</span>
                            </label>
                            <label className="inline-flex items-center gap-1 cursor-pointer">
                              <input type="radio" name={`keep-attr-${t.key}`} checked={attributeDiffSelection[t.key]==='remote'} onChange={()=>setAttributeDiffSelection(prev=>({...prev,[t.key]:'remote'}))} />
                              <span>Remote</span>
                            </label>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={refetchProduct} className="px-3 py-1 rounded border text-xs">Tải lại remote</button>
              <button
                onClick={async () => {
                  if (!conflictRemote) return;
                  setSaving(true); setError(null); setSuccess(null);
                  try {
                    // Build merged values
                    const merged: any = {
                      name: diffSelection.name==='local'? name.trim(): conflictRemote.name,
                      slug: diffSelection.slug==='local'? (slug.trim()||undefined) : conflictRemote.slug,
                      priceCents: diffSelection.priceCents==='local'? Math.round(Number(price)*100) : conflictRemote.priceCents,
                      stock: diffSelection.stock==='local'? Number(stock) : conflictRemote.stock,
                      status: diffSelection.status==='local'? status : conflictRemote.status,
                      featured: diffSelection.featured==='local'? featured : conflictRemote.featured,
                      description: diffSelection.description==='local'? (description||null) : conflictRemote.description,
                      categoryId: diffSelection.categoryId==='local'? categoryId : conflictRemote.categoryId,
                      imageUrl: imageUrl,
                      imageBlurData: imageBlurData,
                      attributes: attributes.map(a => {
                        const remoteAttr = conflictRemote.attributes.find(r=>r.attributeType.key===a.key);
                        const keepLocal = attributeDiffSelection[a.key]==='local';
                        return {
                          key: a.key,
                          stringValue: keepLocal? a.stringValue ?? null : (remoteAttr?.stringValue ?? null),
                          numberValue: keepLocal? a.numberValue ?? null : (remoteAttr?.numberValue ?? null)
                        };
                      }),
                      updatedAt: conflictRemote.updatedAt
                    };
                    const patchRes = await fetch(`/api/admin/products/${productId}`, { method: 'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify(merged) });
                    const patchData = await patchRes.json();
                    if (patchRes.status===409) {
                      setError('Vẫn còn xung đột, thử lại sau');
                      return;
                    }
                    if (!patchRes.ok) throw new Error(patchData.error || 'Ghi đè thất bại');
                    const p: ProductPayload = patchData.product;
                    setProduct(p);
                    setUpdatedAt(p.updatedAt);
                    setConflict(null);
                    setConflictRemote(null);
                    setDiffSelection({});
                    setAttributeDiffSelection({});
                    setSuccess('Đã hợp nhất và lưu thành công');
                  } catch (e: any) {
                    setError(e.message);
                  } finally { setSaving(false); }
                }}
                disabled={saving}
                className="px-3 py-1 rounded bg-orange-600 text-white text-xs disabled:opacity-50"
              >Ghi đè & Lưu</button>
            </div>
          </div>
        )}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tên</label>
            <input className="w-full border rounded px-3 py-2 text-sm" value={name} onChange={e=>setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Danh mục</label>
            <select className="w-full border rounded px-3 py-2 text-sm" value={categoryId} onChange={e=>setCategoryId(e.target.value)}>
              <option value="">-- Chọn --</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Slug</label>
            <input className="w-full border rounded px-3 py-2 text-sm" value={slug} onChange={e=>setSlug(e.target.value)} placeholder="tu-dong-neu-de-trong" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Giá (VND)</label>
            <input className="w-full border rounded px-3 py-2 text-sm" value={price} onChange={e=>setPrice(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tồn kho</label>
            <input className="w-full border rounded px-3 py-2 text-sm" value={stock} onChange={e=>setStock(e.target.value)} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium">Trạng thái</label>
              <Tooltip
                side="top"
                content={
                  <span>
                    <strong>Nháp:</strong> Nội bộ, chưa bán.<br />
                    <strong>Hiển thị:</strong> Đang bán, khách hàng thấy.<br />
                    <strong>Lưu trữ:</strong> Ẩn khỏi danh sách, giữ lịch sử.
                  </span>
                }
              >
                <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-gray-700 text-[10px] font-bold text-white cursor-help">i</span>
              </Tooltip>
            </div>
            <select className="w-full border rounded px-3 py-2 text-sm" value={status} onChange={e=>setStatus(e.target.value as any)}>
              <option value="DRAFT">Nháp</option>
              <option value="PUBLISHED">Hiển thị</option>
              <option value="ARCHIVED">Lưu trữ</option>
            </select>
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input id="featured" type="checkbox" checked={featured} onChange={e=>setFeatured(e.target.checked)} />
            <label htmlFor="featured" className="text-sm">Hiển thị trang chủ</label>
            <Tooltip
              side="top"
              content={<span>Cho phép sản phẩm tham gia các block nổi bật ngoài Trang chủ.</span>}
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
          <div className="flex items-center gap-4 flex-wrap">
            <input type="file" accept="image/*" onChange={e=>{const f=e.target.files?.[0]; setImageFile(f||null); setImagePreview(f?URL.createObjectURL(f):"");}} />
            <button disabled={!imageFile || uploading} onClick={handleUpload} className="px-4 py-2 text-sm rounded bg-blue text-white disabled:opacity-50">{uploading?"Đang upload...":"Upload mới"}</button>
            {imageUrl && <span className="text-xs text-green-700 break-all">Hiện tại: {imageUrl}</span>}
          </div>
          {(imagePreview || imageUrl) && (
            <div className="mt-3 flex gap-4">
              {imagePreview && <Image src={imagePreview} alt="preview" width={160} height={120} className="rounded border" />}
              {imageUrl && !imagePreview && <Image src={imageUrl} alt="current" width={160} height={120} className="rounded border" />}
            </div>
          )}
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
          <button onClick={handleSave} disabled={saving} className="px-6 py-2 rounded bg-purple-600 text-white text-sm font-medium disabled:opacity-50">{saving?"Đang lưu...":"Lưu thay đổi"}</button>
        </div>
        <div className="text-[10px] text-gray-400">updatedAt token: {updatedAt}</div>
      </div>
    </div>
  );
}
