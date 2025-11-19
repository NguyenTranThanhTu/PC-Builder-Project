"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Trang chủ", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
      <path d="M3 10.5L12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-10.5z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    </svg>
  )},
  { href: "/admin/products", label: "Sản phẩm", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
      <path d="M3 7l9-4 9 4-9 4-9-4zm0 4l9 4 9-4M3 15l9 4 9-4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    </svg>
  )},
  { href: "/admin/categories", label: "Danh mục", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
      <path d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 7v-7h7v7h-7z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    </svg>
  )},
  { href: "/admin/orders", label: "Đơn hàng", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
      <path d="M6 6h15l-1.5 9H7.5L6 6zM6 6l-2-2H1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <circle cx="9" cy="20" r="1" fill="currentColor"/>
      <circle cx="18" cy="20" r="1" fill="currentColor"/>
    </svg>
  )},
  { href: "/admin/reviews", label: "Đánh giá", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    </svg>
  )},
  { href: "/admin/banner", label: "Banner/Trang chủ", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
      <path d="M4 6h16v12H4zM4 10h16" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    </svg>
  )},
  { href: "/admin/media", label: "Media", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
      <path d="M4 5h16v14H4zM4 15l4-4 3 3 5-5 4 4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    </svg>
  )},
  { href: "/admin/settings", label: "Cài đặt", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
      <path d="M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm8.94 4a8.94 8.94 0 0 0-.21-1.96l2.02-1.57-2-3.46-2.45.99a9.05 9.05 0 0 0-3.39-1.96L14.5 1h-5l-.41 3.08a9.05 9.05 0 0 0-3.39 1.96l-2.45-.99-2 3.46 2.02 1.57A8.94 8.94 0 0 0 3.06 12c0 .66.07 1.3.21 1.96L1.25 15.5l2 3.46 2.45-.99a9.05 9.05 0 0 0 3.39 1.96L9.5 23h5l.41-3.08a9.05 9.05 0 0 0 3.39-1.96l2.45.99 2-3.46-2.02-1.57c.14-.65.21-1.3.21-1.96z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
    </svg>
  )},
];

export default function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="h-full">
      <div className="sticky top-4">
        <div className="bg-white rounded-xl shadow-1 p-3">
          <ul className="flex flex-col gap-1">
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm border ease-out duration-200 ${
                      active
                        ? "bg-blue text-white border-blue"
                        : "bg-white text-dark border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-current">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </aside>
  );
}
