"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface Option { label: string; value: string }
interface Props {
  attrKey: string; // e.g., CPU_SOCKET
  label: string;   // e.g., CPU Socket
  options: Option[];
}

const AttributeSelectFilter = ({ attrKey, label, options }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const paramName = `attr_${attrKey}`;

  const [current, setCurrent] = useState<string | null>(null);

  useEffect(() => {
    setCurrent(searchParams.get(paramName));
  }, [searchParams, paramName]);

  const apply = (val: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val) params.set(paramName, val); else params.delete(paramName);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="bg-white shadow-1 rounded-lg">
      <div className="flex items-center justify-between py-3 pl-6 pr-5.5">
        <p className="text-dark">{label}</p>
        {current && (
          <button type="button" onClick={() => apply(null)} className="text-custom-xs text-blue">Clear</button>
        )}
      </div>
      <div className="px-6 pb-4 flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => apply(opt.value)}
            className={`px-3 py-1.5 rounded text-xs border duration-200 ${
              current === opt.value
                ? "bg-blue text-white border-blue"
                : "bg-white border-gray-3 hover:bg-blue hover:text-white hover:border-blue"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AttributeSelectFilter;
