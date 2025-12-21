# 🔧 Fix: LocalStorage Persistence Issue

## ❌ Vấn đề trước đây:
User chọn linh kiện → Nhấn "Phân tích" → Xem kết quả → Nhấn "Quay lại" → **TẤT CẢ SELECTIONS BỊ MẤT** ❌

## ✅ Root Cause:
Khi component `CurrentPCForm` bị unmount và mount lại (do navigation), state `selected` được khởi tạo lại với giá trị mặc định (all null). Mặc dù có useEffect để load từ localStorage, nhưng có **race condition** giữa:
1. Initial state setup (với giá trị null)
2. useEffect load từ localStorage (chạy sau render)

→ Kết quả: Render đầu tiên hiển thị empty state trước khi localStorage load xong.

## 🔧 Solution Implemented:

### 1. Load localStorage NGAY trong initial state
```typescript
// BEFORE (BAD):
const [selected, setSelected] = useState<Record<CategoryKey, Product | null>>({
  cpu: null,
  gpu: null,
  // ... all null
});

useEffect(() => {
  // Load từ localStorage ← Chạy SAU khi component đã render
  const saved = localStorage.getItem('pc-builder-selections');
  if (saved) setSelected(JSON.parse(saved));
}, []);

// AFTER (GOOD):
const loadSavedSelections = (): Record<CategoryKey, Product | null> => {
  if (typeof window === 'undefined') return { /* all null */ };
  
  try {
    const saved = localStorage.getItem('pc-builder-selections');
    if (saved) {
      console.log('[CurrentPCForm] Loaded saved selections:', saved);
      return JSON.parse(saved);
    }
  } catch (err) {
    console.error('[CurrentPCForm] Error:', err);
  }
  
  return { /* all null */ };
};

// Initialize với saved data NGAY LẬP TỨC
const [selected, setSelected] = useState<Record<CategoryKey, Product | null>>(
  loadSavedSelections  // ← Function được gọi TRƯỚC khi render
);
```

**Key Difference:**
- `useState(initialValue)` chỉ chạy 1 lần khi component mount
- Nếu `initialValue` là function → React gọi function đó để lấy giá trị ban đầu
- → localStorage được load ĐỒNG BỘ trước render đầu tiên

### 2. Auto-save khi selections thay đổi
```typescript
useEffect(() => {
  localStorage.setItem('pc-builder-selections', JSON.stringify(selected));
  console.log('[CurrentPCForm] Saved selections to localStorage');
}, [selected]);
```

### 3. Notification khi restore thành công
```typescript
const [showRestoreNotification, setShowRestoreNotification] = useState(false);

useEffect(() => {
  const hasRestoredSelections = Object.values(selected).some(item => item !== null);
  if (hasRestoredSelections) {
    console.log('[CurrentPCForm] Restored selections from localStorage');
    setShowRestoreNotification(true);
    setTimeout(() => setShowRestoreNotification(false), 4000);
  }
}, []); // Run only once on mount
```

```tsx
{showRestoreNotification && (
  <div className="mb-6 rounded-lg bg-green-light-6 p-4 border-2 border-green">
    <CheckCircleIcon className="w-5 h-5" />
    <span>✅ Đã khôi phục các linh kiện bạn đã chọn trước đó!</span>
  </div>
)}
```

---

## 🧪 Test Cases

### Test 1: Basic Persistence
```
1. Chọn CPU, GPU, RAM, PSU
2. Console log: "[CurrentPCForm] Saved selections to localStorage"
3. Nhấn "Phân tích cấu hình"
4. Xem kết quả analysis
5. Nhấn "← Quay lại"
6. Console log: "[CurrentPCForm] Loaded saved selections: {...}"
7. Console log: "[CurrentPCForm] Restored selections from localStorage"
8. ✅ Check: Tất cả selections vẫn còn!
9. ✅ Check: Notification xanh hiện "Đã khôi phục..."
```

### Test 2: Partial Selection
```
1. Chọn chỉ CPU và GPU (không chọn RAM, PSU)
2. Nhấn "Phân tích" → Error (thiếu required fields)
3. Refresh page (F5)
4. ✅ Check: CPU và GPU vẫn được chọn
5. ✅ Check: Notification hiện "Đã khôi phục..."
```

