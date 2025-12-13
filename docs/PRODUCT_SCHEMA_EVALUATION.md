# Đánh giá Schema Sản phẩm - Chuẩn bị Cào Data Thực

## ✅ Tổng quan Schema hiện tại

### 1. Categories (Danh mục) - **ĐẦY ĐỦ**
```
✅ CPU
✅ Mainboard  
✅ GPU (Card đồ họa)
✅ RAM
✅ PSU (Nguồn)
✅ Case
✅ Storage (Lưu trữ)
✅ Cooler (Tản nhiệt CPU)
```

### 2. Product Model - **ĐẦY ĐỦ**
```typescript
{
  id: string
  name: string
  slug: string (unique)
  description: string (nullable)
  priceCents: int // Lưu theo đơn vị cents (x100)
  stock: int
  imageUrl: string
  imageBlurData: string (blur placeholder)
  featured: boolean
  status: ProductStatus (DRAFT | PUBLISHED | OUT_OF_STOCK | DISCONTINUED)
  archivedAt: DateTime
  categoryId: string
  attributes: ProductAttribute[]
}
```

**📊 Đánh giá**: Schema Product đã **ĐẦY ĐỦ** cho việc cào data. Có đủ các trường:
- ✅ Thông tin cơ bản (name, description, price)
- ✅ Quản lý kho (stock, status)
- ✅ SEO-friendly (slug)
- ✅ Hình ảnh với blur effect
- ✅ Phân loại (categoryId)
- ✅ Thuộc tính động (attributes)

---

## 📋 Chi tiết Attributes theo từng Category

### 🔴 **CPU** - ĐẦY ĐỦ (9/9 attributes)

#### Attributes hiện có:
```
✅ CPU_BRAND (STRING) - Hãng: Intel, AMD
✅ CPU_SOCKET (STRING) - Socket: LGA1700, AM5, AM4...
✅ CPU_CORES (NUMBER) - Số nhân: 6, 8, 12, 16...
✅ CPU_THREADS (NUMBER) - Số luồng: 12, 16, 24...
✅ CPU_BASE_CLOCK_GHZ (NUMBER) - Xung cơ bản: 3.5, 4.2...
✅ CPU_BOOST_CLOCK_GHZ (NUMBER) - Xung boost: 4.8, 5.2...
✅ CPU_TDP_WATT (NUMBER) - TDP: 65W, 125W, 170W...
✅ CPU_MAX_MEMORY_SPEED_MHZ (NUMBER) - RAM tối đa: 3200, 5600...
✅ CPU_INTEGRATED_GPU (STRING) - iGPU: UHD 770, Radeon Graphics...
```

#### Attributes bổ sung (OPTIONAL - có thể thêm sau):
```
⚠️ CPU_CACHE_MB (NUMBER) - Cache: 16MB, 32MB, 64MB
⚠️ CPU_ARCHITECTURE (STRING) - Kiến trúc: Zen 4, Raptor Lake
⚠️ CPU_LITHOGRAPHY (STRING) - Tiến trình: 7nm, 10nm
⚠️ CPU_PCIE_LANES (NUMBER) - Số lane PCIe: 20, 28
⚠️ CPU_MEMORY_CHANNELS (NUMBER) - Kênh RAM: 2, 4
```

**Kết luận CPU**: ✅ **SẴN SÀNG** cào data với 9 attributes cơ bản. Có thể cào ngay!

---

### 🟢 **Mainboard** - ĐẦY ĐỦ (12/12 attributes)

