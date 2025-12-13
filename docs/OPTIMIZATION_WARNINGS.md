# Optimization Warnings System - Hệ Thống Cảnh Báo Tối Ưu Hóa

## Tổng quan

Đã thêm **6 loại optimization warnings** để phát hiện các cấu hình tương thích về mặt vật lý nhưng không tối ưu về hiệu suất/giá trị. Đây là những warnings **bên cạnh** compatibility errors - giúp người dùng tránh lãng phí tiền và xây dựng build tối ưu nhất.

---

## ⚠️ 6 Optimization Warnings

### 1. **K-series CPU + B-series Chipset** (Intel)
**Trường hợp**: Intel Core i9-14900K + MSI MAG B760 Tomahawk WiFi

```typescript
{
  severity: "warning",
  message: "⚠️ CPU cao cấp với chipset phổ thông: Intel Core i9-14900K (K-series) + MSI MAG B760 (B760)",
  details: "CPU Intel Core i9-14900K là phiên bản K-series có khả năng overclock, nhưng chipset B760 KHÔNG hỗ trợ overclock. CPU sẽ chạy ở tốc độ stock và không thể tăng xung. Ngoài ra, VRM của B760 có thể không đủ mạnh để CPU duy trì boost clocks lâu dài, dẫn đến throttling và hiệu suất thấp hơn kỳ vọng.",
  recommendation: "Để tận dụng tối đa hiệu năng CPU K-series:
    • Chọn mainboard chipset Z790 (Intel 13th/14th gen) hoặc Z690 (Intel 12th gen) để có thể overclock
    • Hoặc chọn CPU non-K (như i5-14400F, i7-14700) để tiết kiệm chi phí vì không cần overclock
    • Chipset Z có VRM mạnh hơn, hỗ trợ CPU chạy boost cao hơn và ổn định hơn"
}
```

**Vấn đề**:
- ❌ Không overclock được CPU K-series (lãng phí tiền mua CPU đắt)
- ❌ VRM B-series yếu hơn, CPU không duy trì boost clocks tối đa
- ❌ Throttling khi load cao
- ❌ Không tận dụng tiềm năng CPU

**Giải pháp**:
- ✅ Chọn Z790/Z690 mainboard → Overclock được, VRM mạnh
- ✅ Hoặc chọn non-K CPU (i9-14900/i7-14700) → Tiết kiệm 2-3tr
- ✅ Hoặc chọn CPU thấp hơn nếu không cần hiệu suất cao

---

### 2. **High-end CPU + Budget Chipset** (i9/Ryzen 9 + B760/B650)
**Trường hợp**: Intel Core i9-14900K + MSI MAG B760 (hoặc Ryzen 9 7950X + B650)

```typescript
{
  severity: "warning",
  message: "⚠️ CPU cao cấp với mainboard phổ thông: Intel Core i9-14900K + MSI MAG B760",
  details: "CPU i9 là dòng cao cấp nhất với TDP và power draw rất cao, đặc biệt khi chạy boost. Mainboard B760 là chipset phổ thông với VRM (nguồn CPU) không được thiết kế cho CPU cao cấp. Kết quả:
    • VRM quá nóng, có thể throttle CPU
    • CPU không duy trì được boost clocks tối đa
    • Tuổi thọ VRM giảm do chạy quá tải liên tục
    • Tiếng ồn quạt tăng do VRM nóng",
  recommendation: "Với CPU i9/Ryzen 9, nên chọn:
    • Intel: Chipset Z790 hoặc Z690 (VRM mạnh, nhiều phase hơn)
    • AMD: Chipset X670E hoặc X670 (VRM mạnh cho Ryzen 9)
    • Mainboard giá từ 8-10 triệu trở lên để đảm bảo VRM chất lượng
    • Hoặc giảm xuống CPU i7/Ryzen 7 nếu muốn dùng mainboard phổ thông"
}
```

