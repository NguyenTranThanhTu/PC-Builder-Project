"use client";
import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ATTRIBUTE_TEMPLATES as attributeTemplates } from "@/lib/attributeTemplates";

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
  status: "DRAFT" | "PUBLISHED" | "OUT_OF_STOCK" | "DISCONTINUED" | "ARCHIVED";
  imageUrl: string | null;
  imageBlurData: string | null;
  brand: string | null;
  manufacturer: string | null;
  modelNumber: string | null;
  warranty: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  updatedAt: string;
  category: { id: string; name: string; slug: string };
  attributes: { attributeType: { key: string; label?: string; valueType: "STRING" | "NUMBER" }; stringValue: string | null; numberValue: number | null; }[];
}

const BRAND_OPTIONS: Record<string, string[]> = {
  cpu: ['Intel', 'AMD'],
  gpu: ['NVIDIA', 'AMD'],
  mainboard: ['ASUS', 'MSI', 'GIGABYTE', 'ASRock', 'Biostar'],
  ram: ['Corsair', 'G.Skill', 'Kingston', 'Crucial', 'TeamGroup'],
  psu: ['Corsair', 'Seasonic', 'EVGA', 'Cooler Master', 'Thermaltake'],
  case: ['NZXT', 'Corsair', 'Lian Li', 'Fractal Design', 'Phanteks'],
  storage: ['Samsung', 'WD', 'Seagate', 'Crucial', 'Kingston'],
  cooler: ['Noctua', 'Cooler Master', 'be quiet!', 'NZXT', 'Deepcool']
};

const WARRANTY_OPTIONS = ['12 tháng', '24 tháng', '36 tháng', '60 tháng'];

