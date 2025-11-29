"use client";
import React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

const NotificationsPage = () => {
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const { status } = useSession();

  React.useEffect(() => {
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
  }, [status]);

  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-light-5">
          <svg className="w-6 h-6 text-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </span>
        <h1 className="text-2xl font-bold text-blue">Thông báo của bạn</h1>
      </div>
      <ul className="bg-white rounded-xl shadow-lg divide-y divide-gray-3 border border-gray-3">
        {notifications.length === 0 ? (
          <li className="p-6 text-gray-500 text-center">Không có thông báo nào.</li>
        ) : (
          notifications.map((n) => (
            <li
              key={n.id}
              className={`p-8 flex items-start gap-4 transition-all duration-200 rounded-xl ${!n.read ? "bg-blue-50 shadow-sm" : "bg-gray-3 text-gray-6"}`}
            >
              {!n.read && (
                <span className="mt-2 w-3 h-3 rounded-full bg-red animate-pulse shadow inline-block" />
              )}
              <div className="flex-1">
                <div className="font-medium text-dark mb-1">{n.message}</div>
                <div className="text-xs text-gray-500 mb-2">{new Date(n.createdAt).toLocaleString()}</div>
                <Link href={`/orders/${n.orderId}`} className="text-blue text-xs underline mt-1 inline-block">Xem đơn hàng</Link>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default NotificationsPage;
