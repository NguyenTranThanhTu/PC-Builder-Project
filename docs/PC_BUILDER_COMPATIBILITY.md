# PC Builder Compatibility System

## Tổng quan

Hệ thống tương thích (Compatibility System) của PC Builder đảm bảo rằng các linh kiện được chọn có thể hoạt động cùng nhau. System sử dụng database-driven rules và logic đặc biệt để kiểm tra tính tương thích giữa các linh kiện.

## Kiến trúc

### 1. Database Schema

**CompatibilityRule Table:**
```typescript
{
  id: string
  leftCategoryId: string | null  // Category bên trái (hoặc ANY nếu null)
  rightCategoryId: string | null  // Category bên phải (hoặc ANY nếu null)
  leftAttributeTypeId: string     // Attribute type để so sánh bên trái
  rightAttributeTypeId: string | null  // Attribute type để so sánh bên phải
  operator: Operator  // EQ, NEQ, LT, LTE, GT, GTE
  compareNumber: number | null
  compareString: string | null
  note: string | null  // Ghi chú giải thích rule
}
```

### 2. Core Files

- **`prisma/seed-compat.cjs`**: Seed compatibility rules vào database
- **`src/lib/compatibility.ts`**: Logic đánh giá tính tương thích
- **`src/lib/attributeTemplates.ts`**: Định nghĩa các attribute types

### 3. Evaluation Logic

**evaluateCompatibility(productIds: string[])**
- Fetch products với attributes và rules từ database
- Gọi `checkCompatibilityRules()` để kiểm tra từng rule
- Trả về `{ ok: boolean, issues: CompatibilityIssue[], suggestions: Suggestion[] }`

**checkCompatibilityRules({ products, rules })**
- Xử lý 3 loại logic:
  1. **Sum-based checks**: Tổng các giá trị (RAM modules, RAM capacity)
  2. **Socket compatibility**: Multi-socket support (LGA1700/AM5/AM4)
  3. **Pairwise comparisons**: So sánh từng cặp products

## Compatibility Rules (13 rules)

### 1. CPU ↔ MAINBOARD (1 rule)

#### Rule 1.1: Socket Matching
```
CPU_SOCKET == MB_SOCKET
```
- **Mục đích**: CPU socket phải khớp với mainboard socket
- **Ví dụ**: LGA1700 CPU chỉ tương thích với LGA1700 mainboard
- **Operator**: EQ (Equal)

---

### 2. COOLER ↔ CPU & CASE (3 rules)

#### Rule 2.1: Socket Compatibility
```
COOLER_SOCKET_COMPAT == CPU_SOCKET
```
- **Mục đích**: Tản nhiệt phải hỗ trợ socket CPU
- **Đặc biệt**: Multi-socket support
  - COOLER_SOCKET_COMPAT có thể chứa nhiều sockets: "LGA1700/AM5/AM4"
  - Logic sẽ split by "/" và check nếu CPU socket nằm trong list
- **Ví dụ**: Cooler "LGA1700/AM5/AM4" tương thích với CPU "LGA1700"
- **Operator**: EQ (với custom logic)

#### Rule 2.2: TDP Rating
```
CPU_TDP_WATT <= COOLER_TDP_WATT
```
- **Mục đích**: TDP của CPU không nên vượt quá công suất tản nhiệt
- **Ví dụ**: CPU 125W cần cooler ≥125W rating
- **Operator**: LTE (Less Than or Equal)

#### Rule 2.3: Height Clearance
```
COOLER_MAX_HEIGHT_MM <= CASE_CPU_COOLER_CLEARANCE_MM
```
- **Mục đích**: Chiều cao tản nhiệt không được vượt quá không gian trong case
- **Ví dụ**: Cooler 165mm không fit trong case chỉ có 155mm clearance
- **Operator**: LTE

---

### 3. RAM ↔ MAINBOARD (4 rules)

#### Rule 3.1: RAM Type Matching
```
RAM_TYPE == MB_RAM_TYPE
```
- **Mục đích**: Loại RAM phải khớp với mainboard (DDR4 hoặc DDR5)
- **Ví dụ**: DDR4 RAM không tương thích với DDR5 mainboard
- **Operator**: EQ

