export default function AdminSettingsPage() {
  return (
    <div className="bg-white rounded-xl shadow-1 p-6">
      <h1 className="text-xl font-semibold text-dark mb-2">Cài đặt</h1>
      <ul className="list-disc ml-5 text-sm text-dark-2 space-y-1">
        <li>Thông tin cửa hàng (tên, logo, favicon)</li>
        <li>Tiền tệ, định dạng hiển thị</li>
        <li>Vận chuyển (ngưỡng freeship)</li>
        <li>Email admin, quyền truy cập</li>
        <li>Host ảnh cho Next/Image (remotePatterns)</li>
      </ul>
      <p className="text-sm text-dark-2 mt-2">Các mục trên sẽ được cấu hình trong bước kết nối dữ liệu.</p>
    </div>
  );
}