### Test 3: Clear Individual Item
```
1. Chọn đầy đủ CPU, GPU, RAM, PSU
2. Click X để xóa CPU
3. Console log: "[CurrentPCForm] Saved selections to localStorage"
4. Refresh page (F5)
5. ✅ Check: GPU, RAM, PSU vẫn còn
6. ✅ Check: CPU đã bị xóa
```

### Test 4: Clear All
```
1. Chọn nhiều linh kiện
2. Click "🗑️ Xóa tất cả lựa chọn"
3. Confirm dialog xuất hiện
4. Click OK
5. ✅ Check: Tất cả selections bị xóa
6. ✅ Check: localStorage.getItem('pc-builder-selections') = null
7. Refresh page (F5)
8. ✅ Check: Không có selections nào
9. ✅ Check: Không hiện notification
```

### Test 5: Multiple Round Trips
```
1. Chọn cấu hình A (i5 + RTX 3060)
2. Phân tích → Xem kết quả → Quay lại
3. ✅ Check: Cấu hình A vẫn còn
4. Thay GPU → RTX 4070
5. Phân tích → Xem kết quả → Quay lại
6. ✅ Check: i5 + RTX 4070 (updated)
7. Thay CPU → i9
8. Phân tích → Xem kết quả → Quay lại
9. ✅ Check: i9 + RTX 4070 (updated again)
```

---

## 📊 Console Logs to Watch

### On Initial Load (với saved data):
```
[CurrentPCForm] Loaded saved selections: { cpu: {...}, gpu: {...}, ... }
[CurrentPCForm] Restored selections from localStorage
```

### On Selection Change:
```
[CurrentPCForm] Saved selections to localStorage
```

### On Clear All:
```
(localStorage.removeItem called, no more data)
```

---

## 🎯 Expected Behavior

### ✅ CORRECT (After Fix):
```
User Flow:
1. Select components
2. Click "Phân tích"
3. View analysis
4. Click "Quay lại"
5. ✅ All selections STILL THERE
6. Green notification: "Đã khôi phục..."
7. User can adjust and analyze again
```

### ❌ INCORRECT (Before Fix):
```
User Flow:
1. Select components
2. Click "Phân tích"
3. View analysis
4. Click "Quay lại"
5. ❌ All selections GONE
6. User must select everything AGAIN
```

---

## 🔍 Debugging Tips

### Check localStorage in DevTools:
```javascript
// Application tab → Local Storage → localhost:3000
localStorage.getItem('pc-builder-selections')

// Should return:
'{"cpu":{"id":"...","title":"...","price":5000000},"gpu":{...},...}'
```

### Force clear if stuck:
```javascript
// Run in Console:
localStorage.removeItem('pc-builder-selections');
location.reload();
```

### Check if SSR issue:
```typescript
// Our code handles this:
if (typeof window === 'undefined') {
  return { /* empty state */ };
}
// → Safe for Next.js SSR
```

---

## 📝 Technical Notes

### Why `useState(function)` instead of `useState(value)`?

```typescript
// ❌ BAD - Value được tính mỗi lần render:
const [state, setState] = useState(expensiveOperation());

// ✅ GOOD - Function chỉ được gọi 1 lần khi mount:
const [state, setState] = useState(() => expensiveOperation());
// or
const [state, setState] = useState(expensiveOperation);  // Function reference
```

In our case:
```typescript
// ✅ Function được gọi 1 lần, trả về initial state từ localStorage
const [selected, setSelected] = useState(loadSavedSelections);
```

### Lazy Initial State Pattern
- React official docs: https://react.dev/reference/react/useState#avoiding-recreating-the-initial-state
- Only evaluated once during initial render
- Perfect for expensive operations (localStorage read)

---

## ✅ Status

**Fixed Files:**
- `src/components/Upgrade/CurrentPCForm.tsx`

**Changes:**
1. Moved localStorage load to lazy initial state (line ~50)
2. Removed separate useEffect for loading (eliminated race condition)
3. Added restore notification with auto-hide (4 seconds)
4. Added console.log for debugging

**Testing:** Ready for user testing

**No Breaking Changes:** ✅ Backward compatible

---

**Last Updated:** December 16, 2025  
**Issue:** Selections lost after analyze → back navigation  
**Fix:** Lazy initial state + synchronous localStorage load  
**Result:** ✅ Selections now persist correctly
