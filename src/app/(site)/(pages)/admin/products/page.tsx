import { getServerSession } from "next-auth";
import { authOptions, isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProductsManager from "./products-manager";

export default async function AdminProductsPage() {
  const session = await getServerSession(authOptions);
  const hasGoogleOAuth = !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;

  // If auth isn't configured locally, show a friendly setup message instead of redirecting into a NextAuth OAuth error
  if (!session && !hasGoogleOAuth) {
    return (
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="bg-white rounded-xl shadow-1 p-6 sm:p-8">
            <h1 className="text-2xl font-semibold text-dark mb-2">Quản lý sản phẩm</h1>
            <div className="rounded-md border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-900">
              <p className="font-medium mb-1">Xác thực chưa được cấu hình.</p>
              <p className="mb-2">Thêm các biến môi trường sau vào <code>.env.local</code> để đăng nhập bằng Google:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><code>GOOGLE_CLIENT_ID</code></li>
                <li><code>GOOGLE_CLIENT_SECRET</code></li>
                <li><code>NEXTAUTH_SECRET</code></li>
                <li><code>ADMIN_EMAILS</code> (email của bạn)</li>
              </ul>
              <p className="mt-3">Sau đó khởi động lại dev server và truy cập lại trang này.</p>
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
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="bg-white rounded-xl shadow-1 p-6 sm:p-8">
          <h1 className="text-2xl font-semibold text-dark mb-4">Quản lý sản phẩm</h1>
          <ProductsManager />
        </div>
      </div>
    </section>
  );
}
