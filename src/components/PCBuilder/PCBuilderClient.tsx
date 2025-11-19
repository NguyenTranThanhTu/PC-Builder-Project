"use client";
import React, { useEffect, useMemo, useState } from "react";

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

function price(p: SimpleProduct) {
  return (p.priceCents || 0) / 100;
}

export default function PCBuilderClient() {
  const [selected, setSelected] = useState<Record<string, SimpleProduct | null>>({});
  const [search, setSearch] = useState<Record<string, string>>({});
  const [searchResults, setSearchResults] = useState<Record<string, SimpleProduct[]>>({});
  const [suggestions, setSuggestions] = useState<Record<string, SimpleProduct[]>>({});
  const [loadingSuggest, setLoadingSuggest] = useState(false);

  const selectedIds = useMemo(
    () => Object.values(selected).filter(Boolean).map((p) => (p as SimpleProduct).id),
    [selected]
  );

  useEffect(() => {
    // Auto fetch suggestions whenever selected changes
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
    setSelected((prev) => ({ ...prev, [slug]: p }));
  }
  function clearProduct(slug: string) {
    setSelected((prev) => ({ ...prev, [slug]: null }));
  }

  return (
    <div className="container py-8 md:py-12" style={{ marginTop: '80px', minHeight: '80vh' }}>
      <h1 className="text-heading-4 font-semibold mb-4">PC Builder</h1>
      <p className="text-body mb-6">Chọn linh kiện theo từng nhóm. Hệ thống sẽ gợi ý các linh kiện còn thiếu và đảm bảo tương thích.</p>

      <div className="grid md:grid-cols-2 gap-4">
        {TARGET_CATEGORIES.map((slug) => {
          const sel = selected[slug];
          return (
            <div key={slug} className="bg-white rounded-xl shadow-1 p-4">
              <div className="flex flex-col gap-1 mb-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-custom-xl font-medium whitespace-nowrap">{slug.toUpperCase()}</h3>
                  {sel && (
                    <button
                      className="ml-2 px-3 py-1 text-xs rounded shadow font-semibold bg-red hover:bg-red-dark text-white transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-300 border border-red"
                      style={{ marginTop: 0, minWidth: 70 }}
                      onClick={() => clearProduct(slug)}
                    >
                      Bỏ chọn
                    </button>
                  )}
                </div>
              </div>
              {sel ? (
                <div className="flex items-center gap-3">
                  <img src={sel.imageUrl || "/images/products/product-1-sm-1.png"} alt="" className="w-14 h-14 object-cover rounded" />
                  <div>
                    <div className="font-medium">{sel.name}</div>
                    <div className="text-sm text-dark-4">{price(sel).toLocaleString()} đ</div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex gap-2 mb-2">
                    <input
                      placeholder={`Tìm ${slug}...`}
                      className="border rounded px-3 py-2 w-full"
                      value={search[slug] || ""}
                      onChange={(e) => setSearch((p) => ({ ...p, [slug]: e.target.value }))}
                    />
                    <button className="px-3 py-2 rounded bg-blue hover:bg-blue-dark text-white font-semibold shadow" onClick={() => runSearch(slug)}>Tìm</button>
                  </div>
                  <div className="grid grid-cols-1 gap-2 max-h-64 overflow-auto">
                    {(searchResults[slug] || []).map((p) => (
                      <button key={p.id} onClick={() => selectProduct(slug, p)} className="flex items-center gap-3 text-left border rounded p-2 hover:bg-gray">
                        <img src={p.imageUrl || "/images/products/product-1-sm-1.png"} className="w-12 h-12 object-cover rounded" />
                        <div>
                          <div className="text-sm font-medium">{p.name}</div>
                          <div className="text-xs text-dark-4">{price(p).toLocaleString()} đ</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {/* Gợi ý linh kiện nếu có */}
              {!sel && suggestions[slug]?.length ? (
                <div className="mt-3">
                  <div className="text-sm font-medium mb-1">Gợi ý</div>
                  <div className="grid grid-cols-1 gap-2">
                    {suggestions[slug].map((p) => (
                      <button key={p.id} onClick={() => selectProduct(slug, p)} className="flex items-center gap-3 text-left border rounded p-2 hover:bg-gray">
                        <img src={p.imageUrl || "/images/products/product-1-sm-1.png"} className="w-12 h-12 object-cover rounded" />
                        <div>
                          <div className="text-sm font-medium">{p.name}</div>
                          <div className="text-xs text-dark-4">{price(p).toLocaleString()} đ</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      <div className="mt-6 flex items-center gap-3">
          <button className="px-4 py-2 rounded bg-green hover:bg-green-dark text-white font-semibold shadow" onClick={fetchSuggestions} disabled={loadingSuggest}>
          {loadingSuggest ? "Đang gợi ý..." : "Làm mới gợi ý"}
        </button>
        <span className="text-sm text-dark-4">Đã chọn: {selectedIds.length} / {TARGET_CATEGORIES.length}</span>
      </div>
    </div>
  );
}
