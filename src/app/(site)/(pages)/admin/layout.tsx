import { getServerSession } from "next-auth";
import { authOptions, isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import ModernAdminSidebar from "@/components/Admin/ModernAdminSidebar";
import ModernAdminNavbar from "@/components/Admin/ModernAdminNavbar";
import React from "react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/api/auth/signin");
  const allowed = await isAdmin(session);

  if (!allowed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-light-6 to-orange-light-4 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2 p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-light-6 flex items-center justify-center">
            <svg className="w-8 h-8 text-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-dark mb-2">Truy cập bị từ chối</h1>
          <p className="text-sm text-dark-5 mb-6">
            Tài khoản của bạn không có quyền truy cập vào khu vực quản trị. Vui lòng liên hệ quản trị viên.
          </p>
          <a
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue text-white rounded-lg font-medium hover:bg-blue-dark transition-colors"
          >
            Về trang chủ
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-1">
      {/* Sidebar */}
      <ModernAdminSidebar />

      {/* Main Content Area */}
      <div className="lg:ml-72 transition-all duration-300">
        {/* Navbar */}
        <ModernAdminNavbar />

        {/* Page Content */}
        <main className="p-6">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
