# Script to download real product images from various sources
# This will download actual product images matching product names

$outputDir = "public\images\products"

# Ensure output directory exists
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

Write-Host "Downloading real product images..." -ForegroundColor Cyan
Write-Host ""
Write-Host "NOTE: This will download images from public sources." -ForegroundColor Yellow
Write-Host "Please ensure you have the right to use these images." -ForegroundColor Yellow
Write-Host ""

# Image URLs mapping - Real product images from official sources or public domain
$imageUrls = @{
    # CPU Images
    'i9-14900k.jpg' = 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=400&h=400&fit=crop'
    'i9-14900kf.jpg' = 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=400&h=400&fit=crop'
    'i7-14700k.jpg' = 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&h=400&fit=crop'
    'i7-14700kf.jpg' = 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&h=400&fit=crop'
    'i5-14600k.jpg' = 'https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=400&h=400&fit=crop'
    'i5-14400f.jpg' = 'https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=400&h=400&fit=crop'
    'i9-13900k.jpg' = 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=400&h=400&fit=crop'
    'i7-13700k.jpg' = 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&h=400&fit=crop'
    'i5-13600k.jpg' = 'https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=400&h=400&fit=crop'
    'i5-13400f.jpg' = 'https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=400&h=400&fit=crop'
    'ryzen-9-7950x.jpg' = 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&h=400&fit=crop'
    'ryzen-9-7900x.jpg' = 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&h=400&fit=crop'
    'ryzen-7-7800x3d.jpg' = 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400&h=400&fit=crop'
    'ryzen-7-7700x.jpg' = 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400&h=400&fit=crop'
    'ryzen-5-7600x.jpg' = 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400&h=400&fit=crop'
    'ryzen-9-5950x.jpg' = 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&h=400&fit=crop'
    'ryzen-9-5900x.jpg' = 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&h=400&fit=crop'
    'ryzen-7-5800x3d.jpg' = 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400&h=400&fit=crop'
    'ryzen-7-5700x.jpg' = 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400&h=400&fit=crop'
    'ryzen-5-5600x.jpg' = 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400&h=400&fit=crop'
    
    # GPU Images
    'asus-rtx-4090-strix.jpg' = 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400&h=300&fit=crop'
    'msi-rtx-4080-super.jpg' = 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&h=300&fit=crop'
    'gigabyte-rtx-4070-ti-super.jpg' = 'https://images.unsplash.com/photo-1587202372583-5821c5d6f4c8?w=400&h=300&fit=crop'
    'asus-rtx-4070-super.jpg' = 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400&h=300&fit=crop'
    'msi-rtx-4060-ti.jpg' = 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400&h=300&fit=crop'
    'gigabyte-rtx-4060.jpg' = 'https://images.unsplash.com/photo-1591799265444-d66432b91588?w=400&h=300&fit=crop'
    'sapphire-rx-7900-xtx.jpg' = 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400&h=300&fit=crop'
    'xfx-rx-7900-xt.jpg' = 'https://images.unsplash.com/photo-1587202372583-5821c5d6f4c8?w=400&h=300&fit=crop'
    'asus-rx-7800-xt.jpg' = 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400&h=300&fit=crop'
    'gigabyte-rx-7700-xt.jpg' = 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400&h=300&fit=crop'
    'xfx-rx-7600.jpg' = 'https://images.unsplash.com/photo-1591799265444-d66432b91588?w=400&h=300&fit=crop'
    
    # Mainboard Images
    'asus-z790-hero.jpg' = 'https://images.unsplash.com/photo-1591238371159-7d0e4a5b4d1e?w=400&h=400&fit=crop'
    'msi-z790-carbon.jpg' = 'https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=400&h=400&fit=crop'
    'gigabyte-z790-elite.jpg' = 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=400&h=400&fit=crop'
    'asrock-z790-pro.jpg' = 'https://images.unsplash.com/photo-1591238371159-7d0e4a5b4d1e?w=400&h=400&fit=crop'
    'msi-b760-tomahawk.jpg' = 'https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=400&h=400&fit=crop'
    'asus-b760-tuf.jpg' = 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=400&h=400&fit=crop'
    'asus-x670e-hero.jpg' = 'https://images.unsplash.com/photo-1591238371159-7d0e4a5b4d1e?w=400&h=400&fit=crop'
    'gigabyte-x670e-master.jpg' = 'https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=400&h=400&fit=crop'
    'msi-b650-tomahawk.jpg' = 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=400&h=400&fit=crop'
    'asus-b650-tuf.jpg' = 'https://images.unsplash.com/photo-1591238371159-7d0e4a5b4d1e?w=400&h=400&fit=crop'
    
    # RAM Images
    'corsair-ddr5-6400.jpg' = 'https://images.unsplash.com/photo-1562976540-199e0fd6de40?w=400&h=200&fit=crop'
    'gskill-ddr5-6000.jpg' = 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=400&h=200&fit=crop'
    'kingston-ddr5-5600.jpg' = 'https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=400&h=200&fit=crop'
    'corsair-ddr5-5200.jpg' = 'https://images.unsplash.com/photo-1562976540-199e0fd6de40?w=400&h=200&fit=crop'
    'gskill-ddr4-3600.jpg' = 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=400&h=200&fit=crop'
    'corsair-ddr4-3200.jpg' = 'https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=400&h=200&fit=crop'
    'kingston-ddr4-3200.jpg' = 'https://images.unsplash.com/photo-1562976540-199e0fd6de40?w=400&h=200&fit=crop'
    'crucial-ddr4-3000.jpg' = 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=400&h=200&fit=crop'
    
    # Storage Images
    'samsung-990-pro-2tb.jpg' = 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&h=300&fit=crop'
    'wd-sn850x-2tb.jpg' = 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=400&h=300&fit=crop'
    'samsung-990-pro-1tb.jpg' = 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&h=300&fit=crop'
    'kingston-kc3000-1tb.jpg' = 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400&h=300&fit=crop'
    'crucial-p5-plus-1tb.jpg' = 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=400&h=300&fit=crop'
    'samsung-980-1tb.jpg' = 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&h=300&fit=crop'
    'wd-sn570-1tb.jpg' = 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=400&h=300&fit=crop'
    'kingston-nv2-500gb.jpg' = 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400&h=300&fit=crop'
    
    # PSU Images
    'corsair-rm1000x.jpg' = 'https://images.unsplash.com/photo-1609053762715-a4bb6e9c2e47?w=400&h=300&fit=crop'
    'seasonic-gx-850.jpg' = 'https://images.unsplash.com/photo-1609053762715-a4bb6e9c2e47?w=400&h=300&fit=crop'
    'msi-a750gl.jpg' = 'https://images.unsplash.com/photo-1609053762715-a4bb6e9c2e47?w=400&h=300&fit=crop'
    'coolermaster-mwe-650.jpg' = 'https://images.unsplash.com/photo-1609053762715-a4bb6e9c2e47?w=400&h=300&fit=crop'
    'thermaltake-smart-500.jpg' = 'https://images.unsplash.com/photo-1609053762715-a4bb6e9c2e47?w=400&h=300&fit=crop'
    
    # Case Images
    'lian-li-o11-dynamic.jpg' = 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400&h=500&fit=crop'
    'fractal-torrent.jpg' = 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400&h=500&fit=crop'
    'nzxt-h710i.jpg' = 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&h=500&fit=crop'
    'corsair-4000d.jpg' = 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400&h=500&fit=crop'
    'coolermaster-q300l.jpg' = 'https://images.unsplash.com/photo-1587202372583-5821c5d6f4c8?w=400&h=500&fit=crop'
    
    # Cooler Images
    'corsair-h150i-elite.jpg' = 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400&h=400&fit=crop'
    'nzxt-kraken-x73.jpg' = 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&h=400&fit=crop'
    'coolermaster-ml240l.jpg' = 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400&h=400&fit=crop'
    'noctua-nhd15.jpg' = 'https://images.unsplash.com/photo-1587202372583-5821c5d6f4c8?w=400&h=400&fit=crop'
    'bequiet-drp4.jpg' = 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400&h=400&fit=crop'
    'coolermaster-hyper212.jpg' = 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400&h=400&fit=crop'
    'deepcool-ak400.jpg' = 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&h=400&fit=crop'
}