#### Rule 3.2: Module Count (Sum-based)
```
SUM(RAM_MODULES) <= MB_RAM_SLOTS
```
- **Mục đích**: Tổng số thanh RAM không vượt quá số khe RAM
- **Đặc biệt**: Sum-based check
  - Tính tổng RAM_MODULES của tất cả RAM sticks được chọn
  - So sánh với MB_RAM_SLOTS của mainboard
- **Ví dụ**: 
  - 3 kits RAM (mỗi kit 2 modules) = 6 modules
  - Mainboard chỉ có 4 slots → Không tương thích
- **Operator**: LTE

#### Rule 3.3: Total Capacity (Sum-based)
```
SUM(RAM_CAPACITY_GB) <= MB_MAX_RAM_GB
```
- **Mục đích**: Tổng dung lượng RAM không vượt quá mức mainboard hỗ trợ
- **Đặc biệt**: Sum-based check
- **Ví dụ**:
  - 2 kits RAM 32GB = 64GB total
  - Mainboard max 64GB → OK
- **Operator**: LTE

#### Rule 3.4: RAM Speed
```
RAM_SPEED_MHZ <= MB_MAX_RAM_SPEED_MHZ
```
- **Mục đích**: Tốc độ RAM không nên vượt quá mức mainboard hỗ trợ
- **Lưu ý**: RAM vẫn hoạt động nhưng sẽ chạy ở tốc độ thấp hơn (downclocking)
- **Operator**: LTE

---

### 4. GPU ↔ CASE & PSU (2 rules)

#### Rule 4.1: GPU Length Clearance
```
GPU_LENGTH_MM <= CASE_GPU_CLEARANCE_MM
```
- **Mục đích**: Chiều dài GPU không được vượt quá không gian trong case
- **Ví dụ**: GPU 400mm không fit trong case chỉ có 360mm clearance
- **Operator**: LTE

#### Rule 4.2: GPU Power
```
GPU_TDP_WATT <= PSU_WATTAGE
```
- **Mục đích**: TDP GPU không nên vượt quá công suất PSU
- **Lưu ý**: Cần xét tổng với CPU TDP (rule 5.2)
- **Operator**: LTE

---

### 5. PSU ↔ CASE & POWER (2 rules)

#### Rule 5.1: PSU Form Factor
```
PSU_FORM_FACTOR == CASE_FORM_FACTOR
```
- **Mục đích**: Form factor PSU nên khớp với case
- **Ví dụ**: ATX PSU fits ATX case, SFX PSU cần SFX case hoặc adapter
- **Operator**: EQ

#### Rule 5.2: CPU Power
```
CPU_TDP_WATT <= PSU_WATTAGE
```
- **Mục đích**: TDP CPU phải trong khả năng cấp nguồn của PSU
- **Lưu ý**: Tổng TDP (CPU + GPU + overhead) nên ≤ 80% PSU wattage
- **Operator**: LTE

---

### 6. MAINBOARD ↔ CASE (1 rule)

#### Rule 6.1: Mainboard Form Factor
```
MB_FORM_FACTOR == CASE_FORM_FACTOR
```
- **Mục đích**: Form factor mainboard phải vừa với case
- **Compatibility Matrix**:
  - ATX case: Hỗ trợ ATX, Micro-ATX, Mini-ITX
  - Micro-ATX case: Hỗ trợ Micro-ATX, Mini-ITX
  - Mini-ITX case: Chỉ hỗ trợ Mini-ITX
- **Operator**: EQ
- **Lưu ý**: Logic hiện tại là strict equality, có thể cần custom logic để handle matrix trên

---

## Special Logic Types

### 1. Sum-based Checks

**Áp dụng cho:**
- RAM_MODULES vs MB_RAM_SLOTS
- RAM_CAPACITY_GB vs MB_MAX_RAM_GB

**Logic:**
```typescript
const leftSum = leftProducts.reduce((sum, p) => {
  const attr = p.attributes.find(a => a.attributeTypeId === rule.leftAttributeTypeId);
  const value = attr?.numberValue || Number(attr?.stringValue) || 0;
  return sum + value;
}, 0);

const rightMax = Math.max(...rightProducts.map(p => {
  const attr = p.attributes.find(a => a.attributeTypeId === rule.rightAttributeTypeId);
  return attr?.numberValue || Number(attr?.stringValue) || 0;
}));

const pass = compareValues(leftSum, rightMax, rule.operator);
```

