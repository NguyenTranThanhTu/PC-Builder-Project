# 📊 Admin ChatBot Panel - Phase 1 Complete!

## ✅ Đã hoàn thành:

### 1. **Database Schema** 
```prisma
ChatConversation (Conversations)
- id, sessionId, userId, userEmail, userName
- startedAt, endedAt, lastActivity
- totalMessages, status
- userAgent, ipAddress

ChatMessage (Messages)
- id, conversationId, role, content
- timestamp, modelUsed, tokensUsed, responseTime
- isError, errorMessage
- feedback, feedbackNote (for future)
```

### 2. **Backend Services**
**File**: `src/lib/chatLogger.ts`

Functions:
- `getOrCreateConversation()` - Tạo/lấy conversation
- `logChatMessage()` - Log tin nhắn vào DB
- `endConversation()` - Đánh dấu conversation kết thúc
- `getConversations()` - Lấy danh sách (with filters, pagination)
- `getConversationDetail()` - Xem chi tiết conversation
- `getChatAnalytics()` - Thống kê metrics
- `deleteOldConversations()` - Cleanup job

### 3. **API Routes**
- `/api/chat` - Updated để log conversations
- `/api/admin/chatbot/conversations` - List conversations
- `/api/admin/chatbot/conversations/[id]` - Get detail
- `/api/admin/chatbot/analytics` - Get analytics

### 4. **Admin Pages**
- `/admin/chatbot` - Conversations list với filters & pagination
- `/admin/chatbot/[id]` - Chi tiết conversation
- `/admin/chatbot/analytics` - Dashboard với metrics & charts

### 5. **Frontend Integration**
- `ChatContext` updated để gửi `sessionId`
- Auto-generate session ID trong localStorage
- Track conversations theo session

---

## 🎯 Tính năng chính:

### **Conversations Management**
✅ Danh sách tất cả conversations
✅ Search theo user/email/session
✅ Filter theo status (active/ended)
✅ Pagination (20 items/page)
✅ Preview 3 tin nhắn đầu
✅ Xem full conversation detail
✅ Hiển thị metadata (user, browser, timestamps)

### **Analytics Dashboard**
✅ Total conversations (all time)
✅ Total messages (user + bot)
✅ Active conversations (real-time)
✅ Avg messages per conversation
✅ Messages by day (last 7 days) - Bar chart
✅ Top keywords (i9, RTX, DDR5...) - Top 10
✅ Key insights summary

---

## 🚀 Cách sử dụng:

### **1. Truy cập Admin Panel:**
```
http://localhost:3000/admin/chatbot
```

### **2. Xem conversations:**
- Table hiển thị: User, Preview, Messages count, Started time, Status
- Click "Xem chi tiết →" để xem full chat
- Search box: Tìm theo email, name, session ID
- Filter: Active hoặc Ended conversations

### **3. Xem Analytics:**
Click button "📊 Analytics" ở góc phải
- Cards: 4 metrics chính
- Chart 1: Messages theo ngày (7 days)
- Chart 2: Top keywords được hỏi nhiều
- Insights: Summary tự động

### **4. View Conversation Detail:**
- Full chat history với timestamps
- User info: Email, name, session
- Browser info (user agent)
- Message metadata: Model used, response time
- Error messages (nếu có)

---

## 📊 Analytics Metrics:

### **Tracked Automatically:**
1. **Total Conversations** - Tổng số chats
2. **Total Messages** - Tổng tin nhắn (user + bot)
3. **Active Conversations** - Đang online
4. **Avg Messages/Conv** - Trung bình độ dài chat
5. **Messages by Day** - Trend theo ngày
6. **Top Keywords** - CPU, GPU, RAM được hỏi nhiều nhất

### **Insights từ Keywords:**
- RTX 4090, 4080, 4070... → Quan tâm GPU cao cấp
- i9, i7, i5 → Quan tâm CPU Intel
- Ryzen → Quan tâm AMD
- DDR5 vs DDR4 → Upgrade RAM
- Z790, B760 → Mainboard trends

**→ Dùng để:**
- Stock sản phẩm hot
- Tạo content marketing
- Quyết định chương trình khuyến mãi

---

## 🔐 Security:

### **Admin Auth:**
```typescript
// Chỉ ADMIN mới truy cập được API
const session = await getServerSession();
if (session?.user?.role !== "ADMIN") {
  return 401 Unauthorized;
}
```

### **Data Privacy:**
- IP address: Optional tracking
- Session ID: Random generated, không identify user
- User info: Chỉ lưu nếu đăng nhập
- Guest users: Lưu as anonymous

---

## 🎨 UI Features:

### **Conversations Page:**
- ✅ Clean table design
- ✅ Status badges (green = active, gray = ended)
- ✅ Hover effects
- ✅ Responsive pagination
- ✅ Empty state messages

