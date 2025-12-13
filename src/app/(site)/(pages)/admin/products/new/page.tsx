"use client";
import { useEffect, useState, useCallback } from "react";
import { ATTRIBUTE_TEMPLATES as attributeTemplates } from "@/lib/attributeTemplates";
import Tooltip from "@/components/Common/Tooltip";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Category = { id: string; name: string; slug: string };
type AttrTemplate = { key: string; label: string; valueType: "STRING" | "NUMBER" };

interface AttrInputState {
  key: string;
  stringValue?: string | null;
  numberValue?: number | null;
}

// Brand options by category
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

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");
  const [categorySlug, setCategorySlug] = useState<string>("");
  
  // Basic Info
  const [name, setName] = useState("");
  const [price, setPrice] = useState<string>("");
  const [priceDisplay, setPriceDisplay] = useState<string>("");
  const [stock, setStock] = useState<string>("0");
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED" | "OUT_OF_STOCK" | "DISCONTINUED">("DRAFT");
  const [description, setDescription] = useState("");
  
  // Brand & Product Info
  const [brand, setBrand] = useState("");
  const [customBrand, setCustomBrand] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [modelNumber, setModelNumber] = useState("");
  const [warranty, setWarranty] = useState("24 tháng");
  
  // SEO
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  
  // Images
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageBlurData, setImageBlurData] = useState<string | null>(null);
  
  // Attributes
  const [attrTemplates, setAttrTemplates] = useState<AttrTemplate[]>([]);
  const [attributes, setAttributes] = useState<AttrInputState[]>([]);
  const [attrErrors, setAttrErrors] = useState<Record<string, string>>({});
  
  // UI State
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{[k:string]:string}>({});
  const [activeTab, setActiveTab] = useState<'basic' | 'specs'>('basic');

  // Auto-generate meta fields
  useEffect(() => {
    if (name && !metaTitle) {
      setMetaTitle(`${name} - Chính hãng giá tốt`);
    }
    if (name && warranty && !metaDescription) {
      setMetaDescription(`Mua ${name} chính hãng với ${warranty} bảo hành, giá tốt nhất thị trường. Giao hàng nhanh toàn quốc.`);
    }
  }, [name, warranty]);

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
      setCategorySlug("");
      return;
    }
    setCategorySlug(cat.slug);
    const tmpl = attributeTemplates[cat.slug] || [];
    setAttrTemplates(tmpl);
    setAttributes(
      tmpl.map(t => ({ 
        key: t.key, 
        stringValue: t.valueType === "STRING" ? "" : null, 
        numberValue: t.valueType === "NUMBER" ? null : null 
      }))
    );
  }, [categoryId, categories]);

  const onAttrChange = useCallback((key: string, value: string) => {
    setAttributes(prev => prev.map(a => {
      if (a.key !== key) return a;
      const template = attrTemplates.find(t => t.key === key);
      if (!template) return a;
      
      let err = "";
      if (template.valueType === "STRING") {
        const validStr = /^[a-zA-Z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ \-]+$/;
        if (value.trim() === "") err = "Không được để trống";
        // Áp dụng cho tất cả trường STRING kỹ thuật (trừ các trường đặc biệt)
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
          if (value && !/^([0-9]+(\+)?)+\-pin$/.test(value.trim())) err = "Định dạng ví dụ: 8-pin, 6+2-pin";
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
          // Validate đặc thù từng trường số kỹ thuật
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
          if (key === "GPU_VRAM_GB" && numVal! > 64) err = "VRAM quá lớn (tối đa 64GB)";
          if (key === "GPU_LENGTH_MM" && numVal! > 600) err = "Chiều dài không hợp lệ (tối đa 600mm)";
          if (key === "GPU_TDP_WATT" && numVal! > 1000) err = "TDP GPU tối đa 1000W";
          if (key === "CASE_GPU_CLEARANCE_MM" && numVal! > 400) err = "Hở GPU tối đa 400mm";
          if (key === "CASE_CPU_COOLER_CLEARANCE_MM" && numVal! > 300) err = "Hở tản CPU tối đa 300mm";
          if (key === "RAM_CAPACITY_GB" && numVal! > 512) err = "Dung lượng RAM tối đa 512GB";
          if (key === "RAM_SPEED_MHZ" && numVal! > 10000) err = "Tốc độ RAM tối đa 10,000MHz (ví dụ: 3200, 6000)";
          if (key === "RAM_MODULES" && numVal! > 16) err = "Số thanh RAM tối đa 16";
          if (key === "RAM_CL" && numVal! > 50) err = "CL tối đa 50";
          if (key === "PSU_WATTAGE" && numVal! > 2000) err = "Công suất PSU tối đa 2000W";
          if (key === "STORAGE_CAPACITY_GB" && numVal! > 16384) err = "Dung lượng lưu trữ tối đa 16TB";
          if (key === "COOLER_TDP_WATT" && numVal! > 1000) err = "Công suất tản tối đa 1000W";
          if (key === "COOLER_MAX_HEIGHT_MM" && numVal! > 300) err = "Chiều cao tản tối đa 300mm";
        }
        setAttrErrors(errors => ({ ...errors, [key]: err }));
        return { ...a, numberValue: numVal };
      }
    }));
  }, [attrTemplates]);

  const handleUpload = async () => {
    if (!imageFile) return;
    console.log("🔵 [UPLOAD] Bắt đầu upload file:", imageFile.name, "| Size:", imageFile.size, "| Type:", imageFile.type);
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", imageFile);
      console.log("🔵 [UPLOAD] Gửi POST request tới /api/admin/upload");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      console.log("🔵 [UPLOAD] Response status:", res.status, res.statusText);
      const data = await res.json();
      console.log("🔵 [UPLOAD] Response data:", data);
      if (!res.ok) throw new Error(data.error || "Upload failed");
      
      console.log("✅ [UPLOAD] Upload thành công!");
      console.log("✅ [UPLOAD] data.url =", data.url, "| Type:", typeof data.url);
      console.log("✅ [UPLOAD] data.blurDataUrl =", data.blurDataUrl ? "có" : "null");
      // Lưu path tương đối (ví dụ: /uploads/xxx.jpg)
      setImageUrl(data.url);
      setImageBlurData(data.blurDataUrl);
      console.log("✅ [UPLOAD] Đã set imageUrl state thành:", data.url);
      setSuccess("Đã upload ảnh");
      setTimeout(() => setSuccess(null), 3000);
    } catch (e: any) {
      console.error("❌ [UPLOAD] Lỗi upload:", e);
      setError(e.message);
    } finally {
      setUploading(false);
      console.log("🔵 [UPLOAD] Kết thúc quá trình upload");
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
      else if (s > 100000) err = "Số lượng quá lớn, bạn có chắc chắn?";
    }
    if (field === "metaTitle" && value.length > 60) err = "Tiêu đề SEO tối đa 60 ký tự";
    if (field === "metaDescription" && value.length > 160) err = "Mô tả SEO tối đa 160 ký tự";
    
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
    if (metaTitle && validateField("metaTitle", metaTitle)) hasError = true;
    if (metaDescription && validateField("metaDescription", metaDescription)) hasError = true;
    
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
    
    console.log("\n🔵 [SAVE] ===== BẮT ĐẦU LƯU SẢN PHẨM =====");
    console.log("🔵 [SAVE] imageUrl state:", imageUrl);
    console.log("🔵 [SAVE] imageUrl type:", typeof imageUrl);
    console.log("🔵 [SAVE] imageUrl === null?", imageUrl === null);
    console.log("🔵 [SAVE] imageUrl === ''?", imageUrl === "");
    console.log("🔵 [SAVE] imageUrl truthy?", !!imageUrl);
    console.log("🔵 [SAVE] imagePreview:", imagePreview);
    console.log("🔵 [SAVE] uploading:", uploading);
    console.log("🔍 Debug imageUrl:", { imageUrl, imagePreview, uploading });
    
    // Check if still uploading
    if (uploading) {
      setError("⏳ Ảnh đang được upload, vui lòng chờ trong giây lát...");
      return;
    }
    
    if (!imageUrl) {
      setError("⚠️ Bạn phải upload ảnh sản phẩm trước!");
      setActiveTab('basic');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    if (validateLocal()) {
      setError("⚠️ Vui lòng kiểm tra lại các trường bắt buộc (có dấu * màu đỏ)");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    setSaving(true);
    try {
      const finalBrand = brand === 'custom' ? customBrand : brand;
      const priceInVnd = Number(price);
      const priceCents = Math.round(priceInVnd * 100);
      
      const body = {
        name: name.trim(),
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
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        attributes: attributes.map(a => ({ 
          key: a.key, 
          stringValue: a.stringValue ?? null, 
          numberValue: a.numberValue ?? null 
        }))
      };
      
      console.log("📤 [SAVE] Payload chuẩn bị gửi:", body);
      console.log("📤 [SAVE] body.imageUrl =", body.imageUrl, "| Type:", typeof body.imageUrl);
      console.log("📤 [SAVE] Gửi POST request tới /api/admin/products");
      console.log("📤 Sending product data:", body);
      
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      
      console.log("📥 [SAVE] Response status:", res.status, res.statusText);
      const data = await res.json();
      console.log("📥 [SAVE] Response data:", data);
      console.log("📥 Server response:", { status: res.status, data });
      
      if (!res.ok) {
        console.error("❌ [SAVE] API trả về lỗi");
        if (data?.error?.fieldErrors) {
          console.error("❌ [SAVE] Field errors:", data.error.fieldErrors);
          console.error("❌ [SAVE] imageUrl field error:", data.error.fieldErrors.imageUrl);
          const errorMsg = Object.entries(data.error.fieldErrors)
            .map(([k,v])=>`${k}: ${(v as string[]).join(', ')}`)
            .join(' | ');
          console.error("❌ Field errors:", data.error.fieldErrors);
          setError("❌ Lỗi validation: " + errorMsg);
        } else if (typeof data.error === 'string') {
          console.error("❌ Error:", data.error);
          setError("❌ " + data.error);
        } else {
          console.error("❌ Unknown error:", data);
          setError("❌ Tạo sản phẩm thất bại. Vui lòng kiểm tra console.");
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      
      setSuccess("✓ Tạo sản phẩm thành công!");
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tạo sản phẩm mới</h1>
              <p className="text-sm text-gray-500 mt-1">Điền thông tin sản phẩm để thêm vào kho</p>
            </div>
            <Link 
              href="/admin/products" 
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin sản phẩm</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên sản phẩm <span className="text-red-500">*</span>
                    </label>
                    <input
                      className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow ${
                        fieldErrors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={name}
                      onChange={e => {setName(e.target.value); validateField('name', e.target.value);}}
                      placeholder="VD: CPU Intel Core i7-13700K"
                    />
                    {fieldErrors.name && <p className="text-sm text-red-600 font-medium mt-1.5">⚠️ {fieldErrors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Danh mục <span className="text-red-500">*</span>
                    </label>
                    <select
                      className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        fieldErrors.categoryId ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={categoryId}
                      onChange={e => {setCategoryId(e.target.value); validateField('categoryId', e.target.value);}}
                    >
                      <option value="">-- Chọn danh mục --</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    {fieldErrors.categoryId && <p className="text-sm text-red-600 font-medium mt-1.5">⚠️ {fieldErrors.categoryId}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thương hiệu <span className="text-red-500">*</span>
                    </label>
                    <select
                      className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        fieldErrors.brand ? 'border-red-500' : 'border-gray-300'
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
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm mt-2 focus:ring-2 focus:ring-blue-500"
                        value={customBrand}
                        onChange={e => {setCustomBrand(e.target.value); validateField('brand', e.target.value);}}
                        placeholder="Nhập tên thương hiệu"
                      />
                    )}
                    {fieldErrors.brand && <p className="text-sm text-red-600 font-medium mt-1.5">⚠️ {fieldErrors.brand}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nhà sản xuất / Dòng sản phẩm
                    </label>
                    <input
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={manufacturer}
                      onChange={e => setManufacturer(e.target.value)}
                      placeholder="VD: ASUS ROG Strix, MSI Gaming X"
                    />
                    <p className="text-xs text-gray-500 mt-1">Tùy chọn: Dòng/series cụ thể của sản phẩm</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mã sản phẩm (Model Number)
                    </label>
                    <input
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={modelNumber}
                      onChange={e => setModelNumber(e.target.value)}
                      placeholder="VD: BX8071513700K"
                    />
                  </div>
                </div>
              </section>

              {/* Pricing & Stock */}
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Giá & Kho hàng</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giá (VND) <span className="text-red-500">*</span>
                    </label>
                    <input
                      className={`w-full border rounded-lg px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        fieldErrors.price ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={priceDisplay || price}
                      onChange={e => handlePriceChange(e.target.value)}
                      placeholder="1,200,000"
                    />
                    {priceDisplay && <p className="text-xs text-gray-500 mt-1">≈ {priceDisplay}₫</p>}
                    {fieldErrors.price && <p className="text-sm text-red-600 font-medium mt-1.5">⚠️ {fieldErrors.price}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tồn kho <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="1"
                      className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        fieldErrors.stock ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={stock}
                      onChange={e => {setStock(e.target.value); validateField('stock', e.target.value);}}
                      min="0"
                    />
                    {fieldErrors.stock && <p className="text-sm text-red-600 font-medium mt-1.5">⚠️ {fieldErrors.stock}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bảo hành
                    </label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Trạng thái & Cài đặt</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trạng thái sản phẩm
                    </label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={status}
                      onChange={e => setStatus(e.target.value as any)}
                    >
                      <option value="DRAFT">📝 Nháp (Draft)</option>
                      <option value="PUBLISHED">✅ Hiển thị (Published)</option>
                      <option value="OUT_OF_STOCK">📦 Hết hàng (Out of Stock)</option>
                      <option value="DISCONTINUED">🚫 Ngừng kinh doanh (Discontinued)</option>
                    </select>
                  </div>

                  <div className="flex items-center pt-8">
                    <input
                      id="featured"
                      type="checkbox"
                      checked={featured}
                      onChange={e => setFeatured(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="featured" className="ml-3 text-sm font-medium text-gray-700">
                      ⭐ Hiển thị trang chủ (Featured)
                    </label>
                  </div>
                </div>
              </section>

              {/* Description */}
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Mô tả sản phẩm</h2>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={6}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Nhập mô tả chi tiết về sản phẩm..."
                />
              </section>

              {/* Image Upload */}
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Hình ảnh sản phẩm <span className="text-red-500">*</span>
                </h2>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    {(imagePreview || imageUrl) ? (
                      <div className="relative">
                        <Image 
                          src={imagePreview || imageUrl!} 
                          alt="Preview" 
                          width={300} 
                          height={300} 
                          className="rounded-lg border-2 border-gray-200 object-cover"
                        />
                        {uploading && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                            <div className="text-white text-center">
                              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-2"></div>
                              <p className="text-sm font-medium">Đang upload...</p>
                            </div>
                          </div>
                        )}
                        {imageUrl && !uploading && (
                          <div className="absolute top-2 right-2 bg-green text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                            ✓ Đã upload
                          </div>
                        )}
                        {imagePreview && !imageUrl && !uploading && (
                          <div className="absolute top-2 right-2 bg-yellow text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                            ⏳ Đang chuẩn bị...
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="mt-2 text-sm text-gray-600 font-medium">Chưa có ảnh</p>
                        <p className="mt-1 text-xs text-gray-500">Click "Chọn ảnh" để upload</p>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => {
                          const f = e.target.files?.[0];
                          if (f) {
                            setImageFile(f);
                            setImagePreview(URL.createObjectURL(f));
                          }
                        }}
                        className="block text-sm text-gray-700
                          file:mr-4 file:py-2.5 file:px-6
                          file:rounded-lg file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-light-6 file:text-blue
                          hover:file:bg-blue-light-5
                          file:cursor-pointer
                          cursor-pointer"
                      />
                      <button
                        onClick={handleUpload}
                        disabled={!imageFile || uploading}
                        className="px-6 py-2.5 text-sm font-medium text-white bg-blue rounded-lg hover:bg-blue-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {uploading ? "Đang upload..." : "Upload"}
                      </button>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">
                        📸 Hỗ trợ: JPG, PNG, GIF (tối đa 5MB)
                      </p>
                      {imageUrl ? (
                        <p className="text-xs text-green-600 font-semibold">
                          ✅ Ảnh đã upload thành công
                        </p>
                      ) : (
                        <p className="text-xs text-blue-600 font-medium">
                          💡 Chọn ảnh rồi click nút "Upload"
                        </p>
                      )}
                    </div>
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
                  💡 <strong>Lưu ý:</strong> Các thông số kỹ thuật sẽ hiển thị sau khi chọn danh mục sản phẩm
                </p>
              </div>

              {attrTemplates.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Vui lòng chọn danh mục để hiển thị thông số kỹ thuật</p>
                </div>
              ) : (
                <>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Thông số kỹ thuật ({attrTemplates.length} trường)
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {attrTemplates.map(t => {
                      const st = attributes.find(a => a.key === t.key);
                      return (
                        <div key={t.key}>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t.label} <span className="text-red-500">*</span>
                          </label>
                          {t.valueType === "STRING" ? (
                            <input
                              className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                attrErrors[t.key] ? 'border-red-500' : 'border-gray-300'
                              }`}
                              value={st?.stringValue || ""}
                              onChange={e => onAttrChange(t.key, e.target.value)}
                            />
                          ) : (
                            <input
                              type="number"
                              step="any"
                              placeholder="VD: 3.6, 4.8, 2133..."
                              className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                attrErrors[t.key] ? 'border-red-500' : 'border-gray-300'
                              }`}
                              value={st?.numberValue ?? ""}
                              onChange={e => onAttrChange(t.key, e.target.value)}
                            />
                          )}
                          {attrErrors[t.key] && (
                            <p className="text-sm text-red-600 font-medium mt-1.5">⚠️ {attrErrors[t.key]}</p>
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
            className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Hủy bỏ
          </Link>
          
          <button
            onClick={handleSave}
            disabled={saving || uploading || !imageUrl}
            className="px-8 py-3 text-sm font-semibold text-white bg-green rounded-lg hover:bg-green-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
          >
            {uploading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Đang upload ảnh...
              </span>
            ) : saving ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Đang lưu...
              </span>
            ) : (
              "✓ Tạo sản phẩm"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