**Khi nào được trigger:**
- Rule có leftAttrType.key là "RAM_MODULES" hoặc "RAM_CAPACITY_GB"
- Rule có rightAttrType.key là "MB_RAM_SLOTS" hoặc "MB_MAX_RAM_GB"
- Operator là "LTE"

### 2. Socket Compatibility (Multi-socket Support)

**Áp dụng cho:**
- COOLER_SOCKET_COMPAT vs CPU_SOCKET

**Logic:**
```typescript
const socketCompatCheck = 
  rule.leftAttrType?.key === "COOLER_SOCKET_COMPAT" && 
  rule.rightAttrType?.key === "CPU_SOCKET";

if (socketCompatCheck && typeof lhs === 'string' && typeof rhs === 'string') {
  // COOLER_SOCKET_COMPAT: "LGA1700/AM5/AM4"
  // CPU_SOCKET: "LGA1700"
  const supportedSockets = lhs.split('/').map(s => s.trim().toUpperCase());
  const cpuSocket = rhs.trim().toUpperCase();
  pass = supportedSockets.includes(cpuSocket);
}
```

**Ví dụ:**
- Cooler: "LGA1700/AM5/AM4" ✅ CPU: "LGA1700"
- Cooler: "LGA1700/AM5/AM4" ✅ CPU: "AM5"
- Cooler: "LGA1700/AM5/AM4" ❌ CPU: "LGA1200"
- Cooler: "LGA1700" ✅ CPU: "LGA1700"

### 3. Pairwise Comparisons (Default)

**Logic:**
```typescript
// For each left product
for (const lp of leftProducts) {
  // For each right product
  for (const rp of rightProducts) {
    // Compare attributes
    const lhs = lp.attributes.find(...).value;
    const rhs = rp.attributes.find(...).value;
    const pass = compareValues(lhs, rhs, rule.operator);
    
    if (!pass) {
      // Add to issues
    }
  }
}
```

---

## Real-world Compatibility Notes

### CPU Socket Standards
- **Intel LGA1700**: 13th-gen (Raptor Lake), 14th-gen (Raptor Lake Refresh)
- **AMD AM5**: Ryzen 7000 series (Zen 4)
- **AMD AM4**: Ryzen 1000-5000 series (Zen, Zen+, Zen 2, Zen 3)

### RAM Compatibility
- **DDR4**: 2133-3600 MHz typical, 1.2V
- **DDR5**: 4800-7200 MHz typical, 1.1V
- Không thể mix DDR4 và DDR5 trên cùng mainboard

### Form Factors
- **ATX**: 305mm × 244mm
- **Micro-ATX**: 244mm × 244mm
- **Mini-ITX**: 170mm × 170mm
- **Case compatibility**: Larger cases can fit smaller boards

### PSU Wattage Guidelines
- **Budget build (iGPU/entry GPU)**: 400-500W
- **Mid-range (RTX 4060/4070)**: 650-750W
- **High-end (RTX 4080/4090)**: 850-1000W
- **Enthusiast (Multi-GPU/OC)**: 1200W+

### TDP vs Power Consumption
- TDP (Thermal Design Power): Giá trị danh định cho tản nhiệt
- Actual power: Có thể cao hơn TDP (đặc biệt khi boost/OC)
- Recommended: Cooler TDP rating ≥ CPU TDP + 20-30% headroom

---

## Testing Guide

### 1. Run Seed Script
```bash
node prisma/seed-compat.cjs
```

### 2. Verify Rules
```bash
node prisma/check-compat-rules.cjs
```

### 3. Test Sample Data
```bash
node prisma/test-compatibility.cjs
```

### 4. Test PC Builder Page
1. Start dev server: `npm run dev`
2. Navigate to `/pc-builder`
3. Select components and verify compatibility feedback

### Test Scenarios

**✅ Compatible Build:**
- Intel Core i5-14400F (LGA1700, 65W TDP)
- MSI MPG Z790 Carbon WiFi (LGA1700, DDR5, 4 slots, 128GB max, ATX)
- Cooler Master ML240L RGB (LGA1700/AM5/AM4, 200W TDP, 52mm)
- Kingston Fury Beast 32GB (2×16GB) DDR5-5200 (2 modules, 32GB total)
- RTX 4070 (300mm, 200W TDP)
- Corsair RM850x (ATX, 850W)
- NZXT H510 (ATX, 381mm GPU clearance, 165mm cooler clearance)

