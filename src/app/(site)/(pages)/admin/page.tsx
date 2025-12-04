import { getServerSession } from "next-auth";
import { authOptions, isAdmin } from "@/lib/auth";
import SignInWithGoogleButton from "@/components/AdminAuth/SignInWithGoogleButton";
import BarChart from "@/components/Admin/Dashboard/BarChart";
import RecentOrders from "@/components/Admin/Dashboard/RecentOrders";
import RecentReviews from "@/components/Admin/Dashboard/RecentReviews";
import { formatVnd } from "@/lib/formatVnd";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return (
      <main className="min-h-screen relative flex items-center justify-center bg-gradient-to-br from-blue/5 via-white to-purple-50 px-4 py-10">
        <div className="absolute inset-0 pointer-events-none [background-image:radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.15),transparent_60%),radial-gradient(circle_at_80%_70%,rgba(99,102,241,0.15),transparent_65%)]" />
        <div className="w-full max-w-xl mx-auto">
          <div className="backdrop-blur-sm bg-white/80 border border-gray-200 rounded-xl shadow-lg shadow-blue/5 px-8 py-10 relative">
            <div className="flex items-center gap-2 mb-8">
              <Image src="/images/logo/logo-dark.svg" alt="Logo" width={120} height={36} className="h-9 w-auto" />
              <span className="text-xl font-semibold tracking-tight text-dark">Admin Portal</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-3 text-dark">Đăng nhập quản trị</h1>
            <p className="text-gray-600 mb-6 max-w-prose">
              Sử dụng Google SSO để truy cập khu vực quản trị. Nếu tài khoản chưa được cấp quyền, bạn sẽ được chuyển tới trang hướng dẫn.
            </p>
            <SignInWithGoogleButton />
            <div className="mt-6 flex items-center justify-between text-sm">
              <Link href="/admin/access-pending" className="text-blue hover:underline">Chưa có quyền?</Link>
              <Link href="/" className="text-gray-600 hover:text-dark">Về trang chủ</Link>
            </div>
            <div className="mt-8 text-xs text-gray-500 leading-relaxed">
              Bằng việc tiếp tục, bạn đồng ý với <a href="#" className="underline">Điều khoản</a> & <a href="#" className="underline">Chính sách</a> của hệ thống.
            </div>
          </div>
          <div className="mt-6 text-center text-[11px] text-gray-500">
            © {new Date().getFullYear()} Admin Portal. All rights reserved.
          </div>
        </div>
      </main>
    );
  }
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

  // Real data: compute revenue day/month/year and fetch latest orders/reviews
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const [aggDay, aggMonth, aggYear, latestOrders, latestReviews] = await Promise.all([
    prisma.order.aggregate({ _sum: { totalCents: true }, where: { status: { not: "CANCELLED" }, createdAt: { gte: startOfDay } } }),
    prisma.order.aggregate({ _sum: { totalCents: true }, where: { status: { not: "CANCELLED" }, createdAt: { gte: startOfMonth } } }),
    prisma.order.aggregate({ _sum: { totalCents: true }, where: { status: { not: "CANCELLED" }, createdAt: { gte: startOfYear } } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    prisma.review.findMany({ orderBy: { createdAt: "desc" }, take: 6, include: { product: true, user: true } }),
  ]);

  const revenueDay = aggDay._sum.totalCents ?? 0;
  const revenueMonth = aggMonth._sum.totalCents ?? 0;
  const revenueYear = aggYear._sum.totalCents ?? 0;

  const mapStatus = (s: string): "Đang chờ" | "Đã xử lý" | "Đang giao" | "Huỷ" =>
    s === "PROCESSING" ? "Đã xử lý" : s === "SHIPPED" ? "Đang giao" : s === "CANCELLED" ? "Huỷ" : "Đang chờ";

  const ordersData = latestOrders.map((o) => ({
    id: o.id,
    customer: o.customerName,
    phone: o.customerPhone || "",
    total: o.totalCents,
    status: mapStatus(o.status as any),
    createdAt: o.createdAt,
  }));

  const reviewsData = latestReviews.map((r) => ({
    id: r.id,
    author: r.user?.name || r.user?.email || "Ẩn danh",
    product: r.product.name,
    content: r.content,
    rating: r.rating,
    createdAt: r.createdAt,
  }));

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark mb-2">Dashboard</h1>
          <p className="text-sm text-dark-5">
            Xin chào, <span className="font-semibold text-dark">{session.user?.name || session.user?.email}</span> 👋
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-dark-5">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {new Date().toLocaleDateString("vi-VN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Revenue Day */}
        <div className="bg-gradient-to-br from-blue to-blue-dark rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="px-2.5 py-1 bg-white/20 rounded-lg text-xs font-semibold">Hôm nay</span>
          </div>
          <h3 className="text-2xl font-bold mb-1">{formatVnd(revenueDay)}</h3>
          <p className="text-blue-light-3 text-sm">Doanh thu trong ngày</p>
        </div>

        {/* Revenue Month */}
        <div className="bg-gradient-to-br from-purple to-purple-dark rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="px-2.5 py-1 bg-white/20 rounded-lg text-xs font-semibold">Tháng này</span>
          </div>
          <h3 className="text-2xl font-bold mb-1">{formatVnd(revenueMonth)}</h3>
          <p className="text-purple-light-2 text-sm">Doanh thu trong tháng</p>
        </div>

        {/* Revenue Year */}
        <div className="bg-gradient-to-br from-green to-green-dark rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="px-2.5 py-1 bg-white/20 rounded-lg text-xs font-semibold">Năm nay</span>
          </div>
          <h3 className="text-2xl font-bold mb-1">{formatVnd(revenueYear)}</h3>
          <p className="text-green-light-3 text-sm">Tổng doanh thu năm</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-3 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-dark">Biểu đồ doanh thu</h2>
            <p className="text-sm text-dark-5">So sánh doanh thu theo thời gian</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-xs font-medium bg-gray-1 text-dark rounded-lg hover:bg-gray-2 transition-colors">
              Tuần
            </button>
            <button className="px-3 py-1.5 text-xs font-medium bg-blue text-white rounded-lg">
              Tháng
            </button>
            <button className="px-3 py-1.5 text-xs font-medium bg-gray-1 text-dark rounded-lg hover:bg-gray-2 transition-colors">
              Năm
            </button>
          </div>
        </div>
        <BarChart
          title=""
          data={[
            { label: "Hôm nay", value: revenueDay, color: "#3C50E0" },
            { label: "Tháng này", value: revenueMonth, color: "#8B5CF6" },
            { label: "Năm nay", value: revenueYear, color: "#22AD5C" },
          ]}
          height={280}
        />
      </div>

      {/* Recent Activity Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <RecentOrders data={ordersData as any} />
        <RecentReviews data={reviewsData as any} />
      </div>
    </div>
  );
}
