/**
 * CURATED PRODUCT DATABASE
 * Real products from Vietnamese market with accurate specs
 * Source: Gear VN, An Phat PC, Phong Vu (Dec 2025)
 */

const REAL_PRODUCTS = {
  cpu: [
    // Intel 14th Gen (Raptor Lake Refresh)
    { name: 'Intel Core i9-14900K', cores: 24, threads: 32, baseClock: 3.2, boostClock: 6.0, cache: 36, tdp: 125, socket: 'LGA1700', price: 14990000, brand: 'Intel', gen: '14th Gen', image: 'i9-14900k.jpg' },
    { name: 'Intel Core i9-14900KF', cores: 24, threads: 32, baseClock: 3.2, boostClock: 6.0, cache: 36, tdp: 125, socket: 'LGA1700', price: 13990000, brand: 'Intel', gen: '14th Gen', image: 'i9-14900kf.jpg' },
    { name: 'Intel Core i7-14700K', cores: 20, threads: 28, baseClock: 3.4, boostClock: 5.6, cache: 33, tdp: 125, socket: 'LGA1700', price: 11490000, brand: 'Intel', gen: '14th Gen', image: 'i7-14700k.jpg' },
    { name: 'Intel Core i7-14700KF', cores: 20, threads: 28, baseClock: 3.4, boostClock: 5.6, cache: 33, tdp: 125, socket: 'LGA1700', price: 10490000, brand: 'Intel', gen: '14th Gen', image: 'i7-14700kf.jpg' },
    { name: 'Intel Core i5-14600K', cores: 14, threads: 20, baseClock: 3.5, boostClock: 5.3, cache: 24, tdp: 125, socket: 'LGA1700', price: 8490000, brand: 'Intel', gen: '14th Gen', image: 'i5-14600k.jpg' },
    { name: 'Intel Core i5-14400F', cores: 10, threads: 16, baseClock: 2.5, boostClock: 4.7, cache: 20, tdp: 65, socket: 'LGA1700', price: 5290000, brand: 'Intel', gen: '14th Gen', image: 'i5-14400f.jpg' },
    
    // Intel 13th Gen (Raptor Lake)
    { name: 'Intel Core i9-13900K', cores: 24, threads: 32, baseClock: 3.0, boostClock: 5.8, cache: 36, tdp: 125, socket: 'LGA1700', price: 13490000, brand: 'Intel', gen: '13th Gen', image: 'i9-13900k.jpg' },
    { name: 'Intel Core i7-13700K', cores: 16, threads: 24, baseClock: 3.4, boostClock: 5.4, cache: 30, tdp: 125, socket: 'LGA1700', price: 10290000, brand: 'Intel', gen: '13th Gen', image: 'i7-13700k.jpg' },
    { name: 'Intel Core i5-13600K', cores: 14, threads: 20, baseClock: 3.5, boostClock: 5.1, cache: 24, tdp: 125, socket: 'LGA1700', price: 7990000, brand: 'Intel', gen: '13th Gen', image: 'i5-13600k.jpg' },
    { name: 'Intel Core i5-13400F', cores: 10, threads: 16, baseClock: 2.5, boostClock: 4.6, cache: 20, tdp: 65, socket: 'LGA1700', price: 4790000, brand: 'Intel', gen: '13th Gen', image: 'i5-13400f.jpg' },
    
    // AMD Ryzen 7000 Series (Zen 4)
    { name: 'AMD Ryzen 9 7950X', cores: 16, threads: 32, baseClock: 4.5, boostClock: 5.7, cache: 64, tdp: 170, socket: 'AM5', price: 14990000, brand: 'AMD', gen: 'Ryzen 7000', image: 'ryzen-9-7950x.jpg' },
    { name: 'AMD Ryzen 9 7900X', cores: 12, threads: 24, baseClock: 4.7, boostClock: 5.4, cache: 64, tdp: 170, socket: 'AM5', price: 11990000, brand: 'AMD', gen: 'Ryzen 7000', image: 'ryzen-9-7900x.jpg' },
    { name: 'AMD Ryzen 7 7800X3D', cores: 8, threads: 16, baseClock: 4.2, boostClock: 5.0, cache: 96, tdp: 120, socket: 'AM5', price: 12490000, brand: 'AMD', gen: 'Ryzen 7000', image: 'ryzen-7-7800x3d.jpg' },
    { name: 'AMD Ryzen 7 7700X', cores: 8, threads: 16, baseClock: 4.5, boostClock: 5.4, cache: 32, tdp: 105, socket: 'AM5', price: 8990000, brand: 'AMD', gen: 'Ryzen 7000', image: 'ryzen-7-7700x.jpg' },
    { name: 'AMD Ryzen 5 7600X', cores: 6, threads: 12, baseClock: 4.7, boostClock: 5.3, cache: 32, tdp: 105, socket: 'AM5', price: 6990000, brand: 'AMD', gen: 'Ryzen 7000', image: 'ryzen-5-7600x.jpg' },
    
    // AMD Ryzen 5000 Series (Zen 3)
    { name: 'AMD Ryzen 9 5950X', cores: 16, threads: 32, baseClock: 3.4, boostClock: 4.9, cache: 64, tdp: 105, socket: 'AM4', price: 11990000, brand: 'AMD', gen: 'Ryzen 5000', image: 'ryzen-9-5950x.jpg' },
    { name: 'AMD Ryzen 9 5900X', cores: 12, threads: 24, baseClock: 3.7, boostClock: 4.8, cache: 64, tdp: 105, socket: 'AM4', price: 8990000, brand: 'AMD', gen: 'Ryzen 5000', image: 'ryzen-9-5900x.jpg' },
    { name: 'AMD Ryzen 7 5800X3D', cores: 8, threads: 16, baseClock: 3.4, boostClock: 4.5, cache: 96, tdp: 105, socket: 'AM4', price: 8490000, brand: 'AMD', gen: 'Ryzen 5000', image: 'ryzen-7-5800x3d.jpg' },
    { name: 'AMD Ryzen 7 5700X', cores: 8, threads: 16, baseClock: 3.4, boostClock: 4.6, cache: 32, tdp: 65, socket: 'AM4', price: 4990000, brand: 'AMD', gen: 'Ryzen 5000', image: 'ryzen-7-5700x.jpg' },
    { name: 'AMD Ryzen 5 5600X', cores: 6, threads: 12, baseClock: 3.7, boostClock: 4.6, cache: 32, tdp: 65, socket: 'AM4', price: 3790000, brand: 'AMD', gen: 'Ryzen 5000', image: 'ryzen-5-5600x.jpg' },
  ],
  
  gpu: [
    // NVIDIA RTX 40 Series
    { name: 'ASUS ROG Strix RTX 4090 OC 24GB', chip: 'RTX 4090', vram: 24, memoryBus: 384, boostClock: 2640, tdp: 450, length: 357, powerConnector: '16-pin (12VHPWR)', pcieGen: 'PCIe 4.0', interface: 'PCIe 4.0 x16', price: 52990000, brand: 'ASUS', series: 'ROG Strix', image: 'asus-rtx-4090-strix.jpg' },
    { name: 'MSI GeForce RTX 4080 SUPER Gaming X Trio 16GB', chip: 'RTX 4080 SUPER', vram: 16, memoryBus: 256, boostClock: 2625, tdp: 320, length: 337, powerConnector: '16-pin (12VHPWR)', pcieGen: 'PCIe 4.0', interface: 'PCIe 4.0 x16', price: 34990000, brand: 'MSI', series: 'Gaming X Trio', image: 'msi-rtx-4080-super.jpg' },
    { name: 'Gigabyte RTX 4070 Ti SUPER Gaming OC 16GB', chip: 'RTX 4070 Ti SUPER', vram: 16, memoryBus: 256, boostClock: 2670, tdp: 285, length: 340, powerConnector: '16-pin (12VHPWR)', pcieGen: 'PCIe 4.0', interface: 'PCIe 4.0 x16', price: 24990000, brand: 'Gigabyte', series: 'Gaming OC', image: 'gigabyte-rtx-4070-ti-super.jpg' },
    { name: 'ASUS TUF Gaming RTX 4070 SUPER OC 12GB', chip: 'RTX 4070 SUPER', vram: 12, memoryBus: 192, boostClock: 2610, tdp: 220, length: 304, powerConnector: '16-pin (12VHPWR)', pcieGen: 'PCIe 4.0', interface: 'PCIe 4.0 x16', price: 18990000, brand: 'ASUS', series: 'TUF Gaming', image: 'asus-rtx-4070-super.jpg' },
    { name: 'MSI RTX 4060 Ti Gaming X 8GB', chip: 'RTX 4060 Ti', vram: 8, memoryBus: 128, boostClock: 2670, tdp: 160, length: 312, powerConnector: '8-pin (×1)', pcieGen: 'PCIe 4.0', interface: 'PCIe 4.0 x16', price: 12490000, brand: 'MSI', series: 'Gaming X', image: 'msi-rtx-4060-ti.jpg' },
    { name: 'Gigabyte RTX 4060 Eagle OC 8GB', chip: 'RTX 4060', vram: 8, memoryBus: 128, boostClock: 2490, tdp: 115, length: 242, powerConnector: '8-pin (×1)', pcieGen: 'PCIe 4.0', interface: 'PCIe 4.0 x16', price: 8990000, brand: 'Gigabyte', series: 'Eagle', image: 'gigabyte-rtx-4060.jpg' },
    
    // AMD RX 7000 Series
    { name: 'Sapphire RX 7900 XTX Nitro+ 24GB', chip: 'RX 7900 XTX', vram: 24, memoryBus: 384, boostClock: 2680, tdp: 355, length: 310, powerConnector: '8-pin (×3)', pcieGen: 'PCIe 4.0', interface: 'PCIe 4.0 x16', price: 27990000, brand: 'Sapphire', series: 'Nitro+', image: 'sapphire-rx-7900-xtx.jpg' },
    { name: 'XFX RX 7900 XT Speedster MERC 20GB', chip: 'RX 7900 XT', vram: 20, memoryBus: 320, boostClock: 2450, tdp: 315, length: 340, powerConnector: '8-pin (×3)', pcieGen: 'PCIe 4.0', interface: 'PCIe 4.0 x16', price: 22990000, brand: 'XFX', series: 'Speedster MERC', image: 'xfx-rx-7900-xt.jpg' },
    { name: 'Asus TUF Gaming RX 7800 XT OC 16GB', chip: 'RX 7800 XT', vram: 16, memoryBus: 256, boostClock: 2565, tdp: 263, length: 304, powerConnector: '8-pin (×2)', pcieGen: 'PCIe 4.0', interface: 'PCIe 4.0 x16', price: 14990000, brand: 'ASUS', series: 'TUF Gaming', image: 'asus-rx-7800-xt.jpg' },
    { name: 'Gigabyte RX 7700 XT Gaming OC 12GB', chip: 'RX 7700 XT', vram: 12, memoryBus: 192, boostClock: 2599, tdp: 245, length: 296, powerConnector: '8-pin (×2)', pcieGen: 'PCIe 4.0', interface: 'PCIe 4.0 x16', price: 12490000, brand: 'Gigabyte', series: 'Gaming OC', image: 'gigabyte-rx-7700-xt.jpg' },
    { name: 'XFX RX 7600 Speedster SWFT 8GB', chip: 'RX 7600', vram: 8, memoryBus: 128, boostClock: 2655, tdp: 165, length: 230, powerConnector: '8-pin (×1)', pcieGen: 'PCIe 4.0', interface: 'PCIe 4.0 x16', price: 7990000, brand: 'XFX', series: 'Speedster SWFT', image: 'xfx-rx-7600.jpg' },
  ],
  
  mainboard: [
    // Intel Z790 (LGA1700)
    { name: 'ASUS ROG Maximus Z790 Hero', socket: 'LGA1700', chipset: 'Z790', formFactor: 'ATX', ramType: 'DDR5', memorySlots: 4, maxMemory: 192, ramMaxSpeed: 7600, pciex16Slots: 2, m2Slots: 5, sataPorts: 6, wifi: 'WiFi 6E', bluetooth: 'Bluetooth 5.3', price: 17990000, brand: 'ASUS', series: 'ROG Maximus', image: 'asus-z790-hero.jpg' },
    { name: 'MSI MPG Z790 Carbon WiFi', socket: 'LGA1700', chipset: 'Z790', formFactor: 'ATX', ramType: 'DDR5', memorySlots: 4, maxMemory: 128, ramMaxSpeed: 7200, pciex16Slots: 2, m2Slots: 4, sataPorts: 6, wifi: 'WiFi 6E', bluetooth: 'Bluetooth 5.3', price: 14990000, brand: 'MSI', series: 'MPG', image: 'msi-z790-carbon.jpg' },
    { name: 'Gigabyte Z790 AORUS Elite AX', socket: 'LGA1700', chipset: 'Z790', formFactor: 'ATX', ramType: 'DDR5', memorySlots: 4, maxMemory: 128, ramMaxSpeed: 6800, pciex16Slots: 2, m2Slots: 4, sataPorts: 4, wifi: 'WiFi 6E', bluetooth: 'Bluetooth 5.2', price: 8990000, brand: 'Gigabyte', series: 'AORUS', image: 'gigabyte-z790-elite.jpg' },
    { name: 'ASRock Z790 Pro RS', socket: 'LGA1700', chipset: 'Z790', formFactor: 'ATX', ramType: 'DDR5', memorySlots: 4, maxMemory: 128, ramMaxSpeed: 6400, pciex16Slots: 2, m2Slots: 3, sataPorts: 8, wifi: null, bluetooth: null, price: 5990000, brand: 'ASRock', series: 'Pro', image: 'asrock-z790-pro.jpg' },
    
    // Intel B760 (LGA1700)
    { name: 'MSI MAG B760 Tomahawk WiFi', socket: 'LGA1700', chipset: 'B760', formFactor: 'ATX', ramType: 'DDR5', memorySlots: 4, maxMemory: 128, ramMaxSpeed: 6400, pciex16Slots: 2, m2Slots: 3, sataPorts: 4, wifi: 'WiFi 6E', bluetooth: 'Bluetooth 5.3', price: 5990000, brand: 'MSI', series: 'MAG', image: 'msi-b760-tomahawk.jpg' },
    { name: 'ASUS TUF Gaming B760-Plus WiFi', socket: 'LGA1700', chipset: 'B760', formFactor: 'ATX', ramType: 'DDR5', memorySlots: 4, maxMemory: 128, ramMaxSpeed: 6000, pciex16Slots: 2, m2Slots: 3, sataPorts: 4, wifi: 'WiFi 6', bluetooth: 'Bluetooth 5.2', price: 4990000, brand: 'ASUS', series: 'TUF Gaming', image: 'asus-b760-tuf.jpg' },
    
    // AMD X670E (AM5)
    { name: 'ASUS ROG Crosshair X670E Hero', socket: 'AM5', chipset: 'X670E', formFactor: 'ATX', ramType: 'DDR5', memorySlots: 4, maxMemory: 128, ramMaxSpeed: 6400, pciex16Slots: 2, m2Slots: 4, sataPorts: 6, wifi: 'WiFi 6E', bluetooth: 'Bluetooth 5.3', price: 18990000, brand: 'ASUS', series: 'ROG Crosshair', image: 'asus-x670e-hero.jpg' },
    { name: 'Gigabyte X670E AORUS Master', socket: 'AM5', chipset: 'X670E', formFactor: 'ATX', ramType: 'DDR5', memorySlots: 4, maxMemory: 128, ramMaxSpeed: 6400, pciex16Slots: 2, m2Slots: 5, sataPorts: 6, wifi: 'WiFi 6E', bluetooth: 'Bluetooth 5.3', price: 16990000, brand: 'Gigabyte', series: 'AORUS', image: 'gigabyte-x670e-master.jpg' },
    
    // AMD B650 (AM5)
    { name: 'MSI MAG B650 Tomahawk WiFi', socket: 'AM5', chipset: 'B650', formFactor: 'ATX', ramType: 'DDR5', memorySlots: 4, maxMemory: 128, ramMaxSpeed: 6000, pciex16Slots: 1, m2Slots: 3, sataPorts: 4, wifi: 'WiFi 6E', bluetooth: 'Bluetooth 5.3', price: 5490000, brand: 'MSI', series: 'MAG', image: 'msi-b650-tomahawk.jpg' },
    { name: 'ASUS TUF Gaming B650-Plus WiFi', socket: 'AM5', chipset: 'B650', formFactor: 'ATX', ramType: 'DDR5', memorySlots: 4, maxMemory: 128, ramMaxSpeed: 6000, pciex16Slots: 1, m2Slots: 3, sataPorts: 4, wifi: 'WiFi 6', bluetooth: 'Bluetooth 5.2', price: 4790000, brand: 'ASUS', series: 'TUF Gaming', image: 'asus-b650-tuf.jpg' },
  ],
  
  ram: [
    // DDR5
    { name: 'Corsair Dominator Platinum RGB 32GB (2x16GB) DDR5-6400', capacity: 32, modules: 2, kit: '2x16GB', type: 'DDR5', speed: 6400, cas: 32, voltage: 1.4, rgb: true, price: 5990000, brand: 'Corsair', series: 'Dominator Platinum', image: 'corsair-ddr5-6400.jpg' },
    { name: 'G.Skill Trident Z5 RGB 32GB (2x16GB) DDR5-6000', capacity: 32, modules: 2, kit: '2x16GB', type: 'DDR5', speed: 6000, cas: 30, voltage: 1.35, rgb: true, price: 4990000, brand: 'G.Skill', series: 'Trident Z5', image: 'gskill-ddr5-6000.jpg' },
    { name: 'Kingston Fury Beast 32GB (2x16GB) DDR5-5600', capacity: 32, modules: 2, kit: '2x16GB', type: 'DDR5', speed: 5600, cas: 36, voltage: 1.25, rgb: false, price: 3790000, brand: 'Kingston', series: 'Fury Beast', image: 'kingston-ddr5-5600.jpg' },
    { name: 'Corsair Vengeance 32GB (2x16GB) DDR5-5200', capacity: 32, modules: 2, kit: '2x16GB', type: 'DDR5', speed: 5200, cas: 40, voltage: 1.1, rgb: false, price: 3290000, brand: 'Corsair', series: 'Vengeance', image: 'corsair-ddr5-5200.jpg' },
    
    // DDR4
    { name: 'G.Skill Trident Z Royal 32GB (2x16GB) DDR4-3600', capacity: 32, modules: 2, kit: '2x16GB', type: 'DDR4', speed: 3600, cas: 16, voltage: 1.35, rgb: true, price: 3290000, brand: 'G.Skill', series: 'Trident Z Royal', image: 'gskill-ddr4-3600.jpg' },
    { name: 'Corsair Vengeance RGB Pro 32GB (2x16GB) DDR4-3200', capacity: 32, modules: 2, kit: '2x16GB', type: 'DDR4', speed: 3200, cas: 16, voltage: 1.35, rgb: true, price: 2790000, brand: 'Corsair', series: 'Vengeance RGB Pro', image: 'corsair-ddr4-3200.jpg' },
    { name: 'Kingston Fury Beast 16GB (2x8GB) DDR4-3200', capacity: 16, modules: 2, kit: '2x8GB', type: 'DDR4', speed: 3200, cas: 16, voltage: 1.35, rgb: false, price: 1490000, brand: 'Kingston', series: 'Fury Beast', image: 'kingston-ddr4-3200.jpg' },
    { name: 'Crucial Ballistix 16GB (2x8GB) DDR4-3000', capacity: 16, modules: 2, kit: '2x8GB', type: 'DDR4', speed: 3000, cas: 15, voltage: 1.35, rgb: false, price: 1290000, brand: 'Crucial', series: 'Ballistix', image: 'crucial-ddr4-3000.jpg' },
  ],
  
  storage: [
    // NVMe Gen 4
    { name: 'Samsung 990 Pro 2TB NVMe Gen 4', type: 'SSD NVMe', capacity: 2000, interface: 'NVMe PCIe 4.0 x4', formFactor: 'M.2 2280', readSpeed: 7450, writeSpeed: 6900, tbw: 1200, price: 5990000, brand: 'Samsung', series: '990 Pro', image: 'samsung-990-pro-2tb.jpg' },
    { name: 'WD Black SN850X 2TB NVMe Gen 4', type: 'SSD NVMe', capacity: 2000, interface: 'NVMe PCIe 4.0 x4', formFactor: 'M.2 2280', readSpeed: 7300, writeSpeed: 6600, tbw: 1200, price: 5490000, brand: 'Western Digital', series: 'Black SN850X', image: 'wd-sn850x-2tb.jpg' },
    { name: 'Samsung 990 Pro 1TB NVMe Gen 4', type: 'SSD NVMe', capacity: 1000, interface: 'NVMe PCIe 4.0 x4', formFactor: 'M.2 2280', readSpeed: 7450, writeSpeed: 6900, tbw: 600, price: 3290000, brand: 'Samsung', series: '990 Pro', image: 'samsung-990-pro-1tb.jpg' },
    { name: 'Kingston KC3000 1TB NVMe Gen 4', type: 'SSD NVMe', capacity: 1000, interface: 'NVMe PCIe 4.0 x4', formFactor: 'M.2 2280', readSpeed: 7000, writeSpeed: 6000, tbw: 800, price: 2790000, brand: 'Kingston', series: 'KC3000', image: 'kingston-kc3000-1tb.jpg' },
    { name: 'Crucial P5 Plus 1TB NVMe Gen 4', type: 'SSD NVMe', capacity: 1000, interface: 'NVMe PCIe 4.0 x4', formFactor: 'M.2 2280', readSpeed: 6600, writeSpeed: 5000, tbw: 600, price: 2490000, brand: 'Crucial', series: 'P5 Plus', image: 'crucial-p5-plus-1tb.jpg' },
    
    // NVMe Gen 3
    { name: 'Samsung 980 1TB NVMe Gen 3', type: 'SSD NVMe', capacity: 1000, interface: 'NVMe PCIe 3.0 x4', formFactor: 'M.2 2280', readSpeed: 3500, writeSpeed: 3000, tbw: 600, price: 1790000, brand: 'Samsung', series: '980', image: 'samsung-980-1tb.jpg' },
    { name: 'WD Blue SN570 1TB NVMe Gen 3', type: 'SSD NVMe', capacity: 1000, interface: 'NVMe PCIe 3.0 x4', formFactor: 'M.2 2280', readSpeed: 3500, writeSpeed: 3000, tbw: 600, price: 1690000, brand: 'Western Digital', series: 'Blue SN570', image: 'wd-sn570-1tb.jpg' },
    { name: 'Kingston NV2 500GB NVMe Gen 3', type: 'SSD NVMe', capacity: 500, interface: 'NVMe PCIe 3.0 x4', formFactor: 'M.2 2280', readSpeed: 3500, writeSpeed: 2100, tbw: 240, price: 1090000, brand: 'Kingston', series: 'NV2', image: 'kingston-nv2-500gb.jpg' },
  ],
  
  psu: [
    { name: 'Corsair RM1000x 1000W 80+ Gold Full Modular', wattage: 1000, cert: '80+ Gold', modular: 'Full Modular', formFactor: 'ATX', pcieConnectors: '5×8-pin', epsConnectors: '2×8-pin', sataPorts: 12, price: 5490000, brand: 'Corsair', series: 'RM', image: 'corsair-rm1000x.jpg' },
    { name: 'Seasonic Focus GX-850 850W 80+ Gold Full Modular', wattage: 850, cert: '80+ Gold', modular: 'Full Modular', formFactor: 'ATX', pcieConnectors: '4×8-pin', epsConnectors: '2×8-pin', sataPorts: 10, price: 4290000, brand: 'Seasonic', series: 'Focus GX', image: 'seasonic-gx-850.jpg' },
    { name: 'MSI MAG A750GL 750W 80+ Gold Full Modular', wattage: 750, cert: '80+ Gold', modular: 'Full Modular', formFactor: 'ATX', pcieConnectors: '4×8-pin', epsConnectors: '2×8-pin', sataPorts: 8, price: 3290000, brand: 'MSI', series: 'MAG', image: 'msi-a750gl.jpg' },
    { name: 'Cooler Master MWE 650W 80+ Bronze', wattage: 650, cert: '80+ Bronze', modular: 'Non Modular', formFactor: 'ATX', pcieConnectors: '2×8-pin', epsConnectors: '1×8-pin', sataPorts: 6, price: 1690000, brand: 'Cooler Master', series: 'MWE', image: 'coolermaster-mwe-650.jpg' },
    { name: 'Thermaltake Smart 500W 80+ White', wattage: 500, cert: '80+ White', modular: 'Non Modular', formFactor: 'ATX', pcieConnectors: '1×8-pin', epsConnectors: '1×8-pin', sataPorts: 4, price: 1190000, brand: 'Thermaltake', series: 'Smart', image: 'thermaltake-smart-500.jpg' },
  ],
  
  case: [
    { name: 'Lian Li O11 Dynamic EVO Black', formFactor: 'ATX', gpuClearance: 420, cpuCoolerClearance: 167, psuLength: 225, driveBays25: 4, driveBays35: 3, expansionSlots: 8, frontIO: 'USB 3.2 Gen 2 Type-C, 2×USB 3.0', temperedGlass: 'Yes', maxRadiator: '360mm top/side, 280mm bottom', fansIncluded: 'None (fan kit sold separately)', price: 4590000, brand: 'Lian Li', series: 'O11 Dynamic', image: 'lian-li-o11-dynamic.jpg' },
    { name: 'Fractal Design Torrent Black', formFactor: 'ATX', gpuClearance: 461, cpuCoolerClearance: 188, psuLength: 250, driveBays25: 3, driveBays35: 4, expansionSlots: 9, frontIO: 'USB 3.1 Type-C, 2×USB 3.0', temperedGlass: 'Yes', maxRadiator: '420mm front, 360mm top/bottom', fansIncluded: '2×180mm RGB front, 1×140mm rear', price: 4290000, brand: 'Fractal Design', series: 'Torrent', image: 'fractal-torrent.jpg' },
    { name: 'NZXT H710i Black', formFactor: 'ATX', gpuClearance: 413, cpuCoolerClearance: 185, psuLength: 220, driveBays25: 4, driveBays35: 3, expansionSlots: 7, frontIO: 'USB 3.1 Type-C, 2×USB 3.0', temperedGlass: 'Yes', maxRadiator: '360mm front, 280mm top', fansIncluded: '4×120mm Aer F (3 front, 1 rear)', price: 3790000, brand: 'NZXT', series: 'H710', image: 'nzxt-h710i.jpg' },
    { name: 'Corsair 4000D Airflow Black', formFactor: 'ATX', gpuClearance: 360, cpuCoolerClearance: 170, psuLength: 220, driveBays25: 2, driveBays35: 2, expansionSlots: 7, frontIO: 'USB 3.1 Type-C, USB 3.0', temperedGlass: 'Yes', maxRadiator: '360mm front, 280mm top', fansIncluded: '2×120mm front', price: 2490000, brand: 'Corsair', series: '4000D', image: 'corsair-4000d.jpg' },
    { name: 'Cooler Master MasterBox Q300L', formFactor: 'Micro-ATX', gpuClearance: 360, cpuCoolerClearance: 159, psuLength: 180, driveBays25: 2, driveBays35: 2, expansionSlots: 4, frontIO: '2×USB 3.0', temperedGlass: 'No', maxRadiator: '240mm front/top', fansIncluded: '1×120mm rear', price: 1290000, brand: 'Cooler Master', series: 'MasterBox', image: 'coolermaster-q300l.jpg' },
  ],
  
  cooler: [
    // AIO Liquid Coolers
    { name: 'Corsair iCUE H150i Elite LCD 360mm', type: 'AIO Liquid', radiatorSize: 360, maxHeight: 52, fanCount: 3, tdpRating: 250, rgb: true, socket: 'LGA1700/AM5/AM4', price: 6990000, brand: 'Corsair', series: 'iCUE Elite', image: 'corsair-h150i-elite.jpg' },
    { name: 'NZXT Kraken X73 360mm RGB', type: 'AIO Liquid', radiatorSize: 360, maxHeight: 52, fanCount: 3, tdpRating: 250, rgb: true, socket: 'LGA1700/AM5/AM4', price: 5990000, brand: 'NZXT', series: 'Kraken', image: 'nzxt-kraken-x73.jpg' },
    { name: 'Cooler Master MasterLiquid ML240L RGB', type: 'AIO Liquid', radiatorSize: 240, maxHeight: 52, fanCount: 2, tdpRating: 200, rgb: true, socket: 'LGA1700/AM5/AM4', price: 2490000, brand: 'Cooler Master', series: 'MasterLiquid', image: 'coolermaster-ml240l.jpg' },
    
    // Air Coolers
    { name: 'Noctua NH-D15 chromax.black', type: 'Air Tower', radiatorSize: null, maxHeight: 165, fanCount: 2, tdpRating: 220, rgb: false, socket: 'LGA1700/AM5/AM4', price: 3490000, brand: 'Noctua', series: 'NH-D15', image: 'noctua-nhd15.jpg' },
    { name: 'be quiet! Dark Rock Pro 4', type: 'Air Tower', radiatorSize: null, maxHeight: 163, fanCount: 2, tdpRating: 250, rgb: false, socket: 'LGA1700/AM5/AM4', price: 2990000, brand: 'be quiet!', series: 'Dark Rock', image: 'bequiet-drp4.jpg' },
    { name: 'Cooler Master Hyper 212 Black Edition', type: 'Air Tower', radiatorSize: null, maxHeight: 159, fanCount: 1, tdpRating: 150, rgb: false, socket: 'LGA1700/AM5/AM4', price: 890000, brand: 'Cooler Master', series: 'Hyper 212', image: 'coolermaster-hyper212.jpg' },
    { name: 'DeepCool AK400', type: 'Air Tower', radiatorSize: null, maxHeight: 155, fanCount: 1, tdpRating: 220, rgb: false, socket: 'LGA1700/AM5/AM4', price: 790000, brand: 'DeepCool', series: 'AK400', image: 'deepcool-ak400.jpg' },
  ]
};

module.exports = REAL_PRODUCTS;
