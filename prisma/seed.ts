import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Create a default POS officer user
    const hashedPassword = await bcrypt.hash('password123', 10);

    const user = await prisma.user.upsert({
        where: { username: 'officer1' },
        update: {},
        create: {
            username: 'officer1',
            password: hashedPassword,
            role: 'POS_OFFICER',
        },
    });

    console.log('✅ Created user:', user.username);

    // Create sample products
    const products = [
        // Electronics
        { name: 'Laptop', price: 999.99, description: 'High-performance laptop', stockQuantity: 15, category: 'Electronics' },
        { name: 'Wireless Mouse', price: 29.99, description: 'Ergonomic wireless mouse', stockQuantity: 50, category: 'Electronics' },
        { name: 'Mechanical Keyboard', price: 89.99, description: 'RGB mechanical keyboard', stockQuantity: 30, category: 'Electronics' },
        { name: 'USB-C Hub', price: 49.99, description: '7-in-1 USB-C hub', stockQuantity: 25, category: 'Electronics' },
        { name: 'Laptop Bag', price: 39.99, description: 'Protective laptop carrying case', stockQuantity: 20, category: 'Accessories' },
        { name: 'Webcam', price: 79.99, description: '1080p HD webcam', stockQuantity: 18, category: 'Electronics' },
        { name: 'Headphones', price: 149.99, description: 'Noise-cancelling headphones', stockQuantity: 22, category: 'Electronics' },

        // Office Supplies
        { name: 'Notebook', price: 4.99, description: 'Spiral notebook 100 pages', stockQuantity: 100, category: 'Office' },
        { name: 'Pen Set', price: 12.99, description: 'Set of 10 ballpoint pens', stockQuantity: 75, category: 'Office' },
        { name: 'Desk Organizer', price: 24.99, description: 'Wooden desk organizer', stockQuantity: 35, category: 'Office' },
        { name: 'Stapler', price: 8.99, description: 'Heavy-duty stapler', stockQuantity: 40, category: 'Office' },

        // Food & Beverages
        { name: 'Coffee Beans', price: 14.99, description: 'Premium arabica coffee 250g', stockQuantity: 60, category: 'Food' },
        { name: 'Energy Drink', price: 2.99, description: 'Sugar-free energy drink', stockQuantity: 120, category: 'Beverages' },
        { name: 'Protein Bar', price: 3.49, description: 'High-protein snack bar', stockQuantity: 80, category: 'Food' },
        { name: 'Tea Bags', price: 6.99, description: 'Green tea 20 bags', stockQuantity: 45, category: 'Beverages' },

        // Accessories
        { name: 'Phone Stand', price: 15.99, description: 'Adjustable phone stand', stockQuantity: 55, category: 'Accessories' },
        { name: 'Cable Organizer', price: 9.99, description: 'Cable management clips', stockQuantity: 70, category: 'Accessories' },
        { name: 'Monitor Stand', price: 34.99, description: 'Ergonomic monitor riser', stockQuantity: 28, category: 'Accessories' },
        { name: 'Mousepad', price: 12.99, description: 'Extended gaming mousepad', stockQuantity: 65, category: 'Accessories' },
        { name: 'Screen Cleaner', price: 7.99, description: 'Screen cleaning kit', stockQuantity: 50, category: 'Accessories' },
    ];

    for (const product of products) {
        await prisma.product.upsert({
            where: { id: `seed-${product.name.toLowerCase().replace(/\s+/g, '-')}` },
            update: {},
            create: {
                id: `seed-${product.name.toLowerCase().replace(/\s+/g, '-')}`,
                ...product,
            },
        });
    }

    console.log(`✅ Created ${products.length} products`);

    // Create a sample order
    const sampleOrder = await prisma.order.create({
        data: {
            orderNumber: 'ORD-001',
            totalAmount: 1042.97,
            discount: 50.00,
            userId: user.id,
            items: {
                create: [
                    {
                        quantity: 1,
                        price: 999.99,
                        productId: 'seed-laptop',
                    },
                    {
                        quantity: 1,
                        price: 29.99,
                        productId: 'seed-wireless-mouse',
                    },
                    {
                        quantity: 1,
                        price: 12.99,
                        productId: 'seed-pen-set',
                    },
                ],
            },
        },
    });

    console.log('✅ Created sample order:', sampleOrder.orderNumber);

    console.log('🎉 Database seeded successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
