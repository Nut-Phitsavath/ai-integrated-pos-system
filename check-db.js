const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkDatabase() {
    try {
        console.log('🔍 Checking database...\n');

        // Check if user exists
        const users = await prisma.user.findMany();
        console.log(`Found ${users.length} user(s):`);
        users.forEach(user => {
            console.log(`  - Username: ${user.username}`);
            console.log(`    ID: ${user.id}`);
            console.log(`    Role: ${user.role}`);
            console.log(`    Password hash: ${user.password.substring(0, 20)}...`);
        });

        if (users.length > 0) {
            // Test password comparison
            const testUser = users[0];
            console.log(`\n🔐 Testing password for "${testUser.username}":`);

            const testPassword = 'password123';
            const isValid = await bcrypt.compare(testPassword, testUser.password);

            console.log(`  Password "${testPassword}" is ${isValid ? '✅ VALID' : '❌ INVALID'}`);
        }

        // Check products count
        const productCount = await prisma.product.count();
        console.log(`\n📦 Found ${productCount} products`);

        // Check orders count
        const orderCount = await prisma.order.count();
        console.log(`📋 Found ${orderCount} orders`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkDatabase();
