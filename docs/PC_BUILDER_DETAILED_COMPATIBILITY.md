# Nâng Cấp Hệ Thống Compatibility - Detailed Warnings & Recommendations

## Tổng quan

Đã nâng cấp hệ thống PC Builder Compatibility với **messages chi tiết cực kỳ**, bao gồm:
- ✅ **3 severity levels**: Error, Warning, Info
- ✅ **Detailed technical explanations**: Giải thích vấn đề kỹ thuật
- ✅ **Actionable recommendations**: Gợi ý giải pháp cụ thể
- ✅ **Component tracking**: Hiển thị linh kiện bị ảnh hưởng
- ✅ **Real-world context**: Thông tin thực tế về hardware

---

## Severity Levels

### 🔴 ERROR (Không thể lắp ráp)
Linh kiện hoàn toàn không tương thích - không thể lắp vật lý hoặc sẽ hỏng hóc.

**Ví dụ:**
- Socket không khớp (LGA1700 ≠ AM5)
- GPU quá dài không vừa case
- RAM type không khớp (DDR4 ≠ DDR5)
- Quá nhiều thanh RAM cho số khe
- Tản nhiệt quá cao không vừa case

### 🟡 WARNING (Hoạt động nhưng không tối ưu)
Linh kiện vẫn lắp được và chạy nhưng hiệu suất/độ ồn/nhiệt độ không tối ưu.

**Ví dụ:**
- RAM speed cao hơn mainboard (sẽ downclocking)
- Cooler TDP rating hơi thấp (vẫn tản được nhưng ồn/nóng)
- PSU wattage hơi thấp (60-80% load)
- Mainboard nhỏ trong case lớn (thẩm mỹ)

### 🟢 INFO (Thông tin hữu ích)
Thông tin bổ sung giúp người dùng hiểu rõ hơn về build.

**Ví dụ:**
- PSU wattage dư thừa tốt (< 50% load)
- Các lưu ý về vị trí lắp đặt
- Tips tối ưu hiệu suất

---

## Detailed Messages By Category

### 1. CPU ↔ MAINBOARD: Socket Compatibility

#### Error: Socket Mismatch
```typescript
{
  severity: "error",
  message: "❌ Socket không khớp: CPU Intel Core i5-14400F (LGA1700) không tương thích với Mainboard MSI MAG B650 (AM5)",
  details: "CPU sử dụng socket LGA1700 chỉ có thể lắp vào mainboard có socket tương ứng. Đây là yếu tố quan trọng nhất - không thể lắp ráp nếu socket không khớp.",
  recommendation: "Chọn mainboard có socket LGA1700 hoặc chọn CPU có socket AM5.",
  affectedComponents: ["cpu", "mainboard"]
}
```

---

### 2. COOLER ↔ CPU: Socket & TDP

#### Error: Socket Not Supported
```typescript
{
  severity: "error",
  message: "❌ Tản nhiệt không hỗ trợ socket CPU: Noctua NH-D15 (LGA1200) không hỗ trợ CPU AMD Ryzen 9 7950X (AM5)",
  details: "Tản nhiệt này hỗ trợ các socket: LGA1200. CPU của bạn sử dụng socket AM5.",
  recommendation: "Chọn tản nhiệt hỗ trợ socket AM5 hoặc kiểm tra bracket tương thích từ nhà sản xuất.",
}
```

#### Error: TDP Very Low (>30W difference)
```typescript
{
  severity: "error",
  message: "❌ Công suất tản nhiệt không đủ: CPU AMD Ryzen 9 7950X (170W) quá cao cho tản nhiệt Hyper 212 (150W)",
  details: "TDP của CPU vượt quá khả năng tản nhiệt 20W. CPU sẽ bị throttle (giảm hiệu suất) hoặc tắt máy khi nhiệt độ quá cao.",
  recommendation: "Chọn tản nhiệt có TDP rating ít nhất 190W để đảm bảo hoạt động ổn định.",
}
```

