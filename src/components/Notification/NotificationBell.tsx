"use client";
import React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

const NotificationBell = () => {
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [open, setOpen] = React.useState(false);
  const { status } = useSession();

  // Polling notifications mỗi 10 giây
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    async function fetchNotifications() {
      if (status === "authenticated") {
        try {
          const res = await fetch("/api/notifications");
          const data = await res.json();
          if (data.notifications) setNotifications(data.notifications);
        } catch {}
      }
    }
    fetchNotifications();
    interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [status]);

  const unreadCount = notifications.filter(n => !n.read).length;

  async function markAsRead(notificationId: string) {
    try {
      await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });
      setNotifications((prev) => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
    } catch {}
  }

  async function markAllAsRead() {
    try {
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      if (unreadIds.length === 0) return;
      await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationIds: unreadIds }),
      });
      setNotifications((prev) => prev.map(n => ({ ...n, read: true })));
    } catch {}
  }

  return (
    <div className="relative inline-block">
      <button
        className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none"
        onClick={() => setOpen(!open)}
        aria-label="Thông báo"
      >
        <svg className="w-6 h-6 text-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 flex items-center justify-center pointer-events-none">
            <span className="w-5 h-5 rounded-full bg-red text-white animate-pulse shadow flex items-center justify-center text-xs font-bold">
              {unreadCount}
            </span>
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded shadow-lg z-50">
          <div className="flex items-center justify-between p-4 border-b font-semibold text-dark">
            <span>Thông báo của bạn</span>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  className="text-xs px-3 py-1 bg-blue-light-5 text-blue rounded hover:bg-blue-light-4 shadow transition"
                  onClick={markAllAsRead}
                >Đánh dấu tất cả đã đọc</button>
              )}
              <button
                className="ml-2 text-gray-400 hover:text-red-500 text-lg font-bold focus:outline-none"
                aria-label="Đóng thông báo"
                onClick={() => setOpen(false)}
              >
                ×
              </button>
            </div>
          </div>
          <ul className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <li className="p-4 text-gray-500">Không có thông báo nào.</li>
            ) : (
              notifications.map((n) => (
                <li
                  key={n.id}
                  className={`p-4 border-b last:border-b-0 flex items-start gap-2 transition-all duration-200 ${!n.read ? "bg-blue-50 shadow-sm" : "bg-gray-300 text-gray-500 opacity-80"}`}
                >
                  {!n.read && <span className="mt-2 w-2 h-2 rounded-full bg-red-500 inline-block animate-pulse shadow" />}
                  <div className="flex-1">
                    <div className="font-medium text-dark mb-1">{n.message}</div>
                    <div className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleString()}</div>
                    <Link href={`/orders/${n.orderId}`} className="text-blue text-xs underline mt-1 inline-block" onClick={() => markAsRead(n.id)}>Xem đơn hàng</Link>
                  </div>
                </li>
              ))
            )}
          </ul>
          <div className="p-2 text-right">
            <Link href="/notifications" className="text-blue text-sm underline">Xem tất cả</Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