**Vấn đề**:
- ❌ VRM quá tải → nóng, throttle
- ❌ CPU không chạy full boost (mất 10-15% hiệu suất)
- ❌ Tuổi thọ VRM giảm
- ❌ Quạt VRM ồn liên tục

**Giải pháp**:
- ✅ Z790/X670E mainboard (VRM 14-16 phase, mạnh mẽ)
- ✅ Mainboard ≥ 8-10 triệu (đảm bảo VRM chất lượng)
- ✅ Hoặc giảm xuống i7/Ryzen 7 nếu budget mainboard hạn chế

---

### 3. **High-end GPU + Low Efficiency PSU** (RTX 4080/4090 + Bronze PSU)
**Trường hợp**: ASUS ROG Strix RTX 4090 (450W) + Cooler Master MWE 650W 80+ Bronze

```typescript
{
  severity: "warning",
  message: "⚠️ GPU cao cấp với PSU hiệu suất thấp: RTX 4090 (450W) + PSU 80+ Bronze",
  details: "GPU RTX 4090 tiêu thụ 450W ở TDP và có thể lên đến 540W khi boost. PSU 80+ Bronze có hiệu suất chuyển đổi thấp (80-85%), nghĩa là:
    • Lãng phí ~68W điện năng thành nhiệt
    • Hóa đơn tiền điện cao hơn ~15-20% so với PSU 80+ Gold
    • PSU nóng hơn, quạt ồn hơn
    • Điện áp output không ổn định bằng PSU cao cấp, ảnh hưởng đến tuổi thọ GPU
    • Với 650W, công suất thực tế chỉ ~520W ở hiệu suất tối ưu",
  recommendation: "Với GPU cao cấp 450W+, nên chọn:
    • PSU 80+ Gold trở lên (hiệu suất 90-92%)
    • PSU 80+ Platinum/Titanium cho build cao cấp (93-95% hiệu suất)
    • Fully Modular để quản lý dây tốt hơn
    • Tiết kiệm điện: ~16kW/tháng (~48k VND/tháng với 3k/kWh)"
}
```

**Vấn đề**:
- ❌ Lãng phí điện 15-20%
- ❌ Tăng hóa đơn tiền điện (~500k-1tr/năm)
- ❌ PSU nóng, quạt ồn
- ❌ Điện áp không ổn định → ảnh hưởng tuổi thọ GPU

**Giải pháp**:
- ✅ 80+ Gold PSU (Corsair RM, Seasonic Focus GX)
- ✅ 80+ Platinum cho build > 50tr
- ✅ Tiết kiệm 500k-1tr/năm tiền điện

---

### 4. **Single Channel RAM** (1 module)
**Trường hợp**: Kingston Fury Beast 16GB (1x16GB)

```typescript
{
  severity: "warning",
  message: "⚠️ RAM chạy Single Channel: Kingston Fury Beast 16GB (1x16GB)",
  details: "RAM Kingston Fury Beast 16GB chỉ có 1 module (Single Channel). Hiệu suất RAM bị giảm 30-50% so với Dual Channel (2 modules):
    • Băng thông bộ nhớ giảm một nửa
    • FPS trong game giảm 5-15% (đặc biệt với CPU AMD)
    • Rendering/encoding chậm hơn
    • Multi-tasking bị ảnh hưởng
    • Không tận dụng được khả năng Dual Channel của mainboard",
  recommendation: "Luôn sử dụng RAM Dual Channel:
    • Chọn kit 2 modules (2x8GB, 2x16GB, 2x32GB)
    • Lắp vào khe A2 + B2 (khe 2 và 4 từ CPU) để chạy Dual Channel
    • Nếu cần nâng cấp, mua thêm 1 module giống hệt (khuyến nghị mua cùng lúc)
    • Quad Channel (4 modules) chỉ tăng hiệu suất 5-10% so với Dual, không đáng chi phí"
}
```

