# 🖼️ Hướng Dẫn Thêm Hình Ảnh Sản Phẩm

## Phương Pháp 1: Sử Dụng Placeholder Images (Nhanh - Cho Development)

### Bước 1: Tạo Placeholder Images
1. Mở file: `scripts/generate-placeholder-images.html` trong trình duyệt
2. Click nút "Download All ..." cho mỗi loại sản phẩm
3. Hoặc click chuột phải vào từng ảnh → "Save Image As..."
4. Lưu tất cả ảnh vào thư mục: `public/images/products/`

### Bước 2: Kiểm Tra
```bash
# Chạy lệnh này để xem có bao nhiêu ảnh đã có
Get-ChildItem "public/images/products/" | Measure-Object
```

✅ **Ưu điểm**: Nhanh, không cần tải ảnh thật
❌ **Nhược điểm**: Ảnh placeholder không đẹp bằng ảnh thật

---

## Phương Pháp 2: Tải Hình Ảnh Thật (Chất Lượng Cao)

### Các nguồn ảnh miễn phí:
1. **Unsplash** (https://unsplash.com)
   - Tìm: "computer cpu", "graphics card", "gaming pc motherboard"
   
2. **Pexels** (https://www.pexels.com)
   - Tìm: "pc components", "ram memory", "ssd storage"

3. **Từ Website Chính Thức**:
   - ASUS, MSI, Gigabyte, Corsair, etc.
   - Download product images từ trang chi tiết sản phẩm

### Tên file cần tải (67 files):

#### CPU (20 files):
- i9-14900k.jpg, i9-14900kf.jpg
- i7-14700k.jpg, i7-14700kf.jpg
- i5-14600k.jpg, i5-14400f.jpg
- i9-13900k.jpg, i7-13700k.jpg, i5-13600k.jpg, i5-13400f.jpg
- ryzen-9-7950x.jpg, ryzen-9-7900x.jpg
- ryzen-7-7800x3d.jpg, ryzen-7-7700x.jpg, ryzen-5-7600x.jpg
- ryzen-9-5950x.jpg, ryzen-9-5900x.jpg
- ryzen-7-5800x3d.jpg, ryzen-7-5700x.jpg, ryzen-5-5600x.jpg

#### GPU (11 files):
- asus-rtx-4090-strix.jpg, msi-rtx-4080-super.jpg
- gigabyte-rtx-4070-ti-super.jpg, asus-rtx-4070-super.jpg
- msi-rtx-4060-ti.jpg, gigabyte-rtx-4060.jpg
- sapphire-rx-7900-xtx.jpg, xfx-rx-7900-xt.jpg
- asus-rx-7800-xt.jpg, gigabyte-rx-7700-xt.jpg, xfx-rx-7600.jpg

#### Mainboard (10 files):
- asus-z790-hero.jpg, msi-z790-carbon.jpg
- gigabyte-z790-elite.jpg, asrock-z790-pro.jpg
- msi-b760-tomahawk.jpg, asus-b760-tuf.jpg
- asus-x670e-hero.jpg, gigabyte-x670e-master.jpg
- msi-b650-tomahawk.jpg, asus-b650-tuf.jpg

#### RAM (8 files):
- corsair-ddr5-6400.jpg, gskill-ddr5-6000.jpg
- kingston-ddr5-5600.jpg, corsair-ddr5-5200.jpg
- gskill-ddr4-3600.jpg, corsair-ddr4-3200.jpg
- kingston-ddr4-3200.jpg, crucial-ddr4-3000.jpg

#### Storage (8 files):
- samsung-990-pro-2tb.jpg, wd-sn850x-2tb.jpg
- samsung-990-pro-1tb.jpg, kingston-kc3000-1tb.jpg
- crucial-p5-plus-1tb.jpg, samsung-980-1tb.jpg
- wd-sn570-1tb.jpg, kingston-nv2-500gb.jpg

#### PSU (5 files):
- corsair-rm1000x.jpg, seasonic-gx-850.jpg
- msi-a750gl.jpg, coolermaster-mwe-650.jpg
- thermaltake-smart-500.jpg

#### Case (5 files):
- lian-li-o11-dynamic.jpg, fractal-torrent.jpg
- nzxt-h710i.jpg, corsair-4000d.jpg
- coolermaster-q300l.jpg

#### Cooler (7 files):
- corsair-h150i-elite.jpg, nzxt-kraken-x73.jpg
- coolermaster-ml240l.jpg, noctua-nhd15.jpg
- bequiet-drp4.jpg, coolermaster-hyper212.jpg
- deepcool-ak400.jpg

---

## Phương Pháp 3: Sử Dụng Generic Images (Cho Mỗi Category)

Thay vì 67 ảnh riêng, chỉ cần 8 ảnh generic:

1. Tạo hoặc tìm 8 ảnh đại diện:
   - cpu-generic.jpg
   - gpu-generic.jpg
   - mainboard-generic.jpg
   - ram-generic.jpg
   - storage-generic.jpg
   - psu-generic.jpg
   - case-generic.jpg
   - cooler-generic.jpg

2. Update script để dùng generic image cho tất cả sản phẩm cùng loại

---

## Kích Thước Ảnh Khuyến Nghị

- **CPU, Mainboard, Cooler**: 400x400px
- **GPU, Storage, PSU**: 400x300px
- **RAM**: 400x200px
- **Case**: 400x500px

## Kiểm Tra Sau Khi Thêm Ảnh

```bash
# Chạy dev server
npm run dev

# Truy cập: http://localhost:3000
# Kiểm tra trang shop và xem ảnh có hiển thị không
```

## Lưu Ý

- Tất cả ảnh phải ở định dạng: `.jpg`, `.jpeg`, hoặc `.png`
- Đường dẫn ảnh: `public/images/products/[tên-file]`
- URL truy cập: `/images/products/[tên-file]`
- Database đã có sẵn đường dẫn đúng, chỉ cần thêm file ảnh vào

---

## Script Hỗ Trợ

### Tạo placeholder images tự động:
```bash
# Mở file HTML trong browser
start scripts/generate-placeholder-images.html
```

### Kiểm tra images có sẵn:
```powershell
Get-ChildItem "public/images/products/" | Select-Object Name, Length | Format-Table
```
