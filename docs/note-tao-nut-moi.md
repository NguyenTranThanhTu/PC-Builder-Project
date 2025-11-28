# Lưu ý khi tạo nút mới trên dự án PC-Builder-Project

**Nguyên nhân nút bị trắng:**
- Dự án đã custom lại màu sắc trong file `tailwind.config.ts`, không sử dụng màu mặc định của Tailwind như `bg-green-500`, `bg-blue-500`.
- Các màu custom như `bg-green`, `bg-green-dark`, `bg-blue`, ... mới là màu hợp lệ.
- Nếu dùng màu mặc định của Tailwind, nút sẽ bị trắng hoặc không hiển thị đúng màu.

**Cách khắc phục khi tạo nút mới:**
- Luôn sử dụng class màu custom đã định nghĩa trong theme Tailwind, ví dụ: `bg-green`, `hover:bg-green-dark`, `text-white`, ...
- Không dùng các class màu mặc định như `bg-green-500`, `bg-blue-500`.
- Nếu cần màu khác, kiểm tra lại file `tailwind.config.ts` để lấy đúng tên class màu custom.

**Ví dụ đúng:**
```jsx
<button className="bg-green text-white hover:bg-green-dark ...">Nút xanh lá</button>
```

**Nếu gặp lỗi nút trắng:**
- Kiểm tra lại class màu đang dùng có phải màu custom không.
- Đọc lại file note này để chọn class màu phù hợp.

---
File này giúp tiết kiệm thời gian khi tạo nút mới, tránh lặp lại lỗi cũ.
