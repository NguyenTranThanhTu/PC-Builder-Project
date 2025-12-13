/**
 * AN PHÁT PC SCRAPER
 * Scrape realistic products from anphatpc.com.vn
 * Includes: Name, Price, Images, Full Specifications
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Category mapping
const CATEGORIES = {
  cpu: {
    url: 'https://www.anphatpc.com.vn/bo-vi-xu-ly-cpu.html',
    name: 'CPU',
    target: 150
  },
  mainboard: {
    url: 'https://www.anphatpc.com.vn/bo-mach-chu.html',
    name: 'Mainboard',
    target: 150
  },
  gpu: {
    url: 'https://www.anphatpc.com.vn/vga-card-man-hinh.html',
    name: 'GPU',
    target: 150
  },
  ram: {
    url: 'https://www.anphatpc.com.vn/bo-nho-trong.html',
    name: 'RAM',
    target: 150
  },
  storage: {
    url: 'https://www.anphatpc.com.vn/o-cung-ssd_dm1030.html',
    name: 'Storage',
    target: 150
  },
  psu: {
    url: 'https://www.anphatpc.com.vn/nguon-may-tinh-psu.html',
    name: 'PSU',
    target: 150
  },
  case: {
    url: 'https://www.anphatpc.com.vn/vo-may-tinh-case.html',
    name: 'Case',
    target: 150
  },
  cooler: {
    url: 'https://www.anphatpc.com.vn/tan-nhiet-khi-pc-cooling_dm1365.html',
    name: 'Cooler',
    target: 150
  }
};

// Scrape single category
async function scrapeCategory(browser, categoryKey, config) {
  console.log(`\n🔵 Scraping ${config.name} from: ${config.url}`);
  
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
  
  const products = [];
  let pageNum = 1;
  
  try {
    while (products.length < config.target) {
      const pageUrl = pageNum === 1 ? config.url : `${config.url}?page=${pageNum}`;
      console.log(`  📄 Page ${pageNum}: ${pageUrl}`);
      
      await page.goto(pageUrl, { waitForTimeout: 3000, timeout: 30000 });
      await page.waitForSelector('.p-item', { timeout: 10000 });
      
      // Extract products from page
      const pageProducts = await page.evaluate(() => {
        const items = document.querySelectorAll('.p-item');
        return Array.from(items).map(item => {
          const nameEl = item.querySelector('.p-name a');
          const priceEl = item.querySelector('.p-price');
          const imgEl = item.querySelector('.p-img img');
          const linkEl = item.querySelector('.p-name a');
          
          return {
            name: nameEl?.textContent?.trim(),
            price: priceEl?.textContent?.trim(),
            imageUrl: imgEl?.src || imgEl?.getAttribute('data-src'),
            productUrl: linkEl?.href
          };
        }).filter(p => p.name && p.price && p.imageUrl);
      });
      
      console.log(`    ✅ Found ${pageProducts.length} products`);
      products.push(...pageProducts);
      
      // Check if we have enough
      if (pageProducts.length === 0) {
        console.log(`    ⚠️  No more products, stopping`);
        break;
      }
      
      if (products.length >= config.target) {
        break;
      }
      
      pageNum++;
      await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limit
    }
    
    // Trim to target
    const finalProducts = products.slice(0, config.target);
    console.log(`  ✅ Total scraped: ${finalProducts.length}/${config.target}`);
    
    return finalProducts;
    
  } catch (error) {
    console.error(`  ❌ Error scraping ${config.name}:`, error.message);
    return products;
  } finally {
    await page.close();
  }
}

// Scrape product details (specs)
async function scrapeProductDetails(browser, productUrl) {
  const page = await browser.newPage();
  
  try {
    await page.goto(productUrl, { waitForTimeout: 3000, timeout: 30000 });
    await page.waitForSelector('.product-info', { timeout: 10000 });
    
    const specs = await page.evaluate(() => {
      const specTable = document.querySelector('.bor-specs table');
      if (!specTable) return {};
      
      const rows = specTable.querySelectorAll('tr');
      const specs = {};
      
      rows.forEach(row => {
        const label = row.querySelector('td:first-child')?.textContent?.trim();
        const value = row.querySelector('td:last-child')?.textContent?.trim();
        if (label && value) {
          specs[label] = value;
        }
      });
      
      return specs;
    });
    
    return specs;
    
  } catch (error) {
    console.error(`    ⚠️  Failed to scrape specs: ${error.message}`);
    return {};
  } finally {
    await page.close();
  }
}

// Main scraper
async function main() {
  console.log('🚀 AN PHÁT PC SCRAPER\n');
  console.log('📊 Target: 150 products × 8 categories = 1200 products\n');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const allData = {};
  
  try {
    for (const [key, config] of Object.entries(CATEGORIES)) {
      const products = await scrapeCategory(browser, key, config);
      allData[key] = products;
      
      // Save progress
      const outputPath = path.join(__dirname, '../../scraped-data', `${key}-anphat.json`);
      fs.writeFileSync(outputPath, JSON.stringify(products, null, 2));
      console.log(`  💾 Saved to: ${outputPath}\n`);
    }
    
    // Summary
    console.log('\n✅ SCRAPING COMPLETE!\n');
    console.log('📊 Summary:');
    for (const [key, products] of Object.entries(allData)) {
      console.log(`   ${key}: ${products.length} products`);
    }
    
    const total = Object.values(allData).reduce((sum, arr) => sum + arr.length, 0);
    console.log(`\n📦 Total: ${total} products scraped`);
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    await browser.close();
  }
}

// Run
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { scrapeCategory, scrapeProductDetails };
