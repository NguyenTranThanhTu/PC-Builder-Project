"use client";
import { useEffect, useState } from 'react';

interface CompatibilityIssue { code: string; message: string; severity?: string }
interface CompatibilitySuggestion { message: string; relatedAttributeKeys?: string[] }

interface Props {
  productId: string;
  productName: string;
}

// LocalStorage key for a lightweight build list
const BUILD_KEY = 'pc-build-list';

function loadBuild(): string[] {
  if (typeof window === 'undefined') return [];
  try { const raw = localStorage.getItem(BUILD_KEY); return raw ? JSON.parse(raw) : []; } catch { return []; }
}
function saveBuild(ids: string[]) { try { localStorage.setItem(BUILD_KEY, JSON.stringify(ids)); } catch {} }

export default function CompatibilityAssistant({ productId, productName }: Props) {
  const [buildList, setBuildList] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [issues, setIssues] = useState<CompatibilityIssue[]>([]);
  const [suggestions, setSuggestions] = useState<CompatibilitySuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => { setBuildList(loadBuild()); }, []);

  const inBuild = buildList.includes(productId);

  const toggleInBuild = () => {
    setBuildList(prev => {
      const next = inBuild ? prev.filter(id => id !== productId) : [...prev, productId];
      saveBuild(next); return next;
    });
  };

  const evaluate = async () => {
    setLoading(true); setError(null); setIssues([]); setSuggestions([]);
    try {
      const res = await fetch('/api/compatibility/evaluate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productIds: buildList }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Đánh giá thất bại');
      setIssues(data.issues || []); setSuggestions(data.suggestions || []); setOpen(true);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="mt-8 border-t pt-6">
      <h2 className="text-lg font-semibold mb-3">Tương thích linh kiện</h2>
      <p className="text-xs text-gray-600 mb-4">Thêm các sản phẩm bạn xem vào &quot;build list&quot; tạm thời và chạy kiểm tra tương thích cơ bản (CPU ↔ Mainboard, GPU ↔ Case, PSU ↔ CPU/GPU...).</p>
      <div className="flex flex-wrap gap-3 items-center mb-4">
        <button
          onClick={toggleInBuild}
          className={`px-4 py-2 rounded text-sm font-medium ${
            inBuild
              ? 'bg-green text-white hover:bg-green-dark'
              : 'bg-blue text-white hover:bg-blue-dark'
          }`}
        >
          {inBuild ? 'Đã thêm vào build' : 'Thêm vào build'}
        </button>
        <button
          onClick={evaluate}
          disabled={buildList.length === 0 || loading}
          className="px-4 py-2 rounded bg-green text-white text-sm hover:bg-green-dark disabled:opacity-50"
        >
          {loading ? 'Đang đánh giá...' : 'Đánh giá tương thích'}
        </button>
        <span className="text-[11px] text-gray-500">Build hiện có: {buildList.length} sản phẩm</span>
      </div>
      {error && <div className="text-xs text-red-600 mb-2">{error}</div>}
      {open && (
        <div className="mt-4 bg-white border rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold">Kết quả tương thích</h3>
            <button onClick={() => setOpen(false)} className="text-[11px] text-blue">Đóng</button>
          </div>
          <div className="space-y-3 max-h-64 overflow-auto">
            {issues.length === 0 && suggestions.length === 0 && (
              <p className="text-xs text-gray-500">Không có vấn đề hoặc gợi ý đáng chú ý.</p>
            )}
            {issues.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-1">Vấn đề:</p>
                <ul className="space-y-1">
                  {issues.map((i, idx) => (
                    <li key={idx} className="text-xs text-red-600">• {i.message}</li>
                  ))}
                </ul>
              </div>
            )}
            {suggestions.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-1">Gợi ý:</p>
                <ul className="space-y-1">
                  {suggestions.map((s, idx) => (
                    <li key={idx} className="text-xs text-green-700">• {s.message}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