#### Warning: TDP Low (0-30W difference)
```typescript
{
  severity: "warning",
  message: "⚠️ Công suất tản nhiệt hơi thấp: CPU Intel Core i7-14700K (125W) gần giới hạn tản nhiệt DeepCool AK400 (150W)",
  details: "TDP của CPU chỉ thấp hơn khả năng tản nhiệt 25W. Tản nhiệt vẫn hoạt động được nhưng sẽ chạy ở tốc độ cao, có thể ồn và nhiệt độ CPU sẽ cao hơn.",
  recommendation: "Để hiệu suất và độ ồn tốt hơn, nên chọn tản nhiệt có TDP rating 175W trở lên.",
}
```

#### Error: Height Too Tall
```typescript
{
  severity: "error",
  message: "❌ Tản nhiệt quá cao: Noctua NH-D15 (165mm) không vừa trong case NZXT H510 (giới hạn 160mm)",
  details: "Chiều cao tản nhiệt vượt quá khoảng trống của case 5mm. Không thể đóng nắp case hoặc tản nhiệt sẽ bị cong/hỏng.",
  recommendation: "Chọn tản nhiệt có chiều cao tối đa 155mm hoặc chọn case có khoảng trống lớn hơn.",
}
```

---

### 3. RAM ↔ MAINBOARD: Type, Modules, Capacity, Speed

#### Error: RAM Type Mismatch
```typescript
{
  severity: "error",
  message: "❌ Loại RAM không khớp: Kingston Fury Beast DDR4-3200 (DDR4) không tương thích với mainboard MSI MPG Z790 (DDR5)",
  details: "DDR4 và DDR5 có cấu trúc vật lý khác nhau - không thể lắp nhầm. Khe RAM trên mainboard chỉ hỗ trợ một loại.",
  recommendation: "Chọn RAM loại DDR5 để tương thích với mainboard.",
}
```

#### Error: Too Many Modules
```typescript
{
  severity: "error",
  message: "❌ Quá nhiều thanh RAM: Tổng 6 thanh RAM không vừa trong 4 khe của mainboard",
  details: "RAM đã chọn: G.Skill Trident Z5 32GB (2x16GB), Corsair Vengeance 32GB (2x16GB), Kingston Fury 32GB (2x16GB). Mainboard MSI MPG Z790 chỉ có 4 khe RAM nhưng bạn đang chọn tổng cộng 6 thanh.",
  recommendation: "Chọn ít kit RAM hơn (tổng ≤4 thanh) hoặc chọn mainboard có nhiều khe RAM hơn.",
}
```

#### Error: Total Capacity Too High (>32GB over)
```typescript
{
  severity: "error",
  message: "❌ Dung lượng RAM vượt quá: Tổng 192GB vượt giới hạn mainboard 128GB",
  details: "Mainboard chỉ hỗ trợ tối đa 128GB RAM. Bạn đang chọn tổng 192GB (vượt 64GB).",
  recommendation: "Giảm dung lượng RAM xuống ≤128GB hoặc chọn mainboard hỗ trợ dung lượng lớn hơn.",
}
```

#### Warning: Capacity Close to Limit
```typescript
{
  severity: "warning",
  message: "⚠️ Dung lượng RAM hơi cao: Tổng 120GB gần giới hạn mainboard 128GB",
  details: "Mainboard hỗ trợ tối đa 128GB. Bạn đang dùng 120GB (còn 8GB).",
  recommendation: "Vẫn hoạt động nhưng không còn chỗ nâng cấp. Cân nhắc mainboard hỗ trợ dung lượng cao hơn nếu dự định nâng cấp sau.",
}
```

