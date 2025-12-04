import { getServerSession } from "next-auth";
import { authOptions, isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import CouponsManager from "./coupons-manager";

export default async function AdminCouponsPage() {
  const session = await getServerSession(authOptions);
  const hasGoogleOAuth = !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;

  if (!session && !hasGoogleOAuth) {
    return (
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="bg-white rounded-xl shadow-1 p-6 sm:p-8">
            <h1 className="text-2xl font-semibold text-dark mb-2">Quản lý mã giảm giá</h1>
            <div className="rounded-md border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-900">
              <p className="font-medium mb-1">Xác thực chưa được cấu hình.</p>
              <p>Vui lòng cấu hình Google OAuth trong <code>.env.local</code></p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!session) redirect("/api/auth/signin");
  const allowed = await isAdmin(session);
  if (!allowed) redirect("/admin");

  return (
    <section className="overflow-hidden py-20 bg-gray-2">
      <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="bg-white rounded-xl shadow-1 p-6 sm:p-8">
          <h1 className="text-2xl font-semibold text-dark mb-4">Quản lý mã giảm giá</h1>
          <CouponsManager />
        </div>
      </div>
    </section>
  );
}
