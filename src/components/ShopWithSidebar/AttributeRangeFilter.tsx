"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface Props {
  attrKey: string; // e.g. GPU_VRAM_GB
  label: string; // e.g. VRAM (GB)
  min?: number;
  max?: number;
  step?: number;
}

const AttributeRangeFilter = ({ attrKey, label, min = 0, max = 64, step = 1 }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const paramMinName = `attr_${attrKey}_min`;
  const paramMaxName = `attr_${attrKey}_max`;
  const [localMin, setLocalMin] = useState<number | ''>('');
  const [localMax, setLocalMax] = useState<number | ''>('');
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    const spMin = searchParams.get(paramMinName);
    const spMax = searchParams.get(paramMaxName);
    setLocalMin(spMin ? Number(spMin) : '');
    setLocalMax(spMax ? Number(spMax) : '');
  }, [searchParams, paramMinName, paramMaxName]);

  const push = (nextMin: number | '', nextMax: number | '') => {
    const params = new URLSearchParams(searchParams.toString());
    if (nextMin === '' || isNaN(Number(nextMin))) params.delete(paramMinName); else params.set(paramMinName, String(nextMin));
    if (nextMax === '' || isNaN(Number(nextMax))) params.delete(paramMaxName); else params.set(paramMaxName, String(nextMax));
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const onChange = (which: 'min' | 'max', value: string) => {
    const num = value === '' ? '' : Number(value);
    if (which === 'min') setLocalMin(num === '' ? '' : num);
    else setLocalMax(num === '' ? '' : num);
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      push(which === 'min' ? num : localMin, which === 'max' ? num : localMax);
    }, 300);
  };

  const clear = () => {
    setLocalMin('');
    setLocalMax('');
    push('', '');
  };

  return (
    <div className="bg-white shadow-1 rounded-lg">
      <div className="flex items-center justify-between py-3 pl-6 pr-5.5">
        <p className="text-dark">{label}</p>
        <button type="button" onClick={clear} className="text-custom-xs text-blue">Clear</button>
      </div>
      <div className="px-6 pb-5 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <label className="text-[11px] text-gray-600" htmlFor={`${attrKey}-min`}>Min</label>
          <input
            id={`${attrKey}-min`}
            type="number"
            min={min}
            max={max}
            step={step}
            value={localMin}
            onChange={e => onChange('min', e.target.value)}
            className="w-24 border rounded px-2 py-1 text-xs"
            placeholder="--"
          />
          <label className="text-[11px] text-gray-600" htmlFor={`${attrKey}-max`}>Max</label>
          <input
            id={`${attrKey}-max`}
            type="number"
            min={min}
            max={max}
            step={step}
            value={localMax}
            onChange={e => onChange('max', e.target.value)}
            className="w-24 border rounded px-2 py-1 text-xs"
            placeholder="--"
          />
        </div>
      </div>
    </div>
  );
};

export default AttributeRangeFilter;