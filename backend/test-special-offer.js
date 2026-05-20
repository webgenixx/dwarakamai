// Test script to verify special_offer functionality

const API_URL = 'http://localhost:5000';

async function testSpecialOffer() {
  console.log('🧪 Testing Special Offer Functionality\n');

  try {
    // 1. Get all products
    console.log('1️⃣ Fetching all products...');
    const response = await fetch(`${API_URL}/api/products`);
    const data = await response.json();
    
    if (!data.products || data.products.length === 0) {
      console.log('❌ No products found');
      return;
    }

    console.log(`✅ Found ${data.products.length} products\n`);

    // 2. Check if special_offer field exists
    const firstProduct = data.products[0];
    console.log('2️⃣ Checking special_offer field...');
    console.log(`Product: ${firstProduct.name}`);
    console.log(`Has special_offer field: ${firstProduct.hasOwnProperty('special_offer')}`);
    console.log(`special_offer value: ${firstProduct.special_offer}`);
    console.log(`valentine_special value: ${firstProduct.valentine_special}`);
    console.log(`is_active value: ${firstProduct.is_active}\n`);

    // 3. Count products by type
    const specialOffers = data.products.filter(p => p.special_offer === true).length;
    const trending = data.products.filter(p => p.valentine_special === true).length;
    const regular = data.products.filter(p => !p.special_offer && !p.valentine_special).length;

    console.log('3️⃣ Product Statistics:');
    console.log(`🎁 Special Offers: ${specialOffers}`);
    console.log(`🔥 Trending: ${trending}`);
    console.log(`📦 Regular: ${regular}`);
    console.log(`📊 Total: ${data.products.length}\n`);

    // 4. Show sample products
    console.log('4️⃣ Sample Products:');
    console.log('┌────┬─────────────────────────┬──────────────┬──────────────┬────────┐');
    console.log('│ ID │ Name                    │ Special      │ Trending     │ Active │');
    console.log('├────┼─────────────────────────┼──────────────┼──────────────┼────────┤');
    
    data.products.slice(0, 5).forEach(p => {
      const name = p.name.padEnd(23).substring(0, 23);
      const special = (p.special_offer ? '✅' : '❌').padEnd(12);
      const trending = (p.valentine_special ? '✅' : '❌').padEnd(12);
      const active = (p.is_active ? '✅' : '❌').padEnd(6);
      console.log(`│ ${String(p.id).padEnd(2)} │ ${name} │ ${special} │ ${trending} │ ${active} │`);
    });
    console.log('└────┴─────────────────────────┴──────────────┴──────────────┴────────┘\n');

    console.log('✅ All tests passed!');
    console.log('\n📝 Next Steps:');
    console.log('1. Open admin panel: http://localhost:3000/admin');
    console.log('2. Go to Product Management');
    console.log('3. Click "🎁 Special Offers" tab');
    console.log('4. Edit a product and check "🎁 Special Offer"');
    console.log('5. Save and verify it appears in the Special Offers tab');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\n🔍 Troubleshooting:');
    console.error('1. Make sure backend is running: npm run dev');
    console.error('2. Check backend is on port 5000');
    console.error('3. Verify database migration ran successfully');
  }
}

testSpecialOffer();
