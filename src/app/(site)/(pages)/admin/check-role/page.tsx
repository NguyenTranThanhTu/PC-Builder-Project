"use client";

import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function CheckRolePage() {
  const { data: session, status } = useSession();
  const [checkResult, setCheckResult] = useState<any>(null);
  const [updateResult, setUpdateResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/debug/check-role');
      const data = await res.json();
      setCheckResult(data);
    } catch (error: any) {
      setCheckResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!confirm('Bạn có chắc muốn update role thành ADMIN? Sau đó bạn cần LOGOUT và LOGIN lại.')) {
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('/api/debug/check-role', { method: 'POST' });
      const data = await res.json();
      setUpdateResult(data);
      
      if (data.success) {
        alert(data.message);
      }
    } catch (error: any) {
      setUpdateResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  if (status === "loading") {
    return <div className="p-6">Loading...</div>;
  }

  if (!session) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-2">⚠️ Chưa đăng nhập</h2>
          <p>Vui lòng đăng nhập để sử dụng trang này.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🔧 Kiểm tra & Sửa Role Admin</h1>

      {/* Session Info */}
      <div className="bg-white rounded-lg p-6 shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">📋 Session hiện tại</h2>
        <div className="space-y-2">
          <p><strong>Email:</strong> {session.user?.email}</p>
          <p><strong>Name:</strong> {session.user?.name}</p>
          <p><strong>Role trong session:</strong> <span className="font-mono bg-gray-100 px-2 py-1 rounded">{session.user?.role || "undefined"}</span></p>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-lg p-6 shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">🛠️ Hành động</h2>
        <div className="space-y-3">
          <button
            onClick={handleCheck}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {loading ? "Đang kiểm tra..." : "1️⃣ Kiểm tra Role trong Database"}
          </button>
          
          {checkResult?.needsUpdate && (
            <button
              onClick={handleUpdate}
              disabled={loading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium ml-3"
            >
              {loading ? "Đang cập nhật..." : "2️⃣ Update Role → ADMIN"}
            </button>
          )}

          {updateResult?.success && (
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium ml-3"
            >
              3️⃣ Logout & Login lại
            </button>
          )}
        </div>
      </div>

      {/* Check Result */}
      {checkResult && (
        <div className="bg-white rounded-lg p-6 shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">📊 Kết quả kiểm tra</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(checkResult, null, 2)}
          </pre>
          
          {checkResult.needsUpdate && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded p-4">
              <p className="font-semibold text-yellow-800">⚠️ Cần cập nhật!</p>
              <p className="text-sm text-yellow-700">
                Email của bạn có trong ADMIN_EMAILS nhưng role trong database chưa phải ADMIN.
                Hãy click nút "2️⃣ Update Role → ADMIN" ở trên.
              </p>
            </div>
          )}
          
          {checkResult.database?.role === "ADMIN" && checkResult.session?.role !== "ADMIN" && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded p-4">
              <p className="font-semibold text-blue-800">ℹ️ Role đã đúng trong DB</p>
              <p className="text-sm text-blue-700">
                Role trong database đã là ADMIN, nhưng session chưa cập nhật.
                Hãy <strong>LOGOUT và LOGIN lại</strong> để session được refresh.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Update Result */}
      {updateResult && (
        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">✅ Kết quả cập nhật</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(updateResult, null, 2)}
          </pre>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6 mt-6">
        <h3 className="font-semibold text-lg mb-3">📖 Hướng dẫn</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Click <strong>"1️⃣ Kiểm tra Role"</strong> để xem thông tin chi tiết</li>
          <li>Nếu cần update, click <strong>"2️⃣ Update Role → ADMIN"</strong></li>
          <li>Sau khi update thành công, click <strong>"3️⃣ Logout & Login lại"</strong></li>
          <li>Sau khi login lại, role sẽ được cập nhật trong session</li>
          <li>Giờ bạn có thể vào <a href="/admin/chatbot" className="text-blue-600 underline">/admin/chatbot</a> để xem conversations</li>
        </ol>
        
        <div className="mt-4 pt-4 border-t border-purple-200">
          <p className="text-sm text-gray-600">
            <strong>Lưu ý:</strong> ChatBot AI hoạt động cho TẤT CẢ user (kể cả khách).
            Chỉ có ADMIN mới vào được trang quản lý conversations.
          </p>
        </div>
      </div>
    </div>
  );
}
