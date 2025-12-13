# UI Redesign - Màu Sắc & Risk Tags

## ✨ Những thay đổi mới

### 1. **Màu sắc dễ nhìn hơn**
Thay gradient chói sang màu pastel, nền trắng với border màu:

**Trước (màu chói):**
- ❌ Error: `from-red-50 to-rose-50` + border đỏ dày
- ⚠️ Warning: `from-yellow-50 to-amber-50` + border vàng dày  
- 💡 Info: `from-blue-50 to-cyan-50` + border xanh dày

**Sau (màu mềm):**
- ✅ Error: `bg-white` + `border-l-4 border-red-400` (trắng, viền trái đỏ)
- ✅ Warning: `bg-white` + `border-l-4 border-amber-400` (trắng, viền trái cam)
- ✅ Info: `bg-white` + `border-l-4 border-blue-400` (trắng, viền trái xanh)

**Icon:**
- Gradient nhẹ: `from-red-400 to-red-500` thay vì solid `bg-red-500`
- Bo tròn vuông: `rounded-lg` thay vì `rounded-full`
- Size nhỏ hơn: `w-5 h-5` thay vì `w-6 h-6`

---

### 2. **Risk Tags - Hiển thị rủi ro cụ thể**

Mỗi warning/error giờ có **tags hiển thị rủi ro** dựa trên nội dung:

#### 🔥 **Quá nhiệt** (Orange)
```
Trigger: "nóng", "nhiệt", "heat", "thermal", "throttle"
Icon: FireIcon
Color: text-orange-600 bg-orange-50 border-orange-200
```
Ví dụ: i9-14900K + B760 → CPU nóng, throttle

#### ⚡ **Tốn điện** (Yellow)
```
Trigger: "điện", "năng lượng", "power", "lãng phí", "hiệu suất thấp"
Icon: BoltIcon
Color: text-yellow-600 bg-yellow-50 border-yellow-200
```
Ví dụ: RTX 4090 + Bronze PSU → Lãng phí điện 15%

#### ⏳ **Giảm tuổi thọ** (Red)
```
Trigger: "tuổi thọ", "lifespan", "vrm", "giảm", "hỏng"
Icon: ClockIcon
Color: text-red-600 bg-red-50 border-red-200
```
Ví dụ: i9 + budget board → VRM quá tải, giảm tuổi thọ

#### 🐌 **Giảm hiệu suất** (Purple)
```
Trigger: "chậm", "hiệu suất giảm", "performance", "slow", "bandwidth"
Icon: SignalSlashIcon
Color: text-purple-600 bg-purple-50 border-purple-200
```
Ví dụ: Single channel RAM → Giảm 30-50% bandwidth

#### 💸 **Lãng phí tiền** (Green)
```
Trigger: "lãng phí", "tiền", "k-series", "overclock", "waste"
Icon: CurrencyDollarIcon
Color: text-green-600 bg-green-50 border-green-200
```
Ví dụ: K-CPU + B-chipset → Trả thêm tiền nhưng không OC được

---

### 3. **Layout mới**

```
┌─────────────────────────────────────────────┐
│ 🚫 [⚠️ CẢNH BÁO] [CPU] [MAINBOARD]         │ ← Badges
│                                             │
│ [🔥 Quá nhiệt] [⚡ Tốn điện] [⏳ Tuổi thọ] │ ← Risk tags
│                                             │
│ CPU cao cấp với chipset phổ thông           │ ← Message
│ Intel i9-14900KF × MSI MAG B760            │ ← Products
│                                             │
│ ⌄ Click để xem chi tiết                    │
└─────────────────────────────────────────────┘
```

**Khi expand:**
```
┌─ Chi tiết kỹ thuật ─────────────────────┐
│ CPU K-series có OC nhưng B760 không...  │
│ VRM không đủ mạnh cho i9...             │
└──────────────────────────────────────────┘

┌─ 💡 Giải pháp đề xuất ──────────────────┐
│ • Chọn mainboard Z790 để overclock      │
│ • Hoặc chọn CPU non-K để tiết kiệm      │
└──────────────────────────────────────────┘
```

---

## 📊 So sánh trước/sau

### **Trước:**
- ❌ Gradient sáng chói, khó nhìn
- ❌ Chỉ hiển thị message chung chung
- ❌ Không rõ rủi ro cụ thể gì
- ❌ Border dày, màu đậm

### **Sau:**
- ✅ Nền trắng, viền màu nhẹ, dễ nhìn
- ✅ Hiển thị rõ 5 loại rủi ro với icons
- ✅ User biết ngay: Nóng? Tốn điện? Giảm tuổi thọ?
- ✅ Border mỏng, clean, professional

---

## 🎨 Màu sắc cụ thể

### **Summary badges** (đầu trang):
```tsx
// Error badge
bg-red-50 text-red-700 border-red-200

// Warning badge
bg-amber-50 text-amber-700 border-amber-200

// Info badge
bg-blue-50 text-blue-700 border-blue-200
```

### **Issue cards:**
```tsx
// Error
bg-white border-l-4 border-red-400
iconBg: from-red-400 to-red-500

// Warning
bg-white border-l-4 border-amber-400
iconBg: from-amber-400 to-orange-500

// Info
bg-white border-l-4 border-blue-400
iconBg: from-blue-400 to-cyan-500
```

### **Risk tags:**
```tsx
// Heat (Orange)
text-orange-600 bg-orange-50 border-orange-200

// Power (Yellow)
text-yellow-600 bg-yellow-50 border-yellow-200

// Lifespan (Red)
text-red-600 bg-red-50 border-red-200

// Performance (Purple)
text-purple-600 bg-purple-50 border-purple-200

// Money (Green)
text-green-600 bg-green-50 border-green-200
```

---

## 🚀 Test cases

### **Case 1: i9-14900KF + B760**
Expected risks:
- 🔥 Quá nhiệt (CPU nóng, throttle)
- ⚡ Tốn điện (VRM không hiệu quả)
- ⏳ Giảm tuổi thọ (VRM quá tải)
- 💸 Lãng phí tiền (K-series không OC)

### **Case 2: RTX 4090 + Bronze PSU**
Expected risks:
- ⚡ Tốn điện (hiệu suất thấp 80%)

### **Case 3: Single RAM module**
Expected risks:
- 🐌 Giảm hiệu suất (bandwidth giảm 50%)

### **Case 4: DDR5-5200 + i9**
Expected risks:
- 🐌 Giảm hiệu suất (RAM chậm)

### **Case 5: Budget cooler + 125W CPU**
Expected risks:
- 🔥 Quá nhiệt (cooler yếu)

---

## ✅ Summary

**Improvements:**
1. ✅ Màu sắc mềm mại, dễ nhìn (white bg + colored border-left)
2. ✅ 5 risk tags với icons rõ ràng
3. ✅ Text đen (gray-900) dễ đọc hơn text màu
4. ✅ Border mỏng, clean
5. ✅ Icons vuông bo tròn (modern) thay vì tròn
6. ✅ Smaller icons (w-5 h-5) nhìn cân đối hơn

**Result:** UI professional, dễ nhìn, thông tin rõ ràng! 🎯