#### Warning: RAM Speed Too High
```typescript
{
  severity: "warning",
  message: "⚠️ Tốc độ RAM cao hơn mainboard: Corsair Dominator DDR5-6400 (6400MHz) sẽ chạy ở tốc độ thấp hơn (6000MHz)",
  details: "RAM vẫn hoạt động bình thường nhưng sẽ tự động chạy ở tốc độ 6000MHz thay vì 6400MHz. Đây là tính năng downclocking tự động.",
  recommendation: "Để tận dụng hiệu suất, chọn mainboard hỗ trợ tốc độ 6400MHz hoặc chọn RAM 6000MHz để phù hợp với mainboard.",
}
```

---

### 4. GPU ↔ CASE & PSU: Physical & Power

#### Error: GPU Too Long
```typescript
{
  severity: "error",
  message: "❌ GPU quá dài: ASUS ROG Strix RTX 4090 (357mm) không vừa trong case Corsair 4000D (giới hạn 360mm)",
  details: "GPU dài hơn khoảng trống của case -3mm. Không thể lắp GPU hoặc sẽ đụng vào ổ cứng/PSU/fan.",
  recommendation: "Chọn GPU có chiều dài tối đa 350mm hoặc chọn case có khoảng trống lớn hơn 377mm. Một số case cho phép tháo drive cage để tăng khoảng trống.",
}
```

#### Error: PSU Power Very Low (>80% usage)
```typescript
{
  severity: "error",
  message: "❌ Nguồn không đủ công suất: GPU RTX 4090 (450W) quá cao cho PSU Thermaltake Smart 500W (500W)",
  details: "GPU chiếm 90.0% công suất PSU. Chưa tính CPU/GPU khác, mainboard, RAM, ổ cứng, và các thiết bị khác. PSU sẽ quá tải, có thể tắt máy hoặc hỏng.",
  recommendation: "Khuyến nghị PSU có công suất ít nhất 1100W để đảm bảo hệ thống ổn định. Quy tắc: tổng TDP không nên vượt quá 80% công suất PSU.",
}
```

#### Warning: PSU Power Medium (60-80% usage)
```typescript
{
  severity: "warning",
  message: "⚠️ Nguồn hơi thấp: GPU RTX 4080 (320W) chiếm 64.0% công suất PSU Cooler Master MWE 500W (500W)",
  details: "Công suất còn lại có thể không đủ cho toàn hệ thống. PSU hoạt động hiệu quả nhất ở 50-80% tải.",
  recommendation: "Nên chọn PSU 600W trở lên để có headroom thoải mái cho nâng cấp sau này.",
}
```

#### Info: PSU Power Good (<60% usage)
```typescript
{
  severity: "info",
  message: "✅ Công suất PSU đủ: GPU RTX 4070 SUPER (220W) chiếm 44.0% PSU Seasonic GX-850 (500W)",
  details: "Công suất dư thừa tốt cho hệ thống. PSU hoạt động trong vùng hiệu quả.",
}
```

---

### 5. FORM FACTOR COMPATIBILITY

#### Error: PSU/MB Form Factor Mismatch
```typescript
{
  severity: "error",
  message: "❌ Form factor không khớp: Mainboard ASUS ROG Maximus Z790 (ATX) không vừa với case Cooler Master Q300L (Micro-ATX)",
  details: "Mainboard ATX có kích thước vật lý không tương thích với case Micro-ATX. Lỗ bắt vít và kích thước không khớp.",
  recommendation: "Chọn case ATX hoặc mainboard Micro-ATX.",
}
```

#### Warning: Smaller Board in Larger Case
```typescript
{
  severity: "warning",
  message: "⚠️ Mainboard nhỏ trong case lớn: MSI MAG B650 (Micro-ATX) nhỏ hơn case Fractal Torrent (ATX)",
  details: "Mainboard Micro-ATX có thể lắp vào case ATX nhưng sẽ trông trống và có thể gặp vấn đề với vị trí lỗ bắt vít.",
  recommendation: "Case vẫn dùng được nhưng nên chọn case Micro-ATX để phù hợp hơn về thẩm mỹ và kích thước.",
}
```

