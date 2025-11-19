import Link from "next/link";

export default function AdminAccessPendingPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f3f4f6] p-6">
      <div className="w-full max-w-xl bg-white rounded-lg shadow-1 p-6">
        <h1 className="text-2xl font-semibold mb-2">Quyền truy cập đang chờ duyệt</h1>
        <p className="text-gray-700 mb-4">
          Tài khoản của bạn đã xác thực qua Google, nhưng chưa được cấp quyền ADMIN để vào trang quản trị.
        </p>
        <ul className="list-disc pl-5 text-gray-700 space-y-1 mb-6">
          <li>Vui lòng liên hệ quản trị viên để được cấp quyền.</li>
          <li>Nếu bạn vừa được cấp quyền, hãy đăng xuất và đăng nhập lại.</li>
        </ul>
        <div className="flex gap-3">
          <Link href="/admin" className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50">
            Về trang Admin
          </Link>
          <Link href="/" className="inline-flex items-center justify-center rounded-md bg-blue text-white px-4 py-2 hover:bg-blue/90">
            Trang chủ
          </Link>
        </div>
      </div>
    </main>
  );
}
