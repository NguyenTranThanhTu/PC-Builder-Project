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
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6 text-blue">Thông báo của bạn</h1>
      <ul className="bg-white rounded shadow divide-y divide-gray-200">
        {notifications.length === 0 ? (
          <li className="p-6 text-gray-500">Không có thông báo nào.</li>
        ) : (
          notifications.map((n) => (
            <li key={n.id} className={`p-6 ${!n.read ? "bg-blue-50" : ""}`}>
              <div className="font-medium text-dark mb-1">{n.message}</div>
              <div className="text-xs text-gray-500 mb-2">{new Date(n.createdAt).toLocaleString()}</div>
              <Link href={`/orders/${n.orderId}`} className="text-blue text-xs underline mt-1 inline-block">Xem đơn hàng</Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default NotificationsPage;