**❌ Socket Mismatch:**
- AMD Ryzen 9 5900X (AM4)
- MSI MPG Z790 Carbon WiFi (LGA1700)
→ Error: "Socket CPU phải khớp với socket Mainboard"

**❌ RAM Type Mismatch:**
- MSI MPG Z790 Carbon WiFi (DDR5)
- Kingston Fury Beast DDR4-3200
→ Error: "Loại RAM phải khớp với mainboard"

**❌ Too Many RAM Modules:**
- 3× Kingston Fury Beast 32GB (2×16GB) = 6 modules
- Mainboard with 4 slots
→ Error: "Tổng số thanh RAM không vượt quá số khe RAM"

**❌ GPU Too Long:**
- RTX 4090 (450mm)
- NZXT H510 (381mm GPU clearance)
→ Error: "Chiều dài GPU không được vượt quá không gian trong case"

**❌ Insufficient PSU:**
- Intel Core i9-14900K (125W TDP)
- RTX 4090 (450W TDP)
- 500W PSU
→ Error: "TDP CPU/GPU vượt quá công suất PSU"

---

## Troubleshooting

### Issue: Rule không hoạt động
1. Kiểm tra AttributeType có tồn tại: `SELECT * FROM AttributeType WHERE key = 'CPU_SOCKET';`
2. Kiểm tra products có attribute: `SELECT * FROM ProductAttribute WHERE attributeTypeId = '...';`
3. Check rule trong database: `SELECT * FROM CompatibilityRule;`
4. Kiểm tra logic trong `compatibility.ts` có handle rule type không

### Issue: Sum-based check sai
- Kiểm tra RAM_MODULES và RAM_CAPACITY_GB có đúng valueType là NUMBER
- Verify products có đầy đủ attributes
- Check logic sum trong `checkCompatibilityRules()`

### Issue: Socket compatibility không hoạt động
- Verify COOLER_SOCKET_COMPAT format: "LGA1700/AM5/AM4" (separated by "/")
- Check logic split và includes trong `checkCompatibilityRules()`
- Verify CPU_SOCKET string match exactly (case-insensitive)

---

## Future Enhancements

### 1. Storage Interface Checks
- NVMe requires M.2 slots: `MB_M2_SLOTS > 0`
- SATA requires SATA ports: `MB_SATA_PORTS > 0`
- Implement custom logic hoặc special operator

### 2. Form Factor Compatibility Matrix
- ATX case supports ATX, Micro-ATX, Mini-ITX boards
- Current logic: strict equality
- Enhancement: Custom logic để handle matrix

### 3. PSU Connector Validation
- GPU power connectors: 16-pin (12VHPWR), 8-pin, 6-pin
- PSU_PCIE_CONNECTORS should match GPU_POWER_CONNECTOR
- Complex logic vì format khác nhau

### 4. Suggestion System
- Khi incompatible, suggest alternative components
- Example: "CPU AM4 → Đề xuất mainboard AM4: X570, B550..."
- Requires additional logic trong `checkCompatibilityRules()`

### 5. Warning vs Error
- Error: Completely incompatible (socket mismatch)
- Warning: Works but not optimal (RAM speed higher than MB support)
- Implement severity levels

---

## Maintenance

### Adding New Rules
1. Xác định leftCategory, rightCategory
2. Xác định leftAttributeType, rightAttributeType
3. Chọn operator phù hợp (EQ, LTE, GTE, etc.)
4. Viết note mô tả rule
5. Add rule vào `seed-compat.cjs`
6. Run seed script
7. Test với sample data

### Updating Attributes
1. Update `ATTRIBUTE_TEMPLATES` trong `attributeTemplates.ts`
2. Tạo migration nếu cần: `npx prisma migrate dev`
3. Update seed scripts: `curated-products.js`, `generate-60-products.js`
4. Regenerate products: `node scripts/generate-60-products.js`
5. Update compatibility rules nếu cần
6. Test PC Builder

---

## Resources

- **Prisma Schema**: `prisma/schema.prisma`
- **Seed Scripts**: `prisma/seed-*.cjs`
- **Compatibility Logic**: `src/lib/compatibility.ts`
- **Attribute Templates**: `src/lib/attributeTemplates.ts`
- **Product Generator**: `scripts/generate-60-products.js`
- **Curated Products**: `scripts/curated-products.js`

---

**Last Updated**: December 2024
**Version**: 2.0 (Updated after attribute structure changes)
