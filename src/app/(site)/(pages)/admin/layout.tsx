import { getServerSession } from "next-auth";
import { authOptions, isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminNav from "@/components/Admin/AdminNav";
import AdminSidebar from "@/components/Admin/AdminSidebar";
import React from "react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/api/auth/signin");
  const allowed = await isAdmin(session);

  if (!allowed) {
    return (
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="bg-white rounded-xl shadow-1 p-8">
            <h1 className="text-2xl font-semibold text-dark mb-2">Access Denied</h1>
            <p className="text-custom-sm text-dark-2">Tài khoản của bạn không có quyền truy cập admin.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden py-6 bg-gray-2 min-h-screen">
      <div className="w-full mx-auto px-4 sm:px-6 xl:px-8">
        {/* Mobile top nav */}
        <div className="md:hidden bg-white rounded-xl shadow-1 p-3 mb-4">
          <AdminNav />
        </div>
        <div className="hidden md:grid md:grid-cols-[240px_1fr] gap-6">
          <AdminSidebar />
          <div>{children}</div>
        </div>
        {/* Fallback for small screens displays children under top nav */}
        <div className="md:hidden">{children}</div>
      </div>
    </section>
  );
}
