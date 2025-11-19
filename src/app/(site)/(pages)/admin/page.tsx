import { getServerSession } from "next-auth";
import { authOptions, isAdmin } from "@/lib/auth";
import SignInWithGoogleButton from "@/components/AdminAuth/SignInWithGoogleButton";
import BarChart from "@/components/Admin/Dashboard/BarChart";
import RecentOrders from "@/components/Admin/Dashboard/RecentOrders";
import RecentReviews from "@/components/Admin/Dashboard/RecentReviews";
import { formatVnd } from "@/components/Admin/Dashboard/format";
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
    <section className="overflow-hidden py-10 bg-gray-2">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-dark">Trang tổng quan</h1>
          <p className="text-custom-sm text-dark-2">Xin chào {session.user?.name || session.user?.email}</p>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl shadow-1 p-6 mb-6">
          <BarChart
            title="Biểu đồ doanh thu"
            data={[
              { label: "Doanh thu ngày", value: revenueDay, color: "#6366F1" },
              { label: "Doanh thu tháng", value: revenueMonth, color: "#8B5CF6" },
              { label: "Doanh thu năm", value: revenueYear, color: "#22C55E" },
            ]}
            height={320}
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 text-sm text-gray-600">
            <div><span className="text-gray-500">Doanh thu ngày:</span> <span className="font-medium text-dark">{formatVnd(revenueDay)}</span></div>
            <div><span className="text-gray-500">Doanh thu tháng:</span> <span className="font-medium text-dark">{formatVnd(revenueMonth)}</span></div>
            <div><span className="text-gray-500">Doanh thu năm:</span> <span className="font-medium text-dark">{formatVnd(revenueYear)}</span></div>
          </div>
        </div>

        {/* Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentOrders data={ordersData as any} />
          <RecentReviews data={reviewsData as any} />
        </div>
      </div>
    </section>
  );
}