#### Attributes hiện có:
```
✅ MB_SOCKET (STRING) - Socket: LGA1700, AM5...
✅ MB_CHIPSET (STRING) - Chipset: Z790, B760, X670E, B650...
✅ MB_FORM_FACTOR (STRING) - Kích cỡ: ATX, mATX, ITX, E-ATX
✅ MB_RAM_TYPE (STRING) - Loại RAM: DDR5, DDR4
✅ MB_RAM_SLOTS (NUMBER) - Số khe RAM: 2, 4
✅ MB_MAX_RAM_GB (NUMBER) - RAM tối đa: 64GB, 128GB, 192GB
✅ MB_MAX_RAM_SPEED_MHZ (NUMBER) - Tốc độ RAM: 5600, 7200, 8000
✅ MB_PCIEX16_SLOTS (NUMBER) - Khe PCIe x16: 1, 2, 3
✅ MB_M2_SLOTS (NUMBER) - Khe M.2: 1, 2, 3, 4, 5
✅ MB_SATA_PORTS (NUMBER) - Cổng SATA: 4, 6, 8
✅ MB_WIFI (STRING) - Wi-Fi: WiFi 6E, WiFi 7, None
✅ MB_BLUETOOTH (STRING) - Bluetooth: 5.2, 5.3, None
```

#### Attributes bổ sung (OPTIONAL):
```
⚠️ MB_AUDIO_CODEC (STRING) - Audio: Realtek ALC4080, ALC897
⚠️ MB_LAN_CHIPSET (STRING) - LAN: Intel I225-V, Realtek 2.5G
⚠️ MB_USB_PORTS (STRING) - USB: 2xUSB 3.2 Gen2, 4xUSB 2.0
⚠️ MB_REAR_IO (STRING) - Cổng I/O sau
⚠️ MB_RGB_HEADERS (NUMBER) - Số header RGB
⚠️ MB_FAN_HEADERS (NUMBER) - Số header quạt
```

**Kết luận Mainboard**: ✅ **SẴN SÀNG** cào data với 12 attributes đầy đủ!

---

### 🟡 **GPU (Card đồ họa)** - ĐẦY ĐỦ (7/7 attributes)

#### Attributes hiện có:
```
✅ GPU_CHIP (STRING) - Chip: RTX 4090, RX 7900 XTX, RTX 4060...
✅ GPU_VRAM_GB (NUMBER) - VRAM: 8GB, 12GB, 16GB, 24GB
✅ GPU_INTERFACE (STRING) - Giao tiếp: PCIe 4.0 x16, PCIe 5.0 x16
✅ GPU_LENGTH_MM (NUMBER) - Chiều dài: 242mm, 304mm, 336mm
✅ GPU_TDP_WATT (NUMBER) - TDP: 120W, 200W, 320W, 450W
✅ GPU_POWER_CONNECTOR (STRING) - Nguồn: 1x8pin, 2x8pin, 12VHPWR
✅ GPU_PCIE_GEN (STRING) - PCIe Gen: 3.0, 4.0, 5.0
```

#### Attributes bổ sung (OPTIONAL):
```
⚠️ GPU_BOOST_CLOCK_MHZ (NUMBER) - Xung boost: 2310, 2520...
⚠️ GPU_MEMORY_BUS (NUMBER) - Bus: 128bit, 192bit, 256bit, 384bit
⚠️ GPU_MEMORY_TYPE (STRING) - Loại VRAM: GDDR6, GDDR6X
⚠️ GPU_DISPLAY_PORTS (STRING) - Cổng xuất: 3xDP, 1xHDMI
⚠️ GPU_COOLING_TYPE (STRING) - Tản: 2 fan, 3 fan, AIO
⚠️ GPU_SLOTS (NUMBER) - Số slot: 2.5, 3, 3.5
```

**Kết luận GPU**: ✅ **SẴN SÀNG** cào data với 7 attributes quan trọng!

---

### 🔵 **RAM** - ĐẦY ĐỦ (5/5 attributes)

#### Attributes hiện có:
```
✅ RAM_TYPE (STRING) - Loại: DDR4, DDR5
✅ RAM_CAPACITY_GB (NUMBER) - Dung lượng: 8GB, 16GB, 32GB, 64GB
✅ RAM_SPEED_MHZ (NUMBER) - Tốc độ: 3200, 3600, 6000, 7200
✅ RAM_MODULES (NUMBER) - Số thanh: 1, 2, 4
✅ RAM_CL (NUMBER) - CAS Latency: 16, 18, 30, 36
```