---

## Enhanced Type Definition

```typescript
export type CompatibilityIssue = {
  ruleId: string;
  severity: "error" | "warning" | "info";
  message: string;                  // Short, user-friendly message
  details?: string;                 // Technical explanation
  recommendation?: string;          // Actionable solution
  leftProductId?: string;
  leftProductName?: string;
  rightProductId?: string;
  rightProductName?: string;
  affectedComponents?: string[];   // e.g., ["cpu", "mainboard"]
};
```

---

## UI Display Recommendations

### Error Display (Red)
```tsx
<div className="border-2 border-red-500 bg-red-50 p-4 rounded-lg">
  <div className="flex items-start gap-3">
    <XCircleIcon className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
    <div className="flex-1">
      <h4 className="font-semibold text-red-800 mb-1">
        {issue.message}
      </h4>
      {issue.details && (
        <p className="text-sm text-red-700 mb-2">
          {issue.details}
        </p>
      )}
      {issue.recommendation && (
        <div className="bg-white border border-red-200 rounded p-3 mt-2">
          <p className="text-sm text-gray-700">
            <strong>💡 Gợi ý:</strong> {issue.recommendation}
          </p>
        </div>
      )}
      {issue.affectedComponents && (
        <div className="flex gap-2 mt-3">
          {issue.affectedComponents.map(comp => (
            <span key={comp} className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
              {comp}
            </span>
          ))}
        </div>
      )}
    </div>
  </div>
</div>
```

### Warning Display (Yellow)
```tsx
<div className="border-2 border-yellow-500 bg-yellow-50 p-4 rounded-lg">
  <div className="flex items-start gap-3">
    <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
    <div className="flex-1">
      <h4 className="font-semibold text-yellow-800 mb-1">
        {issue.message}
      </h4>
      {issue.details && (
        <p className="text-sm text-yellow-700 mb-2">
          {issue.details}
        </p>
      )}
      {issue.recommendation && (
        <div className="bg-white border border-yellow-200 rounded p-3 mt-2">
          <p className="text-sm text-gray-700">
            <strong>💡 Khuyến nghị:</strong> {issue.recommendation}
          </p>
        </div>
      )}
    </div>
  </div>
</div>
```

### Info Display (Blue)
```tsx
<div className="border border-blue-300 bg-blue-50 p-4 rounded-lg">
  <div className="flex items-start gap-3">
    <InformationCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
    <div className="flex-1">
      <p className="text-sm text-blue-700">
        {issue.message}
      </p>
      {issue.details && (
        <p className="text-xs text-blue-600 mt-1">
          {issue.details}
        </p>
      )}
    </div>
  </div>
</div>
```

---

## Collapsible Detailed View

```tsx
<Disclosure>
  {({ open }) => (
    <>
      <Disclosure.Button className="flex items-center justify-between w-full">
        <span className="font-semibold">{issue.message}</span>
        <ChevronUpIcon className={`${open ? 'rotate-180 transform' : ''} h-5 w-5`} />
      </Disclosure.Button>
      
      <Disclosure.Panel className="mt-3 space-y-2">
        {issue.details && (
          <div className="bg-white rounded p-3">
            <h5 className="text-xs font-semibold uppercase text-gray-500 mb-1">
              Chi tiết kỹ thuật
            </h5>
            <p className="text-sm text-gray-700">{issue.details}</p>
          </div>
        )}
        
        {issue.recommendation && (
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <h5 className="text-xs font-semibold uppercase text-blue-700 mb-1">
              💡 Giải pháp đề xuất
            </h5>
            <p className="text-sm text-blue-900">{issue.recommendation}</p>
          </div>
        )}
        
        <div className="flex gap-2 pt-2">
          <button className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded">
            Xem sản phẩm tương thích
          </button>
          <button className="text-xs bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded">
            Tìm hiểu thêm
          </button>
        </div>
      </Disclosure.Panel>
    </>
  )}
</Disclosure>
```