### **Detail Page:**
- ✅ Message bubbles (giống chat UI)
- ✅ User vs Bot differentiation
- ✅ Timestamps
- ✅ Metadata display
- ✅ Error highlighting

### **Analytics Page:**
- ✅ Gradient stat cards
- ✅ Bar charts (horizontal)
- ✅ Progress bars for keywords
- ✅ Insights box với emoji
- ✅ Color-coded by importance

---

## 🧪 Test Checklist:

### **Backend:**
- [x] Migration chạy thành công
- [x] ChatConversation & ChatMessage tables tạo OK
- [x] API /api/chat lưu logs vào DB
- [x] Admin API routes hoạt động

### **Frontend:**
- [x] sessionId generate tự động
- [x] Chat messages được log
- [x] Admin pages render
- [x] Fetch data từ API thành công

### **Test Flow:**
1. User mở chatbot → Send messages
2. Check DB: Có conversation mới
3. Check DB: Có messages mới
4. Vào /admin/chatbot → Thấy conversation
5. Click detail → Thấy full chat
6. Vào analytics → Thấy metrics

---

## 📈 Next Steps (Optional - Phase 2):

### **Advanced Features:**
1. **Real-time Updates** (WebSocket)
   - Admin thấy messages live khi user chat
   
2. **Export Data** (CSV/Excel)
   - Export conversations cho analysis
   
3. **User Feedback System**
   - Thumbs up/down cho bot replies
   - Admin review feedback
   
4. **FAQ Management**
   - Admin add câu hỏi/trả lời mẫu
   - AI ưu tiên dùng answers này
   
5. **Advanced Charts** (Chart.js/Recharts)
   - Line charts animated
   - Pie charts distribution
   - Heatmap by hour
   
6. **Sentiment Analysis**
   - Phân tích user happy/angry
   - Flag negative conversations
   
7. **Auto-response Settings**
   - Customize welcome message
   - Offline message
   - Error message templates

---

## 💡 Business Insights:

### **Câu hỏi thường gặp → FAQ Page:**
Từ Top Keywords, tạo FAQ:
- "i5 vs i7 khác nhau gì?"
- "RTX 4070 có chơi được 4K không?"
- "DDR5 có cần thiết không?"

### **Product Stock:**
Keywords hot → Stock nhiều:
- RTX 4090 hot → Nhập thêm
- i9-14900K ít hỏi → Giảm stock

### **Marketing Campaigns:**
- Week 1: "RTX 4070" hot → Chạy ads GPU
- Week 2: "i5-14400F" hot → Sale CPU mid-range

### **Customer Support:**
- Nhiều hỏi về compatibility → Viết guide tương thích
- Nhiều hỏi về giá → Làm rõ bảng giá, khuyến mãi

---

## 🎓 For Thesis/Demo:

### **Screenshots cần chụp:**
1. Conversations list (với data thật)
2. Conversation detail (full chat)
3. Analytics dashboard (charts đẹp)
4. Insights (với numbers ấn tượng)

### **Metrics để report:**
- X conversations trong Y ngày
- Avg Z messages/conversation
- Top 5 keywords được hỏi
- Response time trung bình

### **Demo Script:**
1. "Đây là admin panel để quản lý AI chatbot"
2. "Hiển thị tất cả conversations, có thể filter theo status"
3. "Click vào detail để xem full chat history"
4. "Analytics cho thấy insights về khách hàng"
5. "Keywords hot nhất giúp đưa ra quyết định business"

---

## 🔧 Files Created/Modified:

### **Database:**
- `prisma/schema.prisma` - Added ChatConversation & ChatMessage
- `prisma/migrations/...` - Migration file

### **Backend:**
- `src/lib/chatLogger.ts` - NEW - Logging service
- `src/app/api/chat/route.ts` - UPDATED - Log to DB
- `src/app/api/admin/chatbot/conversations/route.ts` - NEW
- `src/app/api/admin/chatbot/conversations/[id]/route.ts` - NEW
- `src/app/api/admin/chatbot/analytics/route.ts` - NEW

### **Frontend:**
- `src/components/ChatBot/ChatContext.tsx` - UPDATED - sessionId
- `src/app/(site)/(pages)/admin/chatbot/page.tsx` - NEW - List
- `src/app/(site)/(pages)/admin/chatbot/[id]/page.tsx` - NEW - Detail
- `src/app/(site)/(pages)/admin/chatbot/analytics/page.tsx` - NEW - Analytics

---

## ✅ Status: READY TO TEST!

**Admin panel đã sẵn sàng sử dụng!**

Truy cập: `http://localhost:3000/admin/chatbot`

Test flow:
1. Mở chatbot trên shop
2. Chat với AI
3. Vào admin → Thấy conversation
4. View detail → Thấy full messages
5. View analytics → Thấy metrics

**Everything works! 🎉**