**Vấn đề**:
- ❌ Băng thông giảm 50%
- ❌ FPS game giảm 5-15%
- ❌ Rendering chậm hơn
- ❌ Không tận dụng dual channel

**Giải pháp**:
- ✅ Luôn mua kit 2 modules (2x8GB, 2x16GB)
- ✅ Lắp khe A2+B2 (khe 2 và 4)
- ✅ KHÔNG mua 1 module dù tiết kiệm hơn

---

### 5. **Slow RAM với High-end CPU** (DDR5 <5600 hoặc DDR4 <3200)
**Trường hợp**: Corsair Vengeance 32GB DDR5-5200 + Intel Core i9-14900K

```typescript
{
  severity: "info",
  message: "💡 RAM chậm với CPU cao cấp: Corsair Vengeance DDR5-5200 (5200MHz) + Intel Core i9-14900K",
  details: "CPU Intel Core i9-14900K là dòng cao cấp và sẽ hưởng lợi nhiều từ RAM nhanh. RAM 5200MHz là tốc độ cơ bản, chưa tối ưu hiệu suất:
    • CPU hiện đại rất nhạy với tốc độ RAM (đặc biệt AMD Ryzen)
    • Latency cao hơn ảnh hưởng đến gaming (0.1% low FPS)
    • Hiệu suất CPU giảm 10-15% trong gaming/rendering
    • Với CPU cao cấp, nên đầu tư RAM nhanh hơn để cân bằng",
  recommendation: "Để tối ưu hiệu suất với Intel Core i9-14900K:
    • DDR5: Chọn 6000MHz trở lên
    • AMD Ryzen nhạy RAM hơn Intel, nên ưu tiên tốc độ cao
    • Chú ý CAS Latency (CL): Thấp hơn = tốt hơn (CL30-36 cho DDR5)
    • Overclock RAM trong BIOS nếu mainboard hỗ trợ XMP/EXPO
    • Chênh lệch giá RAM 5200MHz vs 6000MHz chỉ ~500k-1tr nhưng hiệu suất tăng rõ rệt"
}
```

**Vấn đề**:
- 🟡 Mất 5-15% hiệu suất CPU (không critical nhưng tiếc)
- 🟡 0.1% low FPS thấp hơn trong game
- 🟡 Không tối ưu với CPU cao cấp

**Giải pháp**:
- ✅ DDR5-6000 hoặc cao hơn cho build cao cấp
- ✅ DDR4-3600 cho build DDR4
- ✅ Chênh lệch giá nhỏ (~500k-1tr) nhưng hiệu suất tăng rõ

---

### 6. **Budget Air Cooler với High TDP CPU** (Cooler <180W cho CPU 125W+)
**Trường hợp**: Cooler Master Hyper 212 (150W) cho Intel Core i9-14900K (125W TDP)

```typescript
{
  severity: "warning",
  message: "⚠️ Tản nhiệt phổ thông với CPU TDP cao: Hyper 212 (150W) cho i9-14900K (125W)",
  details: "CPU i9-14900K có TDP 125W và có thể tiêu thụ lên đến 188W khi chạy boost (PL2). Tản nhiệt Hyper 212 chỉ có rating 150W:
    • Headroom chỉ 25W, quá thấp cho CPU boost
    • Nhiệt độ CPU sẽ cao (80-95°C) khi load
    • CPU throttle (giảm xung) để giữ nhiệt độ an toàn
    • Quạt tản nhiệt chạy 100% tốc độ → rất ồn (50+ dB)
    • Tuổi thọ CPU có thể giảm do nhiệt độ cao liên tục",
  recommendation: "Với CPU 125W TDP, khuyến nghị:
    • Tản khí cao cấp: 200W+ rating (Noctua NH-D15, be quiet! Dark Rock Pro 4)
    • AIO 240mm/280mm cho CPU i7/Ryzen 7
    • AIO 360mm cho CPU i9/Ryzen 9
    • Nếu giữ tản nhiệt này: Giới hạn PL2 trong BIOS để giảm nhiệt (nhưng mất hiệu suất)
    • Budget tốt: 220W+ tower cooler (~2-3 triệu)"
}
```

