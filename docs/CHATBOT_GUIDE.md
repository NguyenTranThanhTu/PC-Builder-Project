# AI ChatBot - Hướng dẫn sử dụng

## 🎉 Tính năng đã hoàn thành

### ✅ Components
1. **ChatBot.tsx** - Floating button với animation
2. **ChatWindow.tsx** - Giao diện chat với message bubbles
3. **ChatContext.tsx** - Global state management + API integration
4. **types.ts** - TypeScript definitions

### ✅ API Routes
- `/api/chat` - Production chat endpoint
- `/api/chat/test` - Test endpoint (giữ lại để debug)

### ✅ Tích hợp
- Đã wrap trong `ChatProvider` tại `ClientShell.tsx`
- Chỉ hiển thị trên trang shop (không hiển thị trong admin)
- Floating button góc dưới bên phải

---

## 🚀 Cách test

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Truy cập trang shop:**
   ```
   http://localhost:3000
   ```

3. **Mở chatbot:**
   - Nhấn vào nút floating 💬 góc dưới bên phải
   - Hoặc test ngay với Quick Actions có sẵn

4. **Test các tính năng:**
   - ✅ Gửi tin nhắn tự do
   - ✅ Quick Actions (4 nút shortcut)
   - ✅ Conversation history (AI nhớ ngữ cảnh)
   - ✅ Typing indicator (3 chấm animate)
   - ✅ Error handling (hiển thị lỗi màu đỏ)
   - ✅ Clear chat history (nút 🗑️)
   - ✅ Scroll auto (tin nhắn mới → cuộn xuống)
   - ✅ Keyboard shortcuts (Enter = gửi, Shift+Enter = xuống dòng)

---

## 🎨 Giao diện

### Floating Button
- **Closed**: Gradient purple-blue, hiển thị 💬
- **Open**: Gray, rotate 90°, hiển thị ✕
- **Badge**: "AI" badge animate-bounce

### Chat Window (400x600px)
- **Header**: Gradient purple-blue
  - Avatar 🤖
  - Tiêu đề "AI Advisor"
  - Nút clear history + close
- **Messages**: Scroll area với bubbles
  - User: Blue gradient, avatar 👤, align right
  - Bot: White, avatar 🤖, align left
  - Error: Red background
- **Input**: Textarea + Send button (gradient)

### Quick Actions (4 buttons)
1. 🎮 Build PC 30tr
2. ⚖️ So sánh CPU
3. 🔍 Kiểm tra tương thích
4. ⬆️ Nâng cấp PC

---

## 🔧 Cấu trúc code

### ChatContext.tsx
```typescript
// State management
const [messages, setMessages] = useState<Message[]>([]);
const [isOpen, setIsOpen] = useState(false);

// Main function
sendMessage(content: string) => Promise<void>
```

### API Flow
```
User → ChatWindow → sendMessage() 
  → POST /api/chat { message, history }
  → chatWithGemini() in gemini.ts
  → Gemini API
  → Response
  → Add to messages state
```

### History Format
```typescript
{
  role: 'user' | 'model',
  parts: [{ text: string }]
}
```

---

## 🎯 Tính năng nâng cao (có thể thêm sau)

### 1. Product Cards Integration
- Parse AI response để detect product mentions
- Hiển thị product card với giá, hình ảnh
- Nút "Add to Cart" ngay trong chat

### 2. Conversation Persistence
- Lưu messages vào localStorage
- Hoặc lưu vào database (user-specific)
- Restore lại khi reload page

### 3. Voice Input
- Web Speech API
- Nút mic trong input area

### 4. Image Upload
- User upload ảnh PC/error
- AI phân tích và tư vấn

### 5. Admin Analytics
- Dashboard xem chat logs
- Thống kê câu hỏi phổ biến
- Feedback system (thumbs up/down)

### 6. Multi-language
- Detect user language
- Switch giữa Vietnamese/English

### 7. Suggested Replies
- AI suggest 3 câu hỏi tiếp theo
- Hiển thị dưới bot message

---

## 📝 Test Cases

### ✅ Basic Chat
- User: "Xin chào"
- Bot: Greeting response với emoji

### ✅ PC Build Advice
- User: "Build PC 30 triệu"
- Bot: Đưa ra config chi tiết với giá

### ✅ Compatibility Check
- User: "i9-14900K + B760 có ok không?"
- Bot: Cảnh báo tương thích

### ✅ Product Comparison
- User: "So sánh RTX 4070 vs RX 7800 XT"
- Bot: Bảng so sánh chi tiết

### ✅ Conversation Context
- User: "Build PC 30tr"
- Bot: "Gợi ý config A..."
- User: "Thay CPU i7 bằng i5 được không?" ← AI nhớ context
- Bot: "Với config ở trên, thay i7→i5..."

### ✅ Error Handling
- Network error → Red error message
- API quota exceeded → User-friendly message
- Invalid input → Validation message

---

## 🐛 Troubleshooting

### Floating button không hiển thị
- ✅ Check: Có đang ở trang admin không? (ChatBot chỉ hiển thị trên shop)
- ✅ Check: z-index có bị che bởi component khác không?

### Messages không gửi được
- ✅ Check: Dev server có chạy không?
- ✅ Check: Console có lỗi API không?
- ✅ Check: GEMINI_API_KEY có đúng trong .env không?

### AI không nhớ context
- ✅ Check: History có được truyền đúng format không?
- ✅ Check: Console log để xem history structure

### Styling bị lỗi
- ✅ Check: Tailwind đã compile chưa?
- ✅ Restart dev server

---

## 🎓 Tips for Enhancement

1. **Optimize API calls**: Debounce input để tránh spam
2. **Better error messages**: Translate technical errors → user-friendly
3. **Loading states**: Show skeleton loader thay vì typing indicator
4. **Mobile responsive**: Adjust width/height cho mobile
5. **Accessibility**: Add ARIA labels, keyboard navigation

---

## 📚 Related Files

- `src/lib/gemini.ts` - AI client
- `src/components/ChatBot/*` - ChatBot components
- `src/app/api/chat/route.ts` - Production API
- `src/app/api/chat/test/route.ts` - Test API
- `src/app/(site)/ClientShell.tsx` - Integration point

---

**Status**: ✅ READY TO TEST

Refresh browser và test thử ngay! 🚀
