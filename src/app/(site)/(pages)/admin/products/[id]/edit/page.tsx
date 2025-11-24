"use client";
import React, { useEffect, useState, useCallback } from "react";
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
  const { id: productId } = typeof params?.then === 'function' ? React.use(params) : params;
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
  // Validate lỗi từng thuộc tính kỹ thuật
  const [attrErrors, setAttrErrors] = useState<Record<string, string>>({});
  const [fieldErrors, setFieldErrors] = useState<{[k:string]:string}>({});

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


  // Advanced real-time validation for all technical fields (STRING & NUMBER)
  const onAttrChange = useCallback((key: string, value: string) => {
    setAttributes(prev => prev.map(a => {
      if (a.key !== key) return a;
      const template = attrTemplates.find(t => t.key === key);
      if (!template) return a;
      let err = "";
      if (template.valueType === "STRING") {
        // Use a safe regex for all targets (no unicode flag)
        const validStr = /^[A-Za-z0-9 \-]+$/;
        if (value.trim() === "") err = "Không được để trống";
        // Áp dụng cho tất cả trường STRING kỹ thuật (trừ các trường đặc biệt như PCIe Gen, Power Connector)
        if (!['GPU_PCIE_GEN','GPU_POWER_CONNECTOR'].includes(key)) {
          if (value.length > 50) err = "Tối đa 50 ký tự";
          else if (/^\d+$/.test(value.trim())) err = "Không được chỉ toàn số";
          else if (!validStr.test(value.trim())) err = "Không chứa ký tự đặc biệt";
        }
        if (key === "GPU_PCIE_GEN") {
          const allowed = ["3.0", "4.0", "5.0", "2.0", "1.0"];
          if (value && !allowed.includes(value.trim())) err = `Chỉ chấp nhận: ${allowed.join(", ")}`;
        }
        if (key === "GPU_POWER_CONNECTOR") {
          if (value && !/^([0-9]+(\+)?)+-pin$/.test(value.trim())) err = "Định dạng ví dụ: 8-pin, 6+2-pin";
        }
        setAttrErrors(errors => ({ ...errors, [key]: err }));
        return { ...a, stringValue: value };
      } else {
        let numVal = value === "" ? null : Number(value);
        if (value.trim() === "") {
          err = "Không được để trống";
        } else if (!/^\d*\.?\d+$/.test(value.trim())) {
          err = "Chỉ được nhập số thực dương, ví dụ: 4.80, 3.25, 2.5";
        } else if (isNaN(numVal as number)) {
          err = "Giá trị không hợp lệ";
        } else {
          // Validate đặc thù từng trường số kỹ thuật của mọi danh mục
          if (key === "CPU_CORES" && numVal! > 128) err = "Số nhân CPU tối đa 128";
          if (key === "CPU_THREADS" && numVal! > 256) err = "Số luồng CPU tối đa 256";
          if (key === "CPU_BASE_CLOCK_GHZ" && numVal! > 10) err = "Xung cơ bản tối đa 10GHz";
          if (key === "CPU_BOOST_CLOCK_GHZ" && numVal! > 10) err = "Xung boost tối đa 10GHz";
          if (key === "CPU_TDP_WATT" && numVal! > 500) err = "TDP CPU tối đa 500W";
          if (key === "CPU_MAX_MEMORY_SPEED_MHZ" && numVal! > 10000) err = "RAM tối đa 10,000MHz";
          if (key === "MB_RAM_SLOTS" && numVal! > 16) err = "Số khe RAM tối đa 16";
          if (key === "MB_MAX_RAM_GB" && numVal! > 2048) err = "RAM tối đa 2048GB";
          if (key === "MB_MAX_RAM_SPEED_MHZ" && numVal! > 10000) err = "RAM tối đa 10,000MHz";
          if (key === "MB_PCIEX16_SLOTS" && numVal! > 8) err = "PCIe x16 tối đa 8";
          if (key === "MB_M2_SLOTS" && numVal! > 8) err = "Khe M.2 tối đa 8";
          if (key === "MB_SATA_PORTS" && numVal! > 12) err = "Cổng SATA tối đa 12";
          if (key === "GPU_VRAM_GB" && numVal! > 64) err = "VRAM quá lớn";
          if (key === "GPU_LENGTH_MM" && numVal! > 600) err = "Chiều dài không hợp lệ";
          if (key === "GPU_TDP_WATT" && numVal! > 1000) err = "TDP GPU tối đa 1000W";
          if (key === "CASE_GPU_CLEARANCE_MM" && numVal! > 400) err = "Hở GPU tối đa 400mm";
          if (key === "CASE_CPU_COOLER_CLEARANCE_MM" && numVal! > 300) err = "Hở tản CPU tối đa 300mm";
          if (key === "RAM_CAPACITY_GB" && numVal! > 512) err = "Dung lượng RAM tối đa 512GB";
          if (key === "RAM_SPEED_MHZ" && numVal! > 10000) err = "Tốc độ RAM tối đa 10,000MHz";
          if (key === "RAM_MODULES" && numVal! > 16) err = "Số thanh RAM tối đa 16";
          if (key === "RAM_CL" && numVal! > 50) err = "CL tối đa 50";
          if (key === "PSU_WATTAGE" && numVal! > 2000) err = "Công suất PSU tối đa 2000W";
          if (key === "STORAGE_CAPACITY_GB" && numVal! > 16384) err = "Dung lượng lưu trữ tối đa 16TB";
          if (key === "COOLER_TDP_WATT" && numVal! > 1000) err = "Công suất tản tối đa 1000W";
          if (key === "COOLER_MAX_HEIGHT_MM" && numVal! > 300) err = "Chiều cao tản tối đa 300mm";
          if (numVal! <= 0) err = "Phải lớn hơn 0";
        }
        setAttrErrors(errors => ({ ...errors, [key]: err }));
        return { ...a, numberValue: isNaN(numVal as number) ? null : numVal };
      }
    }));
  }, [attrTemplates]);


  const validateLocal = (): string | null => {
    let hasError = false;
    const newFieldErrors: {[k:string]:string} = {};
    if (!name.trim()) { newFieldErrors.name = "Tên sản phẩm bắt buộc"; hasError = true; }
    if (!categoryId) { newFieldErrors.categoryId = "Cần chọn danh mục"; hasError = true; }
    const p = Number(price);
    if (isNaN(p) || p < 0) { newFieldErrors.price = "Giá không hợp lệ"; hasError = true; }
    else if (p > 2147483647) { newFieldErrors.price = "Giá quá lớn (tối đa 2,147,483,647)"; hasError = true; }
    const s = Number(stock);
    if (isNaN(s) || s < 0) { newFieldErrors.stock = "Tồn kho không hợp lệ"; hasError = true; }
    else if (s > 2147483647) { newFieldErrors.stock = "Tồn kho quá lớn (tối đa 2,147,483,647)"; hasError = true; }
    let hasAttrError = false;
    attributes.forEach(a => {
      const tmpl = attrTemplates.find(t => t.key === a.key);
      if (!tmpl) return;
      const value = tmpl.valueType === "STRING" ? (a.stringValue ?? "") : (a.numberValue?.toString() ?? "");
      // Replicate the same validation as in onAttrChange
      let err = "";
      if (tmpl.valueType === "STRING") {
        // Use a safe regex for all targets (no unicode flag)
        const validStr = /^[A-Za-z0-9 \-]+$/;
        if (value.trim() === "") err = "Không được để trống";
        if (!['GPU_PCIE_GEN','GPU_POWER_CONNECTOR'].includes(a.key)) {
          if (value.length > 50) err = "Tối đa 50 ký tự";
          else if (/^\d+$/.test(value.trim())) err = "Không được chỉ toàn số";
          else if (!validStr.test(value.trim())) err = "Không chứa ký tự đặc biệt";
        }
        if (a.key === "GPU_PCIE_GEN") {
          const allowed = ["3.0", "4.0", "5.0", "2.0", "1.0"];
          if (value && !allowed.includes(value.trim())) err = `Chỉ chấp nhận: ${allowed.join(", ")}`;
        }
        if (a.key === "GPU_POWER_CONNECTOR") {
          if (value && !/^([0-9]+(\+)?)+-pin$/.test(value.trim())) err = "Định dạng ví dụ: 8-pin, 6+2-pin";
        }
      } else {
        let numVal = value === "" ? null : Number(value);
        if (value.trim() === "" || numVal == null || isNaN(numVal)) {
          err = "Không được để trống";
        } else if (!/^\d*\.?\d+$/.test(value.trim())) {
          err = "Chỉ được nhập số thực dương, ví dụ: 4.80, 3.25, 2.5";
        } else if (numVal <= 0) {
          err = "Phải lớn hơn 0";
        } else {
          if (a.key === "CPU_CORES" && numVal! > 128) err = "Số nhân CPU tối đa 128";
          if (a.key === "CPU_THREADS" && numVal! > 256) err = "Số luồng CPU tối đa 256";
          if (a.key === "CPU_BASE_CLOCK_GHZ" && numVal! > 10) err = "Xung cơ bản tối đa 10GHz";
          if (a.key === "CPU_BOOST_CLOCK_GHZ" && numVal! > 10) err = "Xung boost tối đa 10GHz";
          if (a.key === "CPU_TDP_WATT" && numVal! > 500) err = "TDP CPU tối đa 500W";
          if (a.key === "CPU_MAX_MEMORY_SPEED_MHZ" && numVal! > 10000) err = "RAM tối đa 10,000MHz";
          if (a.key === "MB_RAM_SLOTS" && numVal! > 16) err = "Số khe RAM tối đa 16";
          if (a.key === "MB_MAX_RAM_GB" && numVal! > 2048) err = "RAM tối đa 2048GB";
          if (a.key === "MB_MAX_RAM_SPEED_MHZ" && numVal! > 10000) err = "RAM tối đa 10,000MHz";
          if (a.key === "MB_PCIEX16_SLOTS" && numVal! > 8) err = "PCIe x16 tối đa 8";
          if (a.key === "MB_M2_SLOTS" && numVal! > 8) err = "Khe M.2 tối đa 8";
          if (a.key === "MB_SATA_PORTS" && numVal! > 12) err = "Cổng SATA tối đa 12";
          if (a.key === "GPU_VRAM_GB" && numVal! > 64) err = "VRAM quá lớn";
          if (a.key === "GPU_LENGTH_MM" && numVal! > 600) err = "Chiều dài không hợp lệ";
          if (a.key === "GPU_TDP_WATT" && numVal! > 1000) err = "TDP GPU tối đa 1000W";
          if (a.key === "CASE_GPU_CLEARANCE_MM" && numVal! > 400) err = "Hở GPU tối đa 400mm";
          if (a.key === "CASE_CPU_COOLER_CLEARANCE_MM" && numVal! > 300) err = "Hở tản CPU tối đa 300mm";
          if (a.key === "RAM_CAPACITY_GB" && numVal! > 512) err = "Dung lượng RAM tối đa 512GB";
          if (a.key === "RAM_SPEED_MHZ" && numVal! > 10000) err = "Tốc độ RAM tối đa 10,000MHz";
          if (a.key === "RAM_MODULES" && numVal! > 16) err = "Số thanh RAM tối đa 16";
          if (a.key === "RAM_CL" && numVal! > 50) err = "CL tối đa 50";
          if (a.key === "PSU_WATTAGE" && numVal! > 2000) err = "Công suất PSU tối đa 2000W";
          if (a.key === "STORAGE_CAPACITY_GB" && numVal! > 16384) err = "Dung lượng lưu trữ tối đa 16TB";
          if (a.key === "COOLER_TDP_WATT" && numVal! > 1000) err = "Công suất tản tối đa 1000W";
          if (a.key === "COOLER_MAX_HEIGHT_MM" && numVal! > 300) err = "Chiều cao tản tối đa 300mm";
        }
      }
      if (err) { newFieldErrors[a.key] = err; hasAttrError = true; }
      if (err) {
        console.log(`Lỗi thuộc tính kỹ thuật: key=${a.key}, value=${value}, lỗi=${err}`);
      }
    });
    // Log lỗi tổng hợp các trường chính
    Object.entries(newFieldErrors).forEach(([k,v]) => {
      if (v) console.log(`Lỗi trường chính: ${k} - ${v}`);
    });
    setFieldErrors(newFieldErrors);
    if (hasError || hasAttrError) return "Có trường không hợp lệ";
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
      // Build body object cleanly, no duplicate keys
        // Đảm bảo imageUrl là absolute URL nếu là path tương đối
        let absoluteImageUrl = imageUrl;
        if (imageUrl && !/^https?:\/\//.test(imageUrl)) {
          if (typeof window !== 'undefined') {
            absoluteImageUrl = window.location.origin + imageUrl;
          }
        }
        const body: Record<string, any> = {
          name: name.trim(),
          slug: slug.trim() || undefined,
          priceCents: Math.round(Number(price) * 100),
          stock: Number(stock),
          categoryId,
          featured,
          status,
          description: description || null,
          imageUrl: absoluteImageUrl,
          imageBlurData,
          attributes: attributes.map(a => ({ key: a.key, stringValue: a.stringValue ?? null, numberValue: a.numberValue ?? null })),
          updatedAt, // concurrency token
        };
      // Remove undefined fields (like slug if empty)
      Object.keys(body).forEach(k => body[k] === undefined && delete body[k]);
      // Log duy nhất body gửi lên API để debug
      console.log('DEBUG PATCH gửi lên API:', body);
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
      if (!res.ok) {
        // Hiển thị chi tiết lỗi trả về từ API
        if (data?.error?.fieldErrors) {
          setError(Object.entries(data.error.fieldErrors).map(([k,v])=>`${k}: ${(v as string[]).join(', ')}`).join(' | '));
        } else if (typeof data?.error === 'string') {
          setError(data.error);
        } else {
          setError("Cập nhật thất bại");
        }
        return;
      }
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
        {error && <div className="text-sm text-red-600 font-semibold" style={{color:'#dc2626'}}>{error}</div>}
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
            {fieldErrors.price && <div className="text-xs text-red-600 mt-1">{fieldErrors.price}</div>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tồn kho</label>
            <input className="w-full border rounded px-3 py-2 text-sm" value={stock} onChange={e=>setStock(e.target.value)} />
            {fieldErrors.stock && <div className="text-xs text-red-600 mt-1">{fieldErrors.stock}</div>}
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
                const err = attrErrors[t.key];
                return (
                  <div key={t.key} className="space-y-1">
                    <label className="block text-xs font-medium">{t.label}</label>
                    {t.valueType === "STRING" ? (
                      <input className={`w-full border rounded px-2 py-1 text-xs ${err ? 'border-red-500' : ''}`} value={st?.stringValue || ""} onChange={e=>onAttrChange(t.key, e.target.value)} />
                    ) : (
                      <input className={`w-full border rounded px-2 py-1 text-xs ${err ? 'border-red-500' : ''}`} type="number" step="any" value={st?.numberValue ?? ""} onChange={e=>onAttrChange(t.key, e.target.value)} />
                    )}
                    {err && <div className="text-xs text-red-600 font-semibold mt-1" style={{color:'#dc2626'}}>{err}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <div className="flex justify-end mt-8 gap-4">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              border: '2px solid #1a7f37',
              background: saving ? '#e5e7eb' : '#22c55e',
              color: saving ? '#888' : '#fff',
              fontWeight: 700,
              fontSize: 16,
              borderRadius: 8,
              padding: '12px 32px',
              opacity: saving ? 0.6 : 1,
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
          {/* Nút Xóa vĩnh viễn, chỉ hiện khi chưa có order liên quan */}
          {product && (product as any).orderItemCount === 0 && (
            <button
              type="button"
              onClick={async () => {
                if (!window.confirm('Bạn có chắc chắn muốn xóa vĩnh viễn sản phẩm này? Hành động này không thể hoàn tác!')) return;
                setSaving(true);
                setError(null); setSuccess(null);
                try {
                  const res = await fetch(`/api/admin/products/${productId}`, { method: 'DELETE' });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.error || 'Xóa thất bại');
                  setSuccess('Đã xóa sản phẩm vĩnh viễn!');
                  // Có thể chuyển hướng về danh sách sản phẩm
                  window.location.href = '/admin/products';
                } catch (e: any) {
                  setError(e.message);
                } finally {
                  setSaving(false);
                }
              }}
              style={{
                border: '2px solid #b91c1c',
                background: '#fff',
                color: '#b91c1c',
                fontWeight: 700,
                fontSize: 16,
                borderRadius: 8,
                padding: '12px 32px',
                opacity: saving ? 0.6 : 1,
                cursor: saving ? 'not-allowed' : 'pointer',
              }}
              disabled={saving}
            >
              Xóa vĩnh viễn
            </button>
          )}
        </div>
        <div className="text-[10px] text-gray-400">updatedAt token: {updatedAt}</div>
      </div>
    </div>
  );
}
