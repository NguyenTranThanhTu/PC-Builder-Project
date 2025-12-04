"use client";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function ModernAdminNavbar() {
  const { data: session } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Mock notifications
  const notifications = [
    { id: 1, text: "Đơn hàng mới #1234", time: "2 phút trước", unread: true },
    { id: 2, text: "Đánh giá mới cho sản phẩm", time: "15 phút trước", unread: true },
    { id: 3, text: "Sản phẩm XYZ sắp hết hàng", time: "1 giờ trước", unread: false },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-3 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Breadcrumbs / Search */}
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm, đơn hàng, khách hàng..."
              className="w-full pl-11 pr-4 py-2.5 border border-gray-3 rounded-lg text-sm focus:outline-none focus:border-blue focus:ring-2 focus:ring-blue/20 transition-all"
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3 ml-6">
          {/* Quick Actions */}
          <Link
            href="/admin/products/new"
            className="hidden md:inline-flex items-center gap-2 px-4 py-2 bg-blue text-white rounded-lg text-sm font-medium hover:bg-blue-dark transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Thêm sản phẩm
          </Link>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-gray-1 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red rounded-full"></span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowNotifications(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-gray-3 shadow-2 z-20 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-3">
                    <h3 className="text-sm font-semibold text-dark">Thông báo</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`px-4 py-3 border-b border-gray-3 hover:bg-gray-1 transition-colors cursor-pointer ${
                          notif.unread ? "bg-blue-light-6" : ""
                        }`}
                      >
                        <p className="text-sm text-dark mb-1">{notif.text}</p>
                        <p className="text-xs text-gray-5">{notif.time}</p>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-3 text-center border-t border-gray-3">
                    <Link
                      href="/admin/notifications"
                      className="text-sm text-blue hover:text-blue-dark font-medium"
                    >
                      Xem tất cả
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 pl-3 pr-2 py-2 rounded-lg hover:bg-gray-1 transition-colors"
            >
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-dark">
                  {session?.user?.name || "Admin"}
                </p>
                <p className="text-xs text-gray-5">Administrator</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue to-purple flex items-center justify-center text-white text-sm font-bold">
                {session?.user?.name?.[0]?.toUpperCase() || "A"}
              </div>
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)}></div>
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-gray-3 shadow-2 z-20 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-3">
                    <p className="text-sm font-semibold text-dark">
                      {session?.user?.name || "Admin"}
                    </p>
                    <p className="text-xs text-gray-5">{session?.user?.email}</p>
                  </div>
                  <div className="py-2">
                    <Link
                      href="/admin/settings"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-dark hover:bg-gray-1 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Cài đặt
                    </Link>
                    <Link
                      href="/"
                      target="_blank"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-dark hover:bg-gray-1 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                      </svg>
                      Về trang chủ
                    </Link>
                  </div>
                  <div className="border-t border-gray-3 py-2">
                    <button
                      onClick={() => signOut({ callbackUrl: "/admin" })}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red hover:bg-red-light-6 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Đăng xuất
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
