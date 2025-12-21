"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function DebugSessionPage() {
  const { data: session, status } = useSession();
  const [apiSession, setApiSession] = useState<any>(null);

  useEffect(() => {
    // Test API call
    fetch('/api/admin/chatbot/conversations?page=1&limit=5')
      .then(res => res.json())
      .then(data => setApiSession({ status: 'ok', data }))
      .catch(err => setApiSession({ status: 'error', error: err.message }));
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🔍 Session Debug</h1>
      
      <div className="space-y-6">
        {/* Client Session */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">Client Session (useSession)</h2>
          <div className="space-y-2">
            <p><strong>Status:</strong> {status}</p>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
        </div>

        {/* API Test */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">API Test Result</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(apiSession, null, 2)}
          </pre>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold mb-2">📋 Kiểm tra:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Session phải có user.role = "ADMIN"</li>
            <li>user.email phải khớp với ADMIN_EMAILS trong .env</li>
            <li>API Test phải trả về success: true</li>
            <li>Nếu API trả về 401, check server logs</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
