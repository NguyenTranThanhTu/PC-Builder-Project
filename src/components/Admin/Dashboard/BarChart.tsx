"use client";
import React from "react";
import { formatVnd, shortNumber } from "./format";

export type BarDatum = { label: string; value: number; color?: string };

export default function BarChart({
  title = "Biểu đồ doanh thu",
  data,
  height = 280,
}: {
  title?: string;
  data: BarDatum[];
  height?: number;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const ticks = 5; // 0..max split
  const step = max / ticks;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-dark">{title}</h3>
        <div className="text-gray-500 text-sm" aria-hidden>
          {/* legend slot in future */}
        </div>
      </div>
      <div className="grid grid-cols-[60px_1fr] gap-2" style={{ minHeight: height }}>
        {/* y-axis */}
        <div className="flex flex-col justify-between text-right pr-2 text-gray-500 text-xs">
          {Array.from({ length: ticks + 1 }).map((_, i) => {
            const v = i * step;
            return <div key={i}>{shortNumber(v)}</div>;
          })}
        </div>
        {/* chart area */}
        <div className="relative border-l border-gray-200">
          <div className="absolute inset-0 flex items-end gap-6 px-4">
            {data.map((d) => {
              const h = (d.value / max) * (height - 20);
              return (
                <div key={d.label} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-12 rounded-t bg-blue relative group"
                    style={{ height: Math.max(2, h), backgroundColor: d.color || "#22C55E" }}
                  >
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 rounded bg-gray-900 text-white text-[11px] opacity-0 group-hover:opacity-100">
                      {d.label}: {formatVnd(d.value)}
                    </div>
                  </div>
                  <div className="text-[12px] text-gray-600 mt-2 text-center">{d.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
