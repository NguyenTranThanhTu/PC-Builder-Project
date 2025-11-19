"use client";
import { ReactNode, useState } from "react";

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
}

// Simple hover/focus tooltip using Tailwind, no portal.
export function Tooltip({ content, children, side = "top" }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  return (
    <span
      className="relative inline-flex items-center group"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
      tabIndex={0}
    >
      {children}
      <span
        className={
          `pointer-events-none absolute z-20 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-[11px] text-white shadow transition-opacity duration-150 ${
            visible ? 'opacity-100' : 'opacity-0'
          } ` +
          (side === 'top'
            ? 'bottom-full mb-1 left-1/2 -translate-x-1/2'
            : side === 'bottom'
            ? 'top-full mt-1 left-1/2 -translate-x-1/2'
            : side === 'left'
            ? 'right-full mr-1 top-1/2 -translate-y-1/2'
            : 'left-full ml-1 top-1/2 -translate-y-1/2')
        }
        role="tooltip"
      >
        {content}
      </span>
    </span>
  );
}

export default Tooltip;