#### Attributes bổ sung (OPTIONAL):
```
⚠️ RAM_VOLTAGE (NUMBER) - Điện áp: 1.2V, 1.35V
⚠️ RAM_TIMINGS (STRING) - Timing: 16-18-18-38, 30-36-36-96
⚠️ RAM_RGB (STRING) - RGB: Yes, No
⚠️ RAM_HEAT_SPREADER (STRING) - Tản nhiệt: Aluminum, None
```

**Kết luận RAM**: ✅ **SẴN SÀNG** với 5 attributes đủ dùng!

---

### ⚡ **PSU (Nguồn)** - CƠ BẢN (3/6 attributes)

#### Attributes hiện có:
```
✅ PSU_WATTAGE (NUMBER) - Công suất: 550W, 750W, 850W, 1000W
✅ PSU_CERT (STRING) - Chứng nhận: 80+ Bronze, Gold, Platinum, Titanium
✅ PSU_FORM_FACTOR (STRING) - Kích cỡ: ATX, SFX, SFX-L
```

#### Attributes **CẦN BỔ SUNG**:
```
❌ PSU_MODULAR (STRING) - Modular: Full, Semi, Non
❌ PSU_PCIE_CONNECTORS (STRING) - Số đầu PCIe: 2x8pin, 3x8pin, 1x12VHPWR
❌ PSU_SATA_CONNECTORS (NUMBER) - Số đầu SATA
❌ PSU_MOLEX_CONNECTORS (NUMBER) - Số đầu Molex
❌ PSU_EPS_CONNECTORS (STRING) - Đầu CPU: 1x4+4pin, 2x4+4pin
```

**Kết luận PSU**: ⚠️ **CẦN BỔ SUNG** thêm 2-3 attributes quan trọng (Modular, PCIe connectors)

---

### 📦 **Case** - CƠ BẢN (3/8 attributes)

#### Attributes hiện có:
```
✅ CASE_FORM_FACTOR (STRING) - Form: ATX, mATX, ITX, E-ATX
✅ CASE_GPU_CLEARANCE_MM (NUMBER) - Hở GPU: 330mm, 380mm, 420mm
✅ CASE_CPU_COOLER_CLEARANCE_MM (NUMBER) - Hở tản CPU: 155mm, 165mm, 180mm
```

#### Attributes **CẦN BỔ SUNG**:
```
❌ CASE_MAX_PSU_LENGTH_MM (NUMBER) - Chiều dài PSU tối đa
❌ CASE_DRIVE_BAYS_25 (NUMBER) - Khay ổ 2.5": 2, 4, 6
❌ CASE_DRIVE_BAYS_35 (NUMBER) - Khay ổ 3.5": 2, 4, 8
❌ CASE_EXPANSION_SLOTS (NUMBER) - Số slot mở rộng: 7, 8
❌ CASE_FRONT_IO (STRING) - Cổng phía trước: USB-C, USB 3.0, Audio
❌ CASE_FANS_INCLUDED (STRING) - Quạt đi kèm: 3x120mm, 2x140mm
❌ CASE_MAX_RADIATOR (STRING) - Radiator tối đa: 360mm, 420mm
❌ CASE_TEMPERED_GLASS (STRING) - Kính cường lực: Yes, No
```

**Kết luận Case**: ⚠️ **CẦN BỔ SUNG** nhiều attributes quan trọng!

---

### 💾 **Storage** - ĐẦY ĐỦ (4/4 attributes)

#### Attributes hiện có:
```
✅ STORAGE_TYPE (STRING) - Loại: SSD, HDD, NVMe
✅ STORAGE_INTERFACE (STRING) - Giao tiếp: SATA, NVMe PCIe 3.0, PCIe 4.0, PCIe 5.0
✅ STORAGE_CAPACITY_GB (NUMBER) - Dung lượng: 256, 512, 1000, 2000, 4000
✅ STORAGE_FORM_FACTOR (STRING) - Kích cỡ: M.2 2280, 2.5", 3.5"
```