---

## Summary Card

Hiển thị tổng quan trước khi vào chi tiết:

```tsx
<div className="bg-white border-2 rounded-lg p-4 mb-4">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg font-bold">Tổng quan tương thích</h3>
    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
      errorCount > 0 ? 'bg-red-100 text-red-700' :
      warningCount > 0 ? 'bg-yellow-100 text-yellow-700' :
      'bg-green-100 text-green-700'
    }`}>
      {errorCount > 0 ? `${errorCount} lỗi` :
       warningCount > 0 ? `${warningCount} cảnh báo` :
       '✓ Tương thích tốt'}
    </span>
  </div>
  
  <div className="grid grid-cols-3 gap-4 text-center">
    <div>
      <div className="text-2xl font-bold text-red-600">{errorCount}</div>
      <div className="text-xs text-gray-600">Lỗi nghiêm trọng</div>
    </div>
    <div>
      <div className="text-2xl font-bold text-yellow-600">{warningCount}</div>
      <div className="text-xs text-gray-600">Cảnh báo</div>
    </div>
    <div>
      <div className="text-2xl font-bold text-blue-600">{infoCount}</div>
      <div className="text-xs text-gray-600">Thông tin</div>
    </div>
  </div>
</div>
```

---

## Testing

```bash
# Test detailed messages
node prisma/test-detailed-compatibility.cjs

# Check compatibility rules
node prisma/check-compat-rules.cjs

# Run dev server
npm run dev

# Navigate to PC Builder
http://localhost:3000/pc-builder
```

### Test Scenarios

1. **Socket Mismatch**: Intel CPU + AMD Mainboard
2. **RAM Type**: DDR4 RAM + DDR5 Mainboard
3. **GPU Length**: RTX 4090 + Small Case
4. **Too Many Modules**: 3 kits (6 modules) + 4-slot MB
5. **RAM Speed Warning**: DDR5-6400 + 6000MHz MB
6. **Cooler Height**: 165mm cooler + 160mm case

---

## Future Enhancements

### 1. Storage Interface Warning
```typescript
// NVMe needs M.2 slots
if (storageInterface === 'NVMe' && mbM2Slots === 0) {
  severity = "error";
  message = "❌ Mainboard không có khe M.2 cho NVMe";
  details = "Ổ NVMe cần khe M.2 trên mainboard. Mainboard này chỉ có SATA ports.";
  recommendation = "Chọn ổ SATA hoặc mainboard có khe M.2.";
}
```

### 2. PCIe Lane Allocation
```typescript
// GPU in PCIe x8 slot warning
message = "⚠️ GPU lắp ở khe PCIe x8 sẽ giảm hiệu suất";
details = "GPU RTX 4090 cần PCIe 4.0 x16 để hoạt động tối đa. Khe x8 có thể giảm 5-10% hiệu suất.";
```

### 3. Power Connector Validation
```typescript
// 12VHPWR connector check
message = "⚠️ Cần adapter 12VHPWR";
details = "GPU dùng chuẩn 12VHPWR mới. PSU cũ cần adapter 3x8-pin sang 12VHPWR.";
```

### 4. Installation Notes
```typescript
// RAM installation guide
recommendation = "Lắp RAM vào khe A2 và B2 (khe 2 và 4 từ CPU) để chạy dual channel.";

// AIO radiator placement
recommendation = "Radiator 360mm nên lắp ở mặt trước hoặc trên case. Kiểm tra vị trí tube.";
```

---

## Files Modified

- ✅ `src/lib/compatibility.ts` - Enhanced với detailed messages
- ✅ `docs/PC_BUILDER_DETAILED_COMPATIBILITY.md` - Documentation
- ✅ `prisma/test-detailed-compatibility.cjs` - Test script

---

**Version**: 3.0 (Detailed Warnings & Recommendations)
**Date**: December 2024