**Vấn đề**:
- ❌ Nhiệt độ 80-95°C khi load
- ❌ CPU throttle → mất hiệu suất
- ❌ Quạt 100% tốc độ → ồn 50+ dB
- ❌ Giảm tuổi thọ CPU

**Giải pháp**:
- ✅ Tower cooler 220W+ (NH-D15, Dark Rock Pro 4)
- ✅ AIO 240mm cho i7/Ryzen 7
- ✅ AIO 360mm cho i9/Ryzen 9
- ✅ Đầu tư 2-4tr cho cooler tốt → yên tâm lâu dài

---

## New Attributes Added

```typescript
// CPU
CPU_SERIES: "K" | "KF" | "non-K"  // Intel K-series vs non-K
CPU_TIER: "High-end" | "Mid-range" | "Budget"  // i9/i7/i5

// Mainboard
MB_CHIPSET_TIER: "High-end" | "Mid-range" | "Budget"  // Z/B/H series
MB_SUPPORTS_OVERCLOCKING: "Yes" | "No"  // OC support
MB_VRM_QUALITY: "Excellent" | "Good" | "Average" | "Basic"  // VRM quality
```

---

## Chipset Tiers

### Intel LGA1700:
- **Z790**: High-end, OC Yes, VRM Excellent/Good
- **B760**: Mid-range, OC No, VRM Average/Good
- **H610**: Budget, OC No, VRM Basic

### AMD AM5:
- **X670E**: High-end, OC Yes, VRM Excellent/Good
- **B650**: Mid-range, OC Yes (AMD), VRM Average/Good
- **A620**: Budget, OC No, VRM Basic

### AMD AM4:
- **X570**: High-end, OC Yes, VRM Good
- **B550**: Mid-range, OC Yes, VRM Average/Good
- **A520**: Budget, OC No, VRM Basic

---

## Testing

```bash
# Run with test build
# SELECT: Intel i9-14900K + MSI B760 Tomahawk

# Expected warnings:
⚠️ CPU cao cấp với chipset phổ thông (K-series + B760)
⚠️ CPU cao cấp với mainboard phổ thông (i9 + B760 VRM)
```

---

## Files Modified

1. ✅ [src/lib/attributeTemplates.ts](src/lib/attributeTemplates.ts)
   - Added CPU_SERIES, CPU_TIER
   - Added MB_CHIPSET_TIER, MB_SUPPORTS_OVERCLOCKING, MB_VRM_QUALITY

2. ✅ [src/lib/compatibility.ts](src/lib/compatibility.ts)
   - Added checkOptimizationWarnings() function (+250 lines)
   - 6 optimization warning types

3. ✅ [scripts/generate-60-products.js](scripts/generate-60-products.js)
   - Updated mapCPUAttributes() to determine series/tier
   - Updated mapMainboardAttributes() to determine chipset tier/OC/VRM

4. ✅ [prisma/seed-optimization-attributes.cjs](prisma/seed-optimization-attributes.cjs)
   - Seeds 5 new AttributeTypes

---

## Summary

**Optimization Warnings Cover:**
1. ⚠️ K-series CPU + B-series chipset → Lãng phí CPU đắt
2. ⚠️ High-end CPU + Budget MB → VRM quá tải
3. ⚠️ High-end GPU + Bronze PSU → Lãng phí điện
4. ⚠️ Single channel RAM → Mất 30-50% bandwidth
5. 💡 Slow RAM + High-end CPU → Mất 5-15% hiệu suất
6. ⚠️ Budget cooler + High TDP CPU → Throttle, ồn

Giờ đây hệ thống không chỉ check compatibility vật lý mà còn đưa ra **lời khuyên tối ưu giá trị** cho người dùng! 🎉