#### Attributes bổ sung (OPTIONAL):
```
⚠️ STORAGE_READ_SPEED_MBPS (NUMBER) - Tốc độ đọc: 3500, 7000, 12400
⚠️ STORAGE_WRITE_SPEED_MBPS (NUMBER) - Tốc độ ghi: 3000, 6500
⚠️ STORAGE_TBW (NUMBER) - Total Bytes Written: 600TBW
⚠️ STORAGE_DRAM_CACHE (STRING) - DRAM Cache: Yes, No
```

**Kết luận Storage**: ✅ **SẴN SÀNG** với 4 attributes cơ bản!

---

### ❄️ **Cooler (Tản nhiệt)** - ĐẦY ĐỦ (4/4 attributes)

#### Attributes hiện có:
```
✅ COOLER_TYPE (STRING) - Loại: Tower, AIO, Low-Profile
✅ COOLER_TDP_WATT (NUMBER) - Công suất tản: 120W, 180W, 250W
✅ COOLER_MAX_HEIGHT_MM (NUMBER) - Chiều cao: 155mm, 165mm (tower)
✅ COOLER_SOCKET_COMPAT (STRING) - Socket: LGA1700/AM5, LGA1200/AM4
```

#### Attributes bổ sung (OPTIONAL):
```
⚠️ COOLER_FAN_SIZE_MM (STRING) - Kích cỡ quạt: 120mm, 140mm
⚠️ COOLER_RGB (STRING) - RGB: ARGB, RGB, None
⚠️ COOLER_RADIATOR_SIZE (STRING) - Kích cỡ radiator (AIO): 240mm, 360mm
⚠️ COOLER_PUMP_SPEED_RPM (NUMBER) - Tốc độ pump (AIO)
```

**Kết luận Cooler**: ✅ **SẴN SÀNG** với 4 attributes cơ bản!

---

## 📊 Tổng kết đánh giá

### ✅ SẴN SÀNG cào data ngay (6/8 categories):
1. ✅ **CPU** - 9 attributes đầy đủ
2. ✅ **Mainboard** - 12 attributes đầy đủ  
3. ✅ **GPU** - 7 attributes đầy đủ
4. ✅ **RAM** - 5 attributes đầy đủ
5. ✅ **Storage** - 4 attributes đầy đủ
6. ✅ **Cooler** - 4 attributes đầy đủ

### ⚠️ CẦN BỔ SUNG attributes trước khi cào (2/8 categories):
7. ⚠️ **PSU** - Thiếu: Modular type, PCIe connectors, EPS connectors
8. ⚠️ **Case** - Thiếu: PSU clearance, drive bays, expansion slots, front I/O

---

## 🎯 Khuyến nghị hành động

### **Ưu tiên 1: Cào data ngay** (Không cần sửa schema)
- CPU, Mainboard, GPU, RAM, Storage, Cooler
- Có thể bắt đầu cào **6/8 categories** này ngay lập tức
- Schema đã đủ các attributes quan trọng

### **Ưu tiên 2: Bổ sung PSU attributes** (Quan trọng)
```sql
-- Cần thêm 3 attributes cho PSU:
PSU_MODULAR (STRING) - "Full Modular", "Semi Modular", "Non Modular"
PSU_PCIE_CONNECTORS (STRING) - "3x 6+2pin", "2x 8pin + 1x 12VHPWR"
PSU_EPS_CONNECTORS (STRING) - "1x 4+4pin", "2x 4+4pin"
```

### **Ưu tiên 3: Bổ sung Case attributes** (Quan trọng)
```sql
-- Cần thêm tối thiểu 4 attributes cho Case:
CASE_MAX_PSU_LENGTH_MM (NUMBER) - 160, 180, 200, 220
CASE_DRIVE_BAYS_25 (NUMBER) - Số khay 2.5"
CASE_DRIVE_BAYS_35 (NUMBER) - Số khay 3.5"  
CASE_EXPANSION_SLOTS (NUMBER) - 7, 8
```

---

## 🔧 Script thêm attributes mới

