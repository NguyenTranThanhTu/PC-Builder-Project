"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Trang chủ" },
  { href: "/admin/products", label: "Sản phẩm" },
  { href: "/admin/categories", label: "Danh mục" },
  { href: "/admin/orders", label: "Đơn hàng" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/coupons", label: "Mã giảm giá" },
  { href: "/admin/vip-config", label: "VIP Tier" },
  { href: "/admin/reviews", label: "Đánh giá" },
  { href: "/admin/settings", label: "Cài đặt" },
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="w-full overflow-x-auto">
      <ul className="flex gap-2 md:gap-3 whitespace-nowrap">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`inline-flex items-center px-3 py-2 rounded-md border text-sm ease-out duration-200 ${
                  active
                    ? "bg-blue text-white border-blue"
                    : "bg-white text-dark border-gray-200 hover:bg-gray-50"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
