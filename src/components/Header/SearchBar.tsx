"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { formatVnd } from "@/lib/formatVnd";

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  category: string;
  categorySlug: string;
}

interface SearchBarProps {
  selectedCategory?: string;
}

export default function SearchBar({ selectedCategory = "all" }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Debounce search
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const categoryParam = selectedCategory !== "all" ? `&category=${selectedCategory}` : "";
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(query)}&limit=8${categoryParam}`);
        const data = await res.json();
        setResults(data);
        setIsOpen(true);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300); // Debounce 300ms

    return () => clearTimeout(timer);
  }, [query, selectedCategory]); // Thêm selectedCategory dependency

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen || results.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0) {
            handleSelectProduct(results[selectedIndex]);
          }
          break;
        case "Escape":
          setIsOpen(false);
          setSelectedIndex(-1);
          break;
      }
    },
    [isOpen, results, selectedIndex]
  );

  const handleSelectProduct = (product: SearchResult) => {
    router.push(`/shop/${product.slug}`);
    setQuery("");
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Navigate to full search results page (optional)
      router.push(`/shop-with-sidebar?search=${encodeURIComponent(query)}`);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative max-w-[333px] sm:min-w-[333px] w-full" ref={dropdownRef}>
      <form onSubmit={handleSubmit}>
        {/* Divider */}
        <span className="absolute left-0 top-1/2 -translate-y-1/2 inline-block w-px h-5.5 bg-gray-4 z-10"></span>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tìm sản phẩm..."
          autoComplete="off"
          className="custom-search w-full rounded-r-[5px] bg-gray-1 !border-l-0 border border-gray-3 py-2.5 pl-4 pr-10 outline-none ease-in duration-200 focus:border-blue"
        />

        <button
          type="submit"
          aria-label="Search"
          className="flex items-center justify-center absolute right-3 top-1/2 -translate-y-1/2 ease-in duration-200 hover:text-blue"
        >
          {isLoading ? (
            <svg
              className="animate-spin h-4 w-4 text-blue"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            <svg
              className="fill-current"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M17.2687 15.6656L12.6281 11.8969C14.5406 9.28123 14.3437 5.5406 11.9531 3.1781C10.6875 1.91248 8.99995 1.20935 7.19995 1.20935C5.39995 1.20935 3.71245 1.91248 2.44683 3.1781C-0.168799 5.79373 -0.168799 10.0687 2.44683 12.6844C3.71245 13.95 5.39995 14.6531 7.19995 14.6531C8.91558 14.6531 10.5187 14.0062 11.7843 12.8531L16.4812 16.65C16.5937 16.7344 16.7343 16.7906 16.875 16.7906C17.0718 16.7906 17.2406 16.7062 17.3531 16.5656C17.5781 16.2844 17.55 15.8906 17.2687 15.6656ZM7.19995 13.3875C5.73745 13.3875 4.38745 12.825 3.34683 11.7844C1.20933 9.64685 1.20933 6.18748 3.34683 4.0781C4.38745 3.03748 5.73745 2.47498 7.19995 2.47498C8.66245 2.47498 10.0125 3.03748 11.0531 4.0781C13.1906 6.2156 13.1906 9.67498 11.0531 11.7844C10.0406 12.825 8.66245 13.3875 7.19995 13.3875Z"
                fill=""
              />
            </svg>
          )}
        </button>
      </form>

      {/* Dropdown Results */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-3 rounded-lg shadow-lg max-h-[400px] overflow-y-auto z-50">
          {results.map((product, index) => (
            <button
              key={product.id}
              onClick={() => handleSelectProduct(product)}
              className={`w-full flex items-center gap-3 p-3 hover:bg-gray-1 transition-colors border-b border-gray-2 last:border-b-0 text-left ${
                index === selectedIndex ? "bg-gray-1" : ""
              }`}
            >
              {/* Product Image */}
              <div className="relative w-12 h-12 flex-shrink-0 bg-gray-1 rounded overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-dark truncate">
                  {product.name}
                </h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-6">{product.category}</span>
                  <span className="text-xs font-semibold text-blue">
                    {formatVnd(product.price)}
                  </span>
                </div>
              </div>

              {/* Arrow Icon */}
              <svg
                className="w-4 h-4 text-gray-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          ))}
        </div>
      )}

      {/* No Results */}
      {isOpen && !isLoading && query.length >= 2 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-3 rounded-lg shadow-lg p-4 z-50">
          <p className="text-sm text-gray-6 text-center">
            Không tìm thấy sản phẩm &quot;{query}&quot;
          </p>
        </div>
      )}
    </div>
  );
}
