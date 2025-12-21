import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const PriceDropdown = () => {
  const [toggleDropdown, setToggleDropdown] = useState(true);

  // Read/write URL params: priceMin/priceMax (currency units)
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const PRICE_MIN = 0;
  const PRICE_MAX = 100_000_000; // 100M VND

  // Local input states
  const [minInput, setMinInput] = useState('');
  const [maxInput, setMaxInput] = useState('');
  
  const debounceRef = useRef<number | null>(null);

  // Sync with URL params
  useEffect(() => {
    const min = searchParams.get('priceMin');
    const max = searchParams.get('priceMax');
    setMinInput(min ? Number(min).toLocaleString('vi-VN') : '');
    setMaxInput(max ? Number(max).toLocaleString('vi-VN') : '');
  }, [searchParams]);

  const pushRangeToUrl = (from: string, to: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Parse Vietnamese number format
    const minVal = from ? Number(from.replace(/\./g, '')) : null;
    const maxVal = to ? Number(to.replace(/\./g, '')) : null;
    
    if (minVal && !isNaN(minVal) && minVal >= PRICE_MIN) {
      params.set('priceMin', String(minVal));
    } else {
      params.delete('priceMin');
    }
    
    if (maxVal && !isNaN(maxVal) && maxVal <= PRICE_MAX) {
      params.set('priceMax', String(maxVal));
    } else {
      params.delete('priceMax');
    }
    
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleInputChange = (which: 'min' | 'max', value: string) => {
    // Only allow numbers
    const cleaned = value.replace(/[^\d]/g, '');
    const formatted = cleaned ? Number(cleaned).toLocaleString('vi-VN') : '';
    
    if (which === 'min') {
      setMinInput(formatted);
    } else {
      setMaxInput(formatted);
    }

    // Debounce URL update
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      pushRangeToUrl(
        which === 'min' ? formatted : minInput,
        which === 'max' ? formatted : maxInput
      );
    }, 800);
  };

  const applyQuickRange = (min: number, max: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('priceMin', String(min));
    params.set('priceMax', String(max));
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const clearFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('priceMin');
    params.delete('priceMax');
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Common price ranges for PC parts
  const quickRanges = [
    { label: 'Under 1M', min: 0, max: 1_000_000 },
    { label: '1M - 5M', min: 1_000_000, max: 5_000_000 },
    { label: '5M - 10M', min: 5_000_000, max: 10_000_000 },
    { label: '10M - 20M', min: 10_000_000, max: 20_000_000 },
    { label: '20M - 50M', min: 20_000_000, max: 50_000_000 },
    { label: 'Over 50M', min: 50_000_000, max: PRICE_MAX },
  ];

  const hasActiveFilter = searchParams.get('priceMin') || searchParams.get('priceMax');

  return (
    <div className="bg-white shadow-1 rounded-lg">
      <div
        onClick={() => setToggleDropdown(!toggleDropdown)}
        className="cursor-pointer flex items-center justify-between py-3 pl-6 pr-5.5"
      >
        <p className="text-dark font-medium">Price Range</p>
        <div className="flex items-center gap-2">
          {hasActiveFilter && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                clearFilter();
              }}
              className="text-xs text-blue hover:text-blue-dark"
            >
              Clear
            </button>
          )}
          <button
            onClick={() => setToggleDropdown(!toggleDropdown)}
            id="price-dropdown-btn"
            aria-label="button for price dropdown"
            className={`text-dark ease-out duration-200 ${
              toggleDropdown && 'rotate-180'
            }`}
          >
            <svg
              className="fill-current"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M4.43057 8.51192C4.70014 8.19743 5.17361 8.161 5.48811 8.43057L12 14.0122L18.5119 8.43057C18.8264 8.16101 19.2999 8.19743 19.5695 8.51192C19.839 8.82642 19.8026 9.29989 19.4881 9.56946L12.4881 15.5695C12.2072 15.8102 11.7928 15.8102 11.5119 15.5695L4.51192 9.56946C4.19743 9.29989 4.161 8.82641 4.43057 8.51192Z"
                fill=""
              />
            </svg>
          </button>
        </div>
      </div>

      <div className={`px-6 pb-6 ${toggleDropdown ? 'block' : 'hidden'}`}>
        {/* Manual Input */}
        <div className="mb-5">
          <label className="block text-xs text-gray-600 mb-2">Enter Price Range</label>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">₫</span>
                <input
                  type="text"
                  value={minInput}
                  onChange={(e) => handleInputChange('min', e.target.value)}
                  placeholder="Min"
                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-3 rounded-md focus:outline-none focus:border-blue"
                />
              </div>
            </div>
            <span className="text-gray-400">-</span>
            <div className="flex-1">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">₫</span>
                <input
                  type="text"
                  value={maxInput}
                  onChange={(e) => handleInputChange('max', e.target.value)}
                  placeholder="Max"
                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-3 rounded-md focus:outline-none focus:border-blue"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Range Buttons */}
        <div>
          <label className="block text-xs text-gray-600 mb-3">Quick Select</label>
          <div className="grid grid-cols-2 gap-2">
            {quickRanges.map((range, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyQuickRange(range.min, range.max)}
                className="px-3 py-2 text-xs border border-gray-3 rounded-md hover:bg-blue hover:text-white hover:border-blue transition-colors duration-200"
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceDropdown;