### File: `prisma/add-psu-case-attributes.cjs`
```javascript
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🔧 Adding PSU attributes...");
  
  // PSU attributes
  await prisma.attributeType.createMany({
    data: [
      { key: "PSU_MODULAR", label: "Modular", valueType: "STRING" },
      { key: "PSU_PCIE_CONNECTORS", label: "Đầu PCIe", valueType: "STRING" },
      { key: "PSU_EPS_CONNECTORS", label: "Đầu CPU (EPS)", valueType: "STRING" },
    ],
    skipDuplicates: true,
  });

  console.log("🔧 Adding Case attributes...");
  
  // Case attributes
  await prisma.attributeType.createMany({
    data: [
      { key: "CASE_MAX_PSU_LENGTH_MM", label: "PSU tối đa (mm)", valueType: "NUMBER" },
      { key: "CASE_DRIVE_BAYS_25", label: "Khay 2.5\"", valueType: "NUMBER" },
      { key: "CASE_DRIVE_BAYS_35", label: "Khay 3.5\"", valueType: "NUMBER" },
      { key: "CASE_EXPANSION_SLOTS", label: "Số slot mở rộng", valueType: "NUMBER" },
      { key: "CASE_FRONT_IO", label: "Cổng phía trước", valueType: "STRING" },
      { key: "CASE_TEMPERED_GLASS", label: "Kính cường lực", valueType: "STRING" },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Attributes added successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

---

## 📝 Checklist chuẩn bị cào data

### Bước 1: Hoàn thiện Schema
- [ ] Chạy script thêm PSU attributes
- [ ] Chạy script thêm Case attributes
- [ ] Cập nhật `attributeTemplates.ts` với attributes mới
- [ ] Test admin panel có hiển thị đúng attributes

### Bước 2: Chuẩn bị nguồn data
- [ ] Xác định nguồn cào: Tiki, Shopee, Lazada, hoặc website chuyên dụng?
- [ ] Kiểm tra robots.txt và terms of service
- [ ] Chuẩn bị rate limiting, proxy (nếu cần)
- [ ] Chuẩn bị danh sách sản phẩm cần cào theo category

### Bước 3: Viết scraper
- [ ] Thiết lập scraper với Puppeteer/Playwright hoặc Cheerio
- [ ] Mapping data từ HTML sang Product model
- [ ] Xử lý hình ảnh (download, optimize, upload)
- [ ] Tạo slug SEO-friendly từ tên sản phẩm
- [ ] Parse attributes từ specs table

### Bước 4: Import data
- [ ] Test với 10 sản phẩm mỗi category
- [ ] Kiểm tra compatibility rules hoạt động
- [ ] Verify giá cả đúng format (cents)
- [ ] Kiểm tra hình ảnh hiển thị đúng
- [ ] Test PC Builder với data mới

### Bước 5: Quality Check
- [ ] Validate tất cả required attributes có data
- [ ] Kiểm tra duplicate products
- [ ] Test search và filter
- [ ] Verify stock management
- [ ] Test user checkout flow

---

## 🎯 Timeline đề xuất

### Tuần 1: Hoàn thiện Schema
- Ngày 1-2: Thêm PSU + Case attributes
- Ngày 3-4: Test admin panel, update templates
- Ngày 5: QA và fix bugs

### Tuần 2-3: Scraping & Import
- Tuần 2: Viết scrapers, test với sample data
- Tuần 3: Full import, quality check

### Tuần 4: Testing & Optimization
- Test end-to-end flow
- Performance optimization
- Production deployment

---

## ✅ KẾT LUẬN

**Schema hiện tại đánh giá: 8.5/10**

✅ **Strengths:**
- Product model đầy đủ và flexible
- Attribute system động, dễ mở rộng
- 6/8 categories đã sẵn sàng cào data
- Compatibility system đã hoàn chỉnh

⚠️ **Cần cải thiện:**
- PSU thiếu 3 attributes quan trọng (modular, connectors)
- Case thiếu nhiều specs chi tiết
- Một số optional attributes có thể cần sau (RGB, cooling specs)

**Đề xuất**: Bổ sung PSU + Case attributes (1-2 ngày), sau đó có thể bắt đầu cào data thực tế ngay!
