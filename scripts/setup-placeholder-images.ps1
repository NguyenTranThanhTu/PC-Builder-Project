# Script to create symbolic product images using existing placeholders
# This will copy/rename existing placeholder images to match product names

$sourceDir = "public\images\products"
$existingImages = @(
    "product-1-bg-1.png",
    "product-2-bg-1.png", 
    "product-3-bg-1.png",
    "product-4-bg-1.png",
    "product-5-bg-1.png",
    "product-6-bg-1.png",
    "product-7-bg-1.png",
    "product-8-bg-1.png"
)

# Map categories to existing placeholder images
$categoryMapping = @{
    'cpu' = 'product-1-bg-1.png'
    'gpu' = 'product-2-bg-1.png'
    'mainboard' = 'product-3-bg-1.png'
    'ram' = 'product-4-bg-1.png'
    'storage' = 'product-5-bg-1.png'
    'psu' = 'product-6-bg-1.png'
    'case' = 'product-7-bg-1.png'
    'cooler' = 'product-8-bg-1.png'
}

# Product image files needed
$productImages = @{
    'cpu' = @(
        'i9-14900k.jpg', 'i9-14900kf.jpg', 'i7-14700k.jpg', 'i7-14700kf.jpg',
        'i5-14600k.jpg', 'i5-14400f.jpg', 'i9-13900k.jpg', 'i7-13700k.jpg',
        'i5-13600k.jpg', 'i5-13400f.jpg', 'ryzen-9-7950x.jpg', 'ryzen-9-7900x.jpg',
        'ryzen-7-7800x3d.jpg', 'ryzen-7-7700x.jpg', 'ryzen-5-7600x.jpg',
        'ryzen-9-5950x.jpg', 'ryzen-9-5900x.jpg', 'ryzen-7-5800x3d.jpg',
        'ryzen-7-5700x.jpg', 'ryzen-5-5600x.jpg'
    )
    'gpu' = @(
        'asus-rtx-4090-strix.jpg', 'msi-rtx-4080-super.jpg',
        'gigabyte-rtx-4070-ti-super.jpg', 'asus-rtx-4070-super.jpg',
        'msi-rtx-4060-ti.jpg', 'gigabyte-rtx-4060.jpg',
        'sapphire-rx-7900-xtx.jpg', 'xfx-rx-7900-xt.jpg',
        'asus-rx-7800-xt.jpg', 'gigabyte-rx-7700-xt.jpg', 'xfx-rx-7600.jpg'
    )
    'mainboard' = @(
        'asus-z790-hero.jpg', 'msi-z790-carbon.jpg', 'gigabyte-z790-elite.jpg',
        'asrock-z790-pro.jpg', 'msi-b760-tomahawk.jpg', 'asus-b760-tuf.jpg',
        'asus-x670e-hero.jpg', 'gigabyte-x670e-master.jpg',
        'msi-b650-tomahawk.jpg', 'asus-b650-tuf.jpg'
    )
    'ram' = @(
        'corsair-ddr5-6400.jpg', 'gskill-ddr5-6000.jpg',
        'kingston-ddr5-5600.jpg', 'corsair-ddr5-5200.jpg',
        'gskill-ddr4-3600.jpg', 'corsair-ddr4-3200.jpg',
        'kingston-ddr4-3200.jpg', 'crucial-ddr4-3000.jpg'
    )
    'storage' = @(
        'samsung-990-pro-2tb.jpg', 'wd-sn850x-2tb.jpg',
        'samsung-990-pro-1tb.jpg', 'kingston-kc3000-1tb.jpg',
        'crucial-p5-plus-1tb.jpg', 'samsung-980-1tb.jpg',
        'wd-sn570-1tb.jpg', 'kingston-nv2-500gb.jpg'
    )
    'psu' = @(
        'corsair-rm1000x.jpg', 'seasonic-gx-850.jpg',
        'msi-a750gl.jpg', 'coolermaster-mwe-650.jpg',
        'thermaltake-smart-500.jpg'
    )
    'case' = @(
        'lian-li-o11-dynamic.jpg', 'fractal-torrent.jpg',
        'nzxt-h710i.jpg', 'corsair-4000d.jpg',
        'coolermaster-q300l.jpg'
    )
    'cooler' = @(
        'corsair-h150i-elite.jpg', 'nzxt-kraken-x73.jpg',
        'coolermaster-ml240l.jpg', 'noctua-nhd15.jpg',
        'bequiet-drp4.jpg', 'coolermaster-hyper212.jpg',
        'deepcool-ak400.jpg'
    )
}

Write-Host "Setting up product images..." -ForegroundColor Cyan
Write-Host ""

$totalCreated = 0
$totalSkipped = 0

foreach ($category in $productImages.Keys) {
    $sourcePlaceholder = Join-Path $sourceDir $categoryMapping[$category]
    
    if (-not (Test-Path $sourcePlaceholder)) {
        Write-Host "WARNING: Placeholder not found: $sourcePlaceholder" -ForegroundColor Yellow
        continue
    }

    Write-Host "Processing $($category.ToUpper())..." -ForegroundColor Green
    
    foreach ($imageName in $productImages[$category]) {
        $targetPath = Join-Path $sourceDir $imageName
        
        if (Test-Path $targetPath) {
            Write-Host "  SKIP: $imageName (already exists)" -ForegroundColor Gray
            $totalSkipped++
        }
        else {
            Copy-Item -Path $sourcePlaceholder -Destination $targetPath -Force
            Write-Host "  CREATED: $imageName" -ForegroundColor White
            $totalCreated++
        }
    }
}

Write-Host ""
Write-Host "Setup complete!" -ForegroundColor Green
Write-Host "   Created: $totalCreated images" -ForegroundColor Cyan
Write-Host "   Skipped: $totalSkipped images (already exist)" -ForegroundColor Gray
Write-Host ""
Write-Host "NOTE: These are placeholder images. You can replace them with real product images later." -ForegroundColor Yellow
Write-Host "LOCATION: public/images/products/" -ForegroundColor White