export default function EditProductPage({ params }: any) {
  const router = useRouter();
  const { id: productId } = typeof params?.then === 'function' ? React.use(params) : params;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [product, setProduct] = useState<ProductPayload | null>(null);
  const [categorySlug, setCategorySlug] = useState<string>("");
  
  // Form fields
  const [categoryId, setCategoryId] = useState<string>("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [price, setPrice] = useState<string>("");
  const [priceDisplay, setPriceDisplay] = useState<string>("");
  const [stock, setStock] = useState<string>("0");
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED" | "OUT_OF_STOCK" | "DISCONTINUED" | "ARCHIVED">("DRAFT");
  const [description, setDescription] = useState("");
  
  // Brand & Product Info
  const [brand, setBrand] = useState("");
  const [customBrand, setCustomBrand] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [modelNumber, setModelNumber] = useState("");
  const [warranty, setWarranty] = useState("24 tháng");
  
  // Image
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageBlurData, setImageBlurData] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Attributes
  const [attrTemplates, setAttrTemplates] = useState<AttrTemplate[]>([]);
  const [attributes, setAttributes] = useState<AttrInputState[]>([]);
  const [attrErrors, setAttrErrors] = useState<Record<string, string>>({});
  
  // UI State
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{[k:string]:string}>({});
  const [activeTab, setActiveTab] = useState<'basic' | 'specs'>('basic');

  // Load categories and product
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
          const p = pdata.product as ProductPayload;
          setProduct(p);
          setName(p.name);
          setSlug(p.slug);
          setPrice(String(p.priceCents / 100));
          setPriceDisplay(String(p.priceCents / 100));
          setStock(String(p.stock));
          setFeatured(p.featured);
          setStatus(p.status);
          setDescription(p.description || "");
          setCategoryId(p.categoryId);
          setCategorySlug(p.category.slug);
          setImageUrl(p.imageUrl);
          setImageBlurData(p.imageBlurData);
          setBrand(p.brand || "");
          setCustomBrand(p.brand || "");
          setManufacturer(p.manufacturer || "");
          setModelNumber(p.modelNumber || "");
          setWarranty(p.warranty || "24 tháng");
          setUpdatedAt(p.updatedAt);
          
          // Load attributes
          const cat = p.category;
          const tmpl = attributeTemplates[cat.slug] || [];
          setAttrTemplates(tmpl);
          
          const attrMap = new Map(p.attributes.map(a => [a.attributeType.key, a]));
          setAttributes(tmpl.map(t => {
            const existing = attrMap.get(t.key);
            return {
              key: t.key,
              stringValue: t.valueType === 'STRING' ? (existing?.stringValue ?? "") : null,
              numberValue: t.valueType === 'NUMBER' ? (existing?.numberValue ?? null) : null,
            };
          }));
        }
      } catch (e) {
        console.error(e);
        setError("Không thể tải sản phẩm");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [productId]);

  // Update attributes when category changes
  useEffect(() => {
    const cat = categories.find(c => c.id === categoryId);
    if (!cat) return;
    
    setCategorySlug(cat.slug);
    const tmpl = attributeTemplates[cat.slug] || [];
    setAttrTemplates(tmpl);
    
    // Preserve existing attribute values if keys match
    const currentAttrMap = new Map(attributes.map(a => [a.key, a]));
    setAttributes(tmpl.map(t => {
      const existing = currentAttrMap.get(t.key);
      if (existing) return existing;
      return {
        key: t.key,
        stringValue: t.valueType === 'STRING' ? "" : null,
        numberValue: t.valueType === 'NUMBER' ? null : null,
      };
    }));
  }, [categoryId, categories]);

  const onAttrChange = useCallback((key: string, value: string) => {
    setAttributes(prev => prev.map(a => {
      if (a.key !== key) return a;
      const template = attrTemplates.find(t => t.key === key);
      if (!template) return a;
      
      let err = "";
      if (template.valueType === "STRING") {
        if (value.trim() === "") err = "Không được để trống";
        else if (value.length > 100) err = "Tối đa 100 ký tự";
        setAttrErrors(errors => ({ ...errors, [key]: err }));
        return { ...a, stringValue: value };
      } else {
        let numVal = value === "" ? null : Number(value);
        if (value.trim() === "") {
          err = "Không được để trống";
        } else if (!/^\d*\.?\d+$/.test(value.trim())) {
          err = "Chỉ được nhập số dương";
        } else if (isNaN(numVal as number) || (numVal as number) <= 0) {
          err = "Phải lớn hơn 0";
        }
        setAttrErrors(errors => ({ ...errors, [key]: err }));
        return { ...a, numberValue: numVal };
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
      setSuccess("✓ Ảnh đã upload thành công");
      setTimeout(() => setSuccess(null), 3000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  const validateField = useCallback((field: string, value: string) => {
    let err = "";
    if (field === "name") {
      if (!value.trim()) err = "Tên sản phẩm bắt buộc";
      else if (value.length < 5) err = "Tên quá ngắn (tối thiểu 5 ký tự)";
    }
    if (field === "categoryId") {
      if (!value) err = "Cần chọn danh mục";
    }
    if (field === "brand") {
      if (!value.trim()) err = "Thương hiệu bắt buộc";
    }
    if (field === "price") {
      const p = Number(value);
      if (isNaN(p) || p < 0) err = "Giá không hợp lệ";
      else if (p > 2147483647) err = "Giá quá lớn";
    }
    if (field === "stock") {
      const s = Number(value);
      if (isNaN(s) || s < 0) err = "Tồn kho không hợp lệ";
    }
    
    setFieldErrors(prev => ({ ...prev, [field]: err }));
    return err;
  }, []);

  const handlePriceChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    if (numericValue === '') {
      setPrice('');
      setPriceDisplay('');
      return;
    }
    setPrice(numericValue);
    const formatted = Number(numericValue).toLocaleString('vi-VN');
    setPriceDisplay(formatted);
    validateField('price', numericValue);
  };

  const validateLocal = (): boolean => {
    let hasError = false;
    
    if (validateField("name", name)) hasError = true;
    if (validateField("categoryId", categoryId)) hasError = true;
    if (validateField("brand", brand === 'custom' ? customBrand : brand)) hasError = true;
    if (validateField("price", price)) hasError = true;
    if (validateField("stock", stock)) hasError = true;
    
    for (const a of attributes) {
      const tmpl = attrTemplates.find(t => t.key === a.key);
      if (!tmpl) continue;
      
      if (tmpl.valueType === "STRING" && (!a.stringValue || a.stringValue === "")) {
        setAttrErrors(prev => ({...prev, [a.key]: "Bắt buộc"}));
        hasError = true;
      }
      if (tmpl.valueType === "NUMBER" && (a.numberValue == null || isNaN(a.numberValue))) {
        setAttrErrors(prev => ({...prev, [a.key]: "Bắt buộc"}));
        hasError = true;
      }
      if (attrErrors[a.key]) hasError = true;
    }
    
    return hasError;
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(null);
    
    if (validateLocal()) {
      setError("⚠️ Vui lòng kiểm tra lại các trường bắt buộc");
      return;
    }
    
    setSaving(true);
    try {
      const finalBrand = brand === 'custom' ? customBrand : brand;
      const priceInVnd = Number(price);
      const priceCents = Math.round(priceInVnd * 100);
      
      // Auto-generate meta fields if not set
      const metaTitle = `${name} - Chính hãng giá tốt`;
      const metaDescription = `Mua ${name} chính hãng với ${warranty} bảo hành, giá tốt nhất thị trường. Giao hàng nhanh toàn quốc.`;
      
      const body = {
        id: productId,
        name: name.trim(),
        slug,
        priceCents,
        stock: Number(stock),
        categoryId,
        featured,
        status,
        description: description || null,
        imageUrl,
        imageBlurData,
        brand: finalBrand || null,
        manufacturer: manufacturer || null,
        modelNumber: modelNumber || null,
        warranty: warranty || null,
        metaTitle,
        metaDescription,
        updatedAt,
        attributes: attributes.map(a => ({ 
          key: a.key, 
          stringValue: a.stringValue ?? null, 
          numberValue: a.numberValue ?? null 
        }))
      };
      
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        if (data?.error?.fieldErrors) {
          setError(Object.entries(data.error.fieldErrors)
            .map(([k,v])=>`${k}: ${(v as string[]).join(', ')}`)
            .join(' | '));
        } else {
          setError(data.error || "Cập nhật sản phẩm thất bại");
        }
        return;
      }
      
      setSuccess("✓ Cập nhật sản phẩm thành công!");
      setTimeout(() => {
        router.push('/admin/products');
      }, 1500);
      
    } catch (e: any) {
      setError(e.message || "Đã xảy ra lỗi");
    } finally {
      setSaving(false);
    }
  };

  const brandOptions = categorySlug ? (BRAND_OPTIONS[categorySlug] || []) : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-1 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue"></div>
          <p className="mt-4 text-gray-6">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-1">
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-dark">Chỉnh sửa sản phẩm</h1>
              <p className="text-sm text-gray-6 mt-1">Cập nhật thông tin sản phẩm: {product?.name}</p>
            </div>
            <Link 
              href="/admin/products" 
              className="px-4 py-2 text-sm font-medium text-gray-7 bg-white border border-gray-3 rounded-lg hover:bg-gray-2 transition-colors"
            >
              ← Quay lại
            </Link>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-light-6 border-l-4 border-red rounded-r-lg">
            <div className="flex items-center">
              <span className="text-red-dark-2 font-medium">{error}</span>
            </div>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-light-7 border-l-4 border-green rounded-r-lg">
            <div className="flex items-center">
              <span className="text-green-dark-2 font-medium">{success}</span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-t-xl shadow-sm border-b">
          <div className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('basic')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'basic'
                  ? 'border-blue text-blue'
                  : 'border-transparent text-gray-5 hover:text-gray-7'
              }`}
            >
              📦 Thông tin cơ bản
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'specs'
                  ? 'border-blue text-blue'
                  : 'border-transparent text-gray-5 hover:text-gray-7'
              }`}
            >
              ⚙️ Thông số kỹ thuật {attrTemplates.length > 0 && `(${attrTemplates.length})`}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-b-xl shadow-sm p-8">
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-8">
              {/* Product Identity */}
              <section>
                <h2 className="text-lg font-semibold text-dark mb-4">Thông tin sản phẩm</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-7 mb-2">
                      Tên sản phẩm <span className="text-red">*</span>
                    </label>
                    <input
                      className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue focus:border-transparent transition-shadow ${
                        fieldErrors.name ? 'border-red' : 'border-gray-3'
                      }`}
                      value={name}
                      onChange={e => {setName(e.target.value); validateField('name', e.target.value);}}
                      placeholder="VD: CPU Intel Core i7-13700K"
                    />
                    {fieldErrors.name && <p className="text-xs text-red mt-1">{fieldErrors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-7 mb-2">
                      Danh mục <span className="text-red">*</span>
                    </label>
                    <select
                      className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue focus:border-transparent ${
                        fieldErrors.categoryId ? 'border-red' : 'border-gray-3'
                      }`}
                      value={categoryId}
                      onChange={e => {setCategoryId(e.target.value); validateField('categoryId', e.target.value);}}
                    >
                      <option value="">-- Chọn danh mục --</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    {fieldErrors.categoryId && <p className="text-xs text-red mt-1">{fieldErrors.categoryId}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-7 mb-2">
                      Thương hiệu <span className="text-red">*</span>
                    </label>
                    <select
                      className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue focus:border-transparent ${
                        fieldErrors.brand ? 'border-red' : 'border-gray-3'
                      }`}
                      value={brand}
                      onChange={e => {setBrand(e.target.value); validateField('brand', e.target.value);}}
                      disabled={!categorySlug}
                    >
                      <option value="">-- Chọn thương hiệu --</option>
                      {brandOptions.map(b => <option key={b} value={b}>{b}</option>)}
                      <option value="custom">✏️ Nhập thủ công...</option>
                    </select>
                    {brand === 'custom' && (
                      <input
                        className="w-full border border-gray-3 rounded-lg px-4 py-2.5 text-sm mt-2 focus:ring-2 focus:ring-blue"
                        value={customBrand}
                        onChange={e => {setCustomBrand(e.target.value); validateField('brand', e.target.value);}}
                        placeholder="Nhập tên thương hiệu"
                      />
                    )}
                    {fieldErrors.brand && <p className="text-xs text-red mt-1">{fieldErrors.brand}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-7 mb-2">
                      Nhà sản xuất / Dòng sản phẩm
                    </label>
                    <input
                      className="w-full border border-gray-3 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue focus:border-transparent"
                      value={manufacturer}
                      onChange={e => setManufacturer(e.target.value)}
                      placeholder="VD: ASUS ROG Strix, MSI Gaming X"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-7 mb-2">
                      Mã sản phẩm (Model Number)
                    </label>
                    <input
                      className="w-full border border-gray-3 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue focus:border-transparent"
                      value={modelNumber}
                      onChange={e => setModelNumber(e.target.value)}
                      placeholder="VD: BX8071513700K"
                    />
                  </div>
                </div>
              </section>

              {/* Pricing & Stock */}
              <section>
                <h2 className="text-lg font-semibold text-dark mb-4">Giá & Kho hàng</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-7 mb-2">
                      Giá (VND) <span className="text-red">*</span>
                    </label>
                    <input
                      className={`w-full border rounded-lg px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-blue focus:border-transparent ${
                        fieldErrors.price ? 'border-red' : 'border-gray-3'
                      }`}
                      value={priceDisplay || price}
                      onChange={e => handlePriceChange(e.target.value)}
                      placeholder="1,200,000"
                    />
                    {priceDisplay && <p className="text-xs text-gray-5 mt-1">≈ {priceDisplay}₫</p>}
                    {fieldErrors.price && <p className="text-xs text-red mt-1">{fieldErrors.price}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-7 mb-2">
                      Tồn kho <span className="text-red">*</span>
                    </label>
                    <input
                      type="number"
                      className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue focus:border-transparent ${
                        fieldErrors.stock ? 'border-red' : 'border-gray-3'
                      }`}
                      value={stock}
                      onChange={e => {setStock(e.target.value); validateField('stock', e.target.value);}}
                      min="0"
                    />
                    {fieldErrors.stock && <p className="text-xs text-red mt-1">{fieldErrors.stock}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-7 mb-2">
                      Bảo hành
                    </label>
                    <select
                      className="w-full border border-gray-3 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue focus:border-transparent"
                      value={warranty}
                      onChange={e => setWarranty(e.target.value)}
                    >
                      {WARRANTY_OPTIONS.map(w => <option key={w} value={w}>{w}</option>)}
                    </select>
                  </div>
                </div>
              </section>

              {/* Status & Settings */}
              <section>
                <h2 className="text-lg font-semibold text-dark mb-4">Trạng thái & Cài đặt</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-7 mb-2">
                      Trạng thái sản phẩm
                    </label>
                    <select
                      className="w-full border border-gray-3 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue focus:border-transparent"
                      value={status}
                      onChange={e => setStatus(e.target.value as any)}
                    >
                      <option value="DRAFT">📝 Nháp (Draft)</option>
                      <option value="PUBLISHED">✅ Hiển thị (Published)</option>
                      <option value="OUT_OF_STOCK">📦 Hết hàng (Out of Stock)</option>
                      <option value="DISCONTINUED">🚫 Ngừng kinh doanh (Discontinued)</option>
                      <option value="ARCHIVED">🗄️ Lưu trữ (Archived)</option>
                    </select>
                  </div>

                  <div className="flex items-center pt-8">
                    <input
                      id="featured"
                      type="checkbox"
                      checked={featured}
                      onChange={e => setFeatured(e.target.checked)}
                      className="w-4 h-4 text-blue border-gray-3 rounded focus:ring-blue"
                    />
                    <label htmlFor="featured" className="ml-3 text-sm font-medium text-gray-7">
                      ⭐ Hiển thị trang chủ (Featured)
                    </label>
                  </div>
                </div>
              </section>

              {/* Description */}
              <section>
                <h2 className="text-lg font-semibold text-dark mb-4">Mô tả sản phẩm</h2>
                <textarea
                  className="w-full border border-gray-3 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue focus:border-transparent"
                  rows={6}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Nhập mô tả chi tiết về sản phẩm..."
                />
              </section>

              {/* Image Upload */}
              <section>
                <h2 className="text-lg font-semibold text-dark mb-4">Hình ảnh sản phẩm</h2>
                <div className="border-2 border-dashed border-gray-3 rounded-lg p-8">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    {(imagePreview || imageUrl) ? (
                      <div className="relative">
                        <Image 
                          src={imagePreview || imageUrl!} 
                          alt="Preview" 
                          width={300} 
                          height={300} 
                          className="rounded-lg border-2 border-gray-2 object-cover"
                        />
                        {imageUrl && !imagePreview && (
                          <div className="absolute top-2 right-2 bg-green text-white px-3 py-1 rounded-full text-xs font-medium">
                            ✓ Ảnh hiện tại
                          </div>
                        )}
                        {imagePreview && (
                          <div className="absolute top-2 right-2 bg-yellow text-white px-3 py-1 rounded-full text-xs font-medium">
                            ⏳ Chưa lưu
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="mt-2 text-sm text-gray-6">Chưa có ảnh</p>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => {
                          const f = e.target.files?.[0];
                          setImageFile(f || null);
                          setImagePreview(f ? URL.createObjectURL(f) : "");
                        }}
                        className="block text-sm text-gray-5 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-light-6 file:text-blue hover:file:bg-blue-light-5"
                      />
                      <button
                        onClick={handleUpload}
                        disabled={!imageFile || uploading}
                        className="px-6 py-2 text-sm font-medium text-white bg-blue rounded-lg hover:bg-blue-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {uploading ? "Đang upload..." : "Upload ảnh mới"}
                      </button>
                    </div>
                    
                    <p className="text-xs text-gray-5">
                      Hỗ trợ: JPG, PNG, GIF (tối đa 5MB)
                    </p>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Specs Tab */}
          {activeTab === 'specs' && (
            <div className="space-y-6">
              <div className="bg-blue-light-6 border border-blue-light-4 rounded-lg p-4">
                <p className="text-sm text-blue-dark-2">
                  💡 <strong>Lưu ý:</strong> Thay đổi danh mục sẽ reset các thông số kỹ thuật
                </p>
              </div>

              {attrTemplates.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-5">Không có thông số kỹ thuật cho danh mục này</p>
                </div>
              ) : (
                <>
                  <h2 className="text-lg font-semibold text-dark">
                    Thông số kỹ thuật ({attrTemplates.length} trường)
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {attrTemplates.map(t => {
                      const st = attributes.find(a => a.key === t.key);
                      return (
                        <div key={t.key}>
                          <label className="block text-sm font-medium text-gray-7 mb-2">
                            {t.label} <span className="text-red">*</span>
                          </label>
                          {t.valueType === "STRING" ? (
                            <input
                              className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue focus:border-transparent ${
                                attrErrors[t.key] ? 'border-red' : 'border-gray-3'
                              }`}
                              value={st?.stringValue || ""}
                              onChange={e => onAttrChange(t.key, e.target.value)}
                            />
                          ) : (
                            <input
                              type="number"
                              step="any"
                              className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue focus:border-transparent ${
                                attrErrors[t.key] ? 'border-red' : 'border-gray-3'
                              }`}
                              value={st?.numberValue ?? ""}
                              onChange={e => onAttrChange(t.key, e.target.value)}
                            />
                          )}
                          {attrErrors[t.key] && (
                            <p className="text-xs text-red mt-1">{attrErrors[t.key]}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-8 flex items-center justify-between">
          <Link
            href="/admin/products"
            className="px-6 py-3 text-sm font-medium text-gray-7 bg-white border border-gray-3 rounded-lg hover:bg-gray-2 transition-colors"
          >
            Hủy bỏ
          </Link>
          
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 text-sm font-semibold text-white bg-green rounded-lg hover:bg-green-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Đang lưu...
              </span>
            ) : (
              "✓ Cập nhật sản phẩm"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
