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
  const [priceDisplay, setPriceDisplay] = useState<string>(""); // For formatted display
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
  const [attrErrors, setAttrErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{[k:string]:string}>({});

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

  // Validate nâng cao cho từng trường kỹ thuật phổ biến
  const onAttrChange = useCallback((key: string, value: string) => {
    setAttributes(prev => prev.map(a => {
      if (a.key !== key) return a;
      const template = attrTemplates.find(t => t.key === key);
      if (!template) return a;
      let err = "";
      if (template.valueType === "STRING") {
        const validStr = /^[\p{L}0-9 \-]+$/u;
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
      // Luôn lưu path tương đối (ví dụ: /uploads/xxx.jpg)
      setImageUrl(data.url);
      setImageBlurData(data.blurDataUrl);
      setSuccess("Đã upload ảnh");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  // Validate realtime cho các trường chính
  const validateField = useCallback((field: string, value: string) => {
    let err = "";
    if (field === "name") {
      if (!value.trim()) err = "Tên sản phẩm bắt buộc";
    }
    if (field === "categoryId") {
      if (!value) err = "Cần chọn danh mục";
    }
    if (field === "price") {
      const p = Number(value);
      if (isNaN(p) || p < 0) err = "Giá không hợp lệ";
      else if (p > 2147483647) err = "Giá quá lớn (tối đa 2,147,483,647)";
    }
    if (field === "stock") {
      const s = Number(value);
      if (isNaN(s) || s < 0) err = "Tồn kho không hợp lệ";
      else if (s > 2147483647) err = "Tồn kho quá lớn (tối đa 2,147,483,647)";
    }
    setFieldErrors(prev => ({ ...prev, [field]: err }));
    return err;
  }, []);

  // Validate tổng thể khi submit
  const validateLocal = (): string | null => {
    let hasError = false;
    const newFieldErrors: {[k:string]:string} = {};
    if (validateField("name", name)) { hasError = true; console.log(`Lỗi trường chính: name - ${fieldErrors.name}`); }
    if (validateField("categoryId", categoryId)) { hasError = true; console.log(`Lỗi trường chính: categoryId - ${fieldErrors.categoryId}`); }
    if (validateField("price", price)) { hasError = true; console.log(`Lỗi trường chính: price - ${fieldErrors.price}`); }
    if (validateField("stock", stock)) { hasError = true; console.log(`Lỗi trường chính: stock - ${fieldErrors.stock}`); }
    for (const a of attributes) {
      const tmpl = attrTemplates.find(t => t.key === a.key);
      if (!tmpl) continue;
      if (tmpl.valueType === "STRING" && (!a.stringValue || a.stringValue === "")) { setAttrErrors(prev => ({...prev, [a.key]: `Thuộc tính ${a.key} thiếu giá trị`})); hasError = true; console.log(`Lỗi thuộc tính kỹ thuật: key=${a.key}, value=${a.stringValue}, lỗi=Thiếu giá trị`); }
      if (tmpl.valueType === "NUMBER") {
        const value = a.numberValue?.toString() ?? "";
        if (value.trim() === "" || a.numberValue == null || isNaN(a.numberValue)) {
          setAttrErrors(prev => ({...prev, [a.key]: `Thuộc tính ${a.key} thiếu số`})); hasError = true; console.log(`Lỗi thuộc tính kỹ thuật: key=${a.key}, value=${a.numberValue}, lỗi=Thiếu số`);
        } else if (!/^\d*\.?\d+$/.test(value.trim())) {
          setAttrErrors(prev => ({...prev, [a.key]: `Chỉ được nhập số thực dương, ví dụ: 4.80, 3.25, 2.5`})); hasError = true; console.log(`Lỗi thuộc tính kỹ thuật: key=${a.key}, value=${a.numberValue}, lỗi=Định dạng số thực dương`);
        }
      }
      if (attrErrors[a.key]) { hasError = true; console.log(`Lỗi thuộc tính kỹ thuật: key=${a.key}, lỗi=${attrErrors[a.key]}`); }
    }
    if (hasError) return "Có trường không hợp lệ";
    return null;
  };

  // Handle price input with formatting
  const handlePriceChange = (value: string) => {
    // Remove all non-digit characters
    const numericValue = value.replace(/\D/g, '');
    
    if (numericValue === '') {
      setPrice('');
      setPriceDisplay('');
      return;
    }
    
    // Store raw numeric value
    setPrice(numericValue);
    
    // Format for display
    const formatted = Number(numericValue).toLocaleString('vi-VN');
    setPriceDisplay(formatted);
    
    // Validate
    validateField('price', numericValue);
  };

  const handleSave = async () => {
    setError(null); setSuccess(null);
    if (!imageUrl) {
      setError("Bạn phải upload ảnh sản phẩm trước khi lưu!");
      return;
    }
    const err = validateLocal();
    if (err) { setError(err); return; }
    setSaving(true);
    try {
      // Đảm bảo imageUrl là absolute URL nếu là path tương đối
      let absoluteImageUrl = imageUrl;
      if (imageUrl && !/^https?:\/\//.test(imageUrl)) {
        if (typeof window !== 'undefined') {
          absoluteImageUrl = window.location.origin + imageUrl;
        }
      }
      
      // Convert price to cents: price is already in VND, multiply by 100
      const priceInVnd = Number(price);
      const priceCents = Math.round(priceInVnd * 100);
      // Convert price to cents and log for debugging
      console.log('Price conversion:', { inputPrice: price, priceInVnd, priceCents });
      
      const body = {
        name: name.trim(),
        priceCents,
        stock: Number(stock),
        categoryId,
        featured,
        status,
        description: description || null,
        imageUrl: absoluteImageUrl,
        imageBlurData,
        attributes: attributes.map(a => ({ key: a.key, stringValue: a.stringValue ?? null, numberValue: a.numberValue ?? null }))
      };
      console.log('DEBUG gửi lên API:', body);
      const res = await fetch("/api/admin/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) {
        // Hiển thị chi tiết lỗi trả về từ API
        if (data?.error?.fieldErrors) {
          setError(Object.entries(data.error.fieldErrors).map(([k,v])=>`${k}: ${(v as string[]).join(', ')}`).join(' | '));
        } else if (typeof data?.error === 'string') {
          setError(data.error);
        } else {
          setError("Tạo sản phẩm thất bại");
        }
        return;
      }
      setSuccess("Tạo sản phẩm thành công");
      setName(""); setPrice(""); setPriceDisplay(""); setStock("0"); setDescription(""); 
      setImageFile(null); setImagePreview(""); setImageUrl(null); setImageBlurData(null);
      setAttributes(prev => prev.map(a => ({...a, stringValue: a.stringValue!=null?"":null, numberValue: a.numberValue!=null?0:null })));
    } catch (e: any) {
      console.error("Save product error:", e);
      setError(e.message || "Đã xảy ra lỗi khi tạo sản phẩm");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 min-h-screen overflow-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-dark">Tạo sản phẩm mới</h1>
        <Link href="/admin/products" className="text-sm text-blue hover:underline">Quay lại danh sách</Link>
      </div>
      <div className="bg-white rounded-xl shadow p-6 space-y-6">
        {error && <div className="text-sm text-red-600 font-semibold" style={{color:'#dc2626'}}>{error}</div>}
        {success && <div className="text-sm text-green-600">{success}</div>}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tên</label>
            <input className="w-full border rounded px-3 py-2 text-sm" value={name} onChange={e=>{setName(e.target.value); validateField('name', e.target.value);}} placeholder="VD: CPU Intel i5" />
            {fieldErrors.name && <div className="text-xs text-red-600 mt-1" style={{color:'#dc2626'}}>{fieldErrors.name}</div>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Danh mục</label>
            <select className="w-full border rounded px-3 py-2 text-sm" value={categoryId} onChange={e=>{setCategoryId(e.target.value); validateField('categoryId', e.target.value);}}>
              <option value="">-- Chọn --</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {fieldErrors.categoryId && <div className="text-xs text-red-600 mt-1" style={{color:'#dc2626'}}>{fieldErrors.categoryId}</div>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Giá (VND)
              {priceDisplay && <span className="ml-2 text-xs text-gray-500">≈ {priceDisplay}₫</span>}
            </label>
            <input 
              className="w-full border rounded px-3 py-2 text-sm font-mono" 
              value={priceDisplay || price} 
              onChange={e => handlePriceChange(e.target.value)} 
              placeholder="Ví dụ: 1200000 hoặc 1,200,000" 
            />
            {fieldErrors.price && <div className="text-xs text-red-600 mt-1" style={{color:'#dc2626'}}>{fieldErrors.price}</div>}
            <div className="text-xs text-gray-500 mt-1">
              💡 Nhập giá theo VND (ví dụ: 1200000 cho 1.2 triệu đồng)
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tồn kho</label>
            <input className="w-full border rounded px-3 py-2 text-sm" value={stock} onChange={e=>{setStock(e.target.value); validateField('stock', e.target.value);}} />
            {fieldErrors.stock && <div className="text-xs text-red-600 mt-1" style={{color:'#dc2626'}}>{fieldErrors.stock}</div>}
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
          {/* Đã loại bỏ nút Tạo sản phẩm trùng lặp ở đây */}
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
                      <>
                        <input className="w-full border rounded px-2 py-1 text-xs" value={st?.stringValue || ""} onChange={e=>onAttrChange(t.key, e.target.value)} />
                        {attrErrors[t.key] && <div className="text-xs text-red-600 font-semibold mt-1" style={{color:'#dc2626'}}>{attrErrors[t.key]}</div>}
                      </>
                    ) : (
                      <>
                        <input
                          className="w-full border rounded px-2 py-1 text-xs"
                          type="number"
                          step="any"
                          value={st?.numberValue ?? ""}
                          onChange={e=>onAttrChange(t.key, e.target.value)}
                        />
                        {attrErrors[t.key] && <div className="text-xs text-red-600 font-semibold mt-1" style={{color:'#dc2626'}}>{attrErrors[t.key]}</div>}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {/* Đã đưa nút Tạo sản phẩm lên trên để kiểm tra */}

      {/* Nút Tạo sản phẩm duy nhất, test border và bg */}
      <div className="flex justify-end mt-8">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !imageUrl}
          style={{ border: '2px solid #1a7f37', background: saving || !imageUrl ? '#e5e7eb' : '#22c55e', color: saving || !imageUrl ? '#888' : '#fff', fontWeight: 700, fontSize: 16, borderRadius: 8, padding: '12px 32px' }}
        >
          {saving ? "Đang lưu..." : "Tạo sản phẩm"}
        </button>
      </div>
      </div>
    </div>
  );
}
