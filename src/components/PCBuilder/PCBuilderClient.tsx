
"use client";
import React, { useEffect, useMemo, useState } from "react";
import { formatVnd } from "@/lib/formatVnd";
import { useAppDispatch } from "@/redux/useAppDispatch";
import { addItemToCart, removeItemFromCart, updateCartItemQuantity } from "@/redux/features/cart-slice";
import { useAppSelector } from "@/redux/store";
import { CpuChipIcon, DevicePhoneMobileIcon, ServerStackIcon, BoltIcon, RectangleStackIcon, CubeTransparentIcon, Squares2X2Icon, FireIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

type SimpleProduct = {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  imageUrl?: string | null;
  imageBlurData?: string | null;
};


const TARGET_CATEGORIES = [
  "cpu",
  "mainboard",
  "gpu",
  "ram",
  "psu",
  "case",
  "storage",
  "cooler",
];

const CATEGORY_ICONS: Record<string, any> = {
  cpu: CpuChipIcon,
  mainboard: ServerStackIcon,
  gpu: Squares2X2Icon, // Dùng icon lưới cho GPU (tượng trưng cho đa nhân/đa luồng)
  ram: RectangleStackIcon, // RAM dùng RectangleStackIcon
  psu: BoltIcon,
  case: CubeTransparentIcon,
  storage: RectangleStackIcon, // Storage dùng RectangleStackIcon (ổ cứng dạng stack)
  cooler: FireIcon,
};

function price(p: SimpleProduct) {
  return (p.priceCents || 0) / 100;
}


export default function PCBuilderClient() {
  const dispatch = useAppDispatch();
  const [selected, setSelected] = useState<Record<string, SimpleProduct | null>>({});
  const [search, setSearch] = useState<Record<string, string>>({});
  const [searchResults, setSearchResults] = useState<Record<string, SimpleProduct[]>>({});
  const [suggestions, setSuggestions] = useState<Record<string, SimpleProduct[]>>({});
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const [checking, setChecking] = useState(false);
  const [issues, setIssues] = useState<{ message: string; leftProductId?: string; rightProductId?: string }[]>([]);
  const [checkResultOpen, setCheckResultOpen] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);

  const selectedIds = useMemo(
    () => Object.values(selected).filter(Boolean).map((p) => (p as SimpleProduct).id),
    [selected]
  );

  useEffect(() => {
    fetchSuggestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds.join(",")]);

  async function fetchSuggestions() {
    setLoadingSuggest(true);
    try {
      const res = await fetch("/api/compatibility/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds: selectedIds, maxPerCategory: 8 }),
      });
      const data = await res.json();
      setSuggestions(data.suggestions || {});
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSuggest(false);
    }
  }

  async function checkCompatibility() {
    setChecking(true);
    setCheckError(null);
    setIssues([]);
    setCheckResultOpen(false);
    try {
      const res = await fetch("/api/compatibility/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds: selectedIds }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Đánh giá thất bại");
      setIssues(data.issues || []);
      setCheckResultOpen(true);
    } catch (e: any) {
      setCheckError(e.message);
    } finally {
      setChecking(false);
    }
  }

  async function runSearch(slug: string) {
    const q = search[slug] || "";
    const url = new URL("/api/products", window.location.origin);
    url.searchParams.set("category", slug);
    if (q) url.searchParams.set("q", q);
    url.searchParams.set("pageSize", "20");
    const res = await fetch(url);
    const data = await res.json();
    setSearchResults((prev) => ({ ...prev, [slug]: data.items || [] }));
  }

  function selectProduct(slug: string, p: SimpleProduct) {
    // Chuyển đổi dữ liệu về đúng định dạng SimpleProduct nếu thiếu name hoặc priceCents
    const prod: any = p;
    const safeProduct: SimpleProduct = {
      id: prod.id,
      name: prod.name || prod.title || "Sản phẩm không tên",
      slug: prod.slug || prod.productSlug || "",
      priceCents: typeof prod.priceCents === "number" ? prod.priceCents : Math.round((prod.price || prod.discountedPrice || 0) * 100),
      imageUrl: prod.imageUrl || (prod.imgs?.thumbnails?.[0] ?? null),
      imageBlurData: prod.imageBlurData ?? null,
    };
    setSelected((prev) => ({ ...prev, [slug]: safeProduct }));
    // Đảm bảo id là string
    const idStr = String(safeProduct.id);
    // Debug chi tiết sản phẩm được chọn
    console.log('[PCBuilder] Chọn sản phẩm:', {
      id: safeProduct.id,
      name: safeProduct.name,
      priceCents: safeProduct.priceCents,
      imageUrl: safeProduct.imageUrl,
      slug: safeProduct.slug,
      full: safeProduct
    });
    if (!safeProduct.name) console.warn(`[PCBuilder] Sản phẩm thiếu tên:`, safeProduct);
    if (!safeProduct.priceCents && safeProduct.priceCents !== 0) console.warn(`[PCBuilder] Sản phẩm thiếu giá tiền:`, safeProduct);
    const cartItem = {
      id: idStr,
      title: safeProduct.name,
      price: safeProduct.priceCents / 100,
      discountedPrice: safeProduct.priceCents / 100,
      quantity: 1,
      imgs: safeProduct.imageUrl ? { thumbnails: [safeProduct.imageUrl], previews: [safeProduct.imageUrl] } : undefined,
      productId: idStr,
    };
    console.log('[PCBuilder] Dispatch addItemToCart:', cartItem);
    dispatch(addItemToCart(cartItem));
    setTimeout(() => {
      // Type guard for Redux DevTools Extension
      const devtools = (window as any).__REDUX_DEVTOOLS_EXTENSION__;
      const state = devtools ? devtools.getState() : null;
      console.log('[PCBuilder] State sau khi thêm vào cart:', state);
    }, 500);
  }
  const cartItems = useAppSelector(state => state.cartReducer.items);
  function clearProduct(slug: string, id: string) {
    setSelected((prevState) => ({ ...prevState, [slug]: null }));
    const cartItemId = String(id);
    const found = cartItems.find(item => item.id === cartItemId);
    if (found && found.quantity > 1) {
      dispatch(updateCartItemQuantity({ id: cartItemId, quantity: found.quantity - 1 }));
    } else if (found) {
      dispatch(removeItemFromCart(cartItemId));
    }
  }

  // Progress bar tính phần trăm đã chọn
  const progress = Math.round((selectedIds.length / TARGET_CATEGORIES.length) * 100);

  // NOTE: Chỉ sử dụng các màu đã định nghĩa trong tailwind.config.ts (vd: from-blue, to-blue-dark, from-green, to-blue, v.v.).
  // Nếu dùng màu không có trong config (vd: from-blue-500, to-cyan-500, to-purple-600, v.v.), Tailwind sẽ fallback về trắng hoặc không render gradient đúng.
  // Nguyên nhân các nút/icon bị trắng là do dùng class màu không tồn tại trong config custom.
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-dark via-blue to-blue-light py-12 px-2 md:px-0 flex flex-col items-center">
      <div className="max-w-4xl w-full mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow">PC Builder</h1>
        <p className="text-lg text-indigo-100 mb-6">Chọn linh kiện theo từng nhóm. Hệ thống sẽ gợi ý các linh kiện còn thiếu và đảm bảo tương thích.</p>

        {/* Progress bar */}
        <div className="w-full bg-white/20 rounded-full h-4 mb-8 shadow-inner">
          <div className="bg-gradient-to-r from-green to-blue h-4 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {TARGET_CATEGORIES.map((slug) => {
            const sel = selected[slug];
            const Icon = CATEGORY_ICONS[slug] || CubeTransparentIcon;
            // Kiểm tra trạng thái tương thích cho từng nhóm
              let statusIcon = null;
              let statusColor = "";
            if (sel) {
              // Nếu không có lỗi liên quan đến nhóm này => check xanh
              const hasIssue = issues.some(i => {
                if (!i.leftProductId && !i.rightProductId) return false;
                return (
                  (sel.id && (i.leftProductId === sel.id || i.rightProductId === sel.id))
                );
              });
              if (hasIssue) {
                statusIcon = <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" title="Có vấn đề tương thích" />;
                statusColor = "ring-2 ring-yellow-400";
              } else {
                statusIcon = <CheckCircleIcon className="w-5 h-5 text-green-500" title="Tương thích" />;
                statusColor = "ring-2 ring-green-400";
              }
            }
            // Determine highlight color for selected product
            let cardBg = 'bg-white/70 backdrop-blur border-blue-100 hover:border-blue-400';
            if (sel) {
              const hasIssue = issues.some(i => {
                if (!i.leftProductId && !i.rightProductId) return false;
                return (
                  (sel.id && (i.leftProductId === sel.id || i.rightProductId === sel.id))
                );
              });
              if (hasIssue) {
                cardBg = 'bg-gradient-to-br from-red-light to-red/80 border-red';
              } else {
                cardBg = 'bg-gradient-to-br from-green-light to-green/80 border-green';
              }
            }
            return (
              <div
                key={slug}
                className={`rounded-2xl shadow-2xl p-5 flex flex-col gap-2 border transition-all duration-300 group relative overflow-hidden animate-fade-in ${cardBg}`}
              >
                <div className="flex items-center gap-3 mb-2">
                      <span className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-700 text-white shadow-2xl border-2 border-blue-400 group-hover:scale-110 transition-transform duration-300 relative z-10 ${statusColor}`}
                        style={{ boxShadow: '0 6px 24px 0 rgba(30,64,175,0.22)' }}
                    title={sel ? (statusIcon ? (statusColor.includes('green') ? 'Tương thích' : 'Có vấn đề tương thích') : '') : 'Chưa chọn'}
                  >
                    <Icon className="w-7 h-7 drop-shadow" />
                    {sel && statusIcon && (
                      <span className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-lg z-20 border border-blue-200">
                        {statusIcon}
                      </span>
                    )}
                  </span>
                  <h3 className="text-xl font-semibold text-gray-800 tracking-wide uppercase">{slug}</h3>
                  {sel && (
                    <button
                      className="ml-auto px-2 py-1 rounded bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-semibold hover:brightness-110 transition shadow-lg border border-red-200"
                      onClick={() => sel && clearProduct(slug, sel.id)}
                      title="Bỏ chọn linh kiện"
                      style={{ zIndex: 10 }}
                    >Xóa</button>
                  )}
                </div>
                <div className="flex-1">
                  {sel ? (
                    <div className="flex items-center gap-3 animate-fade-in">
                      {sel.imageUrl && (
                        <img src={sel.imageUrl} alt={sel.name} className="w-14 h-14 object-contain rounded-lg border bg-gray-50" />
                      )}
                      <div>
                        <div className="text-base font-medium text-gray-900">{sel.name}</div>
                        <div className="text-xs text-gray-500">{formatVnd(price(sel))}</div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-2 mb-2">
                        <input
                          placeholder={`Tìm ${slug}...`}
                          className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-300 outline-none"
                          value={search[slug] || ""}
                          onChange={(e) => setSearch((p) => ({ ...p, [slug]: e.target.value }))}
                          title={`Tìm kiếm ${slug}`}
                        />
                        <button className="px-3 py-2 rounded-full bg-gradient-to-r from-blue to-cyan text-white font-bold shadow-lg border-2 border-blue-light hover:scale-105 hover:shadow-blue/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue" onClick={() => runSearch(slug)} title="Tìm linh kiện">Tìm</button>
                      </div>
                      <div className="grid grid-cols-1 gap-2 max-h-48 overflow-auto">
                        {(searchResults[slug] || []).map((p) => {
                          const prod: any = p;
                          const safeProduct: SimpleProduct = {
                            id: prod.id,
                            name: prod.name || prod.title || "Sản phẩm không tên",
                            slug: prod.slug || prod.productSlug || "",
                            priceCents: typeof prod.priceCents === "number" ? prod.priceCents : Math.round((prod.price || prod.discountedPrice || 0) * 100),
                            imageUrl: prod.imageUrl || (prod.imgs?.thumbnails?.[0] ?? null),
                            imageBlurData: prod.imageBlurData ?? null,
                          };
                          return (
                            <button key={safeProduct.id} onClick={() => selectProduct(slug, safeProduct)} className="flex items-center gap-3 text-left border rounded p-2 hover:bg-blue-50 transition group animate-fade-in" title={`Chọn ${safeProduct.name}`}>
                              <img src={safeProduct.imageUrl || "/images/products/product-1-sm-1.png"} className="w-12 h-12 object-cover rounded" />
                              <div>
                                <div className="text-sm font-medium text-gray-800">{safeProduct.name}</div>
                                <div className="text-xs text-gray-500">{formatVnd(safeProduct.priceCents / 100)}</div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      {/* Gợi ý linh kiện nếu có */}
                      {suggestions[slug]?.length ? (
                        <div className="mt-3">
                          <div className="text-sm font-medium mb-1 text-blue-700">Gợi ý</div>
                          <div className="grid grid-cols-1 gap-2">
                            {suggestions[slug].map((p) => (
                              <button key={p.id} onClick={() => selectProduct(slug, p)} className="flex items-center gap-3 text-left border rounded p-2 hover:bg-green-50 transition group animate-fade-in" title={`Chọn gợi ý ${p.name}`}>
                                <img src={p.imageUrl || "/images/products/product-1-sm-1.png"} className="w-12 h-12 object-cover rounded" />
                                <div>
                                  <div className="text-sm font-medium text-gray-800">{p.name}</div>
                                  <div className="text-xs text-gray-500">{formatVnd(price(p))}</div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex flex-col gap-3 items-center">
          <div className="flex items-center gap-3">
            <button className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-dark to-blue text-white font-bold shadow-2xl hover:scale-105 hover:shadow-blue-dark/50 transition-all duration-200 border-2 border-blue-dark focus:outline-none focus:ring-2 focus:ring-blue-dark" onClick={fetchSuggestions} disabled={loadingSuggest}>
              {loadingSuggest ? "Đang gợi ý..." : "Làm mới gợi ý"}
            </button>
            <button
              className={`px-5 py-2 rounded-full font-bold shadow-2xl transition-all duration-200 border-2 focus:outline-none focus:ring-2
                ${checking ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-yellow-400 focus:ring-yellow-400' :
                  checkResultOpen ? (issues.length === 0
                    ? 'bg-gradient-to-r from-green to-green-light text-white border-green focus:ring-green'
                    : 'bg-gradient-to-r from-red to-red-light text-white border-red focus:ring-red')
                  : 'bg-gradient-to-r from-purple to-blue-dark text-white border-purple focus:ring-purple'}
                hover:scale-105`}
              onClick={checkCompatibility}
              disabled={checking || selectedIds.length < 2}
            >
              {checking ? "Đang kiểm tra..." : "Kiểm tra tương thích"}
            </button>
            <span className="text-base text-white font-medium drop-shadow">Đã chọn: {selectedIds.length} / {TARGET_CATEGORIES.length}</span>
          </div>
          {checkError && <div className="text-xs text-red-200 mt-1">{checkError}</div>}
          {checkResultOpen && (
            <div className="mt-4 bg-white/95 border-l-4 border-blue-400 rounded-xl p-5 shadow-xl w-full max-w-2xl animate-fade-in">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-blue-700 flex items-center gap-2"><BoltIcon className="w-5 h-5 text-blue-400" />Kết quả tương thích</h3>
                <button onClick={() => setCheckResultOpen(false)} className="text-[13px] text-blue-500 hover:underline">Đóng</button>
              </div>
              {issues.length === 0 ? (
                <div className="text-green-700 text-base flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-full bg-green-400 animate-pulse"></span>Tất cả linh kiện đã chọn đều tương thích!</div>
              ) : (
                <div>
                  <p className="text-sm font-medium mb-1 text-red-600 flex items-center gap-2"><FireIcon className="w-4 h-4 text-red-400" />Vấn đề:</p>
                  <ul className="space-y-1">
                    {issues.map((i, idx) => (
                      <li key={idx} className="text-sm text-red-600 flex items-center gap-2"><span className="inline-block w-2 h-2 rounded-full bg-red-400"></span>{i.message}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

