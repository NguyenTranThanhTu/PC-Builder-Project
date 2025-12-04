"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

// User type
interface UserItem {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  status: "ACTIVE" | "BANNED";
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams();
    if (search) params.append("q", search);
    if (role) params.append("role", role);
    if (status) params.append("status", status);
    fetch(`/api/admin/users?${params.toString()}`)
      .then(res => res.json())
      .then(data => setUsers(data.users || []))
      .catch(() => setError("Không thể tải danh sách user"))
      .finally(() => setLoading(false));
  }, [search, role, status]);

  return (
    <section className="overflow-hidden py-12 bg-gray-2">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="bg-white rounded-xl shadow-1 p-6 sm:p-8">
          <h1 className="text-2xl font-semibold text-dark mb-4">Quản lý user</h1>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm theo tên hoặc email..."
              className="w-full border rounded px-3 py-2 text-sm md:col-span-2"
            />
            <select value={role} onChange={e => setRole(e.target.value)} className="w-full border rounded px-3 py-2 text-sm">
              <option value="">Vai trò</option>
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
            <select value={status} onChange={e => setStatus(e.target.value)} className="w-full border rounded px-3 py-2 text-sm">
              <option value="">Trạng thái</option>
              <option value="ACTIVE">Hoạt động</option>
              <option value="BANNED">Bị khóa</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-3 py-2 border">Tên</th>
                  <th className="px-3 py-2 border">Email</th>
                  <th className="px-3 py-2 border">Vai trò</th>
                  <th className="px-3 py-2 border">Trạng thái</th>
                  <th className="px-3 py-2 border">Ngày tạo</th>
                  <th className="px-3 py-2 border">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-gray-400">Đang tải...</td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-red-500">{error}</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-gray-400">Không có user phù hợp</td>
                  </tr>
                ) : (
                  users.map(user => (
                    <tr key={user.id} className="border-b">
                      <td className="px-3 py-2 border font-semibold">{user.name}</td>
                      <td className="px-3 py-2 border font-mono">{user.email}</td>
                      <td className="px-3 py-2 border">{user.role === "ADMIN" ? <span className="px-2 py-1 rounded bg-purple-100 text-purple-700 font-bold text-xs">Admin</span> : <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs">User</span>}</td>
                      <td className="px-3 py-2 border">{user.status === "ACTIVE" ? <span className="px-2 py-1 rounded bg-green-100 text-green-700 font-bold text-xs">Hoạt động</span> : <span className="px-2 py-1 rounded bg-red-100 text-red-700 font-bold text-xs">Bị khóa</span>}</td>
                      <td className="px-3 py-2 border text-xs">{new Date(user.createdAt).toLocaleString('vi-VN')}</td>
                      <td className="px-3 py-2 border space-x-2">
                        <Link href={`/admin/users/${user.id}`} className="text-xs px-2 py-1 rounded bg-blue text-white">Xem</Link>
                        <Link href={`/admin/users/${user.id}/edit`} className="text-xs px-2 py-1 rounded bg-purple-600 text-white">Sửa</Link>
                        <button className="text-xs px-2 py-1 rounded bg-red-600 text-white">Xóa</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