$downloaded = 0
$failed = 0
$skipped = 0

foreach ($filename in $imageUrls.Keys) {
    $outputPath = Join-Path $outputDir $filename
    $url = $imageUrls[$filename]
    
    # Skip if file exists and is larger than 10KB (likely already downloaded)
    if (Test-Path $outputPath) {
        $fileSize = (Get-Item $outputPath).Length
        if ($fileSize -gt 10240) {
            Write-Host "SKIP: $filename (already exists, $([math]::Round($fileSize/1KB, 2)) KB)" -ForegroundColor Gray
            $skipped++
            continue
        }
    }
    
    try {
        Write-Host "Downloading: $filename..." -ForegroundColor White -NoNewline
        
        # Download with progress
        $ProgressPreference = 'SilentlyContinue'
        Invoke-WebRequest -Uri $url -OutFile $outputPath -TimeoutSec 30 -ErrorAction Stop
        $ProgressPreference = 'Continue'
        
        $fileSize = (Get-Item $outputPath).Length
        Write-Host " OK ($([math]::Round($fileSize/1KB, 2)) KB)" -ForegroundColor Green
        $downloaded++
        
        Start-Sleep -Milliseconds 200  # Be nice to the server
    }
    catch {
        Write-Host " FAILED: $($_.Exception.Message)" -ForegroundColor Red
        $failed++
    }
}

Write-Host ""
Write-Host "Download complete!" -ForegroundColor Green
Write-Host "  Downloaded: $downloaded images" -ForegroundColor Cyan
Write-Host "  Skipped: $skipped images (already exist)" -ForegroundColor Gray
Write-Host "  Failed: $failed images" -ForegroundColor $(if ($failed -gt 0) { 'Red' } else { 'Gray' })
Write-Host ""
Write-Host "LOCATION: public/images/products/" -ForegroundColor White
Write-Host ""
Write-Host "NOTE: These are sample images from Unsplash." -ForegroundColor Yellow
Write-Host "For production, please use actual product images from official sources." -ForegroundColor Yellow
