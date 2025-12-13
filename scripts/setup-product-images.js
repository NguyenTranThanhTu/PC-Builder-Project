/**
 * Setup Product Images
 * This script creates a mapping for product images using placeholder service
 * or you can manually replace with real images later
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const PRODUCTS = require('./curated-products');

// Placeholder image service - using placeholder.co with specific sizes for PC components
const PLACEHOLDER_CONFIGS = {
  cpu: { width: 400, height: 400, bg: '2c3e50', text: 'CPU' },
  gpu: { width: 400, height: 300, bg: '27ae60', text: 'GPU' },
  mainboard: { width: 400, height: 400, bg: '3498db', text: 'Mainboard' },
  ram: { width: 400, height: 200, bg: 'e74c3c', text: 'RAM' },
  storage: { width: 400, height: 300, bg: 'f39c12', text: 'SSD' },
  psu: { width: 400, height: 300, bg: '9b59b6', text: 'PSU' },
  case: { width: 400, height: 500, bg: '34495e', text: 'Case' },
  cooler: { width: 400, height: 400, bg: '16a085', text: 'Cooler' },
};

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'images', 'products');

function generatePlaceholderUrl(category, productName) {
  const config = PLACEHOLDER_CONFIGS[category];
  // Create a simple placeholder URL
  return `https://placehold.co/${config.width}x${config.height}/${config.bg}/ffffff?text=${encodeURIComponent(config.text)}`;
}

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(filepath);
        response.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve();
        });
      } else {
        reject(new Error(`Failed to download: ${response.statusCode}`));
      }
    }).on('error', reject);
  });
}

async function setupImages() {
  console.log('🖼️  Setting up product images...\n');

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const imageMapping = {};

  for (const [category, products] of Object.entries(PRODUCTS)) {
    console.log(`\n📁 Processing ${category.toUpperCase()}...`);
    imageMapping[category] = [];

    for (const product of products) {
      const imageName = product.image;
      const imagePath = path.join(OUTPUT_DIR, imageName);
      
      // Check if image already exists
      if (fs.existsSync(imagePath)) {
        console.log(`  ✓ ${imageName} (exists)`);
        imageMapping[category].push({
          name: product.name,
          image: imageName,
          path: `/images/products/${imageName}`,
        });
        continue;
      }

      try {
        // For now, we'll just create a mapping
        // Users can manually add real images later
        imageMapping[category].push({
          name: product.name,
          image: imageName,
          path: `/images/products/${imageName}`,
          placeholder: generatePlaceholderUrl(category, product.name),
        });
        console.log(`  ○ ${imageName} (needs real image)`);
      } catch (error) {
        console.error(`  ✗ Failed to process ${imageName}:`, error.message);
      }
    }
  }

  // Save image mapping to JSON file
  const mappingPath = path.join(__dirname, 'product-image-mapping.json');
  fs.writeFileSync(mappingPath, JSON.stringify(imageMapping, null, 2));
  
  console.log('\n✅ Image mapping created!');
  console.log(`📄 Mapping saved to: ${mappingPath}`);
  console.log('\n📝 Next steps:');
  console.log('1. Review the product-image-mapping.json file');
  console.log('2. Download real product images and place them in public/images/products/');
  console.log('3. Or use the placeholder URLs for development');
  console.log('\n💡 Tip: You can use the placeholder URLs by updating product records in database');
}

setupImages().catch(console.error);
